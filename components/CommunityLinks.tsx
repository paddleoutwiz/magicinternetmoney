'use client'

import { useState } from 'react'

const communityLinks = [
  { 
    name: 'Discord', 
    url: 'https://discord.gg/bitcoinwizard',
    image: '/assets/icons/discord.png',
    color: 'bg-[#5865F2]'
  },
  { 
    name: 'Twitter/X', 
    url: 'https://x.com/mimcoinbtc',
    image: '/assets/icons/x.png',
    color: 'bg-[#1DA1F2]'
  },
  { 
    name: 'Telegram', 
    url: 'https://t.me/bitcoinwizardry',
    image: '/assets/icons/telegram.png',
    color: 'bg-[#3aafea]'
  },
  { 
    name: 'Magic Eden', 
    url: 'https://magiceden.us/runes/MAGIC%E2%80%A2INTERNET%E2%80%A2MONEY',
    image: '/assets/icons/magiceden.png',
    color: 'bg-[#E42575]'
  },
  { 
    name: 'Meme Maker', 
    url: 'https://www.magicinternet.meme/',
    image: '/assets/icons/mememaker.png',
    color: 'bg-[#FF6B6B]'
  },
  { 
    name: 'DotSwap', 
    url: 'https://www.dotswap.app/swap#R_%E2%80%A2BTC_%E2%80%A2MAGIC%E2%80%A2INTERNET%E2%80%A2MONEY',
    image: '/assets/icons/dotswap.png',
    color: 'bg-[#333333]'
  },
  { 
    name: 'Slingshot', 
    url: 'https://slingshot.app/token/solana/M1M6sdffCs3ozzhpRveweRCWdZhxth4mvVujPtYEC3h?code=MagicInternetMoney&c=962&t=l',
    image: '/assets/icons/slingshot.png',
    color: 'bg-[#75fc6e]'
  },
  { 
    name: 'Coingecko', 
    url: 'https://www.coingecko.com/en/coins/magic-internet-money-runes',
    image: '/assets/icons/coingecko.png',
    color: 'bg-[#fbe97b]'
  },
  { 
    name: 'CoinMarketCap', 
    url: 'https://coinmarketcap.com/currencies/magic-internet-money-bitcoin/',
    image: '/assets/icons/coinmarketcap.png',
    color: 'bg-[#3861FB]'
  },
  { 
    name: 'MagicSwap', 
    url: 'https://www.magicswap.app/',
    image: '/assets/icons/magicswap.png',
    color: 'bg-[#0088cc]'
  },
  { 
    name: 'Art', 
    url: 'https://art.bitcoinwizard.com/',
    image: '/assets/icons/art.png',
    color: 'bg-[#E42575]'
  },
  { 
    name: 'Runemine Bridge', 
    url: 'https://app.runemine.com/bridge',
    image: '/assets/icons/art.png',
    color: 'bg-[#F05623]'
  },
]

export default function CommunityLinks() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [clickedLink, setClickedLink] = useState<string | null>(null)

  const handleClick = (name: string) => {
    setClickedLink(name)
    
    // Create explosion effect
    const explosion = document.createElement('div')
    explosion.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl z-[99999] pointer-events-none'
    explosion.innerHTML = '✨'
    explosion.style.animation = 'explode 1s ease-out forwards'
    document.body.appendChild(explosion)
    setTimeout(() => explosion.remove(), 1000)
    
    setTimeout(() => setClickedLink(null), 300)
  }

  return (
    <section id="community" className="py-16 px-5 bg-gradient-to-b from-white to-gray-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🧙‍♂️</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>💊</div>
      <div className="absolute top-1/2 left-20 text-4xl opacity-20 animate-spin" style={{ animationDuration: '10s' }}>₿</div>
      <div className="absolute top-1/2 right-20 text-4xl opacity-20 animate-spin" style={{ animationDuration: '15s' }}>✨</div>
      
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-5xl mb-4 font-derp text-wizard-black tracking-tight relative inline-block">
          Join the Wizard Community
          <span className="absolute -top-4 -right-8 text-3xl animate-pulse">✨</span>
        </h2>
        <p className="text-2xl mb-12 font-caveat font-bold text-wizard-black">
          Connect with fellow wizards across the magical internet
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {communityLinks.map((link, i) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(link.name)}
              onMouseEnter={() => setHoveredLink(link.name)}
              onMouseLeave={() => setHoveredLink(null)}
              className={`
                relative ${link.color} text-white p-6 border-3 border-wizard-black 
                rounded-[20px_5px_20px_5px] font-derp text-xl
                transition-all duration-300 cursor-magic-wand-active
                ${hoveredLink === link.name ? 'scale-110 -rotate-6 shadow-[8px_8px_0_#040104]' : i % 2 === 0 ? '-rotate-2' : 'rotate-2'}
                ${clickedLink === link.name ? 'scale-95' : ''}
                hover:brightness-110
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-20 h-20 flex items-center justify-center ${hoveredLink === link.name ? 'animate-bounce' : ''}`}>
                  <img 
                    src={link.image} 
                    alt={`${link.name} icon`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback emoji hidden by default */}
                  <span className="hidden text-4xl">🔗</span>
                </div>
                <span className="text-lg">{link.name}</span>
              </div>
              
              {/* Hover sparkles */}
              {hoveredLink === link.name && (
                <>
                  <div className="absolute -top-2 -left-2 text-xl animate-sparkle">✨</div>
                  <div className="absolute -bottom-2 -right-2 text-xl animate-sparkle" style={{ animationDelay: '0.3s' }}>✨</div>
                </>
              )}
            </a>
          ))}
        </div>
        
        {/* Fun message that appears randomly */}
        {Math.random() > 0.7 && (
          <div className="mt-8 text-xl font-caveat text-wizard-black animate-pulse">
            <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>C</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>l</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>i</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.3s' }}>c</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>k</span>
            <span className="mx-1"></span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.5s' }}>a</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.6s' }}>l</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.7s' }}>l</span>
            <span className="mx-1"></span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.8s' }}>t</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.9s' }}>h</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '1.0s' }}>e</span>
            <span className="mx-1"></span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '1.1s' }}>l</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '1.2s' }}>i</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '1.3s' }}>n</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '1.4s' }}>k</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '1.5s' }}>s</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '1.6s' }}>!</span>
          </div>
        )}
      </div>
    </section>
  )
}