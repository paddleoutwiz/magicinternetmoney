export default function FairLaunchSection() {
  return (
    <section id="launch" className="bg-wizard-black text-white py-24 px-5 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute text-[200px] -top-12 -right-12 rotate-[-15deg]">✨</div>
        <div className="absolute text-[200px] -bottom-12 -left-12 rotate-[15deg] animate-pulse">✨</div>
      </div>
      
      <h2 className="text-5xl mb-10 text-magic-yellow font-derp tracking-tight" style={{ textShadow: '3px 3px 0 #2f53fe' }}>
        The Fairest Launch in History
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-10">
        <div className="bg-wizard-blue p-8 border-3 border-magic-yellow rounded-[20px_5px_20px_5px] -rotate-2">
          <h3 className="text-4xl text-magic-yellow mb-2 font-derp">No Presale</h3>
          <p className="text-2xl">Zero insider deals</p>
        </div>
        
        <div className="bg-wizard-blue p-8 border-3 border-magic-yellow rounded-[20px_5px_20px_5px] rotate-2">
          <h3 className="text-4xl text-magic-yellow mb-2 font-derp">No Premine</h3>
          <p className="text-2xl">Not a single token reserved</p>
        </div>
        
        <div className="bg-wizard-blue p-8 border-3 border-magic-yellow rounded-[20px_5px_20px_5px] -rotate-2">
          <h3 className="text-4xl text-magic-yellow mb-2 font-derp">One Month Wait</h3>
          <p className="text-2xl">BRC-20 deployed and untouched</p>
        </div>
        
        <div className="bg-wizard-blue p-8 border-3 border-magic-yellow rounded-[20px_5px_20px_5px] rotate-2">
          <h3 className="text-4xl text-magic-yellow mb-2 font-derp">100% Public</h3>
          <p className="text-2xl">Every token in the wild</p>
        </div>
      </div>
      
      <p className="text-2xl max-w-3xl mx-auto leading-relaxed">
        BRC-20 deployed and left untouched for a full month—not a single transaction, no secret wallets accumulating. 
        Only when MavensBot tweeted did the minting frenzy begin. No 90% supply held by shadowy devs. 
        Every single token is out in the wild, owned by the people.
      </p>
    </section>
  )
}