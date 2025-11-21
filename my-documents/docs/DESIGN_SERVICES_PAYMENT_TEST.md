# Design Services - Payment Testing Guide

**Date:** November 21, 2025  
**Server:** http://localhost:3001  
**Branch:** design-services

---

## 🎯 What Changed for Payment Processing

### 1. **Service-to-Form Mapping** (`app/data/service-pricing-to-form.json`)
Added mappings for design service types:
```json
{
  "design_filing": "design_filing",
  "design_filing_individual": "design_filing",
  "design_filing_startup_msme": "design_filing",
  "design_filing_others": "design_filing",
  "design_fer_response": "design_fer_response",
  "design_hearing": "design_hearing",
  "design_cancellation": "design_cancellation",
  "design_cancellation_individual": "design_cancellation",
  "design_cancellation_startup_msme": "design_cancellation",
  "design_cancellation_others": "design_cancellation"
}
```

### 2. **Cart Items Enhanced** (`app/page.tsx`)
All design services now include:
- ✅ `service_id` (10, 13, 14, 15)
- ✅ `type` (design_filing, design_fer_response, etc.)
- ✅ `application_type` (individual, startup_msme, large_entity) for Filing & Cancellation
- ✅ Correct pricing

### 3. **Database Constraints** (Already in place from SQL migration)
- ✅ `orders` table accepts design service types
- ✅ `payments` table accepts design service types
- ✅ Pricing rules exist for all applicant types

---

## ✅ Payment Testing Checklist

### **Phase 1: Cart Verification**

#### Test 1.1: Design Filing Cart Item
- [ ] Add Design Filing (Individual) to cart
- [ ] Open browser DevTools → Console
- [ ] Check localStorage: `localStorage.getItem('cart_items_v1')`
- [ ] **Verify cart item contains:**
  ```javascript
  {
    id: "design-filing-...",
    name: "Design Filing",
    service_id: 10,
    price: 11000,
    category: "Design",
    details: "Individual",
    type: "design_filing",
    application_type: "individual"
  }
  ```

#### Test 1.2: Design Cancellation Cart Item
- [ ] Add Cancellation (Startup or MSME) to cart
- [ ] Check localStorage
- [ ] **Verify cart item contains:**
  ```javascript
  {
    id: "design-cancellation-...",
    name: "Cancellation",
    service_id: 15,
    price: 18000,
    category: "Design",
    details: "Startup or MSME",
    type: "design_cancellation",
    application_type: "startup_msme"
  }
  ```

#### Test 1.3: Response to FER Cart Item
- [ ] Add Response to FER to cart
- [ ] **Verify cart item contains:**
  ```javascript
  {
    id: "design-fer-...",
    name: "Response to FER",
    service_id: 13,
    price: 5000,
    category: "Design",
    details: "Single Service",
    type: "design_fer_response"
  }
  ```

#### Test 1.4: Hearing Cart Item
- [ ] Add Hearing to cart
- [ ] **Verify cart item contains:**
  ```javascript
  {
    id: "design-hearing-...",
    name: "Hearing",
    service_id: 14,
    price: 5000,
    category: "Design",
    details: "Single Service",
    type: "design_hearing"
  }
  ```

---

### **Phase 2: Order Creation API Testing**

#### Test 2.1: Create Order Request
- [ ] Add Design Filing (Individual) to cart
- [ ] Click "Checkout"
- [ ] Open DevTools → Network tab
- [ ] Look for POST request to `/api/create-order`
- [ ] **Verify request payload includes:**
  ```json
  {
    "amount": 1100000,  // 11,000 * 100 (paise)
    "currency": "INR",
    "user_id": "<your_user_id>",
    "service_id": 10,
    "type": "design_filing"
  }
  ```

#### Test 2.2: Payment Row Creation
After create-order API call:
- [ ] Go to Supabase Dashboard
- [ ] Navigate to `payments` table
- [ ] Find the most recent row with `payment_status = 'created'`
- [ ] **Verify the row contains:**
  ```sql
  razorpay_order_id: order_xxxxx
  service_id: 10
  type: design_filing
  total_amount: 11000
  payment_status: created
  ```

---

### **Phase 3: Payment Verification (Test Payment)**

#### Test 3.1: Complete Test Payment
- [ ] In Razorpay modal, use test card: `4111 1111 1111 1111`
- [ ] CVV: any 3 digits
- [ ] Expiry: any future date
- [ ] Click "Pay"
- [ ] Wait for success callback

#### Test 3.2: Verify Payment Request
- [ ] Open DevTools → Network tab
- [ ] Look for POST request to `/api/verify-payment`
- [ ] **Verify request payload includes:**
  ```json
  {
    "razorpay_order_id": "order_xxxxx",
    "razorpay_payment_id": "pay_xxxxx",
    "razorpay_signature": "xxxxx",
    "cart": [
      {
        "service_id": 10,
        "name": "Design Filing",
        "price": 11000,
        "type": "design_filing",
        "application_type": "individual"
      }
    ]
  }
  ```

