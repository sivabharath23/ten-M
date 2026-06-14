import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { tenantSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'ACTIVE'

  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        flat: {
          property: {
            userId: user.userId,
            status: 'ACTIVE',
          }
        },
        status: status as 'ACTIVE' | 'VACATED'
      },
      include: {
        flat: {
          include: {
            property: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: {
        flat: {
          flatNumber: 'asc'
        }
      }
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Fetch tenants error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = tenantSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid tenant fields' }, { status: 400 })
    }

    const { flatId, name, phone, email, idProofType, idProofNumber, idProofUrl, joiningDate, currentRent, advanceAmount } = parsed.data

    // 1. Verify ownership and occupancy of the flat
    const flat = await prisma.flat.findFirst({
      where: {
        id: flatId,
        property: {
          userId: user.userId,
          status: 'ACTIVE'
        }
      }
    })
    if (!flat) {
      return NextResponse.json({ error: 'Flat not found or invalid permissions' }, { status: 400 })
    }
    if (flat.status === 'OCCUPIED') {
      return NextResponse.json({ error: 'Flat is already occupied' }, { status: 400 })
    }

    const joiningDateTime = new Date(joiningDate)
    const joinMonth = joiningDateTime.getMonth() + 1 // 1-indexed (Jan is 0, so add 1)
    const joinYear = joiningDateTime.getFullYear()

    // 2. Perform atomic database transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create Tenant record
      const tenant = await tx.tenant.create({
        data: {
          flatId,
          name,
          phone: phone || '',
          email,
          idProofType,
          idProofNumber,
          idProofUrl,
          joiningDate: joiningDateTime,
          currentRent,
          advanceAmount,
          status: 'ACTIVE',
        }
      })

      // Update Flat status to OCCUPIED
      await tx.flat.update({
        where: { id: flatId },
        data: { status: 'OCCUPIED' }
      })

      // Create initial RentRecord for the joining month
      await tx.rentRecord.create({
        data: {
          tenantId: tenant.id,
          flatId,
          month: joinMonth,
          year: joinYear,
          rentAmount: currentRent,
          paidAmount: 0,
          status: 'PENDING'
        }
      })

      // Create an initial AdvanceRecord if there is an advance deposit paid
      if (advanceAmount > 0) {
        await tx.advanceRecord.create({
          data: {
            tenantId: tenant.id,
            type: 'RECEIVED',
            amount: advanceAmount,
            date: joiningDateTime,
            notes: 'Initial security deposit received on joining'
          }
        })
      }

      return tenant
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create tenant error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
