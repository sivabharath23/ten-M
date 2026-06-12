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
import { Building2 } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background radial gradient dot pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70" />
      
      {/* Aurora glow indicators */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl -z-10 animate-pulse duration-[12000ms]" />

      {/* Main Glassmorphic Card Container */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl shadow-slate-200/50 p-8 md:p-10 space-y-8 relative z-10 transition-all duration-300">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-linear-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 transform hover:scale-105 transition-transform duration-300">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight bg-linear-to-r from-slate-900 via-brand-950 to-slate-900 bg-clip-text text-transparent">
              TenM
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Tenant Management Portal
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button 
            type="submit" 
            className="w-full py-4 text-sm font-bold bg-linear-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 transition-all rounded-2xl active:scale-98 cursor-pointer mt-2" 
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="text-brand-600 hover:text-brand-700 font-bold underline decoration-2 underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
