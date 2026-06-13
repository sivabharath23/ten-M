'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tenantSchema } from '@/lib/validations'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import Link from 'next/link'
import { Users, Plus, Phone, Calendar, UserPlus, FileText, CreditCard } from 'lucide-react'

type TenantFormInputs = typeof tenantSchema._output

interface Tenant {
  id: string
  name: string
  phone: string
  email: string | null
  joiningDate: string
  currentRent: number
  status: 'ACTIVE' | 'VACATED'
  flat: {
    flatNumber: string
    baseRent: number
    property: {
      name: string
    }
  }
}

interface Property {
  id: string
  name: string
}

interface Flat {
  id: string
  flatNumber: string
  baseRent: number
  status: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [flats, setFlats] = useState<Flat[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'ACTIVE' | 'VACATED'>('ACTIVE')
  const [docImage, setDocImage] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TenantFormInputs>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      flatId: '',
      name: '',
      phone: '',
      email: '',
      idProofType: 'Aadhar',
      idProofNumber: '',
      joiningDate: new Date().toISOString().split('T')[0],
      currentRent: 0,
      advanceAmount: 0,
    },
  })

  const watchFlatId = watch('flatId')

  // Fetch properties and tenants
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch tenants based on status
      const tenantsRes = await fetch(`/api/tenants?status=${filterStatus}`)
      const tenantsData = await tenantsRes.json()
      setTenants(tenantsData)

      // Fetch properties for addition dropdown
      const propsRes = await fetch('/api/properties')
      const propsData = await propsRes.json()
      setProperties(propsData)
    } catch {
      toast.error('Could not load tenant data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterStatus])

  // Fetch vacant flats when property selection changes
  const fetchVacantFlats = async (propertyId: string) => {
    if (!propertyId) {
      setFlats([])
      return
    }
    try {
      const response = await fetch(`/api/flats?propertyId=${propertyId}`)
      if (!response.ok) throw new Error()
      const data: Flat[] = await response.json()
      // Filter for vacant flats only
      setFlats(data.filter(f => f.status === 'VACANT'))
    } catch {
      toast.error('Could not load flats for this property')
    }
  }

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propId = e.target.value
    setSelectedPropertyId(propId)
    setValue('flatId', '')
    fetchVacantFlats(propId)
  }

  // Auto-fill base rent when flat is selected
  useEffect(() => {
    if (watchFlatId) {
      const selectedFlat = flats.find(f => f.id === watchFlatId)
      if (selectedFlat) {
        setValue('currentRent', selectedFlat.baseRent)
      }
    }
  }, [watchFlatId, flats])

  const handleOpenAddModal = () => {
    reset({
      flatId: '',
      name: '',
      phone: '',
      email: '',
      idProofType: 'Aadhar',
      idProofNumber: '',
      joiningDate: new Date().toISOString().split('T')[0],
      currentRent: 0,
      advanceAmount: 0,
    })
    setSelectedPropertyId('')
    setFlats([])
    setDocImage('')
    setIsModalOpen(true)
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      const img = new Image()
      img.src = base64String
      img.onload = () => {
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
        setDocImage(compressedBase64)
        toast.success('Identity document selected & compressed successfully!')
      }
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: TenantFormInputs) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          idProofUrl: docImage || undefined,
        }),
      })
      const resData = await response.json()
      if (!response.ok) throw new Error(resData.error || 'Failed to register tenant')

      toast.success('Tenant registered successfully!')
      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Could not register tenant. Confirm details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Tenants Directory</h2>
          <p className="text-xs font-semibold text-slate-400">Manage landlord tenant profiles and documents</p>
        </div>
        <Button onClick={handleOpenAddModal} className="shadow-md shadow-brand-500/10 gap-1.5 text-xs font-bold px-3.5 self-start sm:self-auto">
          <UserPlus className="h-4 w-4" />
          <span>Register Tenant</span>
        </Button>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setFilterStatus('ACTIVE')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${filterStatus === 'ACTIVE'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          Active Tenants
        </button>
        <button
          onClick={() => setFilterStatus('VACATED')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${filterStatus === 'VACATED'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          Vacated Archive
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="space-y-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <EmptyState
          title={`No ${filterStatus.toLowerCase()} tenants found`}
          description={filterStatus === 'ACTIVE' ? 'onboard your first tenant to start generating rent logs.' : 'No historic vacated tenant details located.'}
          icon={<Users className="h-10 w-10 text-slate-300" />}
          actionLabel={filterStatus === 'ACTIVE' ? 'Register Tenant' : undefined}
          onAction={filterStatus === 'ACTIVE' ? handleOpenAddModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-md transition-shadow duration-150 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-0.5">{tenant.name}</h3>
                    <p className="text-[11px] font-bold text-slate-400">
                      {tenant.flat.property.name} · Unit {tenant.flat.flatNumber}
                    </p>
                  </div>
                  <Badge variant={tenant.status === 'ACTIVE' ? 'occupied' : 'vacant'}>
                    {tenant.status}
                  </Badge>
                </div>

                <div className="space-y-2 border-t border-b border-slate-100 py-3 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{tenant.phone}</span>
                  </div>
                  {tenant.email && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Joined {new Date(tenant.joiningDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Current Rent</span>
                    <span className="font-black text-slate-800 text-base">₹{tenant.currentRent.toLocaleString()}/mo</span>
                  </div>

                  <Link href={`/tenants/${tenant.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-bold px-3 text-emerald-600 border-emerald-250/60 hover:bg-emerald-50 hover:text-emerald-700">
                      View Ledger
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Register Tenant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Tenant"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Select
              id="property"
              label="Select Building"
              options={properties.map(p => ({ label: p.name, value: p.id }))}
              value={selectedPropertyId}
              onChange={handlePropertyChange}
              placeholder="Select Property"
            />

            <Select
              id="flatId"
              label="Select Flat Unit"
              options={flats.map(f => ({ label: `Flat ${f.flatNumber} (₹${f.baseRent})`, value: f.id }))}
              error={errors.flatId?.message}
              {...register('flatId')}
              disabled={!selectedPropertyId || flats.length === 0}
              placeholder={selectedPropertyId ? (flats.length === 0 ? 'No vacant flats' : 'Select Flat') : 'Select Property first'}
            />
          </div>

          <Input
            id="name"
            label="Tenant Full Name"
            placeholder="e.g. Siva Bharath"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              id="phone"
              label="Phone Number"
              placeholder="e.g. 9876543210"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              id="email"
              type="email"
              label="Email (Optional)"
              placeholder="e.g. siva@gmail.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              id="idProofType"
              label="ID Proof Type"
              options={[
                { label: 'Aadhar Card', value: 'Aadhar' },
                { label: 'PAN Card', value: 'PAN' },
                { label: 'Passport', value: 'Passport' },
                { label: 'Driving License', value: 'License' },
              ]}
              error={errors.idProofType?.message}
              {...register('idProofType')}
            />

            <Input
              id="idProofNumber"
              label="ID Document Number"
              placeholder="e.g. 12-digit Aadhar"
              error={errors.idProofNumber?.message}
              {...register('idProofNumber')}
            />
          </div>
 
          {/* Document File / Photo Upload */}
          <div className="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Identity Document Image
            </label>
            <div className="flex items-center gap-3">
              {docImage ? (
                <div className="relative h-12 w-16 border border-slate-100 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                  <img src={docImage} alt="ID Document Preview" className="object-contain h-full w-full" />
                </div>
              ) : (
                <div className="h-12 w-16 border border-dashed border-slate-200 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1">
                {docImage ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">Document selected</span>
                    <button type="button" className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer" onClick={() => setDocImage('')}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-semibold leading-tight">Attach a scanned copy or take a live picture using your camera.</p>
                )}
                <label className="mt-1 cursor-pointer inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors">
                  <span>{docImage ? 'Replace Image' : 'Select File / Take Photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleDocumentChange} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              id="joiningDate"
              type="date"
              label="Joining Date"
              error={errors.joiningDate?.message}
              {...register('joiningDate')}
            />

            <Input
              id="currentRent"
              type="number"
              label="Current Rent (₹)"
              error={errors.currentRent?.message}
              {...register('currentRent', { valueAsNumber: true })}
            />

            <Input
              id="advanceAmount"
              type="number"
              label="Security Advance (₹)"
              error={errors.advanceAmount?.message}
              {...register('advanceAmount', { valueAsNumber: true })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Register Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
