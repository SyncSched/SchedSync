import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the token from localStorage
  const token = request.cookies.get('authToken')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // If trying to access login page while already authenticated, redirect to home
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If trying to access protected route without authentication, redirect to login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 