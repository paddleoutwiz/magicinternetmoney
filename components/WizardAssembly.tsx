'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import PillSpinner from './PillSpinner'

interface WizardAssemblyProps {
  onClick: () => void
  clickCount: number
}

export default function WizardAssembly({ onClick, clickCount }: WizardAssemblyProps) {
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number}>>([])
  const [message, setMessage] = useState('')
  const [isSuper, setIsSuper] = useState(false)
  const [wizardState, setWizardState] = useState('normal')
  const [mouthClicks, setMouthClicks] = useState(0)
  const [showPillSpinner, setShowPillSpinner] = useState(false)
  const [clickFeedback, setClickFeedback] = useState(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout>()
  const lastClickRef = useRef(0)

  const handleMouthClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMouthClicks(prev => prev + 1)
    
    if (mouthClicks + 1 === 3) {
      console.log('%c💊 WIZARD PILL OVERDOSE! 💊', 'color: #ff00ff; font-size: 20px;')
      
      // Show pill spinner
      setShowPillSpinner(true)
      
      // Create pill explosion from mouth (adjusted for center of wizard)
      const mouth = e.currentTarget.getBoundingClientRect()
      const centerX = mouth.left + mouth.width / 2
      const centerY = mouth.top + mouth.height / 2
      
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          const pill = document.createElement('div')
          pill.className = 'fixed w-12 h-12 z-pills'
          pill.style.left = centerX + 'px'
          pill.style.top = centerY + 'px'
          
          const img = document.createElement('img')
          img.src = '/assets/pill.png'
          img.className = 'w-full h-full animate-spin'
          img.style.filter = `hue-rotate(${Math.random() * 360}deg)`
          
          pill.appendChild(img)
          document.body.appendChild(pill)
          
          // Animate outward
          const angle = (Math.PI * 2 * i) / 30
          const velocity = 300 + Math.random() * 200
          const endX = Math.cos(angle) * velocity
          const endY = Math.sin(angle) * velocity
          
          pill.style.transition = 'all 2s ease-out'
          pill.style.transform = 'translate(-50%, -50%)'
          
          requestAnimationFrame(() => {
            pill.style.transform = `translate(${endX}px, ${endY}px) scale(0) rotate(${Math.random() * 720}deg)`
            pill.style.opacity = '0'
          })
          
          setTimeout(() => pill.remove(), 2000)
        }, i * 30)
      }
      
      // Wizard reaction
      setMessage('BLEHHHHH! 🤮')
      setWizardState('overdosed')
      document.body.style.filter = 'hue-rotate(270deg) saturate(2)'
      
      setTimeout(() => {
        setMessage('')
        setWizardState('normal')
        setMouthClicks(0)
        setShowPillSpinner(false)
        document.body.style.filter = ''
      }, 3000)
    }
  }
  
  useEffect(() => {
    // Show click count in console
    if (clickCount > 0) {
      console.log(`%c🧙‍♂️ Wizard clicked ${clickCount} time${clickCount > 1 ? 's' : ''}!`, 'color: #2f53fe; font-size: 16px;')
    }

    switch(clickCount) {
      case 3:
        setMessage('HODL!')
        setTimeout(() => setMessage(''), 2000)
        break
      case 5:
        setMessage('🧙‍♂️ MAGIC ACTIVATED! 🧙‍♂️')
        setIsSuper(true)
        setWizardState('magical')
        console.log('%c✨ ACHIEVEMENT: Rainbow Wizard Mode!', 'color: #f3ff00; font-size: 20px; font-weight: bold;')
        setTimeout(() => {
          setMessage('')
          setIsSuper(false)
          setWizardState('normal')
        }, 3000)
        break
      case 7:
        // Summon mini wizards (using the complete wizard image)
        console.log('%c🧙‍♂️ SUMMONING WIZARD FRIENDS!', 'color: #6ef405; font-size: 20px;')
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const miniWizard = document.createElement('div')
            miniWizard.className = 'fixed w-32 h-32 animate-float z-ui cursor-pointer transition-all hover:scale-110'
            miniWizard.style.left = `${Math.random() * (window.innerWidth - 128)}px`
            miniWizard.style.top = `${Math.random() * (window.innerHeight - 128)}px`
            miniWizard.style.animationDelay = `${Math.random() * 2}s`
            miniWizard.innerHTML = `
              <div class="relative w-full h-full">
                <img src="/examples/complete_wizard.png" alt="Mini Wizard" class="w-full h-full object-contain" />
                <div class="absolute top-0 left-1/2 -translate-x-1/2 text-2xl animate-pulse">✨</div>
              </div>
            `
            miniWizard.onclick = () => {
              miniWizard.style.transform = 'scale(2) rotate(720deg)'
              miniWizard.style.opacity = '0'
              miniWizard.style.transition = 'all 0.5s'
              setTimeout(() => miniWizard.remove(), 500)
              
              // Spawn sparkles
              const rect = miniWizard.getBoundingClientRect()
              for (let j = 0; j < 5; j++) {
                const sparkle = document.createElement('div')
                sparkle.className = 'fixed w-2 h-2 bg-magic-yellow rounded-full animate-sparkle'
                sparkle.style.left = rect.left + rect.width / 2 + 'px'
                sparkle.style.top = rect.top + rect.height / 2 + 'px'
                document.body.appendChild(sparkle)
                setTimeout(() => sparkle.remove(), 1000)
              }
            }
            document.body.appendChild(miniWizard)
            setTimeout(() => miniWizard.remove(), 10000)
          }, i * 200)
        }
        break
      case 10:
        // Ultimate mode
        setWizardState('ultimate')
        console.log('%c🚀 ULTIMATE WIZARD MODE ACTIVATED!', 'color: #ff0000; font-size: 30px; font-weight: bold;')
        document.dispatchEvent(new CustomEvent('activateSuperWizardMode'))
        setTimeout(() => setWizardState('normal'), 5000)
        break
    }
  }, [clickCount])

  const handleClick = (e: React.MouseEvent) => {
    // Visual click feedback
    setClickFeedback(true)
    setTimeout(() => setClickFeedback(false), 100)
    
    // Create sparkles at click position
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    const newSparkles = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100
    }))
    setSparkles(prev => [...prev, ...newSparkles])
    
    // Remove sparkles after animation
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)))
    }, 1000)
    
    // Call parent onClick
    onClick()
  }

  return (
    <div 
      id="mainWizard"
      className={`relative w-[500px] h-[500px] animate-float cursor-pointer transition-all hover:scale-105 hover:-rotate-[5deg] ${
        isSuper ? 'animate-pulse-crazy' : ''
      } ${wizardState === 'ultimate' ? 'animate-spin' : ''} ${
        clickFeedback ? 'scale-95' : ''
      }`}
      onClick={handleClick}
      style={{
        filter: wizardState === 'magical' ? 'drop-shadow(0 0 30px #f3ff00)' : 
                wizardState === 'ultimate' ? 'drop-shadow(0 0 50px #ff0000) hue-rotate(180deg)' : 
                wizardState === 'overdosed' ? 'drop-shadow(0 0 100px #ff00ff) contrast(2)' : '',
        transition: 'filter 0.3s ease-in-out, transform 0.1s ease-in-out'
      }}
    >
      <div className={`relative w-full h-full ${isSuper ? 'animate-rainbow-glow' : ''}`}>
        {/* Complete wizard image */}
        <div className="absolute inset-0 z-[1] flex items-center justify-center" style={{ transform: 'translateX(20px)' }}>
          <Image 
            src="/examples/complete_wizard.png" 
            alt="Bitcoin Wizard" 
            width={548}
            height={548}
            className="object-contain w-full h-full" 
            priority
            style={{
              filter: isSuper ? 'hue-rotate(270deg) saturate(2)' : ''
            }}
          />
        </div>
        
        {/* Fire overlay - animated separately */}
        <div className="absolute inset-0 z-[7] opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" style={{ transform: 'translateX(20px)' }}>
          <Image 
            src="/examples/parts/lefthand/fire.png" 
            alt="Fire" 
            fill 
            className="object-contain animate-pulse"
          />
        </div>
        
        {/* Clickable mouth area for pill overdose easter egg */}
        <div 
          className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-20 h-20 z-[10] cursor-pointer hover:scale-110 transition-transform"
          onClick={handleMouthClick}
          title="Click 3 times for a surprise!"
        />
      </div>
      
      {/* Pill Spinner Overlay */}
      {showPillSpinner && (
        <div className="absolute inset-0 flex items-center justify-center z-[20]">
          <div className="bg-black/70 rounded-full p-8 border-4 border-magic-yellow animate-pulse">
            <PillSpinner size={200} pillCount={20} speed={3} />
          </div>
        </div>
      )}
      
      {/* Sparkles */}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute w-4 h-4 bg-magic-yellow rounded-full pointer-events-none"
          style={{ 
            left: `${250 + sparkle.x}px`, 
            top: `${250 + sparkle.y}px`,
            boxShadow: '0 0 10px #f3ff00, 0 0 20px #f3ff00',
            animation: 'sparkle 1s ease-out forwards'
          }}
        />
      ))}
      
      {/* Message Bubble */}
      {message && (
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-[30]">
          <div className="bg-white px-6 py-3 border-4 border-wizard-black rounded-[20px] font-derp text-2xl whitespace-nowrap animate-bounce shadow-[5px_5px_0_#040104]">
            {message}
          </div>
          <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white"></div>
        </div>
      )}
      
      {/* Power-up effects */}
      {isSuper && (
        <>
          <div className="absolute inset-0 animate-pulse pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 opacity-30 blur-xl"></div>
          </div>
          <div className="absolute -inset-8 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-4xl animate-float"
                style={{
                  left: `${50 + 40 * Math.cos(i * Math.PI / 4)}%`,
                  top: `${50 + 40 * Math.sin(i * Math.PI / 4)}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.2}s`
                }}
              >
                ✨
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}