Data Model Overview

ER-style Diagram (ASCII)

  users (auth)
    id (uuid)
        |
        | 1..N
        v
  payments (id)
    - id (uuid or bigint)
    - razorpay_payment_id (text)
    - total_amount (numeric)
    - payment_status (text)
    - type (text)
    - service_id (int, nullable)
    - payment_date (timestamptz)
        |
        | 1..N (each payment can relate to one or many orders depending on flow)
        v
  orders (id)
    - id (bigint)
    - user_id (uuid)
    - service_id (int)
    - amount (numeric)
    - type (text, nullable; canonical form key)
    - payment_id (fk -> payments.id)
    - workflow_status (text)
        |
        | 1..1 per (user_id, order_id, form_type)
        v
  form_responses (composite unique)
    - user_id (uuid)
    - order_id (bigint, nullable)
    - form_type (text)
    - data (jsonb)
    - completed (bool)
        |
        | 1..N per (user, order, form type)
        v
  form_attachments (id)
    - id (uuid)
    - user_id (uuid)
    - order_id (bigint)
    - form_type (text)
    - filename (text)
    - storage_path (text)
    - mime_type (text)
    - size_bytes (int)
    - sha256 (text, nullable)
    - deleted (bool)

  service_pricing_rules (service_id)
    - service_id (int)
    - key (text)  // maps to form types

Notes
- orders.user_id is the principal ownership key; RLS uses this for scoping.
- orders.payment_id links to the primary payment that materialized the order set (single or grouped checkout).
- form_responses may or may not carry an order_id (drafts without order context); in this app, forms are usually tied to order_id when opened from Orders.
- form_attachments uses storage_path pointing to Supabase Storage; filename is user-facing and category-prefixed.

Recommended Indexes
- payments: (razorpay_payment_id), (payment_status), (payment_date)
- orders: (user_id), (payment_id), (service_id), (created_at), (type)
- form_responses: unique (user_id, order_id, form_type), and index (user_id, form_type)
- form_attachments: (user_id, order_id, form_type, deleted), and (storage_path)
- service_pricing_rules: (service_id), (key)

Field Details (by table)

payments
- id: primary key (text/uuid/bigint per schema). May also store provider order id/payment id for Paytm.
- razorpay_payment_id: provider-side payment id; when migrating, add provider_payment_id/provider fields.
- total_amount: INR amount for the whole checkout.
- payment_status: e.g., created, authorized, captured, failed, refunded.
- type: canonical form key, used to resolve form type when orders.type is null.
- service_id: for single-service checkouts; nullable for multi-service.
- payment_date: capture/confirmation timestamp.

orders
- id: primary key.
- user_id: FK -> auth.users.id.
- service_id: the purchased service; used with service_pricing_rules to map to form type.
- amount: amount attributable to the order (part of the payment total if grouped).
- type: canonical form type key (may be resolved from payment.type or pricing rules).
- payment_id: FK -> payments.id (main linkage for formed orders).
- workflow_status: internal tracking for admin.

form_responses
- user_id + order_id + form_type: unique row for the combination.
- data: JSONB of dynamic fields keyed by field title.
- completed: marks when user confirmed details; used to start in read-only confirm mode on reopen.

form_attachments
- filename: includes category prefix like [DRAWING], [SPEC], etc., for routing by field.
- storage_path: stable object path in storage; used for removal.
- deleted: soft-delete boolean; keep rows for audit.
- sha256: optional content hash for dedup/verification.

service_pricing_rules
- key maps to canonical form types (e.g., 'fer_response' → FER Response form).

Migration Considerations (Razorpay → Paytm)
- Add provider_payment_id/provider_order_id/provider fields in payments.
- Update API and UI to reference generic provider ids when present.
- Keep indexes on both legacy (razorpay_payment_id) and provider-agnostic fields.
