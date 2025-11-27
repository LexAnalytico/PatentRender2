import { NextResponse } from 'next/server';

/**
 * Simple endpoint to verify environment configuration
 * GET /api/config-check
 */
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    checks: {
      razorpay_key_id: {
        configured: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        value: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID 
          ? `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.substring(0, 8)}...` 
          : 'NOT SET'
      },
      razorpay_secret: {
        configured: !!process.env.RAZORPAY_KEY_SECRET,
        value: process.env.RAZORPAY_KEY_SECRET ? 'SET (hidden)' : 'NOT SET'
      },
      supabase_url: {
        configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
        value: process.env.NEXT_PUBLIC_SUPABASE_URL 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` 
          : 'NOT SET'
      },
      supabase_anon_key: {
        configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
          : 'NOT SET'
      },
      supabase_service_role: {
        configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET'
      }
    }
  };

  const allConfigured = Object.values(checks.checks).every(c => c.configured);
  
  return NextResponse.json({
    ...checks,
    status: allConfigured ? 'OK' : 'INCOMPLETE',
    message: allConfigured 
      ? 'All required environment variables are configured' 
      : 'Some environment variables are missing. Check the checks object for details.'
  }, { 
    status: allConfigured ? 200 : 500 
  });
}
