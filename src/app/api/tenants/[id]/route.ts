import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'

async function checkOwnership(tenantId: string, userId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      flat: {
        include: {
          property: {
            select: { userId: true }
          }
        }
      }
    }
  })
  return tenant && tenant.flat.property.userId === userId
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isOwner = await checkOwnership(id, user.userId)
    if (!isOwner) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        flat: {
          include: {
            property: true
          }
        },
        rentRecords: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ]
        },
        advanceRecords: {
          orderBy: { date: 'desc' }
        },
        rentRevisions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!tenant) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    // Fetch water records for the flat as well
    const waterRecords = await prisma.waterRecord.findMany({
      where: { flatId: tenant.flatId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })

    return NextResponse.json({
      ...tenant,
      waterRecords
    })
  } catch (error) {
    console.error('Fetch tenant detail error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isOwner = await checkOwnership(id, user.userId)
    if (!isOwner) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const body = await req.json()
    const { 
      name, 
      phone, 
      email, 
      idProofType, 
      idProofNumber, 
      idProofUrl, 
      status,
      joiningDate,
      currentRent,
      advanceAmount,
      flatId
    } = body

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const currentTenant = await tx.tenant.findUnique({
        where: { id }
      })
      if (!currentTenant) throw new Error('Tenant not found')

      let targetFlatId = currentTenant.flatId
      if (flatId !== undefined && flatId !== currentTenant.flatId) {
        // Verify new flat is vacant
        const targetFlat = await tx.flat.findUnique({
          where: { id: flatId }
        })
        if (!targetFlat) throw new Error('New flat unit not found')
        if (targetFlat.status === 'OCCUPIED') {
          throw new Error('New flat unit is already occupied.')
        }

        // If tenant is active, free up old flat and occupy new one
        const activeStatus = status !== undefined ? status : currentTenant.status
        if (activeStatus === 'ACTIVE') {
          await tx.flat.update({
            where: { id: currentTenant.flatId },
            data: { status: 'VACANT' }
          })
          await tx.flat.update({
            where: { id: flatId },
            data: { status: 'OCCUPIED' }
          })
        }
        targetFlatId = flatId

        // Update existing rent records to reference the new flatId
        await tx.rentRecord.updateMany({
          where: { tenantId: id },
          data: { flatId }
        })
      }

      // Handle status change
      if (status !== undefined && status !== currentTenant.status) {
        if (status === 'VACATED') {
          await tx.flat.update({
            where: { id: targetFlatId },
            data: { status: 'VACANT' }
          })
        } else if (status === 'ACTIVE') {
          const flatCheck = await tx.flat.findUnique({
            where: { id: targetFlatId }
          })
          if (flatCheck && flatCheck.status === 'OCCUPIED') {
            throw new Error('Flat unit is currently occupied by another active tenant.')
          }
          await tx.flat.update({
            where: { id: targetFlatId },
            data: { status: 'OCCUPIED' }
          })
        }
      }

      const updated = await tx.tenant.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          phone: phone !== undefined ? phone : undefined,
          email: email !== undefined ? email : undefined,
          idProofType: idProofType !== undefined ? idProofType : undefined,
          idProofNumber: idProofNumber !== undefined ? idProofNumber : undefined,
          idProofUrl: idProofUrl !== undefined ? idProofUrl : undefined,
          status: status !== undefined ? status : undefined,
          joiningDate: joiningDate !== undefined ? new Date(joiningDate) : undefined,
          currentRent: currentRent !== undefined ? Number(currentRent) : undefined,
          advanceAmount: advanceAmount !== undefined ? Number(advanceAmount) : undefined,
          flatId: flatId !== undefined ? flatId : undefined,
        }
      })

      return updated
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Update tenant error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isOwner = await checkOwnership(id, user.userId)
    if (!isOwner) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const tenant = await prisma.tenant.findUnique({
      where: { id }
    })
    if (!tenant) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      // If tenant is active, make the flat VACANT
      if (tenant.status === 'ACTIVE') {
        await tx.flat.update({
          where: { id: tenant.flatId },
          data: { status: 'VACANT' }
        })
      }

      // Delete related records
      await tx.rentRecord.deleteMany({ where: { tenantId: id } })
      await tx.advanceRecord.deleteMany({ where: { tenantId: id } })
      await tx.rentRevision.deleteMany({ where: { tenantId: id } })

      // Delete tenant
      await tx.tenant.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete tenant error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
