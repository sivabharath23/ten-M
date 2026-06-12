import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { signToken } from '@/lib/jwt'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  userType: z.enum(['SINGLE', 'MULTIPLE']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 })
    }

    const { name, email, password, userType } = parsed.data

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    
    // Use transaction to create user and settings atomically
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: { name, email, password: hashed, userType },
      })

      // Create default settings for new user
      await tx.settings.create({
        data: { userId: user.id },
      })

      return user
    })

    const token = await signToken({
      userId: result.id,
      email: result.email,
      name: result.name,
      userType: result.userType,
    })

    const res = NextResponse.json({ success: true, userType: result.userType })
    res.cookies.set('tenm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
