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
import { TrendingUp, RefreshCw, Award, Calendar, Sparkles } from 'lucide-react'

interface TenantDue {
  id: string
  name: string
  joiningDate: string
  currentRent: number
  flat: {
    flatNumber: string
    property: {
      name: string
    }
  }
}

interface RevisionPast {
  id: string
  previousRent: number
  newRent: number
  appraisalPercent: number
  effectiveDate: string
  tenant: {
    name: string
    flat: {
      flatNumber: string
      property: {
        name: string
      }
    }
  }
}

export default function AppraisalsPage() {
  const [activeTab, setActiveTab] = useState<'due' | 'past'>('due')
  const [dueTenants, setDueTenants] = useState<TenantDue[]>([])
  const [pastRevisions, setPastRevisions] = useState<RevisionPast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<TenantDue | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customPercent, setCustomPercent] = useState<string>('')

  const fetchAppraisalData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/appraisals?type=${activeTab}`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      
      if (activeTab === 'due') {
        setDueTenants(data)
      } else {
        setPastRevisions(data)
      }
    } catch {
      toast.error('Could not load appraisal logs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppraisalData()
  }, [activeTab])

  const handleOpenHikeModal = (tenant: TenantDue) => {
    setSelectedTenant(tenant)
    setCustomPercent('')
    setIsModalOpen(true)
  }

  const handleApplyHike = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTenant) return
    setIsSubmitting(true)
    try {
      const percentValue = customPercent ? parseFloat(customPercent) : undefined
      const response = await fetch('/api/appraisals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          customPercent: percentValue
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to apply hike')

      toast.success(`Hike applied successfully! New rent is ₹${data.newRent.toLocaleString()}`)
      setIsModalOpen(false)
      fetchAppraisalData()
    } catch (err: any) {
      toast.error(err.message || 'Could not apply rent increase')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Rent Appraisals</h2>
          <p className="text-xs font-semibold text-slate-400">Review anniversaries and apply contract rent hikes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('due')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'due' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Due For Hike
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'past' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Revision History
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'due' ? (
        // Due tenants list
        dueTenants.length === 0 ? (
          <EmptyState
            title="All appraisals up to date"
            description="There are currently no active tenant profiles matching the 12-month rent hike eligibility criteria."
            icon={<Sparkles className="h-10 w-10 text-brand-300" />}
          />
        ) : (
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Tenant Name</th>
                    <th className="px-5 py-3.5">Flat No.</th>
                    <th className="px-5 py-3.5">Building</th>
                    <th className="px-5 py-3.5">Joining Date</th>
                    <th className="px-5 py-3.5">Current Rent</th>
                    <th className="px-5 py-3.5 text-right">Appraisal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {dueTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">{tenant.name}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{tenant.flat.flatNumber}</td>
                      <td className="px-5 py-4">{tenant.flat.property.name}</td>
                      <td className="px-5 py-4">{new Date(tenant.joiningDate).toLocaleDateString()}</td>
                      <td className="px-5 py-4">₹{tenant.currentRent.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2.5 py-1 text-[11px] font-bold gap-1 text-slate-700 hover:text-brand-700"
                          onClick={() => handleOpenHikeModal(tenant)}
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Hike Rent</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        // Past revisions history
        pastRevisions.length === 0 ? (
          <EmptyState
            title="No past revisions logged"
            description="Once you apply rent increases, audits and historical values will be tracked here."
            icon={<Award className="h-10 w-10 text-slate-300" />}
          />
        ) : (
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Tenant Name</th>
                    <th className="px-5 py-3.5">Flat No.</th>
                    <th className="px-5 py-3.5">Hike %</th>
                    <th className="px-5 py-3.5">Old Rent</th>
                    <th className="px-5 py-3.5">New Rent</th>
                    <th className="px-5 py-3.5">Effective Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {pastRevisions.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">{rev.tenant.name}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        Flat {rev.tenant.flat.flatNumber} ({rev.tenant.flat.property.name})
                      </td>
                      <td className="px-5 py-4 text-brand-700 font-extrabold">+{rev.appraisalPercent}%</td>
                      <td className="px-5 py-4 text-slate-500">₹{rev.previousRent.toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-900 font-bold">₹{rev.newRent.toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-400">{new Date(rev.effectiveDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Hike Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTenant ? `Hike Rent: ${selectedTenant.name} (Flat ${selectedTenant.flat.flatNumber})` : 'Hike Rent'}
      >
        <form onSubmit={handleApplyHike} className="space-y-4">
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Register appraisal details. If you leave custom hike empty, the default rate defined in your Master Settings will be applied.
          </p>

          <Input
            id="modalHikePercent"
            type="number"
            step="0.1"
            label="Hike Rate (%)"
            placeholder="e.g. 5.5"
            value={customPercent}
            onChange={(e) => setCustomPercent(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Apply Rent Hike
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
