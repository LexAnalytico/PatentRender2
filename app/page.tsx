"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { supabase } from '../lib/supabase';
import { fetchServicePricingRules, computePriceFromRules } from "@/utils/pricing";
import AuthModal from "@/components/AuthModal"; // Adjust path
import { Footer } from "@/components/layout/Footer"
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { PaymentProcessingModal } from "@/components/PaymentProcessingModal";
// TypeScript/React
import { useAuthProfile } from "@/app/useAuthProfile"
import { useAutoRefreshOnFocus } from "@/components/AutoRefocus";



const services = [
  "Patentability Search",
  "Drafting",
  "Patent Application Filing",
  "First Examination Response",
  "Trademark Registration",
  "Trademark Monitoring",
  "Copyright Registration",
  "DMCA Services",
  "Copyright Licensing",
  "Design Registration",
  "Design Search",
  "Design Portfolio",
]

import {
  ChevronLeft,
  ChevronRight,
  Scale,
  Shield,
  Copyright,
  Palette,
  Award,
  Clock,
  ShoppingCart,
  Download,
  ArrowLeft,
  Calculator,
  FileText,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
} from "lucide-react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import CheckoutModal from "@/components/checkout-modal"
import FormClient from "./forms/FormClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs components
import { resolveFormTypeFromOrderLike } from '@/components/utils/resolve-form-type'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
//import type { Session } from "@supabase/supabase-js"



