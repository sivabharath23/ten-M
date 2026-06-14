'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Droplets,
  Plus,
  AlertCircle,
  FileText,
  Upload,
  Eye,
  RefreshCw,
  Edit,
  ToggleLeft,
  Edit3,
  Trash2
} from 'lucide-react'

interface Property {
  id: string
  name: string
}

interface Flat {
  id: string
  flatNumber: string
  baseRent: number
  property: Property
}

interface RentRecord {
  id: string
  month: number
  year: number
  rentAmount: number
  paidAmount: number
  paidOn: string | null
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE'
  paymentMode: string | null
  notes: string | null
}

interface AdvanceRecord {
  id: string
  type: 'RECEIVED' | 'DEDUCTED' | 'REFUNDED'
  amount: number
  date: string
  notes: string | null
}

interface RentRevision {
  id: string
  previousRent: number
  newRent: number
  appraisalPercent: number
  effectiveDate: string
  notes: string | null
}

interface WaterRecord {
  id: string
  month: number
  year: number
  unitsConsumed: number
  costPerLitre: number
  totalCost: number
  isPaid: boolean
  paidOn: string | null
}

interface TenantDetail {
  id: string
  flatId: string
  name: string
  phone: string
  email: string | null
  idProofType: string | null
  idProofNumber: string | null
  idProofUrl: string | null
  joiningDate: string
  currentRent: number
  advanceAmount: number
  status: 'ACTIVE' | 'VACATED'
  flat: Flat
  rentRecords: RentRecord[]
  advanceRecords: AdvanceRecord[]
  rentRevisions: RentRevision[]
  waterRecords: WaterRecord[]
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const tenantId = resolvedParams.id

  const [tenant, setTenant] = useState<TenantDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'rent' | 'advance' | 'water' | 'appraisal'>('rent')
  
