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
import { Building2, Receipt, Droplet, TrendingUp } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 relative overflow-hidden">
      {/* Left Column: App Information (visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white p-16 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl -z-10 animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl -z-10 animate-pulse duration-[12000ms]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:32px_32px] opacity-10" />

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">TenM</span>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-8 my-auto max-w-lg">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Simplified Property & Tenant Management
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Empower your property management with pristine automated workflows, utility tracking, and clean financial ledger reporting.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-brand-400">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Rent & Late Fee Tracking</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Record collections, handle partial payments, and apply customizable grace days.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-indigo-400">
                <Droplet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Water Consumption Billing</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Enter volumetric usage data per flat and generate bills using active tariff settings.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Rent Appraisal Engine</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Set annual rent revision cycles to automatically update lease values on anniversary dates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          © {new Date().getFullYear()} TenM Portal. All rights reserved.
        </div>
      </div>

      {/* Right Column: Form (centered on mobile, split on desktop) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Background radial gradient dot pattern for form side */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl -z-10" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl -z-10" />

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl shadow-slate-200/50 p-8 md:p-10 space-y-8 relative z-10 transition-all duration-300">
          
          {/* Branding header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-14 w-14 lg:hidden rounded-2xl bg-linear-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 transform hover:scale-105 transition-transform duration-300">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight bg-linear-to-r from-slate-900 via-brand-950 to-slate-900 bg-clip-text text-transparent">
                Register Owner/Admin
              </h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Tenant Management Portal
              </p>
            </div>
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
              className="w-full py-4 text-sm font-bold bg-linear-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 transition-all rounded-2xl active:scale-98 cursor-pointer mt-2" 
              isLoading={isLoading}
            >
              Register Account
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-brand-600 hover:text-brand-700 font-black underline decoration-2 underline-offset-4 block mt-1 hover:scale-[1.02] transition-transform"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