export default function LegalIPWebsite() {

 function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  async function loadOrders() {
    console.log("Fetching orders...");
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
  }

  // 🔄 Refresh when tab regains focus
  useAutoRefreshOnFocus(loadOrders, { runOnMount: true });

  return (
    <div>
      <h1>Orders</h1>
      {orders.length === 0 ? <p>Loading…</p> : (
        <ul>
          {orders.map(o => <li key={o.id}>{o.name}</li>)}
        </ul>
      )}
    </div>
  );
}  
  // Dummy state to trigger rerenders for external form prefill updates
  const [prefillAvailable, setPrefillAvailable] = useState(false)
  const [prefillApplyFn, setPrefillApplyFn] = useState<(() => void) | null>(null)
  // Stable callback passed to FormClient to avoid triggering its effect every render
  const formPrefillHandle = useCallback((info: { available: boolean; apply: () => void }) => {
    setPrefillAvailable(info.available)
    setPrefillApplyFn(() => (info.available ? info.apply : null))
  }, [])

  const FormHeaderWithPrefill = ({ goToOrders, backToServices }: { goToOrders: () => void; backToServices: () => void }) => (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Forms</h1>
        <p className="text-gray-600 text-sm">Fill and save your application details</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={goToOrders}>Back to Orders</Button>
        <Button variant="outline" onClick={backToServices}>Back to Selected Services</Button>
        <Button
          variant="outline"
          onClick={() => { if (prefillAvailable && prefillApplyFn) prefillApplyFn(); }}
          disabled={!prefillAvailable}
          className={`${!prefillAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          Prefill Saved Data
        </Button>
      </div>
    </div>
  )
  const openFormEmbedded = (o: any) => {
    try {
      console.debug('[openFormEmbedded] incoming order', o)
      const t = resolveFormTypeFromOrderLike(o)
      console.debug('[openFormEmbedded] resolved type', t)
      if (!t) { alert('No form available for this order'); return }
      setSelectedFormOrderId(Number(o.id))
      setSelectedFormType(String(t))
      setShowQuotePage(true)
      setQuoteView('forms')
      setShowCheckoutThankYou(false)
    } catch (e) {
      console.error('[openFormEmbedded] error', e)
    }
  }
  const openMultipleFormsEmbedded = (orders: any[]) => {
    if (!orders || orders.length === 0) return
    // build an array of {id, type}
    const mapped = orders.map(o => ({ id: Number(o.id), type: resolveFormTypeFromOrderLike(o) }))
    setEmbeddedMultiForms(mapped)
    // default focus first form
    const first = mapped[0]
    setSelectedFormOrderId(first.id)
    setSelectedFormType(first.type)
    setShowQuotePage(true)
    setQuoteView('forms')
    setShowCheckoutThankYou(false)
    // close any leftover modal state if not already
    try { setIsOpen(false) } catch {}
  }
const openFirstFormEmbedded = () => {
  if (!checkoutOrders || checkoutOrders.length === 0) return
  openFormEmbedded(checkoutOrders[0])
}
  const {
  isAuthenticated,
  displayName,
  wantsCheckout,
  setWantsCheckout,
  handleGoogleLogin,
  handleLogout: hookLogout,
  upsertUserProfileFromSession,
} = useAuthProfile()

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const [currentSlide, setCurrentSlide] = useState(0)
  const [counters, setCounters] = useState({
    patents: 0,
    trademarks: 0,
    copyrights: 0,
    clients: 0,
  })
 
  const [cartItems, setCartItems] = useState<
    Array<{
      id: string
      name: string
      price: number
      category: string
      details?: string
    }>
  >([])
  const [cartLoaded, setCartLoaded] = useState(false)

  // Load cart from localStorage after mount to avoid SSR/client mismatch
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart_items_v1")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setCartItems(parsed)
      }
    } catch (e) {
      console.warn("Failed to load cart from localStorage", e)
    } finally {
      setCartLoaded(true)
    }
  }, [])

  // Save to localStorage on change, but only after initial load
  useEffect(() => {
    if (!cartLoaded) return
    try {
      localStorage.setItem("cart_items_v1", JSON.stringify(cartItems))
    } catch (e) {
      console.warn("Failed to save cart to localStorage", e)
    }
  }, [cartItems, cartLoaded])
   
  const [showQuotePage, setShowQuotePage] = useState(false)
  // Inside the quote page, control which content shows in the main area
  const [quoteView, setQuoteView] = useState<'services' | 'orders' | 'profile' | 'forms'>('services')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [showPassword, setShowPassword] = useState(false)
  //const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showOptionsPanel, setShowOptionsPanel] = useState(false)
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string | null>(null)
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null)
  const [optionsForm, setOptionsForm] = useState({
    applicantTypes: [] as string[],
    niceClasses: [] as string[],
    goodsServices: "",
    goodsServicesCustom: "",
    useType: "",
    firstUseDate: "",
    proofFileNames: [] as string[],
    searchType: "",
  })

 
  const [activeServiceTab, setActiveServiceTab] = useState("patent") // State for active tab
 
   // Auth form state
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
  })

  // Calculator state
  const [calculatorFields, setCalculatorFields] = useState({
    urgency: "standard",
    complexity: "medium",
    additionalServices: false,
    consultationHours: 1,
    // Remove: discount: 0,
  })

  // Service-specific fields state
  const [serviceFields, setServiceFields] = useState({
    // Patent fields
    patentField1: "",
    patentField2: "",
    patentField3: "",
    patentField4: "",
    patentField5: "",

    // Trademark fields
    trademarkField1: "",
    trademarkField2: "",
    trademarkField3: "",
    trademarkField4: "",
    trademarkField5: "",

    // Copyright fields
    copyrightField1: "",
    copyrightField2: "",
    copyrightField3: "",
    copyrightField4: "",
    copyrightField5: "",

    // Design fields
    designField1: "",
    designField2: "",
    designField3: "",
    designField4: "",
    designField5: "",
  })

  const [servicePricing, setServicePricing] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  // Checkout Thank You modal (immediate) to open forms right after payment
  const [showCheckoutThankYou, setShowCheckoutThankYou] = useState(false)
  const [checkoutPayment, setCheckoutPayment] = useState<any | null>(null)
  const [checkoutOrders, setCheckoutOrders] = useState<any[]>([])
  const [embeddedMultiForms, setEmbeddedMultiForms] = useState<{id:number,type:string}[] | null>(null)
  // Cross-form snapshot to enable prefill across multiple forms (Option A implementation)
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<{ type: string; orderId: number | null; values: Record<string,string> } | null>(null)
  // Embedded Orders/Profile state when viewing within the quote view
  const [embeddedOrders, setEmbeddedOrders] = useState<any[]>([])
  const [embeddedOrdersLoading, setEmbeddedOrdersLoading] = useState(false)
  // Derived grouped representation (payment bundle -> orders[])
  const groupedOrders = useMemo(() => {
    if (!embeddedOrders || embeddedOrders.length === 0) return [] as any[]
    const map = new Map<string, any>()
    for (const o of embeddedOrders) {
      const payId = String(o.payment_id || o.paymentId || o.payment?.id || 'single-'+o.id)
      if (!map.has(payId)) {
        map.set(payId, { paymentKey: payId, payment_id: o.payment_id ?? null, created_at: o.created_at, orders: [] as any[] })
      }
      map.get(payId)!.orders.push(o)
    }
    // compute aggregate info
    const bundles = Array.from(map.values()).map(b => {
      const total = b.orders.reduce((sum: number, x: any) => sum + (Number(x.amount) || 0), 0)
      // take earliest created_at among children for stable ordering
      const firstDate = b.orders.reduce((earliest: string | null, x: any) => {
        const d = x.created_at
        if (!d) return earliest
        if (!earliest) return d
        return new Date(d) < new Date(earliest) ? d : earliest
      }, null as string | null)
      return { ...b, totalAmount: total, date: firstDate }
    })
    // sort descending by date
    bundles.sort((a,b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    return bundles
  }, [embeddedOrders])
  const [ordersLoadError, setOrdersLoadError] = useState<string | null>(null)
  // Embedded Forms selection state
  const [selectedFormOrderId, setSelectedFormOrderId] = useState<number | null>(null)
  const [selectedFormType, setSelectedFormType] = useState<string | null>(null)
  const [embeddedProfile, setEmbeddedProfile] = useState<any | null>(null)
  const [embeddedProfileSaving, setEmbeddedProfileSaving] = useState(false)

  // (Removed local resolveFormTypeFromOrderLike; using shared util for consistency)

  // Fallback mapping if services table lookup by name is unavailable
  const serviceIdByName: Record<string, number> = {
    "Patentability Search": 1,
    "Drafting": 2,
    "Patent Application Filing": 3,
    "First Examination Response": 4,
  }

  // Track which view should show first when opening dashboard (default services; can be overridden to orders)
  const [initialQuoteView, setInitialQuoteView] = useState<'services' | 'orders' | 'profile' | 'forms'>('services')
  useEffect(() => {
    if (showQuotePage) setQuoteView(initialQuoteView)
  }, [showQuotePage, initialQuoteView])

  // Reload key to force orders refresh when navigating back from forms or other contexts
  const [ordersReloadKey, setOrdersReloadKey] = useState(0)
  // Track explicit Force Reload trigger timing & attempts to allow a short burst of re-queries
  const lastForceReloadAtRef = useRef<number | null>(null)
  const forceReloadAttemptsRef = useRef(0)
  // Track last payment id for which we performed an assisted reload to avoid duplicate triggers
  const lastThankYouPidRef = useRef<string | number | null>(null)

  // Debug: log every reload key change (helps confirm button clicks wiring)
  useEffect(() => {
    console.debug('[Orders][reloadKey] changed', { ordersReloadKey, quoteView, lastForceReloadAt: lastForceReloadAtRef.current })
  }, [ordersReloadKey, quoteView])

  // Track when we are prefetching so we can show fresh data immediately after navigation
  const [ordersPrefetching, setOrdersPrefetching] = useState(false)
  const ordersPrefetchingRef = useRef(false)

  // Lightweight core fetch used for pre-navigation prefetch (duplicated subset of loadOrders logic)
  const fetchOrdersCore = useCallback(async (): Promise<any[]> => {
    try {
      // Resolve user id with small retries (mirrors logic inside effect)
      const getUserId = async () => {
        const { data: sessionRes } = await supabase.auth.getSession()
        return sessionRes?.session?.user?.id || null
      }
      let userId = await getUserId()
      if (!userId) { await new Promise(r => setTimeout(r, 120)); userId = await getUserId() }
      if (!userId) { await new Promise(r => setTimeout(r, 180)); userId = await getUserId() }
      if (!userId) {
        console.debug('[Orders][prefetch] no user session; abort prefetch')
        setOrdersLoadError('You are not signed in. Please sign in to view orders.')
        return []
      }

      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, service_id, category_id, payment_id, type, amount')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Orders][prefetch] base orders fetch failed', error)
        setOrdersLoadError('Failed to load orders. Please retry.')
        return []
      }
      const ordersRaw = (data as any[]) ?? []
      if (ordersRaw.length === 0) {
        console.debug('[Orders][prefetch] zero orders')
        setOrdersLoadError(null)
        return []
      }

      const serviceIds = Array.from(new Set(ordersRaw.map(o => o.service_id).filter(Boolean)))
      const categoryIds = Array.from(new Set(ordersRaw.map(o => o.category_id).filter(Boolean)))
      const paymentIds = Array.from(new Set(ordersRaw.map(o => o.payment_id).filter(Boolean)))

      let servicesRes: any = { data: [], error: null }
      let categoriesRes: any = { data: [], error: null }
      let paymentsRes: any = { data: [], error: null }
      try {
        ;[servicesRes, categoriesRes, paymentsRes] = await Promise.all([
          serviceIds.length ? supabase.from('services').select('id, name').in('id', serviceIds) : Promise.resolve({ data: [], error: null }),
          categoryIds.length ? supabase.from('categories').select('id, name').in('id', categoryIds) : Promise.resolve({ data: [], error: null }),
          paymentIds.length ? supabase.from('payments').select('id, razorpay_payment_id, total_amount, payment_status, payment_date, service_id, type').in('id', paymentIds) : Promise.resolve({ data: [], error: null }),
        ])
      } catch (joinErr) {
        console.warn('[Orders][prefetch] ancillary lookups failed', joinErr)
      }

      const servicesMap = new Map((servicesRes?.data ?? []).map((s: any) => [s.id, s]))
      const categoriesMap = new Map((categoriesRes?.data ?? []).map((c: any) => [c.id, c]))
      const paymentsMap = new Map((paymentsRes?.data ?? []).map((p: any) => [p.id, p]))

      const merged = ordersRaw.map((o: any) => ({
        ...o,
        services: servicesMap.get(o.service_id) ?? null,
        categories: categoriesMap.get(o.category_id) ?? null,
        payments: paymentsMap.get(o.payment_id) ?? null,
      }))
      return merged
    } catch (e) {
      console.error('[Orders][prefetch] unexpected error', e)
      setOrdersLoadError('Unexpected error loading orders.')
      return []
    }
  }, [supabase])

  // Centralized navigation back to Orders view with prefetch before rendering Orders screen
  const goToOrders = () => {
    // If already in orders view, keep legacy behavior (manual refresh by reload key)
    if (quoteView === 'orders') {
      // Single refresh only (removed second bump to prevent double reload)
      setOrdersReloadKey(k => k + 1)
      return
    }

    setShowQuotePage(true)
    setShowCheckoutThankYou(false)
    setIsOpen(false)
    setSelectedFormOrderId(null)
    setSelectedFormType(null)

    // Begin prefetch
    setOrdersPrefetching(true)
    ordersPrefetchingRef.current = true
    setEmbeddedOrdersLoading(true)
    // Do NOT clear existing embeddedOrders here; we want to retain if already present
    fetchOrdersCore()
      .then((merged) => {
        if (ordersPrefetchingRef.current) {
          setEmbeddedOrders(merged)
          setEmbeddedOrdersLoading(false)
        }
      })
      .catch(() => {
        if (ordersPrefetchingRef.current) {
          setEmbeddedOrders([])
          setEmbeddedOrdersLoading(false)
        }
      })
      .finally(() => {
        ordersPrefetchingRef.current = false
        setOrdersPrefetching(false)
        setQuoteView('orders')
        // Do NOT bump reload key here; the prefetch provided data or empty state already
      })

    // Fallback: if prefetch takes too long, navigate anyway after 900ms
    setTimeout(() => {
      if (ordersPrefetchingRef.current) {
        console.debug('[Orders][prefetch] timeout fallback navigation')
        ordersPrefetchingRef.current = false
        setOrdersPrefetching(false)
        setQuoteView('orders')
        setEmbeddedOrdersLoading(false)
        // Avoid triggering load effect by leaving reloadKey untouched; effect will run but detect existing loading state
      }
    }, 900)
  }




  // Assisted reload: run a single opportunistic extra reload shortly after a recent payment
  useEffect(() => {
    if (quoteView !== 'orders') return
    const paymentId = (checkoutPayment as any)?.id || (checkoutPayment as any)?.razorpay_payment_id || null
    const createdAtMs = checkoutPayment?.created_at ? Date.parse(checkoutPayment.created_at) : null
    const isRecent = createdAtMs ? (Date.now() - createdAtMs < 120000) : false
    if (paymentId && isRecent) {
      // Trigger a gentle assisted reload if we currently have zero orders showing (possible race)
      if (embeddedOrders.length === 0) {
        console.debug('[Orders][assist] recent payment detected, scheduling assisted reload')
        const t = setTimeout(() => {
          setOrdersReloadKey(k => k + 1)
        }, 900)
        return () => clearTimeout(t)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteView, checkoutPayment, embeddedOrders.length])

  // Track last known authenticated user id to survive focus loss / session race (top-level)
  const lastKnownUserIdRef = useRef<string | null>(null)
  // Flag that a previous orders load aborted due to missing user; triggers focus recovery reload
  const ordersAbortedNoUserRef = useRef<boolean>(false)

  // Periodic session refresh (top-level)
  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      try {
        const { data: s } = await supabase.auth.getSession()
        const uid = s?.session?.user?.id || null
        if (!cancelled && uid) lastKnownUserIdRef.current = uid
      } catch {}
    }
    refresh()
    const iv = setInterval(refresh, 3000)
    return () => { cancelled = true; clearInterval(iv) }
  }, [])

  // Focus / visibility recovery
  useEffect(() => {
    if (quoteView !== 'orders') return
    const onFocus = () => {
      if (quoteView === 'orders') {
        if (embeddedOrders.length === 0 || ordersAbortedNoUserRef.current) {
          console.debug('[Orders][focus-recover] scheduling reload', { empty: embeddedOrders.length === 0, abortedNoUser: ordersAbortedNoUserRef.current })
          ordersAbortedNoUserRef.current = false
          setOrdersReloadKey(k => k + 1)
        }
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && quoteView === 'orders') {
        if (embeddedOrders.length === 0 || ordersAbortedNoUserRef.current) {
          console.debug('[Orders][visibility-recover] scheduling reload', { empty: embeddedOrders.length === 0, abortedNoUser: ordersAbortedNoUserRef.current })
          ordersAbortedNoUserRef.current = false
          setOrdersReloadKey(k => k + 1)
        }
      }
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [quoteView, embeddedOrders.length])

  // Load embedded Orders list when switching to Orders inside the quote page
  useEffect(() => {
  let active = true

  // Safety watchdog: if we enter Orders view and loading doesn't finish in 4s, trigger one retry reload
  let watchdog: any = null
  let loadStart = Date.now()
  let stuckTimer: any = null

  const loadOrders = async () => {
    console.debug('[Orders][load] start invocation', { quoteView, reloadKey: ordersReloadKey })
    loadStart = Date.now()
    // If we already have rows (from prefetch) and this invocation is due solely to same reload key or navigation, skip full clear to reduce flicker
    const hadExisting = embeddedOrders.length > 0
    if (!hadExisting) {
      setEmbeddedOrders([]) // show skeleton only when we had nothing
      setEmbeddedOrdersLoading(true)
    } else {
      setEmbeddedOrdersLoading(true) // show inline spinner elsewhere if UI supports it
    }
    setOrdersLoadError(null)
    try {
      console.log("[Orders] Loading start")

      // small retry for session readiness (handles the Cmd+Tab back race)
      const getUserId = async () => {
        const { data: sessionRes } = await supabase.auth.getSession()
        const uid = sessionRes?.session?.user?.id || null
        if (uid) lastKnownUserIdRef.current = uid
        return uid
      }
      let userId = await getUserId()
      if (!userId) {
        await new Promise(r => setTimeout(r, 150))
        userId = await getUserId()
      }
      if (!userId) {
        // one more quick retry specifically helps the Cmd/Ctrl+Tab edge case
        await new Promise(r => setTimeout(r, 200))
        userId = await getUserId()
        if (!userId) console.debug('[Orders][load] third userId fetch empty')
      }
      // Fallback to last known id if session race after focus loss
      if (!userId && lastKnownUserIdRef.current) {
        userId = lastKnownUserIdRef.current
        console.debug('[Orders][load] using lastKnownUserIdRef fallback after session miss')
      }
      // Additional fallback chain: lastKnownUserIdRef -> checkoutPayment.user_id -> persistedOrders[0].user_id
      if (!userId && lastKnownUserIdRef.current) {
        userId = lastKnownUserIdRef.current
        console.debug('[Orders][load] fallback userId from lastKnownUserIdRef')
      }
      if (!userId && checkoutPayment?.user_id) {
        userId = checkoutPayment.user_id
        console.debug('[Orders][load] fallback userId from checkoutPayment')
      }
      if (!userId && checkoutOrders.length > 0 && checkoutOrders[0]?.user_id) {
        userId = checkoutOrders[0].user_id
        console.debug('[Orders][load] fallback userId from checkoutOrders[0]')
      }
      if (!userId) {
        console.log("[Orders] No user session; abort")
        if (active) {
          setEmbeddedOrders([])
          setOrdersLoadError('You are not signed in. Please sign in to view orders.')
          setEmbeddedOrdersLoading(false)
          ordersAbortedNoUserRef.current = true
        }
        console.debug('[Orders][load] early-return: no user session')
        return
      }
    

      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, service_id, category_id, payment_id, type, amount")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[Orders] Failed to load orders", error)
        if (active) {
          setEmbeddedOrders([])
          setOrdersLoadError('Failed to load orders. Please retry.')
          setEmbeddedOrdersLoading(false)
        }
        console.debug('[Orders][load] early-return: query error')
        return
      }
    
  const ordersRaw = (data as any[]) ?? []
  console.debug('[Orders][load] orders fetched', { count: ordersRaw.length })
      if (ordersRaw.length === 0) {
        console.log("[Orders] Zero orders returned")
        // If this was initiated by a recent Force Reload, attempt a short burst of up to 3 rapid retries
        if (lastForceReloadAtRef.current && Date.now() - lastForceReloadAtRef.current < 5000) {
          if (forceReloadAttemptsRef.current < 3) {
            forceReloadAttemptsRef.current += 1
            const scheduledAttempt = forceReloadAttemptsRef.current
            console.debug('[Orders][force-reload] scheduling follow-up attempt', { attempt: scheduledAttempt })
            setTimeout(() => {
              if (!active) return
              // Only re-trigger if we are still in orders view and list is still empty
              if (quoteView === 'orders' && embeddedOrders.length === 0) {
                console.debug('[Orders][force-reload] triggering follow-up reload', { attempt: scheduledAttempt })
                setOrdersReloadKey(k => k + 1)
              }
            }, 650 + 250 * forceReloadAttemptsRef.current) // slight backoff
          } else {
            console.debug('[Orders][force-reload] max attempts reached')
          }
        }
        // Optional: probe order-status API if we have a recent payment awaiting materialization
        try {
          const recentPaymentId = checkoutPayment?.razorpay_order_id || checkoutPayment?.id || null
          if (recentPaymentId) {
            console.debug('[Orders][probe] polling /api/order-status for empty list insight')
            fetch(`/api/order-status?razorpay_order_id=${encodeURIComponent(recentPaymentId)}`, { cache: 'no-store' })
              .then(r => r.json())
              .then(j => console.debug('[Orders][probe] status response', j))
              .catch(e => console.debug('[Orders][probe] status error', e))
          }
        } catch {}
        if (active) {
          setEmbeddedOrders([])
          setOrdersLoadError(null) // empty but not error
          setEmbeddedOrdersLoading(false)
        }
        console.debug('[Orders][load] early-return: zero orders')
        return
      }

      const serviceIds = Array.from(new Set(ordersRaw.map((o) => o.service_id).filter(Boolean)))
      const categoryIds = Array.from(new Set(ordersRaw.map((o) => o.category_id).filter(Boolean)))
      const paymentIds = Array.from(new Set(ordersRaw.map((o) => o.payment_id).filter(Boolean)))

      let servicesRes: any = { data: [], error: null }
      let categoriesRes: any = { data: [], error: null }
      let paymentsRes: any = { data: [], error: null }
      try {
        ;[servicesRes, categoriesRes, paymentsRes] = await Promise.all([
          serviceIds.length
            ? supabase.from("services").select("id, name").in("id", serviceIds)
            : Promise.resolve({ data: [], error: null }),
          categoryIds.length
            ? supabase.from("categories").select("id, name").in("id", categoryIds)
            : Promise.resolve({ data: [], error: null }),
          paymentIds.length
            ? supabase.from("payments").select("id, razorpay_payment_id, total_amount, payment_status, payment_date, service_id, type").in("id", paymentIds)
            : Promise.resolve({ data: [], error: null }),
        ])
      } catch (joinErr) {
        console.warn('[Orders] Ancillary lookups failed, continuing with base orders only', joinErr)
      }

      const servicesMap = new Map((servicesRes?.data ?? []).map((s: any) => [s.id, s]))
      const categoriesMap = new Map((categoriesRes?.data ?? []).map((c: any) => [c.id, c]))
      const paymentsMap = new Map((paymentsRes?.data ?? []).map((p: any) => [p.id, p]))

      const merged = ordersRaw.map((o: any) => ({
        ...o,
        services: servicesMap.get(o.service_id) ?? null,
        categories: categoriesMap.get(o.category_id) ?? null,
        payments: paymentsMap.get(o.payment_id) ?? null,
      }))

      if (active) {
        setEmbeddedOrders(merged)
        setOrdersLoadError(null)
      }
      console.log("[Orders] Loaded", merged.length)
    } catch (e) {
      console.error("Exception loading embedded orders", e)
      if (active) {
        setEmbeddedOrders([])
        setOrdersLoadError('Unexpected error loading orders.')
        setEmbeddedOrdersLoading(false)
      }
      console.debug('[Orders][load] early-return: exception path')
    } finally {
      if (active) {
        setEmbeddedOrdersLoading(false)
        console.log("[Orders] Loading end")
      }
    }
  }

  // TypeScript / TSX
let rafId: number | null = null

if (quoteView === "orders") {
  // If we already have prefetched data (non-empty & not loading), skip triggering another load
  if (embeddedOrders.length > 0 && !embeddedOrdersLoading) {
    console.debug('[Orders][prefetch] using prefetched data; skipping automatic load')
  } else {
    // Defer initial fetch to the next frame to avoid focus/session race
    rafId = window.requestAnimationFrame(() => {
      if (active) loadOrders()
    })
    watchdog = setTimeout(() => {
      if (active && embeddedOrdersLoading) {
        console.warn('[Orders] Watchdog: still loading after timeout, forcing retry')
        loadOrders()
      }
    }, 4000)
    stuckTimer = setTimeout(() => {
      if (active && embeddedOrdersLoading && Date.now() - loadStart > 6500) {
        console.warn('[Orders] Stuck load detected; surfacing error state')
        setEmbeddedOrdersLoading(false)
        setOrdersLoadError('Orders request appears stuck. Please Retry.')
      }
    }, 6500)
  }
  }

  return () => {
    active = false
    if (rafId != null) window.cancelAnimationFrame(rafId)
    if (watchdog) clearTimeout(watchdog)
    if (stuckTimer) clearTimeout(stuckTimer)
  }

  }, [quoteView, ordersReloadKey])


  // Load embedded Profile when switching to Profile inside the quote page
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const sess = await supabase.auth.getSession()
        const email = (sess as any)?.data?.session?.user?.email ?? null
        const userId = (sess as any)?.data?.session?.user?.id ?? null
        if (!email || !userId) { setEmbeddedProfile(null); return }
        // Fetch profile row from users table by id, fallback by email
        let prof: any | null = null
        const { data: byId, error: errById } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, company, phone, address, city, state, country')
          .eq('id', userId)
          .maybeSingle()
        if (!errById && byId) prof = byId
        if (!prof) {
          const { data: byEmail } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, company, phone, address, city, state, country')
            .eq('email', email)
            .maybeSingle()
          if (byEmail) prof = byEmail
        }
        if (!prof) prof = { id: userId, email }
        setEmbeddedProfile(prof)
      } catch (e) {
        console.error('Failed to load embedded profile', e)
        setEmbeddedProfile(null)
      }
    }
    if (quoteView === 'profile') loadProfile()
  }, [quoteView])

  const saveEmbeddedProfile = async () => {
    if (!embeddedProfile) return
    try {
      setEmbeddedProfileSaving(true)
      const payload = {
        id: embeddedProfile.id ?? null,
        email: embeddedProfile.email ?? null,
        first_name: embeddedProfile.first_name || null,
        last_name: embeddedProfile.last_name || null,
        company: embeddedProfile.company || null,
        phone: embeddedProfile.phone || null,
        address: embeddedProfile.address || null,
        city: embeddedProfile.city || null,
        state: embeddedProfile.state || null,
        country: embeddedProfile.country || null,
      }
      const { data, error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'id' })
        .select('id, email, first_name, last_name, company, phone, address, city, state, country')
        .single()
      if (error) {
        console.error('Failed to save embedded profile', error)
        alert(`Failed to save profile: ${error.message}`)
        return
      }
      setEmbeddedProfile(data)
    } finally {
      setEmbeddedProfileSaving(false)
    }
  }

 
useEffect(() => {
    async function fetchPricing() {
      const { data, error } = await supabase
        .from('patentrender')
        .select(
          'patent_search, patent_application, patent_portfolio, first_examination, trademark_search, trademark_registration, trademark_monitoring, copyright_registration, dmca_services, copyright_licensing, design_registration, design_search, design_portfolio'
        )
        .maybeSingle();
           
      if (error) {
        console.error("Error fetching pricing:", error)
      } else if (data) {
        const formattedPricing: Record<string, number> = {
          "Patentability Search": data.patent_search,
          "Drafting": data.patent_application,
          "Patent Application Filing": data.patent_portfolio,
          "First Examination Response": data.first_examination,  
          "Trademark Search": data.trademark_search,
          "Trademark Registration": data.trademark_registration,
          "Trademark Monitoring": data.trademark_monitoring,
          "Copyright Registration": data.copyright_registration,
          "DMCA Services": data.dmca_services,
          "Copyright Licensing": data.copyright_licensing,
          "Design Registration": data.design_registration,
          "Design Search": data.design_search,
          "Design Portfolio": data.design_portfolio,
        }
        setServicePricing(formattedPricing)
      } else {
        console.log("No pricing data found in the database. Please add a row to the 'patentrender' table.")
      }

      setLoading(false)
    }

    fetchPricing()
       
  }, [])


  const defaultBannerSlides = [
    {
      title: "Protect Your Intellectual Property",
      description:
        "Comprehensive IP services to safeguard your innovations and creative works with expert legal guidance",
      image: "/placeholder.svg?height=400&width=600&text=IP+Protection+Services",
    },
    {
      title: "Patent Registration Made Simple",
      description: "Expert guidance through the complex patent application process with guaranteed results",
      image: "/placeholder.svg?height=400&width=600&text=Patent+Application+Filing",
    },
    {
      title: "Trademark Your Brand Identity",
      description: "Secure your brand with professional trademark services and comprehensive protection strategies",
      image: "/placeholder.svg?height=400&width=600&text=Trademark+Registration",
    },
    {
      title: "Copyright Protection Services",
      description: "Protect your creative works with comprehensive copyright solutions and enforcement support",
      image: "/placeholder.svg?height=400&width=600&text=Copyright+Protection",
    },
  ]
  const [bannerSlides, setBannerSlides] = useState(defaultBannerSlides)

  useEffect(() => {
    let cancelled = false
    const loadBanners = async () => {
      try {
        const res = await fetch('/api/banner-images', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const images: Array<{ url: string; filename: string }> = Array.isArray(json.images) ? json.images : []
        if (!cancelled) {
          // Keep original titles/descriptions; only replace the images for the first N slides
          const slides = defaultBannerSlides.map((s) => ({ ...s }))
          const n = Math.min(images.length, slides.length)
          for (let i = 0; i < n; i++) {
            slides[i].image = images[i].url
          }
          setBannerSlides(slides as any)
          setCurrentSlide(0)
        }
      } catch {}
    }
    loadBanners()
    return () => { cancelled = true }
  }, [])

const patentServices = [
    {
      title: "Patentability Search",
      description: "Comprehensive prior art search and patentability analysis",
      icon: <Scale className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Drafting",
      description: "Professional patent application preparation and filing",
      icon: <Shield className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Patent Application Filing",
      description: "Strategic management of your patent portfolio",
      icon: <Award className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "First Examination Response",
      description: "desctiption tbd",
      icon: <Award className="h-8 w-8 text-blue-600" />,
    },  
  ]

  const trademarkServices = [
    {
      title: "Trademark Search",
      description: "Comprehensive trademark availability search",
      icon: <Scale className="h-8 w-8 text-green-600" />,
    },
    {
      title: "Trademark Registration",
      description: "Complete trademark application and registration process",
      icon: <Shield className="h-8 w-8 text-green-600" />,
    },
    {
      title: "Trademark Monitoring",
      description: "Ongoing monitoring and protection services",
      icon: <Clock className="h-8 w-8 text-green-600" />,
    },
  ]

  const copyrightServices = [
    {
      title: "Copyright Registration",
      description: "Secure copyright protection for your creative works",
      icon: <Copyright className="h-8 w-8 text-purple-600" />,
    },
    {
      title: "DMCA Services",
      description: "Digital Millennium Copyright Act compliance and enforcement",
      icon: <Shield className="h-8 w-8 text-purple-600" />,
    },
    {
      title: "Copyright Licensing",
      description: "Strategic licensing agreements for your copyrighted works",
      icon: <Award className="h-8 w-8 text-purple-600" />,
    },
  ]

  const designServices = [
    {
      title: "Design Registration",
      description: "Protect your unique designs and visual elements",
      icon: <Palette className="h-8 w-8 text-orange-600" />,
    },
    {
      title: "Design Search",
      description: "Comprehensive design prior art search services",
      icon: <Scale className="h-8 w-8 text-orange-600" />,
    },
    {
      title: "Design Portfolio",
      description: "Strategic design portfolio development and management",
      icon: <Award className="h-8 w-8 text-orange-600" />,
    },
  ]

  const milestones = [
    { label: "Patents Filed", value: 2500, key: "patents" },
    { label: "Trademarks Registered", value: 1800, key: "trademarks" },
    { label: "Copyrights Protected", value: 3200, key: "copyrights" },
    { label: "Happy Clients", value: 950, key: "clients" },
  ]

  const reviews = [
    {
      quote: "LegalIP Pro streamlined our filing and kept us informed at every step. Outstanding experience.",
      name: "Anita S.",
      role: "Founder, HealthTech Co.",
      rating: 5,
    },
    {
      quote: "Clear guidance and timely updates helped us avoid costly delays. Highly recommended.",
      name: "Rahul M.",
      role: "CTO, IoT Startup",
      rating: 5,
    },
    {
      quote: "Excellent trademark strategy with practical advice we could implement quickly.",
      name: "Priya K.",
      role: "Brand Manager, D2C",
      rating: 4,
    },
  ]
  const [reviewIndex, setReviewIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(1, bannerSlides.length))
    }, 5000)
    return () => clearInterval(interval)
  }, [bannerSlides.length])
  useEffect(() => {
    const id = setInterval(() => setReviewIndex((i) => (i + 1) % reviews.length), 4000)
    return () => clearInterval(id)
  }, [reviews.length])

  useEffect(() => {
    const animateCounters = () => {
      milestones.forEach((milestone) => {
        let current = 0
        const increment = milestone.value / 100
        const timer = setInterval(() => {
          current += increment
          if (current >= milestone.value) {
            current = milestone.value
            clearInterval(timer)
          }
          setCounters((prev) => ({
            ...prev,
            [milestone.key]: Math.floor(current),
          }))
        }, 20)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 },
    )

    const counterSection = document.getElementById("milestones")
    if (counterSection) {
      observer.observe(counterSection)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }
  
  const addToCart = (serviceName: string, category: string) => {
    const price = servicePricing[serviceName as keyof typeof servicePricing] || 0
    const newItem = {
      id: `${serviceName}-${Date.now()}`,
  name: serviceName,
  // attempt to map human-readable service name to numeric service_id
  service_id: serviceIdByName[serviceName as keyof typeof serviceIdByName] ?? null,
      price,
      category,
    }
  console.debug('addToCart - newItem', newItem)
    setCartItems((prev) => [...prev, newItem])
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0)
  }

  const clearCart = () => {
  setCartItems([])
  try { localStorage.removeItem("cart_items_v1") } catch {}
  }
  
  // When user clicks a Navbar service link (/#section) from the Selected Services view,
  // auto-close the quote page and scroll to the requested section on the main page.
  useEffect(() => {
    // Handle direct hash on load (one-time), then strip it to avoid problems
    const handleInitialHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const targets = new Set(['#patent-services', '#trademark-services', '#copyright-services', '#design-services'])
      if (hash && targets.has(hash)) {
        setShowQuotePage(false)
        setTimeout(() => {
          const id = hash.slice(1)
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
          // Clean URL to remove the hash
          try {
            const url = new URL(window.location.href)
            url.hash = ''
            window.history.replaceState({}, '', url.toString())
          } catch {}
        }, 80)
        return
      }
      // If we have a stray hash (e.g., from OAuth tokens or just '#'), strip it after auth initializes
      if (hash && !targets.has(hash)) {
        setTimeout(() => {
          try {
            const url = new URL(window.location.href)
            url.hash = ''
            window.history.replaceState({}, '', url.toString())
          } catch {}
        }, 300)
      }
    }

    const handleGoSection = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id?: string }
      const id = detail?.id
      if (!id) return
      setShowQuotePage(false)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 80)
    }

    handleInitialHash()
    window.addEventListener('nav:go-section', handleGoSection as EventListener)
    return () => window.removeEventListener('nav:go-section', handleGoSection as EventListener)
  }, [])

  // Options panel helpers
  const openOptionsForService = (serviceName: string, category: string) => {
    setSelectedServiceTitle(serviceName)
    setSelectedServiceCategory(category)
    setShowOptionsPanel(true)
  }

  const resetOptionsForm = () => {
    setOptionsForm({
      applicantTypes: [],
      niceClasses: [],
      goodsServices: "",
      goodsServicesCustom: "",
      useType: "",
      firstUseDate: "",
      proofFileNames: [],
      searchType: "",
    })
  }

  const closeOptionsPanel = () => {
    setShowOptionsPanel(false)
    setSelectedServiceTitle(null)
    setSelectedServiceCategory(null)
    resetOptionsForm()
  }

  // Live fee preview state and pricing rules
  const [pricingRules, setPricingRules] = useState<any[] | null>(null)
  const [preview, setPreview] = useState({ total: 0, professional: 0, government: 0 })
  const [applicantPrices, setApplicantPrices] = useState<{ individual?: number; others?: number }>({})
  const [ferPrices, setFerPrices] = useState<{
    base_fee?: number
    response_due_anytime_after_15_days?: number
    response_due_within_11_15_days?: number
    response_due_within_4_10_days?: number
  }>({})
 
  // Load pricing rules when modal opens
  useEffect(() => {
    const loadRules = async () => {
      if (!showOptionsPanel || !selectedServiceTitle) {
        setPricingRules(null)
        return
      }
      let serviceId: number | null = null
      const { data: svc, error: svcErr } = await supabase
        .from("services")
        .select("id")
        .eq("name", selectedServiceTitle)
        .maybeSingle()
      if (!svcErr && svc?.id) serviceId = svc.id
      else {
        const mapped = serviceIdByName[selectedServiceTitle as keyof typeof serviceIdByName]
        serviceId = typeof mapped === "number" ? mapped : null
      }
      if (serviceId == null) {
        setPricingRules(null)
        return
      }
      try {
        const rules = await fetchServicePricingRules(serviceId)
        // Debug: log rules meta when loading
        console.log("[Rules] Loaded", {
          service: selectedServiceTitle,
          serviceId,
          count: Array.isArray(rules) ? rules.length : 0,
          appTypes: Array.isArray(rules) ? Array.from(new Set(rules.map((r: any) => r.application_type))) : [],
          sampleKeys: Array.isArray(rules) ? Array.from(new Set(rules.slice(0, 12).map((r: any) => r.key))) : [],
        })
        setPricingRules(rules as any)
      } catch (e) {
        console.error("Failed to load pricing rules:", e)
        setPricingRules(null)
      }
    }
    loadRules()
  }, [showOptionsPanel, selectedServiceTitle])
  
  // Recompute fee preview when selections change
  useEffect(() => {
    if (!pricingRules || !selectedServiceTitle) {
      setPreview({ total: 0, professional: 0, government: 0 })
      return
    }
    let applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"

    if (selectedServiceTitle === "Patent Application Filing" && (optionsForm.searchType === "individual" || optionsForm.searchType === "others")) {
      applicationType = optionsForm.searchType as any
    }

    const sel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: {
        dropdown: optionsForm.goodsServices || undefined,
        customText: optionsForm.goodsServicesCustom || undefined,
      },
      searchType: optionsForm.searchType || undefined,
      priorUse: {
        used: optionsForm.useType === "yes",
        firstUseDate: optionsForm.firstUseDate || undefined,
        proofFiles: optionsForm.proofFileNames,
      },
      option1: true,
    } as const

    const total = computePriceFromRules(pricingRules as any, sel as any)
    const profRule = (pricingRules as any).find(
      (r: any) => r.application_type === applicationType && r.key === "professional_fee"
    )
    const professional = profRule ? Number(profRule.amount) : 0
    const government = Math.max(0, total - professional)

    // Debug: log recompute context
    console.log("[Preview] Recompute", {
      service: selectedServiceTitle,
      applicationType,
      searchType: optionsForm.searchType,
      filingType: optionsForm.goodsServices,
      niceClasses: optionsForm.niceClasses,
      priorUse: optionsForm.useType,
      totals: { total, professional, government },
    })

    setPreview({ total, professional, government })
  }, [pricingRules, optionsForm, selectedServiceTitle])

  // Compute and show prices next to Applicant Type options for Patent Application Filing
  useEffect(() => {
    if (!pricingRules || selectedServiceTitle !== "Patent Application Filing") {
      setApplicantPrices({})
      return
    }

    const filingType = optionsForm.goodsServices && optionsForm.goodsServices !== "0" ? optionsForm.goodsServices : "provisional_filing"
    const baseSel = {
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: { dropdown: filingType },
      searchType: undefined,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any

    const prices: { [k: string]: number } = {}
    try {
      prices.individual = computePriceFromRules(pricingRules as any, { ...baseSel, applicationType: "individual" })
      prices.others = computePriceFromRules(pricingRules as any, { ...baseSel, applicationType: "others" })
    } catch (e) {
      console.error("Failed computing applicant type prices:", e)
    }
    const fallback = servicePricing["Patent Application Filing"] || 0
    if (!prices.individual || prices.individual <= 0) prices.individual = fallback
    if (!prices.others || prices.others <= 0) prices.others = fallback
    setApplicantPrices(prices)
  }, [pricingRules, selectedServiceTitle, optionsForm.goodsServices, optionsForm.niceClasses, optionsForm.useType])

  // Compute and show prices for First Examination Response options
  useEffect(() => {
    if (!pricingRules || selectedServiceTitle !== "First Examination Response") {
      setFerPrices({})
      return
    }

    const applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"

    const baseSel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      searchType: undefined,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any

    const values = [
      "base_fee",
      "response_due_anytime_after_15_days",
      "response_due_within_11_15_days",
      "response_due_within_4_10_days",
    ] as const

    const prices: Record<string, number> = {}
    try {
      for (const v of values) {
        prices[v] = computePriceFromRules(pricingRules as any, { ...baseSel, searchType: v })
      }
    } catch (e) {
      console.error("Failed computing FER prices:", e)
    }
    // Fallback to base service price if computed is zero
    const fallbackFER = servicePricing["First Examination Response"] || 0
    for (const k of Object.keys(prices)) {
      if (!prices[k] || prices[k] <= 0) prices[k] = fallbackFER
    }
    setFerPrices(prices)
  }, [pricingRules, selectedServiceTitle, optionsForm.applicantTypes, optionsForm.niceClasses, optionsForm.useType])

  // Helpers for turnaround pricing display in modal
const formatINR = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
const computeTurnaroundTotal = (turn: "standard" | "expediated" | "rush") => {    
    if (!pricingRules) return 0
     
    const applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"
    const sel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: { dropdown: turn },
      searchType: optionsForm.searchType || undefined,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any
    return computePriceFromRules(pricingRules as any, sel)
  }
 
  const basePrice = computeTurnaroundTotal("standard")
  const expediatedDiff = computeTurnaroundTotal("expediated") //- basePrice
  const rushDiff = computeTurnaroundTotal("rush") //- basePrice  

 
  // Compute price for a given Patentability Search type and turnaround, independent of current selection
  const computePatentSearchPrice = (
    type: "quick" | "full_without_opinion" | "full_with_opinion",
    turn: "standard" | "expediated" | "rush" = "standard"
  ) => {
    if (!pricingRules) return 0

    const applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"

    const sel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: { dropdown: turn },
      searchType: type,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any

    return computePriceFromRules(pricingRules as any, sel)
  }

const basePricePS = computePatentSearchPrice("quick")
const DiffWithoutPS = computePatentSearchPrice("full_without_opinion") //- basePricePS
const DiffWithPS = computePatentSearchPrice("full_with_opinion") //- basePricePS  
 
  // Compute price for a given Drafting type and turnaround, independent of current selection
  const computeDraftingPrice = (
    type: "ps" | "cs" | "ps_cs",
    turn: "standard" | "expediated" | "rush" = "standard"
    ) => {
    if (!pricingRules) return 0
           
    const applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"

    const sel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: { dropdown: turn },
      searchType: type,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any

    return computePriceFromRules(pricingRules as any, sel)
  }
  const basePriceD = computeDraftingPrice("ps", "standard")
  const DiffWithoutD = computeDraftingPrice("cs", "expediated") //- basePriceD
  const DiffWithD = computeDraftingPrice("ps_cs", "rush") //- basePriceD      
 
    // Compute price for a given Search turnaround, independent of current selection
  const computeSearchPrice = (
  type: "quick" | "without_opinion" | "with_opinion",
  turn: "standard" | "expediated" | "rush" = "standard"
) => {
  if (!pricingRules) return 0

  const applicationType =
    optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
      ? "individual"
      : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
      ? "startup_msme"
      : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
      ? "others"
      : "individual"

  const sel = {
    applicationType,
    niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
    goodsServices: { dropdown: turn },   // turnaround speed
    searchType: type,                    // search type passed in
    priorUse: { used: optionsForm.useType === "yes" },
    option1: true,
  } as any

  return computePriceFromRules(pricingRules as any, sel)
}
     
  const computeFilingPrice = (
  filingType: "provisional_filing" | "complete_specification_filing" | "ps_cs_filing" | "pct_filing",
  appType: "individual" | "others"
) => {
  if (!pricingRules) return 0

  const sel = {
    applicationType: appType,
    niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
    goodsServices: { dropdown: filingType },
    searchType: optionsForm.searchType || undefined,
    priorUse: { used: optionsForm.useType === "yes" },
    option1: true,
  } as any

  return computePriceFromRules(pricingRules as any, sel)
}    
   
const selectedSearchType = optionsForm.searchType as
  | "quick"
  | "without_opinion"
  | "with_opinion"

const basePriceTurn = computeSearchPrice(selectedSearchType, "standard")
const diffExpediated = computeSearchPrice(selectedSearchType, "expediated") //- basePriceTurn
const diffRush = computeSearchPrice(selectedSearchType, "rush") //- basePriceTurn

// Patentability Search specific total (search type + selected or default turnaround)
const selectedTurn = (optionsForm.goodsServices as "standard" | "expediated" | "rush") || "standard"
const patentSearchTotal =
  selectedServiceTitle === "Patentability Search"
    ? (selectedSearchType ? computeSearchPrice(selectedSearchType as any, optionsForm.goodsServices ? selectedTurn : "standard") : 0)
    : 0

// Drafting total (specification type + selected/ default turnaround)
const selectedDraftTurn = (optionsForm.goodsServices as "standard" | "expediated" | "rush") || "standard"
const draftingTotal =
  selectedServiceTitle === 'Drafting'
    ? (optionsForm.searchType
        ? computeDraftingPrice(optionsForm.searchType as any, optionsForm.goodsServices ? selectedDraftTurn : 'standard')
        : 0)
    : 0

// Patent Application Filing total (filing type + applicant type)
const filingTotal =
  selectedServiceTitle === 'Patent Application Filing'
    ? (optionsForm.searchType && optionsForm.goodsServices
        ? computeFilingPrice(optionsForm.goodsServices as any, (optionsForm.searchType === 'individual' ? 'individual' : 'others'))
        : 0)
    : 0


  const handleOptionsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).map((f) => f.name)
    setOptionsForm((prev) => ({ ...prev, proofFileNames: files }))
  }

  const toggleApplicantType = (label: string) => {
    setOptionsForm((prev) => {
      const set = new Set(prev.applicantTypes)
      if (set.has(label)) set.delete(label)
      else set.add(label)
      return { ...prev, applicantTypes: Array.from(set) }
    })
  }
  const addToCartWithOptions = async () => {
  if (!selectedServiceTitle || !selectedServiceCategory) return

    // Map applicant type selection to pricing application_type
    let applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"
         

    // For Patent Application Filing, the Applicant Type select is stored in searchType.
    // If present, override the derived value so we price against the intended application type.
    if (
      selectedServiceTitle === "Patent Application Filing" &&
      (optionsForm.searchType === "individual" || optionsForm.searchType === "others")
    ) {
      applicationType = optionsForm.searchType as any
    }

    // Derive selected turnaround / filing key (fallback to 'standard')
    const selectedTurnaround = optionsForm.goodsServices && optionsForm.goodsServices !== "0"
      ? optionsForm.goodsServices
      : "standard"

    const selectedOptions = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: {
        dropdown: selectedTurnaround,
        customText: optionsForm.goodsServicesCustom || undefined,
      },
      searchType: optionsForm.searchType || undefined,
      priorUse: {
        used: optionsForm.useType === "yes",
        firstUseDate: optionsForm.firstUseDate || undefined,
        proofFiles: optionsForm.proofFileNames,
      },
      // Include Option1 row by default per provided pricing table
      option1: true,
    } as const
       
    // Always compute price from DB rules using selected options
  const baseServicePrice = servicePricing[selectedServiceTitle as keyof typeof servicePricing] || 0
    const { data: svc, error: svcErr } = await supabase
      .from("services")
      .select("id")
      .eq("name", selectedServiceTitle)
      .maybeSingle()

    let serviceId: number | null = null
    if (!svcErr && svc?.id) {
      serviceId = svc.id
    } else {
      const mapped = serviceIdByName[selectedServiceTitle as keyof typeof serviceIdByName]
      serviceId = typeof mapped === "number" ? mapped : null
    }

    let price = 0
    if (serviceId != null) {
      try {
        const rules = await fetchServicePricingRules(serviceId)
        if (rules && rules.length > 0) {
          price = computePriceFromRules(rules, selectedOptions as any)
        } else {
          // Fallback to base pricing table if no rules exist
          price = baseServicePrice
        }
      } catch (e) {
        console.error("Pricing rules fetch/compute failed:", e)
        price = baseServicePrice
      }
    } else {
      price = baseServicePrice
    }
           
    // Debug: log add-to-cart computation context
    console.log("[Cart] Add with options", {
      service: selectedServiceTitle,
      serviceId,
      applicationType,
      searchType: optionsForm.searchType,
      filingType: selectedTurnaround,
      computedPrice: price,
    })

    // Determine the pricing key that corresponds to the selected options
    // This will be used as the type for the order/payment
    let pricingKey: string | null = null
   
    if (selectedServiceTitle === "Patentability Search") {
      const st = optionsForm.searchType
      const t = selectedTurnaround
     
      if (st === "full_without_opinion" && t) {
        pricingKey = `full_without_opinion_${t}`
      } else if (st === "full_with_opinion" && t) {
        pricingKey = `full_with_opinion_${t}`
      } else if (st === "quick" && t) {
        pricingKey = `turnaround_${t}`
      }
    } else if (selectedServiceTitle === "Drafting") {
      const st = optionsForm.searchType // ps, cs, ps_cs
      const t = selectedTurnaround
     
      if ((st === "ps" || st === "cs" || st === "ps_cs") && t) {
        const base = st === "ps" ? "provisional_specification" : st === "cs" ? "complete_specification" : "ps_cs"
        pricingKey = `${base}_${t}`
      }
    } else if (selectedServiceTitle === "Patent Application Filing") {
      // For filing, the turnaround dropdown contains direct keys
      const filingKeys = new Set([
        "provisional_filing",
        "complete_specification_filing",
        "ps_cs_filing",
        "pct_filing",
      ])
      if (selectedTurnaround && filingKeys.has(selectedTurnaround)) {
        pricingKey = selectedTurnaround
      }
    } else if (selectedServiceTitle === "First Examination Response") {
      // For FER, the searchType contains direct keys
      const ferKeys = new Set([
        "base_fee",
        "response_due_anytime_after_15_days",
        "response_due_within_11_15_days",
        "response_due_within_4_10_days",
      ])
      if (optionsForm.searchType && ferKeys.has(optionsForm.searchType)) {
        pricingKey = optionsForm.searchType
      }
    }
   
    console.log("[Cart] Determined pricing key:", pricingKey)
   
    // Store the pricing key in localStorage so checkout can use it
    if (pricingKey) {
      try {
        localStorage.setItem('selected_pricing_key', pricingKey)
      } catch (e) {
        console.warn('Failed to store pricing key in localStorage:', e)
      }
    }

    const prettySearchTypeMap = {
      // Patentability Search types
      quick: "Quick Knockout Search",
      full_without_opinion: "Full Patentability Search (No Opinion)",
      full_with_opinion: "Full Patentability Search (With Opinion)",
      // Drafting types
      ps: "Provisional Specification (PS)",
      cs: "Complete Specification (CS)",
      ps_cs: "PS-CS",
    } as const

    // Turnaround labels differ for Drafting vs. Patentability Search
    const prettyTurnaroundMap =
      selectedServiceTitle === "Drafting"
        ? {
            standard: "Standard (12-15 days)",
            expediated: "Expediated (8-10 Days)",
            rush: "Rush (5-7 days)",
          }
        : {
            standard: "Standard (7-10 days)",
            expediated: "Expediated (3-5 Days)",
            rush: "Rush (1-2 days)",
          }

    const goods = optionsForm.goodsServicesCustom || optionsForm.goodsServices
    const searchTypeLabel = optionsForm.searchType
      ? (prettySearchTypeMap as any)[optionsForm.searchType] ?? optionsForm.searchType
      : "N/A"
    const turnaroundLabel = selectedTurnaround
      ? (prettyTurnaroundMap as any)[selectedTurnaround] ?? selectedTurnaround
      : "N/A"

    const detailsLabel = selectedServiceTitle === "Drafting" ? "Type" : "Search"
    const details = `${detailsLabel}: ${searchTypeLabel}; Turnaround: ${turnaroundLabel}`

  const newItem = {
      id: `${selectedServiceTitle}-${Date.now()}`,
      name: selectedServiceTitle,
  service_id: serviceIdByName[selectedServiceTitle as keyof typeof serviceIdByName] ?? null,
      price,
      category: selectedServiceCategory,
      details,
    }
  console.debug('options-panel add - newItem', newItem)
    setCartItems((prev) => [...prev, newItem])
    closeOptionsPanel()
  }

  const calculateAdjustedTotal = () => {
    let baseTotal = getTotalPrice()

    // Urgency multiplier
    const urgencyMultipliers = {
      standard: 1,
      urgent: 1.25,
      rush: 1.5,
    }

    // Complexity multiplier
    const complexityMultipliers = {
      simple: 0.9,
      medium: 1,
      complex: 1.3,
    }

    baseTotal *= urgencyMultipliers[calculatorFields.urgency as keyof typeof urgencyMultipliers]
    baseTotal *= complexityMultipliers[calculatorFields.complexity as keyof typeof complexityMultipliers]

    // Additional services
    if (calculatorFields.additionalServices) {
      baseTotal += 500
    }

    // Consultation hours
    baseTotal += (calculatorFields.consultationHours - 1) * 150

    // Remove discount calculation
    // baseTotal -= (baseTotal * calculatorFields.discount) / 100

    return Math.max(0, baseTotal)
  }
 
  const goToQuotePage = () => {
  if (cartItems.length === 0) {
    alert("Your cart is empty. Please add a service first.")
    return
  }
  if (!isAuthenticated) {
    setWantsCheckout(true)
    setShowAuthModal(true)
  } else {
    setIsOpen(false) // close dropdown if coming from header menu
    setInitialQuoteView('services')
    setShowQuotePage(true)
    setQuoteView('services')
  }
}
// Programmatic navigation to services view (e.g., from Orders or external trigger)
const goToServices = () => {
  setInitialQuoteView('services')
  setShowQuotePage(true)
  setQuoteView('services')
  setIsOpen(false)
}
// 3) In the auth listener, honor intent but don’t force navigation otherwise
useEffect(() => {
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("[auth] event:", event, "user:", !!session?.user)
    if (event === "SIGNED_IN" && session?.user) {
      upsertUserProfileFromSession()
      setShowAuthModal(false)
      if (event === "SIGNED_IN" && session?.user) {
  upsertUserProfileFromSession()
  setShowAuthModal(false)

  // Prime Orders: ensure first entry to Orders sees a fresh load
  setOrdersReloadKey(k => k + 1)

  if (wantsCheckout) {
    setShowQuotePage(true)
    setWantsCheckout(false)
  }
}
      if (wantsCheckout) {
        setShowQuotePage(true)
        setWantsCheckout(false)
      }
    }
  })
  return () => sub?.subscription?.unsubscribe()
}, [wantsCheckout, setWantsCheckout, upsertUserProfileFromSession])

//Google login
 




   
const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();

  const { email, password, confirmPassword, firstName, lastName, company } = authForm;

  if (authMode === "signup") {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName, company },
      },
    });

    if (error) {
      alert(`Signup failed: ${error.message}`);
      console.error("Signup Error:", error);
    } else {
      alert("Signup successful! Please check your email to verify.");
      setShowAuthModal(false);

      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from("users")
          .upsert(
            [
              {
                id: signUpData.user.id,
                email,
                first_name: firstName || null,
                last_name: lastName || null,
                company: company || null,
              },
            ],
            { onConflict: "email" }
          );

        if (profileError) {
          console.error("Failed to store profile info:", profileError.message);
        }
      }
    }
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Sign-in failed: ${error.message}`);
      console.error("Sign-in Error:", error);
    } else {
      alert("Signed in successfully!");
     //setIsAuthenticated(true)
      setShowAuthModal(false)
      if (wantsCheckout) {
        setShowQuotePage(true)
        setWantsCheckout(false)
      }
      }
  }
};

  const handleLogout = async () => {
  try {
    await hookLogout()
    // Ensure session is cleared
    const { data } = await supabase.auth.getSession()
    if (data?.session) {
      // force clear a second time
      await supabase.auth.signOut()
    }
  } finally {
    setShowQuotePage(false)
    //setShowAuthModal(true)
    setShowAuthModal(false)
    setIsOpen(false)
    resetAuthForm()
    setCartItems([])
    try { localStorage.removeItem("cart_items_v1") } catch {}
    setShowOptionsPanel(false)
    setSelectedServiceTitle(null)
    setSelectedServiceCategory(null)
    resetOptionsForm()
  }
}
 
  const resetAuthForm = () => {
    setAuthForm({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      company: "",
    })
  }

  const switchAuthMode = (mode: "signin" | "signup") => {
    setAuthMode(mode)
    resetAuthForm()
    setShowPassword(false)
  }

  const handleForgotPassword = async () => {
  if (!authForm.email) {
    alert("Please enter your email above before resetting password.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(authForm.email, {
    redirectTo: "http://localhost:3000/reset-password",
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password reset email sent! Check your inbox.");
  }
};
 
//add here
const [isProcessingPayment, setIsProcessingPayment] = useState(false);
// Track if user left the tab during an active payment (legacy interruption flag)
const [paymentInterrupted, setPaymentInterrupted] = useState(false)
const paymentBlurTimerRef = useRef<any>(null)

// Strict focus guard states
const [focusGuardActive, setFocusGuardActive] = useState(false)
const [focusViolationReason, setFocusViolationReason] = useState<string|null>(null)
const [focusViolationCount, setFocusViolationCount] = useState(0)
const focusGuardStartedAtRef = useRef<number|null>(null)
const focusLastOkRef = useRef<number|null>(null)
const focusBlurTimerRef = useRef<any>(null)
const focusVisibilityTimerRef = useRef<any>(null)
const MAX_FOCUS_GUARD_DURATION_MS = 5 * 60 * 1000 // safety auto-stop after 5 minutes
const BLUR_GRACE_MS = 600 // tighter grace for blur
const VISIBILITY_GRACE_MS = 400 // very strict: almost immediate

const startFocusGuard = useCallback(() => {
  if (focusGuardActive) return
  setFocusViolationReason(null)
  setFocusViolationCount(0)
  focusGuardStartedAtRef.current = Date.now()
  focusLastOkRef.current = Date.now()
  setFocusGuardActive(true)
  console.debug('[FocusGuard] started')
}, [focusGuardActive])

const stopFocusGuard = useCallback((label: string) => {
  if (!focusGuardActive) return
  setFocusGuardActive(false)
  if (focusBlurTimerRef.current) clearTimeout(focusBlurTimerRef.current)
  if (focusVisibilityTimerRef.current) clearTimeout(focusVisibilityTimerRef.current)
  console.debug('[FocusGuard] stopped', { label })
}, [focusGuardActive])

// Central interruption routine (moved earlier to avoid use-before-def in focus guard hooks)
const interruptPayment = useCallback(async (reason: string) => {
  if (!isProcessingPayment) return
  if (paymentInterrupted) return
  console.warn('[Payment][interrupt]', { reason })
  setPaymentInterrupted(true)
  try {
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || 'local'
    console.debug('[Payment][interrupt] attempting signOut', { env })
    const result = await supabase.auth.signOut()
    console.debug('[Payment][interrupt] signOut result', result)
    // Fallback: if session still present after short delay in prod, force cookie clear via location reload
    setTimeout(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session) {
          console.warn('[Payment][interrupt] session still present post signOut, forcing hard reload')
          window.location.replace('/')
        }
      } catch {}
    }, 400)
  } catch (e) {
    console.error('[Payment][interrupt] signOut threw', e)
    try { window.location.replace('/') } catch {}
  }
}, [isProcessingPayment, paymentInterrupted])

