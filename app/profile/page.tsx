"use client"

import React, { Suspense, useEffect, useState } from "react"
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from "@/components/ui/label"
import pricingToForm from '../data/service-pricing-to-form.json'
import CheckoutModal from "@/components/checkout-modal"
import ProfilePanel from "@/components/panels/ProfilePanel"
import {
  ArrowLeft,
  User,
  LogOut,
} from "lucide-react"
import { ChevronDown, ChevronRight } from "lucide-react"

// helpers: pricing map
const getPricingToForm = (k?: string | null) => {
  if (!k) return null
  const map = pricingToForm as unknown as Record<string, string>
  return map[k] ?? null
}

// helpers: thank-you acknowledgement
const markThankYouAcknowledged = (pid?: string | number | null) => {
  try {
    if (!pid) return
    localStorage.setItem(`shown_thankyou_pay_${pid}`, '1')
  } catch { /* ignore */ }
}

const hasAcknowledgedThankYou = (pid?: string | number | null) => {
  try {
    if (!pid) return false
    return !!localStorage.getItem(`shown_thankyou_pay_${pid}`)
  } catch {
    return false
  }
}

interface Profile {
  id?: string | null
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

function ProfilePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [editProfile, setEditProfile] = useState<Profile>({} as Profile)
  const [saving, setSaving] = useState(false)
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({})
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [loadingUserOrders, setLoadingUserOrders] = useState(false)
  const [searchOrders, setSearchOrders] = useState<string>('')
  const [sortOrders, setSortOrders] = useState<string>('date_desc')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState<string>('orders')
  const [highlightPaymentId, setHighlightPaymentId] = useState<string | null>(null)
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({})
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({})
  // Thank You modal state
  const [showThankYou, setShowThankYou] = useState(false)
  const [thankYouOrders, setThankYouOrders] = useState<any[]>([])
  const [thankYouPayment, setThankYouPayment] = useState<any | null>(null)
  const [showFormOptions, setShowFormOptions] = useState(false)
  const [hasShownThankYou, setHasShownThankYou] = useState(false)
  // NEW: track the payment id whose thank-you is currently active
  const [activeThankYouPid, setActiveThankYouPid] = useState<string | number | null>(null)

