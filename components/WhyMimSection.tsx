export default function WhyMimSection() {
  const features = [
    { title: 'Best Ticker', desc: '$MIM - Magic Internet Money. The perfect ticker for the perfect meme.' },
    { title: 'Best CTA', desc: '"Join us" - Simple, powerful, inclusive. The original wizard\'s call to action.' },
    { title: 'Timeless Art', desc: 'Dope, universal, timeless MS Paint art that captures the soul of early Bitcoin.' },
    { title: 'Deep Provenance', desc: 'Deep Bitcoin provenance, culture, and history from 2013\'s r/bitcoin community.' },
    { title: 'Hard-Capped', desc: 'Non-inflationary, hard-capped supply. Impossible to dilute with another shiny animal coin.' },
    { title: 'Pure Bitcoin', desc: 'Native to the motherchain—pure Bitcoin, no bridges, no wrapping, no gimmicks.' },
  ]

  return (
    <section id="why" className="py-24 px-5 bg-white text-center">
      <h2 className="text-5xl mb-12 text-wizard-black font-derp tracking-tight" style={{ textShadow: '2px 2px 0 #67d1e3' }}>
        Why Magic Internet Money?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {features.map((feature, i) => (
          <div
            key={i}
            className={`bg-[#f5f5f0] p-8 border-3 border-wizard-black rounded-[20px] ${
              i % 2 === 0 ? '-rotate-1' : 'rotate-1'
            } hover:rotate-[1deg] hover:scale-105 hover:bg-magic-yellow transition-all`}
          >
            <h3 className="text-4xl mb-4 text-wizard-blue font-derp tracking-tight">{feature.title}</h3>
            <p className="text-2xl">{feature.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-16 p-10 bg-[#f5f5f0] border-3 border-wizard-black rounded-[20px] max-w-3xl mx-auto -rotate-1">
        <p className="text-2xl leading-relaxed">
          <strong className="font-derp">Bitcoin's block subsidy is decreasing. The on-chain economy is the future.</strong>
          <br/><br/>
          This is the pristine holy grail of meme tokens—an undilutable, culturally significant asset that lives and breathes Bitcoin. 
          100% aligned with Bitcoin's long-term success.
          <br/><br/>
          <em className="text-4xl font-derp tracking-tight">If you get it, you get it.</em>
        </p>
      </div>
    </section>
  )
}