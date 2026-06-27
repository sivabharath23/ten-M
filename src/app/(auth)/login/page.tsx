'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import Link from 'next/link'
import { Building2, Receipt, Droplet, TrendingUp, Sparkles, ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'

type LoginFormInputs = typeof loginSchema._output

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Invalid email or password')
      }

      toast.success('Welcome back! Signed in successfully.')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-850 relative overflow-hidden">

      {/* Background Soft Pastel Glows */}
      <div className="absolute top-[-20%] left-[40%] w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[120px] -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-500/5 blur-[140px] -z-10 animate-pulse duration-[12s]" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 left-0 lg:left-[45%] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 -z-10" />

      {/* Left Column: Premium Dark Presentation Side */}
      <div className="hidden lg:flex lg:w-[45%] p-16 flex-col justify-between bg-slate-950 text-white relative overflow-hidden border-r border-slate-900">

        {/* Glowing Ambient Mesh Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-brand-600/20 blur-[130px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-indigo-600/20 blur-[150px] -z-10 animate-pulse-slow" />
        <div className="absolute top-[35%] left-[20%] w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[110px] -z-10" />

        {/* Dynamic Space Grid Overlay SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-35 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)]" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.4">
            <circle cx="400" cy="400" r="320" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeDasharray="10 15" />
            <circle cx="400" cy="400" r="220" stroke="url(#paint1_linear)" strokeWidth="1" />
            <circle cx="400" cy="400" r="120" stroke="url(#paint2_linear)" strokeWidth="1.5" strokeDasharray="4 6" />
            <path d="M100 100 L700 700" stroke="url(#paint3_linear)" strokeWidth="1" opacity="0.4" />
            <path d="M100 700 L700 100" stroke="url(#paint4_linear)" strokeWidth="1" opacity="0.4" />
          </g>
          <defs>
            <linearGradient id="paint0_linear" x1="100" y1="100" x2="700" y2="700" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4f46e5" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="paint1_linear" x1="200" y1="200" x2="600" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="paint2_linear" x1="300" y1="300" x2="500" y2="500" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="paint3_linear" x1="100" y1="100" x2="700" y2="700" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4f46e5" stopOpacity="0" />
              <stop offset="0.5" stopColor="#3b82f6" />
              <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="paint4_linear" x1="100" y1="700" x2="700" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ec4899" stopOpacity="0" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#ff7171" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Interactive Floating Nodes */}
        <div className="absolute top-[22%] left-[32%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
        <div className="absolute top-[63%] left-[68%] w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-pulse-slow" />
        <div className="absolute top-[38%] left-[54%] w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_14px_rgba(244,114,182,0.8)] animate-pulse" />

        {/* Logo Header */}
        <div className="flex items-center gap-3 relative z-10 mb-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 ring-1 ring-white/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider text-white leading-none">TenM</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant & Estate Engine</span>
          </div>
        </div>

        {/* Features Content */}
        <div className="space-y-8 my-auto max-w-md relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Property Operations Operating System</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Streamlined Real Estate & Tenant Management
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Automate rent collection cycles, monitor volumetric utility billing, and execute annual lease revisions seamlessly.
            </p>
          </div>

          <div className="space-y-4">
            {/* Feature Tile 1 */}
            <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.2)] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-200">Rent & Collection Tracking</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Log payments, partial dues, and automated late fee grace periods.</p>
              </div>
            </div>

            {/* Feature Tile 2 */}
            <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.2)] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Droplet className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-200">Utility Meter Billing</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Log water sub-meter readings and compute automated tenant invoices.</p>
              </div>
            </div>

            {/* Feature Tile 3 */}
            <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.2)] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-200">Automated Annual Hikes</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Schedule rent appraisals automatically based on tenant occupancy dates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Encrypted Session & Cookie Auth Active</span>
        </div>
      </div>

      {/* Right Column: Auth Form Card Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">

        {/* Main Form Card */}
        <div className="w-full max-w-md bg-white border border-slate-200/80 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.08)] rounded-[32px] p-8 md:p-10 space-y-8 relative z-10 transition-all duration-300">

          {/* Accent colored line at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 rounded-t-[32px]" />

          {/* Header titles */}
          <div className="space-y-2 text-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mx-auto mb-3 hover:scale-105 transition-transform duration-300">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to TenM
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Enter your credentials to manage properties & tenants
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="admin@property.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              className="!bg-slate-50/70 hover:!border-slate-300 !border-slate-200 !text-slate-900 focus:!border-brand-500 focus:!ring-brand-500/10 focus:!bg-white !rounded-xl !py-3 !text-sm transition-all duration-200 shadow-xs"
              {...register('email')}
            />

            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              className="!bg-slate-50/70 hover:!border-slate-300 !border-slate-200 !text-slate-900 focus:!border-brand-500 focus:!ring-brand-500/10 focus:!bg-white !rounded-xl !py-3 !text-sm transition-all duration-200 shadow-xs"
              {...register('password')}
            />

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <span className="text-slate-400 text-[11px] font-medium">Secure SSL JWT</span>
            </div>

            <Button
              type="submit"
              className="w-full py-3.5 text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 rounded-xl transition-all duration-200 active:scale-98 cursor-pointer mt-4 border-0"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Redirection Link Card */}
          <div className="text-center pt-5 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-semibold mb-3">
              Don't have an admin or landlord account?
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 justify-center w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 font-bold text-xs rounded-xl transition-all duration-200 hover:border-slate-300"
            >
              <span>Register New Owner Account</span>
              <ArrowRight className="h-3.5 w-3.5 text-brand-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

