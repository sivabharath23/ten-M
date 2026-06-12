'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  LayoutDashboard, 
  Building2, 
  DoorOpen, 
  Users, 
  Banknote, 
  Droplets, 
  Wallet, 
  TrendingUp, 
  FileBarChart, 
  Settings, 
  LogOut 
} from 'lucide-react'

interface UserSession {
  name: string
  email: string
  userType: string
}

interface SidebarProps {
  user: UserSession | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'Main' },
    { label: 'Properties', href: '/properties', icon: Building2, category: 'Main' },
    { label: 'Flats', href: '/flats', icon: DoorOpen, category: 'Main' },
    { label: 'Tenants', href: '/tenants', icon: Users, category: 'Main' },
    
    { label: 'Rent Collection', href: '/rent', icon: Banknote, category: 'Finances' },
    { label: 'Water Bills', href: '/water', icon: Droplets, category: 'Finances' },
    { label: 'Advance History', href: '/advance', icon: Wallet, category: 'Finances' },
    { label: 'Appraisals', href: '/appraisals', icon: TrendingUp, category: 'Finances' },
    
    { label: 'Reports', href: '/reports', icon: FileBarChart, category: 'Management' },
    { label: 'Settings', href: '/settings', icon: Settings, category: 'Management' },
  ]

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

  // Group items by category
  const categories = ['Main', 'Finances', 'Management']

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/10">
          <Building2 className="h-5 w-5" />
        </div>
        <span className="text-lg font-black text-slate-900 tracking-tight">TenM</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {categories.map(cat => (
          <div key={cat} className="space-y-1.5">
            <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              {cat}
            </span>
            <div className="space-y-0.5">
              {navItems
                .filter(item => item.category === cat)
                .map(item => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info / Profile Footer */}
      {user && (
        <div className="p-4 border-t border-slate-100 flex flex-col gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-300">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  )
}
