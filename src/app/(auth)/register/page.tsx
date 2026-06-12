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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 relative overflow-hidden">
      {/* Left Column: Premium Application Showcase (visible on lg screens) */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-950 text-white p-16 flex-col justify-between relative overflow-hidden border-r border-slate-900">
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-15" />
        
        {/* Soft Glowing Orbs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[120px] -z-10 animate-pulse duration-[10s]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] -z-10 animate-pulse duration-[15s]" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white">TenM</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest -mt-1">Tenant Management</span>
          </div>
        </div>

        {/* App Pitch & Features */}
        <div className="space-y-12 my-auto relative z-10 max-w-lg">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/25 rounded-full text-brand-400 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Operations Hub</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 leading-tight">
              Simplified Property & Tenant Management
            </h2>
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              Automated workflows, utilities billing, and tenant appraisal revisions integrated into a single unified workspace.
            </p>
          </div>

          <div className="space-y-5">
            {/* Feature Item 1 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Rent & Late Fee Tracking</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">Log monthly payments, record partial balances, and customize grace days.</p>
              </div>
            </div>

            {/* Feature Item 2 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Droplet className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Water Consumption Billing</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">Record volumetric usage per flat and auto-calculate bills with set tariffs.</p>
              </div>
            </div>

            {/* Feature Item 3 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Rent Appraisal Engine</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">Automate annual lease increments seamlessly on tenant anniversaries.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live System Stats Widget */}
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl max-w-sm relative z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Average Occupancy</p>
              <p className="text-sm font-extrabold text-slate-100">98.4% Across Properties</p>
            </div>
          </div>
          <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">LIVE PREVIEW</span>
        </div>
      </div>

      {/* Right Column: Dynamic Form (centered on mobile, split on desktop) */}
      <div className="w-full lg:w-[55%] bg-slate-50 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Soft Grid Background on Light Side */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-500/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl -z-10" />

        {/* Floating Form Card */}
        <div className="w-full max-w-md bg-white border border-slate-100/80 shadow-[0_20px_50px_rgba(15,23,42,0.06)] rounded-3xl p-8 md:p-10 space-y-8 relative z-10 transition-all duration-300">
          
          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            {/* Small Brand Logo for Mobile */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mx-auto lg:mx-0 lg:hidden mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Register Owner/Admin
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
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
              {...register('name')}
            />

            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Min. 8 characters"
              error={errors.password?.message}
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
              {...register('userType')}
            />

            <Button 
              type="submit" 
              className="w-full py-3.5 text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-brand-500/20 active:scale-98 transition-all duration-200 rounded-2xl cursor-pointer mt-2" 
              isLoading={isLoading}
            >
              Register Account
            </Button>
          </form>

          {/* Redirection Link Card */}
          <div className="text-center pt-5 border-t border-slate-100 mt-6">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2.5">
              Already have an account?
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1.5 justify-center w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all tracking-wide hover:scale-[1.01] active:scale-99"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
