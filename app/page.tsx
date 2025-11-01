"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef, useMemo, Fragment } from "react"
import { OrderChatPopup } from '@/components/OrderChatPopup'
import { supabase } from '../lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { fetchOrdersMerged, invalidateOrdersCache } from '@/lib/orders'
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay'
import { fetchServicePricingRules, computePriceFromRules, ensurePatentrenderCache } from "@/utils/pricing";
import { computePatentabilityPrice } from '@/utils/pricing/services/patentabilitySearch'
import { computeDraftingPrice as draftingPriceHelper } from '@/utils/pricing/services/drafting'
import { usePricingPreview } from '@/hooks/usePricingPreview'
import { bannerSlides as staticBannerSlides } from "@/constants/data"
import { BannerCarousel } from '@/components/sections/BannerCarousel'
import { buildQuotationHtml as buildQuotationHtmlUtil, buildInvoiceWithFormsHtml } from '@/lib/quotation'
import AuthModal from "@/components/AuthModal"; // Adjust path
import { Footer } from "@/components/layout/Footer"
import { UserCircleIcon } from "@heroicons/react/24/outline";
import CheckoutLayer from '@/components/panels/CheckoutLayer'
import { debugLog } from '@/lib/logger'
// TypeScript/React
import { useAuthProfile } from "@/app/useAuthProfile"
import { useRouter } from 'next/navigation'
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
import FormClient from "./forms/FormClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ServicesPanel from '@/components/dashboard/ServicesPanel'
import FormsPanel from '@/components/dashboard/FormsPanel'
import ProfilePanel from '@/components/panels/ProfilePanel'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs components
import { resolveFormTypeFromOrderLike } from '@/components/utils/resolve-form-type'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import OptionsDialog from '@/components/panels/OptionsDialog'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
//import type { Session } from "@supabase/supabase-js"



