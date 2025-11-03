# Chrome Cache Fix - Deployment Guide

## Problem
App works fine in Safari but has issues in Chrome on Vercel:
- Username disappears on tab out/in
- Sign out button doesn't work
- Prices missing in dropdown
- Add button doesn't work
- **All issues resolved when DevTools "Disable cache" is enabled**

## Root Cause
Vercel's aggressive edge caching + Chrome's cache behavior causes stale JavaScript to be served. Safari handles cache differently, so it worked there.

## Solution Applied

### 1. Next.js Config (`next.config.mjs`)
Added:
- **Cache-busting headers**: Force `no-cache` on all routes
- **Unique build IDs**: Each deployment gets timestamp-based ID
- **Immutable static assets**: Only `_next/static` gets long cache

### 2. Vercel Config (`vercel.json`)
Added explicit platform-level cache headers to reinforce Next.js config.

### 3. Client-Side Cache Buster (`app/page.tsx`)
Added build ID detection:
- Compares current build ID with stored version
- Forces hard reload if build changed
- Prevents stale hydration mismatches

## Deployment Steps

1. **Commit these changes:**
   ```bash
   git add next.config.mjs vercel.json app/page.tsx
   git commit -m "Fix Chrome caching issues on Vercel"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Vercel will auto-deploy from GitHub
   - OR manually: `vercel --prod`

3. **Clear Vercel Cache (important!):**
   ```bash
   # Option A: Via Vercel CLI
   vercel env pull
   
   # Option B: Via Vercel Dashboard
   # Go to: Deployments → (latest) → ... menu → "Redeploy"
   # Check "Use existing build cache" = OFF
   ```

4. **Force Client Cache Clear:**
   After deployment, users should:
   - Chrome: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear site data: DevTools → Application → Clear storage

## Testing Checklist

After deployment, test in **Chrome** (not Safari):

- [ ] Sign in → tab out → tab in → username still visible
- [ ] Sign out button works immediately (check console for `[ui] Sign Out clicked`)
- [ ] Service prices load in dropdown
- [ ] Add to cart button works
- [ ] No need to have DevTools "Disable cache" enabled
- [ ] Check console for `[cache-buster]` messages (shows build ID checks)

## Debug Mode

Your debug panel is still available:
- Add `?debug=1` to URL
- Check "Session" section for valid access_token
- Verify "Auth events" show expected flow
- "Focus/visibility" should show clean tab-in/out

## Rollback Plan

If issues persist:
1. Check Vercel logs: `vercel logs <deployment-url>`
2. Verify headers in Chrome DevTools → Network → (any request) → Headers
3. Should see: `Cache-Control: no-cache, no-store, must-revalidate`

## Performance Note

These aggressive no-cache headers will slightly increase load times (users fetch fresh resources every visit). Once stable, you can:
- Move to `Cache-Control: max-age=60` for HTML
- Keep `immutable` for `_next/static/*` (already set)
- Use SWR/stale-while-revalidate for data fetching

## Why This Fixes Chrome Specifically

1. **Chrome's aggressive disk cache**: Chrome caches more aggressively than Safari
2. **Service Workers**: If you had any, they cache resources differently per browser
3. **Build ID changes**: Without unique IDs, Vercel might serve same build with different code
4. **Vercel Edge Cache**: CDN nodes cache responses; Chrome respects these more strictly

The combination of server headers + client build ID check ensures fresh resources on every deployment.
