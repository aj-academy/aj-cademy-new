"use client"

import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'

interface DiyaButtonProps {
  className?: string
}

export function DiyaButton({ className = "" }: DiyaButtonProps) {
  const [isLit, setIsLit] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [isDiwaliDay, setIsDiwaliDay] = useState(false)

  // Check if today is Diwali (October 20th, 2025)
  useEffect(() => {
    const today = new Date()
    const diwaliDate = new Date(2025, 9, 20) // October 20th, 2025 (month is 0-indexed)
    
    // Check if it's Diwali day
    const isTodayDiwali = today.getDate() === diwaliDate.getDate() && 
                         today.getMonth() === diwaliDate.getMonth() && 
                         today.getFullYear() === diwaliDate.getFullYear()
    
    setIsDiwaliDay(isTodayDiwali)
  }, [])

  const handleDiyaClick = () => {
    setIsLit(true)
    setShowMessage(true)
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setShowMessage(false)
    }, 5000)
  }

  const getMessage = () => {
    if (isDiwaliDay) {
      return "Wishing you a bright and prosperous Diwali from the AJ Academy family!"
    }
    return "Wishing you advance a bright and prosperous Diwali from the AJ Academy family!"
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Festive Message */}
      {showMessage && (
        <div className="absolute bottom-20 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm animate-pulse">
          <div className="text-sm font-medium text-center">
            {getMessage()}
          </div>
          <div className="absolute bottom-0 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-orange-500"></div>
        </div>
      )}

      {/* Diya Button */}
      <button
        onClick={handleDiyaClick}
        className={`
          relative w-16 h-16 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95
          ${isLit 
            ? 'bg-gradient-to-b from-yellow-300 to-orange-500 shadow-lg shadow-orange-300/50' 
            : 'bg-gradient-to-b from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600'
          }
        `}
        aria-label="Light the Diya"
      >
        {/* Diya Base */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-amber-800 to-orange-900"></div>
        
        {/* Flame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Flame 
            className={`
              w-6 h-6 transition-all duration-500
              ${isLit 
                ? 'text-yellow-200 animate-flicker drop-shadow-lg' 
                : 'text-orange-300 opacity-60'
              }
            `} 
          />
        </div>

        {/* Glow Effect */}
        {isLit && (
          <div className="absolute inset-0 rounded-full bg-yellow-200 opacity-30 animate-pulse"></div>
        )}

        {/* Sparkle Effects */}
        {isLit && (
          <>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute -top-2 left-2 w-1 h-1 bg-orange-300 rounded-full animate-ping animation-delay-200"></div>
            <div className="absolute top-1 -left-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping animation-delay-500"></div>
          </>
        )}
      </button>
    </div>
  )
}

// Custom CSS animations
const styles = `
  @keyframes flicker {
    0%, 100% { opacity: 1; transform: scale(1); }
    25% { opacity: 0.8; transform: scale(1.05); }
    50% { opacity: 0.9; transform: scale(0.95); }
    75% { opacity: 0.85; transform: scale(1.02); }
  }
  
  .animate-flicker {
    animation: flicker 1.5s ease-in-out infinite;
  }
  
  .animation-delay-200 {
    animation-delay: 0.2s;
  }
  
  .animation-delay-500 {
    animation-delay: 0.5s;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
