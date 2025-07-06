'use client'

import { useState, useEffect } from 'react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    // Prevent body scroll when menu is open
    if (!isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }

  const handleNavClick = () => {
    setIsOpen(false)
    document.body.style.overflow = 'unset'
  }

  const navItems = [
    { href: '#community', label: 'Community' },
    { href: '#about', label: 'Story' },
    { href: '#mission', label: 'Mission' },
    { href: '#launch', label: 'Fair Launch' },
    { href: '#why', label: 'Why MIM?' },
    { href: '#wizards', label: 'Wizards' },
    { href: 'https://games.magicinternetmoney.party', label: 'Games', external: true },
  ]

  // Desktop navigation
  if (!isMobile) {
    return (
      <nav className="fixed top-4 right-4 flex gap-3 z-50">
        {navItems.map((item, i) => (
          <a 
            key={item.href}
            href={item.href} 
            className="px-4 py-2 bg-bitcoin-orange border-2 border-wizard-black rounded-[12px_4px_12px_4px] text-base font-derp -rotate-1 hover:rotate-1 hover:scale-105 hover:bg-[#ee8e02] hover:shadow-[3px_3px_0_#040104] transition-all cursor-magic-wand-active"
          >
            {item.label}
          </a>
        ))}
      </nav>
    )
  }

  // Mobile navigation
  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-[60] w-12 h-12 bg-bitcoin-orange border-2 border-wizard-black rounded-[12px_4px_12px_4px] flex flex-col items-center justify-center gap-1 cursor-magic-wand-active hover:scale-105 transition-transform"
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-wizard-black transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
        <span className={`block w-6 h-0.5 bg-wizard-black transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-wizard-black transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
      </button>

      {/* Full screen mobile menu overlay */}
      <div className={`fixed inset-0 bg-white z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 text-7xl opacity-20 animate-float">🧙‍♂️</div>
          <div className="absolute bottom-10 right-10 text-7xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>💊</div>
          <div className="absolute top-1/2 left-5 text-5xl opacity-20 animate-spin" style={{ animationDuration: '10s' }}>₿</div>
          <div className="absolute top-1/2 right-5 text-5xl opacity-20 animate-spin" style={{ animationDuration: '15s' }}>✨</div>
        </div>

        {/* Menu content */}
        <div className="relative h-full flex flex-col items-center justify-center gap-6 px-6">
          <h2 className="text-3xl font-derp text-wizard-black mb-3 animate-bounce">Navigate the Magic!</h2>
          
          {navItems.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`block w-full max-w-xs px-6 py-4 bg-bitcoin-orange border-3 border-wizard-black rounded-[18px_5px_18px_5px] text-2xl font-derp text-center transform transition-all hover:scale-105 hover:bg-magic-yellow hover:shadow-[6px_6px_0_#040104] cursor-magic-wand-active ${
                i % 2 === 0 ? '-rotate-1' : 'rotate-1'
              }`}
              style={{
                animation: isOpen ? `floatUp 0.5s ease-out forwards` : '',
                animationDelay: isOpen ? `${i * 0.1}s` : '',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              {item.label}
            </a>
          ))}
          
          <p className="text-lg font-caveat text-wizard-black mt-6 animate-pulse">
            Click anywhere to explore! 🚀
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}