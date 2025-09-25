//components/checkout-modal.tsx
"use client"

import { resolveFormTypeFromOrderLike } from "./utils/resolve-form-type"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  payment?: any
  orders?: any[]
  onProceedSingle?: (order?: any) => void    // NEW
  onProceedMultiple?: (orders?: any[]) => void // NEW
}

const CheckoutModal = ({
  isOpen,
  onClose,
  payment,
  orders = [],
  onProceedSingle,
  onProceedMultiple,
}: CheckoutModalProps) => {
  const showCheckoutThankYou = isOpen
  const checkoutPayment = payment
  const checkoutOrders = orders

  const openFormForOrder = (o: any) => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      const type = resolveFormTypeFromOrderLike(o)
      const pk = o?.service_pricing_key ? String(o.service_pricing_key) : ""
      const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ""}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
      window.open(url, "_blank")
      onClose()
    } catch (e) {
      console.error("Open form error", e)
    }
  }

  const openFormsForAllOrders = (ord: any[]) => {
    if (!ord?.length) return
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""

      // 1) Pre-open windows synchronously in the click handler context
      const wins = ord.map(() => window.open("", "_blank"))

      // 2) If any window failed to open, ask the user to allow pop-ups
      if (wins.some(w => w == null)) {
        alert("Please enable pop-ups for this site to open all forms in separate tabs.")
        return
      }

      // 3) Compute target URLs
      const urls = ord.map((o) => {
        const type = resolveFormTypeFromOrderLike(o)
        const pk = o?.service_pricing_key ? String(o.service_pricing_key) : ""
        return `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ""}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
      })

      // 4) Navigate each pre-opened window to its URL
      wins.forEach((w, i) => {
        if (!w) return
        const url = urls[i]
        try {
          w.location.href = url
        } catch {
          w.location.replace(url)
        }
      })

      // Optional: close the modal after opening all tabs
      onClose()
    } catch (e) {
      console.error("Open all forms error", e)
    }
  }
  const openAllOrderFormsInTabs = (orders: any[]) => {
    if (!orders?.length) return
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      const wins = orders.map(() => window.open("", "_blank"))
      if (wins.some(w => w == null)) {
        alert("Please enable pop-ups for this site to open all forms in separate tabs.")
        return
      }

    // 2) Compute URLs for each order
    const urls = orders.map((o) => {
        const type = resolveFormTypeFromOrderLike(o)
        const pk = o?.service_pricing_key ? String(o.service_pricing_key) : ""
        return `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ""}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
      })
      wins.forEach((w, i) => {
        if (!w) return
        const url = urls[i]
        try { w.location.href = url } catch { w.location.replace(url) }
      })
      onClose()
    } catch (e) {
      console.error("Open all forms error", e)
    }
  }


    // Optional: close the Thank You modal after opening tabs
    //setShowCheckoutThankYou(false)
    
const openSingleOrderForm = (o: any) => {
  try {
    const base = typeof window !== "undefined" ? window.location.origin : ""
    const type = resolveFormTypeFromOrderLike(o)
    const pk = o?.service_pricing_key ? String(o.service_pricing_key) : ""
    const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ""}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
    window.open(url, "_blank")
    // Optional: close
    // setShowCheckoutThankYou(false)
  } catch (e) {
    console.error("Open form error", e)
  }
}
  return (
    <>
      {showCheckoutThankYou && (
        <div
          id="checkout-thankyou-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="w-full max-w-2xl mx-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Payment Successful!</h2>
                    <p className="text-blue-100 text-sm">Your order has been confirmed and verified</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white transition-colors" aria-label="Close">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 text-xs font-medium uppercase tracking-wide mb-1">Payment ID</div>
                  <div className="font-semibold text-gray-900">
                    {checkoutPayment?.razorpay_payment_id ?? checkoutPayment?.id ?? "—"}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 text-xs font-medium uppercase tracking-wide mb-1">Date</div>
                  <div className="font-semibold text-gray-900">
                    {checkoutPayment?.payment_date ? new Date(checkoutPayment.payment_date).toLocaleString() : "—"}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 text-xs font-medium uppercase tracking-wide mb-1">Amount</div>
                  <div className="font-semibold text-gray-900">{checkoutPayment?.total_amount ?? "—"}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 text-xs font-medium uppercase tracking-wide mb-1">Status</div>
                  <div className="font-semibold text-green-600">{checkoutPayment?.payment_status ?? "—"}</div>
                </div>
              </div>

              {checkoutOrders.length > 1 && (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-blue-800 font-medium">Multiple Services Detected</span>
                    </div>
                    <p className="text-blue-700 text-sm">Click each service below to open its form:</p>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
                    {checkoutOrders.map((o) => (
                      <button
                        key={o.id}
                        className="group relative overflow-hidden rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5"
                        onClick={() => (onProceedSingle ? onProceedSingle(o) : openFormForOrder(o))}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{(o.services as any)?.name || "Service"}</span>
                          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      onClick={() =>
                        onProceedMultiple ? onProceedMultiple(checkoutOrders) : openAllOrderFormsInTabs(checkoutOrders)
                      }
                    >
                      Proceed to Forms
                    </button>
                  </div>
                </div>
              )}

              {checkoutOrders.length === 1 && (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 7a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v14z" />
                      </svg>
                      <span className="text-blue-800 font-medium">Form Ready</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">Click proceed to open your form in a new tab.</p>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      className="group inline-flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-medium shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-0.5"
                      onClick={() =>
                        onProceedSingle ? onProceedSingle(checkoutOrders[0]) : openFormForOrder(checkoutOrders[0])
                      }
                    >
                      <span>Proceed To Form</span>
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CheckoutModal