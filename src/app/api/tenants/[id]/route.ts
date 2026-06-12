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
    const { name, phone, email, idProofType, idProofNumber, idProofUrl, status } = body

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const currentTenant = await tx.tenant.findUnique({
        where: { id }
      })
      if (!currentTenant) throw new Error('Tenant not found')

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
        }
      })

      // If status changed from ACTIVE to VACATED, free up the flat unit
      if (status === 'VACATED' && currentTenant.status === 'ACTIVE') {
        await tx.flat.update({
          where: { id: currentTenant.flatId },
          data: { status: 'VACANT' }
        })
      }

      // If status reverted from VACATED to ACTIVE, make the flat OCCUPIED again
      if (status === 'ACTIVE' && currentTenant.status === 'VACATED') {
        const flatCheck = await tx.flat.findUnique({
          where: { id: currentTenant.flatId }
        })
        if (flatCheck && flatCheck.status === 'OCCUPIED') {
          throw new Error('Flat unit is currently occupied by another active tenant.')
        }
        await tx.flat.update({
          where: { id: currentTenant.flatId },
          data: { status: 'OCCUPIED' }
        })
      }

      return updated
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Update tenant error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
