"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Scale, ShoppingCart } from 'lucide-react'
import { useAuthProfile } from '@/app/useAuthProfile'
import { useRouter } from 'next/navigation'

export type CartItem = { id: string; name: string; price: number; category: string; details?: string }

export default function DashboardSidebar({ active = 'orders' as 'orders' | 'profile' }) {
  const { isAuthenticated, handleLogout } = useAuthProfile()
  const router = useRouter()
  const [cartItems, setCartItems] = React.useState<CartItem[]>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('cart_items_v1')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setCartItems(parsed)
      }
    } catch {}
    setLoaded(true)
  }, [])

  React.useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem('cart_items_v1', JSON.stringify(cartItems)) } catch {}
  }, [cartItems, loaded])

  const formatINR = (v: number | null | undefined) => {
    try { return v != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v)) : '—' } catch { return '—' }
  }

  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(i => i.id !== id))
  const clearCart = () => setCartItems([])
  const cartTotal = cartItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0)

  return (
    <aside className="hidden md:block w-64 shrink-0">
      <div className="bg-white border rounded-lg p-4 sticky top-24">
        <div className="space-y-2">
          <div className="text-sm font-semibold tracking-wide uppercase text-gray-700">Dashboard Services</div>
          <Button
            variant={active === 'orders' ? undefined : 'outline'}
            className={`w-full justify-start border border-black rounded-full ${active === 'orders' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
            onClick={() => router.push('/orders')}
          >
            Orders
          </Button>
          <Button
            variant={active === 'profile' ? undefined : 'outline'}
            className={`w-full justify-start border border-black rounded-full ${active === 'profile' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
            onClick={() => router.push('/profile')}
          >
            Profile
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 border border-black rounded-full transition-colors"
            disabled={!isAuthenticated}
            onClick={() => { try { handleLogout() } catch {} }}
          >
            Logout
          </Button>
        </div>
        {/* Sidebar Cart */}
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Scale className="h-4 w-4 text-blue-600 mr-2" />
            Your Cart
          </h4>
          <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs text-gray-500">No items yet</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-md border flex items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 leading-snug break-words">{item.name}</p>
                    <p className="text-[11px] text-gray-500 mb-1">{item.category}</p>
                    {item.details && <p className="text-[11px] text-gray-600 line-clamp-2 mb-1">{item.details}</p>}
                    <span className="text-xs font-semibold text-blue-600">{formatINR(item.price)}</span>
                  </div>
                  <Button onClick={() => removeFromCart(item.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 h-6 w-6 p-0" title="Remove">×</Button>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Estimate</span>
              <span className="font-semibold text-blue-600">{formatINR(cartTotal)}</span>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs" onClick={() => router.push('/')}>Checkout</Button>
            <Button variant="outline" className="w-full h-8 text-xs" onClick={() => clearCart()} disabled={cartItems.length === 0}>Clear</Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
