import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] hover:border-slate-300 transition-all duration-300 p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
