"use client"

import { useEffect } from "react"

/**
 * Safety net: sometimes modal libraries (e.g., Radix dismissable layer) can
 * leave document.body.style.pointerEvents = 'none' after visibility/focus transitions
 * or interrupted unmounts, which makes the whole page unclickable.
 *
 * This tiny client component clears that style on mount and whenever the tab
 * becomes visible or the window regains focus.
 */
export default function PointerEventsReset() {
  useEffect(() => {
    const clearIfStuck = (reason: string) => {
      try {
        const cur = document?.body?.style?.pointerEvents || ""
        if (cur === "none") {
          document.body.style.pointerEvents = ""
          // eslint-disable-next-line no-console
          console.debug("[PointerEventsReset] cleared body.pointerEvents after", reason)
        }
      } catch {}
    }

    // Initial mount check
    clearIfStuck("mount")

    // After tab return, some libraries may toggle pointer-events a few times.
    // Run a short sweep that re-checks over a handful of frames.
    const sweep = (label: string) => {
      let count = 0
      const max = 40 // ~40 frames ≈ 650ms – more tolerant of late mutations
      const tick = () => {
        clearIfStuck(label + `#${count}`)
        if (++count < max) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      // also schedule a few delayed checks
      setTimeout(() => clearIfStuck(label + '-t100'), 100)
      setTimeout(() => clearIfStuck(label + '-t250'), 250)
      setTimeout(() => clearIfStuck(label + '-t500'), 500)
      setTimeout(() => clearIfStuck(label + '-t800'), 800)
    }

    const onFocus = () => { clearIfStuck("focus"); sweep("focus-sweep") }
    const onVis = () => {
      if (document.visibilityState === "visible") { clearIfStuck("visibilitychange"); sweep("visibility-sweep") }
    }
    const onAppRefresh = () => clearIfStuck("app:refresh")

  // Clear at the moment of interaction (capture), so the click goes through
  const onAnyInteract = () => clearIfStuck("interaction")
  window.addEventListener("focus", onFocus)
  document.addEventListener("visibilitychange", onVis)
  window.addEventListener("pointerdown", onAnyInteract, true)
  window.addEventListener("mousedown", onAnyInteract, true)
  window.addEventListener("touchstart", onAnyInteract, true)
  window.addEventListener("keydown", onAnyInteract, true)
    window.addEventListener("app:refresh" as any, onAppRefresh as any)
    window.addEventListener("app:reset" as any, onAppRefresh as any)

    return () => {
  window.removeEventListener("focus", onFocus)
  document.removeEventListener("visibilitychange", onVis)
  window.removeEventListener("pointerdown", onAnyInteract, true)
  window.removeEventListener("mousedown", onAnyInteract, true)
  window.removeEventListener("touchstart", onAnyInteract, true)
  window.removeEventListener("keydown", onAnyInteract, true)
      window.removeEventListener("app:refresh" as any, onAppRefresh as any)
      window.removeEventListener("app:reset" as any, onAppRefresh as any)
    }
  }, [])

  return null
}
