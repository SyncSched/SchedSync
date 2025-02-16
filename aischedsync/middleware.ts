import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { checkOnboardingStatus } from './api/lib';

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login';
  const token = request.cookies.get('authToken');
  const onboardingCookie = request.cookies.get('onboardingComplete');

  if (!isLoginPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isOnboardingPage = request.nextUrl.pathname === '/onboarding';
  
  try {
    // Only proceed with checks if user is authenticated
    if (token) {
      let hasCompletedOnboarding = false;

      // First check cookie
      if (onboardingCookie) {
        hasCompletedOnboarding = true;
      } else {
        // If no cookie, check database
        hasCompletedOnboarding = await checkOnboardingStatus(token.value);
      }

      console.log(hasCompletedOnboarding,"this is from db")

      // If on login page and authenticated
      if (isLoginPage) {
        return hasCompletedOnboarding 
          ? NextResponse.redirect(new URL('/', request.url))
          : NextResponse.redirect(new URL('/onboarding', request.url));
      }

      if(isOnboardingPage && hasCompletedOnboarding){
        return NextResponse.redirect(new URL('/', request.url))
      }
      // If not completed onboarding and not on onboarding page
      if (!hasCompletedOnboarding && !isOnboardingPage) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to login for safety
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/', '/login', '/onboarding', '/dashboard/:path*']
}
