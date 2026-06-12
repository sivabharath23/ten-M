import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { propertySchema } from '@/lib/validations'

async function checkOwnership(propertyId: string, userId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId }
  })
  return property && property.userId === userId
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

    const property = await prisma.property.findFirst({
      where: { id, status: 'ACTIVE' },
      include: {
        flats: {
          include: {
            tenants: {
              where: { status: 'ACTIVE' }
            }
          },
          orderBy: { flatNumber: 'asc' }
        }
      }
    })

    if (!property) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Fetch property error:', error)
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
    const parsed = propertySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
    }

    const updated = await prisma.property.update({
      where: { id },
      data: parsed.data
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update property error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isOwner = await checkOwnership(id, user.userId)
    if (!isOwner) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    // Soft-delete by marking status as INACTIVE
    const archived = await prisma.property.update({
      where: { id },
      data: { status: 'INACTIVE' }
    })

    return NextResponse.json({ success: true, archived })
  } catch (error) {
    console.error('Delete property error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
