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
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'

interface UserSession {
  name: string
  email: string
  userType: string
}

interface SidebarProps {
  user: UserSession | null
  isCollapsed: boolean
  onToggle: () => void
  onLogoutRequest: () => void
}

export function Sidebar({ user, isCollapsed, onToggle, onLogoutRequest }: SidebarProps) {
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

  // Group items by category
  const categories = ['Main', 'Finances', 'Management']

  return (
    <aside className={`hidden md:flex flex-col border-r border-slate-200 bg-white h-screen sticky top-0 relative z-40 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute top-[18px] -right-[14px] z-50 items-center justify-center h-7 w-7 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-md cursor-pointer"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      {/* Brand Header */}
      <div className={`h-16 flex items-center border-b border-slate-100 gap-2.5 transition-all duration-300 ${
        isCollapsed ? 'justify-center px-4' : 'px-6'
      }`}>
        <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/10 shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-black text-slate-900 tracking-tight transition-opacity duration-300">
            TenM
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 overflow-y-auto py-6 space-y-6 transition-all duration-300 ${
        isCollapsed ? 'px-2' : 'px-4'
      }`}>
        {categories.map((cat, idx) => (
          <div key={cat} className="space-y-1.5">
            {isCollapsed ? (
              idx > 0 && <div className="h-[1px] bg-slate-100 my-4 mx-2" />
            ) : (
              <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                {cat}
              </span>
            )}
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
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center transition-all ${
                        isCollapsed ? 'justify-center p-3 rounded-xl' : 'gap-3 px-3 py-2 rounded-xl'
                      } ${
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                      {!isCollapsed && (
                        <span className="text-sm font-semibold transition-opacity duration-300">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info / Profile Footer */}
      {user && (
        <div className={`border-t border-slate-100 flex flex-col bg-slate-50/50 transition-all duration-300 ${
          isCollapsed ? 'p-3 items-center gap-4' : 'p-4 gap-3'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-300 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogoutRequest}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold border border-slate-200 rounded-xl transition-all cursor-pointer ${
              isCollapsed ? 'p-2.5 w-10 h-10' : 'gap-2 w-full py-2'
            }`}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </aside>
  )
}
