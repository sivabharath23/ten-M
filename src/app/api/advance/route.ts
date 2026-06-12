import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { advanceRecordSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId')

  if (!tenantId) {
    return NextResponse.json({ error: 'TenantId parameter is required' }, { status: 400 })
  }

  try {
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

    if (!tenant || tenant.flat.property.userId !== user.userId) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const advanceRecords = await prisma.advanceRecord.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(advanceRecords)
  } catch (error) {
    console.error('Fetch advance records error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = advanceRecordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
    }

    const { tenantId, type, amount, date, notes } = parsed.data

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

    if (!tenant || tenant.flat.property.userId !== user.userId) {
      return NextResponse.json({ error: 'Tenant not found or invalid permissions' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create AdvanceRecord
      const record = await tx.advanceRecord.create({
        data: {
          tenantId,
          type,
          amount,
          date: new Date(date),
          notes
        }
      })

      // 2. Compute new balance change
      let change = 0
      if (type === 'RECEIVED') change = amount
      else if (type === 'DEDUCTED' || type === 'REFUNDED') change = -amount

      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          advanceAmount: {
            increment: change
          }
        }
      })

      return { record, newBalance: updatedTenant.advanceAmount }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Register advance record error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