  // Modals state
  const [isVacateModalOpen, setIsVacateModalOpen] = useState(false)
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false)
  const [isViewDocOpen, setIsViewDocOpen] = useState(false)
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false)
  const [isAppraisalModalOpen, setIsAppraisalModalOpen] = useState(false)
  const [isUpdateRentModalOpen, setIsUpdateRentModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteTenantOpen, setIsDeleteTenantOpen] = useState(false)
  const [isDeleteRentOpen, setIsDeleteRentOpen] = useState(false)
  const [rentToDelete, setRentToDelete] = useState<RentRecord | null>(null)
  const [isDeletingRent, setIsDeletingRent] = useState(false)

  // Forms state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editProperties, setEditProperties] = useState<Property[]>([])
  const [editFlats, setEditFlats] = useState<any[]>([])
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    idProofType: '',
    idProofNumber: '',
    joiningDate: '',
    currentRent: 0,
    advanceAmount: 0,
    propertyId: '',
    flatId: ''
  })
  const [selectedRentRecord, setSelectedRentRecord] = useState<RentRecord | null>(null)
  
  // Advance form state
  const [advanceForm, setAdvanceForm] = useState({
    type: 'RECEIVED' as 'RECEIVED' | 'DEDUCTED' | 'REFUNDED',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Appraisal form state
  const [appraisalForm, setAppraisalForm] = useState({
    customPercent: ''
  })

  // Rent status update form state
  const [rentUpdateForm, setRentUpdateForm] = useState({
    status: 'PAID' as 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE',
    paidAmount: 0,
    paidOn: '',
    paymentMode: '',
    notes: ''
  })

  const fetchTenantDetail = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tenants/${tenantId}`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setTenant(data)
    } catch {
      toast.error('Could not load tenant details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTenantDetail()
  }, [tenantId])

  const handleVacate = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VACATED' })
      })
      if (!response.ok) throw new Error()
      toast.success('Tenant status updated to VACATED!')
      setIsVacateModalOpen(false)
      fetchTenantDetail()
    } catch {
      toast.error('Failed to update tenant status')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReactivate = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to revert status')
      toast.success('Tenant profile restored to ACTIVE!')
      setIsReactivateModalOpen(false)
      fetchTenantDetail()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reactivate tenant')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenEditModal = async () => {
    if (!tenant) return
    
    const initialForm = {
      name: tenant.name,
      phone: tenant.phone,
      email: tenant.email || '',
      idProofType: tenant.idProofType || '',
      idProofNumber: tenant.idProofNumber || '',
      joiningDate: new Date(tenant.joiningDate).toISOString().split('T')[0],
      currentRent: tenant.currentRent,
      advanceAmount: tenant.advanceAmount,
      propertyId: tenant.flat.property.id,
      flatId: tenant.flatId
    }
    
    setEditForm(initialForm)
    setIsEditModalOpen(true)

    try {
      const propsRes = await fetch('/api/properties')
      const propsData = await propsRes.json()
      setEditProperties(propsData)

      const flatsRes = await fetch(`/api/flats?propertyId=${tenant.flat.property.id}`)
      const flatsData = await flatsRes.json()
      // Allow the tenant's current flat or other vacant flats, sorted naturally
      const sortedFlats = flatsData
        .filter((f: any) => f.status === 'VACANT' || f.id === tenant.flatId)
        .sort((a: any, b: any) => a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true, sensitivity: 'base' }))
      setEditFlats(sortedFlats)
    } catch {
      toast.error('Could not load properties/flats list for editing')
    }
  }

  const handleEditPropertyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propId = e.target.value
    setEditForm(prev => ({ ...prev, propertyId: propId, flatId: '' }))
    if (!propId) {
      setEditFlats([])
      return
    }
    try {
      const response = await fetch(`/api/flats?propertyId=${propId}`)
      const data = await response.json()
      const sortedFlats = data
        .filter((f: any) => f.status === 'VACANT' || f.id === tenant?.flatId)
        .sort((a: any, b: any) => a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true, sensitivity: 'base' }))
      setEditFlats(sortedFlats)
    } catch {
      toast.error('Could not load flats for this property')
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm.name || editForm.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }
    const phoneRegex = /^[0-9+() -]{10,15}$/
    if (editForm.phone && !phoneRegex.test(editForm.phone)) {
      toast.error('Please enter a valid phone number (10-15 digits)')
      return
    }
    if (!editForm.flatId) {
      toast.error('Please select a flat unit')
      return
    }
    if (editForm.currentRent <= 0) {
      toast.error('Rent must be a positive number')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          currentRent: Number(editForm.currentRent),
          advanceAmount: Number(editForm.advanceAmount),
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update tenant details')
      }
      toast.success('Tenant details updated successfully!')
      setIsEditModalOpen(false)
      fetchTenantDetail()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update tenant details')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      const img = new Image()
      img.src = base64String
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1000
        const MAX_HEIGHT = 1000
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6)
        
        setIsSubmitting(true)
        const toastId = toast.loading('Saving identity document...')
        try {
          const response = await fetch(`/api/tenants/${tenantId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idProofUrl: compressedBase64 })
          })
          if (!response.ok) throw new Error()
          toast.success('Document uploaded successfully!', { id: toastId })
          fetchTenantDetail()
        } catch {
          toast.error('Failed to upload identity document.', { id: toastId })
        } finally {
          setIsSubmitting(false)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddAdvance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (advanceForm.amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          ...advanceForm
        })
      })
      if (!response.ok) throw new Error()
      toast.success('Deposit ledger updated successfully!')
      setIsAdvanceModalOpen(false)
      setAdvanceForm({
        type: 'RECEIVED',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      fetchTenantDetail()
    } catch {
      toast.error('Failed to update deposit ledger')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApplyAppraisal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const percentValue = appraisalForm.customPercent ? parseFloat(appraisalForm.customPercent) : undefined
      const response = await fetch('/api/appraisals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          customPercent: percentValue
        })
      })
      const resData = await response.json()
      if (!response.ok) throw new Error(resData.error || 'Failed to apply appraisal')
      
      toast.success(`Appraisal applied! New rent: ₹${resData.newRent.toLocaleString()}`)
      setIsAppraisalModalOpen(false)
      setAppraisalForm({ customPercent: '' })
      fetchTenantDetail()
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply appraisal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTodayDateString = () => {
    const d = new Date()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${month}-${day}`
  }

  const handleOpenUpdateRentModal = (record: RentRecord) => {
    setSelectedRentRecord(record)
    const recPaidOn = record.paidOn ? new Date(record.paidOn).toISOString().split('T')[0] : getTodayDateString()
    setRentUpdateForm({
      status: record.status === 'PENDING' || record.status === 'OVERDUE' ? 'PAID' : record.status,
      paidAmount: record.status === 'PAID' ? record.rentAmount : record.paidAmount || record.rentAmount,
      paidOn: recPaidOn,
      paymentMode: record.paymentMode || 'Cash',
      notes: record.notes || ''
    })
    setIsUpdateRentModalOpen(true)
  }

  const handleUpdateRent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRentRecord) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/rent/${selectedRentRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: rentUpdateForm.status,
          paidAmount: parseFloat(rentUpdateForm.paidAmount.toString()),
          paidOn: (rentUpdateForm.status === 'PAID' || rentUpdateForm.status === 'PARTIAL') && rentUpdateForm.paidOn ? new Date(rentUpdateForm.paidOn).toISOString() : null,
          paymentMode: (rentUpdateForm.status === 'PAID' || rentUpdateForm.status === 'PARTIAL') ? rentUpdateForm.paymentMode : null,
          notes: rentUpdateForm.notes || null
        })
      })
      if (!response.ok) throw new Error()
      toast.success('Rent record updated successfully!')
      setIsUpdateRentModalOpen(false)
      fetchTenantDetail()
    } catch {
      toast.error('Failed to update rent record')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWaterRecordStatusToggle = async (waterId: string, currentPaid: boolean) => {
    try {
      const response = await fetch(`/api/water/${waterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !currentPaid })
      })
      if (!response.ok) throw new Error()
      toast.success(currentPaid ? 'Water bill marked unpaid' : 'Water bill marked paid')
      fetchTenantDetail()
    } catch {
      toast.error('Failed to toggle water bill status')
    }
  }

  const handleDeleteTenant = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error()
      toast.success('Tenant profile and ledger records deleted successfully!')
      setIsDeleteTenantOpen(false)
      router.push('/tenants')
    } catch {
      toast.error('Failed to delete tenant profile')
      setIsSubmitting(false)
    }
  }

  const handleDeleteRentClick = (rec: RentRecord) => {
    setRentToDelete(rec)
    setIsDeleteRentOpen(true)
  }

  const handleConfirmDeleteRent = async () => {
    if (!rentToDelete) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/rent/${rentToDelete.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error()
      toast.success('Rent record deleted successfully')
      setIsDeleteRentOpen(false)
      setRentToDelete(null)
      fetchTenantDetail()
    } catch {
      toast.error('Could not delete rent record')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full md:col-span-1" />
          <Skeleton className="h-80 w-full md:col-span-2" />
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="space-y-4 text-center py-10">
        <p className="text-sm text-slate-500">Tenant not found</p>
        <Link href="/tenants">
          <Button variant="outline" size="sm">Back to tenants</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link href="/tenants" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Tenants</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column Profile & Identity Docs */}
        <div className="md:col-span-1 space-y-6 flex flex-col">
          {/* Profile Details Panel */}
          <Card className="space-y-5">
            <div className="flex flex-col items-center text-center space-y-2 border-b border-slate-100 pb-5">
              <div className="h-16 w-16 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center font-bold text-brand-700 text-lg">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 leading-tight">{tenant.name}</h2>
                <p className="text-xs font-semibold text-slate-400">{tenant.flat.property.name} · Unit {tenant.flat.flatNumber}</p>
              </div>
              <Badge variant={tenant.status === 'ACTIVE' ? 'occupied' : 'vacant'} className="mt-1">
                {tenant.status}
              </Badge>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{tenant.phone}</span>
              </div>
              {tenant.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{tenant.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Joined {new Date(tenant.joiningDate).toLocaleDateString()}</span>
              </div>
              {tenant.idProofType && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{tenant.idProofType}: {tenant.idProofNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Monthly Rent</span>
                <span className="text-base font-black text-slate-900">₹{tenant.currentRent.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Advance Deposit</span>
                <span className="text-base font-black text-emerald-600">₹{tenant.advanceAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            {tenant.status === 'ACTIVE' ? (
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={handleOpenEditModal} variant="outline" size="sm" className="w-full text-xs font-bold gap-1 text-violet-600 border-violet-250/65 hover:bg-violet-50 hover:text-violet-700">
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Tenant Details</span>
                </Button>
                <Button onClick={() => setIsAppraisalModalOpen(true)} variant="outline" size="sm" className="w-full text-xs font-bold gap-1 text-slate-700">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Apply Rent Appraisal</span>
                </Button>
                <Button onClick={() => setIsAdvanceModalOpen(true)} variant="outline" size="sm" className="w-full text-xs font-bold gap-1 text-slate-700">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Deposit Ledger Entry</span>
                </Button>
                <Button onClick={() => setIsVacateModalOpen(true)} variant="danger" size="sm" className="w-full text-xs font-bold gap-1 mt-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Mark Tenant Vacated</span>
                </Button>
                <Button onClick={() => setIsDeleteTenantOpen(true)} variant="danger" size="sm" className="w-full text-xs font-bold gap-1 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Delete Tenant Profile</span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={handleOpenEditModal} variant="outline" size="sm" className="w-full text-xs font-bold gap-1 text-violet-600 border-violet-250/65 hover:bg-violet-50 hover:text-violet-700">
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Tenant Details</span>
                </Button>
                <Button onClick={() => setIsReactivateModalOpen(true)} variant="secondary" size="sm" className="w-full text-xs font-bold gap-1">
                  <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                  <span>Revert to Active / Occupied</span>
                </Button>
                <Button onClick={() => setIsDeleteTenantOpen(true)} variant="danger" size="sm" className="w-full text-xs font-bold gap-1 mt-2 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Delete Tenant Profile</span>
                </Button>
              </div>
            )}
          </Card>

          {/* Identity Document Section */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow duration-300 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-brand-600" />
              <span>Identity Document</span>
            </h3>
            
            {tenant.idProofUrl ? (
              <div className="space-y-3">
                <div className="relative border border-slate-100 rounded-xl overflow-hidden bg-slate-50 max-h-[180px] flex items-center justify-center cursor-pointer" onClick={() => setIsViewDocOpen(true)}>
                  <img src={tenant.idProofUrl} alt="ID Document" className="object-contain max-h-[180px] w-full" />
                </div>
                <div className="flex gap-2">
                  <label className="flex-1 text-center py-2 px-3 bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-all">
                    <span>Replace Document</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleDocumentUpload} />
                  </label>
                  <Button variant="outline" size="sm" onClick={() => setIsViewDocOpen(true)} className="px-3 text-[11px] text-emerald-600 border-emerald-250/60 hover:bg-emerald-50 hover:text-emerald-700">
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-5 text-center space-y-3 bg-slate-50/50">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">No document uploaded</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Upload file or capture via camera</p>
                </div>
                <label className="py-2 px-3.5 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded-xl shadow-xs cursor-pointer transition-all inline-block">
                  <span>Upload / Take Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleDocumentUpload} />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Ledger Details Tabs */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full border border-slate-200/50">
            {[
              { id: 'rent', label: 'Rent Logs', icon: DollarSign },
              { id: 'advance', label: 'Advance Ledger', icon: CreditCard },
              { id: 'water', label: 'Water Bills', icon: Droplets },
              { id: 'appraisal', label: 'Rent Appraisals', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center gap-1.5 flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          <Card className="p-5">
            {/* Rent Logs Tab */}
            {activeTab === 'rent' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Rent Ledger</h3>
                {tenant.rentRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center">No rent billing records found.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="pb-2">Billing Month</th>
                            <th className="pb-2">Rent Due</th>
                            <th className="pb-2">Paid Amount</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2 text-right">Update</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {tenant.rentRecords.map(rec => (
                            <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 font-bold text-slate-900">{MONTHS[rec.month - 1]} {rec.year}</td>
                              <td className="py-3">₹{rec.rentAmount.toLocaleString()}</td>
                              <td className="py-3 text-slate-800">₹{rec.paidAmount.toLocaleString()}</td>
                              <td className="py-3">
                                <Badge variant={rec.status === 'PAID' ? 'paid' : rec.status === 'PARTIAL' ? 'partial' : rec.status === 'OVERDUE' ? 'overdue' : 'pending'}>
                                  {rec.status}
                                </Badge>
                              </td>
                              <td className="py-3 text-right flex justify-end items-center gap-2">
                                {tenant.status === 'ACTIVE' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="px-2 py-1 text-[11px] font-bold gap-1 text-violet-600 border-violet-250/60 hover:bg-violet-50 hover:text-violet-700"
                                      onClick={() => handleOpenUpdateRentModal(rec)}
                                    >
                                      <Edit3 className="h-3 w-3" />
                                      <span>Update</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="p-1 text-rose-600 border-rose-205/60 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                                      onClick={() => handleDeleteRentClick(rec)}
                                      title="Delete Rent Record"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile/Tablet Card List */}
                    <div className="lg:hidden space-y-3">
                      {tenant.rentRecords.map(rec => (
                        <Card key={rec.id} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Billing Month</span>
                              <span className="font-extrabold text-slate-900 text-sm">{MONTHS[rec.month - 1]} {rec.year}</span>
                            </div>
                            <Badge variant={rec.status === 'PAID' ? 'paid' : rec.status === 'PARTIAL' ? 'partial' : rec.status === 'OVERDUE' ? 'overdue' : 'pending'}>
                              {rec.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-2.5 text-xs">
                            <div>
                              <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Rent Due</span>
                              <span className="font-bold text-slate-800">₹{rec.rentAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Paid Amount</span>
                              <span className="font-bold text-slate-800">₹{rec.paidAmount.toLocaleString()}</span>
                            </div>
                          </div>

                          {tenant.status === 'ACTIVE' && (
                            <div className="flex gap-2 w-full">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 justify-center text-xs font-bold gap-1 py-2 text-violet-600 border-violet-250/60 hover:bg-violet-50 hover:text-violet-700"
                                onClick={() => handleOpenUpdateRentModal(rec)}
                              >
                                <Edit3 className="h-4 w-4" />
                                <span>Update Rent Record</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 py-2 px-3 cursor-pointer"
                                onClick={() => handleDeleteRentClick(rec)}
                                title="Delete Rent Record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Advance Ledger Tab */}
            {activeTab === 'advance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Security Deposit Ledger</h3>
                  <Badge variant="occupied" className="text-xs font-black">
                    Balance Held: ₹{tenant.advanceAmount.toLocaleString()}
                  </Badge>
                </div>
                {tenant.advanceRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center">No deposit log items found.</p>
                ) : (
                  <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 py-2">
                    {tenant.advanceRecords.map(rec => (
                      <div key={rec.id} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full border border-white bg-slate-400 ring-4 ring-slate-100" />
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-[10px] ${
                            rec.type === 'RECEIVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            rec.type === 'DEDUCTED' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {rec.type}
                          </span>
                          <span className="text-slate-400 font-bold">{new Date(rec.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-black text-slate-700">₹{rec.amount.toLocaleString()}</p>
                        {rec.notes && <p className="text-[11px] text-slate-500 font-medium italic">{rec.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Water Bills Tab */}
            {activeTab === 'water' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Water Utility Billing</h3>
                {tenant.waterRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center">No water billing records found.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="pb-2">Month</th>
                            <th className="pb-2">Usage (L)</th>
                            <th className="pb-2">Rate (₹/L)</th>
                            <th className="pb-2">Total Due</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {tenant.waterRecords.map(rec => (
                            <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 font-bold text-slate-900">{MONTHS[rec.month - 1]} {rec.year}</td>
                              <td className="py-3">{rec.unitsConsumed.toLocaleString()} L</td>
                              <td className="py-3">₹{rec.costPerLitre}</td>
                              <td className="py-3 text-slate-900 font-bold">₹{rec.totalCost.toLocaleString()}</td>
                              <td className="py-3">
                                <Badge variant={rec.isPaid ? 'paid' : 'pending'}>
                                  {rec.isPaid ? 'PAID' : 'PENDING'}
                                </Badge>
                              </td>
                              <td className="py-3 text-right">
                                {tenant.status === 'ACTIVE' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`px-2 py-1 text-[10px] font-black gap-1 ${
                                      rec.isPaid 
                                        ? 'text-slate-500 border-slate-200 hover:bg-slate-100' 
                                        : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                                    }`}
                                    onClick={() => handleWaterRecordStatusToggle(rec.id, rec.isPaid)}
                                  >
                                    <ToggleLeft className="h-3.5 w-3.5" />
                                    <span>{rec.isPaid ? 'Mark Unpaid' : 'Mark Paid'}</span>
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile/Tablet Card List */}
                    <div className="lg:hidden space-y-3">
                      {tenant.waterRecords.map(rec => (
                        <Card key={rec.id} className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Billing Month</span>
                              <span className="font-extrabold text-slate-900 text-sm">{MONTHS[rec.month - 1]} {rec.year}</span>
                            </div>
                            <Badge variant={rec.isPaid ? 'paid' : 'pending'}>
                              {rec.isPaid ? 'PAID' : 'PENDING'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-2.5 text-xs text-center">
                            <div className="text-left">
                              <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Usage</span>
                              <span className="font-bold text-slate-800">{rec.unitsConsumed.toLocaleString()} L</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Rate</span>
                              <span className="font-bold text-slate-800">₹{rec.costPerLitre}/L</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Total Due</span>
                              <span className="font-extrabold text-slate-900">₹{rec.totalCost.toLocaleString()}</span>
                            </div>
                          </div>

                          {tenant.status === 'ACTIVE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={`w-full justify-center text-xs font-bold gap-1 py-2 ${
                                rec.isPaid ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-800'
                              }`}
                              onClick={() => handleWaterRecordStatusToggle(rec.id, rec.isPaid)}
                            >
                              <ToggleLeft className="h-4 w-4" />
                              <span>{rec.isPaid ? 'Mark Unpaid' : 'Mark Paid'}</span>
                            </Button>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Appraisal revisions Tab */}
            {activeTab === 'appraisal' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Rent Appraisal History</h3>
                {tenant.rentRevisions.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center">No rent appraisal revision audits logged.</p>
                ) : (
                  <div className="space-y-4">
                    {tenant.rentRevisions.map(rev => (
                      <div key={rev.id} className="flex flex-col bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-brand-700">Hike Applied: +{rev.appraisalPercent}%</span>
                          <span className="text-slate-400 font-bold">{new Date(rev.effectiveDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-slate-600 mt-1">
                          <span>Old Rent: ₹{rev.previousRent.toLocaleString()}</span>
                          <span className="font-extrabold text-slate-800">New Rent: ₹{rev.newRent.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Vacate Confirmation Modal */}
      <ConfirmModal
        isOpen={isVacateModalOpen}
        onClose={() => setIsVacateModalOpen(false)}
        onConfirm={handleVacate}
        title="Vacate Tenant Profile"
        message={`Are you sure you want to mark ${tenant.name} as vacated? This will release flat Unit ${tenant.flat.flatNumber} to status VACANT.`}
        confirmText="Confirm Vacate"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />

      {/* Advance Entry Modal */}
      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title="Add Deposit Ledger Entry"
      >
        <form onSubmit={handleAddAdvance} className="space-y-4">
          <Select
            id="advType"
            label="Entry Type"
            options={[
              { label: 'RECEIVED (Tenant top-up/payment)', value: 'RECEIVED' },
              { label: 'DEDUCTED (Deduct against unpaid dues)', value: 'DEDUCTED' },
              { label: 'REFUNDED (Return balance back to tenant)', value: 'REFUNDED' },
            ]}
            value={advanceForm.type}
            onChange={(e) => setAdvanceForm({ ...advanceForm, type: e.target.value as any })}
          />

          <Input
            id="advAmount"
            type="number"
            label="Amount (₹)"
            placeholder="e.g. 5000"
            value={advanceForm.amount || ''}
            onChange={(e) => setAdvanceForm({ ...advanceForm, amount: parseFloat(e.target.value) || 0 })}
          />

          <Input
            id="advDate"
            type="date"
            label="Transaction Date"
            value={advanceForm.date}
            onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })}
          />

          <Input
            id="advNotes"
            label="Transaction Notes"
            placeholder="e.g. Security top-up received via UPI"
            value={advanceForm.notes}
            onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAdvanceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add Ledger Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Appraisal Hike Modal */}
      <Modal
        isOpen={isAppraisalModalOpen}
        onClose={() => setIsAppraisalModalOpen(false)}
        title="Apply Rent Appraisal Hike"
      >
        <form onSubmit={handleApplyAppraisal} className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Apply rent appraisal hike. If you leave custom percentage empty, the default rate defined in your Master Settings will be applied.
          </p>

          <Input
            id="customPercent"
            type="number"
            step="0.1"
            label="Custom Hike Percentage (%)"
            placeholder="e.g. 7.5 (Optional)"
            value={appraisalForm.customPercent}
            onChange={(e) => setAppraisalForm({ customPercent: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAppraisalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Apply Hike
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Rent payment Status Modal */}
      <Modal
        isOpen={isUpdateRentModalOpen}
        onClose={() => setIsUpdateRentModalOpen(false)}
        title={selectedRentRecord ? `Update Rent status: ${MONTHS[selectedRentRecord.month - 1]} ${selectedRentRecord.year}` : 'Update Rent Record'}
      >
        <form onSubmit={handleUpdateRent} className="space-y-4">
          <Select
            id="rentStatus"
            label="Payment Status"
            options={[
              { label: 'PENDING (Uncollected)', value: 'PENDING' },
              { label: 'PAID (Fully Collected)', value: 'PAID' },
              { label: 'PARTIAL (Partially Collected)', value: 'PARTIAL' },
              { label: 'OVERDUE (Delayed)', value: 'OVERDUE' },
            ]}
            value={rentUpdateForm.status}
            onChange={(e) => setRentUpdateForm({ ...rentUpdateForm, status: e.target.value as any })}
          />

          <Input
            id="rentPaid"
            type="number"
            label="Paid Amount (₹)"
            value={rentUpdateForm.paidAmount || ''}
            onChange={(e) => setRentUpdateForm({ ...rentUpdateForm, paidAmount: parseFloat(e.target.value) || 0 })}
          />

          {(rentUpdateForm.status === 'PAID' || rentUpdateForm.status === 'PARTIAL') && (
            <div className="grid grid-cols-2 gap-3">
              <Select
                id="rentPayMode"
                label="Payment Mode"
                options={[
                  { label: 'Cash', value: 'Cash' },
                  { label: 'GPay', value: 'GPay' },
                  { label: 'PhonePe', value: 'PhonePe' },
                  { label: 'Paytm', value: 'Paytm' },
                  { label: 'UPI / Net Banking', value: 'UPI/Net Banking' },
                  { label: 'Cheque / Bank Transfer', value: 'Cheque/Bank Transfer' },
                  { label: 'Other', value: 'Other' },
                ]}
                value={rentUpdateForm.paymentMode}
                onChange={(e) => setRentUpdateForm({ ...rentUpdateForm, paymentMode: e.target.value })}
              />

              <Input
                id="rentPayDate"
                type="date"
                label="Collection Date"
                value={rentUpdateForm.paidOn}
                onChange={(e) => setRentUpdateForm({ ...rentUpdateForm, paidOn: e.target.value })}
              />
            </div>
          )}

          <Input
            id="rentNotes"
            label="Transaction Remarks / Notes"
            placeholder="e.g. Paid cash 5000 and remainder via GPay"
            value={rentUpdateForm.notes}
            onChange={(e) => setRentUpdateForm({ ...rentUpdateForm, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsUpdateRentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Tenant Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteTenantOpen}
        onClose={() => setIsDeleteTenantOpen(false)}
        onConfirm={handleDeleteTenant}
        title="Delete Tenant Profile"
        message={`Are you sure you want to permanently delete tenant ${tenant?.name}? This will vacate flat Unit ${tenant?.flat.flatNumber} and delete all historic rent billing records and utility logs associated with this tenant.`}
        confirmText="Delete Tenant"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />

      {/* Delete Rent Record Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteRentOpen}
        onClose={() => setIsDeleteRentOpen(false)}
        onConfirm={handleConfirmDeleteRent}
        title="Delete Rent Record"
        message={`Are you sure you want to permanently delete the rent record for ${MONTHS[(rentToDelete?.month ?? 1) - 1]} ${rentToDelete?.year}?`}
        confirmText="Delete Record"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />

      {/* Reactivate Confirmation Dialog */}
      <ConfirmModal
        isOpen={isReactivateModalOpen}
        onClose={() => setIsReactivateModalOpen(false)}
        onConfirm={handleReactivate}
        title="Restore Tenant Profile"
        message={`Are you sure you want to restore ${tenant.name} to ACTIVE status? This will allocate Flat Unit ${tenant.flat.flatNumber} as OCCUPIED.`}
        confirmText="Restore Profile"
        cancelText="Cancel"
        type="info"
        isLoading={isSubmitting}
      />

      {/* Full Document View Modal */}
      <Modal 
        isOpen={isViewDocOpen} 
        onClose={() => setIsViewDocOpen(false)} 
        title={`${tenant.name} - Identity Document`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {tenant.idProofUrl ? (
            <img 
              src={tenant.idProofUrl} 
              alt="ID Document" 
              className="w-full object-contain max-h-[70vh] rounded-xl border border-slate-100" 
            />
          ) : (
            <p className="text-sm text-slate-400 font-semibold py-8">No document image loaded.</p>
          )}
          <Button onClick={() => setIsViewDocOpen(false)} variant="outline" className="w-full">
            Close Preview
          </Button>
        </div>
      </Modal>

      {/* Edit Tenant Details Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Tenant Details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="editProperty"
              label="Select Building"
              options={editProperties.map(p => ({ label: p.name, value: p.id }))}
              value={editForm.propertyId}
              onChange={handleEditPropertyChange}
              placeholder="Select Property"
            />

            <Select
              id="editFlatId"
              label="Select Flat Unit"
              options={editFlats.map(f => ({ label: `Flat ${f.flatNumber} (₹${f.baseRent})`, value: f.id }))}
              value={editForm.flatId}
              onChange={(e) => {
                const selectedFlat = editFlats.find(f => f.id === e.target.value)
                setEditForm(prev => ({
                  ...prev,
                  flatId: e.target.value,
                  currentRent: selectedFlat ? selectedFlat.baseRent : prev.currentRent
                }))
              }}
              disabled={!editForm.propertyId || editFlats.length === 0}
              placeholder={editForm.propertyId ? (editFlats.length === 0 ? 'No vacant flats' : 'Select Flat') : 'Select Property first'}
            />
          </div>

          <Input
            id="editName"
            label="Tenant Name"
            placeholder="e.g. John Doe"
            required
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              id="editPhone"
              label="Phone Number (Optional)"
              placeholder="e.g. 9876543210"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />

            <Input
              id="editEmail"
              type="email"
              label="Email Address (Optional)"
              placeholder="e.g. john@example.com"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              id="editIdProofType"
              label="ID Proof Type"
              options={[
                { label: 'Aadhar Card', value: 'Aadhar' },
                { label: 'PAN Card', value: 'PAN' },
                { label: 'Passport', value: 'Passport' },
                { label: 'Driving License', value: 'License' },
                { label: 'Other', value: 'Other' },
              ]}
              value={editForm.idProofType}
              onChange={(e) => setEditForm({ ...editForm, idProofType: e.target.value })}
            />

            <Input
              id="editIdProofNumber"
              label="ID Proof Number"
              placeholder="e.g. XXXX-XXXX-XXXX"
              value={editForm.idProofNumber}
              onChange={(e) => setEditForm({ ...editForm, idProofNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              id="editJoiningDate"
              type="date"
              label="Joining Date"
              required
              value={editForm.joiningDate}
              onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
            />

            <Input
              id="editCurrentRent"
              type="number"
              label="Current Rent (₹)"
              required
              value={editForm.currentRent || ''}
              onChange={(e) => setEditForm({ ...editForm, currentRent: parseFloat(e.target.value) || 0 })}
            />

            <Input
              id="editAdvanceAmount"
              type="number"
              label="Security Advance (₹)"
              required
              value={editForm.advanceAmount || ''}
              onChange={(e) => setEditForm({ ...editForm, advanceAmount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
