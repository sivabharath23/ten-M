import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { propertySchema } from '@/lib/validations'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const properties = await prisma.property.findMany({
      where: { 
        userId: user.userId,
        status: 'ACTIVE'
      },
      include: {
        _count: {
          select: { flats: true }
        },
        flats: {
          select: {
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const result = properties.map(prop => {
      const totalFlats = prop._count.flats
      const occupiedFlats = prop.flats.filter(f => f.status === 'OCCUPIED').length
      return {
        id: prop.id,
        name: prop.name,
        address: prop.address,
        city: prop.city,
        type: prop.type,
        status: prop.status,
        totalFlats,
        occupiedFlats,
        vacantFlats: totalFlats - occupiedFlats,
        createdAt: prop.createdAt
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Fetch properties error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = propertySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid property fields' }, { status: 400 })
    }

    const property = await prisma.property.create({
      data: {
        userId: user.userId,
        ...parsed.data
      }
    })
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Create property error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
