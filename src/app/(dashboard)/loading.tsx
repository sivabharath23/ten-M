import React from 'react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 space-y-6">
      {/* Modern animated SVG flat/building icon */}
      <div className="relative h-24 w-24 flex items-center justify-center">
        {/* Glow behind building */}
        <div className="absolute inset-0 bg-brand-500/15 blur-2xl rounded-full animate-pulse" />
        
        {/* SVG building representation with animating windows */}
        <svg className="w-14 h-14 text-brand-600 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          {/* Main Building Outline */}
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M3 21h18" 
          />
          {/* Windows / Flats lighting up / pulsing */}
          <rect x="8" y="6" width="3" height="3" rx="0.5" fill="currentColor" className="animate-pulse delay-75 text-brand-500" />
          <rect x="13" y="6" width="3" height="3" rx="0.5" fill="currentColor" className="animate-pulse delay-150 text-indigo-500" />
          <rect x="8" y="11" width="3" height="3" rx="0.5" fill="currentColor" className="animate-pulse delay-300 text-indigo-500" />
          <rect x="13" y="11" width="3" height="3" rx="0.5" fill="currentColor" className="animate-pulse delay-200 text-brand-500" />
          <rect x="8" y="16" width="3" height="3" rx="0.5" fill="currentColor" className="animate-pulse delay-500 text-brand-500" />
          <rect x="13" y="16" width="3" height="3" rx="0.5" fill="currentColor" className="animate-pulse delay-700 text-indigo-500" />
        </svg>
        
        {/* Spinner ring around building */}
        <div className="absolute inset-0 border-2 border-slate-100 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-brand-500 border-r-indigo-500 rounded-full animate-spin duration-1000" />
      </div>
      <div className="text-center space-y-1.5">
        <h3 className="text-sm font-black text-slate-800 tracking-tight">Loading TenM</h3>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Portal...</p>
      </div>
    </div>
  )
}
