"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"

interface LoadingScreenProps {
  transparent?: boolean
  show?: boolean
}

export function LoadingScreen({ transparent = false, show = true }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true) // Start visible to ensure min duration covers initial render
  const [opacity, setOpacity] = useState(1)
  const startTimeRef = useRef<number>(Date.now())
  const minDuration = 1500 // 1.5 seconds

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (!show) {
      const elapsedTime = Date.now() - startTimeRef.current
      const remainingTime = Math.max(0, minDuration - elapsedTime)

      timeoutId = setTimeout(() => {
        setOpacity(0) // Start fade out
        setTimeout(() => setIsVisible(false), 500) // Remove from DOM after transition
      }, remainingTime)
    } else {
      setIsVisible(true)
      setOpacity(1)
      startTimeRef.current = Date.now() // Reset timer if shown again
    }

    return () => clearTimeout(timeoutId)
  }, [show])

  if (!isVisible) {
    return null
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ease-out`} style={{ opacity }}>
      {/* Background Layer */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ease-out ${
          transparent 
            ? 'bg-white/80 backdrop-blur-sm' 
            : 'bg-[#1000a3]/90 backdrop-blur-md'
        }`}
      ></div>
      
      {/* Content Layer */}
      <div className="relative flex items-center space-x-6 animate-[float_6s_ease-in-out_infinite]">
        <div className="relative">
          <div className="absolute -inset-6 opacity-25">
            <div className={`w-40 h-40 rounded-full blur-3xl ${transparent ? 'bg-[#1000a3]' : 'bg-white'}`}></div>
          </div>
          <Image
            src="/favicon.ico"
            alt="200 Millas"
            width={96}
            height={96}
            className="relative"
            style={{
              filter: 'none',
              animation: 'pulse 3s ease-in-out infinite'
            }}
          />
        </div>
        <div className="flex items-baseline">
          <span className={`${transparent ? 'text-[#1000a3]' : 'text-white'} font-display font-bold text-5xl`}>Cargando</span>
          <span className="inline-flex space-x-1 ml-2">
            <span className={`${transparent ? 'text-[#1000a3]' : 'text-white'} font-display font-bold text-5xl animate-[dot-bounce_1.2s_ease-in-out_infinite]`}>.</span>
            <span className={`${transparent ? 'text-[#1000a3]' : 'text-white'} font-display font-bold text-5xl animate-[dot-bounce_1.2s_ease-in-out_infinite_0.2s]`}>.</span>
            <span className={`${transparent ? 'text-[#1000a3]' : 'text-white'} font-display font-bold text-5xl animate-[dot-bounce_1.2s_ease-in-out_infinite_0.4s]`}>.</span>
          </span>
        </div>
      </div>
    </div>
  )
}
