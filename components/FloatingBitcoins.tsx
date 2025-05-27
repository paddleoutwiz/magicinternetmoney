export default function FloatingBitcoins() {
  return (
    <>
      {[10, 30, 50, 70, 90].map((left, i) => (
        <div
          key={i}
          className="fixed text-3xl text-bitcoin-orange pointer-events-none animate-[floatAround_20s_linear_infinite]"
          style={{
            left: `${left}%`,
            animationDelay: `${i * 5}s`
          }}
        >
          ₿
        </div>
      ))}
    </>
  )
}