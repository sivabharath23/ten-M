import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-at-least-32-characters-long-tenm-portal')

const PUBLIC_PATHS = ['/login', '/register', '/api/auth']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Allow public paths
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  const token = req.cookies.get('tenm_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.set('tenm_token', '', { maxAge: 0, path: '/' })
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest\\.json|icon-.*\\.png$).*)'],
}
