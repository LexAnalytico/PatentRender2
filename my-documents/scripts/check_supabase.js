const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.SUPABASE_API_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!url || !key) {
  console.error('Missing env vars. NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL, 'SUPABASE_SERVICE_ROLE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}
const sup = createClient(url, key);
(async () => {
  try {
    const { data: orders, error: ordersErr } = await sup.from('orders').select('id,user_id,service_id,category_id,payment_id,created_at').order('created_at', { ascending: false }).limit(20);
    if (ordersErr) console.error('ordersErr:', ordersErr);
    console.log('ORDERS:', JSON.stringify(orders, null, 2));

    const { data: payments, error: paymentsErr } = await sup.from('payments').select('id,user_id,total_amount,payment_status,razorpay_payment_id,service_id,created_at').order('created_at', { ascending: false }).limit(20);
    if (paymentsErr) console.error('paymentsErr:', paymentsErr);
    console.log('PAYMENTS:', JSON.stringify(payments, null, 2));
  } catch (e) {
    console.error('Exception:', e);
  } finally {
    process.exit(0);
  }
})();
