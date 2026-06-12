'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, Building2 } from 'lucide-react'

interface UserSession {
  name: string
  email: string
  userType: string
}

interface TopbarProps {
  user: UserSession | null
  title?: string
}

export function Topbar({ user, title = 'TenM' }: TopbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Logout failed')

      toast.success('Signed out successfully')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Failed to log out')
    }
  }

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
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-slate-800 leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.userType === 'SINGLE' ? 'Single Landlord' : 'Multi-Property'}</span>
            </div>

            {/* Mobile Logout trigger */}
            <button
              onClick={handleLogout}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-150 transition-colors cursor-pointer"
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
