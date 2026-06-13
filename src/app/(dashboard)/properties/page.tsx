'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema } from '@/lib/validations'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import Link from 'next/link'
import { Building2, Plus, MapPin, Eye, Edit, Trash2 } from 'lucide-react'

type PropertyFormInputs = typeof propertySchema._output

interface Property {
  id: string
  name: string
  address: string
  city: string
  type: 'RESIDENTIAL' | 'COMMERCIAL'
  status: string
  totalFlats: number
  occupiedFlats: number
  vacantFlats: number
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  
  // Custom confirmation modal states for archiving properties
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PropertyFormInputs>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      type: 'RESIDENTIAL',
    },
  })

  // Fetch all properties
  const fetchProperties = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/properties')
      if (!response.ok) throw new Error('Failed to fetch properties')
      const data = await response.json()
      setProperties(data)
    } catch {
      toast.error('Could not load properties')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleOpenAddModal = () => {
    setEditingProperty(null)
    reset({
      name: '',
      address: '',
      city: '',
      type: 'RESIDENTIAL',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (prop: Property) => {
    setEditingProperty(prop)
    reset({
      name: prop.name,
      address: prop.address,
      city: prop.city,
      type: prop.type,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: PropertyFormInputs) => {
    setIsSubmitting(true)
    const url = editingProperty ? `/api/properties/${editingProperty.id}` : '/api/properties'
    const method = editingProperty ? 'PUT' : 'POST'
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Operation failed')
      toast.success(editingProperty ? 'Property updated successfully!' : 'Property added successfully!')
      setIsModalOpen(false)
      fetchProperties()
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchiveClick = (id: string) => {
    setArchiveId(id)
  }

  const handleConfirmArchive = async () => {
    if (!archiveId) return
    setIsArchiving(true)
    try {
      const response = await fetch(`/api/properties/${archiveId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Archive failed')
      toast.success('Property archived successfully')
      setArchiveId(null)
      fetchProperties()
    } catch {
      toast.error('Failed to archive property')
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Properties</h2>
          <p className="text-xs font-semibold text-slate-400">View and manage your real estate assets</p>
        </div>
        <Button onClick={handleOpenAddModal} className="shadow-md shadow-brand-500/10 gap-1.5 text-xs font-bold px-3.5">
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="Create your first property to start registering rental flats."
          icon={<Building2 className="h-10 w-10 text-slate-300" />}
          actionLabel="Add Property"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((prop) => (
            <Card key={prop.id} className="hover:shadow-md transition-shadow duration-150 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base leading-tight mb-1">{prop.name}</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{prop.address}, {prop.city}</span>
                    </div>
                  </div>
                  <Badge variant={prop.type === 'COMMERCIAL' ? 'partial' : 'occupied'}>
                    {prop.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Flats</p>
                    <p className="text-base font-black text-slate-700">{prop.totalFlats}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Occupied</p>
                    <p className="text-base font-black text-emerald-600">{prop.occupiedFlats}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Vacant</p>
                    <p className="text-base font-black text-slate-500">{prop.vacantFlats}</p>
                  </div>
                </div>
              </div>

              {/* Action Footers */}
              <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 gap-2">
                <Link href={`/properties/${prop.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Units</span>
                  </Button>
                </Link>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 h-auto text-violet-600 hover:text-violet-700 hover:bg-violet-50" 
                    onClick={() => handleOpenEditModal(prop)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 h-auto text-rose-500 hover:bg-rose-50"
                    onClick={() => handleArchiveClick(prop.id)}
                    title="Archive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProperty ? 'Edit Property Details' : 'Register New Property'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Property Name"
            placeholder="e.g. Green Valley Apartments"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            id="address"
            label="Street Address"
            placeholder="e.g. 123 Main St, Block C"
            error={errors.address?.message}
            {...register('address')}
          />

          <Input
            id="city"
            label="City"
            placeholder="e.g. Bengaluru"
            error={errors.city?.message}
            {...register('city')}
          />

          <Select
            id="type"
            label="Property Type"
            options={[
              { label: 'Residential (Apartments/Rooms)', value: 'RESIDENTIAL' },
              { label: 'Commercial (Shops/Offices)', value: 'COMMERCIAL' },
            ]}
            error={errors.type?.message}
            {...register('type')}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingProperty ? 'Save Changes' : 'Create Property'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Archive Property Confirmation Popup */}
      <ConfirmModal
        isOpen={archiveId !== null}
        onClose={() => setArchiveId(null)}
        onConfirm={handleConfirmArchive}
        title="Archive Property"
        message="Are you sure you want to archive this property? All associated flats and active tenants will be preserved but hidden."
        confirmText="Archive"
        cancelText="Cancel"
        type="danger"
        isLoading={isArchiving}
      />
    </div>
  )
}
