'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/lib/validations'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import Link from 'next/link'
import { Building2, Receipt, Droplet, TrendingUp, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'

type RegisterFormInputs = typeof registerSchema._output

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      userType: 'SINGLE',
    },
  })

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      toast.success('Account created successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-850 relative overflow-hidden">
      
      {/* Background Soft Pastel Glows for Right Side */}
      <div className="absolute top-[-20%] left-[40%] w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[120px] -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-500/5 blur-[140px] -z-10 animate-pulse duration-[12s]" />

      {/* Grid Pattern Overlay for Right Side */}
      <div className="absolute inset-0 left-0 lg:left-[45%] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 -z-10" />

      {/* Left Column: Premium Dark Presentation Side */}
      <div className="hidden lg:flex lg:w-[45%] p-16 flex-col justify-between bg-slate-950 text-white relative overflow-hidden border-r border-slate-900">
        
        {/* Glowing Ambient Mesh Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-brand-600/20 blur-[130px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-indigo-600/20 blur-[150px] -z-10 animate-pulse-slow" />
        <div className="absolute top-[35%] left-[20%] w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[110px] -z-10" />

        {/* Dynamic Space Grid Overlay SVG (Sharp, beautiful orbital grid) */}
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

        {/* Interactive Floating Nodes in Left Side */}
        <div className="absolute top-[22%] left-[32%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
        <div className="absolute top-[63%] left-[68%] w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-pulse-slow" />
        <div className="absolute top-[38%] left-[54%] w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_14px_rgba(244,114,182,0.8)] animate-pulse" />

        {/* Logo Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white leading-none">TenM</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant Management</span>
          </div>
        </div>

        {/* Features Content */}
        <div className="space-y-10 my-auto max-w-md relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Next-Gen Operations Hub</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Simplified Property & Tenant Management
            </h2>
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              Automate rent collection, track volumetric water utility consumption, and streamline annual lease revisions in one platform.
            </p>
          </div>

          <div className="space-y-4">
            {/* Feature Tile 1 */}
            <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.2)] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-505 bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-200">Rent & Late Fee Tracking</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">Record monthly payments, note partial collections, and apply automated grace days.</p>
              </div>
            </div>

            {/* Feature Tile 2 */}
            <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.2)] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Droplet className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-200">Water Consumption Billing</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">Log consumption per flat and automatically compute utility bills with set tariffs.</p>
              </div>
            </div>

            {/* Feature Tile 3 */}
            <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.2)] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-505 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-200">Rent Appraisal Engine</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">Automate annual lease revision cycles cleanly on tenant anniversary dates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Premium Auth Form Card Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        
        {/* Main Form Card */}
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-[0_30px_60px_rgba(15,23,42,0.06)] rounded-[32px] p-8 md:p-10 space-y-8 relative z-10 transition-all duration-300 overflow-hidden">
          
          {/* Accent colored line at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500" />

          {/* Header titles - Centered properly */}
          <div className="space-y-2 text-center">
            {/* Small Brand Logo for Mobile/Desktop Header */}
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mx-auto mb-4 hover:rotate-6 transition-transform duration-300">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Register Owner/Admin
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tenant Management Portal
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              error={errors.name?.message}
              className="!bg-slate-50/50 hover:!border-slate-300 !border-slate-200/80 !text-slate-900 focus:!border-brand-500 focus:!ring-brand-500/10 focus:!bg-white !rounded-xl !py-3.5 !text-sm transition-all duration-300 shadow-sm"
              {...register('name')}
            />

            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              error={errors.email?.message}
              className="!bg-slate-50/50 hover:!border-slate-300 !border-slate-200/80 !text-slate-900 focus:!border-brand-500 focus:!ring-brand-500/10 focus:!bg-white !rounded-xl !py-3.5 !text-sm transition-all duration-300 shadow-sm"
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Min. 8 characters"
              error={errors.password?.message}
              className="!bg-slate-50/50 hover:!border-slate-300 !border-slate-200/80 !text-slate-900 focus:!border-brand-500 focus:!ring-brand-500/10 focus:!bg-white !rounded-xl !py-3.5 !text-sm transition-all duration-300 shadow-sm"
              {...register('password')}
            />

            <Select
              id="userType"
              label="Management Level"
              options={[
                { label: 'Single Property (e.g. Individual landlord)', value: 'SINGLE' },
                { label: 'Multiple Properties (e.g. Agency or Estate Owner)', value: 'MULTIPLE' },
              ]}
              error={errors.userType?.message}
              className="!bg-slate-50/50 hover:!border-slate-300 !border-slate-200/80 !text-slate-900 focus:!border-brand-500 focus:!ring-brand-500/10 focus:!bg-white !rounded-xl !py-3.5 !text-sm transition-all duration-300 shadow-sm"
              {...register('userType')}
            />

            <Button 
              type="submit" 
              className="w-full py-3.5 text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 rounded-xl transition-all duration-300 active:scale-98 cursor-pointer mt-4 border-0" 
              isLoading={isLoading}
            >
              Register Account
            </Button>
          </form>

          {/* Redirection Link Card */}
          <div className="text-center pt-5 border-t border-slate-100 mt-6">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2.5">
              Already have an account?
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1.5 justify-center w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 hover:text-slate-800 font-extrabold text-xs rounded-xl transition-all tracking-wide hover:scale-[1.01] active:scale-99"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="h-3.5 w-3.5 text-brand-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
