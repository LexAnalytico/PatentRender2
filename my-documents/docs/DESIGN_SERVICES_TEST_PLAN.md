# Design Services - Complete Flow Testing Plan

**Date:** November 21, 2025  
**Branch:** design-services  
**Server:** Running on http://localhost:3001

---

## ✅ Test Checklist

### **Phase 1: UI Display & Navigation**

- [ ] **1.1** Navigate to home page
- [ ] **1.2** Scroll to Design Services section
- [ ] **1.3** Verify all 4 services are displayed:
  - Design Filing
  - Response to FER
  - Hearing
  - Cancellation
- [ ] **1.4** Verify service cards show:
  - Icon (Palette, FileText, Users, XCircle)
  - Title
  - Description (shortened text)
  - Price (₹11,000, ₹5,000, ₹5,000, ₹16,500)
  - "Select" button

---

### **Phase 2: Design Filing Modal (with Applicant Type)**

#### Test 2.1: Open Modal
- [ ] Click "Select" on Design Filing card
- [ ] Modal opens with title "Options for: Design Filing"
- [ ] Modal shows "Select Applicant Type" dropdown

#### Test 2.2: Individual Selection
- [ ] Select "Individual — ₹11,000" from dropdown
- [ ] Verify price breakdown:
  - Professional Fee: ₹10,000
  - Government Fee: ₹1,000
  - **Total: ₹11,000**

#### Test 2.3: Startup/MSME Selection
- [ ] Select "Startup or MSME — ₹12,000" from dropdown
- [ ] Verify price breakdown:
  - Professional Fee: ₹10,000
  - Government Fee: ₹2,000
  - **Total: ₹12,000**

#### Test 2.4: Large Entity Selection
- [ ] Select "Large Entity — ₹14,000" from dropdown
- [ ] Verify price breakdown:
  - Professional Fee: ₹10,000
  - Government Fee: ₹4,000
  - **Total: ₹14,000**

#### Test 2.5: Add to Cart
- [ ] Select any applicant type
- [ ] Click "Add to Cart" button
- [ ] Modal closes
- [ ] Cart icon updates with item count
- [ ] Cart sidebar shows:
  - Service name: "Design Filing"
  - Details: Selected applicant type
  - Price: Correct total

---

### **Phase 3: Response to FER (Direct Add)**

#### Test 3.1: Direct Cart Addition
- [ ] Click "Select" on Response to FER card
- [ ] **No modal appears** (direct add)
- [ ] Cart icon increments immediately
- [ ] Cart sidebar shows:
  - Service name: "Response to FER"
  - Details: "Single Service"
  - Price: ₹5,000

---

### **Phase 4: Hearing (Direct Add)**

#### Test 4.1: Direct Cart Addition
- [ ] Click "Select" on Hearing card
- [ ] **No modal appears** (direct add)
- [ ] Cart icon increments immediately
- [ ] Cart sidebar shows:
  - Service name: "Hearing"
  - Details: "Single Service"
  - Price: ₹5,000

---

### **Phase 5: Cancellation Modal (with Applicant Type)**

#### Test 5.1: Open Modal
- [ ] Click "Select" on Cancellation card
- [ ] Modal opens with title "Options for: Cancellation"
- [ ] Modal shows "Select Applicant Type" dropdown

#### Test 5.2: Individual Selection
- [ ] Select "Individual — ₹16,500" from dropdown
- [ ] Verify price breakdown:
  - Professional Fee: ₹15,000
  - Government Fee: ₹1,500
  - **Total: ₹16,500**

#### Test 5.3: Startup/MSME Selection
- [ ] Select "Startup or MSME — ₹18,000" from dropdown
- [ ] Verify price breakdown:
  - Professional Fee: ₹15,000
  - Government Fee: ₹3,000
  - **Total: ₹18,000**

#### Test 5.4: Large Entity Selection
- [ ] Select "Large Entity — ₹21,000" from dropdown
- [ ] Verify price breakdown:
  - Professional Fee: ₹15,000
  - Government Fee: ₹6,000
  - **Total: ₹21,000**

#### Test 5.5: Add to Cart
- [ ] Select any applicant type
- [ ] Click "Add to Cart" button
- [ ] Modal closes
- [ ] Cart icon updates
- [ ] Cart sidebar shows correct details

---

### **Phase 6: Cart Functionality**

#### Test 6.1: Multiple Items
- [ ] Add all 4 services to cart
- [ ] Verify cart shows 4 items
- [ ] Verify total price is sum of all services

