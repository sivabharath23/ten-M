'use client'

import React, { useState, useEffect } from 'react'
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
import { DoorOpen, Plus, Search, Building2, Users, Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

type FlatFormInputs = typeof flatSchema._output

interface PropertyBrief {
  id: string
  name: string
}

interface TenantBrief {
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
  propertyId: string
  property: {
    name: string
  }
  tenants: TenantBrief[]
}

export default function FlatsPage() {
  const [flats, setFlats] = useState<Flat[]>([])
  const [properties, setProperties] = useState<PropertyBrief[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [maxFloors, setMaxFloors] = useState(10)

  // Delete flat state variables
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [flatToDelete, setFlatToDelete] = useState<Flat | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit flat state
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FlatFormInputs>({
    resolver: zodResolver(flatSchema),
    defaultValues: {
      propertyId: '',
      flatNumber: '',
      floor: 0,
      bhkType: '1BHK',
      baseRent: 10000,
    },
  })

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

  const fetchFlatsAndProperties = async () => {
    setIsLoading(true)
    try {
      // Fetch properties for filters and select menus
      const propResponse = await fetch('/api/properties')
      if (!propResponse.ok) throw new Error()
      const propData = await propResponse.json()
      setProperties(propData)

      // Fetch flats with optional property query filter
      const flatsUrl = selectedPropertyId && selectedPropertyId !== 'all' 
        ? `/api/flats?propertyId=${selectedPropertyId}` 
        : '/api/flats'
      const flatsResponse = await fetch(flatsUrl)
      if (!flatsResponse.ok) throw new Error()
      const flatsData = await flatsResponse.json()
      if (Array.isArray(flatsData)) {
        flatsData.sort((a: any, b: any) =>
          a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true, sensitivity: 'base' })
        )
      }
      setFlats(flatsData)
    } catch {
      toast.error('Could not load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFlatsAndProperties()
    fetchSettings()
  }, [selectedPropertyId])

  const handleOpenAddModal = () => {
    setEditingFlat(null)
    reset({
      propertyId: properties[0]?.id || '',
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
      propertyId: flat.propertyId,
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
      if (!response.ok) throw new Error()
      toast.success(editingFlat ? 'Flat unit updated successfully!' : 'Flat unit created successfully!')
      setIsModalOpen(false)
      fetchFlatsAndProperties()
    } catch {
      toast.error('Could not save flat unit. Confirm details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFlatClick = (flat: Flat) => {
    if (flat.status === 'OCCUPIED') {
      toast.error('Cannot delete flat unit. It is currently occupied.')
      return
    }
    setFlatToDelete(flat)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDeleteFlat = async () => {
    if (!flatToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/flats/${flatToDelete.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const resData = await response.json()
        throw new Error(resData.error || 'Failed to delete flat unit')
      }
      toast.success('Flat unit deleted successfully')
      setIsDeleteConfirmOpen(false)
      setFlatToDelete(null)
      fetchFlatsAndProperties()
    } catch (err: any) {
      toast.error(err.message || 'Could not delete flat unit')
    } finally {
      setIsDeleting(false)
    }
  }

  const getActiveTenantName = (flat: Flat) => {
    const active = flat.tenants.find(t => t.status === 'ACTIVE')
    return active ? active.name : null
  }

  // Properties list for dropdown filter
  const filterOptions = [
    { label: 'All Properties', value: 'all' },
    ...properties.map(p => ({ label: p.name, value: p.id }))
  ]

  // Properties list for Form select
  const formPropertyOptions = properties.map(p => ({ label: p.name, value: p.id }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Flats Database</h2>
          <p className="text-xs font-semibold text-slate-400">Manage rooms and flats registered across all buildings</p>
        </div>
        <Button onClick={handleOpenAddModal} className="shadow-md shadow-brand-500/10 gap-1.5 text-xs font-bold px-3.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Add Flat Unit</span>
        </Button>
      </div>

      {/* Filter panel */}
      <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
            Filter by Property
          </label>
          <Select
            id="filterProperty"
            options={filterOptions}
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full animate-pulse" />
          ))}
        </div>
      ) : flats.length === 0 ? (
        <EmptyState
          title="No flats found"
          description="Register flat units under your properties to begin tracking layouts and rents."
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
                    <th className="px-5 py-3.5">Property</th>
                    <th className="px-5 py-3.5">Floor</th>
                    <th className="px-5 py-3.5">BHK / Type</th>
                    <th className="px-5 py-3.5">Base Rent</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Tenant</th>
                    <th className="px-5 py-3.5 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {flats.map((flat) => {
                    const tenantName = getActiveTenantName(flat)
                    return (
                      <tr key={flat.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">{flat.flatNumber}</td>
                        <td className="px-5 py-4 font-bold text-slate-800">{flat.property.name}</td>
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
                            <span className="text-slate-800 font-bold">{tenantName}</span>
                          ) : (
                            <Link href={`/tenants/new?flatId=${flat.id}`} className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition-colors font-bold cursor-pointer">
                              <Users className="h-3 w-3" />
                              <span>Assign</span>
                            </Link>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right flex justify-end items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 border-emerald-250/60 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                            onClick={() => handleOpenEditModal(flat)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                            onClick={() => handleDeleteFlatClick(flat)}
                            title="Delete Flat Unit"
                          >
                            <Trash2 className="h-4 w-4" />
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
            {flats.map((flat) => {
              const tenantName = getActiveTenantName(flat)
              return (
                <Card key={flat.id} className="hover:shadow-md transition-shadow duration-150 flex flex-col justify-between p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Flat Unit</span>
                      <span className="font-extrabold text-slate-900 text-sm">{flat.flatNumber} · {flat.property.name}</span>
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
                        <span className="font-bold text-slate-800">{tenantName}</span>
                      ) : (
                        <Link href={`/tenants/new?flatId=${flat.id}`} className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg transition-colors font-bold cursor-pointer border border-slate-200">
                          <Users className="h-3 w-3 shrink-0" />
                          <span>Assign</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 justify-center text-xs font-bold text-emerald-600 border-emerald-250/60 hover:bg-emerald-50 hover:text-emerald-700 py-2 cursor-pointer"
                      onClick={() => handleOpenEditModal(flat)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 py-2 px-3 cursor-pointer"
                      onClick={() => handleDeleteFlatClick(flat)}
                      title="Delete Flat Unit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDeleteFlat}
        title="Delete Flat Unit"
        message={`Are you sure you want to permanently delete flat Unit ${flatToDelete?.flatNumber}? All historic rent billing records and logs associated with this flat will also be deleted.`}
        confirmText="Delete Flat"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

      {/* View/Edit or Add Flat Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFlat ? `Flat Details: Flat ${editingFlat.flatNumber}` : "Register New Flat Unit"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {editingFlat && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 grid grid-cols-2 gap-2 text-xs font-semibold">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Status</span>
                <Badge variant={editingFlat.status === 'OCCUPIED' ? 'occupied' : 'vacant'}>
                  {editingFlat.status}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Occupant</span>
                <span className="font-extrabold text-slate-800 font-bold">
                  {getActiveTenantName(editingFlat) || 'None (Vacant)'}
                </span>
              </div>
              <div className="col-span-2 pt-1.5 border-t border-slate-200/50 flex justify-between items-center">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Building Page</span>
                <Link 
                  href={`/properties/${editingFlat.propertyId}`}
                  className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Go to Building Details</span>
                </Link>
              </div>
            </div>
          )}
          <Select
            id="propertyId"
            label="Select Property"
            options={formPropertyOptions}
            placeholder="Select Property"
            error={errors.propertyId?.message}
            {...register('propertyId')}
          />

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
              {editingFlat ? "Save Changes" : "Create Flat"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
