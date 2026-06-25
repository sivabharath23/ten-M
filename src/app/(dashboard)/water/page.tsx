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
import { Droplets, Plus, Calendar, ToggleLeft, Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

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
  reading: number
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

  // Delete States
  const [isDeleteWaterOpen, setIsDeleteWaterOpen] = useState(false)
  const [waterToDelete, setWaterToDelete] = useState<WaterRecord | null>(null)
  const [isDeletingWater, setIsDeletingWater] = useState(false)

  // Multi-select / Bulk Delete States
  const [selectedWaterIds, setSelectedWaterIds] = useState<string[]>([])
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [lastReading, setLastReading] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<WaterFormInputs>({
    resolver: zodResolver(waterRecordSchema),
    defaultValues: {
      flatId: '',
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      reading: 0,
    },
  })

  // Fetch years list
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentDate.getFullYear() - 2 + i
    return { label: y.toString(), value: y }
  })

  const watchFlatId = watch('flatId')
  const watchMonth = watch('month')
  const watchYear = watch('year')

  const fetchLastReading = async (flatId: string, month: number, year: number) => {
    if (!flatId) {
      setLastReading(null)
      return
    }
    try {
      const res = await fetch(`/api/water/last-reading?flatId=${flatId}&month=${month}&year=${year}`)
      if (res.ok) {
        const data = await res.json()
        setLastReading(data.hasPrevious ? data.reading : null)
      } else {
        setLastReading(null)
      }
    } catch {
      setLastReading(null)
    }
  }

  useEffect(() => {
    if (watchFlatId && watchMonth && watchYear) {
      fetchLastReading(watchFlatId, Number(watchMonth), Number(watchYear))
    } else {
      setLastReading(null)
    }
  }, [watchFlatId, watchMonth, watchYear])

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
      setSelectedWaterIds([])
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
      reading: 0,
    })
    setLastReading(null)
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

  const handleDeleteWaterClick = (rec: WaterRecord) => {
    setWaterToDelete(rec)
    setIsDeleteWaterOpen(true)
  }

  const handleConfirmDeleteWater = async () => {
    if (!waterToDelete) return
    setIsDeletingWater(true)
    try {
      const response = await fetch(`/api/water/${waterToDelete.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error()
      toast.success('Water usage log deleted successfully')
      setIsDeleteWaterOpen(false)
      setWaterToDelete(null)
      fetchWaterDetails()
    } catch {
      toast.error('Could not delete water usage log')
    } finally {
      setIsDeletingWater(false)
    }
  }

  const handleSelectWater = (id: string) => {
    setSelectedWaterIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedWaterIds.length === waterRecords.length) {
      setSelectedWaterIds([])
    } else {
      setSelectedWaterIds(waterRecords.map(rec => rec.id))
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (selectedWaterIds.length === 0) return
    setIsBulkDeleting(true)
    try {
      const response = await fetch('/api/water', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedWaterIds })
      })
      if (!response.ok) throw new Error()
      toast.success(`Successfully deleted ${selectedWaterIds.length} water logs!`)
      setSelectedWaterIds([])
      setIsBulkDeleteOpen(false)
      fetchWaterDetails()
    } catch {
      toast.error('Could not delete selected water usage logs')
    } finally {
      setIsBulkDeleting(false)
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
          {/* Bulk Action Bar */}
          {selectedWaterIds.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-rose-800 uppercase tracking-wider">
                  Bulk Actions:
                </span>
                <span className="text-xs font-bold text-rose-700">
                  {selectedWaterIds.length} water log{selectedWaterIds.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold px-3 py-1.5 text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedWaterIds([])}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="text-xs font-bold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-sm gap-1.5 cursor-pointer"
                  onClick={() => setIsBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Selected</span>
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3.5 w-10">
                      <input 
                        type="checkbox"
                        checked={waterRecords.length > 0 && selectedWaterIds.length === waterRecords.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer h-4 w-4"
                      />
                    </th>
                    <th className="px-5 py-3.5">Flat No.</th>
                    <th className="px-5 py-3.5">Tenant Name</th>
                    <th className="px-5 py-3.5">Building</th>
                    <th className="px-5 py-3.5">Reading (L)</th>
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
                      <td className="px-5 py-4">
                        <input 
                          type="checkbox"
                          checked={selectedWaterIds.includes(rec.id)}
                          onChange={() => handleSelectWater(rec.id)}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer h-4 w-4"
                        />
                      </td>
                       <td className="px-5 py-4 font-bold text-slate-900">{rec.flat.flatNumber}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{getActiveTenantName(rec)}</td>
                      <td className="px-5 py-4">{rec.flat.property.name}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{rec.reading?.toLocaleString() || '0'} L</td>
                      <td className="px-5 py-4">{rec.unitsConsumed.toLocaleString()} L</td>
                      <td className="px-5 py-4">₹{rec.costPerLitre}</td>
                      <td className="px-5 py-4 text-slate-900 font-bold">₹{rec.totalCost.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <Badge variant={rec.isPaid ? 'paid' : 'pending'}>
                          {rec.isPaid ? 'PAID' : 'PENDING'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1 text-rose-600 border-rose-200/60 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                            onClick={() => handleDeleteWaterClick(rec)}
                            title="Delete Water Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Records List
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] font-bold px-2 py-1 gap-1 text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
              onClick={handleSelectAll}
            >
              {selectedWaterIds.length === waterRecords.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {waterRecords.map((rec) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow duration-150 flex flex-col justify-between p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox"
                      checked={selectedWaterIds.includes(rec.id)}
                      onChange={() => handleSelectWater(rec.id)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer h-4 w-4 mt-1"
                    />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Flat Unit</span>
                      <span className="font-extrabold text-slate-900 text-sm">{rec.flat.flatNumber} · {rec.flat.property.name}</span>
                    </div>
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
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">Reading / Usage</span>
                    <span className="font-extrabold text-slate-800">{rec.reading?.toLocaleString() || '0'} L / {rec.unitsConsumed.toLocaleString()} L</span>
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

                <div className="pt-1 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 justify-center text-xs font-bold gap-1 py-2 ${
                      rec.isPaid ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-800'
                    }`}
                    onClick={() => handleTogglePayment(rec.id, rec.isPaid)}
                  >
                    <ToggleLeft className="h-4 w-4" />
                    <span>{rec.isPaid ? 'Mark Unpaid' : 'Mark Paid'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 py-2 px-3 cursor-pointer"
                    onClick={() => handleDeleteWaterClick(rec)}
                    title="Delete Water Record"
                  >
                    <Trash2 className="h-4 w-4" />
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

           {lastReading === null ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-800 font-bold leading-normal">
                🔔 No initial reading found for this flat! You must first record the starting/initial meter reading to establish a baseline before logging monthly water bills.
              </div>
              <Input
                id="reading"
                type="number"
                label="Initial Starting Meter Reading (L)"
                placeholder="e.g. 10000"
                error={errors.reading?.message}
                {...register('reading', { valueAsNumber: true })}
              />
              <p className="text-[11px] text-slate-400 font-semibold -mt-2">
                Note: Usage and bill amount for this initial baseline log will be ₹0.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                id="reading"
                type="number"
                label="Current Water Meter Reading (Litres)"
                placeholder="e.g. 12500"
                error={errors.reading?.message}
                {...register('reading', { valueAsNumber: true })}
              />
              <p className="text-[11px] text-emerald-600 font-bold -mt-2">
                Previous reading: {lastReading.toLocaleString()} L. Calculated usage: {watch('reading') ? Math.max(0, Number(watch('reading')) - lastReading).toLocaleString() : 0} L.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {lastReading === null ? 'Register Initial Reading' : 'Register Usage Log'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteWaterOpen}
        onClose={() => {
          setIsDeleteWaterOpen(false)
          setWaterToDelete(null)
        }}
        onConfirm={handleConfirmDeleteWater}
        title="Delete Water Bill Record"
        message={waterToDelete ? `Are you sure you want to permanently delete the water usage bill log for Flat ${waterToDelete.flat.flatNumber} (${getActiveTenantName(waterToDelete)}) for ${MONTHS_LIST.find(m => m.value === waterToDelete.month)?.label || ''} ${waterToDelete.year}?` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeletingWater}
      />

      <ConfirmModal
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Selected Water Bill Records"
        message={`Are you sure you want to permanently delete the ${selectedWaterIds.length} selected water bill logs? This action cannot be undone.`}
        confirmText="Delete Selected"
        cancelText="Cancel"
        type="danger"
        isLoading={isBulkDeleting}
      />
    </div>
  )
}
