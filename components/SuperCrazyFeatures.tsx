'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import PillSpinner from './PillSpinner'

// Extend Window interface
declare global {
  interface Window {
    wizardMode?: () => string
    pillTime?: () => string
    loadTime?: number
  }
}

export default function SuperCrazyFeatures() {
  const [chaosLevel, setChaosLevel] = useState(0)
  const [pillsCollected, setPillsCollected] = useState(0)
  const [showPillReward, setShowPillReward] = useState(false)
  const chaosIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Optimized single pill spawner
  const spawnSinglePill = useCallback(() => {
    const pill = document.createElement('div')
    pill.className = 'fixed cursor-pointer z-pills'
    pill.style.left = Math.random() * window.innerWidth + 'px'
    pill.style.top = '-100px'
    pill.style.width = '60px'
    pill.style.height = '60px'
    
    // Create pill image
    const img = document.createElement('img')
    img.src = '/assets/pill.png'
    img.className = 'w-full h-full object-contain'
    img.style.filter = `drop-shadow(0 0 15px #ff00ff) hue-rotate(${Math.random() * 360}deg)`
    img.style.animation = `pill-spin ${Math.random() * 2 + 1}s linear infinite`
    
    pill.appendChild(img)
    
    // Falling animation
    pill.style.animation = `pill-fall ${Math.random() * 5 + 5}s linear`
    
    // Make pills interactive
    pill.onclick = () => {
      // Prevent multiple clicks
      if (pill.dataset.clicked) return
      pill.dataset.clicked = 'true'
      
      // Stop falling
      pill.style.animation = 'none'
      
      // Explosion effect
      img.style.animation = 'explode 0.5s ease-out forwards'
      
      // Spawn mini pills
      for (let j = 0; j < 5; j++) {
        const miniPill = document.createElement('img')
        miniPill.src = '/assets/pill.png'
        miniPill.className = 'fixed w-8 h-8 z-pills pointer-events-none'
        miniPill.style.left = pill.style.left
        miniPill.style.top = pill.getBoundingClientRect().top + 'px'
        miniPill.style.animation = `pill-explosion 1s ease-out forwards`
        miniPill.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`)
        miniPill.style.setProperty('--y', `${(Math.random() - 0.5) * 200}px`)
        miniPill.style.animationDelay = `${j * 0.1}s`
        document.body.appendChild(miniPill)
        setTimeout(() => miniPill.remove(), 1000)
      }
      
      setTimeout(() => pill.remove(), 500)
      
      // Random effect
      const effects = [
        () => {
          document.body.style.filter = 'hue-rotate(180deg)'
          setTimeout(() => document.body.style.filter = '', 1000)
        },
        () => {
          document.body.classList.add('animate-screen-shake')
          setTimeout(() => document.body.classList.remove('animate-screen-shake'), 1000)
        },
        () => spawnRainbowText('OPEN YOUR MOUTH!'),
        () => console.log('%c💊 +100 WIZARD POINTS!', 'color: #ff00ff; font-size: 20px;'),
      ]
      effects[Math.floor(Math.random() * effects.length)]()
      
      // Dispatch custom event for pill collection
      document.dispatchEvent(new Event('matrixPillCollected'))
    }
    
    document.body.appendChild(pill)
    
    // Remove pill after animation completes
    setTimeout(() => {
      if (pill.parentElement) pill.remove()
    }, 10000)
  }, [])
  
  const spawnPillRain = useCallback((count: number) => {
    // Use requestAnimationFrame for better performance
    let spawned = 0
    const spawnNext = () => {
      if (spawned < count) {
        spawnSinglePill()
        spawned++
        if (spawned < count) {
          requestAnimationFrame(() => {
            setTimeout(spawnNext, 100) // Delay between pills
          })
        }
      }
    }
    spawnNext()
  }, [spawnSinglePill])
  
  const spawnRainbowText = useCallback((text: string) => {
    const rainbow = document.createElement('div')
    rainbow.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-derp z-[99999] pointer-events-none'
    rainbow.textContent = text
    rainbow.style.animation = 'rainbow-glow 1s ease-in-out, text-3d 2s ease-in-out'
    document.body.appendChild(rainbow)
    setTimeout(() => rainbow.remove(), 2000)
  }, [])
  
  const randomizeWizard = useCallback(() => {
    document.querySelectorAll('[class*="wizard-"]').forEach(el => {
      if (el.tagName === 'IMG') {
        (el as HTMLElement).style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${Math.random() * 2 + 0.5})`
      }
    })
  }, [])
  
  const speakWizdom = useCallback(() => {
    const wisdoms = [
      "HODL is the way",
      "Magic Internet Money is real",
      "Pills make wizards stronger",
      "MS Paint is the only true art",
      "Bitcoin Wizards never sell",
      "The moon is just the beginning",
      "In code we trust"
    ]
    const wisdom = wisdoms[Math.floor(Math.random() * wisdoms.length)]
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(wisdom)
      utterance.pitch = 0.5
      utterance.rate = 0.8
      utterance.volume = 0.5
      speechSynthesis.speak(utterance)
    }
    
    spawnRainbowText(wisdom)
  }, [spawnRainbowText])
  
  const activateMaximumChaos = useCallback(() => {
    console.log('%c🤯 MAXIMUM CHAOS ACTIVATED!!! 🤯', 'color: #ff0000; font-size: 50px; animation: chaos-mode 1s infinite;')
    
    // 0. INTENSE SCREEN SHAKING
    document.body.classList.add('animate-screen-shake')
    const shakeInterval = setInterval(() => {
      document.body.classList.remove('animate-screen-shake')
      setTimeout(() => {
        document.body.classList.add('animate-screen-shake')
        // Random intensity shaking
        document.body.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) rotate(${Math.random() * 4 - 2}deg)`
        setTimeout(() => {
          document.body.style.transform = ''
        }, 100)
      }, 100)
    }, 2000)
    
    // 1. Selective spinning (not everything for performance)
    document.querySelectorAll('h1, h2, h3, .nav-btn, .join-btn').forEach((el, i) => {
      if (Math.random() > 0.5) {
        setTimeout(() => {
          (el as HTMLElement).style.animation = `spin ${Math.random() * 2 + 1}s linear infinite`
        }, i * 50)
      }
    })
    
    // 2. Rainbow everything
    document.body.style.animation = 'rainbow-background 1s linear infinite, chaos-mode 0.5s linear infinite'
    
    // 3. Glitch text everywhere
    document.querySelectorAll('h1, h2, h3, p').forEach(el => {
      el.classList.add('glitch-text')
      ;(el as HTMLElement).setAttribute('data-text', el.textContent || '')
    })
    
    // 4. MASSIVE PILL STORM
    let pillCount = 0
    const maxPills = 100 // Limit for performance
    const pillInterval = setInterval(() => {
      if (pillCount >= maxPills) {
        clearInterval(pillInterval)
        return
      }
      
      spawnSinglePill()
      pillCount++
    }, 100)
    
    // 6. Random explosions (limited for performance)
    const explosionInterval = setInterval(() => {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      
      const explosion = document.createElement('div')
      explosion.className = 'fixed text-8xl z-effects pointer-events-none'
      explosion.innerHTML = '💥'
      explosion.style.left = x + 'px'
      explosion.style.top = y + 'px'
      explosion.style.transform = 'translate(-50%, -50%)'
      explosion.style.animation = 'explode 1s ease-out forwards'
      document.body.appendChild(explosion)
      setTimeout(() => explosion.remove(), 1000)
    }, 3000)
    
    // 7. Voice chaos (optional - respect user settings)
    let voiceInterval: NodeJS.Timeout | null = null
    if ('speechSynthesis' in window && chaosLevel >= 10) {
      const messages = ['CHAOS', 'PILLS', 'WIZARD', 'HODL', 'MOON']
      voiceInterval = setInterval(() => {
        const utterance = new SpeechSynthesisUtterance(messages[Math.floor(Math.random() * messages.length)])
        utterance.pitch = Math.random() * 2
        utterance.rate = 2
        utterance.volume = 0.3
        speechSynthesis.speak(utterance)
      }, 5000)
    }
    
    // 8. Giant pill cursor
    const existingCursor = document.querySelector('.giant-cursor')
    if (!existingCursor) {
      document.body.style.cursor = 'none'
      const cursor = document.createElement('div')
      cursor.className = 'fixed w-32 h-32 pointer-events-none z-cursor giant-cursor'
      cursor.innerHTML = '<img src="/assets/pill.png" class="w-full h-full animate-spin" />'
      document.body.appendChild(cursor)
      
      const moveCursor = (e: MouseEvent) => {
        cursor.style.left = e.clientX - 64 + 'px'
        cursor.style.top = e.clientY - 64 + 'px'
      }
      
      document.addEventListener('mousemove', moveCursor)
    }
    
    // Clean up after 30 seconds to prevent performance issues
    setTimeout(() => {
      clearInterval(shakeInterval)
      clearInterval(pillInterval)
      clearInterval(explosionInterval)
      if (voiceInterval) clearInterval(voiceInterval)
      console.log('%c🧙‍♂️ Chaos subsiding... for now...', 'color: #67d1e3; font-size: 20px;')
    }, 30000)
  }, [chaosLevel, spawnSinglePill])
  
  const increaseChaos = useCallback(() => {
    setChaosLevel(prev => {
      const newLevel = Math.min(prev + 1, 10)
      console.log(`%c🌀 CHAOS LEVEL: ${newLevel}/10`, 'color: #ff00ff; font-size: 20px;')
      
      // Progressive chaos effects
      switch(newLevel) {
        case 1:
          // Subtle floating for all elements
          document.querySelectorAll('h1, h2, h3, p').forEach((el, i) => {
            if (!(el as HTMLElement).style.animation) {
              (el as HTMLElement).style.animation = `float ${3 + Math.random() * 2}s ease-in-out infinite`
              ;(el as HTMLElement).style.animationDelay = `${i * 0.1}s`
            }
          })
          break
          
        case 2:
          // Add slight rotation to sections
          document.querySelectorAll('section').forEach((el, i) => {
            (el as HTMLElement).style.transform = `rotate(${(Math.random() - 0.5) * 2}deg)`
            ;(el as HTMLElement).style.transition = 'transform 2s ease-in-out'
          })
          break
          
        case 3:
          // Subtle color shifts
          document.body.style.animation = 'chaos-mode 10s linear infinite'
          break
          
        case 4:
          // More pills start appearing
          if (!chaosIntervalRef.current) {
            chaosIntervalRef.current = setInterval(() => {
              if (Math.random() > 0.7) spawnSinglePill()
            }, 5000)
          }
          break
          
        case 5:
          // Background starts pulsing
          document.body.classList.add('animate-pulse-bg')
          // Random element wobbling
          document.querySelectorAll('.nav-btn, .join-btn').forEach(el => {
            (el as HTMLElement).style.animation = 'float 1s ease-in-out infinite'
          })
          break
          
        case 6:
          // Text starts glitching occasionally
          setInterval(() => {
            const elements = document.querySelectorAll('h1, h2, h3')
            const randomEl = elements[Math.floor(Math.random() * elements.length)]
            randomEl.classList.add('glitch-text')
            ;(randomEl as HTMLElement).setAttribute('data-text', randomEl.textContent || '')
            setTimeout(() => randomEl.classList.remove('glitch-text'), 2000)
          }, 3000)
          break
          
        case 7:
          // Everything starts rotating slowly
          document.documentElement.style.animation = 'chaos-mode 5s linear infinite'
          // More intense floating
          document.querySelectorAll('*').forEach((el, i) => {
            if (Math.random() > 0.9 && !(el as HTMLElement).style.animation) {
              (el as HTMLElement).style.animation = `float ${2 + Math.random()}s ease-in-out infinite`
            }
          })
          break
          
        case 8:
          // Periodic screen shakes
          setInterval(() => {
            document.body.classList.add('animate-screen-shake')
            setTimeout(() => document.body.classList.remove('animate-screen-shake'), 500)
          }, 4000)
          break
          
        case 9:
          // Almost maximum chaos - everything wobbles
          document.querySelectorAll('div, p, h1, h2, h3').forEach((el, i) => {
            if (Math.random() > 0.5) {
              (el as HTMLElement).style.animation = `pulse-crazy ${Math.random() * 2 + 1}s ease-in-out infinite`
            }
          })
          break
          
        case 10:
          console.log('%c🤯 MAXIMUM CHAOS ACHIEVED!', 'color: #ff0000; font-size: 40px; animation: text-3d 2s infinite;')
          activateMaximumChaos()
          break
      }
      
      return newLevel
    })
  }, [spawnSinglePill, activateMaximumChaos])
  
  const activateUltimatePower = useCallback(() => {
    console.log('%c⚡ UNLIMITED POWER!!! ⚡', 'color: #ffff00; font-size: 50px; text-shadow: 0 0 20px #ffff00;')
    
    document.body.classList.add('animate-screen-shake')
    
    // Create epic announcement
    const announcement = document.createElement('div')
    announcement.className = 'fixed inset-0 flex items-center justify-center z-[99999] pointer-events-none'
    announcement.innerHTML = `
      <div class="text-8xl font-derp text-magic-yellow animate-pulse" style="text-shadow: 0 0 50px #f3ff00, 0 0 100px #f3ff00;">
        UNLIMITED POWER!!!
      </div>
    `
    document.body.appendChild(announcement)
    
    // Laser show (limited for performance)
    for (let i = 0; i < 5; i++) {
      const laser = document.createElement('div')
      laser.className = 'fixed h-1 bg-red-500 z-[99998]'
      laser.style.width = '100vw'
      laser.style.top = Math.random() * 100 + '%'
      laser.style.left = '-100vw'
      laser.style.animation = 'laser-shoot 0.5s ease-out forwards'
      laser.style.animationDelay = i * 0.1 + 's'
      document.body.appendChild(laser)
      setTimeout(() => laser.remove(), 1000)
    }
    
    // Spawn controlled amount of pills
    for (let i = 0; i < 30; i++) {
      setTimeout(() => spawnSinglePill(), i * 100)
    }
    
    setTimeout(() => {
      document.body.classList.remove('animate-screen-shake')
      announcement.remove()
    }, 5000)
  }, [spawnSinglePill])
  
  // Initialize loadTime on mount
  useEffect(() => {
    window.loadTime = Date.now()
  }, [])

  useEffect(() => {
    // Console art and hints
    console.log('%c' + `
╔══════════════════════════════════════════════════════╗
║                                                      ║
║     🧙‍♂️  BITCOIN WIZARDS CONSOLE  🧙‍♂️              ║
║                                                      ║
║     Welcome to the secret wizard terminal!           ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
    `, 'color: #f3ff00; background: #040104; font-size: 16px; font-family: monospace;')
    
    console.log('%c🎮 HIDDEN FEATURES:', 'color: #6ef405; font-size: 20px; font-weight: bold;')
    console.log('%c• Click wizard multiple times for different effects', 'color: #67d1e3; font-size: 14px;')
    console.log('%c• Press "P" to make it rain pills 💊', 'color: #67d1e3; font-size: 14px;')
    console.log('%c• Press "R" to randomize wizard colors', 'color: #67d1e3; font-size: 14px;')
    console.log('%c• Press "C" to increase CHAOS MODE', 'color: #67d1e3; font-size: 14px;')
    console.log('%c• Click $MIM ticker 7 times for pill stash', 'color: #67d1e3; font-size: 14px;')
    console.log('%c• Type "wizardMode()" for magic', 'color: #67d1e3; font-size: 14px;')
    console.log('%c• Type "pillTime()" for pill party', 'color: #67d1e3; font-size: 14px;')
    console.log('%c• Konami Code: ↑↑↓↓←→←→BA for ULTIMATE POWER', 'color: #f09f00; font-size: 14px;')
    
    // Global functions
    window.wizardMode = () => {
      console.log('%c🧙‍♂️ WIZARD MODE ACTIVATED!', 'color: #f3ff00; font-size: 30px;')
      document.body.style.animation = 'chaos-mode 2s linear infinite'
      setTimeout(() => {
        document.body.style.animation = ''
      }, 10000)
      return '✨ May your magic be strong and your hodl be forever! ✨'
    }
    
    window.pillTime = () => {
      console.log('%c💊 PILL PARTY TIME! 💊', 'color: #ff00ff; font-size: 30px;')
      // Actually spawn clickable pills
      for (let i = 0; i < 50; i++) {
        setTimeout(() => spawnSinglePill(), i * 100)
      }
      return '🌈 Pills everywhere! Click them for surprises! 🌈'
    }
    
    // Keyboard handlers
    let konamiCode: string[] = []
    const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    
    const handleKeydown = (e: KeyboardEvent) => {
      // Konami code
      konamiCode.push(e.key)
      konamiCode = konamiCode.slice(-10)
      
      if (konamiCode.join(',') === konamiPattern.join(',')) {
        activateUltimatePower()
      }
      
      // Individual key effects
      switch(e.key.toLowerCase()) {
        case 'p':
          for (let i = 0; i < 20; i++) {
            setTimeout(() => spawnSinglePill(), i * 100)
          }
          break
        case 'r':
          randomizeWizard()
          break
        case 'c':
          increaseChaos()
          break
        case 'w':
          console.log('%c🧙‍♂️ Wizard says: HODL!', 'color: #f3ff00; font-size: 20px;')
          speakWizdom()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeydown)
    
    // Chaos timer - site gets crazier over time (less frequent checks for performance)
    const chaosTimer = setInterval(() => {
      const timeOnSite = Date.now() - (window.loadTime || Date.now())
      if (timeOnSite > 60000 && chaosLevel < 10) { // After 1 minute
        setChaosLevel(prev => {
          const newLevel = Math.min(prev + 1, 10)
          if (newLevel === 5) {
            console.log('%c⚠️ CHAOS LEVEL INCREASING...', 'color: #ff0000; font-size: 20px;')
          }
          return newLevel
        })
      }
    }, 30000)
    
    // Listen for custom events
    const handleSuperMode = () => activateUltimatePower()
    document.addEventListener('activateSuperWizardMode', handleSuperMode)
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('activateSuperWizardMode', handleSuperMode)
      clearInterval(chaosTimer)
      if (chaosIntervalRef.current) {
        clearInterval(chaosIntervalRef.current)
      }
      // Clean up any ongoing animations
      document.body.style.animation = ''
      document.body.style.transform = ''
      document.body.classList.remove('animate-screen-shake', 'animate-screen-shake-intense', 'animate-pulse-bg')
      
      // Remove global functions
      delete window.wizardMode
      delete window.pillTime
    }
  }, [chaosLevel, spawnSinglePill, randomizeWizard, increaseChaos, speakWizdom, activateUltimatePower])
  
  // Pill collection rewards
  useEffect(() => {
    const handlePillCollection = () => {
      setPillsCollected(prev => {
        const newCount = prev + 1
        console.log(`%c💊 Pills collected: ${newCount}`, 'color: #ff00ff; font-size: 16px;')
        
        // Show spinner reward every 5 pills
        if (newCount % 5 === 0) {
          setShowPillReward(true)
          setTimeout(() => setShowPillReward(false), 3000)
        }
        
        if (newCount === 10) {
          console.log('%c🏆 PILL COLLECTOR ACHIEVEMENT!', 'color: #ffff00; font-size: 20px;')
          document.body.style.animation = 'rainbow-background 3s linear'
          setTimeout(() => {
            document.body.style.animation = ''
          }, 3000)
        }
        
        if (newCount === 50) {
          console.log('%c💊 PILL MASTER STATUS! 💊', 'color: #ff00ff; font-size: 30px;')
          activateMaximumChaos()
        }
        
        return newCount
      })
    }
    
    document.addEventListener('matrixPillCollected', handlePillCollection)
    return () => document.removeEventListener('matrixPillCollected', handlePillCollection)
  }, [activateMaximumChaos])
  
  return (
    <>
      {chaosLevel > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-ui">
          <div className="bg-wizard-black text-magic-yellow px-6 py-2 rounded-full border-2 border-magic-yellow font-derp text-xl">
            CHAOS LEVEL: {chaosLevel}/10
          </div>
        </div>
      )}
      
      {showPillReward && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999]">
          <div className="bg-black/80 p-8 rounded-3xl border-4 border-magic-yellow">
            <PillSpinner size={150} pillCount={15} speed={2} />
            <p className="text-2xl font-derp text-magic-yellow mt-4 animate-pulse">
              {pillsCollected} PILLS COLLECTED!
            </p>
          </div>
        </div>
      )}
    </>
  )
}