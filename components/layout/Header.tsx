"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Scale, ChevronDown, RefreshCcw } from "lucide-react"
import { UserCircleIcon } from "@heroicons/react/24/outline"
import { patentServices, trademarkServices, copyrightServices, designServices } from "@/constants/services"
import { useAuthProfile } from "@/app/useAuthProfile"

export function Header() {
  const { isAuthenticated, user, displayName, handleGoogleLogin, handleLogout } = useAuthProfile()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cachedName, setCachedName] = useState<string>("")

  // Read minimal header cache to avoid username flicker on focus/refresh
  useEffect(() => {
    const readCache = () => {
      try {
        const raw = localStorage.getItem('app:header_user_cache')
        if (!raw) return
        const obj = JSON.parse(raw)
        if (!obj || obj.ver !== 1) return
        const ttlMs = Number(process.env.NEXT_PUBLIC_HEADER_CACHE_TTL_MS || '600000')
        const ts = Number(obj.ts || 0)
        if (!ts || (Date.now() - ts) > ttlMs) {
          try { localStorage.removeItem('app:header_user_cache') } catch {}
          return
        }
        const nm = String(obj.name || obj.email || '').trim()
        if (nm) setCachedName(nm)
      } catch {}
    }
    // Initial read
    readCache()
    // Small delayed read to catch post-hydration cache writes
    const t = setTimeout(readCache, 200)
    // Refresh on focus/pageshow/visibility
    const onFocus = () => readCache()
    const onVis = () => { if (document.visibilityState === 'visible') readCache() }
    const onPageShow = () => readCache()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      clearTimeout(t)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  const adminInfo = useMemo(() => {
    const raw = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)
    const email = user?.email?.toLowerCase() || ""
    const isPrimary = !!email && raw.length > 0 && raw[0] === email
    const isAdmin = !!email && raw.includes(email)
    return {
      isAdmin,
      isPrimaryAdmin: isPrimary,
      isSecondaryAdmin: isAdmin && !isPrimary,
      list: raw,
    }
  }, [user])

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 overflow-x-auto no-scrollbar">
          <div className="flex items-center flex-shrink-0 pr-2">
            <Scale className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900 whitespace-nowrap">LegalIP Pro</span>
          </div>
          <nav className="hidden md:flex items-center gap-3 flex-nowrap whitespace-nowrap ml-1">
            {/* Primary service dropdowns */}
            <Dropdown label="Patent Services" items={patentServices} idPrefix="patent" colorHover="blue" />
            <Dropdown label="Trademark Services" items={trademarkServices} idPrefix="trademark" colorHover="green" />
            <Dropdown label="Design Services" items={designServices} idPrefix="design" colorHover="orange" />
            <Dropdown label="Copyright Services" items={copyrightServices} idPrefix="copyright" colorHover="purple" />

            {/* Knowledge Hub link */}
            <a href="/knowledge-hub" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Knowledge Hub</a>

            {/* Manual Refresh (workaround for Safari focus issues) */}
            <button
              onClick={() => {
                try {
                  const now = Date.now()
                  const last = Number(localStorage.getItem('app_manual_refresh_ts') || '0')
                  if (now - last < 3000) return // throttle to 3s
                  localStorage.setItem('app_manual_refresh_ts', String(now))
                  window.location.reload()
                } catch {
                  window.location.reload()
                }
              }}
              aria-label="Refresh application"
              title="Refresh (use if values look stale after tab switch)"
              className="p-2 rounded-md border border-transparent hover:border-blue-200 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>

            {/* Admin Dashboard button (primary + secondary) */}
            <button
              onClick={() => { if (adminInfo.isAdmin) router.push('/admin') }}
              disabled={!adminInfo.isAdmin}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors border ${
                adminInfo.isAdmin
                  ? 'text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-200'
                  : 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50'
              }`}
              title={adminInfo.isAdmin ? (adminInfo.isPrimaryAdmin ? 'Primary Admin: full access' : 'Secondary Admin: limited view') : 'Admins only'}
              aria-disabled={!adminInfo.isAdmin}
            >
              {adminInfo.isPrimaryAdmin ? 'Admin Dashboard' : adminInfo.isSecondaryAdmin ? 'My Admin View' : 'Admin Dashboard'}
            </button>

            {/* Welcome text */}
            {(displayName || cachedName) && (
              <span className="text-gray-700 text-sm max-w-[150px] truncate" title={displayName || cachedName}>Welcome, {displayName || cachedName}</span>
            )}

            {/* Profile / Auth menu */}
            <div className="relative">
              <button onClick={() => setMenuOpen(o => !o)} className="focus:outline-none">
                <UserCircleIcon className="h-8 w-8 text-gray-700 hover:text-blue-600" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-blue-50/95 backdrop-blur-sm shadow-lg rounded-lg py-2 border border-blue-100 z-50">
                  {isAuthenticated ? (
                    <>
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100"
                        onClick={() => { setMenuOpen(false); router.push('/profile') }}
                      >Profile</button>
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100"
                        onClick={() => { setMenuOpen(false); handleLogout() }}
                      >Sign Out</button>
                    </>
                  ) : (
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100"
                      onClick={() => { setMenuOpen(false); handleGoogleLogin() }}
                    >Sign In with Google</button>
                  )}
                </div>
              )}
            </div>
          </nav>
          <div className="flex-grow" />
          {/* Always-visible refresh (mobile + Safari fallback) */}
          <button
            onClick={() => {
              try {
                const now = Date.now()
                const last = Number(localStorage.getItem('app_manual_refresh_ts') || '0')
                if (now - last < 3000) return
                localStorage.setItem('app_manual_refresh_ts', String(now))
                window.location.reload()
              } catch { window.location.reload() }
            }}
            aria-label="Refresh application"
            title="Refresh (use if values look stale)"
            className="ml-2 p-2 rounded-md border border-transparent hover:border-blue-200 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <RefreshCcw className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

// Small dropdown helper to avoid repeating markup
function Dropdown({ label, items, idPrefix, colorHover }: { label: string; items: { title: string }[]; idPrefix: string; colorHover: string }) {
  return (
    <div className="relative group">
      <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
        {label}
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>
      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          {items.map((service) => (
            <a
              key={service.title}
              href={`/#${idPrefix}-services`}
              className={`block px-4 py-2 text-sm text-gray-700 hover:bg-${colorHover}-50 hover:text-${colorHover}-600 transition-colors`}
            >
              {service.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
