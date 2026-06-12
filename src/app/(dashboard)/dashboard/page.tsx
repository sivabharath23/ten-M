'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  DollarSign,
  Percent,
  DoorOpen,
  TrendingUp,
  Wallet,
  Plus,
  UserPlus,
  Building2,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  BellRing
} from 'lucide-react'

interface KPI {
  totalCollected: number
  pendingDues: number
  occupancyRate: number
  vacantFlats: number
  appraisalsDue: number
  advanceHeld: number
}

interface CollectionBar {
  label: string
  collected: number
  pending: number
}

interface Occupancy {
  occupied: number
  vacant: number
}

interface Activity {
  type: 'rent' | 'tenant' | 'appraisal' | 'advance'
  title: string
  description: string
  date: string
}

interface DashboardData {
  kpis: KPI
  charts: {
    collection6m: CollectionBar[]
    occupancy: Occupancy
  }
  activities: Activity[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error()
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch {
      toast.error('Could not load dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleQuickGenerate = async () => {
    setIsGenerating(true)
    const now = new Date()
    try {
      const response = await fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: now.getMonth() + 1,
          year: now.getFullYear()
        })
      })
      const resData = await response.json()
      if (!response.ok) throw new Error(resData.error || 'Generation failed')

      toast.success(
        resData.generated > 0
          ? `Generated ${resData.generated} new rent records!`
          : 'Rent records are already up-to-date.'
      )
      fetchDashboardData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate rent records')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full md:col-span-2" />
          <Skeleton className="h-80 w-full md:col-span-1" />
        </div>
      </div>
    )
  }

  const { kpis, charts, activities } = data

  // Calculation for SVG Donut Chart
  const totalFlats = charts.occupancy.occupied + charts.occupancy.vacant
  const occupancyAngle = totalFlats > 0 ? (charts.occupancy.occupied / totalFlats) * 100 : 0
  const strokeDashArray = 2 * Math.PI * 30 // radius 30 -> 188.49
  const strokeDashOffset = strokeDashArray - (occupancyAngle / 100) * strokeDashArray

  // Max value in 6m chart to scale bar heights
  const maxBarValue = Math.max(
    ...charts.collection6m.map(c => c.collected + c.pending),
    10000 // default min height to prevent divide by zero / visual flatness
  )

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-brand-600 text-white rounded-3xl p-5 gap-4 shadow-lg shadow-brand-500/10">
        <div>
          <h2 className="text-xl font-black tracking-tight">Overview Dashboard</h2>
          <p className="text-xs text-brand-100 font-semibold mt-0.5">Welcome back to your Tenant Management System</p>
        </div>
        <Button
          onClick={handleQuickGenerate}
          isLoading={isGenerating}
          variant="outline"
          className="text-xs font-bold bg-white/10 hover:bg-white/20 border-white/20 text-white gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync Month's Bills</span>
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Month collected', val: `₹${kpis.totalCollected.toLocaleString()}`, sub: 'Rent received', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Pending dues', val: `₹${kpis.pendingDues.toLocaleString()}`, sub: 'Uncollected bills', icon: TrendingDown, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Occupancy rate', val: `${kpis.occupancyRate}%`, sub: 'Active leases', icon: Percent, color: 'text-brand-600 bg-brand-50 border-brand-100' },
          { label: 'Vacant units', val: kpis.vacantFlats.toString(), sub: 'Available flats', icon: DoorOpen, color: 'text-slate-600 bg-slate-50 border-slate-250/60' },
          { label: 'Hikes due soon', val: kpis.appraisalsDue.toString(), sub: 'Anniversaries in 30d', icon: TrendingUp, color: 'text-violet-600 bg-violet-50 border-violet-100' },
          { label: 'Advance held', val: `₹${kpis.advanceHeld.toLocaleString()}`, sub: 'Deposits ledger', icon: Wallet, color: 'text-sky-600 bg-sky-50 border-sky-100' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <Card key={idx} className="p-3 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</span>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-base font-black text-slate-800 leading-tight">{kpi.val}</p>
                <p className="text-[9px] text-slate-400 font-semibold">{kpi.sub}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* SVG Bar Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Rent Collection History</h3>
            <p className="text-xs text-slate-400 font-semibold">6-month comparison of collected vs pending dues</p>
          </div>

          <div className="h-60 flex items-end justify-between pt-4 px-2">
            {charts.collection6m.map((bar, idx) => {
              const collectedHeight = Math.round((bar.collected / maxBarValue) * 100)
              const pendingHeight = Math.round((bar.pending / maxBarValue) * 100)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 max-w-[64px]">
                  {/* Visual Bar Column */}
                  <div className="w-8 flex flex-col justify-end gap-[2px] h-44 bg-slate-50 rounded-t-lg overflow-hidden">
                    {bar.pending > 0 && (
                      <div
                        style={{ height: `${Math.max(4, pendingHeight)}%` }}
                        className="w-full bg-amber-500 rounded-t-xs"
                        title={`Pending: ₹${bar.pending.toLocaleString()}`}
                      />
                    )}
                    {bar.collected > 0 && (
                      <div
                        style={{ height: `${Math.max(4, collectedHeight)}%` }}
                        className="w-full bg-brand-600 rounded-t-xs"
                        title={`Collected: ₹${bar.collected.toLocaleString()}`}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-black whitespace-nowrap">{bar.label}</span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 border-t border-slate-50 px-2 justify-center sm:justify-start">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-brand-600" />
              <span>Collected Amount</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-amber-500" />
              <span>Pending Dues</span>
            </div>
          </div>
        </Card>

        {/* SVG Donut Chart */}
        <Card className="flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Property Occupancy</h3>
            <p className="text-xs text-slate-400 font-semibold">Ratio of occupied vs vacant flat units</p>
          </div>

          <div className="flex items-center justify-center relative my-3">
            <svg width="150" height="150" viewBox="0 0 80 80" className="-rotate-90">
              {/* Vacant / Background Circle */}
              <circle
                cx="40"
                cy="40"
                r="30"
                fill="transparent"
                className="stroke-slate-100"
                strokeWidth="7.5"
              />
              {/* Occupied Circle */}
              {totalFlats > 0 && (
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="transparent"
                  className="stroke-brand-600"
                  strokeWidth="7.5"
                  strokeDasharray={strokeDashArray}
                  strokeDashoffset={strokeDashOffset}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-800">{kpis.occupancyRate}%</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Occupied</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-center text-xs font-semibold text-slate-600">
            <div className="border-r border-slate-200">
              <span className="text-slate-400 font-bold block">Occupied Units</span>
              <span className="text-slate-800 font-black text-sm">{charts.occupancy.occupied}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Vacant Units</span>
              <span className="text-slate-800 font-black text-sm">{charts.occupancy.vacant}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent activity timeline */}
        <Card className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Recent Activity</h3>
            <p className="text-xs text-slate-400 font-semibold">Real-time log of portal transactions and register updates</p>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold text-center py-6">No portal actions logged yet.</p>
          ) : (
            <div className="relative border-l-2 border-slate-100 pl-5 ml-2 space-y-4 py-1">
              {activities.map((act, idx) => (
                <div key={idx} className="relative space-y-0.5">
                  {/* Timeline bullet */}
                  <div className={`absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full border border-white ${act.type === 'rent' ? 'bg-emerald-500' :
                    act.type === 'tenant' ? 'bg-brand-600' :
                      act.type === 'appraisal' ? 'bg-violet-500' :
                        'bg-sky-500'
                    }`} />
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">{act.type}</span>
                    <span>{new Date(act.date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800">{act.title}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{act.description}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick action shortcuts */}
        <Card className="space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Quick Shortcuts</h3>
            <p className="text-xs text-slate-400 font-semibold">Instant triggers to onboard elements or settings</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link href="/properties">
              <button className="flex items-center justify-between w-full p-4 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-2xl hover:border-slate-200 transition-all cursor-pointer text-left">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Add Property</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Register buildings</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </Link>

            <Link href="/tenants">
              <button className="flex items-center justify-between w-full p-4 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-2xl hover:border-slate-200 transition-all cursor-pointer text-left">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <UserPlus className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Register Tenant</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Assign occupied flats</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </Link>

            <Link href="/settings">
              <button className="flex items-center justify-between w-full p-4 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-2xl hover:border-slate-200 transition-all cursor-pointer text-left">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Master settings</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Adjust fee & appraisal rates</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
