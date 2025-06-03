'use client'

import { useEffect, useState, useRef } from 'react'

export default function CursorTrail() {
  const [intensity, setIntensity] = useState(1)
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)
  
  useEffect(() => {
    let mouseX = 0, mouseY = 0
    let lastMouseX = 0, lastMouseY = 0
    let moveCount = 0
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      moveCount++
      
      // Increase intensity over time
      if (moveCount % 100 === 0) {
        setIntensity(prev => Math.min(prev + 0.1, 5))
      }
    }
    
    const createMagicTrail = () => {
      const now = Date.now()
      // Throttle trail creation to 50ms minimum
      if (now - lastUpdateRef.current < 50) {
        animationFrameRef.current = requestAnimationFrame(createMagicTrail)
        return
      }
      
      if (Math.abs(mouseX - lastMouseX) > 2 || Math.abs(mouseY - lastMouseY) > 2) {
        lastUpdateRef.current = now
        
        // Create particles using DocumentFragment for better performance
        const fragment = document.createDocumentFragment()
        
        // Create more particles based on intensity
        for (let i = 0; i < Math.floor(3 * intensity); i++) {
          setTimeout(() => {
            const particleType = Math.random()
            
            if (particleType < 0.4) {
              // Sparkle
              const sparkle = document.createElement('div')
              sparkle.className = 'fixed w-3 h-3 bg-magic-yellow rounded-full pointer-events-none z-cursor will-change-transform'
              sparkle.style.left = (mouseX + Math.random() * 20 - 10) + 'px'
              sparkle.style.top = (mouseY + Math.random() * 20 - 10) + 'px'
              sparkle.style.boxShadow = `0 0 ${6 * intensity}px #f3ff00`
              sparkle.style.animation = 'explode 1s ease-out forwards'
              sparkle.style.transform = 'translateZ(0)'
              document.body.appendChild(sparkle)
              setTimeout(() => sparkle.remove(), 1000)
            } else if (particleType < 0.7) {
              // Star
              const star = document.createElement('div')
              star.className = 'fixed text-2xl pointer-events-none z-cursor will-change-transform'
              star.innerHTML = '✨'
              star.style.left = (mouseX + Math.random() * 30 - 15) + 'px'
              star.style.top = (mouseY + Math.random() * 30 - 15) + 'px'
              star.style.fontSize = (20 + intensity * 5) + 'px'
              star.style.animation = 'starFloat 1.5s ease-out forwards'
              star.style.setProperty('--sx', `${Math.random() * 100 - 50}px`)
              star.style.transform = 'translateZ(0)'
              document.body.appendChild(star)
              setTimeout(() => star.remove(), 1500)
            } else if (particleType < 0.9) {
              // Bitcoin symbol
              const bitcoin = document.createElement('div')
              bitcoin.className = 'fixed text-xl text-bitcoin-orange pointer-events-none z-cursor will-change-transform'
              bitcoin.textContent = '₿'
              bitcoin.style.left = mouseX + 'px'
              bitcoin.style.top = mouseY + 'px'
              bitcoin.style.animation = 'spin 1s linear infinite, starFloat 2s ease-out forwards'
              bitcoin.style.setProperty('--sx', `${Math.random() * 200 - 100}px`)
              bitcoin.style.transform = 'translateZ(0)'
              document.body.appendChild(bitcoin)
              setTimeout(() => bitcoin.remove(), 2000)
            } else {
              // Rare pill
              const pill = document.createElement('div')
              pill.className = 'fixed text-2xl pointer-events-none z-cursor will-change-transform'
              pill.textContent = '💊'
              pill.style.left = mouseX + 'px'
              pill.style.top = mouseY + 'px'
              pill.style.animation = 'pill-spin 1s ease-out, starFloat 2s ease-out forwards'
              pill.style.setProperty('--sx', `${Math.random() * 150 - 75}px`)
              pill.style.transform = 'translateZ(0)'
              document.body.appendChild(pill)
              setTimeout(() => pill.remove(), 2000)
            }
          }, i * 20)
        }
        
        lastMouseX = mouseX
        lastMouseY = mouseY
      }
      
      animationFrameRef.current = requestAnimationFrame(createMagicTrail)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    animationFrameRef.current = requestAnimationFrame(createMagicTrail)
    
    // Show intensity indicator
    if (intensity > 2) {
      console.log(`%c🔥 Trail intensity: ${intensity.toFixed(1)}x`, 'color: #ff6600; font-size: 16px;')
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [intensity])
  
  return null
}