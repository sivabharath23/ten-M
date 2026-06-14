'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { flatSchema } from '@/lib/validations'
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
import { ArrowLeft, Plus, DoorOpen, Edit, Users } from 'lucide-react'

type FlatFormInputs = typeof flatSchema._output

interface Tenant {
  id: string
  name: string
  status: string
}

interface Flat {
  id: string
  flatNumber: string
  floor: number
  bhkType: string
  baseRent: number
  status: 'VACANT' | 'OCCUPIED'
  tenants: Tenant[]
}

interface Property {
  id: string
  name: string
  address: string
  city: string
  type: string
  flats: Flat[]
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const propertyId = resolvedParams.id

  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null)
  const [maxFloors, setMaxFloors] = useState(10)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FlatFormInputs>({
    resolver: zodResolver(flatSchema),
    defaultValues: {
      propertyId: propertyId,
      flatNumber: '',
      floor: 0,
      bhkType: '1BHK',
      baseRent: 10000,
    },
  })

  const fetchPropertyDetails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      if (!response.ok) throw new Error('Failed to fetch details')
      const data = await response.json()
      setProperty(data)
    } catch {
      toast.error('Could not load property details')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data && typeof data.maxFloors === 'number') {
          setMaxFloors(data.maxFloors)
        }
      }
    } catch (e) {
      console.error('Error fetching settings:', e)
    }
  }

  useEffect(() => {
    fetchPropertyDetails()
    fetchSettings()
  }, [propertyId])

  const handleOpenAddModal = () => {
    setEditingFlat(null)
    reset({
      propertyId: propertyId,
      flatNumber: '',
      floor: 0,
      bhkType: '1BHK',
      baseRent: 10000,
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (flat: Flat) => {
    setEditingFlat(flat)
    reset({
      propertyId: propertyId,
      flatNumber: flat.flatNumber,
      floor: flat.floor,
      bhkType: flat.bhkType,
      baseRent: flat.baseRent,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: FlatFormInputs) => {
    setIsSubmitting(true)
    const url = editingFlat ? `/api/flats/${editingFlat.id}` : '/api/flats'
    const method = editingFlat ? 'PUT' : 'POST'
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Flat operation failed')
      toast.success(editingFlat ? 'Flat details updated successfully!' : 'Flat created successfully!')
      setIsModalOpen(false)
      fetchPropertyDetails()
    } catch {
      toast.error('Failed to save flat details. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getActiveTenantName = (flat: Flat) => {
    const active = flat.tenants.find(t => t.status === 'ACTIVE')
    return active ? active.name : null
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full animate-pulse" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="space-y-4 text-center py-10">
        <p className="text-sm text-slate-500">Property not found</p>
        <Link href="/properties">
          <Button variant="outline" size="sm">Back to properties</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/properties" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Properties</span>
      </Link>

      {/* Property Hero */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-100 rounded-2xl p-6 gap-4">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
            {property.type} PROPERTY
          </span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{property.name}</h2>
          <p className="text-xs font-semibold text-slate-400">{property.address}, {property.city}</p>
        </div>
        <Button onClick={handleOpenAddModal} className="gap-1.5 text-xs font-bold px-3.5 shadow-md shadow-brand-500/10">
          <Plus className="h-4 w-4" />
          <span>Add Flat Unit</span>
        </Button>
      </div>

      {/* Flats List Section */}
      <div>
        <h3 className="text-sm font-black text-slate-800 tracking-tight mb-3">Units & Flats ({property.flats.length})</h3>
        {property.flats.length === 0 ? (
          <EmptyState
            title="No flat units registered"
            description="Add flat units to this property to begin logging base rent levels and assigning tenants."
            icon={<DoorOpen className="h-10 w-10 text-slate-300" />}
            actionLabel="Add Flat"
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
                      <th className="px-5 py-3.5">Floor</th>
                      <th className="px-5 py-3.5">BHK / Type</th>
                      <th className="px-5 py-3.5">Base Rent</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Tenant</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {property.flats.map((flat) => {
                      const tenantName = getActiveTenantName(flat)
                      return (
                        <tr key={flat.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-bold text-slate-900">{flat.flatNumber}</td>
                          <td className="px-5 py-4">{flat.floor === 0 ? 'Ground' : `${flat.floor} Floor`}</td>
                          <td className="px-5 py-4">{flat.bhkType}</td>
                          <td className="px-5 py-4">₹{flat.baseRent.toLocaleString()}</td>
                          <td className="px-5 py-4">
                            <Badge variant={flat.status === 'OCCUPIED' ? 'occupied' : 'vacant'}>
                              {flat.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            {tenantName ? (
                              <Link href={`/tenants/${flat.tenants.find(t => t.status === 'ACTIVE')?.id}`} className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-2">
                                {tenantName}
                              </Link>
                            ) : (
                              <Link href={`/tenants/new?flatId=${flat.id}`} className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition-colors font-bold cursor-pointer">
                                <Users className="h-3 w-3" />
                                <span>Assign Tenant</span>
                              </Link>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1.5 h-auto text-violet-500 hover:text-violet-700 hover:bg-violet-50 inline-flex"
                              onClick={() => handleOpenEditModal(flat)}
                              title="Edit Unit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.flats.map((flat) => {
                const tenantName = getActiveTenantName(flat)
                const activeTenant = flat.tenants.find(t => t.status === 'ACTIVE')
                return (
                  <Card key={flat.id} className="hover:shadow-md transition-shadow duration-150 flex flex-col justify-between p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Unit No.</span>
                        <span className="font-extrabold text-slate-900 text-sm">{flat.flatNumber}</span>
                      </div>
                      <Badge variant={flat.status === 'OCCUPIED' ? 'occupied' : 'vacant'}>
                        {flat.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 border-t border-b border-slate-100 py-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">Floor</span>
                        <span className="font-extrabold text-slate-800">{flat.floor === 0 ? 'Ground' : `${flat.floor} Floor`}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">BHK / Type</span>
                        <span className="font-extrabold text-slate-800">{flat.bhkType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">Base Rent</span>
                        <span className="font-extrabold text-slate-800">₹{flat.baseRent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">Tenant</span>
                        {tenantName ? (
                          <Link href={`/tenants/${activeTenant?.id}`} className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-2">
                            {tenantName}
                          </Link>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between gap-2 items-center">
                      {!tenantName && (
                        <Link href={`/tenants/new?flatId=${flat.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full justify-center text-xs font-bold gap-1 py-2 text-slate-700">
                            <Users className="h-3.5 w-3.5" />
                            <span>Assign Tenant</span>
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`${tenantName ? 'w-full' : 'w-12'} justify-center text-xs font-bold py-2 gap-1 text-slate-600`}
                        onClick={() => handleOpenEditModal(flat)}
                        title="Edit Unit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        {tenantName && <span>Edit Unit</span>}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFlat ? 'Edit Flat Details' : 'Register New Flat Unit'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="flatNumber"
            label="Flat Number"
            placeholder="e.g. 101, A-202"
            error={errors.flatNumber?.message}
            {...register('flatNumber')}
          />

          <Select
            id="floor"
            label="Floor Level"
            options={Array.from({ length: maxFloors + 1 }, (_, i) => ({
              label: i === 0 ? 'Ground' : 
                     i === 1 ? '1st Floor' : 
                     i === 2 ? '2nd Floor' : 
                     i === 3 ? '3rd Floor' : 
                     `${i}th Floor`,
              value: i
            }))}
            error={errors.floor?.message}
            {...register('floor', { valueAsNumber: true })}
          />

          <Select
            id="bhkType"
            label="BHK / Unit Type"
            options={[
              { label: '1 BHK', value: '1BHK' },
              { label: '1 RK', value: '1RK' },
              { label: '2 BHK', value: '2BHK' },
              { label: '3 BHK', value: '3BHK' },
              { label: 'Studio Room', value: 'Studio' },
              { label: 'Commercial Office Space', value: 'Office' },
              { label: 'Commercial Retail Shop', value: 'Shop' },
            ]}
            error={errors.bhkType?.message}
            {...register('bhkType')}
          />

          <Input
            id="baseRent"
            type="number"
            label="Base Monthly Rent (₹)"
            placeholder="e.g. 12000"
            error={errors.baseRent?.message}
            {...register('baseRent', { valueAsNumber: true })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingFlat ? 'Save Changes' : 'Create Flat'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