const handleFocusViolation = useCallback(async (reason: string) => {
  if (!focusGuardActive) return
  setFocusViolationReason(reason)
  setFocusViolationCount(c => c + 1)
  console.warn('[FocusGuard][violation]', { reason })
  interruptPayment('focus-guard-' + reason)
  stopFocusGuard('violation-' + reason)
}, [focusGuardActive, interruptPayment, stopFocusGuard])

// Effect: bind focus guard listeners
useEffect(() => {
  if (!focusGuardActive) return
  const handleVisibility = () => {
    if (document.visibilityState === 'hidden') {
      if (focusVisibilityTimerRef.current) clearTimeout(focusVisibilityTimerRef.current)
      focusVisibilityTimerRef.current = setTimeout(() => handleFocusViolation('visibility-hidden'), VISIBILITY_GRACE_MS)
    } else {
      if (focusVisibilityTimerRef.current) {
        clearTimeout(focusVisibilityTimerRef.current)
        focusVisibilityTimerRef.current = null
      }
      focusLastOkRef.current = Date.now()
    }
  }
  const handleBlur = () => {
    if (focusBlurTimerRef.current) clearTimeout(focusBlurTimerRef.current)
    focusBlurTimerRef.current = setTimeout(() => handleFocusViolation('window-blur'), BLUR_GRACE_MS)
  }
  const handleFocus = () => {
    if (focusBlurTimerRef.current) {
      clearTimeout(focusBlurTimerRef.current)
      focusBlurTimerRef.current = null
    }
    focusLastOkRef.current = Date.now()
  }
  const handleKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      handleFocusViolation('meta-ctrl-key')
    }
  }
  const beforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    e.returnValue = ''
    handleFocusViolation('before-unload')
  }
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('blur', handleBlur)
  window.addEventListener('focus', handleFocus)
  window.addEventListener('keydown', handleKey, true)
  window.addEventListener('beforeunload', beforeUnload)
  const interval = setInterval(() => {
    if (!focusGuardActive) return
    const started = focusGuardStartedAtRef.current || 0
    if (Date.now() - started > MAX_FOCUS_GUARD_DURATION_MS) {
      stopFocusGuard('auto-timeout')
    }
  }, 2000)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('blur', handleBlur)
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('keydown', handleKey, true)
    window.removeEventListener('beforeunload', beforeUnload)
    if (focusBlurTimerRef.current) clearTimeout(focusBlurTimerRef.current)
    if (focusVisibilityTimerRef.current) clearTimeout(focusVisibilityTimerRef.current)
    clearInterval(interval)
  }
}, [focusGuardActive, handleFocusViolation, stopFocusGuard])

