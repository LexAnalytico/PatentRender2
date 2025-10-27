import { redirect } from 'next/navigation'

export default function MainPage() {
  // Consolidate to the root landing page; preserve hash-based section scroll
  redirect('/')
}
