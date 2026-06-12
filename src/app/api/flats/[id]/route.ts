import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { flatSchema } from '@/lib/validations'

async function checkOwnership(flatId: string, userId: string) {
  const flat = await prisma.flat.findUnique({
    where: { id: flatId },
    include: {
      property: {
        select: { userId: true }
      }
    }
  })
  return flat && flat.property.userId === userId
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

    const flat = await prisma.flat.findUnique({
      where: { id },
      include: {
        property: true,
        tenants: {
          where: { status: 'ACTIVE' }
        }
      }
    })

    return NextResponse.json(flat)
  } catch (error) {
    console.error('Fetch flat error:', error)
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
    const parsed = flatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
    }

    const updated = await prisma.flat.update({
      where: { id },
      data: {
        flatNumber: parsed.data.flatNumber,
        floor: parsed.data.floor,
        bhkType: parsed.data.bhkType,
        baseRent: parsed.data.baseRent,
        propertyId: parsed.data.propertyId,
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update flat error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
