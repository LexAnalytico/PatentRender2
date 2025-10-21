RLS Policies (Supabase)

Scope
- Protect user-scoped tables: form_responses, form_attachments (and reads of payments/orders where relevant).

Guiding Principles
- Row ownership by user_id (auth.uid())
- Allow read/write only for the owning user
- Preserve soft-deletion behavior for attachments

Tables

form_responses
- Access pattern: user reads own rows; upsert by (user_id, order_id, form_type)
- Suggested policies:
  • SELECT: using (user_id = auth.uid())
  • INSERT: with check (user_id = auth.uid())
  • UPDATE: using (user_id = auth.uid()) with check (user_id = auth.uid())
  • DELETE: optional; generally not used (keep history)

form_attachments
- Access pattern: user lists/reads own non-deleted rows; inserts metadata after upload; soft delete via deleted=true
- Suggested policies:
  • SELECT: using (user_id = auth.uid() AND deleted = false)
  • INSERT: with check (user_id = auth.uid())
  • UPDATE: using (user_id = auth.uid()) with check (user_id = auth.uid())
  • DELETE: optional fallback hard delete; tighten as needed

payments (optional user-scoped reads)
- If exposing payments to users: allow SELECT where exists (orders.user_id = auth.uid() and orders.payment_id = payments.id)

orders (optional user-scoped reads)
- Allow SELECT where user_id = auth.uid()

Supabase Storage (attachments bucket)
- Use policies to restrict to user-owned paths (e.g., /user/<uid>/orders/<order_id>/...)
- Example rule: object path must start with concat('user/', auth.uid(), '/'), or validate against a metadata table before signed URL issuance

Operational Notes
- Ensure UPDATE/DELETE on form_attachments are permitted; UI handles soft delete first, then fallback hard delete if RLS blocks
- Timeouts: UI shows friendly messages and allows retry when RLS/network delays occur
- Auditing: retain deleted=true rows; consider separate logs table for policy debugging

Examples (SQL-ish)
-- form_responses
create policy fr_select on form_responses
  for select using (user_id = auth.uid());
create policy fr_insert on form_responses
  for insert with check (user_id = auth.uid());
create policy fr_update on form_responses
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- form_attachments
create policy fa_select on form_attachments
  for select using (user_id = auth.uid() and deleted = false);
create policy fa_insert on form_attachments
  for insert with check (user_id = auth.uid());
create policy fa_update on form_attachments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
