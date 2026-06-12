'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { Banknote, RefreshCw, Calendar, Edit3, Building2 } from 'lucide-react'

interface Property {
  id: string
  name: string
}

interface RentRecord {
  id: string
  month: number
  year: number
  rentAmount: number
  paidAmount: number
  paidOn: string | null
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE'
  notes: string | null
  tenant: {
    name: string
    phone: string
  }
  flat: {
    flatNumber: string
    property: {
      name: string
    }
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

export default function RentCollectionPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear())
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')
  
  const [properties, setProperties] = useState<Property[]>([])
  const [rentRecords, setRentRecords] = useState<RentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<RentRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    status: 'PAID' as 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE',
    paidAmount: 0,
    notes: ''
  })

  // Years options for selector
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentDate.getFullYear() - 2 + i
    return { label: y.toString(), value: y }
  })

  const fetchPropertiesAndRecords = async () => {
    setIsLoading(true)
    try {
      // Fetch properties for filter dropdown
      const propResponse = await fetch('/api/properties')
      if (!propResponse.ok) throw new Error()
      const propData = await propResponse.json()
      setProperties(propData)

      // Fetch rent records
      const response = await fetch(
        `/api/rent?month=${selectedMonth}&year=${selectedYear}&propertyId=${selectedPropertyId}`
      )
      if (!response.ok) throw new Error()
      const data = await response.json()
      setRentRecords(data)
    } catch {
      toast.error('Could not load rent collection details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPropertiesAndRecords()
  }, [selectedMonth, selectedYear, selectedPropertyId])

  const handleGenerateRecords = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate billing records')
      
      toast.success(
        data.generated > 0 
          ? `Successfully generated ${data.generated} new rent records for this month!` 
          : 'Billing records are already generated and up to date for this month.'
      )
      fetchPropertiesAndRecords()
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate rent records')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOpenUpdateModal = (rec: RentRecord) => {
    setSelectedRecord(rec)
    setUpdateForm({
      status: rec.status,
      paidAmount: rec.status === 'PAID' ? rec.rentAmount : rec.paidAmount || rec.rentAmount,
      notes: rec.notes || ''
    })
    setIsUpdateModalOpen(true)
  }

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/rent/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateForm.status,
          paidAmount: parseFloat(updateForm.paidAmount.toString()),
          paidOn: updateForm.status === 'PAID' ? new Date().toISOString() : null,
          notes: updateForm.notes || null
        })
      })
      if (!response.ok) throw new Error()
      toast.success('Rent collection record updated!')
      setIsUpdateModalOpen(false)
      fetchPropertiesAndRecords()
    } catch {
      toast.error('Failed to save collection update')
    } finally {
      setIsSubmitting(false)
    }
  }

  const propertyFilterOptions = [
    { label: 'All Buildings', value: 'all' },
    ...properties.map(p => ({ label: p.name, value: p.id }))
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Rent Collection</h2>
          <p className="text-xs font-semibold text-slate-400">Record, update, and generate monthly tenant rent charges</p>
        </div>
        
        {/* Bulk generation button */}
        <Button 
          onClick={handleGenerateRecords} 
          isLoading={isGenerating} 
          variant="primary" 
          className="shadow-md shadow-brand-500/10 gap-1.5 text-xs font-bold px-3.5 self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Generate Month's Bills</span>
        </Button>
      </div>

      {/* Query Filters */}
      <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
            Billing Month
          </label>
          <Select
            id="monthSelect"
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
            id="yearSelect"
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
            id="propertySelect"
            options={propertyFilterOptions}
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
          />
        </div>
      </Card>

      {/* Records Listing */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full animate-pulse" />
          ))}
        </div>
      ) : rentRecords.length === 0 ? (
        <EmptyState
          title="No rent logs generated"
          description="We couldn't locate rent bills for the selected date and property filters. Click the button above to generate bills for active tenants."
          icon={<Banknote className="h-10 w-10 text-slate-300" />}
          actionLabel="Generate Rent Bills"
          onAction={handleGenerateRecords}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3.5">Flat No.</th>
                  <th className="px-5 py-3.5">Tenant Name</th>
                  <th className="px-5 py-3.5">Building</th>
                  <th className="px-5 py-3.5">Rent Due</th>
                  <th className="px-5 py-3.5">Collected</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {rentRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">{rec.flat.flatNumber}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">{rec.tenant.name}</td>
                    <td className="px-5 py-4">{rec.flat.property.name}</td>
                    <td className="px-5 py-4">₹{rec.rentAmount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-emerald-600">₹{rec.paidAmount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <Badge variant={rec.status === 'PAID' ? 'paid' : rec.status === 'PARTIAL' ? 'partial' : rec.status === 'OVERDUE' ? 'overdue' : 'pending'}>
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 text-[11px] font-bold gap-1 text-slate-600"
                        onClick={() => handleOpenUpdateModal(rec)}
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Update</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Payment Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={selectedRecord ? `Update Collection: Flat ${selectedRecord.flat.flatNumber} (${selectedRecord.tenant.name})` : 'Update Collection Entry'}
      >
        <form onSubmit={handleSaveUpdate} className="space-y-4">
          <Select
            id="payStatus"
            label="Payment Collection Status"
            options={[
              { label: 'PENDING (Uncollected)', value: 'PENDING' },
              { label: 'PAID (Fully Collected)', value: 'PAID' },
              { label: 'PARTIAL (Partially Collected)', value: 'PARTIAL' },
              { label: 'OVERDUE (Delayed)', value: 'OVERDUE' },
            ]}
            value={updateForm.status}
            onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as any })}
          />

          <Input
            id="payAmount"
            type="number"
            label="Amount Collected (₹)"
            value={updateForm.paidAmount || ''}
            onChange={(e) => setUpdateForm({ ...updateForm, paidAmount: parseFloat(e.target.value) || 0 })}
          />

          <Input
            id="payNotes"
            label="Remarks / Notes"
            placeholder="e.g. Paid via UPI Bank Transfer"
            value={updateForm.notes}
            onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Collection Details
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
