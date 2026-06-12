import React from 'react'
import { Spinner } from './Spinner'
import { 
  X, 
  Save, 
  Plus, 
  ArrowLeft, 
  Trash2,
  Check
} from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'cancel'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  icon,
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] active:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'
  
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 shadow-sm shadow-brand-500/10',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400',
    danger: 'bg-danger-500 hover:bg-danger-700 text-white focus:ring-danger-500 shadow-sm',
    ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-200',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-200 shadow-sm',
    cancel: 'bg-danger-50 hover:bg-danger-100/80 text-danger-700 border-2 border-danger-500 focus:ring-danger-500 shadow-xs',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  // Auto-resolve any button containing "Cancel" to the cancel variant style
  let resolvedVariant = variant
  if (typeof children === 'string' && children.trim().toLowerCase() === 'cancel') {
    resolvedVariant = 'cancel'
  }

  // Auto-detect and render default icon if none is provided and children is a plain string
  let autoIcon = icon
  if (!isLoading && !autoIcon && typeof children === 'string') {
    const text = children.trim().toLowerCase()
    if (text === 'cancel' || text === 'close') {
      autoIcon = <X className="h-3.5 w-3.5 shrink-0" />
    } else if (text.includes('save') || text.includes('update') || text.includes('apply')) {
      autoIcon = <Save className="h-3.5 w-3.5 shrink-0" />
    } else if (text.includes('create') || text.includes('register') || text.includes('add') || text.includes('submit')) {
      autoIcon = <Plus className="h-3.5 w-3.5 shrink-0" />
    } else if (text.includes('back')) {
      autoIcon = <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
    } else if (text.includes('delete') || text.includes('archive') || text.includes('vacate')) {
      autoIcon = <Trash2 className="h-3.5 w-3.5 shrink-0" />
    } else if (text.includes('confirm') || text.includes('sign in') || text.includes('log in') || text.includes('sign out') || text.includes('log out')) {
      autoIcon = <Check className="h-3.5 w-3.5 shrink-0" />
    }
  }

  // Render the icon wrapper if an icon exists
  const renderedIcon = autoIcon ? (
    <span className="mr-1.5 flex items-center justify-center shrink-0">
      {autoIcon}
    </span>
  ) : null

  return (
    <button
      className={`${baseStyle} ${variants[resolvedVariant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner className="mr-2 h-4 w-4 text-current" />
      ) : (
        renderedIcon
      )}
      {children}
    </button>
  )
}
