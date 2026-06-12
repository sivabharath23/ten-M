'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Users, Banknote, Menu } from 'lucide-react'

interface MobileNavProps {
  onMoreClick: () => void
}

export function MobileNav({ onMoreClick }: MobileNavProps) {
  const pathname = usePathname()

  const tabs = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Props', href: '/properties', icon: Building2 },
    { label: 'Tenants', href: '/tenants', icon: Users },
    { label: 'Rent', href: '/rent', icon: Banknote },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/65 flex justify-around items-center px-2 z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
              isActive 
                ? 'text-brand-600 font-bold' 
                : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <Icon className={`h-5 w-5 mb-0.5 transition-transform duration-100 active:scale-90 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </Link>
        )
      })}
      
      {/* "More" Trigger for slide-up sheet */}
      <button
        onClick={onMoreClick}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all text-slate-400 font-medium hover:text-slate-600 cursor-pointer"
      >
        <Menu className="h-5 w-5 mb-0.5 active:scale-90 stroke-2" />
        <span className="text-[10px] tracking-tight">More</span>
      </button>
    </div>
  )
}
