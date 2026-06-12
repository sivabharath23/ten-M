import { cookies } from 'next/headers'
import { verifyToken, TokenPayload } from './jwt'

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('tenm_token')?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}
