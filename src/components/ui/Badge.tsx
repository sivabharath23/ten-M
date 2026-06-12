import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'paid' | 'pending' | 'partial' | 'overdue' | 'occupied' | 'vacant' | 'neutral' | 'success' | 'danger'
  className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const styles = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    partial: 'bg-violet-50 text-violet-700 border-violet-200',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200',
    occupied: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    vacant: 'bg-slate-100 text-slate-600 border-slate-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}
