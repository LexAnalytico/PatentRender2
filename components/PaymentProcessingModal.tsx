//components/PaymentProcessingModal.tsx
"use client"

import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface PaymentProcessingModalProps {
  isVisible: boolean
  message?: string
  className?: string
}

export function PaymentProcessingModal({
  isVisible,
  message = "Processing payment, please wait...",
  className,
}: PaymentProcessingModalProps) {
  // Dispatch screen:ready when modal becomes visible to clear any blur overlay from tab-in
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        try { window.dispatchEvent(new Event('screen:ready')) } catch {}
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <div
        className={cn(
          "relative rounded-xl bg-card border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300",
          "px-8 py-6 max-w-sm mx-4 min-w-[320px]",
          "border-[color:var(--blue-primary)]/20 shadow-[0_25px_50px_-12px_rgba(59,130,246,0.25)]",
          className,
        )}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[color:var(--blue-secondary)] to-transparent opacity-50" />

        <div className="relative flex flex-col items-center gap-4 text-center">
          {/* Spinner */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-muted animate-spin">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[color:var(--blue-primary)] animate-spin" />
            </div>
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-[color:var(--blue-primary)]/30 animate-ping" />
          </div>

          {/* Title & message */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[color:var(--blue-primary)] text-lg">Processing Payment</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
          </div>

          {/* Dots animation */}
          <div className="flex gap-1">
            <div
              className="w-2 h-2 rounded-full bg-[color:var(--blue-primary)] animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-[color:var(--blue-accent)] animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-[color:var(--blue-primary)] animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}