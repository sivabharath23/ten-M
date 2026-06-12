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
import { Building2 } from 'lucide-react'

type RegisterFormInputs = typeof registerSchema._output

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-[24px] shadow-xl shadow-slate-100/50 p-8 space-y-6">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">TenM</h1>
          <p className="text-sm text-slate-400 font-medium">Tenant Management Portal</p>
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
            onChange={(e) => setValue('userType', e.target.value as 'SINGLE' | 'MULTIPLE')}
          />

          <Button 
            type="submit" 
            className="w-full py-3.5 text-sm" 
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-brand-600 hover:text-brand-700 font-bold underline decoration-2 underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
