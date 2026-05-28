import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin UI (except the login page itself)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('auth-token')?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect mutating API calls
  if (
    (pathname.startsWith('/api/links') || pathname.startsWith('/api/categories')) &&
    request.method !== 'GET'
  ) {
    const token = request.cookies.get('auth-token')?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/links/:path*', '/api/categories/:path*'],
}
