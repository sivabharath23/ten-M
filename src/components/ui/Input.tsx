import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, endIcon, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full bg-white border border-slate-200 rounded-xl outline-none appearance-none transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 placeholder-slate-400 text-slate-900 text-sm ${
              icon ? 'pl-10' : 'px-3.5'
            } ${endIcon ? 'pr-10' : 'pr-3.5'} py-2.5 ${
              error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''
            } ${className}`}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 text-slate-400 flex items-center justify-center">
              {endIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger-500 font-medium">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

