"use client";
import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import FormClient from '@/app/forms/FormClient'
import { buildInvoiceWithFormsHtml } from '@/lib/quotation'
import { supabaseBrowser as supabase } from '@/lib/supabase-browser'

export interface EmbeddedFormEntry { id: number; type: string }

interface FormsPanelProps {
  embeddedMultiForms: EmbeddedFormEntry[] | null
  selectedFormOrderId: number | null
  selectedFormType: string | null
  lastSavedSnapshot: { type: string; orderId: number | null; values: Record<string,string> } | null
  prefillAvailable: boolean
  onPrefillApply: () => void
  onPrefillStateChange: (info: { available: boolean; apply: () => void }) => void
  onSetActive: (id: number, type: string) => void
  goToOrders: () => void
  backToServices: () => void
  formPrefillHandleFirst: (info: { available: boolean; apply: () => void }) => void
  setLastSavedSnapshot: (info: { type: string; orderId: number | null; values: Record<string,string> }) => void
  embeddedOrders: any[]
  checkoutOrders: any[]
}

const FormsPanelComponent: React.FC<FormsPanelProps> = ({
  embeddedMultiForms,
  selectedFormOrderId,
  selectedFormType,
  lastSavedSnapshot,
  prefillAvailable,
  onPrefillApply,
  onPrefillStateChange,
  onSetActive,
  goToOrders,
  backToServices,
  formPrefillHandleFirst,
  setLastSavedSnapshot,
  embeddedOrders,
  checkoutOrders,
}) => {
  const [showFinalBanner, setShowFinalBanner] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  // Track which embedded forms (by orderId) have been confirmed in this session
  const [confirmedForms, setConfirmedForms] = useState<Set<number>>(new Set())
  const topAnchorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showFinalBanner) return
    try {
      const el = topAnchorRef.current
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        ;(el as any).focus?.()
      }
    } catch {}
  }, [showFinalBanner])

  // Seed confirmed set from backend flags if available, while preserving any local confirmations
  useEffect(() => {
    if (!embeddedMultiForms || embeddedMultiForms.length === 0) return
    try {
      const merged = new Set<number>(confirmedForms)
      for (const f of embeddedMultiForms) {
        const o = findOrderById(f.id)
        if (o && o.form_confirmed) merged.add(Number(f.id))
      }
      setConfirmedForms(merged)
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embeddedMultiForms, embeddedOrders, checkoutOrders])

  // Multi-form guard: only show final banner when ALL forms are confirmed
  useEffect(() => {
    if (!embeddedMultiForms || embeddedMultiForms.length === 0) return
    try {
      const allConfirmed = embeddedMultiForms.every(f => {
        const id = Number(f.id)
        if (confirmedForms.has(id)) return true
        const o = findOrderById(id)
        return !!o?.form_confirmed
      })
      setShowFinalBanner(allConfirmed)
    } catch {}
  }, [embeddedMultiForms, confirmedForms, embeddedOrders, checkoutOrders])

  const renderHeader = () => (
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
          onClick={() => { if (prefillAvailable) onPrefillApply() }}
          disabled={!prefillAvailable}
          className={!prefillAvailable ? 'opacity-40 cursor-not-allowed' : ''}
        >
          Prefill Saved Data
        </Button>
      </div>
    </div>
  )

  // Helper to find the enriched order object by id from provided sources
  const findOrderById = (id: number | null | undefined) => {
    if (id == null) return null
    const eo = (embeddedOrders || []).find((o: any) => Number(o.id) === Number(id))
    if (eo) return eo
    const co = (checkoutOrders || []).find((o: any) => Number(o.id) === Number(id))
    return co || null
  }

  // Generate Invoice+Forms HTML for given order objects (single or multiple)
  const generateInvoiceHtmlForOrders = async (orders: any[]): Promise<{ html: string; filename: string }> => {
    // Compute bundle metadata
    const paymentId = (() => {
      const allPayIds = orders.map(o => (o?.payments as any)?.razorpay_payment_id || (o?.payments as any)?.id || null).filter(Boolean)
      if (allPayIds.length === 0) return `orders-${orders.map(o=>o.id).join('-')}`
      const uniq = Array.from(new Set(allPayIds.map(String)))
      return uniq.length === 1 ? String(uniq[0]) : `orders-${orders.map(o=>o.id).join('-')}`
    })()
    const totalAmount = orders.reduce((sum, o) => sum + (Number(o?.amount ?? 0) || 0), 0)

    // Prepare attachments map with signed URLs
    const orderIds: number[] = orders.map((o: any) => Number(o.id)).filter((v) => Number.isFinite(v))
    const attachmentsMap: Record<string, Array<{ name: string; url: string; size?: number; type?: string }>> = {}
    const normalizedForms: Record<string | number, Array<{ field: string; value: any }>> = {}
    try {
      if (orderIds.length) {
        // 1) Attachments with signed URLs
        const { data: rows, error: attErr } = await supabase
          .from('form_attachments')
          .select('order_id, filename:filename, storage_path, mime_type, size_bytes, deleted')
          .in('order_id', orderIds)
          .eq('deleted', false)
          .order('uploaded_at', { ascending: true })
        if (!attErr && Array.isArray(rows)) {
          const signed = await Promise.all(rows.map(async (r: any) => {
            let url = ''
            if (r.storage_path) {
              try {
                const { data: sig, error: sigErr } = await supabase.storage
                  .from('figures')
                  .createSignedUrl(r.storage_path, 60 * 60, { download: r.filename || undefined })
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
        // 2) Form responses for normalization (to include submitted values in PDF)
        try {
          const { data: frRows } = await supabase
            .from('form_responses')
            .select('order_id, data')
            .in('order_id', orderIds)
          const uploadsFieldNames = new Set(['upload','uploads','attachments','files','file_upload'])
          for (const r of (frRows as any[] | null) || []) {
            const oid = r.order_id
            const data = r.data || {}
            const pairs: Array<{ field: string; value: any }> = []
            try {
              const obj = typeof data === 'object' && data != null ? data : {}
              for (const [k, v] of Object.entries(obj)) {
                const lk = k.toLowerCase()
                if (uploadsFieldNames.has(lk)) continue
                pairs.push({ field: k, value: v })
              }
            } catch {}
            if (pairs.length) normalizedForms[String(oid)] = pairs
          }
        } catch {}
      }
    } catch {}

    const html = buildInvoiceWithFormsHtml({
      bundle: { orders, paymentKey: paymentId, totalAmount },
      company: { name: 'LegalIP Pro' },
      normalizedForms,
      attachments: attachmentsMap,
      // Forms panel requirement: forms-only export (omit invoice details)
      formsOnly: true,
    })
    const filenameSafe = (s: string) => s.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const base = orders.length === 1 ? `order-${orders[0].id}` : `orders-${orders.map(o=>o.id).join('-')}`
    const file = `forms-${filenameSafe(paymentId || base) || base}.html`
    return { html, filename: file }
  }

  const downloadHtmlFile = (html: string, filename: string) => {
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'invoice.html'
      document.body.appendChild(a)
      a.click()
      a.remove()
      // Revoke shortly after to allow download to start
      setTimeout(() => { try { URL.revokeObjectURL(url) } catch {} }, 1000)
    } catch (e) {
      console.error('Download failed', e)
      alert('Failed to download file.')
    }
  }

  if (!embeddedMultiForms) {
    return (
      <>
        <div ref={topAnchorRef} tabIndex={-1} aria-label="Forms top anchor" />
        {renderHeader()}
        {showFinalBanner && (
          <div className="mb-5 mx-1 md:mx-0 flex items-start gap-4 rounded-xl border-2 border-green-400 bg-green-50 px-5 py-4 text-green-900 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 flex-shrink-0 text-green-600" aria-hidden="true">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.22-.86l-3.236 4.59-1.59-1.59a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.16-.094l3.756-5.356Z" clipRule="evenodd" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-base md:text-lg font-semibold leading-tight">Thank you for submitting all the required details</p>
              <p className="text-xs md:text-sm leading-relaxed mt-1">Our team will review everything and get in touch soon.</p>
              <p className="text-xs md:text-sm leading-relaxed mt-2">Please find attached a PDF copy of your form submission.</p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={downloadingPdf}
                  onClick={async () => {
                    try {
                      setDownloadingPdf(true)
                      const ord = findOrderById(selectedFormOrderId)
                      if (!ord) { alert('Could not determine order for PDF.'); return }
                      const { html, filename } = await generateInvoiceHtmlForOrders([ord])
                      downloadHtmlFile(html, filename)
                    } catch (e) {
                      console.error('Final banner PDF error', e)
                      alert('Failed to generate PDF.')
                    } finally {
                      setDownloadingPdf(false)
                    }
                  }}
                >{downloadingPdf ? 'Preparing…' : 'Download PDF'}</Button>
              </div>
            </div>
            <button type="button" aria-label="Dismiss" onClick={() => setShowFinalBanner(false)} className="ml-2 rounded-md p-1 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path fillRule="evenodd" d="M6.225 4.811a.75.75 0 0 1 1.06 0L12 9.525l4.715-4.714a.75.75 0 1 1 1.06 1.06L13.06 10.586l4.715 4.714a.75.75 0 1 1-1.06 1.06L12 11.646l-4.715 4.714a.75.75 0 1 1-1.06-1.06l4.714-4.715-4.714-4.714a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
            </button>
          </div>
        )}
        {!showFinalBanner && (
          <Card className="bg-white">
            <CardContent className="p-0">
              <FormClient
                orderIdProp={selectedFormOrderId}
                typeProp={selectedFormType}
                onPrefillStateChange={onPrefillStateChange}
                externalPrefill={lastSavedSnapshot}
                onSaveLocal={(info) => setLastSavedSnapshot(info)}
                // Single form: after final confirm, show a final global banner and hide the form
                onConfirmComplete={() => { setShowFinalBanner(true) }}
              />
            </CardContent>
          </Card>
        )}
      </>
    )
  }

  return (
    <>
      <div ref={topAnchorRef} tabIndex={-1} aria-label="Forms top anchor" />
      {renderHeader()}
      {/* Multi-form progress indicator */}
      {embeddedMultiForms && embeddedMultiForms.length > 0 && !showFinalBanner && (
        (() => {
          try {
            const total = embeddedMultiForms.length
            let confirmedCount = 0
            let nextUnconfirmed: { id: number; type: string } | null = null
            for (const f of embeddedMultiForms) {
              const id = Number(f.id)
              if (confirmedForms.has(id)) { confirmedCount++; continue }
              const o = findOrderById(id)
              if (o?.form_confirmed) confirmedCount++
              else if (!nextUnconfirmed) nextUnconfirmed = { id, type: f.type }
            }
            return (
              <div className="mb-5 mx-1 md:mx-0">
                <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-blue-300 bg-blue-50 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600"><path fillRule="evenodd" d="M11.25 4.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0V6.31l-8.47 8.47a.75.75 0 0 1-1.06-1.06l8.47-8.47h-5.69a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"/><path d="M3 5.25A2.25 2.25 0 0 1 5.25 3h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 0-.75.75v13.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-5.5a.75.75 0 0 1 1.5 0v5.5A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25Z"/></svg>
                    <div className="text-sm md:text-base font-medium text-blue-900">
                      <span><strong>{confirmedCount}</strong> of <strong>{total}</strong> forms confirmed</span>
                    </div>
                  </div>
                  {nextUnconfirmed && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-800 hover:bg-blue-100"
                      onClick={() => {
                        try {
                          onSetActive(nextUnconfirmed!.id, nextUnconfirmed!.type)
                          const el = document.getElementById(`embedded-form-${nextUnconfirmed!.id}`)
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        } catch {}
                      }}
                    >Go to next</Button>
                  )}
                </div>
              </div>
            )
          } catch { return null }
        })()
      )}
      {showFinalBanner && (
        <div className="mb-5 mx-1 md:mx-0 flex items-start gap-4 rounded-xl border-2 border-green-400 bg-green-50 px-5 py-4 text-green-900 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 flex-shrink-0 text-green-600" aria-hidden="true">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.22-.86l-3.236 4.59-1.59-1.59a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.16-.094l3.756-5.356Z" clipRule="evenodd" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-base md:text-lg font-semibold leading-tight">Thank you for submitting all the required details</p>
            <p className="text-xs md:text-sm leading-relaxed mt-1">Our team will review everything and get in touch soon.</p>
            <p className="text-xs md:text-sm leading-relaxed mt-2">Please find attached a PDF copy of your form submission.</p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                disabled={downloadingPdf}
                onClick={async () => {
                  try {
                    setDownloadingPdf(true)
                    // Multi-form: include all embedded forms' orders in the bundle
                    const orders = (embeddedMultiForms || []).map(f => findOrderById(f.id)).filter(Boolean) as any[]
                    if (!orders.length) { alert('No orders available for PDF.'); return }
                    const { html, filename } = await generateInvoiceHtmlForOrders(orders)
                    downloadHtmlFile(html, filename)
                  } catch (e) {
                    console.error('Final banner PDF error', e)
                    alert('Failed to generate PDF.')
                  } finally {
                    setDownloadingPdf(false)
                  }
                }}
              >{downloadingPdf ? 'Preparing…' : 'Download PDF'}</Button>
            </div>
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => setShowFinalBanner(false)} className="ml-2 rounded-md p-1 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path fillRule="evenodd" d="M6.225 4.811a.75.75 0 0 1 1.06 0L12 9.525l4.715-4.714a.75.75 0 1 1 1.06 1.06L13.06 10.586l4.715 4.714a.75.75 0 1 1-1.06 1.06L12 11.646l-4.715 4.714a.75.75 0 1 1-1.06-1.06l4.714-4.715-4.714-4.714a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}
      {!showFinalBanner && (
        <div className="space-y-12">
        {embeddedMultiForms.map((f, idx) => {
          // Attempt to find the corresponding order object (from embeddedOrders or checkoutOrders) to pull payment id
          const sourceOrder = (embeddedOrders || []).find(o => Number(o.id) === Number(f.id)) || (checkoutOrders || []).find(o => Number(o.id) === Number(f.id))
          const payId = (sourceOrder && (sourceOrder.payments as any)?.razorpay_payment_id) || null
          const isConfirmed = confirmedForms.has(Number(f.id)) || !!sourceOrder?.form_confirmed
          return (
            <Card id={`embedded-form-${f.id}`} key={f.id} className="bg-white border border-slate-200 shadow-sm scroll-mt-24 transition-shadow">
              <CardContent className="p-0">
                <div className="px-6 pt-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">{idx+1}</span>
                    {payId ? `Payment ${payId}` : `Order #${f.id}`}
                    {isConfirmed && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 text-[11px]">Confirmed</span>
                    )}
                  </h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant={selectedFormOrderId === f.id ? 'default' : 'outline'}
                          disabled={isConfirmed}
                          className={isConfirmed ? 'opacity-60 cursor-not-allowed' : ''}
                          onClick={() => { if (!isConfirmed) onSetActive(f.id, f.type) }}
                        >
                          Focus
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-xs leading-snug">
                        {isConfirmed ? 'This form has been confirmed.' : 'Make this form the active one: scroll it into view, highlight it briefly, and sync shared prefill context.'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {!isConfirmed ? (
                  <div className="mt-4">
                    <FormClient
                      orderIdProp={f.id}
                      typeProp={f.type}
                      externalPrefill={lastSavedSnapshot}
                      onPrefillStateChange={idx === 0 ? formPrefillHandleFirst : () => {}}
                      onSaveLocal={(info) => setLastSavedSnapshot(info)}
                      // Multi-form: after confirm, mark confirmed and move to next unconfirmed form
                      onConfirmComplete={() => {
                        try {
                          setConfirmedForms(prev => {
                            const upd = new Set<number>(prev)
                            upd.add(Number(f.id))
                            const pending = (embeddedMultiForms || []).find(ff => !upd.has(Number(ff.id)))
                            if (pending) onSetActive(pending.id, pending.type)
                            else setShowFinalBanner(true)
                            return upd
                          })
                        } catch {}
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-4 px-6 pb-6 text-xs text-green-800">This form has been confirmed.</div>
                )}
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}
    </>
  )
}

function propsEqual(prev: FormsPanelProps, next: FormsPanelProps) {
  // Re-render only if the structure of embedded forms or selected ids/types changed or snapshot reference changed
  if (prev.embeddedMultiForms?.length !== next.embeddedMultiForms?.length) return false
  if (prev.selectedFormOrderId !== next.selectedFormOrderId) return false
  if (prev.selectedFormType !== next.selectedFormType) return false
  if (prev.lastSavedSnapshot !== next.lastSavedSnapshot) return false
  // Basic shallow compare of ids/types when length matches
  if (prev.embeddedMultiForms && next.embeddedMultiForms) {
    for (let i = 0; i < prev.embeddedMultiForms.length; i++) {
      const a = prev.embeddedMultiForms[i]; const b = next.embeddedMultiForms[i]
      if (a.id !== b.id || a.type !== b.type) return false
    }
  }
  return true
}

const FormsPanel = React.memo(FormsPanelComponent, propsEqual)
export default FormsPanel
