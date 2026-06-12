import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { flatSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')

  try {
    const flats = await prisma.flat.findMany({
      where: {
        property: {
          userId: user.userId,
          status: 'ACTIVE',
        },
        ...(propertyId ? { propertyId } : {})
      },
      include: {
        property: {
          select: { name: true }
        },
        tenants: {
          where: { status: 'ACTIVE' }
        }
      },
      orderBy: [
        { propertyId: 'asc' },
        { flatNumber: 'asc' }
      ]
    })

    return NextResponse.json(flats)
  } catch (error) {
    console.error('Fetch flats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = flatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid flat fields' }, { status: 400 })
    }

    // Verify parent property ownership
    const property = await prisma.property.findFirst({
      where: { id: parsed.data.propertyId, userId: user.userId, status: 'ACTIVE' }
    })
    if (!property) {
      return NextResponse.json({ error: 'Invalid property ownership or property is inactive' }, { status: 400 })
    }

    const flat = await prisma.flat.create({
      data: parsed.data
    })
    return NextResponse.json(flat, { status: 201 })
  } catch (error) {
    console.error('Create flat error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
