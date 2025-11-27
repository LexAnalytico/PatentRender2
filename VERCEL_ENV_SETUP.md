# Vercel Environment Variables Setup

## Required Environment Variables for Payment Flow

Your application needs the following environment variables to be set in Vercel:

### 1. Razorpay Configuration
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_gwjWZPFMeJaeNL
RAZORPAY_KEY_SECRET=2reCuFAALoT98JMKWGKHmPPB
```

### 2. Supabase Configuration
Check that these are also set (should already be configured):
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: **PatentRender2** (or your project name)
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_RAZORPAY_KEY_ID`)
   - **Value**: Variable value
   - **Environments**: Select all three (Production, Preview, Development)
6. Click **Save**
7. **Important**: After adding variables, you must redeploy:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Select **Redeploy**
   - OR simply push a new commit to trigger a deployment

## Testing Locally

To test locally, make sure:
1. Your `.env.local` file has all required variables
2. Restart your dev server after any changes to `.env.local`
3. Run: `npm run dev`

## Verification

After deployment, you can verify the environment variables are loaded by:
1. Opening browser console on your deployed site
2. Checking the `/api/health` endpoint (if available)
3. Attempting a payment flow - it should now work

## Security Note

- `NEXT_PUBLIC_*` variables are exposed to the browser (client-side)
- `RAZORPAY_KEY_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` are server-only
- Never commit `.env.local` to git (it should be in `.gitignore`)
