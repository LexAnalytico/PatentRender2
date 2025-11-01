// Server redirect to ensure the full dashboard UI renders for Orders
import { redirect } from 'next/navigation'

export default function OrdersPage() {
  // Always route Orders requests through landing so the rich sidebar/table UI loads
  redirect('/?dashboard=orders')
}

