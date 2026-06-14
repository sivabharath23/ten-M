import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get('month') || '')
  const year = parseInt(searchParams.get('year') || '')
  const propertyId = searchParams.get('propertyId')

  if (isNaN(month) || isNaN(year)) {
    return NextResponse.json({ error: 'Month and Year are required parameters' }, { status: 400 })
  }

  try {
    const rentRecords = await prisma.rentRecord.findMany({
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
        tenant: {
          select: { name: true, phone: true }
        },
        flat: {
          include: {
            property: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { flat: { flatNumber: 'asc' } }
    })

    return NextResponse.json(rentRecords)
  } catch (error) {
    console.error('Fetch rent records error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { month, year } = await req.json()
    if (!month || !year) {
      return NextResponse.json({ error: 'Month and Year are required' }, { status: 400 })
    }

    const properties = await prisma.property.findMany({
      where: { userId: user.userId, status: 'ACTIVE' },
      include: {
        flats: {
          include: {
            tenants: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    let createdCount = 0

    for (const property of properties) {
      for (const flat of property.flats) {
        for (const tenant of flat.tenants) {
          const exists = await prisma.rentRecord.findUnique({
            where: {
              tenantId_month_year: {
                tenantId: tenant.id,
                month,
                year
              }
            }
          })

          if (!exists) {
            await prisma.rentRecord.create({
              data: {
                tenantId: tenant.id,
                flatId: flat.id,
                month,
                year,
                rentAmount: tenant.currentRent,
                paidAmount: 0,
                status: 'PENDING'
              }
            })
            createdCount++
          }
        }
      }
    }

    return NextResponse.json({ success: true, generated: createdCount })
  } catch (error) {
    console.error('Generate rent records error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty ids' }, { status: 400 })
    }

    // Check ownership of all requested rent record IDs
    const records = await prisma.rentRecord.findMany({
      where: {
        id: { in: ids }
      },
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

    const allOwned = records.every(rec => rec.flat.property.userId === user.userId)
    if (!allOwned || records.length !== ids.length) {
      return NextResponse.json({ error: 'Unauthorized or invalid records' }, { status: 403 })
    }

    await prisma.rentRecord.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    return NextResponse.json({ success: true, deleted: ids.length })
  } catch (error) {
    console.error('Bulk delete rent records error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

