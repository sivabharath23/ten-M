'use client'

import React from 'react'

interface FooterProps {
  className?: string
}

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`mt-auto pt-2.5 pb-1.5 border-t border-slate-200/80 text-[11px] text-slate-500 no-print print:hidden ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-900 text-xs tracking-tight">
            Ten<span className="text-brand-600">M</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-medium text-[11px]">
            Smart Property & Tenant Management
          </span>
        </div>

        {/* Developer Credit */}
        <div className="flex items-center gap-1 text-slate-500 font-medium">
          <span>Developed by</span>
          <span className="font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded-full border border-slate-200/80 text-[10px] tracking-wider uppercase transition-colors">
            SIVABHARATH
          </span>
        </div>

        {/* Copyright Notice */}
        <div className="text-slate-400 text-[10px]">
          © {currentYear} TenM. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
