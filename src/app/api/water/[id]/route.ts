import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { recalculateWaterLogs } from '../route'

async function checkOwnership(waterRecordId: string, userId: string) {
  const record = await prisma.waterRecord.findUnique({
    where: { id: waterRecordId },
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
    const { isPaid } = body

    const updated = await prisma.waterRecord.update({
      where: { id },
      data: {
        isPaid: !!isPaid,
        paidOn: isPaid ? new Date() : null
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update water record error:', error)
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

    // Find the record to get flatId
    const record = await prisma.waterRecord.findUnique({
      where: { id },
      select: { flatId: true }
    })

    await prisma.waterRecord.delete({
      where: { id }
    })

    if (record) {
      await recalculateWaterLogs(record.flatId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete water record error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

