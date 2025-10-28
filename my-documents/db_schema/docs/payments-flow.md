Payments Flow (Razorpay now, Paytm-ready)

Scope
- User checkout from cart/services to Orders → Payment → Forms, with verification and persistence.

Sequence (Razorpay)
1) Create Order
   - Client requests POST /api/create-order with selected services
   - Server validates user, computes total, creates records (payments.pending + orders), and creates a Razorpay order
   - Returns { id, amount, currency } to client
2) Open CheckoutJS
   - Client calls openRazorpayCheckout({...}) with server order id and customer details
   - User completes payment UI
3) Verification & Materialization
   - On success, client sends payload to /api/verify-payment (razorpay_signature, payment_id, order_id)
   - Server verifies signature, updates payments (captured), links orders to payment_id, sets statuses
   - Optional: /api/notify-payment for async hooks/logs
4) Orders Ready → Forms
   - /orders page polls status; once ready, navigates to /forms?order_id=<id>&type=<resolved>
   - FormClient resolves canonical type via: orders.type → payments.type → service_pricing_rules.key mapping
5) Forms Completion
   - User fills dynamic fields; autosave drafts to localStorage
   - Submit → Confirm sets form_responses.completed=true; thank-you banner shows; draft cleared

Provider-agnostic fields
- payments: provider_payment_id, provider_order_id, provider ("razorpay"|"paytm"), payment_status, total_amount
- UI: display Payment ID consistently (provider_payment_id || razorpay_payment_id || id)

Edge Cases & Retries
- Pending/Slow capture: Orders overlay shows "Waiting for payment confirmation"; polls until ready or timeout
- Signature verify fail: Mark payment as failed; show retry option
- Partial orders: If creating multiple orders for a single payment, ensure linking all orders to payment_id
- Idempotency: create-order should be idempotent for the same cart to avoid duplicates
- RLS issues: Forms/attachments endpoints scoped to auth.uid(); on RLS errors, show friendly messages and log when FLOW_DEBUG

Paytm Adaptation
- Replace Razorpay order creation with Paytm order/token creation on server
- Swap client CheckoutJS integration to Paytm’s equivalent
- Keep /api/verify-payment shape similar; map Paytm success/callback fields into provider-agnostic columns
- Continue to derive orders→forms the same way (orders.type → payments.type → pricing map)

Observability
- Console flow logs behind NEXT_PUBLIC_PAYMENT_FLOW_DEBUG/FLOW_DEBUG
- Consider storing webhook/verify traces for audit in a separate table if needed
