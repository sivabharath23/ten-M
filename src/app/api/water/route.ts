import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { waterRecordSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get('month') || '')
  const year = parseInt(searchParams.get('year') || '')
  const propertyId = searchParams.get('propertyId')

  if (isNaN(month) || isNaN(year)) {
    return NextResponse.json({ error: 'Month and Year parameters are required' }, { status: 400 })
  }

  try {
    const waterRecords = await prisma.waterRecord.findMany({
      where: {
        month,
        year,
        flat: {
          property: {
            userId: user.userId,
            status: 'ACTIVE',
            ...(propertyId && propertyId !== 'all' ? { id: propertyId } : {})
          }
        }
      },
      include: {
        flat: {
          include: {
            property: {
              select: { name: true }
            },
            tenants: {
              where: { status: 'ACTIVE' },
              select: { name: true }
            }
          }
        }
      },
      orderBy: { flat: { flatNumber: 'asc' } }
    })

    return NextResponse.json(waterRecords)
  } catch (error) {
    console.error('Fetch water records error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = waterRecordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
    }

    const { flatId, month, year, unitsConsumed } = parsed.data

    // Check ownership of flat
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

    // Get current user settings for water cost snapshot
    const settings = await prisma.settings.findUnique({
      where: { userId: user.userId }
    })
    const waterCostPerLitre = settings?.waterCostPerLitre ?? 0.05
    const totalCost = unitsConsumed * waterCostPerLitre

    const waterRecord = await prisma.waterRecord.upsert({
      where: {
        flatId_month_year: {
          flatId,
          month,
          year
        }
      },
      create: {
        flatId,
        month,
        year,
        unitsConsumed,
        costPerLitre: waterCostPerLitre,
        totalCost,
        isPaid: false
      },
      update: {
        unitsConsumed,
        totalCost
      }
    })

    return NextResponse.json(waterRecord)
  } catch (error) {
    console.error('Register water reading error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
