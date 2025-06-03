export default function BitcoinVortex() {
  return (
    <div className="fixed w-[200vw] h-[200vh] -top-[50vh] -left-[50vw] opacity-5 pointer-events-none z-vortex animate-[vortex-spin_60s_linear_infinite] will-change-transform">
      <div className="w-full h-full bg-[repeating-conic-gradient(from_0deg_at_50%_50%,transparent_0deg,#f09f00_10deg,transparent_20deg)]" />
    </div>
  )
}