# Authentication Security Migration Plan

## Current Security Issue

The application currently uses two different Supabase client implementations:

1. **INSECURE**: `/lib/supabase.ts` - Uses `@supabase/supabase-js` with localStorage (vulnerable to XSS)
2. **SECURE**: `/lib/supabase-browser.ts` - Uses `@supabase/ssr` with httpOnly cookies (XSS-safe)

## Why This Matters

**localStorage Vulnerability:**
- Accessible via JavaScript: `localStorage.getItem('supabase.auth.token')`
- Any XSS vulnerability allows attackers to steal auth tokens
- No HttpOnly protection
- Tokens persist across browser sessions

**Cookie-based Storage (Current Secure Implementation):**
- HttpOnly cookies cannot be accessed via JavaScript
- Automatically sent with requests
- Can have SameSite protection
- Better CSRF protection

## Migration Steps

### Phase 1: Update Client Components (High Priority)

Replace all imports of `/lib/supabase` with `/lib/supabase-browser` in client components:

**Files to Update:**
1. `app/page.tsx` - Main application (CRITICAL)
2. `components/Navbar.tsx`
3. `components/AutoLogout.tsx`
4. `components/screens/OrdersScreen.tsx`
5. `components/screens/ProfileScreen.tsx`
6. `app/forms/FormClient.tsx`
7. `app/reset-password/page.tsx`
8. `app/useAuthProfile.ts`
9. `app/admin/page.tsx`
10. `app/profile/page.tsx`
11. `app/profile/overview/OverviewClient.tsx`

**Change:**
```typescript
// OLD (INSECURE)
import { supabase } from '@/lib/supabase'

// NEW (SECURE)
import { supabaseBrowser as supabase } from '@/lib/supabase-browser'
```

### Phase 2: Update API Routes (Medium Priority)

API routes should use server-side client:

**Files to Update:**
1. `app/api/order-status/route.ts`
2. `app/api/create-order/route.ts`
3. `app/api/notify-payment/route.ts`
4. `app/api/verify-payment/route.ts`

**Change:**
```typescript
// OLD
import { supabase } from '@/lib/supabase'

// NEW (For API routes - use server client)
import { getSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = getSupabaseServer()
  // ... rest of code
}
```

### Phase 3: Add Middleware for Auth (Recommended)

Create Next.js middleware to handle auth refresh and protect routes:

**Create `middleware.ts`:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Phase 4: Enhanced Cookie Configuration

Update `lib/supabase-browser.ts` with secure cookie options:

```typescript
"use client"
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function getSupabaseBrowser() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce', // More secure than implicit flow
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    cookieOptions: {
      name: 'sb-auth-token',
      domain: process.env.NEXT_PUBLIC_SITE_URL 
        ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname 
        : undefined,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
  })
}

export const supabaseBrowser = getSupabaseBrowser()
```

### Phase 5: Remove Old Client

Once migration is complete, remove or deprecate `/lib/supabase.ts`:

```typescript
// lib/supabase.ts (DEPRECATED)
/**
 * @deprecated Use supabaseBrowser from '@/lib/supabase-browser' for client components
 * or getSupabaseServer from '@/lib/supabase-server' for server components/API routes
 * 
 * This client uses localStorage which is vulnerable to XSS attacks.
 */
export { supabaseBrowser as supabase } from './supabase-browser'
```

## Additional Security Measures

### 1. Add Content Security Policy

In `next.config.mjs`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://www.googletagmanager.com; connect-src 'self' https://*.supabase.co https://api.razorpay.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; frame-src https://api.razorpay.com;"
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ]
  },
}
```

### 2. Enable Supabase Security Features

In Supabase Dashboard → Authentication → Settings:

- ✅ Enable PKCE flow
- ✅ Set secure redirect URLs only
- ✅ Enable email confirmation
- ✅ Enable captcha protection
- ✅ Set session timeout (e.g., 7 days)
- ✅ Enable MFA support (optional)

### 3. Add Rate Limiting

For API routes, add rate limiting to prevent brute force:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})
```

## Testing Checklist

After migration:

- [ ] Login/logout works correctly
- [ ] Session persists across page refreshes
- [ ] Session expires after timeout
- [ ] No auth tokens in localStorage (check DevTools → Application → Local Storage)
- [ ] Auth tokens in cookies (check DevTools → Application → Cookies)
- [ ] Cookies have HttpOnly flag set
- [ ] OAuth flows work (Google login)
- [ ] Password reset works
- [ ] Protected routes redirect to login
- [ ] API routes properly authenticate requests

## Rollback Plan

If issues occur:

1. Keep `/lib/supabase.ts` as fallback
2. Test on staging environment first
3. Monitor error logs for auth failures
4. Have feature flag to switch between implementations

## Timeline

- **Week 1**: Update client components (Phase 1)
- **Week 2**: Update API routes (Phase 2) and add middleware (Phase 3)
- **Week 3**: Testing and security audit
- **Week 4**: Production deployment with monitoring

## References

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Supabase Auth Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
