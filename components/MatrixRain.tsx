'use client'

import { useEffect, useRef, useState } from 'react'

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [intensity, setIntensity] = useState(1)
  const [pillPositions, setPillPositions] = useState<Array<{x: number, y: number, id: string}>>([])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Matrix characters including pills
    const chars = '₿01MIM♦♠♣♥WIZARDBITCOIN💊🧙‍♂️✨🔮'
    const fontSize = 24 // Bigger for easier clicking
    const columns = Math.floor(canvas.width / fontSize)
    
    // Create rain drops
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }
    
    // Special pill columns
    const pillColumns = new Set<number>()
    for (let i = 0; i < columns / 3; i++) { // More pills!
      pillColumns.add(Math.floor(Math.random() * columns))
    }
    
    // Track pill positions for clicking
    const currentPills: Array<{x: number, y: number, id: string}> = []
    
    // Listen for intensity boost events
    const handleIntensityBoost = (e: CustomEvent) => {
      setIntensity(e.detail.boost)
    }
    document.addEventListener('matrixIntensityBoost', handleIntensityBoost as EventListener)
    
    // Animation function
    const draw = () => {
      // Much lighter background for better visibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.font = `bold ${fontSize}px monospace`
      currentPills.length = 0 // Clear pill positions
      
      for (let i = 0; i < drops.length; i++) {
        const isPillColumn = pillColumns.has(i)
        const char = isPillColumn && Math.random() > 0.3 ? '💊' : 
                     chars[Math.floor(Math.random() * chars.length)]
        
        const x = i * fontSize
        const y = drops[i] * fontSize
        
        // Track pill positions
        if (char === '💊' && y > 0 && y < canvas.height) {
          currentPills.push({ x, y, id: `${i}-${drops[i]}` })
        }
        
        // Much brighter colors with stronger glow
        if (char === '💊') {
          ctx.fillStyle = '#ff00ff'
          ctx.shadowColor = '#ff00ff'
          ctx.shadowBlur = 30
          ctx.filter = 'brightness(1.5)'
        } else if (char === '₿') {
          ctx.fillStyle = '#ff9500'
          ctx.shadowColor = '#ff9500'
          ctx.shadowBlur = 20
          ctx.filter = 'brightness(1.3)'
        } else if (char === '🧙‍♂️' || char === '✨' || char === '🔮') {
          ctx.fillStyle = '#ffff00'
          ctx.shadowColor = '#ffff00'
          ctx.shadowBlur = 20
          ctx.filter = 'brightness(1.3)'
        } else {
          ctx.fillStyle = '#00ff00'
          ctx.shadowColor = '#00ff00'
          ctx.shadowBlur = 15
          ctx.filter = 'brightness(1.2)'
        }
        
        ctx.globalAlpha = 1 // Full opacity
        ctx.fillText(char, x, y)
        
        // Reset drop when it goes off screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
          // Randomly reassign pill columns
          if (Math.random() > 0.8) {
            if (pillColumns.has(i)) {
              pillColumns.delete(i)
            } else {
              pillColumns.add(i)
            }
          }
        }
        
        // Vary drop speed with intensity
        drops[i] += isPillColumn ? 0.3 * intensity : 0.5 * intensity
      }
      
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      ctx.filter = 'none'
      
      // Update pill positions for click detection
      setPillPositions([...currentPills])
    }
    
    const interval = setInterval(draw, 35)
    
    // Increase base intensity over time
    const intensityTimer = setInterval(() => {
      setIntensity(prev => Math.min(prev * 1.1, 5))
    }, 20000)
    
    return () => {
      clearInterval(interval)
      clearInterval(intensityTimer)
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('matrixIntensityBoost', handleIntensityBoost as EventListener)
    }
  }, [intensity])
  
  // Handle pill clicks with larger hit area
  const handleCanvasClick = (e: MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Check if click is near any pill (larger hit area)
    const hitRadius = 30
    const clickedPill = pillPositions.find(pill => 
      Math.abs(pill.x - x) < hitRadius && Math.abs(pill.y - y) < hitRadius
    )
    
    if (clickedPill) {
      // Visual feedback with bigger explosion
      const explosion = document.createElement('div')
      explosion.className = 'fixed z-effects pointer-events-none'
      explosion.innerHTML = `
        <div class="relative">
          <div class="text-8xl animate-explode">💊</div>
          <div class="absolute inset-0 text-8xl animate-explode" style="animation-delay: 0.1s">💥</div>
        </div>
      `
      explosion.style.left = e.clientX + 'px'
      explosion.style.top = e.clientY + 'px'
      explosion.style.transform = 'translate(-50%, -50%)'
      explosion.style.filter = 'drop-shadow(0 0 30px #ff00ff)'
      document.body.appendChild(explosion)
      setTimeout(() => explosion.remove(), 1000)
      
      // Dispatch collection event
      document.dispatchEvent(new CustomEvent('matrixPillCollected'))
      
      console.log('%c💊 Matrix pill collected!', 'color: #ff00ff; font-size: 16px;')
    }
  }
  
  return (
    <canvas 
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="fixed inset-0 cursor-crosshair z-matrix"
      style={{ 
        opacity: 1, // Full opacity
        mixBlendMode: 'screen'
      }}
    />
  )
}