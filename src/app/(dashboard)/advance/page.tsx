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
import { Wallet, Plus, Search, Calendar, ChevronRight } from 'lucide-react'

interface TenantBrief {
  id: string
  name: string
  flat: {
    flatNumber: string
    property: {
      name: string
    }
  }
}

interface AdvanceRecord {
  id: string
  type: 'RECEIVED' | 'DEDUCTED' | 'REFUNDED'
  amount: number
  date: string
  notes: string | null
}

export default function AdvanceHistoryPage() {
  const [tenants, setTenants] = useState<TenantBrief[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')
  const [records, setRecords] = useState<AdvanceRecord[]>([])
  const [runningBalance, setRunningBalance] = useState<number>(0)
  
  const [isLoadingTenants, setIsLoadingTenants] = useState(true)
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    type: 'RECEIVED' as 'RECEIVED' | 'DEDUCTED' | 'REFUNDED',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Fetch tenants
  const fetchTenants = async () => {
    setIsLoadingTenants(true)
    try {
      const response = await fetch('/api/tenants?status=ACTIVE')
      if (!response.ok) throw new Error()
      const data = await response.json()
      setTenants(data)
    } catch {
      toast.error('Could not load active tenants')
    } finally {
      setIsLoadingTenants(false)
    }
  }

  // Fetch advance records for selected tenant
  const fetchAdvanceRecords = async (tenantId: string) => {
    if (!tenantId) {
      setRecords([])
      setRunningBalance(0)
      return
    }
    setIsLoadingRecords(true)
    try {
      const response = await fetch(`/api/advance?tenantId=${tenantId}`)
      if (!response.ok) throw new Error()
      const data: AdvanceRecord[] = await response.json()
      setRecords(data)

      // Compute running balance: sum RECEIVED, subtract DEDUCTED and REFUNDED
      let bal = 0
      // Sort chronologically (date ascending) to compute balance properly
      const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      for (const rec of sorted) {
        if (rec.type === 'RECEIVED') bal += rec.amount
        else bal -= rec.amount
      }
      setRunningBalance(bal)
    } catch {
      toast.error('Could not fetch deposit records')
    } finally {
      setIsLoadingRecords(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  useEffect(() => {
    fetchAdvanceRecords(selectedTenantId)
  }, [selectedTenantId])

  const handleOpenAddModal = () => {
    setForm({
      type: 'RECEIVED',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          ...form
        })
      })
      if (!response.ok) throw new Error()
      toast.success('Deposit ledger updated!')
      setIsModalOpen(false)
      fetchAdvanceRecords(selectedTenantId)
    } catch {
      toast.error('Failed to log deposit movement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const tenantSelectorOptions = [
    { label: 'Select a Tenant Profile', value: '' },
    ...tenants.map(t => ({
      label: `${t.name} · Unit ${t.flat.flatNumber} (${t.flat.property.name})`,
      value: t.id
    }))
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Advance History</h2>
          <p className="text-xs font-semibold text-slate-400">Track and adjust security deposits ledgers per tenant</p>
        </div>
        {selectedTenantId && (
          <Button onClick={handleOpenAddModal} className="shadow-md shadow-brand-500/10 gap-1.5 text-xs font-bold px-3.5 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            <span>Add Ledger Entry</span>
          </Button>
        )}
      </div>

      {/* Tenant Selector */}
      <Card className="p-4 w-full md:max-w-md">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
          Active Tenant Profile
        </label>
        {isLoadingTenants ? (
          <Skeleton className="h-10 w-full animate-pulse" />
        ) : (
          <Select
            id="tenantSelect"
            options={tenantSelectorOptions}
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
          />
        )}
      </Card>

      {/* Ledger contents */}
      {!selectedTenantId ? (
        <EmptyState
          title="Select a tenant profile"
          description="Choose a tenant from the dropdown menu above to inspect their security deposit histories and running balance."
          icon={<Wallet className="h-10 w-10 text-slate-300" />}
        />
      ) : isLoadingRecords ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Running Balance summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm mb-0.5">Security Deposit Balance</h3>
              <p className="text-xs text-slate-400 font-semibold">Total active deposit funds held in trust for this tenant</p>
            </div>
            <div className="text-2xl font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-5 py-2 rounded-2xl shadow-xs">
              ₹{runningBalance.toLocaleString()}
            </div>
          </div>

          {/* Timeline list */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Transaction History</h4>
            {records.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-6">No deposit ledger items logged.</p>
            ) : (
              <div className="relative border-l-2 border-slate-100 pl-6 space-y-5 ml-4 py-2">
                {records.map((rec) => (
                  <div key={rec.id} className="relative flex flex-col bg-white border border-slate-100/80 rounded-xl p-4 shadow-2xs gap-1">
                    {/* Timeline bullet */}
                    <div className={`absolute -left-[31px] top-[18px] h-3.5 w-3.5 rounded-full border-2 border-white ring-4 ring-slate-100 ${
                      rec.type === 'RECEIVED' ? 'bg-emerald-500' :
                      rec.type === 'DEDUCTED' ? 'bg-rose-500' :
                      'bg-blue-500'
                    }`} />
                    
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md ${
                        rec.type === 'RECEIVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        rec.type === 'DEDUCTED' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {rec.type}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(rec.date).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <p className="text-base font-black text-slate-800 mt-1">₹{rec.amount.toLocaleString()}</p>
                    {rec.notes && <p className="text-xs text-slate-500 font-medium italic mt-1">{rec.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Deposit Ledger Entry"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Select
            id="modalAdvType"
            label="Entry Type"
            options={[
              { label: 'RECEIVED (Tenant deposit top-up)', value: 'RECEIVED' },
              { label: 'DEDUCTED (Deduct against unpaid dues)', value: 'DEDUCTED' },
              { label: 'REFUNDED (Return balance back to tenant)', value: 'REFUNDED' },
            ]}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
          />

          <Input
            id="modalAdvAmount"
            type="number"
            label="Amount (₹)"
            placeholder="e.g. 5000"
            value={form.amount || ''}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
          />

          <Input
            id="modalAdvDate"
            type="date"
            label="Transaction Date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <Input
            id="modalAdvNotes"
            label="Transaction Notes"
            placeholder="e.g. Security deposit top-up received via UPI"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add Ledger Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
