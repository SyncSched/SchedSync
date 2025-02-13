import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Here you would typically save the onboarding data to your database
    // For now, we'll just return success
    
    // Set cookie for onboarding completion
    const response = NextResponse.json({ success: true });
    response.cookies.set('onboardingComplete', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
} 