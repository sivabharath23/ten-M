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
import { Building2, Receipt, Droplet, TrendingUp, Sparkles, ShieldCheck, ArrowRight, Activity, Users } from 'lucide-react'

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
    <div className="min-h-screen flex bg-slate-950 font-sans text-slate-100 relative overflow-hidden">
      {/* Dynamic Ambient Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-600/10 blur-[120px] -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[140px] -z-10 animate-pulse duration-[12s]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-purple-500/5 blur-[100px] -z-10" />

      {/* Background Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 -z-10" />

      {/* Main Container */}
      <div className="w-full flex flex-col lg:flex-row relative z-10">
        
        {/* Left Side: Product Showcase (lg only) */}
        <div className="hidden lg:flex w-[45%] p-16 flex-col justify-between relative overflow-hidden border-r border-slate-900/50">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-widest text-white leading-none">TenM</span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Tenant Management</span>
            </div>
          </div>

          {/* 3D Tilted Dashboard Showcase Preview */}
          <div className="my-auto space-y-12">
            <div className="space-y-4 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-xs font-bold tracking-wide">
                <Sparkles className="h-3 w-3" />
                <span>Next-Gen Real Estate Operations</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Simplified Property & Tenant Management
              </h2>
              <p className="text-slate-400 text-sm font-semibold leading-relaxed">
                Streamline rent schedules, log water consumption, and automate annual revisions in one unified workspace.
              </p>
            </div>

            {/* Interactive Mock UI card */}
            <div className="relative pl-6">
              {/* Back Card Decoration */}
              <div className="absolute top-2 left-8 w-[90%] h-full bg-white/[0.01] border border-white/[0.03] rounded-2xl -z-10" />
              
              {/* Main Floating Card */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/40 max-w-sm transform rotate-y-6 -rotate-x-12 rotate-3 hover:rotate-0 hover:scale-[1.02] transition-all duration-700 ease-out select-none">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-400">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Rent Ledger</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Monthly overview</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    82.8% Collected
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                      <div className="h-full w-[82.8%] bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>₹4,82,000 / ₹5,80,000</span>
                      <span className="text-brand-400">Target Reached</span>
                    </div>
                  </div>

                  {/* Micro list */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.05]">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Units</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-200">124 Tenants</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Water Tariffs</span>
                      <div className="flex items-center gap-1">
                        <Droplet className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="text-xs font-bold text-slate-200">0.05 / Litre</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
            © {new Date().getFullYear()} TenM Portal. All rights reserved.
          </div>
        </div>

        {/* Right Side: Glassmorphic Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
          {/* Glass Form Card */}
          <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/[0.06] rounded-[32px] p-8 md:p-10 space-y-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-300">
            
            {/* Logo and Titles */}
            <div className="space-y-2 text-center lg:text-left">
              {/* Brand Logo for Mobile */}
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mx-auto lg:mx-0 lg:hidden mb-4">
                <Building2 className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Sign in to manage your real estate operations
              </p>
            </div>

            {/* Input fields with customized dark themes */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                error={errors.email?.message}
                className="!bg-slate-950/60 !border-slate-800/80 !text-slate-100 focus:!border-brand-500 focus:!ring-brand-500/10 !placeholder-slate-600 !rounded-xl !py-3 !text-sm transition-all duration-300"
                {...register('email')}
              />

              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                className="!bg-slate-950/60 !border-slate-800/80 !text-slate-100 focus:!border-brand-500 focus:!ring-brand-500/10 !placeholder-slate-600 !rounded-xl !py-3 !text-sm transition-all duration-300"
                {...register('password')}
              />

              <Button 
                type="submit" 
                className="w-full py-4 text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 rounded-xl transition-all duration-300 active:scale-98 cursor-pointer mt-4 border-0" 
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            {/* Premium Redirection Card */}
            <div className="text-center pt-6 border-t border-slate-800/80 mt-6">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
                New to the portal?
              </p>
              <Link 
                href="/register" 
                className="inline-flex items-center gap-2 justify-center w-full px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-slate-300 hover:text-white font-extrabold text-xs rounded-xl transition-all tracking-wide hover:scale-[1.01] active:scale-99"
              >
                <span>Register Property Owner/Admin</span>
                <ArrowRight className="h-3.5 w-3.5 text-brand-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