export default function LegalIPWebsite() {
  // Global chat popup state (applies to orders table status -> Require Info)
  const [chatOrderId, setChatOrderId] = useState<number | null>(null)

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
  const openFormEmbedded = (o: any) => {
    try {
      console.debug('[openFormEmbedded] incoming order', o)
      const t = resolveFormTypeFromOrderLike(o)
      console.debug('[openFormEmbedded] resolved type', t)
      if (!t) { alert('No form available for this order'); return }
      // Enter single-form mode explicitly: clear any stale multi-form context
      setEmbeddedMultiForms(null)
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
  // Ensure we switch to single-form mode for the first order
  setEmbeddedMultiForms(null)
  openFormEmbedded(checkoutOrders[0])
}
  const {
  isAuthenticated,
  user,
  displayName,
  wantsCheckout,
  setWantsCheckout,
  handleGoogleLogin,
  handleLogout: hookLogout,
  upsertUserProfileFromSession,
} = useAuthProfile()
  const router = useRouter()
  const adminEmails = useMemo(() => (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean), [])
  const isAdmin = !!(user?.email && adminEmails.includes(user.email.toLowerCase()))
  const primaryAdminEmail = adminEmails[0]
  const isPrimaryAdmin = !!(user?.email && user.email.toLowerCase() === primaryAdminEmail)

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
  // Helper to open sign-in modal without touching cart/checkout state
  const openSignIn = () => {
    setAuthMode('signin')
    setShowAuthModal(true)
  }
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
  // Persist last view so we can restore Orders after tab-out/in or hard reload
  const LAST_VIEW_KEY = 'app:last_view'
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
  // Quotation preview modal state (inline PDF/HTML view)
  const [showQuotePreview, setShowQuotePreview] = useState(false)
  const [quotePreviewUrl, setQuotePreviewUrl] = useState<string | null>(null)
  // Inline Invoice (Invoice + Forms) preview state (replaces external window to avoid focus issues)
  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string | null>(null)
  const [showInvoicePreview, setShowInvoicePreview] = useState(false)
  const [embeddedMultiForms, setEmbeddedMultiForms] = useState<{id:number,type:string}[] | null>(null)
  // Resume notice shown when app returns to main after a long pause/reset
  const [resumeNotice, setResumeNotice] = useState<null | { view: 'orders' | 'profile' | 'forms' }>(null)
  // Note: auto-open/auto-dismiss disabled per user request
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

  // When landing on main screen, only show resume notice if a refresh/reset actually occurred
  // This is gated by a session flag set right before a programmatic reload.
  useEffect(() => {
    if (showQuotePage) { setResumeNotice(null); return }
    try {
      const shouldShow = sessionStorage.getItem('app_resume_notice') === '1'
      if (!shouldShow) return
      // one-shot: clear the flag
      sessionStorage.removeItem('app_resume_notice')
      const last = localStorage.getItem(LAST_VIEW_KEY) || ''
      if (last.startsWith('quote:')) {
        const v = last.split(':')[1] as any
        // If the last view was Orders (a dedicated page), restore it immediately instead
        // of showing a resume notice so tab-in takes the user straight back to Orders.
        if (v === 'orders') {
          // New policy: when hard-reset-on-blur is enabled, prefer returning to main instead of Orders
          if (process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1') {
            try { localStorage.setItem(LAST_VIEW_KEY, 'home') } catch {}
            return
          }
          try {
            // use the centralized navigation to prefetch and show orders
            goToOrders()
          } catch (e) {
            // fallback to showing notice if navigation fails
            setResumeNotice({ view: v })
          }
        } else if (v === 'profile' || v === 'forms' || v === 'services') {
          if ((v === 'profile' || v === 'forms' || v === 'services') && process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1') {
            try { localStorage.setItem(LAST_VIEW_KEY, 'home') } catch {}
            return
          }
          setResumeNotice({ view: v })
        }
      }
    } catch {}
  }, [showQuotePage])

  const handleOpenLastView = useCallback(() => {
    if (!resumeNotice) return
    if (resumeNotice.view === 'orders') {
      // Use centralized navigation that prefetches and handles session warm-up
      try { goToOrders() } catch {
        // Fallback to legacy path if something goes wrong
        setInitialQuoteView('orders'); setShowQuotePage(true); setQuoteView('orders')
        setTimeout(() => { try { setOrdersReloadKey(k => k + 1) } catch {} }, 50)
      }
    } else {
      setInitialQuoteView(resumeNotice.view)
      setShowQuotePage(true)
      setQuoteView(resumeNotice.view)
    }
    setResumeNotice(null)
  }, [resumeNotice, goToOrders])

  // Lightweight user-facing notice when returning to main after long pause/reset
  useEffect(() => {
    if (!resumeNotice || showQuotePage) return
    try {
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.bottom = '16px'
      container.style.right = '16px'
      container.style.zIndex = '99999'
      container.style.maxWidth = '360px'
      container.style.background = 'rgba(17,24,39,0.96)'
      container.style.color = '#f8fafc'
      container.style.padding = '12px 14px'
      container.style.borderRadius = '10px'
      container.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)'
      container.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif'
      container.style.fontSize = '13px'
      const title = document.createElement('div')
      title.style.fontWeight = '600'
      title.style.marginBottom = '6px'
      title.textContent = 'You were viewing the ' + (resumeNotice.view.charAt(0).toUpperCase() + resumeNotice.view.slice(1)) + ' screen'
      const msg = document.createElement('div')
      msg.style.opacity = '0.85'
      msg.style.marginBottom = '8px'
      msg.textContent = 'The app refreshed after a pause. You can reopen your last screen.'
      const actions = document.createElement('div')
      actions.style.display = 'flex'
      actions.style.gap = '8px'
      const openBtn = document.createElement('button')
      openBtn.textContent = 'Reopen'
      openBtn.style.background = '#2563eb'
      openBtn.style.color = '#fff'
      openBtn.style.border = 'none'
      openBtn.style.padding = '6px 10px'
      openBtn.style.borderRadius = '8px'
      openBtn.style.cursor = 'pointer'
  // Open immediately on click
  openBtn.onclick = () => { try { handleOpenLastView() } finally { try { document.body.removeChild(container) } catch {} } }
      actions.appendChild(openBtn)
      container.appendChild(title)
      container.appendChild(msg)
      container.appendChild(actions)
  document.body.appendChild(container)
  // Clean up on unmount or when notice changes
  return () => { try { document.body.removeChild(container) } catch {} }
    } catch {}
  }, [resumeNotice, showQuotePage, handleOpenLastView])

  // --- Status Logic Helpers ---
  // Heuristic: determine if core (required) form fields are filled, excluding upload or free-text comment style fields
  const formsCoreComplete = (o: any, debug = false): boolean => {
    try {
      const verbose = debug || process.env.NEXT_PUBLIC_DEBUG === '1'
      // Accept a few shapes: o.formResponses (array of key/value), o.form_values (object), o.forms (array)
      const uploadsFieldNames = new Set(['upload','uploads','attachments','files','file_upload'])
      const commentFieldNames = new Set(['comments','comment','notes','additional_instructions','instructions','message'])

      // Direct boolean shortcut (backend may already compute)
      if (o.form_core_complete === true) { if (verbose) console.debug('[formsCoreComplete] shortcut form_core_complete=true for order', o.id); return true }

      // If backend marks all forms filled but we still want to ignore uploads/comments, treat that as complete
      if (o.forms_filled === true && o.form_complete === true) { if (verbose) console.debug('[formsCoreComplete] shortcut forms_filled && form_complete for order', o.id); return true }

      // Object style: form_values (key -> value)
      if (o.form_values && typeof o.form_values === 'object') {
        const entries = Object.entries(o.form_values as Record<string, any>)
        if (entries.length === 0) { if (verbose) console.debug('[formsCoreComplete] form_values empty', { id: o.id }); return false }
        const missing: string[] = []
        for (const [k,v] of entries) {
          const key = k.toLowerCase()
            .replace(/\s+/g,'_')
          if (uploadsFieldNames.has(key) || commentFieldNames.has(key)) continue
          if (v === null || v === undefined) return false
          if (typeof v === 'string' && v.trim() === '') return false
          if (Array.isArray(v) && v.length === 0) return false
        }
        if (verbose) console.debug('[formsCoreComplete] form_values pass', { id: o.id })
        return true
      }

      // Array style: formResponses = [{ field, value }]
      if (Array.isArray(o.formResponses)) {
        if (o.formResponses.length === 0) { if (verbose) console.debug('[formsCoreComplete] formResponses empty', { id: o.id }); return false }
        const missing: string[] = []
        for (const r of o.formResponses) {
          const keyRaw = (r.field || r.name || r.key || '').toString().toLowerCase().replace(/\s+/g,'_')
          if (uploadsFieldNames.has(keyRaw) || commentFieldNames.has(keyRaw)) continue
          const val = r.value ?? r.val ?? r.answer
          if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0)) {
            missing.push(keyRaw)
          }
        }
        if (missing.length === 0) {
          if (verbose) console.debug('[formsCoreComplete] formResponses pass', { id: o.id })
          return true
        } else {
          if (verbose) console.debug('[formsCoreComplete] formResponses missing required core fields', { id: o.id, missing })
          return false
        }
      }

      // Fallback: treat dedicated flags
      // Relaxed logic: treat as complete if ANY strong signal present when no structures
      const filledFlags = [o.form_core_complete, o.forms_filled, o.form_complete].some(v => v === true)
      // Counter-style detection (various naming patterns): if filled >= 1 and (filled == total OR total > 0 and remaining <= 0)
      const possibleCounters = [
        { filled: o.filled_fields, total: o.total_fields },
        { filled: o.form_filled_count, total: o.form_field_count },
        { filled: o.completed_fields, total: o.required_fields },
      ]
      let countersIndicateComplete = false
      for (const c of possibleCounters) {
        const f = Number(c.filled)
        const t = Number(c.total)
        if (!Number.isNaN(f) && !Number.isNaN(t) && t > 0 && f >= t) { countersIndicateComplete = true; break }
        if (!Number.isNaN(f) && f > 0 && (Number.isNaN(t) || t === 0)) { countersIndicateComplete = true; break }
      }
      if (filledFlags || countersIndicateComplete) {
        if (verbose) console.debug('[formsCoreComplete] fallback heuristic complete', { id: o.id, filledFlags, countersIndicateComplete })
        return true
      }
      // Dynamic counter heuristic: scan keys for positive integers that imply user provided some answers
      // Patterns: *filled*, *answered*, *provided*, *completed*, *entered*
      let dynamicComplete = false
      if (!dynamicComplete) {
        try {
          const positiveKeys: string[] = []
          for (const [k,v] of Object.entries(o || {})) {
            if (typeof v !== 'number') continue
            if (v <= 0) continue
            const lk = k.toLowerCase()
            if (/(filled|answered|provided|completed|entered)/.test(lk)) {
              positiveKeys.push(`${k}=${v}`)
            }
          }
          if (positiveKeys.length > 0) {
            dynamicComplete = true
            if (verbose) console.debug('[formsCoreComplete] dynamic counter completion', { id: o.id, positiveKeys })
            return true
          }
        } catch {}
      }
      if (verbose) {
        const keys = Object.keys(o || {})
        console.debug('[formsCoreComplete] no structure matched -> incomplete', { id: o.id, keys })
      }
      return false
    } catch {
      if (process.env.NEXT_PUBLIC_DEBUG === '1') console.debug('[formsCoreComplete] exception treat as incomplete', { id: o?.id })
      return false
    }
  }
  // Derive status for a single order record. Adjust predicates as real fields become available.
  const deriveOrderStatus = (o: any): string => {
    // Revised ladder (with Assigned):
    // 1. Payment Pending (payment not captured)
    // 2. Details Required (core details incomplete OR require_info workflow)
    // 3. Details Completed (core details complete; excludes uploads/comments per existing core logic)
    // 4. Assigned (responsible set, no workflow status yet)
    // 5. In Progress (workflow_status = in_progress)
    // 6. Completed (workflow_status = completed)
    try {
      const paymentSucceeded = !!(
        (o.payments && ((o.payments as any).payment_status === 'paid' || (o.payments as any).status === 'captured')) ||
        o.payment_status === 'paid'
      )
      if (!paymentSucceeded) return 'Payment Pending'
  // New rule: treat 'submitted/confirmed' when at least one form_responses.completed=true for that order
  const confirmed = !!o.form_confirmed
  const coreDone = formsCoreComplete(o)
  if (!confirmed) return 'Details Required'
      const wf = (o.workflow_status || '').toLowerCase()
      if (wf === 'completed') return 'Completed'
      if (wf === 'require_info') return 'Details Required' // re-requested info supersedes other intermediate states
      if (wf === 'in_progress') return 'In Progress'
      // No workflow status yet; if responsible/assigned present, surface Assigned before just Details Completed
      const responsible = (o.responsible || o.assigned_to || '').trim()
      if (responsible) return 'Assigned'
      return 'Details Completed'
    } catch {
      return 'Payment Pending'
    }
  }

  // Aggregate status across all orders in a bundle (parent row)
  const aggregateBundleStatus = (orders: any[]): string => {
    if (!orders || orders.length === 0) return '—'
    // For multi-order bundles, show Details Required if ANY order is not confirmed yet; only show Details Completed when ALL are confirmed.
    const anyPaymentPending = orders.some(o => {
      const paymentSucceeded = !!(
        (o.payments && ((o.payments as any).payment_status === 'paid' || (o.payments as any).status === 'captured')) ||
        o.payment_status === 'paid'
      )
      return !paymentSucceeded
    })
    if (anyPaymentPending) return 'Payment Pending'
    const anyUnconfirmed = orders.some(o => !o.form_confirmed)
    if (anyUnconfirmed) return 'Details Required'
    const statuses = orders.map(deriveOrderStatus)
    // Precedence after confirmation: In Progress > Completed > Assigned > Details Completed
    if (statuses.some(s => s === 'Payment Pending')) return 'Payment Pending'
    // We've already enforced unconfirmed -> Details Required above
    if (statuses.some(s => s === 'In Progress')) return 'In Progress'
    if (statuses.every(s => s === 'Completed')) return 'Completed'
    if (statuses.some(s => s === 'Assigned')) return 'Assigned'
    return 'Details Completed'
  }
  // Track which multi-service bundles are expanded
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set())
  const toggleBundle = useCallback((key: string) => {
    setExpandedBundles(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])
  const [ordersLoadError, setOrdersLoadError] = useState<string | null>(null)
  // Embedded Forms selection state
  const [selectedFormOrderId, setSelectedFormOrderId] = useState<number | null>(null)
  const [selectedFormType, setSelectedFormType] = useState<string | null>(null)
  const [embeddedProfile, setEmbeddedProfile] = useState<any | null>(null)
  const [embeddedProfileSaving, setEmbeddedProfileSaving] = useState(false)
  const [embeddedProfileLoading, setEmbeddedProfileLoading] = useState(false)
  const embeddedProfileRetryRef = useRef(0)

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

  // Embedded Orders: transient banner for last opened form(s) when returning from Forms
  const [ordersLastFormBanner, setOrdersLastFormBanner] = useState<null | { single?: { orderId: number | null; formType: string | null; formTypeLabel?: string | null }; multi?: Array<{ orderId: number; formType: string | null; formTypeLabel?: string | null }> }>(null)
  const [ordersBannerVisible, setOrdersBannerVisible] = useState(false)
  useEffect(() => {
    if (quoteView !== 'orders') return
    const maybeShowBanner = () => {
      try {
        if (typeof document !== 'undefined' && document.hidden) return
        const raw = localStorage.getItem('app:last_form_ctx')
        if (!raw) return
        const parsed = JSON.parse(raw)
        const ts = typeof parsed?.ts === 'number' ? parsed.ts : 0
        if (ts && Date.now() - ts > 24 * 60 * 60 * 1000) { localStorage.removeItem('app:last_form_ctx'); return }
        if (parsed && Array.isArray(parsed.multi)) {
          const multi = parsed.multi
            .filter((e: any) => e && typeof e.orderId === 'number')
            .map((e: any) => ({ orderId: e.orderId as number, formType: (e.formType ?? null) as string | null, formTypeLabel: (e.formTypeLabel ?? null) as string | null }))
          if (multi.length === 0) { localStorage.removeItem('app:last_form_ctx'); return }
          setOrdersLastFormBanner({ multi })
        } else {
          const ctx = parsed as { orderId: number | null; formType: string | null; formTypeLabel?: string | null }
          setOrdersLastFormBanner({ single: { orderId: (ctx.orderId ?? null) as any, formType: (ctx.formType ?? null) as any, formTypeLabel: (ctx.formTypeLabel ?? null) as any } })
        }
        setOrdersBannerVisible(true)
        // Only show once per restore
        localStorage.removeItem('app:last_form_ctx')
        const t = setTimeout(() => setOrdersBannerVisible(false), 6000)
        return () => clearTimeout(t)
      } catch {}
    }
    maybeShowBanner()
    const onFocus = () => maybeShowBanner()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', maybeShowBanner)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', maybeShowBanner)
    }
  }, [quoteView])

  // Prefetch helper now delegates to unified fetchOrdersMerged with short retries for user session
  const prefetchOrders = useCallback(async (): Promise<any[]> => {
    const resolveUserId = async () => {
      const { data: sessionRes } = await supabase.auth.getSession()
      return sessionRes?.session?.user?.id || null
    }
    let userId = await resolveUserId()
    if (!userId) { await new Promise(r => setTimeout(r, 120)); userId = await resolveUserId() }
    if (!userId) { await new Promise(r => setTimeout(r, 180)); userId = await resolveUserId() }
    if (!userId) {
      console.debug('[Orders][prefetch] no user session; abort prefetch')
      setOrdersLoadError('You are not signed in. Please sign in to view orders.')
      return []
    }
    const { orders, error } = await fetchOrdersMerged(supabase, userId, { includeProfile: true, cacheMs: 5_000 })
    if (error) {
      setOrdersLoadError('Failed to load orders. Please retry.')
      return []
    }
    setOrdersLoadError(null)
    return orders
  }, [])

  // Persist last view whenever it changes — landing page only
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      // Only run this persister on the root landing route to avoid clobbering dedicated routes
      if (window.location.pathname !== '/') return
      const val = showQuotePage ? `quote:${quoteView}` : 'home'
      // In the dedicated-routes architecture, avoid persisting quote:* from the landing page.
      if (val.startsWith('quote:')) {
        // Dev beacon for visibility
        try {
          const pSkip = { event: 'last-view-save-skipped', reason: 'landing-skip-quote', next: val, pathname: window.location.pathname, ts: Date.now() }
          if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            try { navigator.sendBeacon('/api/debug-log', JSON.stringify(pSkip)) } catch {}
          } else {
            fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(pSkip) }).catch(() => {})
          }
        } catch {}
        return
      }
      // Optional lock: if a recent post-restore home was set, skip writing quote:* briefly
      if (val.startsWith('quote:')) {
        try {
          const lockTs = Number(localStorage.getItem('app:last_view_home_lock') || '0')
          if (lockTs && Date.now() - lockTs < 5000) {
            const pSkip = { event: 'last-view-save-skipped', reason: 'home-lock', next: val, pathname: window.location.pathname, ts: Date.now() }
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
              try { navigator.sendBeacon('/api/debug-log', JSON.stringify(pSkip)) } catch {}
            } else {
              fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(pSkip) }).catch(() => {})
            }
            return
          }
        } catch {}
      }
      // Guard: do not overwrite an existing quote:* value with 'home' on initial mount
      const prev = typeof window !== 'undefined' ? localStorage.getItem(LAST_VIEW_KEY) : null
      if (val === 'home' && prev && prev.startsWith('quote:')) {
        try {
          const pSkip = { event: 'last-view-save-skipped', reason: 'preserve-quote', prev, next: val, pathname: typeof window !== 'undefined' ? window.location.pathname : null, ts: Date.now() }
          if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            try { navigator.sendBeacon('/api/debug-log', JSON.stringify(pSkip)) } catch {}
          } else {
            fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(pSkip) }).catch(() => {})
          }
        } catch {}
        return
      }
      localStorage.setItem(LAST_VIEW_KEY, val)
      debugLog('[ViewPersist] save', { val })
      try {
        const p = { event: 'last-view-save', val, pathname: typeof window !== 'undefined' ? window.location.pathname : null, ts: Date.now() }
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          try { navigator.sendBeacon('/api/debug-log', JSON.stringify(p)) } catch {}
        } else {
          fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) }).catch(() => {})
        }
      } catch {}
    } catch {}
  }, [showQuotePage, quoteView])

  // Centralized navigation back to Orders view with prefetch before rendering Orders screen
  function goToOrders() {
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
    prefetchOrders()
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
  // Track loading state for Orders in a ref to avoid stale closures in timeouts
  const embeddedOrdersLoadingRef = useRef<boolean>(false)

  // Session warm-up without continuous polling: one immediate fetch + short burst retries, then rely on auth listener.
  useEffect(() => {
    let cancelled = false
    let attempts = 0
    const MAX_ATTEMPTS = 4
    const BASE_DELAY = 120
    const tryFetch = async () => {
      if (cancelled || attempts >= MAX_ATTEMPTS) return
      attempts += 1
      try {
        const { data: s } = await supabase.auth.getSession()
        const uid = s?.session?.user?.id || null
        if (uid) {
          lastKnownUserIdRef.current = uid
          return // stop burst on success
        }
      } catch (e) {
        if (process.env.NEXT_PUBLIC_DEBUG === '1') console.debug('[session][burst] err', e)
      }
      if (!cancelled && attempts < MAX_ATTEMPTS) {
        const delay = BASE_DELAY * attempts // simple linear backoff
        setTimeout(tryFetch, delay)
      }
    }
    tryFetch()
    return () => { cancelled = true }
  }, [])

  // (Removed duplicate corrupted session refresh block)

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
      embeddedOrdersLoadingRef.current = true
    } else {
      setEmbeddedOrdersLoading(true) // show inline spinner elsewhere if UI supports it
      embeddedOrdersLoadingRef.current = true
    }
    setOrdersLoadError(null)
    try {
      console.log("[Orders] Loading start")
      // Resolve user id with small retries
      const resolveUserId = async () => {
        const { data: sessionRes } = await supabase.auth.getSession()
        const uid = sessionRes?.session?.user?.id || null
        if (uid) lastKnownUserIdRef.current = uid
        return uid
      }
      let userId = await resolveUserId()
      if (!userId) { await new Promise(r => setTimeout(r, 150)); userId = await resolveUserId() }
      if (!userId) { await new Promise(r => setTimeout(r, 200)); userId = await resolveUserId() }
      if (!userId && lastKnownUserIdRef.current) userId = lastKnownUserIdRef.current
      if (!userId && checkoutPayment?.user_id) userId = checkoutPayment.user_id
      if (!userId && checkoutOrders.length > 0 && checkoutOrders[0]?.user_id) userId = checkoutOrders[0].user_id
      if (!userId) {
        if (active) {
          setEmbeddedOrders([])
          setOrdersLoadError('You are not signed in. Please sign in to view orders.')
          setEmbeddedOrdersLoading(false)
          embeddedOrdersLoadingRef.current = false
          ordersAbortedNoUserRef.current = true
        }
        return
      }

      const { orders: merged, error } = await fetchOrdersMerged(supabase, userId, { includeProfile: true, cacheMs: 8_000, force: true })
      if (error) {
        if (active) {
          setEmbeddedOrders([])
          setOrdersLoadError('Failed to load orders. Please retry.')
          setEmbeddedOrdersLoading(false)
          embeddedOrdersLoadingRef.current = false
        }
        return
      }
      console.debug('[Orders][load] orders fetched', { count: merged.length })
      if (merged.length === 0) {
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
          embeddedOrdersLoadingRef.current = false
        }
        console.debug('[Orders][load] early-return: zero orders')
        return
      }

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
  embeddedOrdersLoadingRef.current = false
      }
      console.debug('[Orders][load] early-return: exception path')
    } finally {
      if (active) {
  setEmbeddedOrdersLoading(false)
  embeddedOrdersLoadingRef.current = false
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
      if (active && embeddedOrdersLoadingRef.current) {
        console.warn('[Orders] Watchdog: still loading after timeout, forcing retry')
        loadOrders()
      }
    }, 4000)
    stuckTimer = setTimeout(() => {
      if (active && embeddedOrdersLoadingRef.current && Date.now() - loadStart > 6500) {
        console.warn('[Orders] Stuck load detected; surfacing error state')
        setEmbeddedOrdersLoading(false)
        embeddedOrdersLoadingRef.current = false
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


  // Load embedded Profile when switching to Profile or when auth becomes available
  useEffect(() => {
    const loadProfile = async (reason: string) => {
      try {
        setEmbeddedProfileLoading(true)
        const sess = await supabase.auth.getSession()
        const email = (sess as any)?.data?.session?.user?.email ?? null
        const userId = (sess as any)?.data?.session?.user?.id ?? null
        if (!email || !userId) {
          if (isAuthenticated && embeddedProfileRetryRef.current < 1) {
            embeddedProfileRetryRef.current += 1
            setTimeout(() => loadProfile('retry-auth-not-ready'), 160)
          } else {
            setEmbeddedProfile(null)
            setEmbeddedProfileLoading(false)
          }
          return
        }
        embeddedProfileRetryRef.current = 0
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
      } finally {
        setEmbeddedProfileLoading(false)
      }
    }
    if (quoteView === 'profile' && isAuthenticated) {
      loadProfile('enter-profile')
    }
  }, [quoteView, isAuthenticated, user?.id, supabase])

  const refreshEmbeddedProfile = useCallback(() => {
    if (quoteView !== 'profile') return
    embeddedProfileRetryRef.current = 0
    ;(async () => {
      try {
        setEmbeddedProfileLoading(true)
        const sess = await supabase.auth.getSession()
        const email = (sess as any)?.data?.session?.user?.email ?? null
        const userId = (sess as any)?.data?.session?.user?.id ?? null
        if (!email || !userId) { setEmbeddedProfile(null); setEmbeddedProfileLoading(false); return }
        let prof: any | null = null
        const { data: byId } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, company, phone, address, city, state, country')
          .eq('id', userId)
          .maybeSingle()
        if (byId) prof = byId
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
        console.error('[Profile] manual refresh failed', e)
      } finally {
        setEmbeddedProfileLoading(false)
      }
    })()
  }, [quoteView, supabase])

  // Auto-refresh profile when window regains focus after external tab (e.g., invoice) if profile was empty or still loading too long
  useEffect(() => {
    if (quoteView !== 'profile') return
    const handleFocusProfile = () => {
      if (quoteView === 'profile') {
        // If no profile loaded or previous load flagged error/empty, attempt refresh
        if (!embeddedProfile && !embeddedProfileLoading) {
          debugLog('[Profile][focus-refresh] triggering refresh (missing profile)')
          refreshEmbeddedProfile()
        }
      }
    }
    window.addEventListener('focus', handleFocusProfile)
    return () => window.removeEventListener('focus', handleFocusProfile)
  }, [quoteView, embeddedProfile, embeddedProfileLoading, refreshEmbeddedProfile])

  // Single delayed retry if profile stays null for 1.2s after entering profile view
  useEffect(() => {
    if (quoteView !== 'profile') return
    if (embeddedProfile || embeddedProfileLoading) return
    const t = setTimeout(() => {
      if (quoteView === 'profile' && !embeddedProfile && !embeddedProfileLoading) {
        debugLog('[Profile][delayed-retry] attempting one retry load')
        refreshEmbeddedProfile()
      }
    }, 1200)
    return () => clearTimeout(t)
  }, [quoteView, embeddedProfile, embeddedProfileLoading, refreshEmbeddedProfile])

  // Universal focus/visibility refresher for Orders & Profile reliability
  useEffect(() => {
    if (!showQuotePage) return
    const handleVisOrFocus = () => {
      // Orders: if current view is orders and list is empty (no error & not loading) schedule a reload bump
      if (quoteView === 'orders') {
        const noData = !embeddedOrders || embeddedOrders.length === 0
        if (noData && !embeddedOrdersLoading && !ordersLoadError) {
          debugLog('[UniversalRefresh][orders] bump reload key (empty on focus)')
          setOrdersReloadKey(k => k + 1)
        }
      } else if (quoteView === 'profile') {
        // Profile: if missing (not loading) trigger refresh
        if (!embeddedProfile && !embeddedProfileLoading) {
          debugLog('[UniversalRefresh][profile] refresh embedded profile (missing)')
          refreshEmbeddedProfile()
        }
      }
    }
    window.addEventListener('focus', handleVisOrFocus)
    document.addEventListener('visibilitychange', handleVisOrFocus)
    return () => {
      window.removeEventListener('focus', handleVisOrFocus)
      document.removeEventListener('visibilitychange', handleVisOrFocus)
    }
  }, [showQuotePage, quoteView, embeddedOrders, embeddedOrdersLoading, ordersLoadError, embeddedProfile, embeddedProfileLoading, refreshEmbeddedProfile])

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

// Pricing: cache-first load with in-flight guard; uses JSON from localStorage via ensurePatentrenderCache
const pricingLoadInFlightRef = useRef(false)
const PATENTRENDER_CACHE_KEY = useMemo(() => `pricing:patentrender:v${process.env.NEXT_PUBLIC_PRICING_CACHE_VER || '1'}`,[process.env.NEXT_PUBLIC_PRICING_CACHE_VER])
const mapPatentrenderToPricing = (row: any): Record<string, number> => ({
  'Patentability Search': Number(row?.patent_search ?? 0),
  'Drafting': Number(row?.patent_application ?? 0),
  'Patent Application Filing': Number(row?.patent_portfolio ?? 0),
  'First Examination Response': Number(row?.first_examination ?? 0),
  'Trademark Search': Number(row?.trademark_search ?? 0),
  'Trademark Registration': Number(row?.trademark_registration ?? 0),
  'Trademark Monitoring': Number(row?.trademark_monitoring ?? 0),
  'Copyright Registration': Number(row?.copyright_registration ?? 0),
  'DMCA Services': Number(row?.dmca_services ?? 0),
  'Copyright Licensing': Number(row?.copyright_licensing ?? 0),
  'Design Registration': Number(row?.design_registration ?? 0),
  'Design Search': Number(row?.design_search ?? 0),
  'Design Portfolio': Number(row?.design_portfolio ?? 0),
})

const fetchPricing = useCallback(async () => {
  if (pricingLoadInFlightRef.current) return
  pricingLoadInFlightRef.current = true
  try {
    // 1) Cache-first: try localStorage JSON immediately to avoid 0s on tab return
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(PATENTRENDER_CACHE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          const formatted = mapPatentrenderToPricing(parsed)
          if (Object.values(formatted).some((v) => v > 0)) {
            setServicePricing(formatted)
          }
        }
      } catch {}
    }

    // 2) Ensure cache from DB if needed, then set pricing
    const row = await ensurePatentrenderCache()
    if (row) {
      setServicePricing(mapPatentrenderToPricing(row))
    } else {
      console.log("No pricing data found in 'patentrender'.")
    }
  } finally {
    setLoading(false)
    pricingLoadInFlightRef.current = false
  }
}, [PATENTRENDER_CACHE_KEY])

// Initial pricing load on mount: seed from localStorage JSON, then fetch/cache
useEffect(() => {
  // Seed from local JSON first for immediate UI
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(PATENTRENDER_CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        const formatted = mapPatentrenderToPricing(parsed)
        if (Object.values(formatted).some((v) => v > 0)) {
          setServicePricing(formatted)
        }
      }
    }
  } catch {}
  // Then ensure cache and refresh state
  fetchPricing()
}, [fetchPricing, PATENTRENDER_CACHE_KEY])

