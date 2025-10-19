"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from "@/components/ui/card"
import { styleTokens } from './styleTokens'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ALLOWED_MIME, MAX_FILE_BYTES, uploadFigure, deleteFigure } from '@/utils/attachments'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import formData from "../data/forms-fields.json"
import pricingToForm from '../data/service-pricing-to-form.json'
import formCharLimits from '../data/form-char-limits.json'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Attachment category prefixes (lightweight logical segregation)
const ATTACH_PREFIX_DISCLOSURE = '[DISCLOSURE]'
const ATTACH_PREFIX_DRAWING = '[DRAWING]'
const ATTACH_PREFIX_SPEC = '[SPEC]'
const ATTACH_PREFIX_CLAIMS = '[CLAIMS]'
const ATTACH_PREFIX_ABSTRACT = '[ABSTRACT]'

type AttachmentCategory = 'disclosure' | 'drawing' | 'spec' | 'claims' | 'abstract'

function inferAttachmentCategoryFromField(title: string): AttachmentCategory | null {
  const t = title.trim().toLowerCase()
  if (/^drawings\s*\/\s*figures$/.test(t)) return 'drawing'
  if (/^specification\s+document$/.test(t)) return 'spec'
  if (/^claims$/.test(t)) return 'claims'
  if (/^abstract$/.test(t)) return 'abstract'
  if (/(^|\b)disclosure(\b|$)/.test(t) || /invention\s+disclosure/.test(t)) return 'disclosure'
  return null
}
function prefixForCategory(cat: AttachmentCategory): string {
  switch (cat) {
    case 'disclosure': return ATTACH_PREFIX_DISCLOSURE
    case 'drawing': return ATTACH_PREFIX_DRAWING
    case 'spec': return ATTACH_PREFIX_SPEC
    case 'claims': return ATTACH_PREFIX_CLAIMS
    case 'abstract': return ATTACH_PREFIX_ABSTRACT
  }
}
function stripAttachmentPrefix(name: string): string { return name.replace(/^\[(DISCLOSURE|DRAWING|SPEC|CLAIMS|ABSTRACT)\]\s*/i, '') }


const getPricingToForm = (k?: string | null) => {
  if (!k) return null
  const map = pricingToForm as unknown as Record<string, string>
  return map[k] ?? null
}

type FormField = {
  field_title: string
  patentability_search: string
  drafting: string
  provisional_filing: string
  complete_non_provisional_filing: string
  pct_filing: string
  ps_cs: string
  fer_response: string
  
}

const applicationTypes = [
  { key: "patentability_search", label: "Patentability Search" },
  { key: "drafting", label: "Drafting" },  
  { key: "provisional_filing", label: "Provisional Filing" },
  { key: "complete_non_provisional_filing", label: "Complete Non Provisional Filing" },
  { key: "pct_filing", label: "PCT Filing" },
  { key: "ps_cs", label: "PS CS" },
  { key: "fer_response", label: "FER Response" },
  
]

// Fast lookup map for user-friendly labels
const applicationTypeLabelMap: Record<string,string> = applicationTypes.reduce((acc, t) => { acc[t.key] = t.label; return acc }, {} as Record<string,string>)
const getApplicationTypeLabel = (k: string | null | undefined) => (k ? applicationTypeLabelMap[k] || k : '')

interface FormClientProps {
  orderIdProp?: number | null;
  typeProp?: string | null;
  onPrefillStateChange?: (info: { available: boolean; apply: () => void }) => void;
  externalPrefill?: { type: string; orderId: number | null; values: Record<string,string> } | null;
  onSaveLocal?: (info: { type: string; orderId: number | null; values: Record<string,string> }) => void;
  // Called after a successful Confirm action. If omitted, we stay on the form.
  onConfirmComplete?: () => void;
}

