// Centralized Razorpay client-side helpers.
// Provides JIT script loading and a wrapper to open the checkout with strongly typed callbacks.

import { debugLog } from '@/lib/logger'

export interface RazorpayOpenParams {
  key: string | undefined
  amount: number
  currency: string
  name: string
  description: string
  orderId: string
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, any>
  themeColor?: string
  onDismiss?: () => void
  onSuccess: (resp: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void | Promise<void>
  onFailure?: (resp: any) => void
  enableFocusGuard?: (start: () => void, stop: (reason: string) => void) => void
}

let loadingPromise: Promise<boolean> | null = null

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as any).Razorpay) return Promise.resolve(true)
  if (loadingPromise) return loadingPromise

  const ensurePreconnect = (href: string) => {
    if (document.querySelector(`link[rel=preconnect][href='${href}']`)) return
    const l = document.createElement('link')
    l.rel = 'preconnect'
    l.href = href
    l.crossOrigin = 'anonymous'
    document.head.appendChild(l)
  }
  ensurePreconnect('https://checkout.razorpay.com')
  ensurePreconnect('https://rzp.io')

  loadingPromise = new Promise(resolve => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(!!(window as any).Razorpay)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
  return loadingPromise
}

export async function openRazorpayCheckout(params: RazorpayOpenParams) {
  const ok = await loadRazorpayScript()
  if (!ok) throw new Error('RAZORPAY_LOAD_FAILED')
  const {
    key,
    amount,
    currency,
    name,
    description,
    orderId,
    prefill,
    notes,
    themeColor = '#1e40af',
    onDismiss,
    onSuccess,
    onFailure,
    enableFocusGuard,
  } = params

  const options: any = {
    key,
    amount,
    currency,
    name,
    description,
    order_id: orderId,
    modal: { ondismiss: () => { debugLog('[Razorpay] dismissed'); onDismiss?.() } },
    handler: async (resp: any) => {
      try { await onSuccess(resp) } catch (e) { console.error('[Razorpay] success handler error', e) }
    },
    prefill,
    notes,
    theme: { color: themeColor },
  }
  const rzp = new (window as any).Razorpay(options)
  if (onFailure) {
    try {
      rzp.on('payment.failed', (r: any) => {
        console.warn('[Razorpay] payment.failed', r)
        onFailure(r)
      })
    } catch (e) {
      console.warn('[Razorpay] attach failure listener error', e)
    }
  }
  // Allow caller to coordinate focus guard start/stop relative to popup open
  if (enableFocusGuard) enableFocusGuard(() => {}, () => {})
  rzp.open()
  return rzp
}
