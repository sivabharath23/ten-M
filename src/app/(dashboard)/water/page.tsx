'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { waterRecordSchema } from '@/lib/validations'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { Droplets, Plus, Calendar, ToggleLeft } from 'lucide-react'

type WaterFormInputs = typeof waterRecordSchema._output

interface PropertyBrief {
  id: string
  name: string
}

interface FlatBrief {
  id: string
  flatNumber: string
  status: string
  tenants: { name: string }[]
}

interface WaterRecord {
  id: string
  month: number
  year: number
  unitsConsumed: number
  costPerLitre: number
  totalCost: number
  isPaid: boolean
  flat: {
    flatNumber: string
    property: {
      name: string
    }
    tenants: {
      name: string
    }[]
  }
}

const MONTHS_LIST = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
]

export default function WaterBillingPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear())
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')

  const [properties, setProperties] = useState<PropertyBrief[]>([])
  const [flats, setFlats] = useState<FlatBrief[]>([])
  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalPropertyId, setModalPropertyId] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WaterFormInputs>({
    resolver: zodResolver(waterRecordSchema),
    defaultValues: {
      flatId: '',
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      unitsConsumed: 0,
    },
  })

  // Fetch years list
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentDate.getFullYear() - 2 + i
    return { label: y.toString(), value: y }
  })

  const fetchWaterDetails = async () => {
    setIsLoading(true)
    try {
      // Fetch properties
      const propRes = await fetch('/api/properties')
      const propData = await propRes.json()
      setProperties(propData)

      // Fetch water logs
      const url = `/api/water?month=${selectedMonth}&year=${selectedYear}&propertyId=${selectedPropertyId}`
      const logsRes = await fetch(url)
      const logsData = await logsRes.json()
      if (Array.isArray(logsData)) {
        logsData.sort((a: any, b: any) =>
          a.flat.flatNumber.localeCompare(b.flat.flatNumber, undefined, { numeric: true, sensitivity: 'base' })
        )
      }
      setWaterRecords(logsData)
    } catch {
      toast.error('Could not fetch water usage details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWaterDetails()
  }, [selectedMonth, selectedYear, selectedPropertyId])

  // Fetch active flats when adding log
  const fetchActiveFlats = async (propertyId: string) => {
    if (!propertyId) {
      setFlats([])
      return
    }
    try {
      const res = await fetch(`/api/flats?propertyId=${propertyId}`)
      const data: FlatBrief[] = await res.json()
      // Filter for occupied flats (they consume water)
      setFlats(data.filter(f => f.status === 'OCCUPIED'))
    } catch {
      toast.error('Could not load flats')
    }
  }

  const handleModalPropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propId = e.target.value
    setModalPropertyId(propId)
    setValue('flatId', '')
    fetchActiveFlats(propId)
  }

  const handleOpenAddModal = () => {
    setModalPropertyId(properties[0]?.id || '')
    fetchActiveFlats(properties[0]?.id || '')
    reset({
      flatId: '',
      month: selectedMonth,
      year: selectedYear,
      unitsConsumed: 0,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: WaterFormInputs) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error()
      toast.success('Water consumption log registered successfully!')
      setIsModalOpen(false)
      fetchWaterDetails()
    } catch {
      toast.error('Could not save water log. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTogglePayment = async (id: string, currentPaid: boolean) => {
    try {
      const response = await fetch(`/api/water/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !currentPaid })
      })
      if (!response.ok) throw new Error()
      toast.success(currentPaid ? 'Bill marked as PENDING' : 'Bill marked as PAID')
      fetchWaterDetails()
    } catch {
      toast.error('Could not update bill status')
    }
  }

  const getActiveTenantName = (rec: WaterRecord) => {
    return rec.flat.tenants?.[0]?.name || 'No tenant'
  }

  const propertyFilterOptions = [
    { label: 'All Properties', value: 'all' },
    ...properties.map(p => ({ label: p.name, value: p.id }))
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Water Bills Tracker</h2>
          <p className="text-xs font-semibold text-slate-400">Log monthly water usage and record utility bill collections</p>
        </div>
        <Button onClick={handleOpenAddModal} className="shadow-md shadow-brand-500/10 gap-1.5 text-xs font-bold px-3.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Log Usage Reading</span>
        </Button>
      </div>

      {/* Query Filters */}
      <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
            Billing Month
          </label>
          <Select
            id="monthSel"
            options={MONTHS_LIST}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
            Billing Year
          </label>
          <Select
            id="yearSel"
            options={yearOptions}
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
            Filter by Property
          </label>
          <Select
            id="propertySel"
            options={propertyFilterOptions}
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
          />
        </div>
      </Card>

      {/* Records listing */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full animate-pulse" />
          ))}
        </div>
      ) : waterRecords.length === 0 ? (
        <EmptyState
          title="No water bills logged"
          description="We couldn't locate water readings for the selected date and property filters. Click the button above to register consumption logs."
          icon={<Droplets className="h-10 w-10 text-slate-300" />}
          actionLabel="Log Water Reading"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3.5">Flat No.</th>
                    <th className="px-5 py-3.5">Tenant Name</th>
                    <th className="px-5 py-3.5">Building</th>
                    <th className="px-5 py-3.5">Usage (Litres)</th>
                    <th className="px-5 py-3.5">Rate (₹/L)</th>
                    <th className="px-5 py-3.5">Total Bill</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {waterRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">{rec.flat.flatNumber}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{getActiveTenantName(rec)}</td>
                      <td className="px-5 py-4">{rec.flat.property.name}</td>
                      <td className="px-5 py-4">{rec.unitsConsumed.toLocaleString()} L</td>
                      <td className="px-5 py-4">₹{rec.costPerLitre}</td>
                      <td className="px-5 py-4 text-slate-900 font-bold">₹{rec.totalCost.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <Badge variant={rec.isPaid ? 'paid' : 'pending'}>
                          {rec.isPaid ? 'PAID' : 'PENDING'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`px-2 py-1 text-[11px] font-bold gap-1 ${
                            rec.isPaid ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                          onClick={() => handleTogglePayment(rec.id, rec.isPaid)}
                        >
                          <ToggleLeft className="h-3.5 w-3.5" />
                          <span>{rec.isPaid ? 'Mark Unpaid' : 'Mark Paid'}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {waterRecords.map((rec) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow duration-150 flex flex-col justify-between p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Flat Unit</span>
                    <span className="font-extrabold text-slate-900 text-sm">{rec.flat.flatNumber} · {rec.flat.property.name}</span>
                  </div>
                  <Badge variant={rec.isPaid ? 'paid' : 'pending'}>
                    {rec.isPaid ? 'PAID' : 'PENDING'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-b border-slate-100 py-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">Tenant</span>
                    <span className="font-extrabold text-slate-800">{getActiveTenantName(rec)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">Usage</span>
                    <span className="font-extrabold text-slate-800">{rec.unitsConsumed.toLocaleString()} L</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">Rate</span>
                    <span className="font-bold text-slate-700">₹{rec.costPerLitre}/L</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">Total Bill</span>
                    <span className="font-black text-slate-900 text-sm">₹{rec.totalCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full justify-center text-xs font-bold gap-1 py-2 ${
                      rec.isPaid ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                    onClick={() => handleTogglePayment(rec.id, rec.isPaid)}
                  >
                    <ToggleLeft className="h-4 w-4" />
                    <span>{rec.isPaid ? 'Mark Unpaid' : 'Mark Paid'}</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Usage logging Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Flat Water Consumption"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="modalProperty"
              label="Select Building"
              options={properties.map(p => ({ label: p.name, value: p.id }))}
              value={modalPropertyId}
              onChange={handleModalPropertyChange}
            />

            <Select
              id="flatId"
              label="Select Occupied Flat"
              options={flats.map(f => ({ label: `Flat ${f.flatNumber} (${f.tenants[0]?.name || 'Unknown'})`, value: f.id }))}
              error={errors.flatId?.message}
              {...register('flatId')}
              disabled={!modalPropertyId || flats.length === 0}
              placeholder={modalPropertyId ? (flats.length === 0 ? 'No occupied flats' : 'Select Flat') : 'Select Property first'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              id="logMonth"
              label="Month"
              options={MONTHS_LIST}
              error={errors.month?.message}
              {...register('month', { valueAsNumber: true })}
              defaultValue={selectedMonth}
            />

            <Select
              id="logYear"
              label="Year"
              options={yearOptions}
              error={errors.year?.message}
              {...register('year', { valueAsNumber: true })}
              defaultValue={selectedYear}
            />
          </div>

          <Input
            id="unitsConsumed"
            type="number"
            label="Water Units Consumed (Litres)"
            placeholder="e.g. 2500"
            error={errors.unitsConsumed?.message}
            {...register('unitsConsumed', { valueAsNumber: true })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Register Usage Log
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
