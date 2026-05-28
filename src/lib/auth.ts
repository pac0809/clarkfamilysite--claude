import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'clark-family-dev-secret-change-in-production'
  return new TextEncoder().encode(secret)
}

export async function signToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export function checkPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'clark2024'
  return password === adminPassword
}
