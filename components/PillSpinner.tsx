'use client'

import { useEffect, useRef } from 'react'

interface PillSpinnerProps {
  size?: number
  pillCount?: number
  speed?: number
}

export default function PillSpinner({ size = 100, pillCount = 10, speed = 1 }: PillSpinnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    // Clear existing pills
    containerRef.current.innerHTML = ''
    
    // Create spinning pills
    for (let i = 0; i < pillCount; i++) {
      const pill = document.createElement('div')
      pill.className = 'absolute'
      pill.style.width = '40px'
      pill.style.height = '40px'
      pill.style.left = '50%'
      pill.style.top = '50%'
      
      const angle = (360 / pillCount) * i
      const radius = size / 2
      
      // Create pill image
      const img = document.createElement('img')
      img.src = '/assets/pill.png'
      img.className = 'w-full h-full object-contain'
      img.style.filter = `hue-rotate(${angle}deg) drop-shadow(0 0 10px #ff00ff)`
      img.style.animation = `pill-spin ${2 / speed}s linear infinite`
      
      pill.appendChild(img)
      
      pill.style.transform = `
        translate(-50%, -50%) 
        rotate(${angle}deg) 
        translateX(${radius}px) 
        rotate(-${angle}deg)
      `
      
      containerRef.current.appendChild(pill)
    }
    
    // Animate rotation
    let rotation = 0
    let animationId: number
    const animate = () => {
      rotation += speed
      if (containerRef.current) {
        containerRef.current.style.transform = `rotate(${rotation}deg)`
      }
      animationId = requestAnimationFrame(animate)
    }
    animate()
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [size, pillCount, speed])
  
  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{
        width: size,
        height: size,
        animation: `pulse-crazy ${2 / speed}s ease-in-out infinite`
      }}
    />
  )
}