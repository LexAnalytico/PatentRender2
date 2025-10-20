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

## Architecture & Docs

- High-level design: db_schema/architecture/high-level-design
- Dependency diagram (madge): db_schema/architecture/deps.png
- Data model overview: db_schema/docs/data-model-overview.md
- Payments flow (Razorpay now, Paytm-ready): db_schema/docs/payments-flow.md
- RLS policies: db_schema/docs/rls-policies.md
- Tab focus guidelines (tab-out/tab-in): db_schema/architecture/docs/tab-focus-guidelines.md
