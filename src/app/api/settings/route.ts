import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { settingsSchema } from '@/lib/validations'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.settings.findUnique({
    where: { userId: user.userId },
  })
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid settings fields' }, { status: 400 })
    }

    const settings = await prisma.settings.upsert({
      where: { userId: user.userId },
      update: parsed.data,
      create: {
        userId: user.userId,
        ...parsed.data,
      },
    })
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
