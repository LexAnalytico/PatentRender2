"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, FileText, Loader2 } from 'lucide-react'
import { AppTour } from '@/components/AppTour'

export interface ServiceCartItem {
  id: string
  name: string
  price: number
  category: string
  details?: string
}

interface ServicesPanelProps {
  cartItems: ServiceCartItem[]
  onRemove: (id: string) => void
  onMakePayment: () => void
  onBrowseServices: () => void
  formatAmount: (n: number) => string
  isProcessing?: boolean
}

function ServicesPanelComponent({
  cartItems,
  onRemove,
  onMakePayment,
  onBrowseServices,
  formatAmount,
  isProcessing = false,
}: ServicesPanelProps) {
  // Tour guide state
  const [showTour, setShowTour] = useState(false)
  
  const handleTourComplete = () => {
    setShowTour(false)
  }
  
  const startTour = () => {
    setShowTour(true)
  }
  
  // Accessibility: move keyboard focus into the main content when this screen mounts
  const headingRef = React.useRef<HTMLHeadingElement | null>(null)
  const makePaymentRef = React.useRef<HTMLButtonElement | null>(null)

  // Focus strategy:
  // - If there are items in the cart, focus the primary action (Make Payment)
  // - Otherwise, focus the main heading so screen reader and keyboard users land in context
  React.useEffect(() => {
    const focusPrimary = () => {
      const hasItems = cartItems.length > 0
      const target = hasItems ? makePaymentRef.current : headingRef.current
      // Avoid stealing focus if the user is already interacting with something
      const active = (typeof document !== 'undefined') ? (document.activeElement as HTMLElement | null) : null
      const shouldMove = !active || active === document.body
      if (target && shouldMove && typeof (target as any).focus === 'function') {
        // Small delay to ensure the element is in the DOM and painted
        setTimeout(() => { try { (target as any).focus({ preventScroll: true }) } catch {} }, 60)
      }
    }
    focusPrimary()
    // Re-run when cart empties or becomes non-empty (e.g., after remove/add)
  }, [cartItems.length])

  // When returning to the tab (visibilitychange) or window regains focus, re-assert focus if nothing is focused
  React.useEffect(() => {
    const reassert = () => {
      try {
        if (typeof document !== 'undefined' && document.hidden) return
        const active = document.activeElement as HTMLElement | null
        if (!active || active === document.body) {
          const hasItems = cartItems.length > 0
          const target = hasItems ? makePaymentRef.current : headingRef.current
          if (target && typeof (target as any).focus === 'function') {
            setTimeout(() => { try { (target as any).focus({ preventScroll: true }) } catch {} }, 40)
          }
        }
      } catch {}
    }
    document.addEventListener('visibilitychange', reassert)
    window.addEventListener('focus', reassert)
    return () => {
      document.removeEventListener('visibilitychange', reassert)
      window.removeEventListener('focus', reassert)
    }
  }, [cartItems.length])

  return (
    <>
      <AppTour 
        run={showTour} 
        onComplete={handleTourComplete}
        tourType="services"
      />
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          >
            Your Selected Services
          </h1>
          <button
            onClick={startTour}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors shadow-sm"
            title="Start services screen tour"
          >
            <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
              <span className="text-orange-500 text-lg">👉</span>
            </span>
            Tour Guide
          </button>
        </div>
        <p className="text-gray-600">Review your selected IP protection services and customize your quote</p>
      </div>
      <div className="space-y-6" data-tour="cart-items">
        {cartItems.map((item) => (
          <Card key={item.id} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-3">{item.category}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Professional {item.category.toLowerCase()} service with comprehensive coverage and expert guidance.</p>
                  {item.details && (<p className="text-xs text-gray-500 mb-2">Details: {item.details}</p>)}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{formatAmount(item.price)}</span>
                    <Button onClick={() => onRemove(item.id)} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {cartItems.length === 0 && (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services selected</h3>
              <p className="text-gray-600 mb-4">Add some services to create your quote</p>
              <Button onClick={onBrowseServices} className="bg-blue-600 hover:bg-blue-700">Browse Services</Button>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="flex flex-col items-center mt-8 space-y-3">
        {isProcessing && (
          <p
            role="status"
            aria-live="polite"
            className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2 max-w-lg text-center leading-snug"
          >
            Connecting to Razorpay…
          </p>
        )}
        <Button
          ref={makePaymentRef}
          type="button"
          className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onMakePayment}
          disabled={isProcessing}
          aria-disabled={isProcessing}
          aria-busy={isProcessing}
          aria-describedby="make-payment-note"
          data-tour="make-payment-button"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Starting payment…
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Make Payment
            </>
          )}
        </Button>
        <p id="make-payment-note" className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 max-w-lg text-center leading-snug" data-tour="payment-warning">
          Clicking on <span className="font-semibold">Make Payment</span> will open the secure Razorpay window. <strong>Do not switch tabs, minimize, resize the window, enter/exit fullscreen, or leave this screen until the payment is completed</strong> or the payment may fail and you will need to retry.
        </p>
      </div>
    </>
  )
}

// Custom comparator ignores function identity so parent re-renders (due to new handler references) don't force re-render unless cart changed.
function areEqual(prev: ServicesPanelProps, next: ServicesPanelProps) {
  if (prev.cartItems.length !== next.cartItems.length) return false
  for (let i = 0; i < prev.cartItems.length; i++) {
    const a = prev.cartItems[i]
    const b = next.cartItems[i]
    if (a.id !== b.id || a.price !== b.price || a.category !== b.category || a.name !== b.name || a.details !== b.details) {
      return false
    }
  }
  // Re-render if processing state changes so the button disables/enables and label updates
  if ((prev.isProcessing ?? false) !== (next.isProcessing ?? false)) return false
  return true
}

const ServicesPanel = React.memo(ServicesPanelComponent, areEqual)
export default ServicesPanel
