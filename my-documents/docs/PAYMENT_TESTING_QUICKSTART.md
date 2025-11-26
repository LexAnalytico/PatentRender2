# Payment Testing - Quick Start

## ✅ Changes Made for Payment Support

### 1. **Updated Files:**
- ✅ `app/data/service-pricing-to-form.json` - Added design service type mappings
- ✅ `app/page.tsx` - Added `service_id` and `type` to all design cart items

### 2. **What's Now Included in Cart Items:**

**Design Filing:**
```javascript
{
  service_id: 10,
  type: 'design_filing',
  application_type: 'individual' | 'startup_msme' | 'large_entity',
  price: 11000 | 12000 | 14000
}
```

**Response to FER:**
```javascript
{
  service_id: 13,
  type: 'design_fer_response',
  price: 5000
}
```

**Hearing:**
```javascript
{
  service_id: 14,
  type: 'design_hearing',
  price: 5000
}
```

**Cancellation:**
```javascript
{
  service_id: 15,
  type: 'design_cancellation',
  application_type: 'individual' | 'startup_msme' | 'large_entity',
  price: 16500 | 18000 | 21000
}
```

---

## 🧪 Quick Test (5 Minutes)

### Test 1: Cart Structure
1. Open http://localhost:3001
2. Add Design Filing (Individual) to cart
3. Open browser console (F12)
4. Run:
```javascript
JSON.parse(localStorage.getItem('cart_items_v1'))
```
5. **Should show:** `service_id: 10, type: "design_filing"`

### Test 2: Complete Payment Flow
1. Add any design service to cart
2. Click Checkout
3. Login if needed
4. Complete payment (use test card: `4111 1111 1111 1111`)
5. Check Supabase `orders` table
6. **Should see:** New order with `service_id` and `type` populated

### Test 3: Multi-Service Order
1. Add all 4 design services to cart
2. Complete checkout
3. Check Supabase `orders` table
4. **Should see:** 4 separate order rows, all with correct `service_id` and `type`

---

## 🔍 Database Verification

### Quick Query:
```sql
SELECT 
  o.id,
  s.name as service_name,
  o.type,
  o.amount,
  o.created_at
FROM public.orders o
LEFT JOIN public.services s ON o.service_id = s.id
WHERE o.service_id IN (10, 13, 14, 15)
ORDER BY o.created_at DESC
LIMIT 10;
```

**Expected:** Orders with design service names, correct types, and amounts

---

## ✅ Success Indicators

- ✅ Cart items have `service_id` and `type` fields
- ✅ Payment creates order with `service_id IN (10,13,14,15)`
- ✅ Order `type` is one of: `design_filing`, `design_fer_response`, `design_hearing`, `design_cancellation`
- ✅ Order `category_id = 4` (Design category)
- ✅ No constraint errors in server logs
- ✅ Multi-service cart creates multiple orders

---

## 🚨 What to Watch For

**Red Flags:**
- ❌ Cart item has `service_id: null`
- ❌ Cart item missing `type` field
- ❌ Server log shows: "constraint retry without type"
- ❌ Orders table shows `type: null`
- ❌ Multiple cart items create single order

**All Good:**
- ✅ Cart items have all required fields
- ✅ Orders created match cart items count
- ✅ Each order has correct `service_id`, `type`, and `amount`
- ✅ No errors in server console

---

## 📋 Testing Priority

**Do These First:**
1. ✅ Verify cart structure (2 min)
2. ✅ Test single design service checkout (3 min)
3. ✅ Test multi-service checkout (3 min)
4. ✅ Verify database orders (1 min)

**Total:** ~10 minutes for core validation

---

## 📞 Support

If you see issues:
1. Check server terminal for errors
2. Check browser console for errors
3. Verify localStorage cart structure
4. Check Supabase orders table for `service_id` and `type`

**For detailed testing:** See `DESIGN_SERVICES_PAYMENT_TEST.md`