export default function IPFormBuilderClient({ orderIdProp, typeProp, onPrefillStateChange, externalPrefill, onSaveLocal, onConfirmComplete }: FormClientProps = {}) {
  // Debug flag (temporarily disabled normal verbose logging)
  const DEBUG = false // typeof window !== 'undefined' && (window as any).FORM_DEBUG !== false;
  const FLOW_DEBUG = typeof window !== 'undefined' && (window as any).FORM_FLOW_DEBUG === true
  const flowLog = (phase: string, msg: string, extra?: any) => {
    if (!FLOW_DEBUG) return
    const ts = new Date().toISOString()
    try { console.debug(`[flow][form-client][${phase}][${ts}] ${msg}`, extra || '') } catch {}
  }
  const maybeDelay = async (label: string) => {
    try {
      const msRaw = (window as any).FORM_LOAD_DELAY_MS || (window as any).FORM_DELAY_MS
      const ms = typeof msRaw === 'number' ? msRaw : Number(msRaw)
      if (ms && ms > 0) {
        flowLog('delay', `Artificial delay (${label}) ${ms}ms`)
        await new Promise(r => setTimeout(r, ms))
      }
    } catch {}
  }

  const [selectedType, setSelectedType] = useState<string>("")
  const selectedTypeLabel = getApplicationTypeLabel(selectedType)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  // Read-only mode: default false; form is editable by default
  const [readOnly, setReadOnly] = useState(false)
  // Confirmation (review) mode: show Confirm/Edit only and lock fields
  const [confirmMode, setConfirmMode] = useState(false)
  const lastSavedRef = useRef<Record<string,string>>({})
  // popup replaced by external button; keep candidate internally
  const [prefillOpen, setPrefillOpen] = useState(false) // deprecated (kept to avoid refactor ripple)
  const [prefillCandidate, setPrefillCandidate] = useState<Record<string, string> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveStartedAt, setSaveStartedAt] = useState<number | null>(null)
  const [saveStall, setSaveStall] = useState(false)
  const [saveSuccessTs, setSaveSuccessTs] = useState<number | null>(null)
  const [savedBannerState, setSavedBannerState] = useState<'hidden' | 'visible' | 'fading'>('hidden')
  const RECENT_SAVE_MS = 4000
  // Inline success banner shown after Submit/Confirm
  const [showThankYouBanner, setShowThankYouBanner] = useState<boolean>(false)
  // Variant: 'review' (after Submit — show details) or 'confirmed' (after Confirm — simple message)
  const [thankYouVariant, setThankYouVariant] = useState<'review' | 'confirmed' | null>(null)
  // Focus anchor at the top of this form (used when exiting confirm via Edit)
  const formTopRef = useRef<HTMLDivElement | null>(null)
  const thankYouRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (showThankYouBanner && thankYouRef.current) {
      try { thankYouRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch {}
      try { (thankYouRef.current as any).focus?.() } catch {}
    }
  }, [showThankYouBanner])
  // User-adjustable form text styling
  const [formFontSize, setFormFontSize] = useState<number>(12)
  const [formFontBold, setFormFontBold] = useState<boolean>(false)

  // Load persisted preferences
  useEffect(() => {
    try {
      const fs = localStorage.getItem('form_font_size')
      const fb = localStorage.getItem('form_font_bold')
      if (fs) {
        const n = Number(fs)
        if (!Number.isNaN(n) && n >= 8 && n <= 20) setFormFontSize(n)
      }
      if (fb === '1') setFormFontBold(true)
    } catch {}
  }, [])
  // Persist changes
  useEffect(() => {
    try { localStorage.setItem('form_font_size', String(formFontSize)) } catch {}
  }, [formFontSize])
  useEffect(() => {
    try { localStorage.setItem('form_font_bold', formFontBold ? '1' : '0') } catch {}
  }, [formFontBold])
  const [lastSaveDebug, setLastSaveDebug] = useState<null | { started: number; ended?: number; error?: string; payload?: any }>(null)
  const [lastLoadMeta, setLastLoadMeta] = useState<null | { phase: string; orderId: number | null; type: string; foundExact: boolean; fallbackUsed: boolean; ts: number }>(null)
  const [manualReloadTick, setManualReloadTick] = useState(0)
  const hadValuesRef = useRef(false)
  useEffect(() => { hadValuesRef.current = Object.keys(formValues).some(k => (formValues as any)[k] && String((formValues as any)[k]).trim() !== '') }, [formValues])
  // Attachments state
  const [attachments, setAttachments] = useState<Array<{
    tempId: string
    id?: string
    name: string
    size: number
    type: string
    status: 'uploading' | 'done' | 'error' | 'removing'
    progress: number
    storage_path?: string
    errorMsg?: string
  }>>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null)
  const [attachmentsDebugInfo, setAttachmentsDebugInfo] = useState<string | null>(null)
  const [attachmentContext, setAttachmentContext] = useState<{ userId?: string | null }>({})
  // Removed single shared file input; we'll create ephemeral inputs per category to ensure correct prefix tagging
  // Multi-author (Applicant Name) handling: store as newline-separated string in formValues
  const [multiAuthors, setMultiAuthors] = useState<Record<string, string[]>>({})
  const initializedAuthorsRef = useRef<Set<string>>(new Set())
  // Track whether user dismissed auto-confirm so we don't immediately re-enter confirm mode
  const autoConfirmDismissedRef = useRef<boolean>(false)
  // Initialize multiAuthors only once per matching field when persisted data (with at least one non-empty name) exists
  useEffect(() => {
    const pattern = /^(inventor\s*\/\s*)?applicant.*name\(s\)|^(inventor|applicant).*name(s)?$/i
    let changed = false
    Object.entries(formValues).forEach(([k,v]) => {
      if (!pattern.test(k.trim())) return
      if (initializedAuthorsRef.current.has(k)) return
      const parts = (v || '').split(/\n+/).map(s => s.trim()).filter(Boolean)
      if (parts.length) {
        initializedAuthorsRef.current.add(k)
        setMultiAuthors(prev => ({ ...prev, [k]: parts }))
        changed = true
      }
    })
    if (changed) {
      // no-op placeholder for future logging
    }
  }, [formValues])
  const toastHook = useToast?.()
  const toast = toastHook ?? { toast: (opts: any) => { if (opts?.title) alert(`${opts.title}\n${opts?.description || ""}`) } }
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // ---- JSON cache helpers (localStorage) – mirrors main screen cache-first approach ----
  const FORM_CACHE_VER = 'v1'
  const formDraftKey = (uid: string | null, orderId: number | null, type: string | null | undefined) => `form_draft_${FORM_CACHE_VER}::${uid || 'nouser'}::${orderId ?? 'none'}::${type || 'notype'}`
  const lastByTypeKey = (uid: string | null, type: string | null | undefined) => `form_last_by_type_${FORM_CACHE_VER}::${uid || 'nouser'}::${type || 'notype'}`
  const hasNonEmpty = (obj: Record<string,string>) => {
    for (const v of Object.values(obj || {})) { if (typeof v === 'string' && v.trim() !== '') return true }
    return false
  }
  
  const orderIdFromProps = orderIdProp ?? null
  const typeFromProps = typeProp ?? null
  // If the form is opened from an order (order_id in URL), lock the application type
  const isOrderLocked = !!(orderIdFromProps || (searchParams?.get("order_id") || ""))

  // Effective order id resolution (props override URL)
  const orderIdEffective = (() => {
    const urlOrder = searchParams?.get('order_id') || ''
    const urlNum = urlOrder ? Number(urlOrder) : null
    return orderIdProp != null ? orderIdProp : (urlNum != null && !Number.isNaN(urlNum) ? urlNum : null)
  })()

  useEffect(() => {
    const urlPricingKey = searchParams?.get('pricing_key') || ''
    const urlTypeRaw = searchParams?.get('type') || ''
    const orderIdRaw = searchParams?.get('order_id') || ''
    const orderIdNum = orderIdFromProps != null ? Number(orderIdFromProps) : (orderIdRaw ? Number(orderIdRaw) : null)

    let mounted = true
    ;(async () => {
      try {
        flowLog('resolve-type:start', 'Begin type resolution')
        await maybeDelay('pre-resolve-type')
        let resolved: string | null = null
        let urlCanonical: string | null = null

        // Only consider URL / pricing mapping if we are NOT given a prop order id (multi-order context uses orderIdProp)
        if (!orderIdProp) {
          if (urlPricingKey) {
            const mapped = getPricingToForm(urlPricingKey)
            if (mapped && applicationTypes.some(t => t.key === mapped)) urlCanonical = mapped
          }
          if (!urlCanonical && urlTypeRaw) {
            if (applicationTypes.some(t => t.key === urlTypeRaw)) urlCanonical = urlTypeRaw
            else {
              const mapped = getPricingToForm(urlTypeRaw)
              if (mapped && applicationTypes.some(t => t.key === mapped)) urlCanonical = mapped
            }
          }
        }

        // If we have an order id (from props OR url) fetch authoritative type from orders -> payments
        if (orderIdNum != null && !Number.isNaN(orderIdNum)) {
          const { data: ord } = await supabase
            .from('orders')
            .select('type, payment_id')
            .eq('id', orderIdNum)
            .maybeSingle()
          const ordType = ord?.type || null
          if (ordType) {
            if (applicationTypes.some(t => t.key === ordType)) resolved = ordType
            else {
              const mapped = getPricingToForm(ordType)
              if (mapped && applicationTypes.some(t => t.key === mapped)) resolved = mapped
            }
          }
          if (!resolved && ord?.payment_id) {
            const { data: pay } = await supabase
              .from('payments')
              .select('type')
              .eq('id', ord.payment_id)
              .maybeSingle()
            const payType = pay?.type || null
            if (payType) {
              if (applicationTypes.some(t => t.key === payType)) resolved = payType
              else {
                const mapped = getPricingToForm(payType)
                if (mapped && applicationTypes.some(t => t.key === mapped)) resolved = mapped
              }
            }
          }
        }

        const candidateTypeProp = (typeFromProps && applicationTypes.some(t => t.key === typeFromProps)) ? typeFromProps : null
        const finalType = candidateTypeProp || resolved || urlCanonical
        if (mounted && finalType && applicationTypes.some(t => t.key === finalType)) {
          setSelectedType(prev => prev || finalType) // do not override if already set
        }
      } catch (e) {
        console.error('[FormClient] Exception resolving form type', e)
        flowLog('resolve-type:error', 'Exception during type resolution', { error: String(e) })
      }
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, orderIdFromProps, typeFromProps])

  // remember last selected application type so checkout can pick it up
  useEffect(() => {
    try {
      if (selectedType) localStorage.setItem('selected_application_type', selectedType)
      else localStorage.removeItem('selected_application_type')
    } catch (_) {}
  // if (DEBUG) console.debug('[FormClient] selectedType changed', { selectedType })
  }, [selectedType])

  const getRelevantFields = (type: string): FormField[] => {
    try {
      return (formData as any[]).filter((field: any) => String(field[type as keyof FormField]).toUpperCase() === "TRUE")
    } catch {
      return []
    }
  }

  // Enforce hard char/word limits (truncate) based on formCharLimits metadata
  const enforceLimit = (fieldTitle: string, raw: string): string => {
    try {
      const key = fieldTitle.trim().toLowerCase().replace(/\s+/g,'_')
      const meta: any = (formCharLimits as any)[key]
      if (!meta) return raw
      if (meta.kind === 'chars' && typeof meta.max === 'number') {
        if (raw.length > meta.max) return raw.slice(0, meta.max)
        return raw
      }
      if (meta.kind === 'words' && typeof meta.max === 'number') {
        const words = raw.trim() ? raw.trim().split(/\s+/) : []
        if (words.length > meta.max) {
          return words.slice(0, meta.max).join(' ')
        }
        return raw
      }
      return raw
    } catch { return raw }
  }

  const handleInputChange = (fieldTitle: string, value: string) => {
    if (readOnly) return
    const limited = enforceLimit(fieldTitle, value)
    setFormValues((prev) => ({
      ...prev,
      [fieldTitle]: limited,
    }))
  }
  const beginEdit = () => { setReadOnly(false) }
  const revertToLastSaved = () => { setFormValues(lastSavedRef.current || {}); setReadOnly(true) }
  // Refill: clear all fields and keep the form in edit mode
  const handleRefill = () => {
    // Exit any confirm/read-only state
    setConfirmMode(false)
    setReadOnly(false)
    // Hide any thank-you message when refilling to start fresh
  setShowThankYouBanner(false)
  setThankYouVariant(null)
    // Clear all current field values
    setFormValues({})
    // Reset multi-author fields to a single blank row where applicable
    try {
      const pattern = /^(inventor\s*\/\s*)?applicant.*name\(s\)|^(inventor|applicant).*name(s)?$/i
      const next: Record<string, string[]> = {}
      for (const f of relevantFields) {
        if (pattern.test(f.field_title.trim())) {
          next[f.field_title] = ['']
        }
      }
      setMultiAuthors(next)
    } catch {}
    // Allow future auto-confirm behavior (if re-enabled later) by resetting dismissal flag
    autoConfirmDismissedRef.current = false
  }
  const enterConfirmMode = () => {
    // Safety: only allow entering confirm mode when core fields are complete
    try {
      // coreComplete is defined below (after relevantFields), but due to closures
      // we defensively re-check here using the same logic to avoid ordering issues.
      const commentKeys = ['comment', 'comments', 'notes', 'additional instructions', 'additional_instructions', 'instructions', 'message']
      const isCommentLike = (title: string) => {
        const t = title.trim().toLowerCase()
        return commentKeys.some(k => t.includes(k))
      }
      const isUploadLike = (title: string) => {
        const cat = inferAttachmentCategoryFromField(title)
        return !!cat || /^drawings\s*\/\s*figures$/i.test(title.trim())
      }
      const core = (relevantFields || []).filter(f => !isCommentLike(f.field_title) && !isUploadLike(f.field_title))
      const complete = core.every(f => {
        const v = (formValues as any)[f.field_title]
        return typeof v === 'string' && v.trim() !== ''
      })
      if (!complete) {
        try {
          toast.toast?.({
            title: 'Complete required fields',
            description: 'Please fill all required fields before submitting (uploads and comments are optional).',
            variant: 'destructive',
          })
        } catch {}
        return
      }
    } catch {}
    setReadOnly(true); setConfirmMode(true)
    // Show review banner (with submitted details) right after Submit
    setShowThankYouBanner(true)
    setThankYouVariant('review')
  }
  const exitConfirmModeToEdit = () => {
    setConfirmMode(false)
    setReadOnly(false)
    // Hide the thank-you banner when returning to edit so it can be shown again after the next Confirm
    setShowThankYouBanner(false)
    setThankYouVariant(null)
    autoConfirmDismissedRef.current = true
    // After state updates, move focus/scroll to the top of this form instance
    try {
      // Use a slight delay to allow the DOM to update readOnly state and layout
      setTimeout(() => {
        const el = formTopRef.current
        if (!el) return
        try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }) } catch {}
        try { (el as any).focus?.() } catch {}
      }, 50)
    } catch {}
  }

  const handleSave = () => {
    if (!selectedType) {
      toast.toast?.({
        title: "Error",
        description: "Please select an application type first.",
        variant: "destructive",
      })
      return
    }

    const relevantFields = getRelevantFields(selectedType)
    const filledFields = relevantFields.filter((field) => formValues[field.field_title]?.trim())

  let timeoutId: any
  let finished = false
    ;(async () => {
      try {
        setSaving(true)
        const startedAt = Date.now()
        setSaveStartedAt(startedAt)
        setLastSaveDebug({ started: startedAt, payload: { tentativeFields: filledFields.length } })
        // Timeout safeguard (e.g., hanging network/RLS). If not cleared in 15s, mark stalled and allow retry.
        timeoutId = setTimeout(() => {
          setSaveStall(true)
          setSaving(false)
          try {
            toast.toast?.({
              title: 'Save taking longer than usual',
              description: 'Network is slow or temporarily unavailable. Please retry.',
              variant: 'destructive'
            })
          } catch {}
          setLastSaveDebug(prev => {
            const elapsed = saveStartedAt ? (Date.now() - saveStartedAt) : undefined
            const msg = `Stalled after ${elapsed ?? 'unknown'}ms (possible network/RLS hang)`
            return prev ? { ...prev, error: prev.error || msg } : prev
          })
        }, 15000)
  // finished flag now declared in outer scope for finally block
        const { data: sessionRes } = await supabase.auth.getSession()
        const userId = sessionRes?.session?.user?.id || null
        if (!userId) throw new Error('Not signed in')

  const orderId = orderIdEffective
        // Only mark as completed when user confirms; for normal saves we leave it unchanged
        const payload: any = {
          user_id: userId,
          order_id: orderId,
          form_type: selectedType,
          data: formValues,
          fields_filled_count: filledFields.length,
          fields_total: relevantFields.length,
        }
        // Completion semantics:
        // - In confirm mode, mark as completed
        // - In edit mode, explicitly clear completion to avoid stale 'completed=true' after Refill/Save
        payload.completed = !!confirmMode
        const { error } = await supabase
          .from('form_responses')
          .upsert(payload, { onConflict: 'user_id,order_id,form_type' })
        if (error) throw error
        finished = true
        toast.toast?.({
          title: 'Form Saved',
          description: `Saved ${filledFields.length}/${relevantFields.length} fields${payload.completed ? ' (Completed)' : ''}.`,
        })
        try { onSaveLocal?.({ type: selectedType, orderId, values: formValues }) } catch {}
        setSaveSuccessTs(Date.now())
  setSavedBannerState('visible')
        setLastSaveDebug(prev => prev ? { ...prev, ended: Date.now(), payload: { ...prev.payload, saved: true, filled: filledFields.length, total: relevantFields.length } } : prev)

        // If we are in confirm (review) mode, convert banner to 'confirmed' variant
        if (confirmMode) {
          try { toast.toast?.({ title: 'Thank you for confirming your details' }) } catch {}
          setShowThankYouBanner(true)
          setThankYouVariant('confirmed')
          // Stay in confirm mode; do not toggle back to edit.
          // Keep readOnly true implicitly via confirmMode.
          try {
            if (onConfirmComplete) onConfirmComplete()
          } catch {}
          // On final confirmation, clear the local draft cache for this key to avoid stale data on reopen
          try {
            const { data: s } = await supabase.auth.getSession()
            const uid = s?.session?.user?.id || null
            const k = formDraftKey(uid, orderId ?? null, selectedType)
            localStorage.removeItem(k)
          } catch {}
        }
      } catch (e: any) {
        console.error('Save error', e)
        toast.toast?.({ title: 'Save failed', description: e?.message || 'Unable to save form', variant: 'destructive' })
        setSaveSuccessTs(null)
        setLastSaveDebug(prev => prev ? { ...prev, ended: Date.now(), error: e?.message || String(e) } : prev)
      }
      finally {
        setSaving(false)
        setSaveStall(false)
        if (saveStartedAt) setSaveStartedAt(null)
        try { clearTimeout(timeoutId) } catch {}
        if (finished) {
          lastSavedRef.current = { ...formValues }
          // Stay in edit mode after saving
        }
      }
    })()
  }

  const handleCancel = () => {
    // Deprecated old cancel semantics; use refill behavior instead
    handleRefill()
  }

  // Load form values when type or effective order changes
  // Seed from local JSON cache immediately (cache-first), then do DB lookups below
  useEffect(() => {
    if (!selectedType) return
    let mounted = true
    ;(async () => {
      try {
        const { data: s } = await supabase.auth.getSession()
        const uid = s?.session?.user?.id || null
        const exactKey = formDraftKey(uid, orderIdEffective ?? null, selectedType)
        const raw = typeof window !== 'undefined' ? localStorage.getItem(exactKey) : null
        const parsed = raw ? (() => { try { return JSON.parse(raw) } catch { return null } })() : null
        const currentHas = hasNonEmpty(formValues)
        if (mounted && parsed?.values && !currentHas) {
          setFormValues(parsed.values as Record<string,string>)
          setLastLoadMeta({ phase: 'cache-seed', orderId: orderIdEffective ?? null, type: selectedType, foundExact: true, fallbackUsed: false, ts: Date.now() })
          return
        }
        // Fallback to last-by-type if no exact draft
        if (!currentHas) {
          const lastKey = lastByTypeKey(uid, selectedType)
          const lastRaw = typeof window !== 'undefined' ? localStorage.getItem(lastKey) : null
          const lastParsed = lastRaw ? (() => { try { return JSON.parse(lastRaw) } catch { return null } })() : null
          if (mounted && lastParsed?.values) {
            setFormValues(lastParsed.values as Record<string,string>)
            setLastLoadMeta({ phase: 'cache-seed', orderId: orderIdEffective ?? null, type: selectedType, foundExact: false, fallbackUsed: true, ts: Date.now() })
          }
        }
      } catch {}
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, orderIdEffective])

  // Autosave draft to localStorage with a debounce; do not overwrite with empty forms
  const draftTimerRef = useRef<any>(null)
  useEffect(() => {
    if (!selectedType) return
    if (!hasNonEmpty(formValues)) return
    try { if (draftTimerRef.current) clearTimeout(draftTimerRef.current) } catch {}
    draftTimerRef.current = setTimeout(async () => {
      try {
        const { data: s } = await supabase.auth.getSession()
        const uid = s?.session?.user?.id || null
        const payload = { v: FORM_CACHE_VER, ts: Date.now(), values: formValues }
        const keyExact = formDraftKey(uid, orderIdEffective ?? null, selectedType)
        const keyLast = lastByTypeKey(uid, selectedType)
        localStorage.setItem(keyExact, JSON.stringify(payload))
        localStorage.setItem(keyLast, JSON.stringify(payload))
      } catch {}
    }, 350)
    return () => { try { if (draftTimerRef.current) clearTimeout(draftTimerRef.current) } catch {} }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, selectedType, orderIdEffective])

  useEffect(() => {
    if (!selectedType) return
    let active = true
    const confirmInitDoneRef = { current: false }
    ;(async () => {
      try {
        flowLog('load-values:start', 'Begin loading form values', { selectedType, orderIdEffective })
        await maybeDelay('pre-load-values')
        const { data: sessionRes } = await supabase.auth.getSession()
        const userId = sessionRes?.session?.user?.id || null
        if (!userId) { setFormValues({}); return }
        const orderId = orderIdEffective
        let exactData: any = null
        let exactCompleted: boolean | null = null
        if (orderId != null) {
          const { data: exact, error: exactErr } = await supabase
            .from('form_responses')
            .select('data, completed')
            .eq('user_id', userId)
            .eq('order_id', orderId)
            .eq('form_type', selectedType)
            .maybeSingle()
          if (!exactErr) {
            if (exact?.data) exactData = exact.data
            if (typeof exact?.completed === 'boolean') exactCompleted = !!exact.completed
          }
        } else {
          const { data: latest, error: latestErr } = await supabase
            .from('form_responses')
            .select('data, updated_at')
            .eq('user_id', userId)
            .eq('form_type', selectedType)
            .order('updated_at', { ascending: false })
            .limit(1)
          if (!latestErr && latest && latest.length > 0) exactData = (latest[0] as any).data
        }
  if (exactData) {
          if (active) {
            setFormValues(exactData as any)
            setLastLoadMeta({ phase: 'load', orderId, type: selectedType, foundExact: true, fallbackUsed: false, ts: Date.now() })
            // If this order's form is completed, start in confirm (read-only) mode
            if (orderId != null && exactCompleted === true && !confirmInitDoneRef.current) {
              setReadOnly(true)
              setConfirmMode(true)
              confirmInitDoneRef.current = true
            }
          }
          return
        }
        const { data: anyData, error: anyErr } = await supabase
          .from('form_responses')
          .select('data, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
        if (!anyErr && anyData && anyData.length > 0 && (anyData[0] as any).data) {
          const relevant = getRelevantFields(selectedType)
          const keys = new Set(relevant.map(r => r.field_title))
            const candidate: Record<string, string> = {}
          Object.entries((anyData[0] as any).data as Record<string,string>).forEach(([k,v]) => {
            if (keys.has(k) && v) candidate[k] = v as string
          })
          if (Object.keys(candidate).length > 0) {
            setPrefillCandidate(candidate)
            if (active) setLastLoadMeta({ phase: 'load', orderId, type: selectedType, foundExact: false, fallbackUsed: true, ts: Date.now() })
          } else {
            if (active) { if (!hadValuesRef.current) setFormValues({}); setLastLoadMeta({ phase: 'load', orderId, type: selectedType, foundExact: false, fallbackUsed: false, ts: Date.now() }) }

        // Snapshot initializer: when in readOnly and we get non-empty values for first time
        useEffect(() => {
          if (readOnly) {
            // Only update if snapshot empty (avoid overwriting after edits start)
            if (lastSavedRef.current && Object.keys(lastSavedRef.current).length === 0 && Object.keys(formValues).length > 0) {
              lastSavedRef.current = { ...formValues }
            }
          }
        }, [formValues, readOnly])

        // Manage transient "Data saved" banner fade lifecycle
        useEffect(() => {
          if (!saveSuccessTs || !readOnly) return
          const age = Date.now() - saveSuccessTs
          if (age > RECENT_SAVE_MS) { setSavedBannerState('hidden'); return }
          setSavedBannerState('visible')
          const fadeTimer = setTimeout(() => setSavedBannerState('fading'), 1600)
          const hideTimer = setTimeout(() => setSavedBannerState('hidden'), 2400)
          return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
        }, [saveSuccessTs, readOnly])

        

        // Hide banner immediately when entering edit mode
        useEffect(() => {
          if (!readOnly) setSavedBannerState('hidden')
        }, [readOnly])

        // On mount, hide stale banner if previous session left a timestamp
        useEffect(() => {
          if (saveSuccessTs && Date.now() - saveSuccessTs > RECENT_SAVE_MS) {
            setSavedBannerState('hidden')
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
          }
        } else {
          if (active) { if (!hadValuesRef.current) setFormValues({}); setLastLoadMeta({ phase: 'load', orderId, type: selectedType, foundExact: false, fallbackUsed: false, ts: Date.now() }) }
        }
      } catch (e) {
        console.error('[FormClient] Load form values error', e)
        flowLog('load-values:error', 'Exception while loading form values', { error: String(e) })
        if (active) { if (!hadValuesRef.current) setFormValues({}); setLastLoadMeta({ phase: 'load', orderId: orderIdEffective ?? null, type: selectedType, foundExact: false, fallbackUsed: false, ts: Date.now() }) }
      }
    })()
    return () => { active = false }
  }, [selectedType, orderIdEffective, orderIdFromProps, manualReloadTick])

  const relevantFields = selectedType ? getRelevantFields(selectedType) : []
  // Ensure applicant/inventor name fields have at least one row visible even if empty
  useEffect(() => {
    if (!relevantFields.length) return
    let mutated = false
    const pattern = /^(inventor\s*\/\s*)?applicant.*name\(s\)|^(inventor|applicant).*name(s)?$/i
    setMultiAuthors(prev => {
      const next = { ...prev }
      for (const f of relevantFields) {
        if (pattern.test(f.field_title.trim()) && !next[f.field_title]) {
          next[f.field_title] = ['']
          mutated = true
        }
      }
      return mutated ? next : prev
    })
  }, [relevantFields])
  const manualReloadForm = () => { if (selectedType) setManualReloadTick(t => t + 1) }

  // Build a list of filled (non-empty) entries for the submitted details table
  const filledEntries = useMemo(() => {
    try {
      if (!relevantFields || relevantFields.length === 0) return [] as Array<{ label: string; value: string }>
      const rows: Array<{ label: string; value: string }> = []
      for (const f of relevantFields) {
        const val = (formValues as any)[f.field_title]
        if (typeof val === 'string' && val.trim() !== '') {
          rows.push({ label: f.field_title, value: val })
        }
      }
      return rows
    } catch {
      return []
    }
  }, [relevantFields, formValues])

  // Determine core (required) fields: exclude uploads and comment-like fields
  const coreFields = useMemo(() => {
    try {
      if (!relevantFields || relevantFields.length === 0) return [] as FormField[]
      const commentKeys = ['comment', 'comments', 'notes', 'additional instructions', 'additional_instructions', 'instructions', 'message']
      return relevantFields.filter((field) => {
        const title = field.field_title
        const t = title.trim().toLowerCase()
        const isComment = commentKeys.some(k => t.includes(k))
        const isUpload = !!inferAttachmentCategoryFromField(title) || /^drawings\s*\/\s*figures$/i.test(title.trim())
        return !isComment && !isUpload
      })
    } catch { return [] as FormField[] }
  }, [relevantFields])

  // Whether all core fields are filled (non-empty strings)
  const coreComplete = useMemo(() => {
    try {
      if (!coreFields || coreFields.length === 0) return true
      return coreFields.every(f => {
        const v = (formValues as any)[f.field_title]
        return typeof v === 'string' && v.trim() !== ''
      })
    } catch { return false }
  }, [coreFields, formValues])

  // Build a list of attachment entries (by upload field) for the submitted details table
  const attachmentEntries = useMemo(() => {
    try {
      if (!relevantFields || relevantFields.length === 0) return [] as Array<{ label: string; files: string[] }>
      const rows: Array<{ label: string; files: string[] }> = []
      // Helper to compute limit meta like in the field renderer
      const limitMetaFor = (title: string) => {
        const raw = title.trim().toLowerCase()
          .replace(/\s*\/\s*/g, '_')
          .replace(/[()]/g, '')
          .replace(/\?/g, '')
          .replace(/\s+/g, '_')
          .replace(/__+/g, '_')
        const lm: any = (formCharLimits as any)[raw]
        return lm || null
      }
      for (const f of relevantFields) {
        const isDrawingsField = /^drawings\s*\/\s*figures$/i.test(f.field_title.trim())
        const category = inferAttachmentCategoryFromField(f.field_title)
        const limitMeta = limitMetaFor(f.field_title)
        const isUpload = isDrawingsField || (limitMeta && limitMeta.kind === 'upload') || !!category
        // Only include upload fields that map to a known category (or explicit drawings)
        if (!isUpload || (!isDrawingsField && !category)) continue
        const cat: AttachmentCategory = isDrawingsField ? 'drawing' : (category as AttachmentCategory)
        const files = attachments
          .filter(a => {
            if (a.status !== 'done') return false
            const name = a.name || ''
            const hasPrefix = /^\[(DISCLOSURE|DRAWING|SPEC|CLAIMS|ABSTRACT)\]/i.test(name)
            if (!hasPrefix) {
              // Legacy files without prefix: attribute to drawings section only
              return cat === 'drawing'
            }
            if (cat === 'disclosure') return name.startsWith(ATTACH_PREFIX_DISCLOSURE)
            if (cat === 'drawing') return name.startsWith(ATTACH_PREFIX_DRAWING)
            if (cat === 'spec') return name.startsWith(ATTACH_PREFIX_SPEC)
            if (cat === 'claims') return name.startsWith(ATTACH_PREFIX_CLAIMS)
            if (cat === 'abstract') return name.startsWith(ATTACH_PREFIX_ABSTRACT)
            return false
          })
          .map(a => stripAttachmentPrefix(a.name))
        if (files.length > 0) rows.push({ label: f.field_title, files })
      }
      // De-duplicate by label to avoid repetition if multiple fields resolve to same label
      const seen = new Set<string>()
      const dedup: Array<{ label: string; files: string[] }> = []
      for (const r of rows) {
        if (seen.has(r.label)) continue
        seen.add(r.label)
        dedup.push(r)
      }
      return dedup
    } catch {
      return []
    }
  }, [relevantFields, attachments])

  // Track completeness transitions: only reset dismissal when fields become incomplete
  useEffect(() => {
    if (!selectedType || !relevantFields.length) return
    if (!coreComplete) autoConfirmDismissedRef.current = false
  }, [coreComplete, selectedType, relevantFields])

  // If we are in confirm mode but form becomes incomplete (e.g., after Refill on reopen),
  // automatically exit confirm/read-only so the user regains Save/Refill/Submit controls.
  useEffect(() => {
    if (confirmMode && !coreComplete) {
      setConfirmMode(false)
      setReadOnly(false)
      setShowThankYouBanner(false)
      setThankYouVariant(null)
    }
  }, [confirmMode, coreComplete])

  // Load existing attachments for this (user, order, form type)
  useEffect(() => {
    if (!selectedType) return
    if (!orderIdEffective) return // require order context to attach
    let timedOut = false
    let active = true
    ;(async () => {
      try {
        setLoadingAttachments(true)
        setAttachmentsError(null)
        setAttachmentsDebugInfo(null)
        const loadStarted = Date.now()
        const safety = setTimeout(() => {
          if (active) {
            timedOut = true
            setAttachmentsError('Timeout loading attachments (network/RLS)')
            setLoadingAttachments(false)
            setAttachmentsDebugInfo(prev => (prev ? prev + '\n' : '') + '[timeout] aborting after 12s')
          }
        }, 12000)
        const { data: sessionRes } = await supabase.auth.getSession()
        const userId = sessionRes?.session?.user?.id || null
        setAttachmentContext({ userId })
        if (!userId) { setLoadingAttachments(false); return }
        const { data, error } = await supabase
          .from('form_attachments')
          .select('id, filename:filename, storage_path, mime_type, size_bytes, deleted')
          .eq('user_id', userId)
          .eq('order_id', orderIdEffective)
          .eq('form_type', selectedType)
          .eq('deleted', false)
          .order('uploaded_at', { ascending: true })
        if (error) throw error
        if (!active) return
        const mapped = (data || []).map((r: any) => ({
          tempId: r.id,
          id: r.id,
          name: r.filename,
          size: r.size_bytes || 0,
          type: r.mime_type || 'application/octet-stream',
          status: 'done' as const,
          progress: 100,
          storage_path: r.storage_path,
        }))
        // Merge with any existing (e.g., in-flight uploads). Key by storage_path or id.
        setAttachments(prev => {
          const byId = new Map<string, any>()
          for (const m of mapped) byId.set(m.id || m.tempId, m)
          const merged: typeof prev = []
          // Keep uploading ones not yet in mapped
            for (const p of prev) {
              const key = p.id || p.tempId
              if (!byId.has(key)) merged.push(p)
            }
          // Then add fresh mapped records
          merged.push(...mapped)
          return merged
        })
        if ((data || []).length === 0) {
          setAttachmentsDebugInfo(`No rows returned for user=${userId} order=${orderIdEffective} type=${selectedType}`)
        } else {
          const ms = Date.now() - loadStarted
          setAttachmentsDebugInfo(`Loaded ${data?.length} attachment row(s). (${ms}ms)`)        
        }
        try { clearTimeout(safety) } catch {}
      } catch (e: any) {
        if (!active) return
        setAttachmentsError(e?.message || 'Failed to load attachments')
        try { toast.toast?.({ title: 'Attachment load failed', description: e?.message || 'Unknown error', variant: 'destructive' }) } catch {}
      } finally {
        if (active && !timedOut) setLoadingAttachments(false)
      }
    })()
    return () => { active = false }
  }, [selectedType, orderIdEffective])

  const manualReloadAttachments = async () => {
    if (!selectedType || !orderIdEffective) return
    try {
      setLoadingAttachments(true)
      const { data: sessionRes } = await supabase.auth.getSession()
      const userId = sessionRes?.session?.user?.id || null
      setAttachmentContext({ userId })
      if (!userId) { setAttachmentsError('No session user'); setLoadingAttachments(false); return }
      const { data, error } = await supabase
        .from('form_attachments')
        .select('id, filename:filename, storage_path, mime_type, size_bytes, deleted')
        .eq('user_id', userId)
        .eq('order_id', orderIdEffective)
        .eq('form_type', selectedType)
        .eq('deleted', false)
        .order('uploaded_at', { ascending: true })
      if (error) throw error
      const mapped = (data || []).map((r: any) => ({
        tempId: r.id,
        id: r.id,
        name: r.filename,
        size: r.size_bytes || 0,
        type: r.mime_type || 'application/octet-stream',
        status: 'done' as const,
        progress: 100,
        storage_path: r.storage_path,
      }))
      setAttachments(prev => {
        const byId = new Map<string, any>()
        for (const m of mapped) byId.set(m.id || m.tempId, m)
        const merged: typeof prev = []
        for (const p of prev) {
          const key = p.id || p.tempId
          if (!byId.has(key)) merged.push(p)
        }
        merged.push(...mapped)
        return merged
      })
      setAttachmentsDebugInfo(`Manual reload: ${data?.length || 0} row(s). Filters user=${userId} order=${orderIdEffective} type=${selectedType}`)
    } catch (e: any) {
      setAttachmentsError(e?.message || 'Reload failed')
      try { toast.toast?.({ title: 'Reload failed', description: e?.message || 'Unknown error', variant: 'destructive' }) } catch {}
    } finally {
      setLoadingAttachments(false)
    }
  }

  const handleFilesSelected = async (files: FileList | null, category: AttachmentCategory | null) => {
    if (!files || files.length === 0) return
    const { data: sessionRes } = await supabase.auth.getSession()
    const userId = sessionRes?.session?.user?.id || null
    if (!userId) { alert('You must be signed in to upload files.'); return }
    if (!orderIdEffective) { alert('Order context missing; save order first.'); return }
    const fileArray = Array.from(files)
    ;(window as any).__ATTACH_DEBUG__ = (window as any).__ATTACH_DEBUG__ || { events: [] }
    const debugPush = (e: any) => { try { (window as any).__ATTACH_DEBUG__.events.push({ ts: Date.now(), ...e }) } catch {} }
    for (const file of fileArray) {
      const tempId = crypto.randomUUID()
  const appliedPrefix = category ? prefixForCategory(category) + ' ' : ''
      const storedName = appliedPrefix + file.name
      const attachObj = {
        tempId,
        name: storedName,
        size: file.size,
        type: file.type || '',
        status: 'uploading' as const,
        progress: 0,
      }
      setAttachments(prev => [...prev, attachObj])
      // validations
      if (file.size > MAX_FILE_BYTES) {
        setAttachments(prev => prev.map(a => a.tempId === tempId ? { ...a, status: 'error', errorMsg: 'File too large' } : a))
        debugPush({ phase: 'validate', file: storedName, reason: 'too_large', size: file.size })
        continue
      }
      // MIME fallback by extension if missing/empty
      let effectiveType = file.type
      if (!effectiveType) {
        const lower = file.name.toLowerCase()
        if (lower.endsWith('.pdf')) effectiveType = 'application/pdf'
        else if (lower.endsWith('.png')) effectiveType = 'image/png'
        else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) effectiveType = 'image/jpeg'
        else if (lower.endsWith('.svg')) effectiveType = 'image/svg+xml'
      }
      if (ALLOWED_MIME.length && !ALLOWED_MIME.includes(effectiveType)) {
        setAttachments(prev => prev.map(a => a.tempId === tempId ? { ...a, status: 'error', errorMsg: 'Unsupported type' } : a))
        debugPush({ phase: 'validate', file: storedName, reason: 'unsupported_type', provided: file.type, effectiveType })
        continue
      }
      try {
        // Upload to storage
        debugPush({ phase: 'upload:start', file: storedName, size: file.size, type: effectiveType })
        const { path } = await uploadFigure(userId, orderIdEffective, file)
        debugPush({ phase: 'upload:success', file: storedName, path })
        // Insert metadata row
        // Best-effort SHA-256 (may not be supported in older browsers)
        let sha256: string | null = null
        try {
          const buf = await file.arrayBuffer()
          const digest = await crypto.subtle.digest('SHA-256', buf)
          sha256 = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('')
        } catch {}
        const { data: ins, error: insErr } = await supabase
          .from('form_attachments')
          .insert({
            user_id: userId,
            order_id: orderIdEffective,
            form_type: selectedType,
            filename: storedName,
            storage_path: path,
            mime_type: effectiveType,
            size_bytes: file.size,
            sha256: sha256,
            form_response_id: null,
            deleted: false,
          })
          .select('id')
          .maybeSingle()
        if (insErr) throw insErr
        debugPush({ phase: 'insert:success', file: storedName, id: ins?.id })
        setAttachments(prev => prev.map(a => a.tempId === tempId ? { ...a, id: ins?.id, status: 'done', progress: 100, storage_path: path } : a))
        try { toast.toast?.({ title: 'Attachment uploaded', description: stripAttachmentPrefix(storedName) }) } catch {}
      } catch (e: any) {
        setAttachments(prev => prev.map(a => a.tempId === tempId ? { ...a, status: 'error', errorMsg: e?.message || 'Upload failed' } : a))
        debugPush({ phase: 'error', file: storedName, message: e?.message || String(e) })
        try { toast.toast?.({ title: 'Upload failed', description: stripAttachmentPrefix(storedName) + ': ' + (e?.message || 'Unknown error'), variant: 'destructive' }) } catch {}
      }
    }
    debugPush({ phase: 'batch:complete' })
  }

  const handleRemoveAttachment = async (tempId: string) => {
    const target = attachments.find(a => a.tempId === tempId)
    if (!target) return
    if (target.status === 'removing' || target.status === 'uploading') return // guard double-click & in-flight upload
    const safetyMs = 10000
    let safetyTimer: any
    setAttachments(prev => prev.map(a => a.tempId === tempId ? { ...a, status: 'removing', errorMsg: undefined } : a))
    const finalizeRemove = () => { try { clearTimeout(safetyTimer) } catch {} }
    try {
      safetyTimer = setTimeout(() => {
        setAttachments(prev => prev.map(a => a.tempId === tempId && a.status === 'removing'
          ? { ...a, status: 'error', errorMsg: `Removal timeout after ${safetyMs/1000}s` }
          : a))
      }, safetyMs)
      // 1. Soft delete
      if (target.id) {
        const { error } = await supabase
          .from('form_attachments')
          .update({ deleted: true })
          .eq('id', target.id)
        if (error) throw new Error('DB delete failed: ' + (error.message || ''))
      }
      // 2. Remove from storage (best effort)
      if (target.storage_path) {
        const { error: storageErr } = await deleteFigure(target.storage_path)
        if (storageErr) {
          try { toast.toast?.({ title: 'Removed (file retained)', description: storageErr.message || 'Storage object not deleted', variant: 'destructive' }) } catch {}
        }
      }
      // 3. Immediate local removal
      setAttachments(prev => prev.filter(a => a.tempId !== tempId))
      finalizeRemove()
      // 4. Background refresh (non-blocking)
      ;(async () => {
        try {
          const { data: sessionRes } = await supabase.auth.getSession()
          const userId = sessionRes?.session?.user?.id || null
            if (userId && orderIdEffective && selectedType) {
              const { data, error } = await supabase
                .from('form_attachments')
                .select('id, filename:filename, storage_path, mime_type, size_bytes, deleted')
                .eq('user_id', userId)
                .eq('order_id', orderIdEffective)
                .eq('form_type', selectedType)
                .eq('deleted', false)
                .order('uploaded_at', { ascending: true })
              if (!error) {
                const mapped = (data || []).map((r: any) => ({
                  tempId: r.id,
                  id: r.id,
                  name: r.filename,
                  size: r.size_bytes || 0,
                  type: r.mime_type || 'application/octet-stream',
                  status: 'done' as const,
                  progress: 100,
                  storage_path: r.storage_path,
                }))
                setAttachments((prev) => {
                  // Only add if not already present
                  const existing = new Set<string>(prev.map((p) => String(p.id || p.tempId)))
                  const add = mapped.filter((m: any) => !existing.has(String(m.id || m.tempId)))
                  return [...prev, ...add]
                })
              }
            }
        } catch {}
      })()
      try { toast.toast?.({ title: 'Attachment removed', description: target.name }) } catch {}
      manualReloadForm()
    } catch (e: any) {
      finalizeRemove()
      // Fallback hard delete if RLS blocked soft delete
      if (target?.id && /row-level security/i.test(e?.message || '')) {
        try {
          const { error: hardErr } = await supabase
            .from('form_attachments')
            .delete()
            .eq('id', target.id)
          if (!hardErr) {
            setAttachments(prev => prev.filter(a => a.tempId !== tempId))
            try { toast.toast?.({ title: 'Attachment hard-deleted', description: target.name }) } catch {}
            return
          }
        } catch (_) {}
      }
      setAttachments(prev => prev.map(a => a.tempId === tempId ? { ...a, status: 'error', errorMsg: e?.message || 'Remove failed' } : a))
      try { toast.toast?.({ title: 'Removal failed', description: e?.message || 'Unable to delete attachment', variant: 'destructive' }) } catch {}
      if (/row-level security/i.test(e?.message || '')) {
        setAttachmentsDebugInfo(prev => (prev ? prev + '\n' : '') + '[RLS] Delete blocked. Ensure UPDATE / DELETE policies allow auth.uid() = user_id.')
      }
    }
  }

  // Attempt external prefill injection (Option A): after we tried DB lookups and form still empty
  useEffect(() => {
    if (!selectedType) return
    if (!externalPrefill || !externalPrefill.values) return
    // Only inject if current formValues are effectively empty (no keys or all blank) and prefill type is different or same (we don't care)
    const hasUserData = Object.values(formValues).some(v => v && String(v).trim() !== '')
    if (hasUserData) return
    const relevant = getRelevantFields(selectedType)
    if (!relevant.length) return
    const keys = new Set(relevant.map(r => r.field_title))
    const subset: Record<string,string> = {}
    for (const [k,v] of Object.entries(externalPrefill.values)) {
      if (keys.has(k) && v && String(v).trim() !== '') subset[k] = v as string
    }
    if (Object.keys(subset).length > 0) {
      setFormValues(prev => ({ ...subset, ...prev }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrefill, selectedType])

  // Post-mount verification: ensure the Select receives the value prop after resolution
  useEffect(() => {
  // if (DEBUG) console.debug('[FormClient][post-mount-check] current selectedType', selectedType)
  }, [selectedType])

  // Fallback: if order is locked, we have a typeProp, but selectedType is still empty after initial async resolution, set it directly.
  useEffect(() => {
    if (!selectedType && isOrderLocked && typeProp && applicationTypes.some(t => t.key === typeProp)) {
  // if (DEBUG) console.debug('[FormClient][fallback] applying typeProp because selectedType still empty', { typeProp })
      setSelectedType(typeProp)
    }
  }, [selectedType, isOrderLocked, typeProp])

  // Notify parent about prefill availability and provide apply function
  // Guard against infinite loops by only notifying when availability status changes
  const lastPrefillStatusRef = useRef<boolean | null>(null)
  useEffect(() => {
    if (!onPrefillStateChange) return
    const available = !!prefillCandidate
    if (lastPrefillStatusRef.current === available) return
    lastPrefillStatusRef.current = available
    if (available) {
      const snapshot = prefillCandidate
      const apply = () => {
        if (!snapshot) return
        setFormValues(prev => ({ ...snapshot, ...prev }))
        setPrefillCandidate(null)
      }
      onPrefillStateChange({ available: true, apply })
      flowLog('prefill:available', 'Prefill available', { keys: Object.keys(snapshot || {}) })
    } else {
      onPrefillStateChange({ available: false, apply: () => {} })
      flowLog('prefill:unavailable', 'Prefill not available')
    }
  }, [prefillCandidate, onPrefillStateChange])

  return (
    <div className="py-8 px-4 sm:px-6">
      {/* Prefill banner removed; replaced by external header button in parent component */}
      <div className={styleTokens.outer}>
        <Card className="border-0 shadow-none">
        {/* Anchor for focus/scroll after exiting confirm mode */}
        <div ref={formTopRef} tabIndex={-1} aria-label="Form top anchor" />
        <CardContent className="px-8 pb-10 space-y-12">
          <div className="space-y-3">
            <Label htmlFor="application-type" className="text-sm font-semibold text-gray-800 tracking-wide">Application Type</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Select value={selectedType} onValueChange={setSelectedType} disabled={isOrderLocked}>
                  <SelectTrigger id="application-type" disabled={isOrderLocked} className="h-11">
                    <SelectValue placeholder="Select an application type" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isOrderLocked && (
                <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded">Locked by order</span>
              )}
            </div>
            {!selectedType && (
              <p className="text-xs text-gray-500">Choose an application type to load relevant dynamic fields below.</p>
            )}
          </div>

          {selectedType ? (
            <div className="pt-2 space-y-2">
              <div className={styleTokens.sectionWrap}>
                <div className={styleTokens.sectionHeaderRow}>
                  <span className={styleTokens.sectionAccent} />
                  <h3 className={styleTokens.sectionTitle}>Basic Information</h3>
                  <span className="ml-auto text-xs text-gray-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">{relevantFields.length} fields</span>
                </div>
                <div className={styleTokens.sectionDivider} />
              </div>
              <div className="px-8">
                <div className={styleTokens.grid}>
                  {relevantFields.map((field, index) => {
                    const lower = field.field_title.toLowerCase()
                    const isLong = /(description|comment|instruction|statement|summary|problem|solution|features|abstract|claims|specification)/.test(lower)
                    const isDrawingsField = /^drawings\s*\/\s*figures$/i.test(field.field_title.trim())
                    const category = inferAttachmentCategoryFromField(field.field_title)
                    const isApplicantField = /^(inventor\s*\/\s*)?applicant.*name\(s\)|^(inventor|applicant).*name(s)?$/.test(field.field_title.trim().toLowerCase())
                    // Determine if this field is an upload or comment-like (thus NOT mandatory)
                    const limitMeta = (() => {
                      // Normalize: lowercase, remove spaces around slashes, remove punctuation except underscores, collapse to single underscores
                      const raw = field.field_title.trim().toLowerCase()
                        .replace(/\s*\/\s*/g,'_')
                        .replace(/[()]/g,'')
                        .replace(/\?/g,'')
                        .replace(/\s+/g,'_')
                        .replace(/__+/g,'_')
                      const key = raw
                      const lm: any = (formCharLimits as any)[key]
                      return lm || null
                    })()
                    const isUpload = isDrawingsField || (limitMeta && limitMeta.kind === 'upload') || !!category
                    const isCommentLike = (
                      lower.includes('comment') ||
                      lower.includes('comments') ||
                      lower.includes('notes') ||
                      lower.includes('additional instructions') ||
                      lower.includes('additional_instructions') ||
                      lower.includes('instructions') ||
                      lower.includes('message')
                    )
                    const isRequired = !isUpload && !isCommentLike
                    const forceFullWidth = [
                      'technical field',
                      'brief summary of invention',
                      'problem statement',
                      'proposed solution',
                      'key novel features',
                      'closest known solutions (if any)'
                    ].includes(lower.trim())
                    const value = formValues[field.field_title] || ''
                    let remaining: number | null = null
                    if (limitMeta && limitMeta.kind === 'chars' && typeof limitMeta.max === 'number') {
                      remaining = limitMeta.max - value.length
                    } else if (limitMeta && limitMeta.kind === 'words' && typeof limitMeta.max === 'number') {
                      const words = value.trim() ? value.trim().split(/\s+/).length : 0
                      remaining = limitMeta.max - words
                    }
                    const limitBasedWide = (() => {
                      if (!limitMeta) return false
                      if (limitMeta.kind === 'chars' && typeof limitMeta.max === 'number') return limitMeta.max > 50
                      if (limitMeta.kind === 'words' && typeof limitMeta.max === 'number') return limitMeta.max > 50
                      return false
                    })()
                    const wrapperClass = (isDrawingsField || forceFullWidth || (limitBasedWide && !isDrawingsField && !isApplicantField)) ? 'col-span-2 space-y-2' : styleTokens.fieldBlock
                    return (
                      <div key={index} className={wrapperClass}>
                        <Label htmlFor={`field-${index}`} className={styleTokens.label}>
                          <span className={styleTokens.badgeNumber}>{index + 1}</span>
                          {field.field_title}
                          {isRequired && (
                            <span className="ml-1 text-red-600" aria-hidden="true">*</span>
                          )}
                          {limitMeta && limitMeta.kind !== 'upload' && (
                            <span className="ml-2 text-[10px] font-normal text-gray-500">
                              {limitMeta.kind === 'chars' && typeof limitMeta.max === 'number' && `${value.length}/${limitMeta.max} ch`}
                              {limitMeta.kind === 'words' && typeof limitMeta.max === 'number' && `${(value.trim()?value.trim().split(/\s+/).length:0)}/${limitMeta.max} w`}
                              {remaining != null && remaining <= 25 && remaining >= 0 && (
                                <span className="ml-1 text-blue-600">{remaining} left</span>
                              )}
                              {remaining != null && remaining < 0 && (
                                <span className="ml-1 text-red-600">over by {Math.abs(remaining)}</span>
                              )}
                            </span>
                          )}
                        </Label>
                        <div>
                          { (isDrawingsField || (limitMeta && limitMeta.kind === 'upload')) ? (
                            <div className="space-y-3">
                              {/* Ephemeral file input created on demand (per category) */}
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={!selectedType || !orderIdEffective}
                                  onClick={() => {
                                    if (!selectedType || !orderIdEffective) return
                                    const input = document.createElement('input')
                                    input.type = 'file'
                                    input.multiple = true
                                    input.accept = ALLOWED_MIME.join(',')
                                    input.style.display = 'none'
                                    input.onchange = (e: any) => {
                                      try {
                                        const fl: FileList | null = e.target.files
                                        if (!fl || fl.length === 0) return
                                        handleFilesSelected(fl, category)
                                      } finally {
                                        try { document.body.removeChild(input) } catch {}
                                      }
                                    }
                                    document.body.appendChild(input)
                                    input.click()
                                  }}
                                  className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white"
                                >Upload</Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={!selectedType || !orderIdEffective || loadingAttachments}
                                  onClick={manualReloadAttachments}
                                  className="h-8 px-3 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                                >{loadingAttachments ? 'Reloading…' : 'Reload'}</Button>
                                <span className="text-[11px] text-gray-500">Allowed: PDF, PNG, JPG, SVG up to {(MAX_FILE_BYTES/1024/1024).toFixed(0)}MB</span>
                                {attachmentContext.userId && (
                                  <span className="text-[9px] text-gray-400 font-mono truncate max-w-[140px]" title={attachmentContext.userId}>uid:{attachmentContext.userId}</span>
                                )}
                              </div>
                              {attachmentsError && <div className="text-xs text-red-600 font-medium">{attachmentsError}</div>}
                              {FLOW_DEBUG && attachmentsDebugInfo && !attachmentsError && (
                                <div className={styleTokens.attachmentsMeta}>{attachmentsDebugInfo}</div>
                              )}
                              {loadingAttachments && (
                                <div className="text-xs text-gray-500">Loading existing attachments…</div>
                              )}
                              <div className="space-y-2">
                                {attachments.length === 0 && !loadingAttachments && !attachmentsError && (
                                  <div className="text-xs text-gray-500">No drawings uploaded yet.</div>
                                )}
                                {attachments
                                  .filter(a => {
                                    // If no category for this field, show all (fallback text field case)
                                    if (!category) return true
                                    const name = a.name || ''
                                    const hasPrefix = /^\[(DISCLOSURE|DRAWING|SPEC|CLAIMS|ABSTRACT)\]/i.test(name)
                                    if (!hasPrefix) {
                                      // Legacy files: appear only in drawings section to avoid duplication
                                      return category === 'drawing'
                                    }
                                    if (category === 'disclosure') return name.startsWith(ATTACH_PREFIX_DISCLOSURE)
                                    if (category === 'drawing') return name.startsWith(ATTACH_PREFIX_DRAWING)
                                    if (category === 'spec') return name.startsWith(ATTACH_PREFIX_SPEC)
                                    if (category === 'claims') return name.startsWith(ATTACH_PREFIX_CLAIMS)
                                    if (category === 'abstract') return name.startsWith(ATTACH_PREFIX_ABSTRACT)
                                    return false
                                  })
                                  .map(a => {
                                  const statusLabel = a.status === 'uploading'
                                    ? 'Uploading…'
                                    : a.status === 'removing'
                                      ? 'Removing…'
                                      : a.status === 'done'
                                        ? 'Uploaded'
                                        : a.status === 'error'
                                          ? 'Failed'
                                          : a.status
                                  return (
                                    <div key={a.tempId} className={styleTokens.attachmentItem}>
                                      <div className="flex justify-between items-start gap-4">
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs font-semibold text-gray-800 truncate" title={a.name}>{stripAttachmentPrefix(a.name)}</div>
                                          <div className={`text-[11px] mt-0.5 ${a.status === 'done' ? 'text-green-600' : a.status === 'error' ? 'text-red-600' : a.status === 'removing' ? 'text-blue-600' : 'text-gray-500'}`}>{statusLabel}</div>
                                          <div className="text-[11px] text-gray-500 mt-0.5">{(a.size/1024).toFixed(1)} KB • {a.type || 'file'}</div>
                                          {a.errorMsg && <div className="text-[10px] text-red-600 mt-1">{a.errorMsg}</div>}
                                          {(a.status === 'uploading' || a.status === 'removing') && (
                                            <div className={styleTokens.progressBarWrap}>
                                              <div className={`h-full ${a.status === 'removing' ? 'bg-blue-400' : 'bg-blue-500'} animate-pulse`} style={{ width: '70%' }} />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemoveAttachment(a.tempId)}
                                            disabled={a.status === 'uploading' || a.status === 'removing'}
                                            className="h-6 px-2 text-[11px] text-blue-700 border-blue-200 hover:bg-blue-50"
                                          >Remove</Button>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ) : isApplicantField ? (
                            <div className="space-y-3">
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    setMultiAuthors(prev => {
                                      const list = prev[field.field_title] ? [...prev[field.field_title]] : ['']
                                      list.push('')
                                      setFormValues(fv => ({ ...fv, [field.field_title]: list.filter(x => x.trim() !== '').join('\n') }))
                                      return { ...prev, [field.field_title]: list }
                                    })
                                  }}
                                  className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                >+ Author</Button>
                                <p className="text-[10px] text-gray-500 self-center">Add each inventor/applicant separately; they will be saved together.</p>
                              </div>
                              <div className="space-y-2">
                                {(multiAuthors[field.field_title] || ['']).map((author, ai) => (
                                  <div key={ai} className="flex gap-2 items-center">
                                    <Input
                                      id={`field-${index}-author-${ai}`}
                                      type="text"
                                      placeholder={`Name ${ai + 1}`}
                                      value={author}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        setMultiAuthors(prev => {
                                          const list = [...(prev[field.field_title] || [])]
                                          list[ai] = val
                                          setFormValues(fv => ({ ...fv, [field.field_title]: enforceLimit(field.field_title, list.filter(x => x.trim() !== '').join('\n')) }))
                                          return { ...prev, [field.field_title]: list }
                                        })
                                      }}
                                      className={styleTokens.input}
                                      aria-required={isRequired}
                                      required={isRequired}
                                      style={{ fontSize: formFontSize, fontWeight: formFontBold ? 600 : 400 }}
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={(multiAuthors[field.field_title] || []).length <= 1}
                                      onClick={() => {
                                        setMultiAuthors(prev => {
                                          let list = [...(prev[field.field_title] || [])]
                                          list.splice(ai,1)
                                          if (list.length === 0) list = ['']
                                          setFormValues(fv => ({ ...fv, [field.field_title]: enforceLimit(field.field_title, list.filter(x => x.trim() !== '').join('\n')) }))
                                          return { ...prev, [field.field_title]: list }
                                        })
                                      }}
                                      className="h-8 px-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                                    >Remove</Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            (isLong || limitBasedWide) ? (
                              <Textarea
                                id={`field-${index}`}
                                placeholder={`Enter ${lower}`}
                                value={formValues[field.field_title] || ""}
                                onChange={(e) => handleInputChange(field.field_title, e.target.value)}
                                readOnly={readOnly}
                                disabled={readOnly}
                                className={`${styleTokens.textarea} whitespace-pre-wrap break-words`}
                                aria-required={isRequired}
                                required={isRequired}
                                style={{ fontSize: formFontSize, fontWeight: formFontBold ? 600 : 400 }}
                              />
                            ) : (
                              <Input
                                id={`field-${index}`}
                                type="text"
                                placeholder={`Enter ${lower}`}
                                value={formValues[field.field_title] || ""}
                                onChange={(e) => handleInputChange(field.field_title, e.target.value)}
                                readOnly={readOnly}
                                disabled={readOnly}
                                className={`${styleTokens.input} break-words`}
                                aria-required={isRequired}
                                required={isRequired}
                                style={{ fontSize: formFontSize, fontWeight: formFontBold ? 600 : 400 }}
                              />
                            )
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className={styleTokens.actionsBar}>
                <div className="flex flex-wrap gap-4 items-center w-full justify-between">
                  {/* Font controls */}
                  <div
                    className="flex items-center gap-2 text-xs text-gray-600 select-none rounded-lg border border-slate-200 bg-white/80 dark:bg-slate-800/60 px-3 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60"
                    aria-label="Form text style controls"
                  >
                    <span className="font-medium text-gray-700">Text</span>
                    <button
                      type="button"
                      onClick={() => setFormFontSize(s => Math.max(8, s - 1))}
                      className="px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={formFontSize <= 8}
                      title="Decrease font size"
                    >A-</button>
                    <button
                      type="button"
                      onClick={() => setFormFontSize(s => Math.min(20, s + 1))}
                      className="px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={formFontSize >= 20}
                      title="Increase font size"
                    >A+</button>
                    <button
                      type="button"
                      onClick={() => setFormFontBold(b => !b)}
                      className={`px-2 py-1 rounded border bg-white hover:bg-gray-50 transition-colors ${formFontBold ? 'font-semibold bg-blue-50 border-blue-300 text-blue-700' : ''}`}
                      title="Toggle bold"
                    >B</button>
                    <span className="text-gray-400">{formFontSize}px</span>
                  </div>
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-4 items-center">
                    {/* Confirm mode: show Confirm/Edit only; hide Save/Refill/Submit */}
                    {confirmMode ? (
                      <>
                        <Button
                          onClick={() => handleSave()}
                          disabled={saving || !coreComplete}
                          className={styleTokens.primaryBtn + (saving ? ' opacity-70 cursor-not-allowed' : '')}
                        >
                          {saving ? 'Saving…' : 'Confirm'}
                        </Button>
                        <Button
                          onClick={exitConfirmModeToEdit}
                          variant="outline"
                          className={styleTokens.secondaryBtn}
                          disabled={saving}
                        >
                          Edit
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Primary: Save (default action while editing) */}
                        <Button
                          onClick={handleSave}
                          disabled={readOnly || saving}
                          className={styleTokens.primaryBtn + ((!readOnly && saving) ? ' opacity-70 cursor-not-allowed' : '')}
                        >
                          {(!readOnly && saving) ? 'Saving…' : 'Save'}
                        </Button>
                        {/* Refill clears all fields and keeps edit mode */}
                        <Button
                          onClick={handleRefill}
                          variant="outline"
                          className={styleTokens.secondaryBtn}
                          disabled={saving}
                        >
                          Refill
                        </Button>
                        {/* Submit enters read-only confirm mode to review */}
                        <Button
                          onClick={enterConfirmMode}
                          className={styleTokens.primaryBtn}
                          disabled={saving || !coreComplete}
                        >
                          Submit
                        </Button>
                      </>
                    )}
                    {!confirmMode && !coreComplete && (
                      <div className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                        Fill all required fields to enable Submit
                      </div>
                    )}
                    {!confirmMode && saveSuccessTs && (Date.now() - saveSuccessTs) < RECENT_SAVE_MS && savedBannerState !== 'hidden' && (
                      <div className={`flex items-center gap-2 text-sm font-medium text-green-600 transition-opacity duration-600 ${savedBannerState === 'fading' ? 'opacity-0' : 'opacity-100'}`}>
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                        Saved successfully
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {showThankYouBanner && (
                <div
                  ref={thankYouRef}
                  role="status"
                  tabIndex={-1}
                  className="mx-8 mt-8 flex items-start gap-4 rounded-lg border-2 border-green-300 bg-green-50/90 px-6 py-5 text-green-900 shadow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0 text-green-600"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.22-.86l-3.236 4.59-1.59-1.59a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.16-.094l3.756-5.356Z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    {thankYouVariant === 'confirmed' ? (
                      <>
                        <p className="text-base md:text-lg font-semibold leading-tight">Thank you for confirming your details</p>
                        <p className="text-sm md:text-base leading-relaxed">Our team will have a look and get in touch soon.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-base md:text-lg font-semibold leading-tight">Thank you for submitting the form</p>
                        <p className="text-sm md:text-base leading-relaxed">Our team will get back to you.</p>
                        {/* Submitted details table */}
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-green-900 mb-2">Submitted Details</div>
                          <div className="overflow-x-auto rounded-md border border-green-200 bg-white/70">
                            <table className="w-full text-sm">
                              <thead className="bg-green-100/70 text-green-900">
                                <tr>
                                  <th className="px-3 py-2 text-left font-medium">Field</th>
                                  <th className="px-3 py-2 text-left font-medium">Your input</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(filledEntries.length === 0 && attachmentEntries.length === 0) ? (
                                  <tr>
                                    <td colSpan={2} className="px-3 py-3 text-gray-600">No details captured.</td>
                                  </tr>
                                ) : (
                                  <>
                                    {filledEntries.map((e, i) => (
                                      <tr key={`txt-${i}`} className="odd:bg-green-50/40">
                                        <td className="align-top px-3 py-2 font-medium text-gray-800">{e.label}</td>
                                        <td className="align-top px-3 py-2 whitespace-pre-wrap text-gray-700">{e.value}</td>
                                      </tr>
                                    ))}
                                    {attachmentEntries.map((e, i) => (
                                      <tr key={`att-${i}`} className="odd:bg-green-50/40">
                                        <td className="align-top px-3 py-2 font-medium text-gray-800">{e.label}</td>
                                        <td className="align-top px-3 py-2 whitespace-pre-wrap text-gray-700">{e.files.join('\n')}</td>
                                      </tr>
                                    ))}
                                  </>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss message"
                    onClick={() => setShowThankYouBanner(false)}
                    className="ml-3 rounded-md p-1.5 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path fillRule="evenodd" d="M6.225 4.811a.75.75 0 0 1 1.06 0L12 9.525l4.715-4.714a.75.75 0 1 1 1.06 1.06L13.06 10.586l4.715 4.714a.75.75 0 1 1-1.06 1.06L12 11.646l-4.715 4.714a.75.75 0 1 1-1.06-1.06l4.714-4.715-4.714-4.714a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-pretty">Please select an application type to view and edit the relevant form fields.</p>
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
