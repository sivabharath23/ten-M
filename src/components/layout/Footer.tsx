'use client'

import React from 'react'

interface FooterProps {
  className?: string
  variant?: 'light' | 'dark'
}

export function Footer({ className = '', variant = 'light' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const isDark = variant === 'dark'

  return (
    <footer className={`mt-auto pt-3 pb-2 border-t ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200/80 text-slate-500'} text-[11px] no-print print:hidden ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-center sm:text-left">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className={`font-bold text-xs tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Ten<span className="text-brand-500">M</span>
          </span>
          <span className={isDark ? 'text-slate-800' : 'text-slate-300'}>|</span>
          <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium text-[11px]`}>
            Smart Property & Tenant Management
          </span>
        </div>

        {/* Developer Credit & Copyright */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className={`flex items-center gap-1 font-medium whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>Developed by</span>
            <span className={`font-bold ${isDark ? 'text-slate-200 bg-slate-900/90 border-slate-800 hover:bg-slate-800' : 'text-slate-800 bg-slate-100 border-slate-200/80 hover:bg-slate-200/80'} px-2 py-0.5 rounded-full border text-[10px] tracking-wider uppercase transition-colors`}>
              SIVABHARATH
            </span>
          </div>

          <div className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-[10px] whitespace-nowrap`}>
            © {currentYear} TenM. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
