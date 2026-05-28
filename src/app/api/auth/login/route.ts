import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await signToken()
  const response = NextResponse.json({ success: true })

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
