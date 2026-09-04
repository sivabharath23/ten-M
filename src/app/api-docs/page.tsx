'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

import type { SwaggerUIProps } from 'swagger-ui-react'

// Dynamically import SwaggerUI to disable server-side rendering (SSR) for it
const SwaggerUI = dynamic<SwaggerUIProps>(
  () => import('swagger-ui-react') as any,
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-800"></div>
          <p className="text-sm font-bold text-slate-500">Loading API Playground...</p>
        </div>
      </div>
    )
  }
)

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Small brand header above swagger */}
      <div className="bg-slate-900 text-white py-4 px-6 flex items-center justify-between border-b border-slate-800">
        <div>
          <h1 className="text-lg font-black tracking-tight">TenM Developer APIs</h1>
          <p className="text-xs font-semibold text-slate-400">Interactive API Sandbox</p>
        </div>
        <a 
          href="/dashboard" 
          className="text-xs font-black bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl transition-all"
        >
          Back to Portal
        </a>
      </div>
      <div className="px-2 py-4 sm:px-6">
        <SwaggerUI url="/openapi.json" />
      </div>
    </div>
  )
}