#### Test 6.2: Remove Items
- [ ] Click remove (X) on any cart item
- [ ] Item is removed
- [ ] Total price updates
- [ ] Cart count decrements

#### Test 6.3: Cart Persistence
- [ ] Add items to cart
- [ ] Refresh the page
- [ ] Verify cart items persist (localStorage)

---

### **Phase 7: Checkout Flow (Authenticated)**

#### Test 7.1: User Authentication
- [ ] Click "Checkout" with items in cart
- [ ] If not logged in, auth modal appears
- [ ] Login/Register successfully
- [ ] Return to cart

#### Test 7.2: Payment Processing
- [ ] Click "Checkout"
- [ ] Razorpay payment modal opens
- [ ] Payment details are correct:
  - Item names
  - Individual prices
  - Total amount
- [ ] Complete test payment (or cancel)

#### Test 7.3: Order Creation
- [ ] After successful payment
- [ ] Navigate to Orders/Dashboard
- [ ] Verify orders are created for each service
- [ ] Verify order details:
  - Service name
  - Amount
  - Status
  - Payment method

---

### **Phase 8: Database Verification**

#### Test 8.1: Services Table
```sql
SELECT id, name, base_price, category_id 
FROM public.services 
WHERE id IN (10, 13, 14, 15);
```
**Expected Results:**
- 10: Design Filing, ₹11,000
- 13: Response to FER, ₹5,000
- 14: Hearing, ₹5,000
- 15: Cancellation, ₹16,500

#### Test 8.2: Pricing Rules
```sql
SELECT service_id, application_type, key, amount 
FROM public.service_pricing_rules 
WHERE service_id IN (10, 13, 14, 15)
ORDER BY service_id, application_type, key;
```
**Expected:** All pricing rules as per migration

#### Test 8.3: Orders Created
```sql
SELECT id, service_id, amount, type 
FROM public.orders 
WHERE service_id IN (10, 13, 14, 15)
ORDER BY created_at DESC 
LIMIT 10;
```
**Expected:** Orders created with correct service_ids and amounts

---

### **Phase 9: Edge Cases & Error Handling**

#### Test 9.1: Modal Cancel
- [ ] Open Design Filing modal
- [ ] Click outside modal or X button
- [ ] Modal closes without adding to cart

#### Test 9.2: Duplicate Items
- [ ] Add same service twice
- [ ] Verify cart shows 2 separate items
- [ ] Verify correct total

#### Test 9.3: Empty Cart Checkout
- [ ] Empty cart completely
- [ ] Try to checkout
- [ ] Verify appropriate message/behavior

#### Test 9.4: Network Issues
- [ ] Disconnect internet
- [ ] Try to checkout
- [ ] Verify error handling
- [ ] Reconnect and retry

---

### **Phase 10: Mobile Responsiveness**

#### Test 10.1: Mobile View
- [ ] Open on mobile device or resize browser
- [ ] Service cards stack vertically
- [ ] Modals are responsive
- [ ] Buttons are easily tappable
- [ ] Cart sidebar works on mobile

---

## 🐛 Known Issues to Watch For

1. **Service ID Mismatch**: Ensure service_id in cart matches database
2. **Price Calculation**: Verify professional + govt fee = total
3. **Modal State**: Check modals don't interfere with each other
4. **localStorage**: Verify cart persists across page refreshes
5. **Type Constraints**: Ensure order types are accepted by database

---

## 📊 Test Results Summary

### Quick Stats Template:
```
✅ Tests Passed: ___/50
❌ Tests Failed: ___/50
⚠️  Warnings: ___
🐛 Bugs Found: ___

Critical Issues: []
Minor Issues: []
Suggestions: []
```

---

## 🔄 Regression Testing

After any fixes, re-run:
- [ ] Phase 2 (Design Filing)
- [ ] Phase 3 (Response to FER)
- [ ] Phase 4 (Hearing)
- [ ] Phase 5 (Cancellation)
- [ ] Phase 6 (Cart)
- [ ] Phase 7 (Checkout)

---

## 📝 Notes

Use this section to document any issues, observations, or suggestions during testing:

```
[Add your notes here]
```

---

## ✨ Success Criteria

**All tests pass when:**
1. All 4 services display correctly
2. Modals work for Design Filing & Cancellation
3. Direct add works for Response to FER & Hearing
4. Prices match Excel specifications
5. Cart functionality is flawless
6. Orders are created correctly in database
7. No console errors
8. Mobile responsive
9. Payment flow completes
10. Database integrity maintained

---

**Testing URL:** http://localhost:3001  
**Test Date:** _______________  
**Tester:** _______________  
**Build/Commit:** design-services branch
