import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { rentRecordUpdateSchema } from '@/lib/validations'

async function checkOwnership(rentRecordId: string, userId: string) {
  const record = await prisma.rentRecord.findUnique({
    where: { id: rentRecordId },
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
  return record && record.flat.property.userId === userId
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
    const parsed = rentRecordUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
    }

    const { status, paidAmount, paidOn, notes } = parsed.data

    const updated = await prisma.rentRecord.update({
      where: { id },
      data: {
        status,
        paidAmount,
        paidOn: paidOn ? new Date(paidOn) : null,
        notes
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update rent record error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
