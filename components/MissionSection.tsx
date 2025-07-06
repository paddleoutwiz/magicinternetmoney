export default function MissionSection() {
  return (
    <section id="mission" className="py-24 px-5 bg-gradient-to-b from-wizard-black to-gray-900 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 text-[150px] opacity-10 animate-pulse">🎯</div>
      <div className="absolute bottom-10 left-10 text-[150px] opacity-10 animate-float">🚀</div>
      <div className="absolute top-1/2 left-1/4 text-[100px] opacity-10 animate-spin" style={{ animationDuration: '20s' }}>✨</div>
      <div className="absolute top-1/2 right-1/4 text-[100px] opacity-10 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>₿</div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-5xl mb-12 font-derp text-magic-yellow tracking-tight" style={{ textShadow: '4px 4px 0 #2f53fe' }}>
          Our Mission
        </h2>
        
        <div className="bg-wizard-blue/20 backdrop-blur-sm p-12 border-4 border-magic-yellow rounded-[30px_10px_30px_10px] rotate-1 hover:-rotate-1 transition-all duration-300">
          <p className="text-2xl md:text-3xl leading-relaxed font-caveat">
            <span className="text-magic-yellow font-bold">Our mission</span> is to revive the 
            <span className="text-bitcoin-orange font-bold animate-pulse mx-2">fun and chaos</span> 
            that made Bitcoin magical in its early days. With the Bitcoin block subsidy declining, the 
            <span className="text-wizard-cyan font-bold"> $MIM wizards</span> are leading the charge in 
            <span className="text-magic-yellow font-bold"> building + supporting</span> the growth of the 
            <span className="text-bitcoin-orange font-bold animate-pulse"> Bitcoin on-chain economy revolution.</span>
          </p>
          
          {/* Decorative elements */}
          <div className="absolute -top-8 -left-8 text-4xl animate-bounce">🧙‍♂️</div>
          <div className="absolute -bottom-8 -right-8 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>💊</div>
          <div className="absolute top-1/2 -left-12 text-3xl animate-float">⚡</div>
          <div className="absolute top-1/2 -right-12 text-3xl animate-float" style={{ animationDelay: '1s' }}>⚡</div>
        </div>
        
        {/* Additional emphasis */}
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <div className="bg-bitcoin-orange px-6 py-3 border-3 border-white rounded-[15px_5px_15px_5px] font-derp text-xl -rotate-2 hover:rotate-2 transition-all">
            Build
          </div>
          <div className="bg-magic-yellow text-wizard-black px-6 py-3 border-3 border-white rounded-[15px_5px_15px_5px] font-derp text-xl rotate-2 hover:-rotate-2 transition-all">
            Support
          </div>
          <div className="bg-wizard-cyan text-wizard-black px-6 py-3 border-3 border-white rounded-[15px_5px_15px_5px] font-derp text-xl -rotate-2 hover:rotate-2 transition-all">
            Grow
          </div>
        </div>
      </div>
    </section>
  )
}