  // Resize/focus hard-refresh guard (mirrors main and forms pages)
  useEffect(() => {
    const RESET_ON_RESIZE = process.env.NEXT_PUBLIC_RESET_ON_RESIZE === '1'
    const handler = () => {
      const winFlag = (typeof window !== 'undefined') && ((window as any).RESET_ON_RESIZE === true)
      if (!RESET_ON_RESIZE && !winFlag) return
      if (typeof document !== 'undefined' && (document as any).hidden) {
        try {
          localStorage.setItem('app_refresh_on_focus', '1')
          localStorage.setItem('app_prev_dims_on_hide', `${window.innerWidth}x${window.innerHeight}`)
          localStorage.setItem('app_prev_dpr_on_hide', String((window as any).devicePixelRatio || 1))
          const scr = (window as any).screen
          if (scr && typeof scr.width === 'number' && typeof scr.height === 'number') localStorage.setItem('app_prev_screen_on_hide', `${scr.width}x${scr.height}`)
          localStorage.setItem('app_hidden_at', String(Date.now()))
        } catch {}
        return
      }
      try { if ((handler as any)._t) clearTimeout((handler as any)._t) } catch {}
      ;(handler as any)._t = setTimeout(() => {
        try {
          try {
            const dpr = (window as any).devicePixelRatio || 1
            const scr = (window as any).screen
            const screenSize = (scr && typeof scr.width === 'number' && typeof scr.height === 'number') ? `${scr.width}x${scr.height}` : ''
            localStorage.setItem('app_debug_refresh', JSON.stringify({ reason: 'resize', ts: Date.now(), details: { dims: `${window.innerWidth}x${window.innerHeight}`, dpr, screen: screenSize, page: 'profile' } }))
          } catch {}
          const w = window as any
          if (typeof w.triggerAppReset === 'function') { w.triggerAppReset(); return }
          try { window.dispatchEvent(new Event('app:refresh')) } catch {}
        } catch {}
        const now = Date.now()
        const last = Number(localStorage.getItem('app_manual_refresh_ts') || '0')
        if (now - last < 3000) return
        localStorage.setItem('app_manual_refresh_ts', String(now))
        window.location.reload()
      }, 350)
    }
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
      try { if ((handler as any)._t) clearTimeout((handler as any)._t) } catch {}
    }
  }, [])

  useEffect(() => {
    const RESET_ON_RESIZE = process.env.NEXT_PUBLIC_RESET_ON_RESIZE === '1'
    const RESET_ON_FOCUS = process.env.NEXT_PUBLIC_RESET_ON_FOCUS === '1'
    const FORCE_REFRESH_ON_FOCUS_MS = Number(process.env.NEXT_PUBLIC_FORCE_REFRESH_ON_FOCUS_MS || '0') || 0
    const winFlag = (typeof window !== 'undefined') && ((window as any).RESET_ON_RESIZE === true)
    if (!RESET_ON_RESIZE && !winFlag && !RESET_ON_FOCUS && FORCE_REFRESH_ON_FOCUS_MS <= 0) return
    const onVisChange = () => {
      try {
        if (document.hidden) return
        const marker = localStorage.getItem('app_refresh_on_focus') === '1'
        const prevDims = localStorage.getItem('app_prev_dims_on_hide') || ''
        const nowDims = `${window.innerWidth}x${window.innerHeight}`
        const prevDpr = localStorage.getItem('app_prev_dpr_on_hide') || ''
        const nowDpr = String((window as any).devicePixelRatio || 1)
        const prevScreen = localStorage.getItem('app_prev_screen_on_hide') || ''
        let nowScreen = ''
        try { const scr = (window as any).screen; if (scr && typeof scr.width === 'number' && typeof scr.height === 'number') nowScreen = `${scr.width}x${scr.height}` } catch {}
        const changedDims = !!prevDims && prevDims !== nowDims
        const changedDpr = !!prevDpr && prevDpr !== nowDpr
        const changedScreen = !!prevScreen && nowScreen && prevScreen !== nowScreen
        const hiddenAt = Number(localStorage.getItem('app_hidden_at') || '0')
        const hiddenDur = hiddenAt ? (Date.now() - hiddenAt) : 0
        const longHidden = FORCE_REFRESH_ON_FOCUS_MS > 0 && hiddenDur >= FORCE_REFRESH_ON_FOCUS_MS
        if (marker || changedDims || changedDpr || changedScreen || RESET_ON_FOCUS || longHidden) {
          try { localStorage.setItem('app_debug_refresh', JSON.stringify({ reason: 'resize-hidden', ts: Date.now(), details: { marker, prevDims, nowDims, prevDpr, nowDpr, prevScreen, nowScreen, hiddenDur, page: 'profile' } })) } catch {}
          localStorage.removeItem('app_refresh_on_focus')
          localStorage.removeItem('app_prev_dims_on_hide')
          localStorage.removeItem('app_prev_dpr_on_hide')
          localStorage.removeItem('app_prev_screen_on_hide')
          const w: any = window
          if (typeof w.triggerAppResetForce === 'function') { w.triggerAppResetForce('resize-hidden'); return }
          try { window.dispatchEvent(new CustomEvent('app:refresh', { detail: { force: true, reason: 'resize-hidden' } })) } catch {}
          const now = Date.now()
          localStorage.setItem('app_manual_refresh_ts', String(now))
          window.location.reload()
        }
      } catch {}
    }
    document.addEventListener('visibilitychange', onVisChange)
    return () => document.removeEventListener('visibilitychange', onVisChange)
  }, [])

  useEffect(() => {
    const DEBUG_REFRESH = process.env.NEXT_PUBLIC_DEBUG_REFRESH === '1'
    const winDebug = (typeof window !== 'undefined') && ((window as any).DEBUG_REFRESH === true)
    // Require BOTH flags to show debug overlay
    if (!(DEBUG_REFRESH && winDebug)) return
    try {
      const raw = localStorage.getItem('app_debug_refresh')
      if (!raw) return
      const info = JSON.parse(raw)
      localStorage.removeItem('app_debug_refresh')
      const ts = info?.ts || Date.now()
      if (Date.now() - ts > 15000) return
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.bottom = '12px'
      container.style.left = '12px'
      container.style.zIndex = '99999'
      container.style.maxWidth = '320px'
      container.style.background = 'rgba(17,24,39,0.95)'
      container.style.color = '#f8fafc'
      container.style.padding = '10px 12px'
      container.style.borderRadius = '8px'
      container.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)'
      container.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif'
      container.style.fontSize = '12px'
      const pre = document.createElement('pre')
      pre.style.margin = '6px 0 0 0'
      pre.style.whiteSpace = 'pre-wrap'
      pre.style.wordBreak = 'break-word'
      pre.textContent = JSON.stringify({ reason: info?.reason, details: info?.details }, null, 2)
      const title = document.createElement('div')
      title.style.fontWeight = '600'
      title.style.display = 'flex'
      title.style.alignItems = 'center'
      title.style.justifyContent = 'space-between'
      title.textContent = 'Auto refresh debug (profile)'
      const close = document.createElement('button')
      close.textContent = '×'
      close.setAttribute('aria-label', 'Close')
      close.style.marginLeft = '12px'
      close.style.fontSize = '14px'
      close.style.lineHeight = '1'
      close.style.background = 'transparent'
      close.style.color = '#e5e7eb'
      close.style.border = 'none'
      close.style.cursor = 'pointer'
      close.onclick = () => { try { document.body.removeChild(container) } catch {} }
      title.appendChild(close)
      container.appendChild(title)
      container.appendChild(pre)
      document.body.appendChild(container)
      setTimeout(() => { try { document.body.removeChild(container) } catch {} }, 8000)
    } catch {}
  }, [])

  // Close/proceed helpers
  const cleanupPaymentQuery = () => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.has('payment_id')) {
        url.searchParams.delete('payment_id')
        window.history.replaceState({}, '', url.toString())
      }
    } catch { /* ignore */ }
  }

  const handleCloseThankYou = () => {
    if (activeThankYouPid) markThankYouAcknowledged(activeThankYouPid)
    setShowThankYou(false)
    setHasShownThankYou(true)
    cleanupPaymentQuery()
  }

  const handleProceedSingle = (o: any) => {
    try {
      openFormForOrder(o)
    } finally {
      handleCloseThankYou()
    }
  }

  const handleProceedMultiple = () => {
  try {
    // Collect URLs for all orders contained in this payment group
    const urls = (thankYouOrders || [])
      .map((o) => buildFormUrlForOrder(o))
      .filter((u): u is string => !!u)

    if (!urls.length) {
      alert('No forms available to open for these services.')
      return
    }

    // Open all forms synchronously within the same click to avoid popup blockers
    const opened = urls.map((u) => window.open(u, '_blank'))
    const blocked = opened.filter((w) => !w).length

    if (blocked > 0) {
      // Best-effort: ensure at least the first form opens
      if (!opened.some((w) => !!w)) {
        const fallback = window.open(urls[0], '_blank')
        if (!fallback) {
          alert('Your browser blocked multiple tabs. Please enable pop-ups for this site and try again.')
          return
        }
      }
      console.warn(`Popup blocker prevented opening ${blocked} tabs.`)
    }
  } finally {
    // Persist acknowledgement and close, same as handleProceedSingle
    handleCloseThankYou()
  }
}

  // initialize tab from query param if present
  useEffect(() => {
    const t = searchParams?.get('tab') || 'orders'
    setCurrentTab(t)
  }, [searchParams])

  // helper to filter and sort orders locally
  const filteredOrders = (items: any[], q: string, sort: string) => {
    const filtered = items.filter((r) => {
      if (!q) return true
      const s = q.toLowerCase()
      const cat = (r.categories as any)?.name ?? ''
      const svc = (r.services as any)?.name ?? ''
      const amt = String((r.payments as any)?.total_amount ?? '')
      return cat.toLowerCase().includes(s) || svc.toLowerCase().includes(s) || amt.includes(s)
    })
    if (sort === 'date_desc') return filtered.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sort === 'date_asc') return filtered.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    if (sort === 'amount_desc') return filtered.sort((a,b) => Number((b.payments as any)?.total_amount ?? 0) - Number((a.payments as any)?.total_amount ?? 0))
    if (sort === 'amount_asc') return filtered.sort((a,b) => Number((a.payments as any)?.total_amount ?? 0) - Number((b.payments as any)?.total_amount ?? 0))
    return filtered
  }

  // Resolve form type key...
  const resolveOrderTypeKey = (o: any): string | null => {
    if (!o) return null
    let t = o.type ?? (o.payments ? o.payments.type ?? null : null)
    if (t) return t
    if (o.service_pricing_key) {
      const mapped = getPricingToForm(o.service_pricing_key as string)
      return mapped ?? o.service_pricing_key
    }
    const svcName = (o.services as any)?.name ?? null
    if (!svcName) return null
    const mapping: Record<string, string> = {
      'Patentability Search': 'patentability_search',
      'Patentability search': 'patentability_search',
      'Patentability Search ': 'patentability_search',
      'Drafting': 'drafting',
      'Provisional Filing': 'provisional_filing',
      'Provisional Filing ': 'provisional_filing',
      'Provisional Filling': 'provisional_filing',
      'Complete Non Provisional Filing': 'complete_non_provisional_filing',
      'Complete non Provisional Filling': 'complete_non_provisional_filing',
      'PCT Filling': 'pct_filing',
      'PCT Filing': 'pct_filing',
      'PS-CS': 'ps_cs',
      'PS CS': 'ps_cs',
      'PS-CS ': 'ps_cs',
      'FER Response': 'fer_response',
    }
    return mapping[svcName] ?? null
  }

  const typeLabelFromKey = (k: string | null) => {
    if (!k) return null
    const labels: Record<string, string> = {
      patentability_search: 'Patentability Search',
      drafting: 'Drafting',
      provisional_filing: 'Provisional Filing',
      complete_non_provisional_filing: 'Complete Non-Provisional Filing',
      pct_filing: 'PCT Filing',
      ps_cs: 'PS-CS',
      fer_response: 'FER Response',
    }
    return labels[k] ?? k
  }

  const loadUserOrders = async () => {
    setLoadingUserOrders(true)
    try {
      const userRes = await supabase.auth.getUser()
      const user = (userRes && (userRes as any).data) ? (userRes as any).data.user : null
      if (!user) return
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, service_id, category_id, payment_id, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load user orders', error)
      }

      const ordersRaw = (data as any) ?? []
      const serviceIds = Array.from(new Set(ordersRaw.map((o: any) => o.service_id).filter(Boolean)))
      const categoryIds = Array.from(new Set(ordersRaw.map((o: any) => o.category_id).filter(Boolean)))
      const paymentIds = Array.from(new Set(ordersRaw.map((o: any) => o.payment_id).filter(Boolean)))

      const [servicesRes, categoriesRes, paymentsRes, pricingRes] = await Promise.all([
        serviceIds.length ? supabase.from('services').select('id, name').in('id', serviceIds) : Promise.resolve({ data: [], error: null }),
        categoryIds.length ? supabase.from('categories').select('id, name').in('id', categoryIds) : Promise.resolve({ data: [], error: null }),
        paymentIds.length ? supabase.from('payments').select('id, razorpay_payment_id, total_amount, payment_status, payment_date, service_id, type').in('id', paymentIds) : Promise.resolve({ data: [], error: null }),
        serviceIds.length ? supabase.from('service_pricing_rules').select('service_id, key').in('service_id', serviceIds) : Promise.resolve({ data: [], error: null }),
      ])

      const servicesMap = new Map((servicesRes?.data ?? []).map((s: any) => [s.id, s]))
      const categoriesMap = new Map((categoriesRes?.data ?? []).map((c: any) => [c.id, c]))
      const paymentsMap = new Map((paymentsRes?.data ?? []).map((p: any) => [p.id, p]))
      const pricingMap = new Map((pricingRes?.data ?? []).reduce((acc: any[], r: any) => {
        if (!r) return acc
        acc.push([r.service_id, r.key])
        return acc
      }, []))

      const merged = ordersRaw.map((o: any) => ({
        ...o,
        services: servicesMap.get(o.service_id) ?? null,
        categories: categoriesMap.get(o.category_id) ?? null,
        payments: paymentsMap.get(o.payment_id) ?? null,
        service_pricing_key: pricingMap.get(o.service_id) ?? null,
      }))

      setUserOrders(merged)

      // form statuses
      try {
        const orderIds = merged.map((m: any) => m.id).filter(Boolean)
        if (orderIds.length > 0) {
          const { data: fr } = await supabase
            .from('form_responses')
            .select('order_id, form_type, completed')
            .in('order_id', orderIds)
          const map: Record<string, string> = {}
          for (const row of (fr as any[]) ?? []) {
            const oid = row.order_id
            const comp = !!row.completed
            const current = map[oid]
            const candidate = comp ? 'Completed' : 'Draft'
            if (!current || (current === 'Draft' && candidate === 'Completed')) {
              map[oid] = candidate
            }
          }
          setOrderStatuses(map)
        } else {
          setOrderStatuses({})
        }
      } catch (e) {
        console.error('Compute form statuses error', e)
      }

      // Redirect with payment_id path
      if (highlightPaymentId) {
        try {
          // Check if already acknowledged for this payment
          if (hasAcknowledgedThankYou(highlightPaymentId)) {
            // Already acknowledged: ensure URL is clean and do not open
            cleanupPaymentQuery()
          } else {
            let matched = (merged as any[]).filter((r) => {
              const pay = (r.payments as any)
              if (!pay) return false
              return String(pay.razorpay_payment_id || pay.id || '').toLowerCase() === String(highlightPaymentId).toLowerCase()
            })

            if (!matched || matched.length === 0) {
              // resolve payment directly
              const userRes2 = await supabase.auth.getUser()
              const user2 = (userRes2 && (userRes2 as any).data) ? (userRes2 as any).data.user : null
              if (user2) {
                const { data: payByRz } = await supabase
                  .from('payments')
                  .select('id, razorpay_payment_id, total_amount, payment_status, payment_date, type')
                  .eq('user_id', user2.id)
                  .eq('razorpay_payment_id', highlightPaymentId)
                  .maybeSingle()
                let resolvedPayment: any | null = null
                if (payByRz) {
                  resolvedPayment = payByRz
                } else {
                  const maybeId = Number(highlightPaymentId)
                  if (!Number.isNaN(maybeId)) {
                    const { data: payById } = await supabase
                      .from('payments')
                      .select('id, razorpay_payment_id, total_amount, payment_status, payment_date, type')
                      .eq('user_id', user2.id)
                      .eq('id', maybeId)
                      .maybeSingle()
                    if (payById) resolvedPayment = payById
                  }
                }
                if (resolvedPayment) {
                  setThankYouPayment(resolvedPayment)
                  setActiveThankYouPid(resolvedPayment.razorpay_payment_id || resolvedPayment.id || null)
                  const rowsForPayment = (merged as any[]).filter((r) => String(r.payment_id) === String(resolvedPayment.id))
                  setThankYouOrders(rowsForPayment)
                  if (rowsForPayment.length > 0) {
                    setSelectedOrderId(rowsForPayment[0].id)
                    setExpandedPayments((p) => ({ ...p, [String(resolvedPayment.id)]: true }))
                  }
                  setShowThankYou(true)
                  if (!hasShownThankYou) setHasShownThankYou(true)
                }
              }
            }

            if (matched && matched.length > 0) {
              setSelectedOrderId(matched[0].id)
              const pid = matched[0]?.payments?.razorpay_payment_id || matched[0]?.payments?.id || null
              if (pid) {
                setActiveThankYouPid(pid)
              }
              const pidKey = matched[0]?.payment_id ? String(matched[0].payment_id) : null
              if (pidKey) setExpandedPayments((p) => ({ ...p, [pidKey]: true }))
              setTimeout(() => {
                const el = document.querySelector(`[data-order-id="${matched[0].id}"]`)
                if (el && (el as HTMLElement).scrollIntoView) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
              }, 150)
              if (!hasShownThankYou) {
                const samePay = (merged as any[]).filter((r) => {
                  const pay = (r.payments as any)
                  if (!pay) return false
                  return String(pay.razorpay_payment_id || pay.id || '').toLowerCase() === String(highlightPaymentId).toLowerCase()
                })
                setThankYouOrders(samePay)
                setThankYouPayment((samePay[0] as any)?.payments ?? null)
                const apid = (samePay[0] as any)?.payments?.razorpay_payment_id || (samePay[0] as any)?.payments?.id || null
                if (apid) setActiveThankYouPid(apid)
                setShowThankYou(true)
                setHasShownThankYou(true)
              }
            }
          }
        } catch (e) {
          console.error('Auto-select orders error', e)
        }
      }

  // Fallback: latest payment group when no payment_id in URL (feature-flagged)
  const AUTO_OPEN_THANKYOU = process.env.NEXT_PUBLIC_PROFILE_AUTO_OPEN_THANKYOU === '1'
  if (AUTO_OPEN_THANKYOU && !highlightPaymentId && merged && Array.isArray(merged) && merged.length > 0 && !hasShownThankYou) {
        try {
          const groupsMap = new Map<string, any[]>()
          for (const r of merged as any[]) {
            if (!r || !r.payment_id) continue
            const key = String(r.payment_id)
            if (!groupsMap.has(key)) groupsMap.set(key, [])
            groupsMap.get(key)!.push(r)
          }
          const groups = Array.from(groupsMap.entries()).map(([key, rows]) => {
            const pay = rows[0]?.payments ?? null
            const dt = pay?.payment_date ?? rows[0]?.created_at ?? null
            const ts = dt ? new Date(dt).getTime() : 0
            return { key, rows, payment: pay, ts }
          }).filter(g => !!g.payment)

          if (groups.length > 0) {
            groups.sort((a,b) => b.ts - a.ts)
            const latest = groups[0]
            const latestPid = latest.payment?.razorpay_payment_id || latest.payment?.id || null
            // Only open if this specific payment hasn't been acknowledged
            if (latestPid && !hasAcknowledgedThankYou(latestPid)) {
              setThankYouOrders(latest.rows)
              setThankYouPayment(latest.payment)
              setActiveThankYouPid(latestPid)
              if (latest.rows[0]) {
                setSelectedOrderId(latest.rows[0].id)
                setExpandedPayments((p) => ({ ...p, [String(latest.rows[0].payment_id)]: true }))
              }
              setShowThankYou(true)
              setHasShownThankYou(true)
            }
          }
        } catch (e) {
          console.warn('Failed to resolve latest payment for popup', e)
        }
      }
    } catch (e) {
      console.error('Exception loading user orders', e)
    } finally {
      setLoadingUserOrders(false)
    }
  }

  const downloadSelected = () => {
    const first = userOrders.find(o => o.id === selectedOrderId)
    if (!first) {
      alert('Please select an order to open its form')
      return
    }
    let t: string | null = null
    if (first.service_pricing_key) {
      const mappedFromDisplay = getPricingToForm(first.service_pricing_key as string)
      t = mappedFromDisplay ?? first.service_pricing_key
    }
    if (!t) {
      t = first.type ?? (first.payments ? first.payments.type ?? null : null)
    }
    if (!t) {
      const candidate = resolveOrderTypeKey(first)
      if (candidate && !typeLabelFromKey(candidate)) {
        const mapped = getPricingToForm(candidate)
        if (mapped) t = mapped
      }
      if (!t && candidate && typeLabelFromKey(candidate)) {
        t = candidate
      }
    }
    if (!t) {
      alert('Selected order does not have an associated form type')
      return
    }
    if (t && !typeLabelFromKey(t)) {
      const mappedDirect = getPricingToForm(t)
      if (mappedDirect) t = mappedDirect
    }
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const pk = first.service_pricing_key ? String(first.service_pricing_key) : ''
      const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ''}type=${encodeURIComponent(t)}&order_id=${encodeURIComponent(first.id)}`
      window.open(url, '_blank')
    } catch (e) {
      console.error('Navigation error opening form for order', e)
    }
  }

  const buildFormUrlForOrder = (o: any): string | null => {
    if (!o) return null
    let t: string | null = null
    if (o.service_pricing_key) {
      const mappedFromDisplay = getPricingToForm(String(o.service_pricing_key))
      t = mappedFromDisplay ?? String(o.service_pricing_key)
    }
    if (!t) t = o.type ?? (o.payments ? o.payments.type ?? null : null)
    if (!t) {
      const candidate = resolveOrderTypeKey(o)
      if (candidate && !typeLabelFromKey(candidate)) {
        const mapped = getPricingToForm(candidate)
        if (mapped) t = mapped
      }
      if (!t && candidate && typeLabelFromKey(candidate)) t = candidate
    }
    if (!t) return null
    if (t && !typeLabelFromKey(t)) {
      const mappedDirect = getPricingToForm(t)
      if (mappedDirect) t = mappedDirect
    }
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const pk = o.service_pricing_key ? String(o.service_pricing_key) : ''
    const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ''}type=${encodeURIComponent(t)}&order_id=${encodeURIComponent(o.id)}`
    return url
  }

  const openFormForOrder = (o: any) => {
    const url = buildFormUrlForOrder(o)
    if (!url) {
      alert('Selected order does not have an associated form type')
      return
    }
    window.open(url, '_blank')
  }

  useEffect(() => {
    if (currentTab === 'orders') {
      loadUserOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab])

  // pick up payment_id from query so we can auto-select after redirect
  useEffect(() => {
    const pid = searchParams?.get('payment_id') || null
    if (pid) {
      setHighlightPaymentId(pid)
      setCurrentTab('orders')
      // Only tentatively open if not acknowledged; final gating happens in loadUserOrders
      try {
        const key = `shown_thankyou_pay_${pid}`
        const already = typeof window !== 'undefined' ? localStorage.getItem(key) : null
        if (!already && !hasShownThankYou) setShowThankYou(true)
      } catch { /* ignore */ }
    }
  }, [searchParams])

  useEffect(() => {
    if (currentTab !== 'orders') return
    if (loadingUserOrders) return
    loadUserOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightPaymentId, authChecked])
  const orders = [
    {
      id: "TRX-10342",
      title: "Trademark Registration",
      status: "In Review",
      placedAt: "2025-02-11",
      total: "₹ 18,500",
      details: {
        items: ["Trademark search (Class 25)", "Drafting & filing", "Government fees"],
        form: {
          fields: [
            { label: "Applicant Name", value: "Acme Clothing Co." },
            { label: "Mark Name", value: "ACME FIT" },
            { label: "Nice Classes", value: "25" },
            { label: "Use in Commerce", value: "Yes (since 2022-03-10)" },
          ],
          attachments: ["logo_mark.png", "specimen_use.pdf"],
        },
        timeline: [
          { label: "Order placed", date: "2025-02-11" },
          { label: "Attorney assigned", date: "2025-02-12" },
          { label: "Form review", date: "2025-02-13" },
        ],
      },
    },
    {
      id: "PSA-98761",
      title: "Patent Search & Analysis",
      status: "Completed",
      placedAt: "2024-12-03",
      total: "₹ 42,000",
      details: {
        items: ["Quick knockout search", "Prior art matrix", "Patentability opinion"],
        form: {
          fields: [
            { label: "Inventor", value: "John Doe" },
            { label: "Field", value: "IoT Sensors" },
            { label: "Jurisdictions", value: "IN, US" },
          ],
        },
        timeline: [
          { label: "Order placed", date: "2024-12-03" },
          { label: "Search completed", date: "2024-12-07" },
          { label: "Opinion delivered", date: "2024-12-09" },
        ],
      },
    },
  ] as const

  useEffect(() => {
    let active = true
    async function init() {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting session:", error.message)
        setAuthChecked(true)
        setLoading(false)
        return
      }
      const email = data.session?.user?.email ?? null
      if (!active) return
      setSessionEmail(email)

      const userId = data.session?.user?.id ?? null
      setUserId(userId)

      if (email && userId) {
        // 1) Try fetch by id
        let prof: Profile | null = null
        const { data: byId, error: errById } = await supabase
          .from("users")
          .select("id, email, first_name, last_name, company, phone, address, city, state, country")
          .eq("id", userId)
          .maybeSingle()

        if (errById) {
          console.error("Failed to fetch profile by id:", errById.message)
        } else if (byId) {
          prof = byId
        }

        // 2) Fallback to fetch by email if nothing by id
        if (!prof) {
          const { data: byEmail, error: errByEmail } = await supabase
            .from("users")
            .select("id, email, first_name, last_name, company, phone, address, city, state, country")
            .eq("email", email)
            .maybeSingle()
          if (errByEmail) {
            console.error("Failed to fetch profile by email:", errByEmail.message)
          } else if (byEmail) {
            prof = byEmail
          }
        }

        if (prof) {
          setProfile(prof)
          setEditProfile(prof)
        } else {
          // If no row exists, initialize with session email
          const initial = { email } as Profile
          setProfile(initial)
          setEditProfile(initial)
        }
      }

      setAuthChecked(true)
      setLoading(false)
    }

    init()
    return () => {
      active = false
    }
  }, [])

  // Signal FocusProvider that the screen is ready to hide the restore overlay
  useEffect(() => {
    if (!loading) {
      try { window.dispatchEvent(new Event('screen:ready')) } catch {}
    }
  }, [loading])

  // Keep auth state in sync while this page is mounted. This prevents transient
  // logout-like behavior when the auth session changes or during client-side
  // navigation; Navbar also listens but having a local listener here makes the
  // page resilient and ensures dependent state (sessionEmail/userId) updates.
  useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const email = session?.user?.email ?? null
      const id = session?.user?.id ?? null
      console.debug('ProfilePage onAuthStateChange', { event: _event, email, id })
      setSessionEmail(email)
      setUserId(id)
      setAuthChecked(true)
    })

    return () => {
      try { listener.subscription.unsubscribe() } catch (e) { /* ignore */ }
    }
  }, [])

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Your Name"
    : "Your Name"

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/")
  }
    async function handleSaveProfile() {
    if (!sessionEmail || !userId) {
      alert("You must be signed in to save your profile.")
      return
    }
    try {
      setSaving(true)
      const payload = {
        id: userId,
        email: sessionEmail,
        first_name: editProfile.first_name || null,
        last_name: editProfile.last_name || null,
        company: editProfile.company || null,
        phone: editProfile.phone || null,
        address: editProfile.address || null,
        city: editProfile.city || null,
        state: editProfile.state || null,
        country: editProfile.country || null,
      }

      // Single upsert keyed by authenticated user's id ensures we either
      // create or update the correct row and avoids multi-row updates.
      const { data, error } = await supabase
        .from("users")
        .upsert(payload, { onConflict: "id" })
        .select(
          "id, email, first_name, last_name, company, phone, address, city, state, country"
        )
        .single()

      if (error) {
        console.error("Failed to save profile:", error.message)
        alert(`Failed to save profile: ${error.message}`)
        return
      }

      // Update local state with the saved values
      setProfile(data)
      setEditProfile(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Profile Dashboard</span>
            </div>
          </div>
          {authChecked && sessionEmail ? (
            <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          ) : null}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading for global FocusProvider to target */}
        <h1 id="page-heading" tabIndex={-1} className="sr-only">Profile</h1>
        {/* State: Loading */}
        {loading && (
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-64 bg-white rounded-xl border"></div>
            <div className="lg:col-span-2 h-64 bg-white rounded-xl border"></div>
          </div>
        )}

        {/* State: Not authenticated */}
        {!loading && authChecked && !sessionEmail && (
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle>You're not signed in</CardTitle>
              <CardDescription>
                Please sign in on the home page to view and manage your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Link href="/" className="inline-flex">
                <Button className="bg-blue-600 hover:bg-blue-700">Go to Home</Button>
              </Link>
              <Link href="/" className="inline-flex">
                <Button variant="outline">Open Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* State: Authenticated Dashboard (new ProfilePanel) */}
        {!loading && sessionEmail && (
          <div className="max-w-3xl mx-auto">
            <ProfilePanel
              profile={editProfile}
              isSaving={saving}
              isAuthenticated={true}
              loading={false}
              onChange={(field, value) => setEditProfile(p => ({ ...p, [field]: value }))}
              onSave={handleSaveProfile}
              onBack={() => router.push('/')}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ProfilePageInner />
    </Suspense>
  )
}