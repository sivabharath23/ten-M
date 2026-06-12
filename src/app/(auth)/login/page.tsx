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
import { Building2, Receipt, Droplet, TrendingUp, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'

type LoginFormInputs = typeof loginSchema._output

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

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
        throw new Error(result.error || 'Invalid credentials')
      }

      toast.success('Signed in successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-800 relative overflow-hidden">
      {/* Background Soft Pastel Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[120px] -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-500/5 blur-[140px] -z-10 animate-pulse duration-[12s]" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-rose-500/3 blur-[100px] -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 -z-10" />

      {/* Left Column: Premium App Introduction */}
      <div className="hidden lg:flex lg:w-[45%] p-16 flex-col justify-between border-r border-slate-200/60 bg-white/20 backdrop-blur-md relative overflow-hidden">
        
        {/* Logo Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-slate-900 leading-none">TenM</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant Management</span>
          </div>
        </div>

        {/* Features & Headings */}
        <div className="space-y-12 my-auto max-w-md">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/5 border border-brand-500/10 rounded-full text-brand-600 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Operations Hub</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Simplified Property & Tenant Management
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Automate rent collection, track volumetric water utility consumption, and streamline annual lease revisions in one platform.
            </p>
          </div>

          <div className="space-y-4">
            {/* Feature Tile 1 */}
            <div className="flex gap-4 p-4 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl hover:shadow-[0_12px_45px_rgb(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-800">Rent & Late Fee Tracking</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">Record monthly payments, note partial collections, and apply automated grace days.</p>
              </div>
            </div>

            {/* Feature Tile 2 */}
            <div className="flex gap-4 p-4 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl hover:shadow-[0_12px_45px_rgb(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <Droplet className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-800">Water Consumption Billing</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">Log consumption per flat and automatically compute utility bills with set tariffs.</p>
              </div>
            </div>

            {/* Feature Tile 3 */}
            <div className="flex gap-4 p-4 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl hover:shadow-[0_12px_45px_rgb(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-800">Rent Appraisal Engine</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">Automate annual lease revision cycles cleanly on tenant anniversary dates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Preview Widget */}
        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl max-w-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Occupancy</p>
              <p className="text-xs font-extrabold text-slate-855">98.4% Across Real Estate Portfolios</p>
            </div>
          </div>
          <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">LIVE PREVIEW</span>
        </div>
      </div>

      {/* Right Column: Premium Auth Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        {/* Main Form Card */}
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-[0_30px_60px_rgba(15,23,42,0.04)] rounded-[32px] p-8 md:p-10 space-y-8 relative z-10 transition-all duration-300">
          
          {/* Header titles */}
          <div className="space-y-2 text-center lg:text-left">
            {/* Small Brand Logo for Mobile */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mx-auto lg:mx-0 lg:hidden mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Sign in to manage your real estate operations
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              error={errors.email?.message}
              className="!bg-slate-50/50 !border-slate-200/80 !text-slate-900 focus:!border-brand-500 focus:!ring-brand-500/10 focus:!bg-white !rounded-xl !py-3 !text-sm transition-all duration-300"
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              className="!bg-slate-50/50 !border-slate-200/80 !text-slate-900 focus:!border-brand-500 focus:!ring-brand-500/10 focus:!bg-white !rounded-xl !py-3 !text-sm transition-all duration-300"
              {...register('password')}
            />

            <Button 
              type="submit" 
              className="w-full py-3.5 text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 rounded-xl transition-all duration-300 active:scale-98 cursor-pointer mt-4 border-0" 
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Redirection Link Card */}
          <div className="text-center pt-5 border-t border-slate-100 mt-6">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2.5">
              New to the platform?
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-1.5 justify-center w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 hover:text-slate-800 font-extrabold text-xs rounded-xl transition-all tracking-wide hover:scale-[1.01] active:scale-99"
            >
              <span>Register Property Owner/Admin</span>
              <ArrowRight className="h-3.5 w-3.5 text-brand-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
