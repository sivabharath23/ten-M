import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const flatId = searchParams.get('flatId')
  const month = parseInt(searchParams.get('month') || '')
  const year = parseInt(searchParams.get('year') || '')

  if (!flatId || isNaN(month) || isNaN(year)) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
  }

  try {
    // Verify user owns the flat
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
      return NextResponse.json({ error: 'Flat not found or invalid permissions' }, { status: 404 })
    }

    // Find the latest reading prior to the specified month/year
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

    return NextResponse.json({
      reading: lastRecord ? lastRecord.reading : 0,
      hasPrevious: !!lastRecord
    })
  } catch (error) {
    console.error('Fetch last reading error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
