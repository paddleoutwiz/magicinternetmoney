'use client'

import { useState } from 'react'
import WizardAssembly from './WizardAssembly'

export default function HeroSection() {
  const [clickCount, setClickCount] = useState(0)

  const handleWizardClick = () => {
    setClickCount(prev => prev + 1)
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Semi-transparent overlay to let matrix rain show through */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/100 z-0" />
      
      {/* Content with higher z-index - properly centered */}
      <div className="relative z-content flex flex-col items-center justify-center text-center w-full px-4">
        <div className="flex items-center justify-center w-full">
          <WizardAssembly onClick={handleWizardClick} clickCount={clickCount} />
        </div>
        
        {/* Wrapper div for glitch effect to maintain alignment */}
        <div className="relative mt-12 -rotate-3">
          <h1 className="text-6xl md:text-8xl font-derp text-wizard-black tracking-tight relative">
            {/* Glitch layers - positioned absolutely */}
            <span className="absolute inset-0 text-[#ff00ff] animate-glitch-1" aria-hidden="true">
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0s' }}>M</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.1s' }}>a</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.2s' }}>g</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.3s' }}>i</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.4s' }}>c</span>
              <span className="mx-2"></span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.5s' }}>I</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.6s' }}>n</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.7s' }}>t</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.8s' }}>e</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.9s' }}>r</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.0s' }}>n</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.1s' }}>e</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.2s' }}>t</span>
              <span className="mx-2"></span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.3s' }}>M</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.4s' }}>o</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.5s' }}>n</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.6s' }}>e</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.7s' }}>y</span>
            </span>
            
            <span className="absolute inset-0 text-[#00ffff] animate-glitch-2" aria-hidden="true">
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0s' }}>M</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.1s' }}>a</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.2s' }}>g</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.3s' }}>i</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.4s' }}>c</span>
              <span className="mx-2"></span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.5s' }}>I</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.6s' }}>n</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.7s' }}>t</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.8s' }}>e</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.9s' }}>r</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.0s' }}>n</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.1s' }}>e</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.2s' }}>t</span>
              <span className="mx-2"></span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.3s' }}>M</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.4s' }}>o</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.5s' }}>n</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.6s' }}>e</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.7s' }}>y</span>
            </span>
            
            {/* Main text with bouncing letters */}
            <span className="relative">
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0s' }}>M</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.1s' }}>a</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.2s' }}>g</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.3s' }}>i</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.4s' }}>c</span>
              <span className="mx-2"></span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.5s' }}>I</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.6s' }}>n</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.7s' }}>t</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.8s' }}>e</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '0.9s' }}>r</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.0s' }}>n</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.1s' }}>e</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.2s' }}>t</span>
              <span className="mx-2"></span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.3s' }}>M</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.4s' }}>o</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.5s' }}>n</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.6s' }}>e</span>
              <span className="animate-bounce inline-block drop-shadow-[0_0_3px_#6ef405]" style={{ animationDelay: '1.7s' }}>y</span>
            </span>
          </h1>
        </div>
        
        {/* Bitcoin Wizards with glitch effect */}
        <div className="relative mt-4 rotate-2">
          <p className="text-3xl md:text-4xl font-derp text-wizard-cyan relative">
            {/* Glitch layers */}
            <span className="absolute inset-0 text-[#ff00ff] animate-glitch-1" aria-hidden="true">
              Bitcoin Wizards
            </span>
            <span className="absolute inset-0 text-[#00ffff] animate-glitch-2" aria-hidden="true">
              Bitcoin Wizards
            </span>
            {/* Main text */}
            <span className="relative drop-shadow-[0_0_2px_#67d1e3]">
              Bitcoin Wizards
            </span>
          </p>
        </div>
        
        <a href="#community" className="mt-16 mx-auto block w-fit px-10 py-6 bg-bitcoin-orange text-wizard-black border-4 border-wizard-black rounded-[20px_5px_20px_5px] text-3xl md:text-4xl font-derp -rotate-2 hover:rotate-2 hover:scale-110 hover:bg-magic-yellow transition-all shadow-[0_0_2px_#040104] hover:shadow-[0_0_4px_#040104] animate-rainbow-glow">
          Join Us
        </a>
      </div>
    </section>
  )
}