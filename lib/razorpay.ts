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
    modal: { 
      ondismiss: () => { debugLog('[Razorpay] dismissed'); onDismiss?.() },
      confirm_close: true, // Confirm before closing
      escape: false, // Prevent accidental escape key dismissal
      backdropclose: false, // Prevent closing on backdrop click
      handleback: false, // Disable back button handling during payment
      animation: false, // Disable animations for better stability during resize/fullscreen
    },
    handler: async (resp: any) => {
      try { await onSuccess(resp) } catch (e) { console.error('[Razorpay] success handler error', e) }
    },
    prefill,
    notes,
    theme: { color: themeColor },
    config: {
      display: {
        hide: [
          { method: 'paylater' },
        ],
        preferences: {
          show_default_blocks: true,
        }
      }
    },
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
  
  // Prevent fullscreen/resize issues during payment
  let isPaymentInProgress = true
  let warningShown = false
  
  const preventFullscreenDuringPayment = (e: Event) => {
    if (isPaymentInProgress) {
      debugLog('[Razorpay] Fullscreen change detected, attempting to exit')
      
      // Immediately exit fullscreen if it was entered during payment
      if (document.fullscreenElement || (document as any).webkitFullscreenElement || 
          (document as any).mozFullScreenElement || (document as any).msFullscreenElement) {
        
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.warn('Exit fullscreen failed:', err))
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen()
        }
        
        // Show warning only once
        if (!warningShown && typeof document !== 'undefined') {
          warningShown = true
          const warning = document.createElement('div')
          warning.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#f44336;color:white;padding:16px 24px;border-radius:8px;z-index:999999;font-family:system-ui,-apple-system,sans-serif;font-size:15px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.4);'
          warning.innerHTML = '⚠️ Fullscreen disabled during payment<br><span style="font-size:13px;font-weight:400;opacity:0.95;">Please complete your payment first</span>'
          document.body.appendChild(warning)
          
          setTimeout(() => {
            if (warning.parentNode) {
              warning.style.opacity = '0'
              warning.style.transition = 'opacity 0.4s'
              setTimeout(() => warning.remove(), 400)
            }
          }, 5000)
        }
      }
    }
  }
  
  const resizeHandler = () => {
    if (isPaymentInProgress) {
      // Razorpay modal should handle this, but log for debugging
      debugLog('[Razorpay] Window resized during payment')
    }
  }
  
  // Prevent F11 fullscreen key during payment
  const preventFullscreenKey = (e: KeyboardEvent) => {
    if (isPaymentInProgress && e.key === 'F11') {
      e.preventDefault()
      e.stopPropagation()
      if (!warningShown && typeof document !== 'undefined') {
        warningShown = true
        const warning = document.createElement('div')
        warning.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#f44336;color:white;padding:16px 24px;border-radius:8px;z-index:999999;font-family:system-ui,-apple-system,sans-serif;font-size:15px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.4);'
        warning.innerHTML = '⚠️ Fullscreen blocked during payment<br><span style="font-size:13px;font-weight:400;opacity:0.95;">Please complete your payment first</span>'
        document.body.appendChild(warning)
        
        setTimeout(() => {
          if (warning.parentNode) {
            warning.style.opacity = '0'
            warning.style.transition = 'opacity 0.4s'
            setTimeout(() => warning.remove(), 400)
          }
          warningShown = false
        }, 3000)
      }
      return false
    }
  }
  
  // Add event listeners
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', preventFullscreenDuringPayment)
    document.addEventListener('webkitfullscreenchange', preventFullscreenDuringPayment)
    document.addEventListener('mozfullscreenchange', preventFullscreenDuringPayment)
    document.addEventListener('MSFullscreenChange', preventFullscreenDuringPayment)
    document.addEventListener('keydown', preventFullscreenKey, { capture: true })
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', resizeHandler, { passive: true })
  }
  
  // Cleanup function
  let cleanup = () => {
    isPaymentInProgress = false
    if (typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', preventFullscreenDuringPayment)
      document.removeEventListener('webkitfullscreenchange', preventFullscreenDuringPayment)
      document.removeEventListener('mozfullscreenchange', preventFullscreenDuringPayment)
      document.removeEventListener('MSFullscreenChange', preventFullscreenDuringPayment)
      document.removeEventListener('keydown', preventFullscreenKey, { capture: true } as any)
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', resizeHandler)
    }
  }
  
  // Wrap success handler with cleanup
  const originalHandler = options.handler
  options.handler = async (resp: any) => {
    cleanup()
    await originalHandler(resp)
  }
  
  // Wrap dismiss with cleanup
  const originalDismiss = options.modal.ondismiss
  options.modal.ondismiss = () => {
    cleanup()
    originalDismiss()
  }
  
  // Inject CSS to prevent Razorpay iframe fullscreen issues
  if (typeof document !== 'undefined') {
    const styleId = 'razorpay-fullscreen-fix'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .razorpay-container iframe,
        [class*="razorpay"] iframe {
          max-width: 100vw !important;
          max-height: 100vh !important;
        }
        body.razorpay-payment-active {
          overflow: hidden !important;
        }
      `
      document.head.appendChild(style)
    }
    document.body.classList.add('razorpay-payment-active')
    
    // Remove class on cleanup
    const originalCleanup = cleanup
    cleanup = () => {
      document.body.classList.remove('razorpay-payment-active')
      originalCleanup()
    }
  }
  
  // Allow caller to coordinate focus guard start/stop relative to popup open
  if (enableFocusGuard) enableFocusGuard(() => {}, () => {})
  
  try {
    rzp.open()
  } catch (e) {
    cleanup()
    throw e
  }
  
  return rzp
}
