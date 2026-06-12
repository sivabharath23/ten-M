import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 placeholder-slate-400 text-slate-900 text-[16px] ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''
            } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-danger-500 font-medium">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
