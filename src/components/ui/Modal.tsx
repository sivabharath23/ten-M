import React, { useEffect } from 'react'
import {
  PlusCircle,
  HelpCircle,
  Droplets,
  TrendingUp,
  Wallet,
  Settings,
  UserPlus,
  DoorOpen,
  Building2,
  AlertTriangle
} from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  icon?: React.ReactNode // Optional custom icon. Pass null to disable auto-icon.
}

function getTitleIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('water')) return <Droplets className="h-5 w-5 text-blue-500 shrink-0" />
  if (t.includes('hike') || t.includes('appraisal')) return <TrendingUp className="h-5 w-5 text-brand-500 shrink-0" />
  if (t.includes('deposit') || t.includes('advance') || t.includes('ledger')) return <Wallet className="h-5 w-5 text-emerald-500 shrink-0" />
  if (t.includes('flat') || t.includes('room')) return <DoorOpen className="h-5 w-5 text-indigo-500 shrink-0" />
  if (t.includes('building') || t.includes('property')) return <Building2 className="h-5 w-5 text-brand-600 shrink-0" />
  if (t.includes('tenant') || t.includes('user')) return <UserPlus className="h-5 w-5 text-violet-500 shrink-0" />
  
  if (
    t.includes('delete') || 
    t.includes('archive') || 
    t.includes('vacate') || 
    t.includes('remove') || 
    t.includes('sign out') || 
    t.includes('log out')
  ) {
    return <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
  }
  if (
    t.includes('edit') || 
    t.includes('update') || 
    t.includes('modify') || 
    t.includes('settings') || 
    t.includes('configure')
  ) {
    return <Settings className="h-5 w-5 text-slate-500 shrink-0" />
  }
  if (
    t.includes('create') || 
    t.includes('register') || 
    t.includes('add') || 
    t.includes('new')
  ) {
    return <PlusCircle className="h-5 w-5 text-brand-500 shrink-0" />
  }
  return <HelpCircle className="h-5 w-5 text-slate-400 shrink-0" />
}

export function Modal({ isOpen, onClose, title, children, footer, icon }: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white w-full md:max-w-lg rounded-t-[24px] md:rounded-[24px] shadow-2xl flex flex-col z-10 max-h-[90vh] md:max-h-[85vh] transition-transform duration-300 ease-out transform translate-y-0"
      >
        {/* Mobile Drag Indicator / Handle */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 md:hidden cursor-pointer" onClick={onClose} />

        {/* Header with light theme background blur */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 backdrop-blur-xs rounded-t-[24px] md:rounded-t-[24px]">
          <div className="flex items-center gap-2.5">
            {icon !== null && (icon || getTitleIcon(title))}
            <h3 className="text-base font-black text-slate-800 tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-slate-600">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-t-none md:rounded-b-[24px] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
