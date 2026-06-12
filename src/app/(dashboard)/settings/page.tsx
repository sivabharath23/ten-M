'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsSchema } from '@/lib/validations'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import { Settings, Save, AlertCircle } from 'lucide-react'

type SettingsFormInputs = typeof settingsSchema._output

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormInputs>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appraisalPercent: 5.0,
      waterCostPerLitre: 0.05,
      lateFeeAmount: 0.0,
      lateFeeGraceDays: 5,
      maxFloors: 10,
    },
  })

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error()
      const data = await response.json()
      if (data) {
        reset({
          appraisalPercent: data.appraisalPercent,
          waterCostPerLitre: data.waterCostPerLitre,
          lateFeeAmount: data.lateFeeAmount,
          lateFeeGraceDays: data.lateFeeGraceDays,
          maxFloors: data.maxFloors ?? 10,
        })
      }
    } catch {
      toast.error('Could not load settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const onSubmit = async (data: SettingsFormInputs) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error()
      toast.success('Master settings updated successfully!')
      fetchSettings()
    } catch {
      toast.error('Failed to update settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Master Settings</h2>
        <p className="text-xs font-semibold text-slate-400">Configure parameters for utility calculators and automated app behaviors</p>
      </div>

      {isLoading ? (
        <Card className="space-y-4">
          <Skeleton className="h-10 w-full animate-pulse" />
          <Skeleton className="h-10 w-full animate-pulse" />
          <Skeleton className="h-10 w-full animate-pulse" />
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
          <Card className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-brand-600" />
              <span>General Configurations</span>
            </h3>

            <Input
              id="appraisalPercent"
              type="number"
              step="0.1"
              label="Default Annual Rent Appraisal (%)"
              placeholder="e.g. 5.0"
              error={errors.appraisalPercent?.message}
              {...register('appraisalPercent', { valueAsNumber: true })}
            />
            <p className="text-[11px] text-slate-400 font-semibold -mt-2">
              Default rate applied automatically when running a rent revision hike on tenant contract anniversaries.
            </p>

            <Input
              id="waterCostPerLitre"
              type="number"
              step="0.001"
              label="Water Cost Per Litre (₹ / Litre)"
              placeholder="e.g. 0.05"
              error={errors.waterCostPerLitre?.message}
              {...register('waterCostPerLitre', { valueAsNumber: true })}
            />
            <p className="text-[11px] text-slate-400 font-semibold -mt-2">
              Cost snapshots saved at logging water entries (e.g. ₹0.05/litre implies ₹50 per 1000 litres).
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Input
                id="lateFeeAmount"
                type="number"
                label="Late Fee Flat Amount (₹)"
                placeholder="e.g. 200"
                error={errors.lateFeeAmount?.message}
                {...register('lateFeeAmount', { valueAsNumber: true })}
              />

              <Input
                id="lateFeeGraceDays"
                type="number"
                label="Grace Days (Days)"
                placeholder="e.g. 5"
                error={errors.lateFeeGraceDays?.message}
                {...register('lateFeeGraceDays', { valueAsNumber: true })}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold -mt-2">
              Fees applied on overdue invoices after the specified calendar grace days.
            </p>

            <Input
              id="maxFloors"
              type="number"
              label="Maximum Building Floors"
              placeholder="e.g. 10"
              error={errors.maxFloors?.message}
              {...register('maxFloors', { valueAsNumber: true })}
            />
            <p className="text-[11px] text-slate-400 font-semibold -mt-2">
              Defines the highest floor select option available when registering or modifying flat units (e.g. 10 allows selecting from Ground up to 10th floor).
            </p>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isSubmitting} className="gap-1.5 font-bold shadow-md shadow-brand-500/10">
              <Save className="h-4 w-4" />
              <span>Save Configurations</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
