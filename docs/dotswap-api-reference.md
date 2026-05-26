# DotSwap API Reference (for kraken-cli bridge)

> Compiled from `https://docs.on.nexus/` and live probes against `api.dotswap.app` on
> 2026-05-22. Verified live calls are marked **\[verified live]**. Anything not so
> marked is from the docs only.

## Base URLs

| Purpose                          | URL                                                      |
| -------------------------------- | -------------------------------------------------------- |
| Swap mainnet REST API            | `https://api.dotswap.app`                                |
| Swap testnet4 REST API           | `https://api-testnet4.dotswap.app`                       |
| Swap testnet proxy (older docs)  | `https://test-api-proxy.ddpurse.com`                     |
| WebSocket mainnet                | `wss://ws.dotswap.app`                                   |
| WebSocket testnet                | `wss://test-api-proxy.ddpurse.com:28910`                 |
| Frontend                         | `https://swap.on.nexus/`                                 |
| Docs (LLM-friendly)              | `https://docs.on.nexus/` (append `.md` to any page)      |
| Docs query interface             | `GET <page>.md?ask=<question>` returns natural answer    |
| Docs full corpus                 | `https://docs.on.nexus/llms-full.txt`                    |

There are two distinct API surfaces on the same host:

1. **Legacy / V2 routes:** `/brc20swap/*` — most of these are unauthenticated, including
   pool reserve queries (`/brc20swap/swap_info`), tick price, and the public CoinGecko-style
   tickers feed. Liquidity-add/remove endpoints live here. **\[verified live]**
2. **V3 aggregator routes:** `/dotswap/api/*` — quote/create\_psbt/submit\_psbt for the
   aggregated swap path across DotSwap^(N) AMM pools and third-party CLMM pools (e.g.
   DogSwap). Also hosts the CCXT-compatible endpoints. Docs mark `Authorization` /
   `User-Id` headers as required, **but quote and create\_psbt actually accept
   unauthenticated calls in production today \[verified live]**.

A third surface `/api/nexus/manage/*` belongs to **HodlFi** (the Nexus lending product),
not DotSwap. It is documented under `docs.on.nexus/hodifi/...` and is **not** required
for swap or LP operations.

## Auth flow

The DotSwap docs call out two response headers, `Authorization` and `User-Id`, on
authenticated endpoints (the swap-V3 `create_psbt`/`submit_psbt` and the
`/api/nexus/manage/*` set). The challenge/sign/login flow that issues those headers is
only documented under the **HodlFi** docs (the lending product on the same protocol),
and the docs do not present a separate "DotSwap login" route. The same auth tokens are
used for both products because they share the Nexus identity layer.

