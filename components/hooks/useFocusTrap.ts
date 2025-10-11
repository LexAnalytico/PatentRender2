"use client"

import { useEffect } from 'react'

export function useFocusTrap(
  active: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  returnFocusEl?: HTMLElement | null,
) {
  useEffect(() => {
    if (!active || !containerRef.current) return
    const container = containerRef.current

    const getFocusable = () => Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && getComputedStyle(el).display !== 'none')

    const focusables = getFocusable()
    const first = focusables[0] || container
    const last = focusables[focusables.length - 1] || container

    // Move initial focus
    setTimeout(() => first.focus(), 0)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const current = document.activeElement as HTMLElement | null
        const list = getFocusable()
        const firstEl = list[0] || container
        const lastEl = list[list.length - 1] || container
        if (e.shiftKey) {
          if (!current || current === firstEl || !container.contains(current)) {
            e.preventDefault()
            lastEl.focus()
          }
        } else {
          if (!current || current === lastEl || !container.contains(current)) {
            e.preventDefault()
            firstEl.focus()
          }
        }
      } else if (e.key === 'Escape') {
        // Let parent handle close if listening for Escape
        const ev = new CustomEvent('focus-trap:escape')
        container.dispatchEvent(ev)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (returnFocusEl) {
        try { returnFocusEl.focus() } catch {}
      }
    }
  }, [active, containerRef, returnFocusEl])
}