// Overlay while guard active (prevents user interacting with rest of page and signals requirement)
const FocusGuardOverlay = () => {
  if (!focusGuardActive) return null
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex items-start justify-center p-4">
      <div className="mt-8 px-4 py-2 rounded bg-amber-500/90 text-white text-sm shadow">
        <strong>Payment in progress.</strong> Keep this tab focused. Leaving the tab will cancel and require re-login.
      </div>
    </div>
  )
}

// (definition moved above for ordering)

// Legacy interruption watcher still active but only when guard not active (fallback)
useEffect(() => {
  if (!isProcessingPayment) return
  if (focusGuardActive) return // guard handles it
  const handleVisibility = () => { if (document.visibilityState === 'hidden') interruptPayment('legacy-visibility-hidden') }
  window.addEventListener('visibilitychange', handleVisibility)
  return () => { window.removeEventListener('visibilitychange', handleVisibility) }
}, [isProcessingPayment, focusGuardActive, interruptPayment])

// Overlay for interruption warning
const PaymentInterruptionBanner = () => {
  if (!paymentInterrupted) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-md shadow-xl max-w-md w-full p-6 space-y-4 text-center">
        <h2 className="text-lg font-semibold text-red-600">Payment Interrupted</h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {focusViolationReason ? (
            <>Focus was lost ({focusViolationReason}). You were signed out for security. Please sign in and retry, keeping this tab focused.</>
          ) : (
            <>You switched tabs or applications during payment processing. For security and to ensure your order is recorded correctly, you have been signed out. Please sign back in and retry the payment. Keep this tab in focus until confirmation.</>
          )}
        </p>
        <button
          onClick={() => { setPaymentInterrupted(false); setShowAuthModal(true); }}
          className="mt-2 inline-flex items-center justify-center rounded bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium"
        >Sign In Again</button>
      </div>
    </div>
  )
}
  useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}, []);

  const handlePayment = async () => {
    try {
      const amount = Math.round(calculateAdjustedTotal() * 100); // paise

      // 1) fetch authenticated user's details so we can attach user_id to the order
      const userRes = await supabase.auth.getUser();
      const user = (userRes && (userRes as any).data) ? (userRes as any).data.user : null;

      // 2) create an order on the server so the secret key stays on the server
      // read pricing key determined when adding to cart
      const selectedPricingKey = (typeof window !== 'undefined') ? (localStorage.getItem('selected_pricing_key') || null) : null
      console.log("[Checkout] Using pricing key:", selectedPricingKey)
     
      const orderResp = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR', user_id: user?.id || null, service_id: (cartItems[0] as any)?.service_id ?? null, type: selectedPricingKey }),
      });

      if (!orderResp.ok) {
        let reason = 'Unknown error'
        try {
          const maybeJson = await orderResp.json()
          reason = (maybeJson && (maybeJson.error || maybeJson.message)) ? (maybeJson.error || maybeJson.message) : JSON.stringify(maybeJson)
        } catch {
          try { reason = await orderResp.text() } catch {}
        }
        console.error('create-order failed:', reason)
        alert(`Failed to start payment. ${reason || 'Please try again.'}`)
        return
      }

     
      const order = await orderResp.json();
      const firstItem = cartItems[0];

      // 3) Build Razorpay options; order.id comes from server (/api/create-order)
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount || amount,
        currency: order.currency || 'INR',
        name: 'LegalIP Pro',
        description: firstItem?.name || 'IP Service Payment',
        order_id: order.id || order.id, // server-provided Razorpay order id
        // Ensure we can react to the user closing the Razorpay popup (X button / outside click)
        modal: {
          ondismiss: () => {
            console.log('[Razorpay] Checkout dismissed by user (no payment). Cleaning up.');
            stopFocusGuard('dismiss');
            setIsProcessingPayment(false);
          }
        },
  handler: async function (response: any) {
          // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
              setIsProcessingPayment(true);
      // Forward the payment result to the server for signature verification
            const verifyResp = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                // include authenticated user id so server can attach payment to profile
                user_id: user?.id || null,
        // include service selection so server can persist service_id reliably
        service_id: (cartItems[0] as any)?.service_id ?? null,
                // include application form type (if the user selected one)
                type: selectedPricingKey,
                // include minimal customer/context data for server processing
                name: user?.user_metadata?.full_name || user?.email || '',
                email: user?.email || '',
                phone: user?.phone || '',
                message: options.description,
                complexity: serviceFields.patentField1 || 'standard',
                urgency: calculatorFields.urgency || 'standard',
                cart: cartItems,
              }),
            });

            const verifyJson = await verifyResp.json();
            if (!verifyResp.ok || !verifyJson.success) {
              console.error('verify-payment failed', verifyJson);
              alert('Payment verification failed. Please contact support.');
              setIsProcessingPayment(false);  
              return;
            }
            
            // Show local Thank You modal so the user can open forms immediately
            const persisted = verifyJson.persistedPayment ?? null;
            const createdOrders =
                Array.isArray(verifyJson.createdOrdersClient) ? verifyJson.createdOrdersClient
                : (Array.isArray(verifyJson.createdOrders) ? verifyJson.createdOrders : []);
            const paymentIdentifier = persisted?.razorpay_payment_id ?? persisted?.id ?? null;

              // Ensure the in-app dashboard is shown beneath the modal
            setShowQuotePage(true);
            setQuoteView("orders");
            setIsOpen(false);

              // Save payment and orders to state
            setCheckoutPayment(persisted);
            setCheckoutOrders(createdOrders);
            setShowCheckoutThankYou(true);
            setOrdersReloadKey(k => k + 1)
            // Clear cart so Services screen shows empty after successful payment
            setCartItems([]);
            setIsProcessingPayment(false);
            if (!createdOrders || createdOrders.length === 0) {
                setQuoteView('orders')
              }
            // Fallbacks removed: keep user on in-page dashboard and show modal persistently.
          } catch (err) {
            console.error('Error verifying payment:', err);
            alert('Payment succeeded but verification failed. We will investigate.');
            setIsProcessingPayment(false);  
          }
        },
        
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          service: firstItem?.name || 'Quotation Payment',
        },
        theme: { color: '#1e40af' },
      };

      // Start strict focus guard right before opening checkout
      startFocusGuard()
      setIsProcessingPayment(true)
      const rzp = new (window as any).Razorpay(options);
      // Capture explicit payment failures (e.g., failed authorization) so we cleanly exit
      try {
        rzp.on('payment.failed', (resp: any) => {
          console.warn('[Razorpay] payment.failed event', resp);
          alert('Payment was not completed. You can try again.');
          stopFocusGuard('payment-failed');
          setIsProcessingPayment(false);
        });
      } catch (e) {
        console.warn('[Razorpay] Unable to attach payment.failed listener', e);
      }
      rzp.open();
    } catch (err: any) {
      console.error('handlePayment error:', err);
      alert('An error occurred while initiating payment.');
      stopFocusGuard('init-error')
      setIsProcessingPayment(false)
    }
  };
 
   
  const getServicesByCategory = (category: string) => {
    return cartItems.filter((item) => item.category === category)
  }

  const hasServicesInCategory = (category: string) => {
    return cartItems.some((item) => item.category === category)
  }

  const downloadQuotationPDF = () => {
    // Create the PDF content as HTML
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const quotationNumber = `LIP-${Date.now().toString().slice(-6)}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>LegalIP Pro - Service Quotation</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .company-info {
            color: #666;
            font-size: 14px;
          }
          .quotation-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          .quotation-info div {
            flex: 1;
          }
          .quotation-info h3 {
            margin: 0 0 10px 0;
            color: #2563eb;
            font-size: 16px;
          }
          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .services-table th,
          .services-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .services-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #374151;
          }
          .category-header {
            background-color: #e0f2fe !important;
            font-weight: bold;
            color: #0369a1;
          }
          .price {
            text-align: right;
            font-weight: bold;
          }
          .total-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .total-final {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            border-top: 2px solid #2563eb;
            padding-top: 10px;
          }
          .terms {
            background: #fefce8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #eab308;
          }
          .terms h3 {
            margin-top: 0;
            color: #a16207;
          }
          .terms ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .terms li {
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .quotation-info { display: block; }
            .quotation-info div { margin-bottom: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">⚖️ LegalIP Pro</div>
          <div class="company-info">
            Professional Intellectual Property Services<br>
            123 Legal Street, IP City, LC 12345<br>
            Phone: (555) 123-4567 | Email: info@legalippro.com
          </div>
        </div>

        <div class="quotation-info">
          <div>
            <h3>Quotation Details</h3>
            <strong>Quotation #:</strong> ${quotationNumber}<br>
            <strong>Date:</strong> ${currentDate}<br>
            <strong>Valid Until:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </div>
          <div>
            <h3>Client Information</h3>
            <strong>Prepared For:</strong> Prospective Client<br>
            <strong>Services:</strong> IP Protection Services<br>
            <strong>Status:</strong> Preliminary Estimate
          </div>
        </div>

        <table class="services-table">
          <thead>
            <tr>
              <th>Service Description</th>
              <th>Category</th>
              <th class="price">Estimated Cost</th>
            </tr>
          </thead>
          <tbody>
            ${cartItems
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td class="price">${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(getTotalPrice())}</span>
          </div>
          <div class="total-row">
            <span>Consultation (Included):</span>
            <span>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(0)}</span>
          </div>
          <div class="total-row total-final">
            <span>Total Estimated Cost:</span>
            <span>${new Intl.NumberFormat('en-IN', { style: 'currency', 'currency': 'INR', maximumFractionDigits: 0 }).format(getTotalPrice())}</span>
          </div>
        </div>

        <div class="terms">
          <h3>Terms & Conditions</h3>
          <ul>
            <li><strong>Validity:</strong> This quotation is valid for 30 days from the date of issue.</li>
            <li><strong>Estimates:</strong> All prices are estimates and may vary based on complexity and specific requirements.</li>
            <li><strong>Payment:</strong> 50% advance payment required to commence services, balance upon completion.</li>
            <li><strong>Timeline:</strong> Service timelines will be provided upon engagement and may vary by service type.</li>
            <li><strong>Consultation:</strong> Free initial consultation included with any service package.</li>
            <li><strong>Additional Costs:</strong> Government fees, filing fees, and third-party costs are additional.</li>
          </ul>
        </div>

        <div class="footer">
          <p>This quotation was generated on ${currentDate} by LegalIP Pro.<br>
          For questions or to proceed with services, please contact us at info@legalippro.com or (555) 123-4567.</p>
        </div>
      </body>
      </html>
    `

    // Create a new window and write the HTML content
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }
     
 
  /// Quote Page Component
 if (showQuotePage) {
   return (
    <div className="min-h-screen bg-gray-50">
      <PaymentProcessingModal isVisible={isProcessingPayment} />
      <PaymentInterruptionBanner />
      {/* Unified Checkout Thank You Modal (dashboard view) */}
      <CheckoutModal
        isOpen={showCheckoutThankYou}
        onClose={() => setShowCheckoutThankYou(false)}
        payment={checkoutPayment}
        orders={checkoutOrders}
        onProceedSingle={openFormEmbedded}
  onProceedMultiple={(orders) => { if (orders && orders.length > 0) openMultipleFormsEmbedded(orders) }}
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/*<button
              onClick={() => setShowQuotePage(false)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              ← Back to Home
            </button>*/}
            <div className="flex items-center" />
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="/knowledge-hub"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Knowledge Hub
              </a>
             
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Pane: Controls */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white border rounded-lg p-4 sticky top-24">
              <div className="space-y-2">
                <div className="text-base font-semibold text-gray-800">Settings</div>
                {/* Services button removed: view selected programmatically */}
                <Button
                  variant={quoteView === 'orders' ? undefined : 'outline'}
                  className={`w-full justify-start ${quoteView === 'orders' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                  onClick={goToOrders}
                >
                  Orders
                </Button>
                <Button
                  variant={quoteView === 'profile' ? undefined : 'outline'}
                  className={`w-full justify-start ${quoteView === 'profile' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                  onClick={() => setQuoteView('profile')}
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                  disabled={!isAuthenticated}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Main: Selected Services and Payment */}
          <div className="flex-1">
            {quoteView === 'services' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Selected Services</h1>
                  <p className="text-gray-600">Review your selected IP protection services and customize your quote</p>
                </div>
                <div className="space-y-6">
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
                              <span className="text-2xl font-bold text-blue-600">{formatINR(item.price)}</span>
                              <Button onClick={() => removeFromCart(item.id)} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
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
                        <Button onClick={() => setShowQuotePage(false)} className="bg-blue-600 hover:bg-blue-700">Browse Services</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <div className="flex flex-col items-center mt-8 space-y-3">
                  <Button className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePayment}>
                    <FileText className="h-4 w-4 mr-2" />
                    Make Payment
                  </Button>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 max-w-lg text-center leading-snug">
                    Clicking on <span className="font-semibold">Make Payment</span> will open the secure Razorpay window. <strong>Do not switch tabs, minimize, or leave this screen until the payment is completed</strong> or you will be signed out and need to sign in again to retry.
                  </p>
                </div>
              </>
            )}

            {/* Persistent Dashboard header for all internal tabs */}
            {quoteView !== 'services' && (
              <div className="mb-10 sticky top-16 z-40 bg-white pt-5 pb-3 border-b border-slate-200">
                <h2 className="text-5xl font-semibold tracking-tight text-slate-800 leading-tight select-none">
                  Dashboard
                </h2>
                <div className="mt-3 h-1 w-28 bg-blue-600 rounded" />
              </div>
            )}

            {quoteView === 'orders' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
                    <p className="text-gray-600 text-sm">Your recent service purchases</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={goToServices}>Services</Button>
                    {/*<Button
                      variant="outline"
                      disabled
                      title="Refresh disabled (auto-loads when returning; browser reload for hard refresh)"
                      className="opacity-50 cursor-not-allowed"
                    >
                      Refresh
                    </Button>*/}
                  </div>
                </div>
                <Card className="bg-white">
                  <CardContent className="p-4">
                    {embeddedOrdersLoading && <div className="p-4 text-sm text-gray-500">Loading orders…</div>}
                    {!embeddedOrdersLoading && ordersLoadError && (
                      <div className="p-4 text-sm text-red-600 flex flex-col gap-2">
                        <span>{ordersLoadError}</span>
                        <Button size="sm" variant="outline" onClick={() => setOrdersReloadKey(k => k + 1)}>Retry</Button>
                      </div>
                    )}
                    {!embeddedOrdersLoading && !ordersLoadError && (!embeddedOrders || embeddedOrders.length === 0) && (
                      <div className="p-4 text-sm text-gray-500">No orders found.</div>
                    )}
                    {!embeddedOrdersLoading && !ordersLoadError && embeddedOrders && embeddedOrders.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                          <thead>
                            <tr className="text-left text-sm text-gray-500">
                              <th className="p-2">Category</th>
                              <th className="p-2">Service</th>
                              <th className="p-2">Amount</th>
                              <th className="p-2">Date</th>
                              <th className="p-2">Form</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedOrders.map(bundle => {
                              const hasMultiple = bundle.orders.length > 1
                              const first = bundle.orders[0]
                              const handleDownloadBundle = async () => {
                                try {
                                  const orders = bundle.orders || []
                                  const paymentId = bundle.paymentKey || ''
                                  const totalAmount = formatINR(bundle.totalAmount || 0)
                                  const rowsHtml = orders.map((o: any, idx: number) => {
                                    const category = (o.categories as any)?.name || (orders[0]?.categories as any)?.name || 'N/A'
                                    const service = (o.services as any)?.name || 'N/A'
                                    const amount = o.amount != null ? formatINR(Number(o.amount)) : '—'
                                    const date = o.created_at ? new Date(o.created_at).toLocaleString() : (bundle.date ? new Date(bundle.date).toLocaleString() : '')
                                    return `<tr>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${idx + 1}</td>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${category}</td>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${service}</td>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right;">${amount}</td>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${date}</td>
                                    </tr>`
                                  }).join('')
                                  const html = `<!DOCTYPE html><html><head><meta charset='utf-8' />
                                  <title>Invoice ${paymentId}</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; margin:24px; color:#111827; }
                                    h1 { font-size:20px; margin:0 0 4px; }
                                    .sub { color:#6b7280; font-size:12px; margin-bottom:16px; }
                                    table { width:100%; border-collapse: collapse; font-size:12px; }
                                    th { text-align:left; background:#f3f4f6; padding:6px; font-weight:600; font-size:12px; border-bottom:1px solid #e5e7eb; }
                                    .totals { margin-top:16px; width:100%; }
                                    .totals td { padding:4px 0; }
                                    .totals .label { color:#374151; }
                                    .totals .value { text-align:right; font-weight:600; }
                                    .footer { margin-top:24px; font-size:10px; color:#6b7280; border-top:1px solid #e5e7eb; padding-top:8px; }
                                    @media print { .noprint { display:none; } }
                                  </style>
                                  </head><body>
                                    <div style='display:flex;justify-content:space-between;align-items:flex-start;'>
                                      <div>
                                        <h1>Invoice</h1>
                                        <div class='sub'>Payment ID: ${paymentId || 'N/A'}<br/>Generated: ${new Date().toLocaleString()}</div>
                                      </div>
                                      <div style='text-align:right;font-size:12px;'>
                                        <strong>LegalIP Pro</strong><br/>Professional IP Services<br/>support@legalippro.com
                                      </div>
                                    </div>
                                    <table style='margin-top:12px;'>
                                      <thead><tr><th>#</th><th>Category</th><th>Service</th><th style='text-align:right;'>Amount (INR)</th><th>Date</th></tr></thead>
                                      <tbody>${rowsHtml || `<tr><td colspan='5' style='padding:12px;text-align:center;color:#9ca3af;'>No line items</td></tr>`}</tbody>
                                    </table>
                                    <table class='totals'>
                                      <tr><td class='label'>Total</td><td class='value'>${totalAmount}</td></tr>
                                    </table>
                                    <div class='footer'>System-generated summary. For official tax invoice please contact support with Payment ID.</div>
                                    <button class='noprint' onclick='window.print()' style='margin-top:16px;padding:8px 12px;font-size:12px;cursor:pointer;'>Print / Save PDF</button>
                                    <script>window.addEventListener('load', () => { /* optional auto print */ })</script>
                                  </body></html>`
                                  const w = window.open('', '_blank')
                                  if (w) { w.document.write(html); w.document.close(); }
                                } catch (e) {
                                  console.error('Invoice PDF generation failed', e)
                                  alert('Failed to generate invoice PDF.')
                                }
                              }
                              return (
                                <>
                                  <tr key={bundle.paymentKey} className="border-t bg-slate-50">
                                    <td className="p-2 font-medium">{hasMultiple ? 'Multiple Services' : (first.categories as any)?.name ?? 'N/A'}</td>
                                    <td className="p-2 font-medium">
                                      {hasMultiple ? `${bundle.orders.length} Services` : (first.services as any)?.name ?? 'N/A'}
                                    </td>
                                    <td className="p-2 font-semibold">{formatINR(bundle.totalAmount)}</td>
                                    <td className="p-2">{bundle.date ? new Date(bundle.date).toLocaleString() : 'N/A'}</td>
                                    <td className="p-2">
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => {
                                          if (hasMultiple) {
                                            openMultipleFormsEmbedded(bundle.orders)
                                          } else {
                                            openFormEmbedded(first)
                                          }
                                        }}>{hasMultiple ? 'Open Forms' : 'Open Form'}</Button>
                                        <Button size="sm" variant="outline" onClick={handleDownloadBundle} title="Download invoice PDF">PDF</Button>
                                      </div>
                                    </td>
                                  </tr>
                                  {hasMultiple && bundle.orders.map((child: any) => (
                                    <tr key={child.id} className="border-t">
                                      <td className="p-2 pl-8 text-sm text-gray-600">{(child.categories as any)?.name ?? 'N/A'}</td>
                                      <td className="p-2 text-sm text-gray-700">{(child.services as any)?.name ?? 'N/A'}</td>
                                      <td className="p-2 text-sm">{child.amount != null ? formatINR(Number(child.amount)) : '—'}</td>
                                      <td className="p-2 text-sm">{child.created_at ? new Date(child.created_at).toLocaleString() : 'N/A'}</td>
                                      <td className="p-2 text-xs text-gray-400 italic">—</td>
                                    </tr>
                                  ))}
                                </>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
            {quoteView === 'forms' && (
              <>
                <FormHeaderWithPrefill
                  goToOrders={goToOrders}
                  backToServices={() => setQuoteView('services')}
                />
                {!embeddedMultiForms && (
                  <Card className="bg-white">
                    <CardContent className="p-0">
                      <FormClient
                        orderIdProp={selectedFormOrderId}
                        typeProp={selectedFormType}
                        onPrefillStateChange={formPrefillHandle}
                        externalPrefill={lastSavedSnapshot}
                        onSaveLocal={(info) => setLastSavedSnapshot(info)}
                      />
                    </CardContent>
                  </Card>
                )}
                {embeddedMultiForms && (
                  <div className="space-y-12">
                    {embeddedMultiForms.map((f, idx) => (
                      <Card key={f.id} className="bg-white border border-slate-200 shadow-sm">
                        <CardContent className="p-0">
                          <div className="px-6 pt-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">{idx+1}</span>
                              Order #{f.id}
                            </h2>
                            <Button size="sm" variant={selectedFormOrderId === f.id ? 'default' : 'outline'} onClick={() => { setSelectedFormOrderId(f.id); setSelectedFormType(f.type); }}>
                              Focus
                            </Button>
                          </div>
                          <div className="mt-4">
                            <FormClient
                              orderIdProp={f.id}
                              typeProp={f.type}
                              externalPrefill={lastSavedSnapshot}
                              onPrefillStateChange={idx === 0 ? formPrefillHandle : () => {}}
                              onSaveLocal={(info) => setLastSavedSnapshot(info)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {quoteView === 'profile' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
                    <p className="text-gray-600 text-sm">Update your account information</p>
                  </div>
                  <Button variant="outline" onClick={() => setQuoteView('services')}>Back to Selected Services</Button>
                </div>
                {!embeddedProfile && (
                  <Card className="bg-white">
                    <CardContent className="p-4 text-sm text-gray-500">Sign in to view your profile.</CardContent>
                  </Card>
                )}
                {embeddedProfile && (
                  <Card className="bg-white">
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">First Name</Label>
                          <Input value={embeddedProfile.first_name ?? ''} onChange={(e) => setEmbeddedProfile({ ...embeddedProfile, first_name: (e.target as HTMLInputElement).value })} />
                        </div>
                        <div>
                          <Label className="text-sm">Last Name</Label>
                          <Input value={embeddedProfile.last_name ?? ''} onChange={(e) => setEmbeddedProfile({ ...embeddedProfile, last_name: (e.target as HTMLInputElement).value })} />
                        </div>
                        <div>
                          <Label className="text-sm">Company</Label>
                          <Input value={embeddedProfile.company ?? ''} onChange={(e) => setEmbeddedProfile({ ...embeddedProfile, company: (e.target as HTMLInputElement).value })} />
                        </div>
                        <div>
                          <Label className="text-sm">Phone</Label>
                          <Input value={embeddedProfile.phone ?? ''} onChange={(e) => setEmbeddedProfile({ ...embeddedProfile, phone: (e.target as HTMLInputElement).value })} />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm">Address</Label>
                          <Input value={embeddedProfile.address ?? ''} onChange={(e) => setEmbeddedProfile({ ...embeddedProfile, address: (e.target as HTMLInputElement).value })} />
                        </div>
                        <div>
                          <Label className="text-sm">City</Label>
                          <Input value={embeddedProfile.city ?? ''} onChange={(e) => setEmbeddedProfile({ ...embeddedProfile, city: (e.target as HTMLInputElement).value })} />
                        </div>
                        <div>
                          <Label className="text-sm">State</Label>
                          <Input value={embeddedProfile.state ?? ''} onChange={(e) => setEmbeddedProfile({ ...embeddedProfile, state: (e.target as HTMLInputElement).value })} />
                        </div>
                        <div>
                          <Label className="text-sm">Country</Label>
                          <Input value={embeddedProfile.country ?? ''} onChange={(e) => setEmbeddedProfile({ ...embeddedProfile, country: (e.target as HTMLInputElement).value })} />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={saveEmbeddedProfile} disabled={embeddedProfileSaving} className="bg-blue-600 hover:bg-blue-700">
                          {embeddedProfileSaving ? 'Saving…' : 'Save Profile'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
 }

 // Main marketing / landing view
 return (
    <div className="min-h-screen bg-white">
      {/* Auth Modal */}
       
              {showAuthModal && (
  <AuthModal
    authForm={authForm}
    setAuthForm={setAuthForm}
    authMode={authMode}
    switchAuthMode={switchAuthMode}
    handleAuth={handleAuth}
    handleForgotPassword={handleForgotPassword}
    showPassword={showPassword}
    setShowPassword={setShowPassword}
    setShowAuthModal={setShowAuthModal}
    googleSignInButton={
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_17_40)">
            <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29H37.1C36.5 32.1 34.5 34.7 31.7 36.4V42H39.3C44 38.1 47.5 32.1 47.5 24.5Z" fill="#4285F4"/>
            <path d="M24 48C30.6 48 36.1 45.8 39.3 42L31.7 36.4C29.9 37.6 27.7 38.3 24 38.3C18.7 38.3 14.1 34.7 12.5 29.9H4.7V35.7C7.9 42.1 15.3 48 24 48Z" fill="#34A853"/>
            <path d="M12.5 29.9C12.1 28.7 11.9 27.4 11.9 26C11.9 24.6 12.1 23.3 12.5 22.1V16.3H4.7C3.2 19.1 2.5 22.4 2.5 26C2.5 29.6 3.2 32.9 4.7 35.7L12.5 29.9Z" fill="#FBBC05"/>
            <path d="M24 9.7C27.1 9.7 29.5 10.8 31.2 12.3L39.4 4.1C36.1 1.1 30.6-1 24 0C15.3 0 7.9 5.9 4.7 12.3L12.5 18.1C14.1 13.3 18.7 9.7 24 9.7Z" fill="#EA4335"/>
          </g>
          <defs>
            <clipPath id="clip0_17_40">
              <rect width="48" height="48" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        Continue with Google
      </button>
    }
  />
)}

  {/* Header */}
      <header className="bg-white shadow-md p-4">
      <div className="hidden md:flex items-center space-x-6 justify-end w-full">
        <a href="/knowledge-hub" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
          Knowledge Hub
        </a>
        {/* Greeting */}
        {isAuthenticated && displayName && (
        <span
          className="text-gray-700 text-sm max-w-[180px] truncate"
          title={displayName}
        >
          Welcome, {displayName}
        </span>
      )}
        <div className="relative">
          <button onClick={toggleMenu} className="focus:outline-none">
            <UserCircleIcon className="h-8 w-8 text-gray-700 hover:text-blue-600" />
          </button>
   
          {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 border border-gray-200 z-50">
            {/* Dashboard: visible but disabled when not signed in */}
            <button
              className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
              onClick={() => {
                if (!isAuthenticated) return
                setInitialQuoteView('orders')
                setShowQuotePage(true)
                setIsOpen(false)
              }}
              disabled={!isAuthenticated}
              aria-disabled={!isAuthenticated}
              title={!isAuthenticated ? 'Sign in to access dashboard' : undefined}
            >
              Dashboard
            </button>

            {/* Sign In: always shown; disabled once signed in */}
            <button
              onClick={() => {
                if (isAuthenticated) return
                goToQuotePage()
                setIsOpen(false)
              }}
              className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 ${isAuthenticated ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
              disabled={isAuthenticated}
              aria-disabled={isAuthenticated}
              title={isAuthenticated ? 'Already signed in' : undefined}
            >
              Sign In
            </button>

            {/* Sign Out: visible but disabled when not signed in */}
            <button
              onClick={() => { if (!isAuthenticated) return; handleLogout(); setIsOpen(false); }}
              className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
              disabled={!isAuthenticated}
              aria-disabled={!isAuthenticated}
              title={!isAuthenticated ? 'Sign in to enable sign out' : undefined}
            >
              Sign Out
            </button>
          </div>
        )}
        </div>
      </div>
    </header>

   

      {/* Enhanced Carousel Banner */}
      <section className="banner-section relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>

        {/* Carousel Container */}
        <div className="relative h-full">
          {bannerSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 transform translate-x-0"
                  : index < currentSlide
                    ? "opacity-0 transform -translate-x-full"
                    : "opacity-0 transform translate-x-full"
              }`}
            >
              <div className="h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content Side */}
                    <div className="text-white space-y-6">
                      <div className="inline-block px-4 py-2 bg-blue-600/20 backdrop-blur-sm rounded-full border border-blue-400/30">
                        <span className="text-blue-200 text-sm font-medium">Professional IP Services</span>
                      </div>

                      <h1 className="text-4xl md:text-6xl font-bold leading-tight">{slide.title}</h1>

                      <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-2xl">{slide.description}</p>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                        >
                          Get Started Today
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-lg bg-transparent"
                        >
                          Learn More
                        </Button>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-8 pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">2500+</div>
                          <div className="text-blue-200 text-sm">Patents Filed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">1800+</div>
                          <div className="text-blue-200 text-sm">Trademarks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">950+</div>
                          <div className="text-blue-200 text-sm">Happy Clients</div>
                        </div>
                      </div>
                    </div>

                    {/* Image Side */}
                    <div className="relative">
                      <div className="relative z-10">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                          <img
                            src={slide.image || "/placeholder.svg"}
                            alt={slide.title}
                            className="w-full h-80 object-cover rounded-xl shadow-lg"
                          />
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-4 rounded-full shadow-lg transition-all duration-300 border border-white/30 group z-20"
        >
          <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-4 rounded-full shadow-lg transition-all duration-300 border border-white/30 group z-20"
        >
          <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Enhanced Dot Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide ? "w-12 h-3 bg-white shadow-lg" : "w-3 h-3 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-5000 ease-linear"
            style={{ width: `${((currentSlide + 1) / bannerSlides.length) * 100}%` }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-2000"></div>
      </section>

      {/* Main Content Area: Services on Left, Cart on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Tabbed Services */}
        <div className="flex-1">
          {/* Scrollable nav styled as tabs */}
          <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-8">
            <button onClick={() => scrollToSection('patent-services')} className="px-3 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Patent Services</button>
            <button onClick={() => scrollToSection('trademark-services')} className="px-3 py-2 rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100">Trademark Services</button>
            <button onClick={() => scrollToSection('copyright-services')} className="px-3 py-2 rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100">Copyright Services</button>
            <button onClick={() => scrollToSection('design-services')} className="px-3 py-2 rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100">Design Services</button>
          </div>

          {/* Patent Services */}
          <section id="patent-services" className="bg-blue-50 py-8 rounded-lg scroll-mt-24">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Patent Services</h2>
                <p className="text-lg text-gray-600 max-w-3xl">Comprehensive patent services to protect your innovations and inventions.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                {patentServices.map((service, index) => (
                  <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-7">
                      <div className="flex items-start justify-between">
                        <div className="p-3 bg-blue-100 rounded-full">{service.icon}</div>
                        <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                      </div>
                      <p className="text-gray-600 mt-4">
                        {service.description} Our experts perform in-depth analysis, draft precise documents, and guide you across the full lifecycle to maximize protection and value.
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-2xl font-bold text-blue-600">
                          {servicePricing[service.title] != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(servicePricing[service.title]) : 'Price not available'}
                        </span>
                        <Button onClick={() => openOptionsForService(service.title, 'Patent')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Select</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Trademark Services */}
          <section id="trademark-services" className="bg-neutral-50 py-8 rounded-lg mt-8 border border-neutral-200 scroll-mt-24">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Trademark Services</h2>
                <p className="text-lg text-gray-600 max-w-3xl">Protect your brand identity with tailored search, filing, and monitoring solutions.</p>
              </div>
              <div className="text-center py-12">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-neutral-100 ring-2 ring-neutral-200 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-neutral-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Coming soon</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">We’re polishing our trademark offerings. Meanwhile, explore our fully available patent services.</p>
                <div className="mt-6">
                  <Button variant="outline" className="border-neutral-200" onClick={() => scrollToSection('patent-services')}>
                    Explore Patent Services
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Copyright Services */}
          <section id="copyright-services" className="bg-neutral-50 py-8 rounded-lg mt-8 border border-neutral-200 scroll-mt-24">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Copyright Services</h2>
                <p className="text-lg text-gray-600 max-w-3xl">Safeguard creative works with registration, licensing, and enforcement support.</p>
              </div>
              <div className="text-center py-12">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-neutral-100 ring-2 ring-neutral-200 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-neutral-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Coming soon</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">We’re crafting copyright solutions to protect your creative work. Check back shortly.</p>
                <div className="mt-6">
                  <Button variant="outline" className="border-neutral-200" onClick={() => scrollToSection('patent-services')}>
                    Explore Patent Services
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Design Services */}
          <section id="design-services" className="bg-neutral-50 py-8 rounded-lg mt-8 border border-neutral-200 scroll-mt-24">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Design Services</h2>
                <p className="text-lg text-gray-600 max-w-3xl">Protect unique designs with strategic search, filing, and portfolio support.</p>
              </div>
              <div className="text-center py-12">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-neutral-100 ring-2 ring-neutral-200 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-neutral-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Coming soon</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">Our design protection services are nearly ready. Stay tuned!</p>
                <div className="mt-6">
                  <Button variant="outline" className="border-neutral-200" onClick={() => scrollToSection('patent-services')}>
                    Explore Patent Services
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Cart Section */}
        <div className="w-full lg:w-72 bg-gray-50 border border-gray-200 rounded-lg p-4 flex-shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="pb-4 border-b mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Scale className="h-5 w-5 mr-2 text-blue-600" />
              Service Cart
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                </div>
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add services to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.category}</p>
                      {item.details && (
                        <p className="text-[11px] text-gray-600 mt-1">{item.details}</p>
                      )}
                      <p className="text-sm font-semibold text-blue-600">{formatINR(item.price)}</p>
                    </div>
                    <Button
                      onClick={() => removeFromCart(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
         

          <div className="pt-4 border-t mt-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900">Total Estimate:</span>
              <span className="text-xl font-bold text-blue-600">{formatINR(getTotalPrice())}</span>
            </div>
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={goToQuotePage}>
                Go To Payments
              </Button> 
              
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  clearCart()
                }}
              >
                Clear Cart
              </Button>
            </div>
            {showOptionsPanel && (
              <Dialog open={showOptionsPanel} onOpenChange={(open) => { if (!open) closeOptionsPanel() }}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Options for: {selectedServiceTitle}</DialogTitle>
                    <DialogDescription>Select the options for this service.</DialogDescription>

                    {selectedServiceTitle === 'Drafting' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Specification Type</Label>
                          <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm((p) => ({ ...p, searchType: v, goodsServices: 'standard' }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choose specification" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ps">Provisional Specification (PS) — {formatINR(computeDraftingPrice("ps", "standard"))}</SelectItem>
                              <SelectItem value="cs">Complete Specification (CS) — {formatINR(computeDraftingPrice("cs", "standard"))}</SelectItem>
                              <SelectItem value="ps_cs">PS-CS — {formatINR(computeDraftingPrice("ps_cs", "standard"))}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <>
                          {optionsForm.searchType && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Turnaround</Label>
                              <Select value={optionsForm.goodsServices} onValueChange={(v) => setOptionsForm((p) => ({ ...p, goodsServices: v }))}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Choose turnaround" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="standard">Standard (12-15 days) — {formatINR(computeTurnaroundTotal("standard"))}</SelectItem>
                                  <SelectItem value="expediated">Expediated (8-10 Days) — {formatINR(expediatedDiff)}</SelectItem>
                                  <SelectItem value="rush">Rush (5-7 days) — {formatINR(rushDiff)}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {/* Fee Preview for Drafting */}
                          <div className="rounded-md border p-3 bg-gray-50 mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Professional Fee</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(draftingTotal || preview.total)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Government Fee</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(0)}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                              <span>Total</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(draftingTotal || preview.total)}</span>
                            </div>
                          </div>
                        </>
                      </>
                    )}

                    {selectedServiceTitle === 'Patent Application Filing' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Applicant Type</Label>
                              <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm((p) => ({ ...p, searchType: v, goodsServices: 'provisional_filing' }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choose applicant type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">SStart-Up/Individuals/MSMEs/Educational Institute{" "}
                                  {applicantPrices.individual !== undefined ? `— ₹${applicantPrices.individual}` : ""}</SelectItem>
                              <SelectItem value="others">Large Entity/Others{" "}
                                  {applicantPrices.others !== undefined ? `— ₹${applicantPrices.others}` : ""}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <>
                          {optionsForm.searchType && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Filing Type</Label>
                              <Select value={optionsForm.goodsServices} onValueChange={(v) => setOptionsForm((p) => ({ ...p, goodsServices: v }))}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Choose filing type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="provisional_filing">Provisional Filing (4 days) — {formatINR(computeFilingPrice("provisional_filing", optionsForm.searchType as any))}</SelectItem>
                                  <SelectItem value="complete_specification_filing">Complete Specification Filing (4 days) — {formatINR(computeFilingPrice("complete_specification_filing", optionsForm.searchType as any))}</SelectItem>
                                  <SelectItem value="ps_cs_filing">PS-CS Filing (4 days) — {formatINR(computeFilingPrice("ps_cs_filing", optionsForm.searchType as any))}</SelectItem>
                                  <SelectItem value="pct_filing">PCT Filing — {formatINR(computeFilingPrice("pct_filing", optionsForm.searchType as any))}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {/* Fee Preview for Patent Application Filing */}
                          <div className="rounded-md border p-3 bg-gray-50 mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Professional Fee</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(filingTotal || preview.total)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Government Fee</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(0)}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                              <span>Total</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(filingTotal || preview.total)}</span>
                            </div>
                          </div>
                        </>
                      </>
                    )}

                    {selectedServiceTitle === 'First Examination Response' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Response Due</Label>
                          <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm((p) => ({ ...p, searchType: v }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choose option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="base_fee">Base Fee (Response due date after 3 months) — {ferPrices.base_fee !== undefined ? formatINR(ferPrices.base_fee) : ""}</SelectItem>
                              <SelectItem value="response_due_anytime_after_15_days">Response due anytime after 15 days — {ferPrices.response_due_anytime_after_15_days !== undefined ? formatINR(ferPrices.response_due_anytime_after_15_days) : ""}</SelectItem>
                              <SelectItem value="response_due_within_11_15_days">Response due within 11-15 days — {ferPrices.response_due_within_11_15_days !== undefined ? formatINR(ferPrices.response_due_within_11_15_days) : ""}</SelectItem>
                              <SelectItem value="response_due_within_4_10_days">Response due within 4-10 days — {ferPrices.response_due_within_4_10_days !== undefined ? formatINR(ferPrices.response_due_within_4_10_days) : ""}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Fee Preview for First Examination Response */}
                        <div className="rounded-md border p-3 bg-gray-50 mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Professional Fee</span>
                            <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Government Fee</span>
                            <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(0)}</span>
                          </div>
                          <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </DialogHeader>

                  <TooltipProvider>
                    <div className="space-y-6 mb-4" style={{ display: selectedServiceTitle !== 'Patentability Search' ? 'none' : undefined }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-700">Search Type</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Select the scope of search and whether a legal opinion is included.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm((p) => ({ ...p, searchType: v, goodsServices: 'standard' }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose search type" />
                        </SelectTrigger>
 
                          <SelectContent>
                          <SelectItem value="quick">
                            Quick Knockout Search — {formatINR(basePricePS)}
                          </SelectItem>
                          <SelectItem value="full_without_opinion">
                            Full Patentability Search (Without Opinion) — {formatINR(DiffWithoutPS)}
                          </SelectItem>
                          <SelectItem value="full_with_opinion">
                            Full Patentability Search with Opinion — {formatINR(DiffWithPS)}
                          </SelectItem>
                        </SelectContent>
                         
                      </Select>
                    </div>

                    {optionsForm.searchType && (
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-700">Turnaround</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>Choose delivery speed. Faster options may add to the fee per rules.</TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={optionsForm.goodsServices} onValueChange={(v) => setOptionsForm((p) => ({ ...p, goodsServices: v }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Choose turnaround" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard (7-10 days) — {formatINR(computeTurnaroundTotal("standard"))}</SelectItem>
                            <SelectItem value="expediated">Expediated (3-5 Days) — {formatINR(expediatedDiff)}
</SelectItem>
                            <SelectItem value="rush">Rush (1-2 days) — {formatINR(rushDiff)}
</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="rounded-md border p-3 bg-gray-50">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Professional Fee</span>
                        <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Government Fee</span>
                        <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(0)}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(patentSearchTotal || preview.total)}</span>
                      </div>
                    </div>
                  </div>
                  </TooltipProvider>
           
                  <DialogFooter>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={addToCartWithOptions}
                      disabled={
                        (selectedServiceTitle === "Patentability Search" && (!optionsForm.searchType || !optionsForm.goodsServices)) ||
                        (selectedServiceTitle === "Drafting" && (!optionsForm.searchType || !optionsForm.goodsServices)) ||
                        (selectedServiceTitle === "Patent Application Filing" && (!optionsForm.searchType || !optionsForm.goodsServices)) ||
                        (selectedServiceTitle === "First Examination Response" && (!optionsForm.searchType))
                      }
                    >
                      Add
                    </Button>
                    <Button variant="outline" onClick={closeOptionsPanel}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">*Prices are estimates. Final costs may vary.</p>
          </div>
        </div>
      </div>

      {/* Reviews Carousel */}
    {/*}  <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What clients say</h2>
            <p className="text-gray-600 mt-2">Real feedback from founders, counsel, and operators</p>
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="min-h-[160px] relative">
              {reviews.map((r, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${idx === reviewIndex ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
                >
                  <div className="bg-gray-50 border rounded-xl p-6 md:p-8 shadow-sm">
                    <p className="text-lg md:text-xl text-gray-800 leading-relaxed">“{r.quote}”</p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <span key={`f-${i}`}>★</span>
                      ))}
                      {Array.from({ length: 5 - r.rating }).map((_, i) => (
                        <span key={`e-${i}`}>☆</span>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-600 text-center">— {r.name}, {r.role}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              aria-label="Previous review"
              onClick={() => setReviewIndex((i) => (i - 1 + reviews.length) % reviews.length)}
              className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border rounded-full p-2 shadow hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next review"
              onClick={() => setReviewIndex((i) => (i + 1) % reviews.length)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border rounded-full p-2 shadow hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${i === reviewIndex ? "w-6 bg-blue-600" : "w-2.5 bg-gray-300"}`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>*/}

{/* Milestone Counter (Full Width) */}
      <section id="milestones" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
            <p className="text-xl text-gray-600">
              Trusted by businesses worldwide for intellectual property protection
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {counters[milestone.key as keyof typeof counters].toLocaleString()}+
                </div>
                <div className="text-gray-600 font-medium">{milestone.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Unified Checkout Thank You Modal (home view) */}
      <CheckoutModal
        isOpen={showCheckoutThankYou}
        onClose={() => setShowCheckoutThankYou(false)}
        payment={checkoutPayment}
        orders={checkoutOrders}
        onProceedSingle={openFormEmbedded}
  onProceedMultiple={(orders) => { if (orders && orders.length > 0) openMultipleFormsEmbedded(orders) }}
      />
    </div>
  )
}