#### Test 3.3: Payment Row Update
- [ ] Check Supabase `payments` table
- [ ] Find the row with `razorpay_payment_id = pay_xxxxx`
- [ ] **Verify:**
  ```sql
  payment_status: paid
  payment_date: <current_timestamp>
  service_id: 10
  type: design_filing
  total_amount: 11000
  ```

---

### **Phase 4: Order Creation Verification**

#### Test 4.1: Orders Table
- [ ] Check Supabase `orders` table
- [ ] Find orders with `payment_id = <payment_id_from_above>`
- [ ] **Verify each order row contains:**
  ```sql
  service_id: 10 (or 13, 14, 15)
  category_id: 4 (Design category)
  type: design_filing (or design_fer_response, etc.)
  amount: <correct_price>
  user_id: <your_user_id>
  payment_id: <payment_id>
  ```

#### Test 4.2: Check Console Logs (Server)
In your terminal where `npm run dev` is running:
- [ ] Look for `[payments][verify] persistedPayment final`
- [ ] **Should show:**
  ```
  {
    id: xxx,
    service_id: 10,
    type: 'design_filing',
    payment_status: 'paid',
    ...
  }
  ```
- [ ] Look for `Orders created (multi)`
- [ ] **Should show count matching cart items**

---

### **Phase 5: Multi-Service Order Test**

#### Test 5.1: Add Multiple Design Services
- [ ] Add Design Filing (Individual) - ₹11,000
- [ ] Add Response to FER - ₹5,000
- [ ] Add Hearing - ₹5,000
- [ ] Add Cancellation (Large Entity) - ₹21,000
- [ ] **Total cart value: ₹42,000**

#### Test 5.2: Checkout Multi-Service
- [ ] Click Checkout
- [ ] Complete payment
- [ ] Check `orders` table in Supabase
- [ ] **Verify 4 separate order rows created:**
  ```sql
  Row 1: service_id=10, type=design_filing, amount=11000
  Row 2: service_id=13, type=design_fer_response, amount=5000
  Row 3: service_id=14, type=design_hearing, amount=5000
  Row 4: service_id=15, type=design_cancellation, amount=21000
  ```

#### Test 5.3: Payment Total
- [ ] Check `payments` table
- [ ] **Verify single payment row:**
  ```sql
  total_amount: 42000
  payment_status: paid
  ```

---

### **Phase 6: Applicant Type Variations**

#### Test 6.1: Individual Design Filing
- [ ] Add Design Filing → Select "Individual"
- [ ] Price: ₹11,000 (₹10k prof + ₹1k govt)
- [ ] Complete payment
- [ ] **Verify order:** `service_id=10, type=design_filing, amount=11000`

#### Test 6.2: Startup/MSME Design Filing
- [ ] Add Design Filing → Select "Startup or MSME"
- [ ] Price: ₹12,000 (₹10k prof + ₹2k govt)
- [ ] Complete payment
- [ ] **Verify order:** `service_id=10, type=design_filing, amount=12000`

#### Test 6.3: Large Entity Design Filing
- [ ] Add Design Filing → Select "Large Entity"
- [ ] Price: ₹14,000 (₹10k prof + ₹4k govt)
- [ ] Complete payment
- [ ] **Verify order:** `service_id=10, type=design_filing, amount=14000`

#### Test 6.4: Individual Cancellation
- [ ] Add Cancellation → Select "Individual"
- [ ] Price: ₹16,500 (₹15k prof + ₹1.5k govt)
- [ ] Complete payment
- [ ] **Verify order:** `service_id=15, type=design_cancellation, amount=16500`

#### Test 6.5: Startup/MSME Cancellation
- [ ] Add Cancellation → Select "Startup or MSME"
- [ ] Price: ₹18,000 (₹15k prof + ₹3k govt)
- [ ] Complete payment
- [ ] **Verify order:** `service_id=15, type=design_cancellation, amount=18000`

#### Test 6.6: Large Entity Cancellation
- [ ] Add Cancellation → Select "Large Entity"
- [ ] Price: ₹21,000 (₹15k prof + ₹6k govt)
- [ ] Complete payment
- [ ] **Verify order:** `service_id=15, type=design_cancellation, amount=21000`

---

### **Phase 7: Database Query Validation**

#### Query 7.1: Check All Design Payments
```sql
SELECT 
  p.id,
  p.razorpay_payment_id,
  p.service_id,
  s.name as service_name,
  p.type,
  p.total_amount,
  p.payment_status,
  p.payment_date
FROM public.payments p
LEFT JOIN public.services s ON p.service_id = s.id
WHERE p.service_id IN (10, 13, 14, 15)
ORDER BY p.created_at DESC
LIMIT 20;
```

**Expected:** All design service payments with correct service_ids and types

#### Query 7.2: Check All Design Orders
```sql
SELECT 
  o.id,
  o.service_id,
  s.name as service_name,
  o.type,
  o.amount,
  o.category_id,
  c.name as category_name,
  o.payment_id,
  o.created_at
FROM public.orders o
LEFT JOIN public.services s ON o.service_id = s.id
LEFT JOIN public.categories c ON o.category_id = c.id
WHERE o.service_id IN (10, 13, 14, 15)
ORDER BY o.created_at DESC
LIMIT 20;
```

