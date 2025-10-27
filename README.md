Changes made:

Pricing rules now support turnaround keys from the database:
turnaround_standard
turnaround_expediated
turnaround_rush
The price computation function sums these DB rule amounts based on the selected dropdown:
If the dropdown is “Standard”, it adds turnaround_standard
If “Expediated”, adds turnaround_expediated
If “Rush”, adds turnaround_rush
The add-to-cart flow always computes price from DB rules with the selected options. If there are no rules for that service, it falls back to the base service price without any multiplier.
The previous client-side multiplier has been removed entirely.
Files updated:

utils/pricing.ts
Added new PricingKey values for turnaround.
computePriceFromRules now reads the selected dropdown and includes the corresponding turnaround_* rule amount if present.
app/page.tsx
In addToCartWithOptions, removed all multiplier code.
Always computes price using computePriceFromRules and only falls back to base price if no rules are found.
Keeps the selected turnaround in the item details for visibility.
What you need in the DB:

Table service_pricing_rules entries for each service and application_type you want to support should include:
professional_fee
option1 / goods_services / prior_use_yes / nice_classes as applicable
turnaround_standard / turnaround_expediated / turnaround_rush as fixed-amount add-ons
The service name in the “services” table must match the UI service title exactly for rule lookup.
Result:

Selecting Standard/Expediated/Rush in the modal dropdown will now add the correct amount from the database rules to the final cart price. No client-side multipliers are used.

## Deployment (Vercel) — Environment variables

Set these in your Vercel Project Settings → Environment Variables. Recommended defaults are production-friendly (no disruptive refreshes, no verbose logging).

- Public client config (NEXT_PUBLIC_*):
	- NEXT_PUBLIC_SITE_URL: https://your-domain.com
	- NEXT_PUBLIC_SUPABASE_URL: [your Supabase URL]
	- NEXT_PUBLIC_SUPABASE_ANON_KEY: [your Supabase anon key]
	- NEXT_PUBLIC_RAZORPAY_KEY_ID: [your Razorpay key id]
	- NEXT_PUBLIC_ENABLE_BANNER_API: 0 (enable only if you need remote banner images)
	- NEXT_PUBLIC_PRICING_CACHE_VER: 1 (bump to force client pricing cache bust)
	- Hard/soft refresh behaviors (recommended OFF in prod):
		- NEXT_PUBLIC_RESET_ON_FOCUS: 0
		- NEXT_PUBLIC_FORCE_REFRESH_ON_MAIN: 0
		- NEXT_PUBLIC_CART_RESET_ON_MAIN: 0
		- NEXT_PUBLIC_RESET_ON_RESIZE: 0
		- NEXT_PUBLIC_FORCE_REFRESH_ON_FOCUS_MS: 0
		- NEXT_PUBLIC_SOFT_RECOVER_MS: 45000
	- Diagnostics toggle (console only):
		- NEXT_PUBLIC_DEBUG: 0 (set to 1 only when troubleshooting)

- Server-side secrets (never prefixed with NEXT_PUBLIC):
	- SUPABASE_SERVICE_ROLE_KEY: [service role key]
	- SUPABASE_URL (optional alternative to NEXT_PUBLIC_SUPABASE_URL)
	- RAZORPAY_KEY_SECRET: [your Razorpay secret]
	- EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_TO: SMTP config for notifications
	- Optional payment flow diagnostics (defaults OFF):
		- PAYMENT_DEBUG: 0
		- PAYMENT_FLOW_DEBUG: 0
		- PAYMENT_FORCE_DELAY_MS: 0
		- VERIFY_FORCE_DELAY_MS: 0
	- Server debug beacon logging (defaults OFF):
		- DEBUG_BEACONS: 0 (set to 1 to log client beacons to server terminal)

Notes:
- The app/api/debug-log endpoint now ignores requests unless DEBUG_BEACONS=1 (or ENABLE_DEBUG_BEACONS=1). This eliminates terminal noise in production while keeping the endpoint safe for occasional troubleshooting.
- Keep .env.local out of version control (already covered by .gitignore). Use Vercel Env for production secrets.
