import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-150 shadow-sm shadow-slate-100/60 p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