// Main screen (landing) focus/visibility/pageshow refresh: only when missing, mirroring Orders/Profile missing-only behavior
useEffect(() => {
  if (showQuotePage) return // only apply to main/landing screen
  const handler = () => {
    // Only act when tab is visible
    if (typeof document !== 'undefined' && document.visibilityState && document.visibilityState !== 'visible') return
    const hasPricing = servicePricing && Object.keys(servicePricing).length > 0
    if (!hasPricing && !pricingLoadInFlightRef.current) {
      fetchPricing()
    }
  }
  window.addEventListener('focus', handler)
  document.addEventListener('visibilitychange', handler)
  window.addEventListener('pageshow', handler)
  return () => {
    window.removeEventListener('focus', handler)
    document.removeEventListener('visibilitychange', handler)
    window.removeEventListener('pageshow', handler)
  }
}, [showQuotePage, servicePricing, fetchPricing])


  const [bannerSlides, setBannerSlides] = useState(staticBannerSlides)
  const bannerOverrideAppliedRef = useRef(false)

  useEffect(() => {
    // New logic: by default ALWAYS use static /public img_1..4.
    // Only override when a full replacement set is available AND feature flag explicitly enabled.
  if (process.env.NEXT_PUBLIC_ENABLE_BANNER_API !== '1') return
  if (bannerOverrideAppliedRef.current) return
    let cancelled = false
    const loadBanners = async () => {
      try {
        const res = await fetch('/api/banner-images', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const images: Array<{ url: string; filename: string }> = Array.isArray(json.images) ? json.images : []
        // Apply partial override: if we have at least one image, cycle them across slides
        if (!cancelled && images.length > 0) {
          const slides = staticBannerSlides.map((s: any, idx: number) => ({
            ...s,
            image: images[idx % images.length].url || s.image,
          }))
          bannerOverrideAppliedRef.current = true
          setBannerSlides(slides as any)
          setCurrentSlide(0)
          console.debug('[Banner] remote override applied', { count: images.length })
        } else {
          if (!cancelled) console.debug('[Banner] remote override skipped (no images found)')
        }
      } catch (e) {
        console.debug('[Banner] remote load failed; using static images', e)
      }
    }
    loadBanners()
    return () => { cancelled = true }
  }, [])

  // Soft recovery after idle when RESET_ON_FOCUS is disabled: rehydrate pricing/orders without hard reload
  const SOFT_RECOVER_MS = useMemo(() => Number(process.env.NEXT_PUBLIC_SOFT_RECOVER_MS || '45000'), [])
  useEffect(() => {
    const RESET_ON_FOCUS = process.env.NEXT_PUBLIC_RESET_ON_FOCUS === '1'
    if (RESET_ON_FOCUS) return // hard-refresh path handles recovery
    const LAST_ACTIVE_KEY = 'app:last_active_ts'
    const touch = (src: string) => { try { localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now())) } catch {} }
    const onAny = () => touch('any')
    const onHideShow = () => touch('vis')
    const onFocus = () => {
      try {
        const raw = localStorage.getItem(LAST_ACTIVE_KEY)
        const last = raw ? Number(raw) : 0
        const idle = last ? (Date.now() - last) : SOFT_RECOVER_MS + 1
        if (idle >= SOFT_RECOVER_MS) {
          // Main screen: ensure pricing/state rehydrates
          if (!showQuotePage) {
            setVisibilityTick(t => t + 1)
            fetchPricing()
          } else {
            // Dashboard: nudge Orders/Profile views
            if (quoteView === 'orders') {
              setOrdersReloadKey(k => k + 1)
            } else if (quoteView === 'profile' && !embeddedProfileLoading) {
              try { refreshEmbeddedProfile() } catch {}
            }
          }
        }
      } catch {}
      // Always update last active on focus
      touch('focus')
    }
    // Seed
    touch('mount')
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onHideShow)
    window.addEventListener('pointerdown', onAny, true)
    window.addEventListener('keydown', onAny, true)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onHideShow)
      window.removeEventListener('pointerdown', onAny, true)
      window.removeEventListener('keydown', onAny, true)
    }
  }, [showQuotePage, quoteView, SOFT_RECOVER_MS, fetchPricing, embeddedProfileLoading, refreshEmbeddedProfile])

