'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

export default function MimTicker() {
  const [clickCount, setClickCount] = useState(0)
  const [isGlowing, setIsGlowing] = useState(false)
  const [isExploding, setIsExploding] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()

  const createPillRainStorm = () => {
    console.log('%c💊 PILL RAIN STORM ACTIVATED! 💊', 'color: #ff00ff; font-size: 30px;')
    
    setIsExploding(true)
    
    // Create pill rain container
    const rainContainer = document.createElement('div')
    rainContainer.className = 'fixed inset-0 pointer-events-none z-pills overflow-hidden'
    document.body.appendChild(rainContainer)
    
    // Rainbow background effect
    document.body.style.animation = 'rainbow-background 3s linear infinite'
    
    // Create message
    const message = document.createElement('div')
    message.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl md:text-8xl font-derp text-white z-[99999] pointer-events-none animate-pulse'
    message.style.textShadow = '0 0 50px #ff00ff, 5px 5px 0 #f3ff00, 10px 10px 0 #67d1e3, -5px -5px 0 #ff0000'
    message.textContent = 'WELCOME TO THE ASYLUM!'
    document.body.appendChild(message)
    
    // Create waves of pills
    const waves = 5
    const pillsPerWave = 30
    
    for (let wave = 0; wave < waves; wave++) {
      setTimeout(() => {
        for (let i = 0; i < pillsPerWave; i++) {
          setTimeout(() => {
            const pill = document.createElement('div')
            pill.className = 'absolute w-16 h-16 animate-pill-fall'
            pill.style.left = Math.random() * 100 + '%'
            pill.style.top = '-100px'
            pill.style.animationDuration = (3 + Math.random() * 2) + 's'
            pill.style.animationDelay = Math.random() * 0.5 + 's'
            pill.style.zIndex = '10000'
            
            // Create spinning wrapper
            const spinner = document.createElement('div')
            spinner.className = 'w-full h-full animate-spin'
            spinner.style.animationDuration = (1 + Math.random() * 2) + 's'
            
            // Add pill image
            const img = document.createElement('img')
            img.src = '/assets/pill.png'
            img.className = 'w-full h-full object-contain drop-shadow-[0_0_10px_#ff00ff]'
            img.style.filter = `hue-rotate(${Math.random() * 360}deg)`
            
            spinner.appendChild(img)
            pill.appendChild(spinner)
            rainContainer.appendChild(pill)
            
            // Remove after animation
            setTimeout(() => pill.remove(), 6000)
          }, i * 50)
        }
      }, wave * 800)
    }
    
    // Speed up matrix rain
    document.dispatchEvent(new CustomEvent('matrixIntensityBoost', { detail: { boost: 5 } }))
    
    // Clean up
    setTimeout(() => {
      rainContainer.remove()
      message.remove()
      document.body.style.animation = ''
      setIsExploding(false)
      setClickCount(0)
      document.dispatchEvent(new CustomEvent('matrixIntensityBoost', { detail: { boost: 1 } }))
    }, 8000)
  }

  const handleClick = () => {
    if (isExploding) return
    
    setClickCount(prev => prev + 1)
    setIsGlowing(true)
    
    if (timerRef.current) clearTimeout(timerRef.current)
    
    // Enhanced visual feedback
    const ticker = document.getElementById('mim-ticker')
    if (ticker) {
      ticker.style.transform = `scale(${1 + (clickCount + 1) * 0.08}) rotate(${-5 - (clickCount + 1) * 3}deg)`
      ticker.style.filter = `brightness(${1 + (clickCount + 1) * 0.1})`
      setTimeout(() => {
        ticker.style.transform = 'scale(1) rotate(-5deg)'
        ticker.style.filter = ''
      }, 200)
    }
    
    if (clickCount + 1 === 7) {
      createPillRainStorm()
    }
    
    timerRef.current = setTimeout(() => {
      setIsGlowing(false)
    }, 300)
    
    if (clickCount < 6) {
      timerRef.current = setTimeout(() => {
        setClickCount(0)
        console.log(`%c💡 Hint: ${7 - clickCount} more clicks for pill storm...`, 'color: #67d1e3; font-size: 14px;')
      }, 5000)
    }
  }

  return (
    <div 
      id="mim-ticker"
      onClick={handleClick}
      className={`fixed top-5 left-5 bg-wizard-highlight px-8 py-4 border-4 border-wizard-black rounded-[10px] text-3xl md:text-4xl font-derp -rotate-[5deg] z-ui cursor-pointer transition-all ${
        isGlowing ? 'shadow-[0_0_40px_#f3ff00]' : ''
      } ${isExploding ? 'animate-bounce' : ''} hover:scale-110 hover:shadow-[0_0_20px_#f3ff00]`}
      style={{
        transform: 'rotate(-5deg)',
        transition: 'all 0.2s ease-out'
      }}
    >
      $MIM
      {clickCount > 0 && clickCount < 7 && (
        <span className="absolute -top-3 -right-3 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold animate-pulse shadow-[0_0_20px_#ff0000]">
          {clickCount}
        </span>
      )}
    </div>
  )
}