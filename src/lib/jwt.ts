import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-at-least-32-characters-long-tenm-portal')

export interface TokenPayload {
  userId: string
  email: string
  name: string
  userType: string
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as TokenPayload
}
