# Environment Variables Setup

## Required Environment Variables

### Google Analytics 4 Setup

1. **Create Google Analytics 4 Property:**
   - Visit: https://analytics.google.com
   - Click "Admin" (bottom left)
   - Under "Property" column, click "Create Property"
   - Fill in property details:
     - Property name: "IP Protection India"
     - Reporting time zone: India (IST)
     - Currency: Indian Rupee (INR)
   - Click "Next" and complete setup

2. **Get Your Measurement ID:**
   - After creating property, you'll see "Data Streams"
   - Click "Add stream" → "Web"
   - Enter your website URL
   - Copy the Measurement ID (starts with G-XXXXXXXXXX)

3. **Add to Environment Variables:**

### Local Development (.env.local)
Create or update `.env.local` file in project root:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Replace G-XXXXXXXXXX with your actual Measurement ID
```

### Vercel Production Deployment

1. Go to your Vercel project dashboard
2. Navigate to: Settings → Environment Variables
3. Add new variable:
   - **Name:** `NEXT_PUBLIC_GA_ID`
   - **Value:** `G-XXXXXXXXXX` (your actual Measurement ID)
   - **Environment:** Production, Preview, Development (select all)
4. Click "Save"
5. Redeploy your application for changes to take effect

---

## Testing Google Analytics

### 1. Local Testing (Development)
```bash
# Restart your dev server after adding .env.local
npm run dev
```

Open your browser and check:
- Open DevTools → Network tab
- Filter by "google-analytics"
- You should see GA requests being sent

### 2. Real-time Testing
After deployment:
1. Visit: https://analytics.google.com
2. Go to: Reports → Realtime → Overview
3. Open your website in another tab
4. You should see yourself as an active user

---

## Security Notes

- ⚠️ **DO NOT** commit `.env.local` to git
- ✅ `.env.local` is already in `.gitignore`
- ✅ `NEXT_PUBLIC_` prefix makes it safe for client-side use
- ✅ GA Measurement ID is public and safe to expose

---

## Verification Checklist

- [ ] Created GA4 property
- [ ] Copied Measurement ID
- [ ] Added NEXT_PUBLIC_GA_ID to .env.local
- [ ] Restarted dev server
- [ ] Verified GA requests in Network tab
- [ ] Added NEXT_PUBLIC_GA_ID to Vercel
- [ ] Redeployed Vercel application
- [ ] Checked Real-time reports in GA4

---

## What Gets Tracked

Google Analytics will now track:
- ✅ Page views
- ✅ User sessions
- ✅ Geographic location
- ✅ Device type (mobile/desktop)
- ✅ Traffic sources (organic, direct, referral)
- ✅ User behavior and flow
- ✅ Conversion events (if configured)

This data helps you:
- Monitor SEO performance
- Identify which keywords bring traffic
- See which pages perform best
- Understand user behavior
- Make data-driven decisions

---

## Next Steps After Setup

1. **Set up Goals/Conversions:**
   - Contact form submissions
   - Service inquiries
   - Phone clicks
   - Email clicks

2. **Connect Google Search Console:**
   - Links GA4 with search performance data
   - See which queries bring visitors

3. **Create Custom Reports:**
   - Track specific metrics important to your business
   - Monitor patent filing vs trademark registration interest

---

## Troubleshooting

### GA not tracking?
1. Check if NEXT_PUBLIC_GA_ID is set correctly
2. Verify Measurement ID format (starts with G-)
3. Restart dev server after adding env variable
4. Check browser console for errors
5. Disable ad blockers when testing

### Data not showing?
- GA4 can take 24-48 hours to show full data
- Real-time reports work immediately
- Use Real-time reports for testing

---

## Support Resources

- **GA4 Documentation:** https://support.google.com/analytics
- **Next.js Third Parties:** https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries
- **Vercel Env Variables:** https://vercel.com/docs/projects/environment-variables
