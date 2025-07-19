export default function TokenomicsSection() {
  return (
    <section id="tokenomics" className="py-24 px-5 bg-gradient-to-b from-gray-100 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-20 text-[120px] opacity-10 animate-spin" style={{ animationDuration: '30s' }}>📊</div>
      <div className="absolute bottom-20 left-20 text-[120px] opacity-10 animate-float">🔥</div>
      <div className="absolute top-1/3 left-10 text-[80px] opacity-10 animate-pulse">₿</div>
      <div className="absolute bottom-1/3 right-10 text-[80px] opacity-10 animate-bounce" style={{ animationDelay: '1s' }}>✨</div>
      
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl mb-12 font-derp text-wizard-black tracking-tight text-center" 
            style={{ textShadow: '3px 3px 0 #f09f00, 6px 6px 0 #2f53fe' }}>
          Tokenomics
        </h2>
        
        {/* Timeline boxes */}
        <div className="space-y-8 mb-12">
          {/* BRC-20 Launch */}
          <div className="bg-magic-yellow p-8 border-4 border-wizard-black rounded-[25px_10px_25px_10px] -rotate-1 hover:rotate-1 transition-all duration-300 relative">
            <div className="absolute -top-6 -left-6 bg-wizard-blue text-white px-4 py-2 border-3 border-wizard-black rounded-[15px_5px_15px_5px] font-derp text-xl -rotate-12">
              March 2023
            </div>
            <h3 className="text-3xl mb-3 font-derp text-wizard-black">🚀 BRC-20 Launch</h3>
            <p className="text-2xl font-caveat font-bold">
              $MIM was launched fairly via an open public mint as a BRC-20 token. No presale, no premine, no insider allocation - just pure community magic!
            </p>
          </div>
          
          {/* Runes Migration */}
          <div className="bg-bitcoin-orange p-8 border-4 border-wizard-black rounded-[25px_10px_25px_10px] rotate-1 hover:-rotate-1 transition-all duration-300 relative">
            <div className="absolute -top-6 -right-6 bg-wizard-cyan text-wizard-black px-4 py-2 border-3 border-wizard-black rounded-[15px_5px_15px_5px] font-derp text-xl rotate-12">
              April 2024
            </div>
            <h3 className="text-3xl mb-3 font-derp text-white">⚡ Runes Migration</h3>
            <p className="text-2xl font-caveat font-bold text-white">
              $MIM migrated to the Runes standard, embracing the latest Bitcoin innovation while maintaining its pure, decentralized nature.
            </p>
          </div>
          
          {/* Burn Event */}
          <div className="bg-wizard-black p-8 border-4 border-magic-yellow rounded-[25px_10px_25px_10px] -rotate-1 hover:rotate-1 transition-all duration-300 relative">
            <div className="absolute -top-6 -left-6 bg-red-500 text-white px-4 py-2 border-3 border-white rounded-[15px_5px_15px_5px] font-derp text-xl -rotate-12 animate-pulse">
              April 2025
            </div>
            <h3 className="text-3xl mb-3 font-derp text-magic-yellow">🔥 The Great Burn</h3>
            <p className="text-2xl font-caveat font-bold text-white">
              Migration window permanently closed. Remaining unclaimed BRC-20 supply was sent to Satoshi's wallet - the ultimate burn! 
              <span className="text-bitcoin-orange animate-pulse"> True deflationary magic!</span>
            </p>
            
            {/* Fire effects around burn box */}
            <div className="absolute -top-4 -left-4 text-4xl animate-float">🔥</div>
            <div className="absolute -bottom-4 -right-4 text-4xl animate-float" style={{ animationDelay: '0.5s' }}>🔥</div>
            <div className="absolute top-1/2 -left-8 text-3xl animate-pulse">🔥</div>
            <div className="absolute top-1/2 -right-8 text-3xl animate-pulse" style={{ animationDelay: '0.7s' }}>🔥</div>
          </div>
        </div>
        
        {/* Key Facts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 border-3 border-wizard-black rounded-[20px_5px_20px_5px] rotate-2 hover:-rotate-2 transition-all hover:scale-105">
            <div className="text-5xl mb-3 text-center">👥</div>
            <h4 className="text-2xl font-derp text-wizard-blue mb-2">No Team Allocation</h4>
            <p className="text-xl font-caveat font-bold">Zero tokens held by any team or insiders</p>
          </div>
          
          <div className="bg-white p-6 border-3 border-wizard-black rounded-[20px_5px_20px_5px] -rotate-2 hover:rotate-2 transition-all hover:scale-105">
            <div className="text-5xl mb-3 text-center">💯</div>
            <h4 className="text-2xl font-derp text-bitcoin-orange mb-2">100% Circulating</h4>
            <p className="text-xl font-caveat font-bold">Every single $MIM is out in the wild!</p>
          </div>
          
          <div className="bg-white p-6 border-3 border-wizard-black rounded-[20px_5px_20px_5px] rotate-2 hover:-rotate-2 transition-all hover:scale-105">
            <div className="text-5xl mb-3 text-center">🤝</div>
            <h4 className="text-2xl font-derp text-wizard-cyan mb-2">Community Driven</h4>
            <p className="text-xl font-caveat font-bold">All initiatives led by wizards like you!</p>
          </div>
        </div>
        
        {/* Community Statement */}
        <div className="bg-gradient-to-r from-wizard-blue to-wizard-cyan p-10 border-4 border-wizard-black rounded-[30px_10px_30px_10px] -rotate-1 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute text-[300px] -top-20 -right-20 rotate-12">🧙‍♂️</div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-4xl font-derp text-white mb-4 text-center drop-shadow-[0_0_10px_#040104]">
              The Power of Community
            </h3>
            <p className="text-2xl font-caveat font-bold text-white text-center leading-relaxed">
              $MIM is <span className="text-magic-yellow">fully community-driven</span>. 
              No central authority, no hidden agendas. All initiatives are led and/or crowdfunded by 
              <span className="text-magic-yellow"> core community members</span> who believe in the magic. 
              This is what true decentralization looks like - 
              <span className="text-3xl font-derp tracking-wider"> pure wizard power! </span>
            </p>
          </div>
          
          {/* Sparkle decorations */}
          <div className="absolute top-4 left-4 text-3xl animate-sparkle">✨</div>
          <div className="absolute bottom-4 right-4 text-3xl animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</div>
          <div className="absolute top-4 right-4 text-3xl animate-sparkle" style={{ animationDelay: '1s' }}>✨</div>
          <div className="absolute bottom-4 left-4 text-3xl animate-sparkle" style={{ animationDelay: '1.5s' }}>✨</div>
        </div>
      </div>
    </section>
  )
}