import React from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] active:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'
  
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 shadow-sm shadow-brand-500/10',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400',
    danger: 'bg-danger-500 hover:bg-danger-700 text-white focus:ring-danger-500 shadow-sm',
    ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-200',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-200 shadow-sm',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  
  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2 h-4 w-4 text-current" />}
      {children}
    </button>
  )
}
