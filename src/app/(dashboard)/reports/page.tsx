'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { FileBarChart, Download, Calendar, Filter } from 'lucide-react'

interface Property {
  id: string
  name: string
}

const REPORT_TYPES = [
  { id: 'rent', label: 'Rent Invoices' },
  { id: 'overdue', label: 'Overdue Dues' },
  { id: 'water', label: 'Water Bills' },
  { id: 'occupancy', label: 'Occupancy Status' },
  { id: 'revision', label: 'Rent Appraisals' },
]

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

export default function ReportsPage() {
  const currentDate = new Date()
  const [activeTab, setActiveTab] = useState<string>('rent')
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear())
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')
  
  const [properties, setProperties] = useState<Property[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentDate.getFullYear() - 2 + i
    return { label: y.toString(), value: y }
  })

  const fetchPropertiesAndReportData = async () => {
    setIsLoading(true)
    try {
      // Fetch properties for filters
      const propResponse = await fetch('/api/properties')
      if (!propResponse.ok) throw new Error()
      const propData = await propResponse.json()
      setProperties(propData)

      // Build report URL
      // Only include month/year for time-bound reports (rent, water)
      const isTimeBound = activeTab === 'rent' || activeTab === 'water'
      let url = `/api/reports?type=${activeTab}&propertyId=${selectedPropertyId}`
      if (isTimeBound) {
        url += `&month=${selectedMonth}&year=${selectedYear}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setReportData(data)
    } catch {
      toast.error('Could not compile report data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPropertiesAndReportData()
  }, [activeTab, selectedMonth, selectedYear, selectedPropertyId])

  const handleExportCSV = () => {
    if (reportData.length === 0) {
      toast.error('No data available to export')
      return
    }
    try {
      const csv = Papa.unparse(reportData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `TenM_${activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Report exported successfully!')
    } catch {
      toast.error('Export compilation failed')
    }
  }

  // Get dynamic table headers from keys of the first data object
  const getTableHeaders = () => {
    if (reportData.length === 0) return []
    return Object.keys(reportData[0])
  }

  const propertyFilterOptions = [
    { label: 'All Properties', value: 'all' },
    ...properties.map(p => ({ label: p.name, value: p.id }))
  ]

  const isTimeFilterVisible = activeTab === 'rent' || activeTab === 'water'
  const isPropertyFilterVisible = activeTab !== 'revision'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Reports & Exports</h2>
          <p className="text-xs font-semibold text-slate-400">Preview reports and download printable spreadsheets</p>
        </div>
        {reportData.length > 0 && (
          <Button 
            onClick={handleExportCSV} 
            variant="primary" 
            className="shadow-md shadow-brand-500/10 gap-1.5 text-xs font-bold px-3.5 self-start sm:self-auto"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </Button>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full border border-slate-200/50 overflow-x-auto">
        {REPORT_TYPES.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] text-center py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Card */}
      {(isTimeFilterVisible || isPropertyFilterVisible) && (
        <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isTimeFilterVisible && (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Month</span>
                </label>
                <Select
                  id="repMonth"
                  options={MONTHS_LIST}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Year</span>
                </label>
                <Select
                  id="repYear"
                  options={yearOptions}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                />
              </div>
            </>
          )}

          {isPropertyFilterVisible && (
            <div className={isTimeFilterVisible ? '' : 'sm:col-span-2 md:col-span-1'}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>Property Building</span>
              </label>
              <Select
                id="repProp"
                options={propertyFilterOptions}
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
              />
            </div>
          )}
        </Card>
      )}

      {/* Preview Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full animate-pulse" />
          ))}
        </div>
      ) : reportData.length === 0 ? (
        <EmptyState
          title="No report entries compile"
          description="We couldn't compile any matching spreadsheet rows for the selected filters. Verify records or billing dates."
          icon={<FileBarChart className="h-10 w-10 text-slate-300" />}
        />
      ) : (
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Report Preview ({reportData.length} records)
          </span>
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {getTableHeaders().map((header, idx) => (
                      <th key={idx} className="px-5 py-3.5 whitespace-nowrap">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {reportData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                      {getTableHeaders().map((header, colIdx) => (
                        <td key={colIdx} className="px-5 py-4 whitespace-nowrap">
                          {row[header]?.toString() || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