In practice today (May 2026), **the swap-V3 quote and create\_psbt endpoints accept
calls with no `Authorization` / `User-Id` header** (see [Open questions](#open-questions)
— this may tighten without warning). For an arbitrage bot you should still implement
the login flow so you don't get rugged by a silent enforcement change.

### Flow

1. **`GET /api/nonce`** → `{ data: { nonce: string } }`. Provides anti-replay nonce.
   The full-host for this endpoint is **not** documented; `api.dotswap.app/api/nonce`
   returns 404. The Public Configuration doc places it under the Nexus protocol API
   base, which is what the maker/taker node uses. For DotSwap browser sessions, the
   site fetches the nonce from `https://swap.on.nexus/api/nonce` proxied to the
   relevant backend. **\[Open question — exact public host for `/api/nonce` and
   `/api/nexus/manage/login` for non-node clients.]**

2. **`POST /api/nexus/manage/signature/challenge`**

   ```json
   { "message": "", "params": {} }
   ```

   Response:

   ```json
   { "code": 0, "msg": "", "data": { "message": "<text to be signed>" }, "req_id": "..." }
   ```

   The returned `data.message` is the human-readable string the wallet must sign. From
   the doc-search agent the canonical format is:

   ```
   Address: <btc_address>

   Login to Nexus

   Time: 2026-05-22 12:34:56

   Timestamp: 1747917296
   ```

   (Newlines as shown. Format reconstructed from `/manage-pool.md` example; treat as
   indicative — the server returns the literal string to sign in `data.message`, so
   **always sign exactly what the server returns**, not a locally-constructed copy.)

3. **Sign `data.message` with the BTC wallet.** The signed format is the standard
   Bitcoin signed-message format (`bitcoinjs-message` / BIP-322 compatible). Wallets
   exposed in `wallet-access-specification` (OKX, UniSat, Xverse, etc.) all call
   `okx.signMessage(msg)` / `unisat.signMessage(msg)`. The signature is returned
   base64.

   **Address-type support:** the docs explicitly cover Taproot (`bc1p…`) and native
   segwit (`bc1q…`) wallets. Runes are typically held on the Taproot address; the
   wallet examples show separate `btcAddress` and `ordAddress` fields where the
   wallet keeps two addresses (xverse pattern). UniSat / OKX taproot wallets use a
   single address for both. For Taproot signing, you should use BIP-322-simple
   message signing; `signMessage` on most wallets handles this automatically.

4. **`POST /api/nexus/manage/login`** with:

   ```json
   {
     "signature": {
       "address": "bc1p...",
       "public_key": "0334...85",
       "sign_info": "<exact text returned by /signature/challenge>",
       "signature": "H9P...vo=",
       "nonce": "<nonce from /api/nonce>"
     }
   }
   ```

   Response is `{ code, msg, data: null, req_id }`. The `Authorization` and `User-Id`
   tokens are returned **as HTTP response headers** (the docs example for Get All
   Tickers explicitly shows `Authorization;` and `User-Id;` headers, but the response
   body for login is `data: null` — confirming the tokens come back in headers). Cache
   these and put them on every subsequent authenticated request as request headers.

### Notes

- `public_key` is hex-encoded compressed pubkey.
- For wallets with separate BTC and ord addresses (xverse), `public_key` is
  `btc_pubkey:ord_pubkey` (colon-separated). Confirmed by the `pubkey` format error
  returned from `/dotswap/api/swap/create_psbt` **\[verified live]**.
- Set custom header `Wallet-Type: ledger` to extend signing window if using a hardware
  wallet (mentioned in swap V2 docs; likely applies to V3 too).
- Token TTL is not documented. Re-login on 401 / `code != 0` with auth-related message.

## Token discovery

### DOG rune (Bitcoin Rune; Kraken: DOGUSD) **\[verified live]**

| Field            | Value                            |
| ---------------- | -------------------------------- |
| `tick`           | `DOG•GO•TO•THE•MOON`             |
| `token_id`       | `840000:3` (Rune `<block>:<tx>`) |
| `coin_type`      | `runes`                          |
| `precision`      | `1e-05` (5 decimals; divisibility 5) |
| Primary BTC pool | `pool_id`: `DOG•GO•TO•THE•MOON/BTC` |
| Pool route(s)    | DotSwap^(N) AMM (native) + third-party DogSwap CLMM (`pool_id: 1234799261355343872`) — V3 aggregator routes across both |

Live BTC/DOG pool snapshot (mainnet, 2026-05-22): tick1\_volume (DOG) ≈ 70.7M,
tick2\_volume (BTC) ≈ 75.4M sats, `tick1_per_tick2 ≈ 9.38e-9 BTC/DOG`. Liquidity in USD
≈ $210k. Fees: `platform_service_fee_percent: 0.004` (0.4%), `liquider_service_fee_percent: 0.016` (1.6%). Effective swap fee one-way is 2.0% before slippage.

### MIM rune — `MAGIC•INTERNET•MONEY` (Bitcoin Rune; Kraken: MIMUSD) **\[verified live]**

| Field            | Value                            |
| ---------------- | -------------------------------- |
| `tick`           | `MAGIC•INTERNET•MONEY`           |
| `token_id`       | `840000:45`                      |
| `coin_type`      | `runes`                          |
| `precision`      | `1` (0 decimals; divisibility 0) |
| Primary BTC pool | `pool_id`: `MAGIC•INTERNET•MONEY/BTC` |
| Pool route(s)    | DotSwap^(N) AMM (native, `pool_type: amm`) |

Live BTC/MIM pool snapshot (mainnet, 2026-05-22): tick1\_volume (MIM) ≈ 84.5M,
tick2\_volume (BTC) ≈ 254.5M sats, `tick1_per_tick2 ≈ 3.32e-9 BTC/MIM`. Liquidity in
USD ≈ $133k. Same fee schedule as DOG.

### Bullet (`•`) is U+2022.

The spaced-rune format uses `\u2022`. When URL-encoding, that's `%E2%80%A2`. The
WebSocket and ticker endpoints all accept the raw UTF-8 bullet directly.

## Public market data endpoints

All of these work **without auth \[verified live]** on `https://api.dotswap.app`.

### `GET /brc20swap/external/tickers` — CoinGecko/CMC-style tickers

Response is a JSON **array** (no envelope). Fields:

```json
{
  "ticker_id": "DOG•GO•TO•THE•MOON/BTC",
  "base_currency": "DOG•GO•TO•THE•MOON",
  "target_currency": "BTC",   // note: docs say "quote_currency" but live API returns "target_currency"
  "pool_id": "DOG•GO•TO•THE•MOON/BTC",
  "last_price": "0.0000000092235786",
  "base_volume": "19940870.02476",
  "target_volume": "0.1884889779011",
  "liquidity_in_usd": "210297.870932057546892789"
}
```

> **Doc bug:** the doc example shows `quote_currency` / `quote_volume` but the live
> response uses `target_currency` / `target_volume`. Code against the live shape.

316 tickers live on mainnet right now. Includes Runes, BRC-20, ARC-20, Fractal, CAT-20
(distinguished by `:tokenid` suffix on CAT-20).

### `POST /brc20swap/swap_info` — pool reserves + price (rate-limited)

```json
{
  "send_tick": "BTC",
  "receive_tick": "DOG•GO•TO•THE•MOON",
  "send_coin_type": "btc",
  "receive_coin_type": "runes",
  "address": "0",
  "amount": "100000"
}
```

Response (live):

```json
{
  "code": 0,
  "data": {
    "tick1_volume": "70726826.137499175523950375",       // RECEIVE tick reserve
    "tick2_volume": "75368848.0205101496210107",         // SEND tick reserve (in send units)
    "tick1_per_tick2": "0.0000000093840928",
    "tick2_per_tick1": "106563311.4569378105372283",
    "platform_service_fee_percent": "0.004",
    "liquider_service_fee_percent": "0.016",
    "platform_service_fee_sell_percent": "0.004",
    "liquider_service_sell_percent": "0.016",
    "token": "113eb1ded9400000:0",                        // one-time swap token for V2 PSBT
    "non_removable": false
  }
}
```

**Rate limit: 1 request per 5 seconds per IP.** Exceeding returns HTTP 429. Stop
backing off on 429. **\[doc-verified]**

For local AMM math: this returns the gross reserves. With both fees the effective swap
formula on the DotSwap^(N) AMM pool is:

```
fee_total = platform_service_fee_percent + liquider_service_fee_percent  // = 0.020 = 2.0%
dx_eff   = dx * (1 - fee_total)
dy       = y * dx_eff / (x + dx_eff)
```

where `x = tick2_volume` (send side reserve), `y = tick1_volume` (receive side reserve).
Note this only accounts for the native AMM pool — the V3 aggregator may route partially
or wholly through a third-party CLMM (e.g. DogSwap) with different fee dynamics. For
size-aware quoting, use `/dotswap/api/swap/quote` (not rate-limited as aggressively).

### `POST /brc20swap/stat/tick_price` — token price in BTC and USD

```json
{ "tick": "DOG•GO•TO•THE•MOON", "coin_type": "runes" }
→ { "data": { "btc_price": "0.0000000093840928", "usd_price": "0.00070903718412208" } }
```

### `GET /dotswap/api/fetch_currencies` — CCXT-style currency map

Returns `{ data: { "<tick>": { id, code, precision, name, fee, active, deposit,
withdraw, ... } } }`. **111 currencies** live, indexed by their `tick` string. Use
this as the canonical source for `(tick, token_id, precision/divisibility, coin_type-ish via id format)`.

### `GET /dotswap/api/fetch_markets` — CCXT-style market list

Returns `{ data: [ { id, symbol, base, quote, active, type: "swap", precision: { amount, price }, margin_modes, limits } ] }`. **165 markets** live. `id` and `symbol`
are the pool identifiers (e.g. `DOG•GO•TO•THE•MOON/BTC`).

### `GET /dotswap/api/fetch_ticker?symbol=<symbol>` — 24h OHLC for one symbol

```
GET /dotswap/api/fetch_ticker?symbol=DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON/BTC
→ { data: { symbol, timestamp, datetime, high, low, open, close, change, average } }
```

### `GET /dotswap/api/public/tickers` — exchange-style /tickers (legacy CCXT-y)

Same shape as `/brc20swap/external/tickers` (uses `target_currency` in the doc here).
Confirmed by the doc but redundant with the external/tickers endpoint above.

### `POST /api/pool/liquid/liquid_info` — per-pair pool detail (with token_id)

```json
{
  "tick1": { "coin_type": "btc",  "tick": "BTC", "token_id": "" },
  "tick2": { "coin_type": "runes","tick": "DOG•GO•TO•THE•MOON", "token_id": "840000:3" }
}
→ { tick1_amount, tick2_amount, liquid_fee_buy_percent, liquid_fee_sell_percent,
    platform_fee_buy_percent, platform_fee_sell_percent, tick1_per_tick2, tick2_per_tick1 }
```

Lives on the Nexus protocol surface; auth likely required when running against a
Nexus node, but per the doc structure this is an `/api/pool/*` endpoint. Use this when
you specifically want the native DotSwap^(N) AMM reserves (excluding aggregated
third-party CLMM liquidity).

### Other useful data endpoints (POST, body shape in docs)

| Endpoint                                  | Purpose                                      |
| ----------------------------------------- | -------------------------------------------- |
| `POST /brc20swap/search_ticks`            | Paginated token search; `usetype`: `swap` / `gettick2` / `liquid` |
| `POST /brc20swap/manage_liquid_info`      | Per-address LP positions, points, share %    |
| `POST /brc20swap/liquid_history`          | Add/remove/create history; `txid` for mempool lookup |
| `POST /brc20swap/stat/trade_info_list`    | TVL list across pools; `_btc` suffix = BTC unit, else USD |
| `POST /brc20swap/external/pool/apr`       | Pool APR snapshots                           |
| `POST /brc20swap/get_liquid_address`      | LP address for a given pair                  |

## WebSocket streams **\[doc-verified]**

```
wss://ws.dotswap.app/ws/<SYMBOL>@trade
wss://ws.dotswap.app/stream?streams=<SYMBOL>@trade,<SYMBOL2>@trade
```

Trade payload:

```json
{ "e": "trade", "E": 1763975983770, "s": "DOG•GO•TO•THE•MOON/BTC",
  "p": "0.0000000092235786", "q": "1000", "T": 1763975975000 }
```

- Connection lifetime 24h max — handle reconnects.
- All times in ms.
- `@trade` is the only documented stream so far. No documented orderbook / kline /
  ticker streams yet (see [Open questions](#open-questions)).

## CCXT compatibility

DotSwap publishes three CCXT-shaped endpoints:

| CCXT method        | DotSwap endpoint                              |
| ------------------ | --------------------------------------------- |
| `fetchCurrencies`  | `GET /dotswap/api/fetch_currencies`           |
| `fetchMarkets`     | `GET /dotswap/api/fetch_markets`              |
| `fetchTicker`      | `GET /dotswap/api/fetch_ticker?symbol=...`    |

These map cleanly to ccxt's expected shapes (each returns `data` envelope; you'd unwrap
in a custom ccxt exchange class). The docs page is titled "CCXT Compatibility" but
**only fetchCurrencies / fetchMarkets / fetchTicker are exposed in the public docs**.
There is no documented `fetchTickers`, `fetchOrderBook`, `fetchOHLCV`, `createOrder`,
etc. So **DotSwap is *not* a drop-in ccxt exchange** — it's a partial market-data
adapter. For our bridge:

- Use `fetch_markets` and `fetch_currencies` at boot to build the token registry and
  precision/divisibility map.
- Use `fetch_ticker` for last-trade snapshots if we don't want to maintain a WS
  connection.
- For order execution, fall back to the native swap-V3 quote/create_psbt/submit_psbt
  flow (described below).

## Swap V3 flow (quote → create_psbt → submit_psbt)

> All three endpoints documented as requiring `Authorization`, `User-Id`, `User-Agent`,
> `Content-Type` headers. **In practice `quote` and `create_psbt` accept unauthenticated
> requests today \[verified live]; `submit_psbt` not tested unauthenticated**. Plan
> for auth; verify on boot.

### 1. `POST /dotswap/api/swap/quote`

Request:

```json
{
  "from_token": { "coin_type": "btc",   "tick": "BTC", "token_id": "", "amount": "10000" },
  "to_token":   { "coin_type": "runes", "tick": "DOG•GO•TO•THE•MOON", "token_id": "840000:3", "amount": "0" },
  "fee_rate": 5
}
```

- `from_token.amount` is in **smallest unit of the from_token** — for BTC that's sats;
  for a Rune that's `actual_amount * 10^divisibility`. DOG has divisibility 5, so 1 DOG
  = `100000`. MIM divisibility is 0, so 1 MIM = `"1"`.
- `to_token.amount = "0"` when quoting "give me as much as possible for X of from".
- `fee_rate` is mempool sats/vB (integer ≥ 1). Used by the aggregator to filter pools
  that wouldn't have viable UTXOs at that fee.
- Pass exactly one of `from_token.amount` or `to_token.amount` as non-zero.

Response (live, abridged):

```json
{
  "code": 0,
  "data": {
    "quote_id": "qt_2057973180725182464",
    "from_amount": "10000",
    "to_amount": "10442.9493",
    "swap_method": "third_party_pool",
    "pool_infos": [
      {
        "name": "DotSwap^(N)",
        "pool_id": 0,
        "pool_type": "amm",
        "from_tick_address": "bc1pcq...",
        "to_tick_address":   "bc1pud...",
        "from_balance": "70725515.137499175523950375",
        "to_balance":   "75370245.2084015496210107",
        "from_to_fee_ratio": "0.02",
        "service_fee": 0.02,
        "deltaAmount": "3600"
      },
      {
        "name": "DogSwap",
        "third_party_id": 26,
        "pool_id": 1234799261355343872,
        "pool_url": "http://18.208.62.248:17610",
        "pool_type": "clmm",
        "sqrt_price": "0.96871...",
        "liquidity": [ { "active_liquidity": "199414766.94...", "start_tick": -6950, "end_tick": 10990 } ],
        "deltaAmount": "6400"
      }
    ],
    "coin_reward_amount": "0.2598",
    "MakerChannelFundEnough": true
  }
}
```

- **`quote_id` is valid for 35 seconds.** Past that, `create_psbt` returns
  `"quote timeout"` \[verified live].
- `pool_infos` is the **route**: the aggregator may split the trade across multiple
  pools (AMM + CLMM). `deltaAmount` per pool tells you the per-pool fill in
  from-token's smallest unit.
- For pure single-pool quoting (LP rebalancing math, etc.) use the V2 `swap_info`
  endpoint instead.

### 2. `POST /dotswap/api/swap/create_psbt`

Request:

```json
{
  "quote_id": "qt_...",
  "fee_rate": 5,
  "btc_address": "bc1p...",
  "ord_address": "bc1p...",
  "pubkey": "<btc_pubkey>:<ord_pubkey>",
  "slippage": 12,
  "use_bitcoin_channel": false,
  "inscription": []
}
```

- `pubkey` is hex compressed pubkey. **For single-address wallets (UniSat/OKX
  taproot), pass the same pubkey twice colon-separated** — error `"pubkey must be in
  the format of {btc_address's pubkey}:{ord_address's pubkey}"` confirmed live.
- Same for `btc_address` / `ord_address`: pass twice if single-address.
- **`slippage` is an integer 0–100**, interpreted as **percent** (so 12 = 12% in the
  V2 examples, 1 = 1%). The error `"slippage must be between 0 and 100"` confirmed
  live. **For arb purposes you want low single digits (1–3).** See [Gotchas](#known-gotchas)
  re unit ambiguity.
- `use_bitcoin_channel: false` — for one-shot L1 PSBT swaps. Set `true` only if you
  have a pre-committed Fast Execution Account balance you want to draw down from
  (see [Gotchas](#known-gotchas)).
- `inscription: []` — required to be empty for Runes. Required to be populated with
  BRC-20 transfer-inscription IDs for BRC-20 swaps.

Response:

```json
{
  "code": 0,
  "data": {
    "request_id": "<used in submit_psbt>",
    "psbts": [ "<hex or base64 PSBT to sign>" ]
  }
}
```

- **`psbts` is an array.** Length depends on the route: cross-pool splits return >1.
  If `length > 0`, use the wallet's `signPsbts` (batch). If `length == 1`, either
  `signPsbt` or `signPsbts` works.
- **Format of returned PSBTs**: not explicitly stated by the doc. Empirically the
  swap-V2 examples show **hex** PSBT strings. The Bitcoin-channel deposit endpoint
  explicitly says "Base64 psbt". For the V3 `create_psbt` output, **detect format at
  parse time** (`PSBT.fromHex` vs `PSBT.fromBase64`) and propagate to the matching
  `psbt_is_base64` flag in submit. Practical default: assume **hex**, set
  `psbt_is_base64: false` in submit.

### 3. `POST /dotswap/api/swap/submit_psbt`

```json
{
  "request_id": "<from create_psbt>",
  "psbts": [ "<signed PSBT 0>", "..." ],
  "psbt_is_base64": false
}
```

Response:

```json
{ "code": 0, "data": { "order_id": "swap_...", "tx_id": "<broadcast btc txid>" } }
```

`tx_id` is the on-chain Bitcoin txid; track via `mempool.space` to confirm.

## PSBT signing requirements

- **All Runes/BRC20 swap PSBTs are taproot/segwit hybrid.** The wallet must support
  taproot (`bc1p`) signing for the user-side input that holds the rune UTXO, plus
  segwit/taproot for the BTC funding input. UniSat, OKX, Xverse, Leather all qualify.
- **Sighash type:** the docs do not call out a specific sighash. The example signed
  PSBTs in swap V2 docs show standard `SIGHASH_ALL` (`01`) for the user's BTC input
  in a `02… ffffffff` non-finalized tx. For taproot script-path signatures you'd use
  `SIGHASH_DEFAULT` (`00`). Implementation: pass the wallet whatever inputs it tells
  you to sign and let the wallet pick — do **not** override the sighash.
- **Which inputs to sign:** the `create_psbt` response in V2 includes a `ToSignInputs`
  array (`[{ index, type: "ord"|"btc" }]`). V3 `create_psbt` does **not** explicitly
  document a `ToSignInputs` array, but the wallet's `signPsbt(psbt, { autoFinalized: false })` call will sign all inputs that belong to the connected wallet address.
  Cross-pool routes may include pre-signed maker inputs that the wallet should leave
  alone — relying on `autoFinalized: false` is correct.
- **Taproot tweak:** the wallet specification mentions `disableTweakSigner: boolean`
  in the `toSignInputs` option. For taproot keypath signatures on a `bc1p` rune-holding
  address, the default (tweak enabled) is correct. Set `disableTweakSigner: true`
  only when the input is committed under a script-path (not used in current DotSwap
  swap flows).
- **`autoFinalized` must be set to `false`** — the server-side will finalize after
  combining all signatures and broadcasting via `submit_psbt`.
- **PSBT format from create_psbt**: see above — assume hex unless detection says
  otherwise.

### Fee rate selection

There is no documented DotSwap "recommended fee rate" endpoint
(`/dotswap/api/fee_rate` and `/api/fee_rate` both 404 \[verified live]). **Use
[mempool.space](https://mempool.space/api/v1/fees/recommended)** for fee-rate input
to `quote` and `create_psbt`:

```
GET https://mempool.space/api/v1/fees/recommended
→ { fastestFee, halfHourFee, hourFee, economyFee, minimumFee }
```

For arb the obvious play is `fastestFee` or `fastestFee + 1` so the swap confirms
before the edge moves. Both `quote.fee_rate` and `create_psbt.fee_rate` should match —
the aggregator filters pools at quote time using `fee_rate`, then the PSBT is built
with the same number.

### Slippage units

`slippage` is an integer in the range **0..100**, error message confirmed live. The
V2 examples use values like `12` (in a context where 12% is plausibly tolerated on a
small-cap rune). For arb on DOG/BTC and MIM/BTC (deep pools, low impact at small
size), use `1` or `2` (1–2%). **Do not use 50.** If the doc later turns out to mean
bps×100 (i.e. 1=0.01%), our small values are still safe; if it means percent (most
likely), our small values are appropriate.

## Liquidity management endpoints **\[doc-verified, mainnet hosts]**

For autonomous LP rebalancing (v2 of the agent).

### Add liquidity (Runes)

| Step | Endpoint                                | Purpose                                |
| ---- | --------------------------------------- | -------------------------------------- |
| 1    | `POST /brc20swap/v2/create_add_liquid_psbt2` | Build unsigned add-liquidity PSBT |
| 2    | (sign PSBT with wallet)                 |                                        |
| 3    | `POST /brc20swap/v2/add_liquid_by_psbt`     | Submit signed add-liquidity PSBT  |

Request shape (`create_add_liquid_psbt2`):

```json
{
  "tick1": "BTC", "coin_type_1": "btc",  "amount_1": "<sats>",
  "tick2": "DOG•GO•TO•THE•MOON", "coin_type_2": "runes", "amount_2": "<smallest unit>",
  "slipper": "12",
  "fee_rate": "<sats/vB as string>",
  "payer_ord_addr": "bc1p...", "payer_btc_addr": "bc1p...",
  "payer_pub_key": "<btc_pub>:<ord_pub>",
  "token": "<from /brc20swap/swap_info `token` field>"
}
```

Response includes `psbt` (base64), `ToSignInputs`, `check_sum`, `tx_size`, `usr_cnt`,
`vins`. Pass all through to `add_liquid_by_psbt` along with the signed `psbt`.

**Note:** `tick1`/`tick2` order doesn't matter logically but must match the pool's
canonical pair ordering or the API will create a new pool. For DOG/BTC and MIM/BTC,
the canonical orderings live as `DOG•GO•TO•THE•MOON/BTC` and
`MAGIC•INTERNET•MONEY/BTC` in the tickers feed — base/quote there is rune/BTC.

### Remove liquidity (Runes)

Three-step flow:

1. `POST /brc20swap/v2/pre_remove_liquid` — estimate amounts out for a given
   `percent` (1–100 string) of LP.
2. `POST /brc20swap/v2/create_remove_liquid_psbt` — build the unsigned PSBT (echo all
   pre-remove response fields back into this request).
3. `POST /brc20swap/v2/remove_liquid_by_psbt` — submit signed PSBT.

Custodial fee on remove: BTC×0.3% (BRC20/Runes have BTC half being fee'd; ARC-20 has
ARC-20 side fee'd too; BRC20↔BRC20 is free).

### Bitcoin Channel deposit/withdraw (optional, for makers)

For Fast Execution Account / Bitcoin Channel funding (only relevant if we want sub-block
execution latency):

- `POST /brc20swap/create_deposit_psbt` → commit funds to channel
- `POST /brc20swap/create_deposit_order_by_psbt` → submit signed commit
- `POST /brc20swap/get_trading_withdraw_psbt` → reclaim funds
- `POST /brc20swap/submit_trading_withdraw_psbt`
- `POST /brc20swap/deposit_records`, `POST /brc20swap/withdraw_records`
- All require `is_multi_sign_trade: true`.

## Rate limits

| Endpoint                          | Limit                                  | Source        |
| --------------------------------- | -------------------------------------- | ------------- |
| `POST /brc20swap/swap_info`       | **1 req per 5 s per IP** (HTTP 429)    | docs, explicit |
| `POST /dotswap/api/swap/quote`    | Not documented. **`quote_id` TTL = 35 s.** | docs |
| `POST /dotswap/api/swap/create_psbt` | Not documented. Implicitly tied to quote_id (35 s) | docs |
| `POST /dotswap/api/swap/submit_psbt` | Not documented                       | —             |
| `GET /brc20swap/external/tickers` | Not documented; assume polite (≤ 1/s)  | inference     |
| WebSocket connections             | 24h max session, reconnect             | docs, explicit |

For the bot's normal hot loop: hit `fetch_ticker` / WS for price discovery, and
**reserve `/brc20swap/swap_info` for size-aware AMM math no more than once every 5 s
per pool**. For pre-trade quote-quality checks use `/dotswap/api/swap/quote` (faster
limit, includes aggregated route info).

## Known gotchas

1. **V2 vs V3 for Runes swaps.** V2 = `/brc20swap/get_swap_psbt2` + `/brc20swap/send_swap_psbt`, which only quote against a single native DotSwap pool and require a `token` retrieved from `/brc20swap/swap_info`. V3 = `/dotswap/api/swap/quote` + `create_psbt` + `submit_psbt`, which aggregate across the DotSwap^(N) AMM and third-party CLMM pools. **Use V3 for the arb bot.** V2 is still alive and lower latency for single-pool LP-side workflows.

2. **`use_bitcoin_channel: false` default.** This flag tells the aggregator whether to draw the user's tokens from a pre-committed Fast Execution Account (Bitcoin Channel) instead of from the user's on-chain UTXOs. Default `false` is "spend from wallet UTXOs on L1". If you opt into FEA (channel) later, deposits must be made first via `/brc20swap/create_deposit_psbt`, and the bot needs to manage the channel balance separately. For pure L1 arb, **always set this to `false`**.

3. **`inscription` array empty for Runes, populated for BRC-20.** Runes carry their token amount via OP_RETURN runestone; no inscription IDs needed. BRC-20 swaps require pre-existing transfer-inscriptions to spend, listed by inscription ID. We don't touch BRC-20 in this agent.

4. **Pool types: `amm` vs `clmm` vs FPSSL.** From the swap quote response, `pool_type` is one of `"amm"` (DotSwap^(N) constant-product), `"clmm"` (third-party concentrated liquidity, e.g. DogSwap), and the docs additionally mention `FPSSL` (Fairly Paired Single-Sided Liquidity) under yield-economics-and-amm-design. **The aggregator abstracts pool type at the `/swap/quote` and `/swap/create_psbt` level — the bot only needs to inspect `pool_type` if it's doing local price-impact modeling.** For LP-side operations (`v2/create_add_liquid_psbt2`), you're targeting a specific pool and pool-type semantics matter — `add_liquid_psbt2` is the AMM path; CLMM LP uses a different `/api/pool/clmm/*` set on the Nexus-node API surface that we have not yet documented in detail.

5. **Tickers field name mismatch.** Docs say `quote_currency`/`quote_volume`; live API returns `target_currency`/`target_volume`. Code against the live response.

6. **`/api/fee_rate` does not exist.** No 404 fallback to mempool.space — just use mempool.space directly.

7. **Wallet-Type header for hardware wallets.** Set `Wallet-Type: ledger` to give the server more signing window. Default `software` is fine for an automated bot.

8. **Same-address single-wallet pubkey format.** UniSat/OKX Taproot returns one address only — duplicate it in both `btc_address`/`ord_address` and duplicate the pubkey colon-separated in `pubkey`. The aggregator parses `<btc_pubkey>:<ord_pubkey>` strictly.

9. **`token` field in swap_info / liquid endpoints is a one-time use anti-replay token**, not an auth token. Refresh it per liquid operation.

10. **Bullet character is U+2022 (`•`)**, not a regular period or interpunct. `MAGIC•INTERNET•MONEY` is one string with three U+2022s.

11. **WebSocket symbol format uses `/`** (e.g. `DOG•GO•TO•THE•MOON/BTC`); REST also uses `/` in `symbol` / `ticker_id` fields. Don't substitute `-` or `_`.

12. **DotSwap^(N) AMM fee is 2.0% one-way (0.4% platform + 1.6% LP)** on Runes/BRC20 — significantly higher than CEX. Arb edge must clear `2 × 2.0% = 4.0%` round-trip on DotSwap alone, plus Kraken fees, plus BTC tx fee, plus slippage. **This is the dominant constraint.** CLMM pools (DogSwap) can have different fee tiers — `ServiceFeeRatio` and `dex_margin_percent` in the quote response tell you the actual per-pool fee for the chosen route.

13. **Quote response includes `coin_reward_amount`** — DotSwap pays a token-emission reward on swaps (`coin_reward_amount: "0.2598"` on a 10k-sat BTC→DOG quote). Not counted as part of `to_amount`; track separately if you want to net this against fees.

14. **Auth currently optional on quote/create_psbt** \[verified live] — this could change without notice. Build the login flow now even if you don't use the tokens.

## Open questions

1. **Exact host for `/api/nonce` and `/api/nexus/manage/login` for non-node clients.** `api.dotswap.app/api/nonce` returns 404. The swap frontend at `swap.on.nexus` is a static Next.js export with no own API — the actual login backend hostname for browsers is opaque (likely a CloudFront-fronted route to a hodlfi or nexus subdomain). Need to capture a real login round-trip from the production site (DevTools network tab on the swap.on.nexus connect-wallet flow) to nail this down before shipping auth.

2. **Whether `/dotswap/api/swap/submit_psbt` requires auth in production.** `quote` and `create_psbt` accept unauthenticated requests today; we did not actually submit a real signed PSBT to verify whether `submit_psbt` 401s. Risk: bot could build PSBTs all day and fail at the last step. **Test against testnet4 before mainnet rollout.**

3. **`slippage` units.** Error message `"slippage must be between 0 and 100"` confirms the range, but the docs don't say whether 1 means 0.01%, 0.1%, or 1%. V2 examples use `slipper: "12"`. Most likely interpretation: **percent (1 = 1%)**. Confirm by quoting a known pool, creating a PSBT with `slippage: 1`, and inspecting the OP_RETURN / min-receive amounts in the returned PSBT vs the quote.

4. **PSBT format returned by `create_psbt` (hex vs base64).** Not explicitly stated. Empirical workaround: detect at runtime. Verify in testnet4 round-trip before mainnet.

5. **Whether `liquid_info` / `/api/pool/liquid/liquid_info` is reachable on `api.dotswap.app` without running a Nexus node.** The doc lives under the Nexus protocol pages, which describe node-side endpoints. If we want native-pool reserves at low rate-limit, this is the path; if not reachable, fall back to `/brc20swap/swap_info` (5 s limit) plus the V3 quote response.

6. **Documented sighash type for V3 PSBTs.** Not stated; relying on wallet defaults is fine but worth confirming for any custodial/MPC integration.

7. **Rate limits on `/dotswap/api/swap/quote` and `submit_psbt`.** Not documented. We're planning a hot-loop arb bot that might quote every few seconds per pair — we should ask via the docs `?ask=` endpoint or measure empirically and back off on 429.

8. **Whether `MakerChannelFundEnough` in the quote response gates submission**, or is purely informational. If `false`, does `create_psbt` still succeed (with channel pools removed from the route) or fail outright?

9. **Whether the V3 aggregator can route a single user trade across both DotSwap^(N) and DogSwap atomically.** The `pool_infos` array suggests yes (multiple PSBTs in the response array), but we need to verify on testnet — partial-fill semantics matter for arb sizing.

10. **No documented orderbook depth WebSocket stream.** Only `@trade`. For depth, we either reverse-engineer from periodic `swap_info` polls or accept that the bot is trade-driven, not book-driven. The latter is fine for an AMM venue but worth flagging.
