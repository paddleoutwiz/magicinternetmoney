/**
 * /api/bridge/state — serves the runes-bridge agent's live JSON snapshot.
 *
 * The agent writes a JSON state file on every poll cycle (via the daemon's
 * --state-file flag). This route reads that file and returns its contents
 * so the client-side dashboard can render live agent state.
 *
 * Configuration:
 *   BRIDGE_STATE_FILE — absolute or relative path to the state file.
 *                      Defaults to ./runes-bridge-state.json in the cwd of
 *                      the Next.js server (typically the project root).
 *
 * In a single-machine deployment (laptop or single VPS), the daemon writes
 * to a path under the operator's home / project dir and the Next.js server
 * reads from the same path. For multi-machine setups, point both at a
 * shared volume or change this handler to fetch from a public URL the
 * agent uploads to.
 *
 * Returns 503 if the state file doesn't exist or is unreadable so the
 * client falls back to mock data gracefully.
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const revalidate = 0; // never cache
export const dynamic = 'force-dynamic';

/**
 * Resolve the configured state file path. Always returns an absolute path
 * so the API behavior doesn't depend on cwd ambiguity.
 */
function resolveStateFile(): string {
  const configured = process.env.BRIDGE_STATE_FILE;
  if (configured) return path.resolve(configured);
  // Relative default: callers can override via env in any environment.
  // The path is intentionally relative so the same code runs on dev and
  // prod without leaking absolute filesystem paths into the repo.
  return path.resolve(process.cwd(), 'runes-bridge-state.json');
}

export async function GET() {
  const file = resolveStateFile();
  try {
    const raw = await fs.readFile(file, 'utf8');
    const json = JSON.parse(raw);
    return NextResponse.json(json, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'state_file_unavailable',
        message: (err as Error).message,
      },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