const patentServices = [
    {
      title: "Patentability Search",
      description: "A patentability (novelty) search identifies whether your invention meets patent criteria—novelty, utility, and non-obviousness. It reviews prior patents, applications, and publications that could affect protection. Our experts conduct detailed analysis, prepare clear reports, and guide you through the process to strengthen your innovation and maximize its protection potential.",
      icon: <Scale className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Drafting",
      description: "Patent drafting transforms your invention into a precise legal document defining its scope and protection. Our experts craft strong claims, clear specifications, and compliant drawings to meet global standards. Every draft is prepared strategically to secure broad protection, ensure clarity, and support future commercialization or licensing.",
      icon: <Shield className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Patent Application Filing",
      description: "Patent filing is the formal step toward securing protection for your invention. We handle documentation, jurisdiction-specific requirements, and complete submission to patent offices. Our team ensures accuracy, compliance, and timely filing—streamlining your path from application to patent grant with minimal hassle.",
      icon: <Award className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "First Examination Response",
      description: "The first examination response addresses objections raised by the patent examiner. Our professionals analyze each objection, prepare well-reasoned clarifications or amendments, and ensure compliance with patent laws. We focus on protecting your claims, strengthening your application, and guiding it smoothly toward a successful grant.",
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
    // If user is inside the dashboard (quote view), perform a hard reset, close it, then scroll after repaint
    const RESET_ON_MAIN = process.env.NEXT_PUBLIC_RESET_ON_MAIN === '1'
    const CART_RESET_ON_MAIN = process.env.NEXT_PUBLIC_CART_RESET_ON_MAIN === '1'
    const FORCE_REFRESH_ON_MAIN = process.env.NEXT_PUBLIC_FORCE_REFRESH_ON_MAIN === '1'
    const refreshNow = (reason?: string) => {
      // eslint-disable-next-line no-console
      console.debug('[AppRefresh] programmatic reset firing', {
        reason: reason || 'unknown',
        from: 'scrollToSection',
        ts: new Date().toISOString(),
      })
      try {
        const w = window as any
        const force = reason === 'menu-scroll'
        if (force && typeof w.triggerAppResetForce === 'function') {
          // eslint-disable-next-line no-console
          console.debug('[AppRefresh] using window.triggerAppResetForce()', { reason })
          w.triggerAppResetForce(reason)
          return
        }
        if (typeof w.triggerAppReset === 'function') {
          // eslint-disable-next-line no-console
          console.debug('[AppRefresh] using window.triggerAppReset()', { reason })
          w.triggerAppReset()
          return
        }
        // Fallback to event-based trigger if button is mounted but global fn not found yet
        try {
          // eslint-disable-next-line no-console
          console.debug('[AppRefresh] dispatching app:refresh event (no global yet)', { reason, force })
          window.dispatchEvent(new CustomEvent('app:refresh', { detail: { force, reason } }))
        } catch {}
        // Minimal retry: attempt global again shortly in case the button mounts right after
        setTimeout(() => {
          try {
            const w2 = window as any
            if (force && typeof w2.triggerAppResetForce === 'function') {
              // eslint-disable-next-line no-console
              console.debug('[AppRefresh] retry using window.triggerAppResetForce()', { reason })
              w2.triggerAppResetForce(reason);
              return
            }
            if (typeof w2.triggerAppReset === 'function') {
              // eslint-disable-next-line no-console
              console.debug('[AppRefresh] retry using window.triggerAppReset()', { reason })
              w2.triggerAppReset();
              return
            }
          } catch {}
          // Final fallback: local throttled reload identical to the button
          const now2 = Date.now()
          const last2 = Number(localStorage.getItem('app_manual_refresh_ts') || '0')
          if (now2 - last2 < 3000 && !force) return // throttle unless forced
          localStorage.setItem('app_manual_refresh_ts', String(now2))
          window.location.reload()
        }, 100)
        const now = Date.now()
        const last = Number(localStorage.getItem('app_manual_refresh_ts') || '0')
        if (now - last < 3000 && !force) return // throttle unless forced
        localStorage.setItem('app_manual_refresh_ts', String(now))
        window.location.reload()
      } catch {
        window.location.reload()
      }
    }
    const hardResetLandingState = (reason: string, opts?: { clearCart?: boolean }) => {
      try {
        // Stop any focus guard activity and clear related timers/flags
        try { stopFocusGuard('hard-reset:' + reason) } catch {}
        try { setIsProcessingPayment(false) } catch {}
        try { setPaymentInterrupted(false) } catch {}
        try { setFocusViolationReason(null); setFocusViolationCount(0) } catch {}
        try { if (paymentBlurTimerRef.current) clearTimeout(paymentBlurTimerRef.current) } catch {}
        try { if (focusBlurTimerRef.current) clearTimeout(focusBlurTimerRef.current) } catch {}
        try { if (focusVisibilityTimerRef.current) clearTimeout(focusVisibilityTimerRef.current) } catch {}
        try { (suppressFocusGuardRef as any).current = false } catch {}
        try { (lastExternalOpenRef as any).current = null } catch {}

        // Reset embedded forms context and any checkout UI
        try { setEmbeddedMultiForms(null); setSelectedFormOrderId(null as any); setSelectedFormType(null as any) } catch {}
        try { setShowCheckoutThankYou(false) } catch {}

        // Reset options panel and selections
        try { setShowOptionsPanel(false); resetOptionsForm(); setSelectedServiceTitle(null); setSelectedServiceCategory(null) } catch {}

        // Clear persisted selection keys so home re-computes cleanly
        try { localStorage.removeItem(SELECTED_SERVICE_TITLE_KEY) } catch {}
        try { localStorage.removeItem(SELECTED_SERVICE_CATEGORY_KEY) } catch {}
        try { localStorage.removeItem(OPTIONS_FORM_KEY) } catch {}
        // Optional: clear Safari refresh heuristics to avoid stale state
        try { localStorage.removeItem('safari_refresh_ts'); localStorage.removeItem('safari_refresh_attempts') } catch {}

        // Optionally clear cart to test Add button freshness
        const winFlag = (typeof window !== 'undefined') && ((window as any).CART_RESET_ON_MAIN === true || (window as any).RESET_ON_MAIN === true)
        if (opts?.clearCart || winFlag) {
          try { clearCart() } catch {}
        }
      } catch {}
    }
    if (showQuotePage) {
      // eslint-disable-next-line no-console
      console.debug('[AppRefresh] menu-scroll hardResetLandingState', {
        RESET_ON_MAIN,
        CART_RESET_ON_MAIN,
        FORCE_REFRESH_ON_MAIN,
        showQuotePage,
        ts: new Date().toISOString(),
      })
      hardResetLandingState('menu-scroll', { clearCart: CART_RESET_ON_MAIN || RESET_ON_MAIN })
      // Optionally perform a full page refresh (same as blue reset button) when returning to main via menu
      const winForce = (typeof window !== 'undefined') && ((window as any).FORCE_REFRESH_ON_MAIN === true || (window as any).RESET_ON_MAIN === true)
      if (FORCE_REFRESH_ON_MAIN || winForce) {
        // eslint-disable-next-line no-console
        console.debug('[AppRefresh] FORCE refresh on menu return', { winForce })
        refreshNow('menu-scroll')
        return
      }
  setShowQuotePage(false)
  // Return to landing screen; ensure a valid quoteView value is set for when dashboard is reopened
  setQuoteView('services')
      setSelectedFormOrderId(null)
      setSelectedFormType(null)
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 80)
      return
    }
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-invoke the reset button (full reload) when resizing on the main screen, behind a feature flag
  useEffect(() => {
    const RESET_ON_RESIZE = process.env.NEXT_PUBLIC_RESET_ON_RESIZE === '1'
    const handler = () => {
      const winFlag = (typeof window !== 'undefined') && ((window as any).RESET_ON_RESIZE === true)
      if (!RESET_ON_RESIZE && !winFlag) return
      // If tab is hidden, don't reload immediately; mark to refresh on focus/visibility
      if (typeof document !== 'undefined' && (document as any).hidden) {
        try {
          localStorage.setItem('app_refresh_on_focus', '1')
          localStorage.setItem('app_prev_dims_on_hide', `${window.innerWidth}x${window.innerHeight}`)
        } catch {}
        return
      }
      // If we're inside the dashboard, set a pending marker to force-refresh when we return to landing
      if (showQuotePage) {
        try {
          localStorage.setItem('app_refresh_on_main', '1')
          // eslint-disable-next-line no-console
          console.debug('[AppRefresh] resize in dashboard -> set pending refresh marker')
        } catch {}
        return
      }
      // eslint-disable-next-line no-console
      console.debug('[AppRefresh] resize detected -> will trigger programmatic reset', {
        RESET_ON_RESIZE,
        winFlag,
        showQuotePage,
        ts: new Date().toISOString(),
      })
      // Debounce a bit so we refresh after the resize ends
      try { if ((handler as any)._t) clearTimeout((handler as any)._t) } catch {}
      ;(handler as any)._t = setTimeout(() => {
        try {
          try {
            const dpr = (window as any).devicePixelRatio || 1
            const scr = (window as any).screen
            const screenSize = (scr && typeof scr.width === 'number' && typeof scr.height === 'number') ? `${scr.width}x${scr.height}` : ''
            const payload = {
              reason: 'resize',
              ts: Date.now(),
              details: {
                dims: `${window.innerWidth}x${window.innerHeight}`,
                dpr,
                screen: screenSize,
                showQuotePage,
                RESET_ON_RESIZE,
                winFlag,
              }
            }
            localStorage.setItem('app_debug_refresh', JSON.stringify(payload))
          } catch {}
          const w = window as any
          if (typeof w.triggerAppReset === 'function') {
            // eslint-disable-next-line no-console
            console.debug('[AppRefresh] resize -> using window.triggerAppReset()')
            w.triggerAppReset();
            return
          }
          // eslint-disable-next-line no-console
          console.debug('[AppRefresh] resize -> dispatching app:refresh event (no global yet)')
          try { window.dispatchEvent(new Event('app:refresh')) } catch {}
        } catch {}
        // Fallback if globals not available yet
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
  }, [showQuotePage])

  // If a resize happened while in dashboard, force-refresh as soon as we return to landing
  useEffect(() => {
    if (showQuotePage) return
    const RESET_ON_RESIZE = process.env.NEXT_PUBLIC_RESET_ON_RESIZE === '1'
    const winFlag = (typeof window !== 'undefined') && ((window as any).RESET_ON_RESIZE === true)
    if (!RESET_ON_RESIZE && !winFlag) return
    try {
      const pending = localStorage.getItem('app_refresh_on_main') === '1'
      if (pending) {
        // eslint-disable-next-line no-console
        console.debug('[AppRefresh] returning to landing -> consuming pending refresh marker (forced)')
        localStorage.removeItem('app_refresh_on_main')
        try {
          const dpr = (window as any).devicePixelRatio || 1
          const scr = (window as any).screen
          const screenSize = (scr && typeof scr.width === 'number' && typeof scr.height === 'number') ? `${scr.width}x${scr.height}` : ''
          const payload = {
            reason: 'resize-pending',
            ts: Date.now(),
            details: {
              dims: `${window.innerWidth}x${window.innerHeight}`,
              dpr,
              screen: screenSize,
            }
          }
          localStorage.setItem('app_debug_refresh', JSON.stringify(payload))
        } catch {}
        const w: any = window
        if (typeof w.triggerAppResetForce === 'function') {
          w.triggerAppResetForce('resize-pending')
          return
        }
        try { window.dispatchEvent(new CustomEvent('app:refresh', { detail: { force: true, reason: 'resize-pending' } })) } catch {}
        const now = Date.now()
        localStorage.setItem('app_manual_refresh_ts', String(now))
        window.location.reload()
      }
    } catch {}
  }, [showQuotePage])

  // If the tab was resized while hidden (backgrounded), force-refresh when it becomes visible again
  useEffect(() => {
    const RESET_ON_RESIZE = process.env.NEXT_PUBLIC_RESET_ON_RESIZE === '1'
    const RESET_ON_FOCUS = process.env.NEXT_PUBLIC_RESET_ON_FOCUS === '1'
    const FORCE_REFRESH_ON_FOCUS_MS = Number(process.env.NEXT_PUBLIC_FORCE_REFRESH_ON_FOCUS_MS || '0') || 0
    const winFlag = (typeof window !== 'undefined') && ((window as any).RESET_ON_RESIZE === true)
    if (!RESET_ON_RESIZE && !winFlag && !RESET_ON_FOCUS && FORCE_REFRESH_ON_FOCUS_MS <= 0) return

    const updateDims = () => {
      try { localStorage.setItem('app_last_seen_dims', `${window.innerWidth}x${window.innerHeight}`) } catch {}
    }
    const onVisChange = () => {
      try {
        if (document.hidden) {
          // Capture dims at the moment we got hidden
          localStorage.setItem('app_prev_dims_on_hide', `${window.innerWidth}x${window.innerHeight}`)
          localStorage.setItem('app_prev_dpr_on_hide', String((window as any).devicePixelRatio || 1))
          try {
            const scr = (window as any).screen
            if (scr && typeof scr.width === 'number' && typeof scr.height === 'number') {
              localStorage.setItem('app_prev_screen_on_hide', `${scr.width}x${scr.height}`)
            }
          } catch {}
          localStorage.setItem('app_hidden_at', String(Date.now()))
          return
        }
        // Became visible
        const marker = localStorage.getItem('app_refresh_on_focus') === '1'
        const prev = localStorage.getItem('app_prev_dims_on_hide') || ''
        const nowDims = `${window.innerWidth}x${window.innerHeight}`
        const prevDpr = localStorage.getItem('app_prev_dpr_on_hide') || ''
        const nowDpr = String((window as any).devicePixelRatio || 1)
        const prevScreen = localStorage.getItem('app_prev_screen_on_hide') || ''
        let nowScreen = ''
        try {
          const scr = (window as any).screen
          if (scr && typeof scr.width === 'number' && typeof scr.height === 'number') {
            nowScreen = `${scr.width}x${scr.height}`
          }
        } catch {}
        const changedDims = !!prev && prev !== nowDims
        const changedDpr = !!prevDpr && prevDpr !== nowDpr
        const changedScreen = !!prevScreen && nowScreen && prevScreen !== nowScreen
        const hiddenAt = Number(localStorage.getItem('app_hidden_at') || '0')
        const hiddenDur = hiddenAt ? (Date.now() - hiddenAt) : 0
        const longHidden = FORCE_REFRESH_ON_FOCUS_MS > 0 && hiddenDur >= FORCE_REFRESH_ON_FOCUS_MS
        if (marker || changedDims || changedDpr || changedScreen || RESET_ON_FOCUS || longHidden) {
          try {
            const payload = {
              reason: 'resize-hidden',
              ts: Date.now(),
              details: {
                marker,
                prevDims: prev || null,
                nowDims,
                prevDpr: prevDpr || null,
                nowDpr,
                prevScreen: prevScreen || null,
                nowScreen: nowScreen || null,
                hiddenDur,
                longHidden,
              }
            }
            localStorage.setItem('app_debug_refresh', JSON.stringify(payload))
          } catch {}
          localStorage.removeItem('app_refresh_on_focus')
          localStorage.removeItem('app_prev_dims_on_hide')
          localStorage.removeItem('app_prev_dpr_on_hide')
          localStorage.removeItem('app_prev_screen_on_hide')
          const w: any = window
          if (typeof w.triggerAppResetForce === 'function') {
            w.triggerAppResetForce('resize-hidden')
            return
          }
          try { window.dispatchEvent(new CustomEvent('app:refresh', { detail: { force: true, reason: 'resize-hidden' } })) } catch {}
          const now = Date.now()
          localStorage.setItem('app_manual_refresh_ts', String(now))
          window.location.reload()
        }
      } catch {}
    }
    document.addEventListener('visibilitychange', onVisChange)
    window.addEventListener('resize', updateDims)
    // seed current dims
    updateDims()
    return () => {
      document.removeEventListener('visibilitychange', onVisChange)
      window.removeEventListener('resize', updateDims)
    }
  }, [])

  // Debug overlay: show why the last auto-refresh was triggered (if enabled)
  useEffect(() => {
    const DEBUG_REFRESH = process.env.NEXT_PUBLIC_DEBUG_REFRESH === '1'
    const winDebug = (typeof window !== 'undefined') && ((window as any).DEBUG_REFRESH === true)
    // Only show the overlay when BOTH flags are enabled explicitly
    if (!(DEBUG_REFRESH && winDebug)) return
    try {
      const raw = localStorage.getItem('app_debug_refresh')
      if (!raw) return
      const info = JSON.parse(raw)
      // Keep it available only for this first visible load
      localStorage.removeItem('app_debug_refresh')
      const ts = info?.ts || Date.now()
      if (Date.now() - ts > 15000) return // too old
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
      title.textContent = 'Auto refresh debug'
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
      // auto-hide
      setTimeout(() => { try { document.body.removeChild(container) } catch {} }, 8000)
    } catch {}
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }

  // Helper to programmatically return to landing page and reset dashboard state
  const goHome = useCallback(() => {
    setShowQuotePage(false)
    setInitialQuoteView('services')
    setQuoteView('services')
    setSelectedFormOrderId(null)
    setSelectedFormType(null)
    setIsOpen(false)
    requestAnimationFrame(() => { try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {} })
  }, [])

  // --- Tab-out -> Tab-in policy for Orders, Profile & Forms (landing dashboard) ---
  // If the dashboard is visible and the current view is Orders, Profile, or Forms, mark a flag so that on focus/return
  // we go back to the main screen instead of keeping that view open. Controlled by env flag.
  useEffect(() => {
    const FORCE_RESET_ON_BLUR = process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1'
    if (!FORCE_RESET_ON_BLUR) return
    const onBlur = () => {
      try {
        // Orders/Profile/Forms within dashboard
        if (showQuotePage && (quoteView === 'orders' || quoteView === 'profile' || quoteView === 'forms')) {
          localStorage.setItem('app:return_home_on_focus', '1')
          // Also set last_view=home proactively to prevent restoring the dashboard view
          try { localStorage.setItem('app:last_view', 'home') } catch {}
          try {
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
              navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'dashboard-blur-set-home', view: quoteView, ts: Date.now() }))
            }
          } catch {}
        }
      } catch {}
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [showQuotePage, quoteView])

  // On focus/visibility/pageshow, consume the marker and return to the main screen.
  useEffect(() => {
    const FORCE_RESET_ON_BLUR = process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1'
    if (!FORCE_RESET_ON_BLUR) return
    const maybeReturnHome = () => {
      try {
        const marker = localStorage.getItem('app:return_home_on_focus') === '1'
        if (!marker) return
        localStorage.removeItem('app:return_home_on_focus')
        // If currently in Orders/Profile/Forms dashboard, close it; otherwise keep main as-is
        if (showQuotePage && (quoteView === 'orders' || quoteView === 'profile' || quoteView === 'forms')) {
          goHome()
        }
      } catch {}
    }
    const onVis = () => { if (document.visibilityState === 'visible') maybeReturnHome() }
    window.addEventListener('focus', maybeReturnHome)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pageshow', maybeReturnHome)
    return () => {
      window.removeEventListener('focus', maybeReturnHome)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pageshow', maybeReturnHome)
    }
  }, [showQuotePage, quoteView, goHome])

  // On first mount, restore last view if saved (so Orders view comes back after reload)
  useEffect(() => {
    // Clean up Supabase OAuth params (?code, ?state, etc.) after OAuth redirects
    try {
      if (typeof window !== 'undefined') {
        const u = new URL(window.location.href)
        const hasAuthParams = u.searchParams.has('code') || u.searchParams.has('state') || u.searchParams.has('error') || u.searchParams.has('error_description')
        if (hasAuthParams) {
          // Mark that we came back from an OAuth redirect so we can do a one-time hard refresh after sign-in completes
          try { sessionStorage.setItem('app:oauthRefreshPending', '1') } catch {}
          // Allow a short delay for Supabase to exchange the code, then strip params without navigation
          setTimeout(() => {
            try {
              const clean = `${u.origin}${u.pathname}${u.hash || ''}`
              window.history.replaceState({}, '', clean)
            } catch {}
            // Force a one-time hard reload after stripping OAuth params to ensure full, clean hydration
            try {
              const lastRefreshed = Number(sessionStorage.getItem('app:oauthRefreshedAt') || '0')
              const tooRecent = Date.now() - lastRefreshed < 5000
              if (!tooRecent) {
                sessionStorage.setItem('app:oauthRefreshedAt', String(Date.now()))
                const cleanNow = `${u.origin}${u.pathname}${u.hash || ''}`
                setTimeout(() => {
                  try { window.location.replace(cleanNow) } catch { window.location.href = cleanNow }
                }, 120)
                return // don't run focus refresh path below; page will reload
              }
            } catch {}
            // Focus refresh: after OAuth exchange completes, re-assert focus to the page content
            try {
              const focusMain = () => {
                const heading = document.getElementById('page-heading') as HTMLElement | null
                if (heading) {
                  try { heading.focus() } catch {}
                  return
                }
                const mainEl = document.querySelector('main[role="main"]') as HTMLElement | null
                if (mainEl) {
                  const prev = mainEl.getAttribute('tabindex')
                  try { mainEl.setAttribute('tabindex', '-1') } catch {}
                  try { mainEl.focus({ preventScroll: true } as any) } catch {}
                  // restore original tabindex after focus
                  setTimeout(() => {
                    try {
                      if (prev != null) mainEl.setAttribute('tabindex', prev)
                      else mainEl.removeAttribute('tabindex')
                    } catch {}
                  }, 0)
                }
              }
              // run now and on next frame for reliability
              focusMain()
              requestAnimationFrame(focusMain)
            } catch {}
          }, 300)
        }
      }
    } catch {}
    try {
      // Dev/ops controls to disable or clear last-view restore
      const DISABLE_LAST_VIEW = process.env.NEXT_PUBLIC_DISABLE_LAST_VIEW === '1'
      const search = (typeof window !== 'undefined') ? window.location.search : ''
      const urlHasFresh = typeof search === 'string' && /(?:[?&])fresh=1\b/.test(search)
      if (DISABLE_LAST_VIEW || urlHasFresh) {
        try {
          localStorage.removeItem(LAST_VIEW_KEY)
          // Optionally clean the URL if fresh=1 was used
          if (urlHasFresh && typeof window !== 'undefined') {
            try {
              const u = new URL(window.location.href)
              u.searchParams.delete('fresh')
              window.history.replaceState({}, '', u.toString())
            } catch {}
          }
        } catch {}
        return
      }
      const last = localStorage.getItem(LAST_VIEW_KEY)
      debugLog('[ViewPersist] mount-restore check', { last })
      if (last === 'quote:orders') {
        setInitialQuoteView('orders')
        setShowQuotePage(true)
        debugLog('[ViewPersist] mount-restore -> orders')
        return
      }
      if (last === 'quote:profile') {
        setInitialQuoteView('profile')
        setShowQuotePage(true)
        debugLog('[ViewPersist] mount-restore -> profile')
        return
      }
      if (last === 'quote:services') {
        if (process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1') {
          try { localStorage.setItem(LAST_VIEW_KEY, 'home') } catch {}
          return
        }
        setInitialQuoteView('services')
        setShowQuotePage(true)
        debugLog('[ViewPersist] mount-restore -> services')
        return
      }
      // Forms should restore to Orders (requirement): treat saved forms as orders
      if (last === 'quote:forms') {
        if (process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1') {
          try { localStorage.setItem(LAST_VIEW_KEY, 'home') } catch {}
          return
        }
        try {
          // Prefer dedicated Orders route so URL matches the screen
          router.push('/orders')
          try { navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'mount-restore-forms->orders-route', ts: Date.now() })) } catch {}
        } catch {
          // Fallback to embedded Orders view if routing fails for any reason
          setInitialQuoteView('orders')
          setShowQuotePage(true)
        }
        debugLog('[ViewPersist] mount-restore -> forms mapped to orders')
        return
      }
    } catch {}
  }, [])

  // Ensure direct loads to '/' default to landing ONLY if no saved quote view
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.pathname !== '/') return
    try {
      const last = localStorage.getItem(LAST_VIEW_KEY)
      if (last && last.startsWith('quote:')) return
    } catch {}
    setShowQuotePage(false)
    setInitialQuoteView('services')
    setQuoteView('services')
  }, [])

  // On visibility gain, if we somehow landed on Home but the saved view was Orders, auto-navigate back
  useEffect(() => {
    const handleVisRestore = () => {
      try {
        // Terminal/debug helper: post a small payload to server to record visibility events
        try {
          const lastSaved = typeof window !== 'undefined' ? localStorage.getItem(LAST_VIEW_KEY) : null
          const p = {
            event: 'visibility-restore',
            pathname: typeof window !== 'undefined' ? window.location.pathname : null,
            lastSaved,
            showQuotePage: !!showQuotePage,
            quoteView: showQuotePage ? quoteView : null,
            ts: Date.now(),
          }
          console.debug('[ViewPersist][debug] visibility-restore', p)
          if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            try { navigator.sendBeacon('/api/debug-log', JSON.stringify(p)) } catch {}
          } else {
            fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) }).catch(() => {})
          }
        } catch {}

        // Only run this restore logic when we're on the root landing path.
        // If the user is on a dedicated route like /orders or /main, don't mutate view state.
        if (typeof window !== 'undefined' && window.location.pathname !== '/') return
        if (document.hidden) {
          // Persist the current view on tab-out so we can restore accurately
          // Map forms -> orders so coming back lands on Orders instead of Forms
          let val = showQuotePage ? `quote:${quoteView}` : 'home'
          if (val === 'quote:forms') val = 'quote:orders'
          // Guard: avoid clobbering a saved quote:* entry with 'home'
          try {
            const prev = localStorage.getItem(LAST_VIEW_KEY)
            if (val === 'home' && prev && prev.startsWith('quote:')) {
              const pSkip = { event: 'last-view-saved-on-hide-skipped', reason: 'preserve-quote', prev, next: val, pathname: typeof window !== 'undefined' ? window.location.pathname : null, ts: Date.now() }
              if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
                try { navigator.sendBeacon('/api/debug-log', JSON.stringify(pSkip)) } catch {}
              } else {
                fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(pSkip) }).catch(() => {})
              }
            } else {
              localStorage.setItem(LAST_VIEW_KEY, val)
            }
          } catch { localStorage.setItem(LAST_VIEW_KEY, val) }
          debugLog('[ViewPersist] tab-hide save', { val })
          try {
            const p = { event: 'last-view-saved-on-hide', val, pathname: typeof window !== 'undefined' ? window.location.pathname : null, ts: Date.now() }
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
              try { navigator.sendBeacon('/api/debug-log', JSON.stringify(p)) } catch {}
            } else {
              fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) }).catch(() => {})
            }
          } catch {}
          return
        }
        // Became visible
        const last = localStorage.getItem(LAST_VIEW_KEY)
        debugLog('[ViewPersist] visible', { last, showQuotePage, quoteView })
  if (last === 'quote:orders') {
          // Prefer dedicated /orders route on restore when available — navigate there so URL matches the screen
          debugLog('[ViewPersist] restoring orders on visible (route)')
          try {
            const p = { event: 'rendering-saved-screen', lastSaved: last, pathname: typeof window !== 'undefined' ? window.location.pathname : null, ts: Date.now() }
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
              try { navigator.sendBeacon('/api/debug-log', JSON.stringify(p)) } catch {}
            } else {
              fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) }).catch(() => {})
            }
          } catch {}

          // If we're not already on /orders, navigate there. Otherwise fall back to embedded Orders behavior.
          try {
            if (typeof window !== 'undefined' && window.location.pathname !== '/orders') {
              try {
                // Use router.push so client-side navigation goes to dedicated Orders page
                router.push('/orders')
                try { navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'route-push-orders', ts: Date.now() })) } catch {}
              } catch (e) {
                // Fallback to embedded behavior if router push fails
                setShowQuotePage(true)
                setQuoteView('orders')
                requestAnimationFrame(() => { try { debugLog('[ViewPersist] visible -> goToOrders(rAF)'); goToOrders(); try { navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'goToOrders-called', ts: Date.now() })) } catch {} } catch {} })
              }
            } else {
              // already on /orders or server-side: show embedded orders
              setShowQuotePage(true)
              setQuoteView('orders')
              try {
                requestAnimationFrame(() => { try { debugLog('[ViewPersist] visible -> goToOrders(rAF)'); goToOrders(); try { navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'goToOrders-called', ts: Date.now() })) } catch {} } catch {} })
              } catch {}
            }
          } catch {}
        } else if (last === 'quote:forms') {
          // Requirement: restoring from Forms should land on Orders (unless forced reset policy is on)
          if (process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1') {
            try { localStorage.setItem(LAST_VIEW_KEY, 'home') } catch {}
            return
          }
          debugLog('[ViewPersist] restoring forms -> orders on visible (route)')
          try {
            const p = { event: 'rendering-saved-screen', lastSaved: last, pathname: typeof window !== 'undefined' ? window.location.pathname : null, ts: Date.now() }
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
              try { navigator.sendBeacon('/api/debug-log', JSON.stringify(p)) } catch {}
            } else {
              fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) }).catch(() => {})
            }
          } catch {}

          try {
            if (typeof window !== 'undefined' && window.location.pathname !== '/orders') {
              try {
                router.push('/orders')
                try { navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'route-push-orders-from-forms', ts: Date.now() })) } catch {}
              } catch (e) {
                // Fallback to embedded Orders behavior if router push fails
                setShowQuotePage(true)
                setQuoteView('orders')
                requestAnimationFrame(() => { try { debugLog('[ViewPersist] visible -> goToOrders(rAF)'); goToOrders(); try { navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'goToOrders-called-from-forms', ts: Date.now() })) } catch {} } catch {} })
              }
            } else {
              // already on /orders or server-side: show embedded orders
              setShowQuotePage(true)
              setQuoteView('orders')
              try {
                requestAnimationFrame(() => { try { debugLog('[ViewPersist] visible -> goToOrders(rAF)'); goToOrders(); try { navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'goToOrders-called-from-forms', ts: Date.now() })) } catch {} } catch {} })
              } catch {}
            }
          } catch {}
        } else if (last === 'quote:profile') {
          // Prefer dedicated /profile route on restore so URL matches the screen
          debugLog('[ViewPersist] restoring profile on visible (route)')
          try {
            const p = { event: 'rendering-saved-screen', lastSaved: last, pathname: typeof window !== 'undefined' ? window.location.pathname : null, ts: Date.now() }
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
              try { navigator.sendBeacon('/api/debug-log', JSON.stringify(p)) } catch {}
            } else {
              fetch('/api/debug-log', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) }).catch(() => {})
            }
          } catch {}

          try {
            if (typeof window !== 'undefined' && window.location.pathname !== '/profile') {
              try {
                router.push('/profile')
                try { navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: 'route-push-profile', ts: Date.now() })) } catch {}
              } catch (e) {
                // Fallback to embedded Profile behavior if router push fails
                setShowQuotePage(true)
                setQuoteView('profile')
              }
            } else {
              // already on /profile or server-side: show embedded profile
              setShowQuotePage(true)
              setQuoteView('profile')
            }
          } catch {}
        } else if (last === 'quote:services') {
          // Restore Services (Make Payment) view inside the dashboard
          if (process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1') {
            try { localStorage.setItem(LAST_VIEW_KEY, 'home') } catch {}
            return
          }
          debugLog('[ViewPersist] restoring services on visible')
          setShowQuotePage(true)
          setQuoteView('services')
        }
      } catch {}
    }
    document.addEventListener('visibilitychange', handleVisRestore)
    window.addEventListener('focus', handleVisRestore)
    window.addEventListener('pageshow', handleVisRestore)
    return () => {
      document.removeEventListener('visibilitychange', handleVisRestore)
      window.removeEventListener('focus', handleVisRestore)
      window.removeEventListener('pageshow', handleVisRestore)
    }
  }, [showQuotePage, quoteView])
 
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
  debugLog('addToCart - newItem', newItem)
    setCartItems((prev) => {
      const next = [...prev, newItem]
      try { localStorage.setItem("cart_items_v1", JSON.stringify(next)) } catch {}
      return next
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.id !== id)
      try { localStorage.setItem("cart_items_v1", JSON.stringify(next)) } catch {}
      return next
    })
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0)
  }

  const clearCart = () => {
  setCartItems([])
  try { localStorage.removeItem("cart_items_v1") } catch {}
  }

  // Sidebar cart visibility (Orders/Profile screens): show only if there is at least one item and total > 0
  const cartTotal = getTotalPrice()
  const hasCartLineItems = cartItems.length > 0 && cartTotal > 0
 
  // Ensure we persist the latest cart in case of abrupt navigations (e.g., OAuth redirects)
  useEffect(() => {
    const handler = () => {
      try { localStorage.setItem('cart_items_v1', JSON.stringify(cartItems)) } catch {}
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [cartItems])
 
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
      // If we're currently inside the dashboard and the force-refresh-on-main flag is enabled,
      // trigger the same hard reload path as the manual blue button so state is completely fresh.
      const FORCE_REFRESH_ON_MAIN = process.env.NEXT_PUBLIC_FORCE_REFRESH_ON_MAIN === '1'
      const winForce = (typeof window !== 'undefined') && ((window as any).FORCE_REFRESH_ON_MAIN === true || (window as any).RESET_ON_MAIN === true)
      if (showQuotePage && (FORCE_REFRESH_ON_MAIN || winForce)) {
        try {
          const w: any = window
          if (typeof w.triggerAppResetForce === 'function') {
            console.debug('[AppRefresh] nav:go-section -> triggerAppResetForce')
            w.triggerAppResetForce('menu-scroll')
            return
          }
          console.debug('[AppRefresh] nav:go-section -> dispatch app:refresh (forced)')
          window.dispatchEvent(new CustomEvent('app:refresh', { detail: { force: true, reason: 'menu-scroll' } }))
          return
        } catch {}
      }
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

  // Live fee preview state and pricing rules (rules fetched here; derived pricing via usePricingPreview hook)
  const [pricingRules, setPricingRules] = useState<any[] | null>(null)
  const [preview, setPreview] = useState({ total: 0, professional: 0, government: 0 })
  // Versioned cache keys for localStorage persistence to survive tab suspends
  const CACHE_VER = process.env.NEXT_PUBLIC_PRICING_CACHE_VER || '1'
  const SELECTED_SERVICE_TITLE_KEY = `pricing:selectedServiceTitle:v${CACHE_VER}`
  const SELECTED_SERVICE_CATEGORY_KEY = `pricing:selectedServiceCategory:v${CACHE_VER}`
  const OPTIONS_FORM_KEY = `pricing:optionsForm:v${CACHE_VER}`
  const rulesKeyFor = (name: string) => `pricing:rules:byName:${name}:v${CACHE_VER}`
  // Hook-managed derived pricing values
  const [visibilityTick, setVisibilityTick] = useState(0) // declared earlier previously; keep ordering consistent
  const pricingDerived = usePricingPreview({
    pricingRules,
    selectedServiceTitle,
    optionsForm,
    servicePricing,
    visibilityTick,
  })
  const { applicantPrices, ferPrices, patentSearchTotal, draftingTotal, filingTotal, ferTotal } = pricingDerived
  // Safari: when tab is backgrounded some derived prices show 0 until next interaction.
  // Track visibility changes to force recalculation.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVis = () => { if (!document.hidden) setVisibilityTick(t => t + 1) }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Persist selection and options to localStorage for resilience across tab suspends
  useEffect(() => {
    try {
      if (selectedServiceTitle) localStorage.setItem(SELECTED_SERVICE_TITLE_KEY, selectedServiceTitle)
      else localStorage.removeItem(SELECTED_SERVICE_TITLE_KEY)
    } catch {}
  }, [selectedServiceTitle])
  useEffect(() => {
    try {
      if (selectedServiceCategory) localStorage.setItem(SELECTED_SERVICE_CATEGORY_KEY, selectedServiceCategory)
      else localStorage.removeItem(SELECTED_SERVICE_CATEGORY_KEY)
    } catch {}
  }, [selectedServiceCategory])
  useEffect(() => {
    try {
      localStorage.setItem(OPTIONS_FORM_KEY, JSON.stringify(optionsForm))
    } catch {}
  }, [optionsForm])

  // Hydrate persisted selection and options on mount
  useEffect(() => {
    try {
      const s = localStorage.getItem(SELECTED_SERVICE_TITLE_KEY)
      if (s) setSelectedServiceTitle(s)
    } catch {}
    try {
      const c = localStorage.getItem(SELECTED_SERVICE_CATEGORY_KEY)
      if (c) setSelectedServiceCategory(c)
    } catch {}
    try {
      const raw = localStorage.getItem(OPTIONS_FORM_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setOptionsForm(prev => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [])

  // Nudge recomputations also on window focus (Safari sometimes fails visibilitychange alone)
  useEffect(() => {
    const onFocus = () => {
      if (!showQuotePage && typeof window !== 'undefined' && window.location.pathname === '/') {
        setVisibilityTick(t => t + 1)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [showQuotePage])

  // Safari targeted hard refresh (main landing page only) if pricing context was likely GC'd
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|chromium|android/i.test(navigator.userAgent)
    if (!isSafari) return
    let lastPreviewTotal: number | null = preview.total
    const handleVisReload = () => {
      if (document.hidden) return
      // Only run on root path
      if (window.location.pathname !== '/') return
      // Heuristic group:
      // A) Options panel open & selected service present but zero total while rules exist
      const condA = showOptionsPanel && !!selectedServiceTitle && pricingRules && pricingRules.length > 0 && preview.total === 0
      // B) Previously had a non-zero total then after tab return it is zero while rules exist (state loss)
      const condB = (lastPreviewTotal !== null && lastPreviewTotal > 0 && preview.total === 0 && pricingRules && pricingRules.length > 0)
      // C) Selected service set (user mid-flow) but both preview total and all per-service pricing aggregates (if any) zero
      // (We only have preview.total directly here; broader aggregates could be added)
  const condC = showOptionsPanel && !!selectedServiceTitle && preview.total === 0 && pricingRules && pricingRules.length > 0
      const needsReload = condA || condB || condC
      if (needsReload) {
        // Prevent reload loop: store last reload ts
        const last = Number(localStorage.getItem('safari_refresh_ts') || '0')
        const attempts = Number(localStorage.getItem('safari_refresh_attempts') || '0')
        const now = Date.now()
        if (attempts < 2 && (now - last > 4000)) {
          try {
            localStorage.setItem('safari_refresh_ts', String(now))
            localStorage.setItem('safari_refresh_attempts', String(attempts + 1))
          } catch {}
          window.location.reload()
        } else {
          // Fallback: if we hit attempt cap, try a soft state nudge by updating visibilityTick
          setVisibilityTick(t => t + 1)
        }
      }
      lastPreviewTotal = preview.total
    }
    document.addEventListener('visibilitychange', handleVisReload)
    return () => document.removeEventListener('visibilitychange', handleVisReload)
  }, [showOptionsPanel, selectedServiceTitle, pricingRules, preview.total])
 
  // Load pricing rules when modal opens
  useEffect(() => {
    const loadRules = async () => {
      if (!showOptionsPanel || !selectedServiceTitle) {
        setPricingRules(null)
        return
      }
      // Preload cached rules by service name for instant totals
      try {
        const cached = localStorage.getItem(rulesKeyFor(selectedServiceTitle))
        if (cached) {
          const arr = JSON.parse(cached)
          if (Array.isArray(arr) && arr.length > 0) setPricingRules(arr)
        }
      } catch {}

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
        // keep any cached rules if present
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
        try { localStorage.setItem(rulesKeyFor(selectedServiceTitle), JSON.stringify(rules)) } catch {}
      } catch (e) {
        console.error("Failed to load pricing rules:", e)
        // if cached rules were set earlier, keep them; otherwise null
      }
    }
    loadRules()
  }, [showOptionsPanel, selectedServiceTitle, visibilityTick])
 

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

 
  // (Removed legacy per-service pricing helpers now provided via usePricingPreview hook)


  const handleOptionsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).map((f) => f.name)
    setOptionsForm((prev) => ({ ...prev, proofFileNames: files }))
  }

  // When focusing a form in multi-form mode, scroll it into view & flash highlight
  useEffect(() => {
    if (!embeddedMultiForms || !selectedFormOrderId) return
    const el = document.getElementById(`embedded-form-${selectedFormOrderId}`)
    if (!el) return
    try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }) } catch {}
    el.classList.add('ring-2','ring-amber-400','ring-offset-2')
    const t = setTimeout(() => {
      el.classList.remove('ring-2','ring-amber-400','ring-offset-2')
    }, 1600)
    return () => clearTimeout(t)
  }, [selectedFormOrderId, embeddedMultiForms])

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

    // Derive selected turnaround / filing key. For Patent Application Filing we want a filing key.
    let selectedTurnaround = optionsForm.goodsServices && optionsForm.goodsServices !== "0"
      ? optionsForm.goodsServices
      : "standard"
    if (selectedServiceTitle === "Patent Application Filing") {
      const filingKeys = new Set([
        "provisional_filing",
        "complete_specification_filing",
        "ps_cs_filing",
        "pct_filing",
      ])
      // If user hasn't explicitly chosen a filing type yet (value is 'standard' or something invalid),
      // default to provisional_filing so pricing & form mapping are correct.
      if (!filingKeys.has(selectedTurnaround)) {
        selectedTurnaround = 'provisional_filing'
      }
    }

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
    let serviceId: number | null = null
    try {
      const { data: svc, error: svcErr } = await supabase
        .from("services")
        .select("id")
        .eq("name", selectedServiceTitle)
        .maybeSingle()
      if (!svcErr && svc?.id) {
        serviceId = svc.id
      }
    } catch (e) {
      console.warn('[Cart] Service lookup failed, using local map', e)
    }
    if (serviceId == null) {
      const mapped = serviceIdByName[selectedServiceTitle as keyof typeof serviceIdByName]
      serviceId = typeof mapped === 'number' ? mapped : null
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
  debugLog("[Cart] Add with options", {
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
      // For filing, we already normalized selectedTurnaround above; just assign.
      pricingKey = selectedTurnaround
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
   
  debugLog("[Cart] Determined pricing key:", pricingKey)
   
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
    // Provide pricing/mapping keys so order creation can derive correct form type
    pricing_key: pricingKey || undefined,
    service_pricing_key: pricingKey || undefined,
    type: pricingKey || undefined,
    }
  console.debug('options-panel add - newItem', newItem)
    try {
      setCartItems((prev) => {
        const next = [...prev, newItem]
        try { localStorage.setItem('cart_items_v1', JSON.stringify(next)) } catch {}
        return next
      })
    } finally {
      // Always close the panel so the user sees the cart update even if background pricing calls had issues
      closeOptionsPanel()
    }
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
      setWantsCheckout(true) // mark intent so auth listener can continue
      setAuthMode('signin')
      setShowAuthModal(true)
      return
    }
    setIsOpen(false)
    setInitialQuoteView('services')
    setShowQuotePage(true)
    setQuoteView('services')
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
  const { data: sub } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
  debugLog("[auth] event", { event, hasUser: !!session?.user })
    if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
      upsertUserProfileFromSession()
      setShowAuthModal(false)
      if (event === "SIGNED_IN" && session?.user) {
  upsertUserProfileFromSession()
  setShowAuthModal(false)

  // Prime Orders: ensure first entry to Orders sees a fresh load
  setOrdersReloadKey(k => k + 1)

  // Strip OAuth query params once sign-in completes to keep URL clean
  try {
    if (typeof window !== 'undefined') {
      const u = new URL(window.location.href)
      if (u.search) {
        const hasAuthParams = u.searchParams.has('code') || u.searchParams.has('state') || u.searchParams.has('error') || u.searchParams.has('error_description')
        if (hasAuthParams) {
          const clean = `${u.origin}${u.pathname}${u.hash || ''}`
          window.history.replaceState({}, '', clean)
        }
      }
    }
  } catch {}

  if (wantsCheckout) {
    setShowQuotePage(true)
    setWantsCheckout(false)
  }
}
      // One-time hard refresh after OAuth sign-in completes (or initial session on redirect), to fully stabilize UI state
      try {
        if (typeof window !== 'undefined') {
          const pending = sessionStorage.getItem('app:oauthRefreshPending')
          const lastRefreshed = Number(sessionStorage.getItem('app:oauthRefreshedAt') || '0')
          const tooRecent = Date.now() - lastRefreshed < 5000

          // Heuristic: some browsers may return without query params due to intermediate navigations.
          // If we detect a new authenticated session and either the URL still has auth params
          // OR the referrer was a Supabase auth domain, force a one-time hard refresh even if the flag wasn't set.
          let needsHeuristic = false
          try {
            const u = new URL(window.location.href)
            const hasAuthParams = u.searchParams.has('code') || u.searchParams.has('state') || u.searchParams.has('error') || u.searchParams.has('error_description')
            const ref = document.referrer || ''
            const fromSupabase = /\b.supabase\.co\b/.test(ref) || /supabase\.co/.test(ref)
            needsHeuristic = !tooRecent && (hasAuthParams || fromSupabase)
          } catch {}

          if (pending === '1' || needsHeuristic) {
            try { sessionStorage.removeItem('app:oauthRefreshPending') } catch {}
            try { sessionStorage.setItem('app:oauthRefreshedAt', String(Date.now())) } catch {}
            const loc = window.location
            const clean = `${loc.origin}${loc.pathname}${loc.hash || ''}`
            // Small delay to ensure Supabase session is fully persisted before reload
            setTimeout(() => {
              try { window.location.replace(clean) } catch { window.location.href = clean }
            }, 150)
          }
        }
      } catch {}
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
      setShowAuthModal(false)
      setIsOpen(false)
      resetAuthForm()
      // Only clear the cart on explicit logout; leave cart intact on OAuth sign-in redirect
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
  try {
    // Derive site origin via env (preferred) or window (fallback)
    let siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).trim();
    // Remove any trailing slash to avoid double '//' when concatenating path
    siteUrl = siteUrl.replace(/\/$/, '');
    const redirectTo = `${siteUrl}/reset-password`;
    if (process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.debug('[ForgotPassword] using redirectTo', redirectTo);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(authForm.email, { redirectTo });
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Password reset email sent! Check your inbox.");
    }
  } catch (e: any) {
    console.error('[ForgotPassword] unexpected failure', e);
    alert('Unexpected error initiating password reset.');
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
// Relaxed grace periods to reduce false positives during payment popup rendering
const BLUR_GRACE_MS = 1800 // was 600ms – allow brief focus shifts (e.g. Razorpay internal iframe focus)
const VISIBILITY_GRACE_MS = 1200 // was 400ms – tolerate transient visibility changes

// --- External Window / Invoice Open Suppression ---
// When generating invoices we open a new tab (window.open) which triggers a blur/visibility change.
// That was being interpreted as a potential focus violation causing downstream UI glitches when returning.
// We temporarily suppress focus guard reactions for a short window after opening.
const suppressFocusGuardRef = useRef(false)
const lastExternalOpenRef = useRef<number | null>(null)

// Classify which violations are truly high‑risk (we sign the user out) vs low‑risk (warn first)
const isHighRiskViolation = (reason: string) => {
  return reason === 'before-unload' || reason.startsWith('meta-')
}

const startFocusGuard = useCallback(() => {
  if (focusGuardActive) return
  setFocusViolationReason(null)
  setFocusViolationCount(0)
  focusGuardStartedAtRef.current = Date.now()
  focusLastOkRef.current = Date.now()
  setFocusGuardActive(true)
  debugLog('[FocusGuard] started')
}, [focusGuardActive])

const stopFocusGuard = useCallback((label: string) => {
  if (!focusGuardActive) return
  setFocusGuardActive(false)
  if (focusBlurTimerRef.current) clearTimeout(focusBlurTimerRef.current)
  if (focusVisibilityTimerRef.current) clearTimeout(focusVisibilityTimerRef.current)
  debugLog('[FocusGuard] stopped', { label })
}, [focusGuardActive])

// Central interruption routine – now selective: preserves session for low-risk reasons
const interruptPayment = useCallback(async (reason: string) => {
  if (!isProcessingPayment) return
  if (paymentInterrupted) return
  const highRisk = reason.includes('before-unload') || reason.includes('meta-')
  console.warn('[Payment][interrupt]', { reason, highRisk })
  setPaymentInterrupted(true)
  if (!highRisk) {
    // Preserve session for benign focus/visibility interruptions
    debugLog('[Payment][interrupt] low-risk interruption – session preserved')
    setIsProcessingPayment(false)
    return
  }
  try {
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || 'local'
    debugLog('[Payment][interrupt] high-risk signOut', { env })
    const result = await supabase.auth.signOut()
    debugLog('[Payment][interrupt] signOut result', result)
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
}, [isProcessingPayment, paymentInterrupted, supabase])

const handleFocusViolation = useCallback(async (reason: string) => {
  if (!focusGuardActive) return
  // If we recently opened an external invoice window, ignore benign blur/visibility events
  if (suppressFocusGuardRef.current) {
    if (['window-blur','visibility-hidden','meta-ctrl-key'].includes(reason)) {
      debugLog('[FocusGuard] suppression active, ignoring', { reason })
      return
    }
  }
  // Update violation state
  setFocusViolationReason(reason)
  setFocusViolationCount(c => c + 1)
  const nextCount = focusViolationCount + 1
  const highRisk = isHighRiskViolation(reason)
  console.warn('[FocusGuard][violation]', { reason, highRisk, nextCount })

  // Low-risk (blur / visibility) gets one grace attempt before interrupting
  if (!highRisk && nextCount < 2) {
    debugLog('[FocusGuard] low-risk first violation – warning only')
    return // keep guard active; allow user to refocus without logout
  }

  // High-risk OR repeated low-risk -> interrupt
  interruptPayment('focus-guard-' + reason)
  stopFocusGuard('violation-' + reason)
}, [focusGuardActive, focusViolationCount, interruptPayment, stopFocusGuard])

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
    try {
      // Skip prompting if this is an intentional programmatic refresh
      const suppress = (window as any).__suppressBeforeUnloadPrompt === true || sessionStorage.getItem('suppress_unload_prompt') === '1'
      if (suppress) return
    } catch {}
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

// Legacy interruption watcher still active but only when guard not active (fallback)
useEffect(() => {
  if (!isProcessingPayment) return
  if (focusGuardActive) return // guard handles it
  const handleVisibility = () => { if (document.visibilityState === 'hidden') interruptPayment('legacy-visibility-hidden') }
  window.addEventListener('visibilitychange', handleVisibility)
  return () => { window.removeEventListener('visibilitychange', handleVisibility) }
}, [isProcessingPayment, focusGuardActive, interruptPayment])

// (FocusGuardOverlay & PaymentInterruptionBanner moved to CheckoutLayer component)
// Razorpay JIT loader now centralized in lib/razorpay

  // --- Tab-out -> Tab-in policy for Payment/Services (landing dashboard) ---
  // When payment is in progress or the Services (checkout) view is open, on tab blur mark a flag to return home on focus.
  // This mirrors the Orders/Profile policy, controlled by NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR=1.
  useEffect(() => {
    const FORCE_RESET_ON_BLUR = process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1'
    if (!FORCE_RESET_ON_BLUR) return
    const onBlur = () => {
      try {
        if (isProcessingPayment || (showQuotePage && quoteView === 'services')) {
          localStorage.setItem('app:return_home_on_focus', '1')
          try { localStorage.setItem('app:last_view', 'home') } catch {}
          try {
            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
              navigator.sendBeacon('/api/debug-log', JSON.stringify({ event: isProcessingPayment ? 'payment-blur-set-home' : 'services-blur-set-home', ts: Date.now() }))
            }
          } catch {}
        }
      } catch {}
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [isProcessingPayment, showQuotePage, quoteView])

  useEffect(() => {
    const FORCE_RESET_ON_BLUR = process.env.NEXT_PUBLIC_FORCE_HARD_RESET_ON_BLUR === '1'
    if (!FORCE_RESET_ON_BLUR) return
    const maybeReturnHome = () => {
      try {
        const marker = localStorage.getItem('app:return_home_on_focus') === '1'
        if (!marker) return
        localStorage.removeItem('app:return_home_on_focus')
        if (isProcessingPayment || (showQuotePage && quoteView === 'services')) {
          try { stopFocusGuard('return-home-on-focus') } catch {}
          try { setIsProcessingPayment(false) } catch {}
          try { setPaymentInterrupted(false) } catch {}
          try { setShowCheckoutThankYou(false) } catch {}
          goHome()
        }
      } catch {}
    }
    const onVis = () => { if (document.visibilityState === 'visible') maybeReturnHome() }
    window.addEventListener('focus', maybeReturnHome)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pageshow', maybeReturnHome)
    return () => {
      window.removeEventListener('focus', maybeReturnHome)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pageshow', maybeReturnHome)
    }
  }, [isProcessingPayment, showQuotePage, quoteView, goHome, stopFocusGuard])

  const handlePayment = async () => {
    try {
      const ok = await loadRazorpayScript()
      if (!ok) { alert('Unable to load payment module. Check your network and try again.'); return }
      const paymentStartTs = performance.now()
      const amount = Math.round(calculateAdjustedTotal() * 100)
      const userRes = await supabase.auth.getUser()
      const user = (userRes && (userRes as any).data) ? (userRes as any).data.user : null
      const selectedPricingKey = (typeof window !== 'undefined') ? (localStorage.getItem('selected_pricing_key') || null) : null
      debugLog('[Checkout] Using pricing key', selectedPricingKey)
      const orderResp = await fetch('/api/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, currency: 'INR', user_id: user?.id || null, service_id: (cartItems[0] as any)?.service_id ?? null, type: selectedPricingKey }) })
      if (!orderResp.ok) {
        let reason = 'Unknown error'
        try { const maybe = await orderResp.json(); reason = (maybe.error || maybe.message) || JSON.stringify(maybe) } catch { try { reason = await orderResp.text() } catch {} }
        console.error('create-order failed:', reason)
        alert(`Failed to start payment. ${reason || 'Please try again.'}`)
        return
      }
      const order = await orderResp.json()
      const firstItem = cartItems[0]
      setIsProcessingPayment(true)
      await openRazorpayCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount || amount,
        currency: order.currency || 'INR',
        name: 'LegalIP Pro',
        description: firstItem?.name || 'IP Service Payment',
        orderId: order.id,
        prefill: { name: user?.user_metadata?.full_name || '', email: user?.email || '', contact: user?.phone || '' },
        notes: { service: firstItem?.name || 'Quotation Payment' },
        onDismiss: () => { stopFocusGuard('dismiss'); setIsProcessingPayment(false) },
        onFailure: () => { alert('Payment was not completed. You can try again.'); stopFocusGuard('payment-failed'); setIsProcessingPayment(false) },
        onSuccess: async (response) => {
          try {
            const verifyStart = performance.now()
            const verifyResp = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, user_id: user?.id || null, service_id: (cartItems[0] as any)?.service_id ?? null, type: selectedPricingKey, name: user?.user_metadata?.full_name || user?.email || '', email: user?.email || '', phone: user?.phone || '', message: firstItem?.name || 'IP Service Payment', complexity: serviceFields.patentField1 || 'standard', urgency: calculatorFields.urgency || 'standard', cart: cartItems }) })
            const verifyJson = await verifyResp.json()
            if (!verifyResp.ok || !verifyJson.success) { console.error('verify-payment failed', verifyJson); alert('Payment verification failed. Please contact support.'); setIsProcessingPayment(false); return }
            stopFocusGuard('payment-success')
            debugLog('[Payment][timing]', { phase: 'success', razorpay_order_id: response.razorpay_order_id, verifyDurationMs: Math.round(performance.now() - verifyStart), totalFlowMs: Math.round(performance.now() - paymentStartTs) })
            const persisted = verifyJson.persistedPayment ?? null
            const createdOrders = Array.isArray(verifyJson.createdOrdersClient) ? verifyJson.createdOrdersClient : (Array.isArray(verifyJson.createdOrders) ? verifyJson.createdOrders : [])
            setShowQuotePage(true); setQuoteView('orders'); setIsOpen(false)
            setCheckoutPayment(persisted); setCheckoutOrders(createdOrders); setShowCheckoutThankYou(true); setOrdersReloadKey(k => k + 1); setCartItems([]); setIsProcessingPayment(false)
            if (!createdOrders || createdOrders.length === 0) setQuoteView('orders')
          } catch (err) {
            console.error('Error verifying payment:', err)
            alert('Payment succeeded but verification failed. We will investigate.')
            setIsProcessingPayment(false)
            stopFocusGuard('payment-verify-exception')
          }
        },
      })
      setTimeout(() => startFocusGuard(), 120)
    } catch (err: any) {
      console.error('handlePayment error:', err)
      alert('An error occurred while initiating payment.')
      stopFocusGuard('init-error')
      setIsProcessingPayment(false)
    }
  }
 
   
  const getServicesByCategory = (category: string) => {
    return cartItems.filter((item) => item.category === category)
  }

  const hasServicesInCategory = (category: string) => {
    return cartItems.some((item) => item.category === category)
  }

  const buildQuotationHtml = () => buildQuotationHtmlUtil({
    cartItems: cartItems.map(i => ({ name: i.name, category: i.category, price: i.price })),
    total: getTotalPrice(),
    payment: checkoutPayment,
    orders: checkoutOrders,
  })

  // Legacy behavior (still used for explicit external open if desired)
  const openQuotationInNewTab = () => {
    const html = buildQuotationHtml()
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  // New inline preview: create Blob URL and show in dialog (iframe)
  const previewQuotationInline = () => {
    try {
      const html = buildQuotationHtml()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      if (quotePreviewUrl) {
        try { URL.revokeObjectURL(quotePreviewUrl) } catch {}
      }
      setQuotePreviewUrl(url)
      setShowQuotePreview(true)
    } catch (e) {
      console.error('Failed building quotation preview', e)
      // fallback to old flow
      openQuotationInNewTab()
    }
  }

  const printInlineQuotation = () => {
    // Print contents of iframe if loaded
    const iframe = document.getElementById('quotation-preview-iframe') as HTMLIFrameElement | null
    try {
      if (iframe?.contentWindow) {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      }
    } catch (e) {
      console.warn('Inline print failed, opening new tab fallback', e)
      openQuotationInNewTab()
    }
  }

  useEffect(() => {
    return () => { if (quotePreviewUrl) { try { URL.revokeObjectURL(quotePreviewUrl) } catch {} } }
  }, [quotePreviewUrl])

  // Revoke invoice preview URL on unmount or when replaced
  useEffect(() => {
    return () => { if (invoicePreviewUrl) { try { URL.revokeObjectURL(invoicePreviewUrl) } catch {} } }
  }, [invoicePreviewUrl])
     
 
  /// Quote Page Component
if (showQuotePage) {
  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Consolidated payment overlays */}
      <CheckoutLayer
        isProcessing={isProcessingPayment}
        paymentInterrupted={paymentInterrupted}
        focusGuardActive={focusGuardActive}
        showThankYou={showCheckoutThankYou}
        checkoutPayment={checkoutPayment}
        checkoutOrders={checkoutOrders}
        onCloseThankYou={() => setShowCheckoutThankYou(false)}
        onProceedSingle={openFormEmbedded}
        onProceedMultiple={(orders) => { if (orders && orders.length > 0) openMultipleFormsEmbedded(orders) }}
        onSignInAgain={() => setShowAuthModal(true)}
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Back to Home button removed during cleanup */}
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
                <div className="text-sm font-semibold tracking-wide uppercase text-gray-700">Dashboard Services</div>
                {/* Services button removed: view selected programmatically */}
                <Button
                  variant={quoteView === 'orders' ? undefined : 'outline'}
                  className={`w-full justify-start border border-black rounded-full ${quoteView === 'orders' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                  onClick={goToOrders}
                >
                  Orders
                </Button>
               
                <Button
                  variant={quoteView === 'profile' ? undefined : 'outline'}
                  className={`w-full justify-start border border-black rounded-full ${quoteView === 'profile' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                  onClick={() => setQuoteView('profile')}
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 border border-black rounded-full transition-colors"
                  disabled={!isAuthenticated}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
              {/* Sidebar Cart: only show on Orders/Profile and only if items exist and total > 0 */}
              {(quoteView === 'orders' || quoteView === 'profile') && hasCartLineItems && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Scale className="h-4 w-4 text-blue-600 mr-2" />
                  Your Cart
                </h4>
                <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs text-gray-500">No items yet</p>
                    </div>
                  ) : (
                    cartItems.map(item => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-md border flex items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-gray-900 leading-snug break-words">{item.name}</p>
                          <p className="text-[11px] text-gray-500 mb-1">{item.category}</p>
                          {item.details && <p className="text-[11px] text-gray-600 line-clamp-2 mb-1">{item.details}</p>}
                          <span className="text-xs font-semibold text-blue-600">{formatINR(item.price)}</span>
                        </div>
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 h-6 w-6 p-0"
                          title="Remove"
                        >
                          ×
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Estimate</span>
                    <span className="font-semibold text-blue-600">{formatINR(cartTotal)}</span>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                    onClick={goToQuotePage}
                    disabled={!hasCartLineItems}
                  >
                    Checkout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-8 text-xs"
                    onClick={() => clearCart()}
                    disabled={!hasCartLineItems}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              )}
            </div>
          </aside>

          {/* Main: Selected Services and Payment */}
          <div className="flex-1">
            {quoteView === 'services' && (
              <ServicesPanel
                cartItems={cartItems as any}
                onRemove={removeFromCart}
                onMakePayment={handlePayment}
                onBrowseServices={() => setShowQuotePage(false)}
                formatAmount={formatINR}
                isProcessing={isProcessingPayment}
              />
            )}

            {/* Persistent Dashboard header for all internal tabs */}
            {quoteView !== 'services' && (
              <div className="mb-8 sticky top-16 z-40 bg-white pt-4 pb-3 border-b border-slate-200">
                <h2 className="text-4xl font-bold tracking-tight text-slate-800 leading-tight select-none">
                  {quoteView === 'orders'
                    ? 'Orders'
                    : quoteView === 'profile'
                      ? 'Profile'
                      : quoteView === 'forms'
                        ? 'Forms'
                        : 'Dashboard'}
                </h2>
                <div className="mt-2 h-[3px] w-24 bg-gradient-to-r from-blue-600 to-blue-400 rounded" />
                {quoteView === 'orders' && (
                  <p className="mt-3 text-sm text-gray-600">Your recent service purchases</p>
                )}
              </div>
            )}

            {quoteView === 'orders' && (
              <Card className="bg-white">
                <CardContent className="p-4">
                    {ordersLastFormBanner && ordersBannerVisible && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="mt-1 mb-4 rounded-md border border-blue-200 bg-blue-50 text-blue-900 px-4 py-3 flex items-start gap-3"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden>
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.75 6.75a.75.75 0 0 0-1.5 0v5.25a.75.75 0 0 0 1.5 0V9Zm0 7.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" clipRule="evenodd" />
                        </svg>
                        <div className="min-w-0 flex-1 text-sm">
                          <div className="font-medium">{ordersLastFormBanner.multi ? 'Last opened forms' : 'Last opened form'}</div>
                          {ordersLastFormBanner.multi ? (
                            <div className="text-blue-800 space-x-2 space-y-1">
                              {ordersLastFormBanner.multi.map((e, i) => (
                                <span key={e.orderId} className="inline-block">
                                  #{e.orderId}{e.formTypeLabel || e.formType ? ` (${e.formTypeLabel || e.formType})` : ''}{i < (ordersLastFormBanner.multi!.length - 1) ? ',' : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-blue-800">
                              {(ordersLastFormBanner.single?.formTypeLabel || ordersLastFormBanner.single?.formType || 'Form')}{typeof ordersLastFormBanner.single?.orderId === 'number' ? ` · Order #${ordersLastFormBanner.single?.orderId}` : ''}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label="Dismiss"
                          onClick={() => setOrdersBannerVisible(false)}
                          className="ml-2 rounded p-1 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                            <path fillRule="evenodd" d="M6.225 4.811a.75.75 0 0 1 1.06 0L12 9.525l4.715-4.714a.75.75 0 1 1 1.06 1.06L13.06 10.586l4.715 4.714a.75.75 0 1 1-1.06 1.06L12 11.646l-4.715 4.714a.75.75 0 1 1-1.06-1.06l4.714-4.715-4.714-4.714a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
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
                      <div className="overflow-x-auto overscroll-x-contain scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
                        <table className="table-auto border border-slate-300 rounded-md overflow-hidden min-w-[980px]">
                          <thead className="border-b border-slate-300">
                            <tr className="text-left text-base text-slate-700 bg-blue-50/70 divide-x divide-slate-300">
                              <th className="px-3 py-2 font-semibold tracking-wide">Order ID</th>
                              <th className="px-3 py-2 font-semibold tracking-wide">Category</th>
                              <th className="px-3 py-2 font-semibold tracking-wide">Service</th>
                              <th className="px-3 py-2 font-semibold tracking-wide">Amount</th>
                              <th className="px-3 py-2 font-semibold tracking-wide whitespace-nowrap">Payment Mode</th>
                              <th className="px-3 py-2 font-semibold tracking-wide">Status</th>
                              <th className="px-3 py-2 font-semibold tracking-wide">Date</th>
                              <th className="px-3 py-2 font-semibold tracking-wide">Forms</th>
                              <th className="px-3 py-2 font-semibold tracking-wide whitespace-nowrap">Download Invoice</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-300">
                            {groupedOrders.map(bundle => {
                              const hasMultiple = bundle.orders.length > 1
                              const first = bundle.orders[0]
                              const bundleKey = bundle.paymentKey
                              const expanded = expandedBundles.has(bundleKey)
                              const handleDownloadBundle = async () => {
                                try {
                                  const orders = bundle.orders || []
                                  const paymentId = bundle.paymentKey || ''
                                  const paymentMode = (first?.payments as any)?.payment_method || 'N/A'
                                  const orderIdsStr = orders.map((o: any) => o.id).join(', ')
                                  const totalAmount = formatINR(bundle.totalAmount || 0)
                                  // Extract client info (prefer user profile from first order)
                                  const userObj: any = first?.user || {}
                                  // Extract explicit user fields from users table (first_name, last_name, phone, email)
                                  const firstName = userObj.first_name || ''
                                  const lastName = userObj.last_name || ''
                                  const clientName = (firstName + ' ' + lastName).trim() || userObj.email || 'Client'
                                  // Prefer "phone" then fallback to phone_number; if both missing show em dash
                                  const clientPhone = userObj.phone || userObj.phone_number || '—'
                                  const clientEmail = userObj.email || '—'
                                  const rowsHtml = orders.map((o: any, idx: number) => {
                                    const paymentIdRow = (o.payments as any)?.razorpay_payment_id || paymentId || '—'
                                    const category = (o.categories as any)?.name || (orders[0]?.categories as any)?.name || 'N/A'
                                    const service = (o.services as any)?.name || 'N/A'
                                    const amount = o.amount != null ? formatINR(Number(o.amount)) : '—'
                                    const mode = (o.payments as any)?.payment_method || paymentMode || '—'
                                    const date = o.created_at ? new Date(o.created_at).toLocaleString() : (bundle.date ? new Date(bundle.date).toLocaleString() : '')
                                    return `<tr>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${paymentIdRow}</td>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${category}</td>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${service}</td>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right;">${amount}</td>
                                      <td style="padding:6px;border-bottom:1px solid #e5e7eb;">${mode}</td>
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
                                        <div class='sub'>Generated: ${new Date().toLocaleString()}</div>
                                        <div style='font-size:11px;line-height:1.3;margin-top:4px;'>
                                          <strong>Name:</strong> ${clientName}<br/>
                                          <strong>Phone:</strong> ${clientPhone}<br/>
                                          <strong>Email:</strong> ${clientEmail}
                                        </div>
                                      </div>
                                      <div style='text-align:right;font-size:12px;'>
                                        <strong>LegalIP Pro</strong><br/>Professional IP Services<br/>support@legalippro.com
                                      </div>
                                    </div>
                                    <table style='margin-top:12px;'>
                                      <thead><tr><th>Payment ID</th><th>Category</th><th>Service</th><th style='text-align:right;'>Amount (INR)</th><th>Payment Mode</th><th>Date</th></tr></thead>
                                      <tbody>${rowsHtml || `<tr><td colspan='6' style='padding:12px;text-align:center;color:#9ca3af;'>No line items</td></tr>`}</tbody>
                                    </table>
                                    <table class='totals'>
                                      <tr><td class='label'>Total</td><td class='value'>${totalAmount}</td></tr>
                                    </table>
                                    <div class='footer'>System-generated summary. For official tax invoice please contact support referencing the Payment ID above.</div>
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
                              const handleDownloadBundleWithForms = async () => {
                                try {
                                  // 1) Collect order IDs in this bundle
                                  const orderIds: number[] = (bundle.orders || []).map((o: any) => o?.id).filter((v: any) => Number.isFinite(v))
                                  // 2) Fetch attachments for these orders and create signed URLs
                                  const attachmentsMap: Record<string, Array<{ name: string; url: string; size?: number; type?: string }>> = {}
                                  if (orderIds.length) {
                                    try {
                                      const { data: rows, error: attErr } = await supabase
                                        .from('form_attachments')
                                        .select('order_id, filename:filename, storage_path, mime_type, size_bytes, deleted')
                                        .in('order_id', orderIds)
                                        .eq('deleted', false)
                                        .order('uploaded_at', { ascending: true })
                                      if (!attErr && Array.isArray(rows)) {
                                        // Generate signed URLs (valid for 1 hour)
                                        const signed = await Promise.all(rows.map(async (r: any) => {
                                          let url = ''
                                          if (r.storage_path) {
                                            try {
                                              // Request a download disposition so browsers save the file instead of attempting to view inline
                                              const { data: sig, error: sigErr } = await supabase.storage.from('figures').createSignedUrl(r.storage_path, 60 * 60, { download: r.filename || undefined })
                                              if (!sigErr && sig?.signedUrl) url = sig.signedUrl
                                            } catch {}
                                          }
                                          return { order_id: r.order_id, name: r.filename, url, size: r.size_bytes as number | undefined, type: r.mime_type as string | undefined }
                                        }))
                                        for (const a of signed) {
                                          const key = String(a.order_id)
                                          if (!attachmentsMap[key]) attachmentsMap[key] = []
                                          attachmentsMap[key].push({ name: a.name, url: a.url, size: a.size, type: a.type })
                                        }
                                      }
                                    } catch (e) {
                                      console.warn('[Invoice+Forms] attachments fetch/sign failed', e)
                                    }
                                  }
                                  // 3) Build HTML with attachments included
                                  const html = buildInvoiceWithFormsHtml({ bundle, company: { name: 'LegalIP Pro' }, attachments: attachmentsMap })
                                  // 4) Build blob & create object URL for inline iframe preview
                                  const blob = new Blob([html], { type: 'text/html' })
                                  const url = URL.createObjectURL(blob)
                                  if (invoicePreviewUrl) {
                                    try { URL.revokeObjectURL(invoicePreviewUrl) } catch {}
                                  }
                                  setInvoicePreviewUrl(url)
                                  setShowInvoicePreview(true)
                                } catch (e) {
                                  console.error('Invoice+Forms generation failed', e)
                                  alert('Failed to generate Invoice + Forms document.')
                                }
                              }
                              return (
                                <Fragment key={bundle.paymentKey}>
                                 
                                  <tr key={bundle.paymentKey} className="bg-slate-50 divide-x divide-slate-300">
                                    {/* Order ID (internal) */}
                                    <td className="p-2">
                                      {first?.id != null ? first.id : '—'}
                                    </td>
                                    {/* Category (with expand/collapse control for multi-service bundles) */}
                                    <td className="p-2">
                                      {hasMultiple ? (
                                        <span className="inline-flex items-center">
                                          <button
                                            type="button"
                                            onClick={() => toggleBundle(bundleKey)}
                                            aria-expanded={expanded}
                                            className="mr-2 inline-flex items-center justify-center h-6 w-6 rounded border border-slate-300 bg-white text-slate-600 text-xs hover:bg-slate-50"
                                            title={expanded ? 'Collapse services' : 'Expand services'}
                                          >
                                            <span className="leading-none text-[13px]">
                                              {expanded ? '▾' : '▸'}
                                            </span>
                                          </button>
                                          <span>Multiple Services</span>
                                        </span>
                                      ) : (
                                        (first.categories as any)?.name ?? 'N/A'
                                      )}
                                    </td>
                                    {/* Service (hide count for multi-service bundles) */}
                                    <td className="p-2">
                                      {hasMultiple ? '—' : ((first.services as any)?.name ?? 'N/A')}
                                    </td>
                                    {/* Amount (bundle total) */}
                                    <td className="p-2">{formatINR(bundle.totalAmount)}</td>
                                    {/* Payment Mode */}
                                    <td className="p-2">{(first?.payments as any)?.payment_method || '—'}</td>
                                    {/* Status (aggregate for bundle) with chat trigger on Require Info */}
                                    <td className="p-2">
                                      <div className="flex items-center gap-2">
                                        <span>{aggregateBundleStatus(bundle.orders)}</span>
                                        {bundle.orders.some((o: any) => (o.workflow_status||'').toLowerCase() === 'require_info') && (
                                          <button
                                            type="button"
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                            title="Open chat"
                                            onClick={() => {
                                              console.debug('[ChatTrigger] bundle icon clicked', { paymentKey: bundle.paymentKey, orders: bundle.orders.map((o:any)=>({id:o.id,wf:o.workflow_status})) })
                                              // pick first order with require_info
                                              const target = bundle.orders.find((o: any) => (o.workflow_status||'').toLowerCase() === 'require_info')
                                              if (target) {
                                                try { console.debug('[ChatTrigger] opening chat for order', target.id); setChatOrderId(target.id) } catch {}
                                              } else {
                                                console.warn('[ChatTrigger] no require_info order found though icon visible')
                                              }
                                            }}
                                          >💬</button>
                                        )}
                                      </div>
                                    </td>
                                    {/* Date */}
                                    <td className="p-2">{bundle.date ? new Date(bundle.date).toLocaleString() : 'N/A'}</td>
                                    {/* Forms */}
                                    <td className="p-2">
                                      {(() => {
                                        const formsDisabled = hasMultiple
                                          ? (bundle.orders || []).every((o: any) => !!o.form_confirmed)
                                          : !!first?.form_confirmed
                                        return (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={formsDisabled}
                                            className={formsDisabled ? 'opacity-60 cursor-not-allowed' : ''}
                                            title={formsDisabled ? 'Details have been confirmed' : undefined}
                                            onClick={() => {
                                              if (formsDisabled) return
                                              if (hasMultiple) openMultipleFormsEmbedded(bundle.orders)
                                              else openFormEmbedded(first)
                                            }}
                                          >
                                            {hasMultiple ? 'Open Forms' : 'Open Form'}
                                          </Button>
                                        )
                                      })()}
                                    </td>
                                    {/* Invoice */}
                                    <td className="p-2">
                                      <Button size="sm" variant="outline" onClick={handleDownloadBundleWithForms} title="Download invoice plus associated form responses">
                                        PDF + Forms
                                      </Button>
                                    </td>
                                  </tr>

                             
                                    {hasMultiple && expanded && bundle.orders.map((child: any, idx: number) => (
                                    <tr key={child.id} className={"divide-x divide-slate-300 " + (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                                      {/* Order ID (child internal) */}
                                      <td className="p-2 text-gray-600">
                                        {child?.id != null ? child.id : '—'}
                                      </td>
                                      {/* Category */}
                                      <td className="p-2 pl-8 text-gray-600">
                                        {(child.categories as any)?.name ?? 'N/A'}
                                      </td>
                                      {/* Service */}
                                      <td className="p-2 text-gray-700">
                                        {(child.services as any)?.name ?? 'N/A'}
                                      </td>
                                      {/* Amount (per order) */}
                                      <td className="p-2">
                                        {child.amount != null ? formatINR(Number(child.amount)) : '—'}
                                      </td>
                                      {/* Payment Mode (child) */}
                                      <td className="p-2 text-gray-600">
                                        {(child?.payments as any)?.payment_method || '—'}
                                      </td>
                                      {/* Status (child order) with chat trigger */}
                                      <td className="p-2 text-gray-600">
                                        <div className="flex items-center gap-2">
                                          <span>{deriveOrderStatus(child)}</span>
                                          {(child.workflow_status||'').toLowerCase() === 'require_info' && (
                                            <button
                                              type="button"
                                              className="text-blue-600 hover:text-blue-800 text-xs"
                                              title="Open chat"
                                              onClick={() => { console.debug('[ChatTrigger] child row icon clicked', child.id); setChatOrderId(child.id) }}
                                            >💬</button>
                                          )}
                                        </div>
                                      </td>
                                      {/* Date */}
                                      <td className="p-2">
                                        {child.created_at ? new Date(child.created_at).toLocaleString() : 'N/A'}
                                      </td>
                                      {/* Forms/Invoice placeholders for child rows */}
                                      <td className="p-2 text-gray-400 italic">—</td>
                                      <td className="p-2 text-gray-300 italic">—</td>
                                    </tr>
                                  ))}

                                </Fragment>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
            )}
            {quoteView === 'forms' && (
              <FormsPanel
                embeddedMultiForms={embeddedMultiForms}
                selectedFormOrderId={selectedFormOrderId}
                selectedFormType={selectedFormType}
                lastSavedSnapshot={lastSavedSnapshot}
                prefillAvailable={prefillAvailable}
                onPrefillApply={() => { if (prefillAvailable && prefillApplyFn) prefillApplyFn() }}
                onPrefillStateChange={formPrefillHandle}
                onSetActive={(id, type) => { setSelectedFormOrderId(id); setSelectedFormType(type); }}
                goToOrders={goToOrders}
                backToServices={() => setQuoteView('services')}
                formPrefillHandleFirst={formPrefillHandle}
                setLastSavedSnapshot={(info) => setLastSavedSnapshot(info)}
                embeddedOrders={embeddedOrders}
                checkoutOrders={checkoutOrders}
              />
            )}

            {quoteView === 'profile' && (
              <ProfilePanel
                profile={embeddedProfile}
                isSaving={embeddedProfileSaving}
                isAuthenticated={isAuthenticated}
                loading={embeddedProfileLoading}
                onChange={(field, value) => setEmbeddedProfile((p: any) => ({ ...(p||{}), [field]: value }))}
                onSave={saveEmbeddedProfile}
                onBack={() => setQuoteView('services')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
    {chatOrderId != null && (
      <OrderChatPopup
        orderId={chatOrderId}
        open={chatOrderId != null}
        onClose={() => setChatOrderId(null)}
        userEmail={user?.email || null}
      />
    )}
    {showInvoicePreview && invoicePreviewUrl && (
      <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Invoice + Forms Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                try {
                  const iframe = document.getElementById('invoice-preview-iframe') as HTMLIFrameElement | null
                  iframe?.contentWindow?.print()
                } catch {}
              }}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >Print / Save PDF</button>
            <button
              onClick={() => {
                setShowInvoicePreview(false)
                // Post-close: gentle orders refresh if user is on orders and list empty/stale
                if (quoteView === 'orders' && (!embeddedOrders || embeddedOrders.length === 0) && !embeddedOrdersLoading) {
                  setOrdersReloadKey(k => k + 1)
                }
              }}
              className="text-xs px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
            >Close</button>
          </div>
        </div>
        <div className="flex-1 bg-slate-100 overflow-hidden p-2">
          <iframe
            id="invoice-preview-iframe"
            src={invoicePreviewUrl}
            title="Invoice Preview"
            className="w-full h-full bg-white border shadow-inner rounded"
          />
        </div>
      </div>
    )}
    </>
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

  {/* Hidden landing heading anchor for skip link and initial focus */}
    <h1 id="page-heading" tabIndex={-1} className="sr-only">LegalIP Pro – Services</h1>

  {/* Header */}
      <header className="bg-white shadow-md p-4">
      <div className="hidden md:flex items-center space-x-6 justify-end w-full">
        <a href="/knowledge-hub" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
          Knowledge Hub
        </a>
        <button
          onClick={() => { if (isAdmin) router.push('/admin') }}
          disabled={!isAdmin}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors border ${
            isAdmin
              ? 'text-gray-700 hover:text-blue-600 border-transparent hover:border-blue-200'
              : 'text-gray-400 cursor-not-allowed border-gray-200 bg-gray-50'
          }`}
          title={isAdmin ? (isPrimaryAdmin ? 'Primary Admin: full access' : 'Secondary Admin: limited view') : 'Admins only'}
          aria-disabled={!isAdmin}
        >
          {isPrimaryAdmin ? 'Admin Dashboard' : isAdmin ? 'My Admin View' : 'Admin Dashboard'}
        </button>
        {/* Auth greeting (redundant Sign In button removed; use profile menu) */}
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
          <div className="absolute right-0 mt-2 w-56 bg-blue-50/95 backdrop-blur-sm shadow-lg rounded-lg py-2 border border-blue-100 z-50">
            {/* Dashboard: visible but disabled when not signed in */}
            <button
              className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
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

            {/* Sign In: opens auth modal directly (no cart dependency) */}
            <button
              onClick={() => { if (!isAuthenticated) openSignIn(); setIsOpen(false) }}
              className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100 ${isAuthenticated ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
              disabled={isAuthenticated}
              aria-disabled={isAuthenticated}
              title={isAuthenticated ? 'Already signed in' : undefined}
            >
              Sign In
            </button>

            {/* Sign Out: visible but disabled when not signed in */}
            <button
              onClick={() => { if (!isAuthenticated) return; handleLogout(); setIsOpen(false); }}
              className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
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

   

      <BannerCarousel />

      {/* Main Content Area: Services on Left, Cart on Right */}
  <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Left Column: Tabbed Services */}
        <div className="flex-1">
          {/* Scrollable nav styled as tabs */}
          <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8">
            <button onClick={() => scrollToSection('patent-services')} className="px-3 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Patent Services</button>
            <button onClick={() => scrollToSection('trademark-services')} className="px-3 py-2 rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100">Trademark Services</button>
            <button onClick={() => scrollToSection('design-services')} className="px-3 py-2 rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100">Design Services</button>
            <button onClick={() => scrollToSection('copyright-services')} className="px-3 py-2 rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100">Copyright Services</button>
          </div>

          {/* Patent Services */}
          <section id="patent-services" className="bg-blue-50 py-6 md:py-8 rounded-lg scroll-mt-24">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Patent Services</h2>
                <p className="text-base md:text-lg text-gray-600 max-w-3xl">Comprehensive patent services to protect your innovations and inventions.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {patentServices.map((service) => (
                  <Card key={service.title} className="bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 md:p-7">
                      <div className="flex items-start gap-3 justify-between">
                        <div className="p-2 md:p-3 bg-blue-100 rounded-full">
                          <span className="inline-flex items-center justify-center h-6 w-6 md:h-8 md:w-8 text-blue-600">{service.icon}</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">{service.title}</h3>
                      </div>
                      <p className="text-gray-600 mt-3 md:mt-4 text-sm md:text-base">
                        {service.description} Our experts perform in-depth analysis, draft precise documents, and guide you across the full lifecycle to maximize protection and value.
                      </p>
                      <div className="flex items-center justify-between mt-3 md:mt-4">
                        <span className="text-xl md:text-2xl font-bold text-blue-600">
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
          <section id="trademark-services" className="bg-neutral-50 py-6 md:py-8 rounded-lg mt-6 md:mt-8 border border-neutral-200 scroll-mt-24">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Trademark Services</h2>
                <p className="text-base md:text-lg text-gray-600 max-w-3xl">Protect your brand identity with tailored search, filing, and monitoring solutions.</p>
              </div>
              <div className="text-center py-10 md:py-12">
                <div className="mx-auto mb-6 w-14 h-14 md:w-16 md:h-16 rounded-full bg-neutral-100 ring-2 ring-neutral-200 flex items-center justify-center">
                  <Clock className="h-7 w-7 md:h-8 md:w-8 text-neutral-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Coming soon</h3>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">We’re polishing our trademark offerings. Meanwhile, explore our fully available patent services.</p>
                <div className="mt-6">
                  <Button variant="outline" className="border-neutral-200" onClick={() => scrollToSection('patent-services')}>
                    Explore Patent Services
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Design Services (moved above Copyright) */}
          <section id="design-services" className="bg-neutral-50 py-6 md:py-8 rounded-lg mt-6 md:mt-8 border border-neutral-200 scroll-mt-24">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Design Services</h2>
                <p className="text-base md:text-lg text-gray-600 max-w-3xl">Protect unique designs with strategic search, filing, and portfolio support.</p>
              </div>
              <div className="text-center py-10 md:py-12">
                <div className="mx-auto mb-6 w-14 h-14 md:w-16 md:h-16 rounded-full bg-neutral-100 ring-2 ring-neutral-200 flex items-center justify-center">
                  <Clock className="h-7 w-7 md:h-8 md:w-8 text-neutral-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Coming soon</h3>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">Our design protection services are nearly ready. Stay tuned!</p>
                <div className="mt-6">
                  <Button variant="outline" className="border-neutral-200" onClick={() => scrollToSection('patent-services')}>
                    Explore Patent Services
                  </Button>
                  {/* Removed duplicate Admin Dashboard button (header provides access) */}
                </div>
              </div>
            </div>
          </section>

          {/* Copyright Services (moved to last) */}
          <section id="copyright-services" className="bg-neutral-50 py-6 md:py-8 rounded-lg mt-6 md:mt-8 border border-neutral-200 scroll-mt-24">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Copyright Services</h2>
                <p className="text-base md:text-lg text-gray-600 max-w-3xl">Safeguard creative works with registration, licensing, and enforcement support.</p>
              </div>
              <div className="text-center py-10 md:py-12">
                <div className="mx-auto mb-6 w-14 h-14 md:w-16 md:h-16 rounded-full bg-neutral-100 ring-2 ring-neutral-200 flex items-center justify-center">
                  <Clock className="h-7 w-7 md:h-8 md:w-8 text-neutral-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Coming soon</h3>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">We’re crafting copyright solutions to protect your creative work. Check back shortly.</p>
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
              <OptionsDialog
                open={showOptionsPanel}
                onOpenChange={(open) => { if (!open) closeOptionsPanel() }}
                selectedServiceTitle={selectedServiceTitle}
                optionsForm={optionsForm}
                setOptionsForm={setOptionsForm as any}
                addToCartWithOptions={addToCartWithOptions}
                closeOptionsPanel={closeOptionsPanel}
                formatINR={formatINR}
                computeDraftingPrice={(type: any, turn: any = 'standard') => {
                  if (!pricingRules || selectedServiceTitle !== 'Drafting') return 0
                  const applicationType = optionsForm.applicantTypes.includes('Individual / Sole Proprietor')
                    ? 'individual'
                    : optionsForm.applicantTypes.includes('Startup / Small Enterprise')
                    ? 'startup_msme'
                    : optionsForm.applicantTypes.includes('Others (Company, Partnership, LLP, Trust, etc.)')
                    ? 'others'
                    : 'individual'
                  return draftingPriceHelper({
                    pricingRules,
                    applicationType: applicationType as any,
                    niceClasses: optionsForm.niceClasses.map((v)=>Number(v)).filter((n)=>!Number.isNaN(n)),
                    priorUse: optionsForm.useType === 'yes',
                    draftingType: type,
                    turnaround: turn,
                  })
                }}
                computeTurnaroundTotal={computeTurnaroundTotal as any}
                applicantPrices={applicantPrices}
                ferPrices={ferPrices as any}
                previewTotal={preview.total}
                patentSearchTotal={patentSearchTotal}
                draftingTotal={draftingTotal}
                filingTotal={filingTotal}
                expediatedDiff={expediatedDiff}
                rushDiff={rushDiff}
                patentSearchPrices={(() => {
                  if (!pricingRules || selectedServiceTitle !== 'Patentability Search') return undefined
                  const applicationType = optionsForm.applicantTypes.includes('Individual / Sole Proprietor')
                    ? 'individual'
                    : optionsForm.applicantTypes.includes('Startup / Small Enterprise')
                    ? 'startup_msme'
                    : optionsForm.applicantTypes.includes('Others (Company, Partnership, LLP, Trust, etc.)')
                    ? 'others'
                    : 'individual'
                  const baseArgs = {
                    pricingRules,
                    applicationType: applicationType as any,
                    niceClasses: optionsForm.niceClasses.map((v)=>Number(v)).filter((n)=>!Number.isNaN(n)),
                    priorUse: optionsForm.useType === 'yes',
                  }
                  return {
                    quick: computePatentabilityPrice({ ...baseArgs, searchType: 'quick', turnaround: 'standard' }),
                    full_without_opinion: computePatentabilityPrice({ ...baseArgs, searchType: 'full_without_opinion', turnaround: 'standard' }),
                    full_with_opinion: computePatentabilityPrice({ ...baseArgs, searchType: 'full_with_opinion', turnaround: 'standard' }),
                  }
                })()}
                filingTypePrices={(() => {
                  if (!pricingRules || selectedServiceTitle !== 'Patent Application Filing') return undefined
                  if (!(optionsForm.searchType === 'individual' || optionsForm.searchType === 'others')) return undefined
                  const base = {
                    pricingRules,
                    niceClasses: optionsForm.niceClasses.map(v=>Number(v)).filter(n=>!Number.isNaN(n)),
                    priorUse: optionsForm.useType === 'yes',
                    searchType: optionsForm.searchType,
                  }
                  const appType = optionsForm.searchType === 'individual' ? 'individual' : 'others'
                  const calc = (filingKey: any) => computePriceFromRules(pricingRules as any, {
                    applicationType: appType,
                    niceClasses: base.niceClasses,
                    goodsServices: { dropdown: filingKey },
                    searchType: base.searchType,
                    priorUse: { used: base.priorUse },
                    option1: true,
                  } as any) || 0
                  return {
                    provisional_filing: calc('provisional_filing'),
                    complete_specification_filing: calc('complete_specification_filing'),
                    ps_cs_filing: calc('ps_cs_filing'),
                    pct_filing: calc('pct_filing'),
                  }
                })()}
                ferTotal={ferTotal}
               
              />
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
            {milestones.map((milestone) => (
              <div key={milestone.key} className="text-center">
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

      {/* Inline Quotation Preview Dialog */}
      <Dialog open={showQuotePreview} onOpenChange={(open) => { if (!open) setShowQuotePreview(false) }}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 border-b">
            <DialogTitle>Quotation Preview</DialogTitle>
            <DialogDescription className="text-xs">Review, print, or export your quotation without leaving the app.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-white">
            {quotePreviewUrl ? (
              <iframe
                id="quotation-preview-iframe"
                src={quotePreviewUrl}
                className="w-full h-full"
                title="Quotation Preview"
                sandbox="allow-modals allow-same-origin allow-scripts allow-popups allow-forms"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">Building preview…</div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t flex items-center justify-between gap-3">
            <div className="text-[11px] text-gray-500">Preview is a non-tax estimate. Contact support for official invoice.</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={openQuotationInNewTab}>Open in New Tab</Button>
              <Button variant="outline" size="sm" onClick={printInlineQuotation}>Print / Save PDF</Button>
              <Button size="sm" onClick={() => setShowQuotePreview(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  {/* CheckoutLayer handles thank-you modal inside quote/dashboard context; duplicate removed here. */}
    </div>
  )
}