'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { toast } from 'sonner'
import {
  DoorOpen,
  Droplets,
  Wallet,
  TrendingUp,
  FileBarChart,
  Settings,
  LogOut,
  X,
  User
} from 'lucide-react'

interface UserSession {
  name: string
  email: string
  userType: string
}

interface DashboardShellProps {
  children: React.ReactNode
  user: UserSession | null
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Initialize collapsed state from localStorage after mount to avoid hydration mismatch
  React.useEffect(() => {
    const stored = localStorage.getItem('sidebar_collapsed')
    if (stored === 'true') {
      setIsSidebarCollapsed(true)
    }
  }, [])

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar_collapsed', String(next))
      return next
    })
  }

  const handleLogout = async () => {
    setIsMoreOpen(false)
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

  // Links to display in the mobile "More" slide-up drawer
  const moreLinks = [
    { label: 'Flats Database', href: '/flats', icon: DoorOpen },
    { label: 'Water Bills Tracker', href: '/water', icon: Droplets },
    { label: 'Advance Ledgers', href: '/advance', icon: Wallet },
    { label: 'Rent Appraisals', href: '/appraisals', icon: TrendingUp },
    { label: 'Reports & CSV', href: '/reports', icon: FileBarChart },
    { label: 'Master Settings', href: '/settings', icon: Settings },
  ]

  // Get current active title based on path
  const getPageTitle = () => {
    const segment = pathname.split('/')[1]
    if (!segment) return 'Dashboard'
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <Topbar user={user} title={getPageTitle()} />

        {/* Scrollable Content Pane */}
        <main className="flex-1 overflow-y-auto p-3 md:p-4 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto space-y-6 animate-page-transition-enter">
            {children}
          </div>
        </main>

        {/* Mobile Nav Bar */}
        <MobileNav onMoreClick={() => setIsMoreOpen(true)} />
      </div>

      {/* Mobile "More" Slide-up bottom sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Bottom Drawer Sheet */}
          <div className="relative bg-white w-full rounded-t-[24px] z-10 shadow-2xl flex flex-col max-h-[80vh] overflow-y-auto pb-safe">
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3" onClick={() => setIsMoreOpen(false)} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{user?.userType === 'SINGLE' ? 'Single Landlord' : 'Multi-Property'}</span>
                </div>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List Links */}
            <div className="p-4 grid grid-cols-2 gap-2">
              {moreLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${isActive
                        ? 'bg-brand-50 border-brand-200 text-brand-700 font-bold'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/50'
                      }`}
                  >
                    <Icon className="h-5 w-5 stroke-2" />
                    <span className="text-xs font-bold tracking-tight text-center">{link.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Logout Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-danger-700 font-bold border border-slate-200 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