**Expected:** All design orders with correct service_ids, types, amounts, and category_id=4

#### Query 7.3: Check Order-Payment Relationship
```sql
SELECT 
  p.id as payment_id,
  p.razorpay_payment_id,
  p.total_amount as payment_total,
  p.type as payment_type,
  COUNT(o.id) as order_count,
  SUM(o.amount) as orders_total_amount,
  ARRAY_AGG(o.service_id) as service_ids,
  ARRAY_AGG(o.type) as order_types
FROM public.payments p
LEFT JOIN public.orders o ON o.payment_id = p.id
WHERE p.service_id IN (10, 13, 14, 15)
GROUP BY p.id, p.razorpay_payment_id, p.total_amount, p.type
ORDER BY p.created_at DESC
LIMIT 10;
```

**Expected:** Payment totals match sum of order amounts

---

### **Phase 8: Error Handling**

#### Test 8.1: Missing Type Constraint Fallback
- [ ] Check server logs during payment
- [ ] Look for: `retry insert without type due to constraint`
- [ ] **Should NOT appear** (means types are valid)

#### Test 8.2: Invalid Service ID
- [ ] Try to manually create order with service_id=999
- [ ] **Should fail gracefully**

#### Test 8.3: Payment Signature Mismatch
- [ ] In DevTools, modify `razorpay_signature` before verify
- [ ] **Should see error:** "Invalid signature"

---

## 🐛 Common Issues & Solutions

### Issue 1: `service_id` is `null` in orders
**Cause:** Cart item doesn't have `service_id`  
**Solution:** Check cart item structure in localStorage, should have `service_id: 10/13/14/15`

### Issue 2: `type` constraint error (23514)
**Cause:** `type` value not in allowed list  
**Solution:** Check `service-pricing-to-form.json` has design mappings  
**Verify:** `orders_type_check` constraint includes design types

### Issue 3: Orders not created
**Cause:** Multi-cart insert failed  
**Solution:** Check server logs for `order insert (multi) error`  
**Debug:** Verify cart array is passed to verify-payment API

### Issue 4: Wrong amount in order
**Cause:** Cart item price doesn't match applicant type  
**Solution:** Check modal price calculation logic, verify govt fee varies by applicant type

---

## 📊 Success Criteria Summary

✅ **All tests pass when:**

1. **Cart Items Include:**
   - service_id (10/13/14/15)
   - type (design_filing/design_fer_response/design_hearing/design_cancellation)
   - Correct prices
   - application_type (for Filing & Cancellation)

2. **Payment Row Contains:**
   - service_id from cart
   - type mapped correctly
   - total_amount matches cart total
   - payment_status: created → paid

3. **Order Rows Created:**
   - One order per cart item
   - Each has correct service_id, type, amount
   - All linked to same payment_id
   - category_id = 4 (Design)

4. **Database Integrity:**
   - No constraint violations
   - No null service_ids
   - Payment total = sum of order amounts

5. **No Console Errors:**
   - No "constraint retry" messages
   - No "order insert error" messages
   - "Orders created (multi)" shows correct count

---

## 🚀 Quick Test Command

Run this in browser console after adding items to cart:
```javascript
// Check cart structure
const cart = JSON.parse(localStorage.getItem('cart_items_v1'))
console.table(cart.map(item => ({
  name: item.name,
  service_id: item.service_id,
  type: item.type,
  price: item.price,
  application_type: item.application_type
})))

// Verify all design services have service_id
const designItems = cart.filter(i => i.category === 'Design')
const missingServiceId = designItems.filter(i => !i.service_id)
console.log('Missing service_id:', missingServiceId.length === 0 ? '✅ None' : '❌ ' + missingServiceId.length)

// Verify all design services have type
const missingType = designItems.filter(i => !i.type)
console.log('Missing type:', missingType.length === 0 ? '✅ None' : '❌ ' + missingType.length)
```

---

## 📝 Test Results Template

**Tester:** _______________  
**Date:** _______________  
**Build:** design-services branch

### Results:
- [ ] Phase 1: Cart Verification - **PASS/FAIL**
- [ ] Phase 2: Order Creation API - **PASS/FAIL**
- [ ] Phase 3: Payment Verification - **PASS/FAIL**
- [ ] Phase 4: Order Creation - **PASS/FAIL**
- [ ] Phase 5: Multi-Service - **PASS/FAIL**
- [ ] Phase 6: Applicant Types - **PASS/FAIL**
- [ ] Phase 7: Database Queries - **PASS/FAIL**
- [ ] Phase 8: Error Handling - **PASS/FAIL**

### Issues Found:
```
[List any issues here]
```

### Notes:
```
[Additional observations]
```

---

**Testing URL:** http://localhost:3001  
**Razorpay Test Mode:** Enabled  
**Test Card:** 4111 1111 1111 1111
