'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, Building2, Home } from 'lucide-react'

interface UserSession {
  name: string
  email: string
  userType: string
}

interface TopbarProps {
  user: UserSession | null
  title?: string
  onLogoutRequest: () => void
}

export function Topbar({ user, title = 'TenM', onLogoutRequest }: TopbarProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Logo Brand */}
        <div className="md:hidden h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/10">
          <Building2 className="h-4.5 w-4.5" />
        </div>
        <h1 className="text-base md:text-lg font-black text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right items-end gap-1">
              <span className="text-xs font-black text-slate-800 leading-none">{user.name}</span>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                user.userType === 'SINGLE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : 'bg-brand-50 text-brand-700 border-brand-200/60'
              }`}>
                {user.userType === 'SINGLE' ? (
                  <>
                    <Home className="h-2.5 w-2.5" />
                    <span>Single Landlord</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-2.5 w-2.5" />
                    <span>Multi-Property</span>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Logout trigger */}
            <button
              onClick={onLogoutRequest}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
