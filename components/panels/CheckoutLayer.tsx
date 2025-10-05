import React from 'react'
import dynamic from 'next/dynamic'
import { PaymentProcessingModal } from '@/components/PaymentProcessingModal'
import CheckoutModal from '@/components/checkout-modal'

// Lightweight banner + optional focus guard overlay consolidated here to reduce noise in page.tsx
// We intentionally keep logic stateless; parent owns all state & callbacks.

export interface CheckoutLayerProps {
  isProcessing: boolean
  paymentInterrupted: boolean
  focusGuardActive: boolean
  showThankYou: boolean
  checkoutPayment: any
  checkoutOrders: any[]
  onCloseThankYou: () => void
  onProceedSingle: (order: any) => void
  onProceedMultiple: (orders?: any[]) => void
  onSignInAgain?: () => void
  interruptionMessage?: React.ReactNode
}

// Simple focus guard overlay (visual only)
// Focus guard overlay removed per request (previous messaging considered noisy).
const FocusGuardOverlay: React.FC<{ active: boolean }> = () => null

const PaymentInterruptionBanner: React.FC<{ interrupted: boolean; onSignInAgain?: () => void; children?: React.ReactNode }> = ({ interrupted, onSignInAgain, children }) => {
  if (!interrupted) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-md shadow-xl max-w-md w-full p-6 space-y-4 text-center">
        <h2 className="text-lg font-semibold text-red-600">Payment Interrupted</h2>
        <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2">
          {children || (
            <>
              <p>Your payment flow was interrupted (tab lost focus or window action).</p>
              <p>You can sign in again and retry. If the amount was debited, it will be reconciled automatically.</p>
            </>
          )}
        </div>
        {onSignInAgain && (
          <button
            onClick={onSignInAgain}
            className="mt-2 inline-flex items-center justify-center rounded bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium"
          >Sign In Again</button>
        )}
      </div>
    </div>
  )
}

const CheckoutLayerComponent: React.FC<CheckoutLayerProps> = React.memo(({
  isProcessing,
  paymentInterrupted,
  focusGuardActive,
  showThankYou,
  checkoutPayment,
  checkoutOrders,
  onCloseThankYou,
  onProceedSingle,
  onProceedMultiple,
  onSignInAgain,
  interruptionMessage,
}) => {
  const showAny = isProcessing || paymentInterrupted || showThankYou || focusGuardActive
  if (!showAny) return null
  return (
    <>
      <FocusGuardOverlay active={focusGuardActive} />
      <PaymentProcessingModal isVisible={isProcessing} />
      <PaymentInterruptionBanner interrupted={paymentInterrupted} onSignInAgain={onSignInAgain}>
        {interruptionMessage}
      </PaymentInterruptionBanner>
      <CheckoutModal
        isOpen={showThankYou}
        onClose={onCloseThankYou}
        payment={checkoutPayment}
        orders={checkoutOrders}
        onProceedSingle={onProceedSingle}
        onProceedMultiple={onProceedMultiple}
      />
    </>
  )
})
CheckoutLayerComponent.displayName = 'CheckoutLayer'

// Dynamic wrapper (optional future SSR skip / code splitting)
const CheckoutLayer = CheckoutLayerComponent
export default CheckoutLayer
