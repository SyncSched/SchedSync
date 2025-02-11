import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the token from localStorage
  const token = request.cookies.get('authToken')
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isOnboardingPage = request.nextUrl.pathname === '/onboarding'
  const hasCompletedOnboarding = request.cookies.get('onboardingComplete')

  // If trying to access login page while already authenticated
  if (isLoginPage && token) {
    // Redirect to onboarding if not completed, otherwise to home
    if (!hasCompletedOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If not authenticated, redirect to login (except for login page)
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated but hasn't completed onboarding
  if (token && !hasCompletedOnboarding && !isOnboardingPage) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/', '/login', '/onboarding', '/dashboard/:path*']
} 