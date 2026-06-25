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

    const { flatId, month, year, reading, initialReading } = parsed.data

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

    // Get previous reading chronologically prior to this month/year
    const lastRecord = await prisma.waterRecord.findFirst({
      where: {
        flatId,
        OR: [
          { year: { lt: year } },
          { year: year, month: { lt: month } }
        ]
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })

    let finalPreviousReading = 0
    let hasPrevious = !!lastRecord

    if (!hasPrevious && initialReading !== undefined && initialReading !== null) {
      // Create a starting baseline record for the prior month
      let priorMonth = month - 1
      let priorYear = year
      if (priorMonth === 0) {
        priorMonth = 12
        priorYear = year - 1
      }

      await prisma.waterRecord.create({
        data: {
          flatId,
          month: priorMonth,
          year: priorYear,
          reading: initialReading,
          unitsConsumed: 0,
          costPerLitre: waterCostPerLitre,
          totalCost: 0,
          isPaid: true,
          notes: "Initial starting baseline reading"
        }
      })
      finalPreviousReading = initialReading
      hasPrevious = true
    } else if (lastRecord) {
      finalPreviousReading = lastRecord.reading
    } else {
      // First log without custom initial reading defaults to reading (usage = 0)
      finalPreviousReading = reading
    }

    const unitsConsumed = Math.max(0, reading - finalPreviousReading)
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
        reading,
        unitsConsumed,
        costPerLitre: waterCostPerLitre,
        totalCost,
        isPaid: false
      },
      update: {
        reading,
        unitsConsumed,
        totalCost
      }
    })

    // Recalculate subsequent logs for this flat in case of out-of-order logs or edits
    await recalculateWaterLogs(flatId)

    return NextResponse.json(waterRecord)
  } catch (error) {
    console.error('Register water reading error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function recalculateWaterLogs(flatId: string) {
  // Get all water records for this flat, ordered chronologically
  const records = await prisma.waterRecord.findMany({
    where: { flatId },
    orderBy: [
      { year: 'asc' },
      { month: 'asc' }
    ]
  })

  // Recalculate units consumed and total cost for each record in the chain
  for (let i = 0; i < records.length; i++) {
    const current = records[i]
    let unitsConsumed = 0
    if (i > 0) {
      const previous = records[i - 1]
      unitsConsumed = Math.max(0, current.reading - previous.reading)
    } else {
      // First month reading is treated as baseline, so units consumed = 0
      unitsConsumed = 0
    }

    const totalCost = unitsConsumed * current.costPerLitre

    // Update if changed
    if (current.unitsConsumed !== unitsConsumed || current.totalCost !== totalCost) {
      await prisma.waterRecord.update({
        where: { id: current.id },
        data: {
          unitsConsumed,
          totalCost
        }
      })
    }
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

    // Check ownership of all requested water record IDs
    const records = await prisma.waterRecord.findMany({
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

    const flatIdsToRecalculate = Array.from(new Set(records.map(rec => rec.flatId)))

    await prisma.waterRecord.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    // Recalculate for each affected flat
    for (const flatId of flatIdsToRecalculate) {
      await recalculateWaterLogs(flatId)
    }

    return NextResponse.json({ success: true, deleted: ids.length })
  } catch (error) {
    console.error('Bulk delete water records error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

