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

    const { status, paidAmount, paidOn, paymentMode, notes, payWaterBill, waterPaidAmount } = parsed.data

    const updated = await prisma.rentRecord.update({
      where: { id },
      data: {
        status,
        paidAmount,
        paidOn: paidOn ? new Date(paidOn) : null,
        paymentMode,
        notes
      }
    })

    if (payWaterBill !== undefined) {
      const flatId = updated.flatId
      const month = updated.month
      const year = updated.year

      const existingWater = await prisma.waterRecord.findUnique({
        where: {
          flatId_month_year: {
            flatId,
            month,
            year
          }
        }
      })

      if (payWaterBill) {
        if (existingWater) {
          await prisma.waterRecord.update({
            where: { id: existingWater.id },
            data: {
              isPaid: true,
              paidOn: paidOn ? new Date(paidOn) : new Date(),
              notes: notes ? `Paid with rent. ${notes}` : (existingWater.notes || 'Paid during rent collection')
            }
          })
        } else if (waterPaidAmount && waterPaidAmount > 0) {
          await prisma.waterRecord.create({
            data: {
              flatId,
              month,
              year,
              reading: 0,
              unitsConsumed: 0,
              costPerLitre: 0,
              totalCost: waterPaidAmount,
              isPaid: true,
              paidOn: paidOn ? new Date(paidOn) : new Date(),
              notes: notes ? `Paid with rent. ${notes}` : 'Recorded during rent collection'
            }
          })
        }
      } else {
        if (existingWater) {
          await prisma.waterRecord.update({
            where: { id: existingWater.id },
            data: {
              isPaid: false,
              paidOn: null
            }
          })
        }
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update rent record error:', error)
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

    await prisma.rentRecord.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete rent record error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
