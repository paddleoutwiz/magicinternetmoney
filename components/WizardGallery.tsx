'use client'

import { useState } from 'react'
import Image from 'next/image'

const wizards = [
  { 
    id: 1, 
    label: 'Wizard #1', 
    url: 'https://ord-mirror.magiceden.dev/content/0623d9b1ee252ccc57507b93615a5c3d221e184826358ae02888cdcf6a40c406i0'
  },
  { 
    id: 70, 
    label: 'MavensBot #70', 
    url: 'https://ord-mirror.magiceden.dev/content/b1c5baa2593b256068635bbc475e0cc439d66c2dcf12e9de6f3aaeaf96ff818bi0',
    special: true 
  },
  { 
    id: 264, 
    label: 'Wizard #264', 
    url: 'https://ord-mirror.magiceden.dev/content/4e7d51f18b30f7727ccb1ca4b8104a3f7ed4962bff2290f993843c7ddfadbcedi0'
  },
  { 
    id: 679, 
    label: 'Wizard #679', 
    url: 'https://ord-mirror.magiceden.dev/content/021424d03ecce829d4121d245920da1641d4419ccb2d5f42566ea4aac0d72b95i0'
  },
  { 
    id: 1077, 
    label: 'Wizard #1077', 
    url: 'https://ord-mirror.magiceden.dev/content/fd7e30758039683da5008040f1d31d627d54f1f75d14853b3bf23e105dee355bi0'
  },
]

export default function WizardGallery() {
  const [clickedWizards, setClickedWizards] = useState<number[]>([])
  const [loadedWizards, setLoadedWizards] = useState<number[]>([])
  const [marketplaceHovered, setMarketplaceHovered] = useState(false)

  const handleWizardClick = (id: number) => {
    setClickedWizards(prev => [...prev, id])
    setTimeout(() => {
      setClickedWizards(prev => prev.filter(wId => wId !== id))
    }, 1000)
  }

  const handleImageLoad = (id: number) => {
    setLoadedWizards(prev => [...prev, id])
  }

  return (
    <section id="wizards" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8 p-6 sm:p-8 md:p-12 bg-gray-200 border-t-[5px] border-b-[5px] border-wizard-black">
      {wizards.map(wizard => (
        <div
          key={wizard.id}
          className="relative cursor-pointer transition-all hover:-translate-y-2 hover:rotate-[5deg]"
          onClick={() => handleWizardClick(wizard.id)}
        >
          <div className={`relative w-full aspect-square overflow-hidden border-3 border-wizard-black rounded-[20px] bg-white ${
            clickedWizards.includes(wizard.id) ? 'animate-spin' : ''
          }`}>
            <Image 
              src={wizard.url}
              alt={wizard.label}
              fill
              className={`object-contain p-2 transition-opacity duration-300 ${
                loadedWizards.includes(wizard.id) ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad(wizard.id)}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
            {!loadedWizards.includes(wizard.id) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl animate-pulse">🧙‍♂️</div>
              </div>
            )}
            {wizard.special && (
              <div className="absolute top-2 right-2 text-2xl animate-pulse drop-shadow-[0_0_10px_#f3ff00]">⭐</div>
            )}
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-magic-yellow px-4 py-1 border-2 border-wizard-black rounded-[10px] font-derp text-sm whitespace-nowrap">
            {wizard.label}
          </div>
          {clickedWizards.includes(wizard.id) && (
            <>
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-3xl animate-[float-up_1s_ease-out_forwards]">
                ✨
              </div>
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-magic-yellow rounded-full animate-sparkle"
                    style={{
                      left: `${50 + (Math.random() - 0.5) * 100}%`,
                      top: `${50 + (Math.random() - 0.5) * 100}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ))}
      
      {/* Magic Eden Marketplace Link */}
      <a
        href="https://magiceden.us/ordinals/marketplace/bitcoin-wizards"
        target="_blank"
        rel="noopener noreferrer"
        className="relative cursor-pointer transition-all hover:-translate-y-2 hover:rotate-[5deg] group"
        onMouseEnter={() => setMarketplaceHovered(true)}
        onMouseLeave={() => setMarketplaceHovered(false)}
      >
        <div className={`relative w-full aspect-square overflow-hidden border-3 border-wizard-black rounded-[20px] bg-bitcoin-orange flex flex-col items-center justify-center p-4 ${
          marketplaceHovered ? 'bg-magic-yellow' : ''
        } transition-colors`}>
          <div className="text-4xl sm:text-5xl mb-2 group-hover:animate-bounce">🛒</div>
          <div className="text-wizard-black font-derp text-lg sm:text-xl md:text-2xl text-center leading-tight">
            Buy/Sell<br/>Wizards
          </div>
          <div className="text-3xl sm:text-4xl mt-2 group-hover:animate-spin">✨</div>
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-wizard-blue text-white px-4 py-1 border-2 border-wizard-black rounded-[10px] font-derp text-sm whitespace-nowrap">
          Magic Eden
        </div>
        {marketplaceHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              >
                💰
              </div>
            ))}
          </div>
        )}
      </a>
    </section>
  )
}