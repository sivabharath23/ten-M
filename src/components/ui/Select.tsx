import React, { forwardRef } from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { label: string; value: string | number }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none appearance-none transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 text-[16px] pr-10 ${
              error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-danger-500 font-medium">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
