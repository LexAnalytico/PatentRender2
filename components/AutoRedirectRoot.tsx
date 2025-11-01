"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

/**
 * Root-level auto-redirect/restorer.
 * When the app lands on '/', restore the last dashboard view (orders/profile/forms)
 * by redirecting to '/?dashboard=<view>' and dropping a localStorage hint the
 * landing page consumes to open the rich dashboard UI instead of any minimal routes.
 */
export default function AutoRedirectRoot() {
	const pathname = usePathname()
	const router = useRouter()

	useEffect(() => {
		if (typeof window === "undefined") return

		const LAST_VIEW_KEY = "app:last_view"

		const restoreIfNeeded = (reason: string) => {
			try {
				if (pathname !== "/") return
				if (typeof document !== "undefined" && document.hidden) return
				const last = window.localStorage.getItem(LAST_VIEW_KEY) || ""
				if (!last || !last.startsWith("quote:")) return
				const view = last.split(":")[1]
				if (view === "orders" || view === "profile" || view === "forms") {
					try { localStorage.setItem('app:open_on_landing', view) } catch {}
					const target = `/?dashboard=${encodeURIComponent(view)}`
					router.replace(target)
				}
			} catch {}
		}

		restoreIfNeeded("mount")
		const onFocus = () => restoreIfNeeded("focus")
		const onVis = () => { if (document.visibilityState === "visible") restoreIfNeeded("visibilitychange") }
		const onPageShow = () => restoreIfNeeded("pageshow")
		window.addEventListener("focus", onFocus)
		document.addEventListener("visibilitychange", onVis)
		window.addEventListener("pageshow", onPageShow)
		const t = setTimeout(() => restoreIfNeeded("timeout"), 120)
		return () => {
			window.removeEventListener("focus", onFocus)
			document.removeEventListener("visibilitychange", onVis)
			window.removeEventListener("pageshow", onPageShow)
			clearTimeout(t)
		}
	}, [pathname, router])

	return null
}

