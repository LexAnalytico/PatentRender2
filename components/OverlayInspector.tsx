"use client"

import { useEffect } from "react"

/**
 * Debug-only click/overlay inspector. Disabled by default. Enable with one of:
 * - localStorage.setItem('overlay_debug', '1')
 * - window.OVERLAY_DEBUG = true
 * - NEXT_PUBLIC_OVERLAY_DEBUG=1 (build-time)
 */
export default function OverlayInspector() {
  useEffect(() => {
    const isEnabled =
      process.env.NEXT_PUBLIC_OVERLAY_DEBUG === "1" ||
      (typeof window !== "undefined" && ((window as any).OVERLAY_DEBUG === true || localStorage.getItem("overlay_debug") === "1"))

    if (!isEnabled) return

    const highlight = (el: Element) => {
      try {
        const prevOutline = (el as any).style.outline
        ;(el as any).style.outline = "2px solid #eab308" // amber-500
        setTimeout(() => { try { (el as any).style.outline = prevOutline } catch {} }, 800)
      } catch {}
    }

    const onPointer = (e: PointerEvent | MouseEvent | TouchEvent) => {
      try {
        const x = (e as any).clientX ?? (e as any).changedTouches?.[0]?.clientX
        const y = (e as any).clientY ?? (e as any).changedTouches?.[0]?.clientY
        if (typeof x !== "number" || typeof y !== "number") return
        const els = document.elementsFromPoint(x, y)
        const top = els[0]
        const path = els.slice(0, 6).map((el) => {
          const tag = el.tagName?.toLowerCase()
          const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : ""
          const cls = (el as HTMLElement).className ? `.${(el as HTMLElement).className.toString().split(/\s+/).slice(0,3).join('.')}` : ""
          return `${tag}${id}${cls}`
        })
        const bodyPE = getComputedStyle(document.body).pointerEvents
        // eslint-disable-next-line no-console
        console.debug("[OverlayInspector] click at", { x, y, top: top ? (top as HTMLElement).outerHTML?.slice(0, 80) : null, path, bodyPE })
        if (top) highlight(top)
      } catch {}
    }

    document.addEventListener("pointerdown", onPointer, true)
    document.addEventListener("mousedown", onPointer, true)
    document.addEventListener("touchstart", onPointer, true)
    return () => {
      document.removeEventListener("pointerdown", onPointer, true)
      document.removeEventListener("mousedown", onPointer, true)
      document.removeEventListener("touchstart", onPointer, true)
    }
  }, [])

  return null
}
