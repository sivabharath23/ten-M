'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Internet connection restored! Synced back online.', {
        id: 'offline-toast',
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error('Connection lost. Working offline...', {
        id: 'offline-toast',
        duration: Infinity,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center space-y-6">
        {/* Accent colored line at the top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-t-[32px]" />

        {/* Custom Premium Disconnected SVG */}
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
            {/* Outer glowing circles */}
            <circle cx="60" cy="60" r="50" fill="url(#offlineGlow)" opacity="0.15" className="animate-pulse" />
            <circle cx="60" cy="60" r="42" stroke="url(#offlineStroke)" strokeWidth="1.5" strokeDasharray="6 6" className="animate-[spin_45s_linear_infinite]" />
            
            {/* Main Wifi Off Lines */}
            <path d="M40 65C46.6667 59.3333 53.3333 59.3333 60 65C66.6667 59.3333 73.3333 59.3333 80 65" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            <path d="M30 53C40 43 50 43 60 53C70 43 80 43 90 53" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
            <path d="M20 41C33.3333 27.6667 46.6667 27.6667 60 41C73.3333 27.6667 86.6667 27.6667 100 41" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" opacity="0.2" />
            
            {/* Wifi Dot */}
            <circle cx="60" cy="77" r="5" fill="#ef4444" />
            
            {/* Warning Badge */}
            <g transform="translate(72, 70)">
              <circle cx="10" cy="10" r="9" fill="#ef4444" stroke="white" strokeWidth="1.5" />
              <path d="M10 6.5V11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="13.5" r="0.75" fill="white" />
            </g>

            <defs>
              <radialGradient id="offlineGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="offlineStroke" x1="20" y1="20" x2="100" y2="100">
                <stop stopColor="#ef4444" />
                <stop offset="1" stopColor="#ef4444" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Offline Mode</h3>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">No Internet Connection</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[260px] mx-auto pt-1">
            Please check your local Wi-Fi or cellular network. TenM will automatically reconnect once you are back online.
          </p>
        </div>

        <button
          onClick={() => {
            if (navigator.onLine) {
              setIsOnline(true)
              toast.success('Connection restored!')
            } else {
              toast.error('Still offline. Check your network details.')
            }
          }}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          Check Connection
        </button>
      </div>
    </div>
  )
}
