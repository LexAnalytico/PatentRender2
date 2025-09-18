"use client"

import { useEffect, useState } from "react"
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import formData from "../data/forms-fields.json"
import pricingToForm from '../data/service-pricing-to-form.json'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

export default function IPFormBuilderClient() {
  const [selectedType, setSelectedType] = useState<string>("")
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [prefillOpen, setPrefillOpen] = useState(false)
  const [prefillCandidate, setPrefillCandidate] = useState<Record<string, string> | null>(null)
  const toastHook = useToast?.()
  const toast = toastHook ?? { toast: (opts: any) => { if (opts?.title) alert(`${opts.title}\n${opts?.description || ""}`) } }
  const searchParams = useSearchParams()

  useEffect(() => {
  const urlPricingKey = searchParams?.get("pricing_key") || ""
  const urlType = searchParams?.get("type") || ""
    const orderIdRaw = searchParams?.get("order_id") || ""
    const orderIdNum = orderIdRaw ? Number(orderIdRaw) : null

  console.log('Debug FormClient - URL params:', { pricing_key: urlPricingKey, type: urlType, orderId: orderIdNum })

    // Priority 1: pricing_key in URL (pricing rule key) -> map to canonical
    if (urlPricingKey) {
      const mapped = getPricingToForm(urlPricingKey)
      console.log('Debug FormClient - mapping pricing_key from URL:', urlPricingKey, '->', mapped)
      if (mapped && applicationTypes.some((t) => t.key === mapped)) {
        setSelectedType(mapped)
        return
      }
    }

    // Priority 2: Normalize URL type to canonical (if pricing key is provided)
    let urlCanonical: string | null = null
    if (urlType) {
      if (applicationTypes.some((t) => t.key === urlType)) {
        urlCanonical = urlType
      } else {
        const mapped = getPricingToForm(urlType)
        console.log('Debug FormClient - mapping pricing key from URL:', urlType, '->', mapped)
        if (mapped && applicationTypes.some((t) => t.key === mapped)) {
          urlCanonical = mapped
        }
      }
    }

    let mounted = true
    ;(async () => {
      try {
        let resolved: string | null = null

        // If we have an order_id, resolve authoritative type from DB
    if (orderIdNum != null && !Number.isNaN(orderIdNum)) {
          const { data: ord, error: ordErr } = await supabase
            .from('orders')
            .select('type, payment_id')
      .eq('id', orderIdNum)
            .maybeSingle()
          if (ordErr) console.debug('Order lookup error resolving form type', ordErr)

          // Try order.type as canonical or mapped pricing key
          const ordType = ord?.type ?? null
          if (ordType) {
            if (applicationTypes.some((t) => t.key === ordType)) {
              resolved = ordType
            } else {
              const mapped = getPricingToForm(ordType)
              console.log('Debug FormClient - mapping order.type:', ordType, '->', mapped)
              if (mapped && applicationTypes.some((t) => t.key === mapped)) {
                resolved = mapped
              }
            }
          }

          // Fallback: try payments.type
          if (!resolved && ord?.payment_id) {
            const { data: pay, error: payErr } = await supabase
              .from('payments')
              .select('type')
              .eq('id', ord.payment_id)
              .maybeSingle()
            if (payErr) console.debug('Payment lookup error resolving form type', payErr)
            const payType = pay?.type ?? null
            if (payType) {
              if (applicationTypes.some((t) => t.key === payType)) {
                resolved = payType
              } else {
                const mapped = getPricingToForm(payType)
                console.log('Debug FormClient - mapping payments.type:', payType, '->', mapped)
                if (mapped && applicationTypes.some((t) => t.key === mapped)) {
                  resolved = mapped
                }
              }
            }
          }
        }

        // Choose final: prefer resolved-from-order/payment; else fallback to URL; else do nothing
        const finalType = resolved || urlCanonical
        console.log('Debug FormClient - final selected type:', finalType)
        if (mounted && finalType && applicationTypes.some((t) => t.key === finalType)) {
          setSelectedType(finalType)
          return
        }
      } catch (e) {
        console.error('Exception resolving form type', e)
      }
    })()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // remember last selected application type so checkout can pick it up
  useEffect(() => {
    try {
      if (selectedType) localStorage.setItem('selected_application_type', selectedType)
      else localStorage.removeItem('selected_application_type')
    } catch (_) {}
  }, [selectedType])

  const getRelevantFields = (type: string): FormField[] => {
    try {
      return (formData as any[]).filter((field: any) => String(field[type as keyof FormField]).toUpperCase() === "TRUE")
    } catch {
      return []
    }
  }

  const handleInputChange = (fieldTitle: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldTitle]: value,
    }))
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

    ;(async () => {
      try {
        const { data: sessionRes } = await supabase.auth.getSession()
        const userId = sessionRes?.session?.user?.id || null
        if (!userId) throw new Error('Not signed in')

  const orderIdParam = searchParams?.get('order_id') || null
  const orderId = orderIdParam != null ? Number(orderIdParam) : null
        const payload = {
          user_id: userId,
          order_id: orderId,
          form_type: selectedType,
          data: formValues,
          fields_filled_count: filledFields.length,
          fields_total: relevantFields.length,
          completed: filledFields.length === relevantFields.length,
        }
        const { error } = await supabase
          .from('form_responses')
          .upsert(payload, { onConflict: 'user_id,order_id,form_type' })
        if (error) throw error
        toast.toast?.({
          title: 'Form Saved',
          description: `Saved ${filledFields.length}/${relevantFields.length} fields${payload.completed ? ' (Completed)' : ''}.`,
        })
      } catch (e: any) {
        console.error('Save error', e)
        toast.toast?.({ title: 'Save failed', description: e?.message || 'Unable to save form', variant: 'destructive' })
      }
    })()
  }

  const handleCancel = () => {
    setFormValues({})
    toast.toast?.({
      title: "Form Cleared",
      description: "All form data has been cleared.",
    })
  }

  // Load form values when type changes: pull DB for this order+type; else offer prefill from any existing form for this user
  useEffect(() => {
    if (!selectedType) return
    let active = true
    ;(async () => {
      try {
        const { data: sessionRes } = await supabase.auth.getSession()
        const userId = sessionRes?.session?.user?.id || null
        if (!userId) { setFormValues({}); return }
  const orderId = (() => { const v = searchParams?.get('order_id'); const n = v != null ? Number(v) : null; return (n != null && !Number.isNaN(n)) ? n : null })()
        // Try exact match first: this order + this type
        let exactData: any = null
  if (orderId != null) {
          const { data: exact, error: exactErr } = await supabase
            .from('form_responses')
            .select('data')
            .eq('user_id', userId)
            .eq('order_id', orderId)
            .eq('form_type', selectedType)
            .maybeSingle()
          if (!exactErr && exact?.data) exactData = exact.data
        } else {
          // No order id: pick latest for this type
          const { data: latest, error: latestErr } = await supabase
            .from('form_responses')
            .select('data, updated_at')
            .eq('user_id', userId)
            .eq('form_type', selectedType)
            .order('updated_at', { ascending: false })
            .limit(1)
          if (!latestErr && latest && latest.length > 0) exactData = (latest[0] as any).data
        }
        if (exactData) { if (active) setFormValues(exactData as any); return }

        // No exact data: look for any other form to prefill
        const { data: anyData, error: anyErr } = await supabase
          .from('form_responses')
          .select('data, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
        if (!anyErr && anyData && anyData.length > 0 && (anyData[0] as any).data) {
          // Extract matching fields only
          const relevant = getRelevantFields(selectedType)
          const keys = new Set(relevant.map(r => r.field_title))
          const candidate: Record<string, string> = {}
          Object.entries((anyData[0] as any).data as Record<string,string>).forEach(([k,v]) => {
            if (keys.has(k) && v) candidate[k] = v as string
          })
          if (Object.keys(candidate).length > 0) {
            setPrefillCandidate(candidate)
            setPrefillOpen(true)
          } else {
            if (active) setFormValues({})
          }
        } else {
          if (active) setFormValues({})
        }
      } catch (e) {
        console.error('Load form values error', e)
        if (active) setFormValues({})
      }
    })()
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

  const relevantFields = selectedType ? getRelevantFields(selectedType) : []

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Dialog open={prefillOpen} onOpenChange={setPrefillOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use your saved details?</DialogTitle>
            <DialogDescription>
              We found existing information from a previous form. Would you like to pre-fill matching fields?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPrefillOpen(false); setPrefillCandidate(null) }}>No, thanks</Button>
            <Button onClick={() => { if (prefillCandidate) setFormValues(prev => ({ ...prefillCandidate, ...prev })); setPrefillOpen(false) }}>Yes, pre-fill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-balance">IP Application Form Builder</CardTitle>
          <CardDescription className="text-pretty">
            Select an application type and fill out the relevant fields for your intellectual property application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="application-type">Application Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="application-type">
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

          {selectedType && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Form Fields for {applicationTypes.find((t) => t.key === selectedType)?.label}
                </h3>
                <div className="space-y-4">
                  {relevantFields.map((field, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`field-${index}`} className="text-sm font-medium">
                        {field.field_title}
                      </Label>
                      {field.field_title.toLowerCase().includes("description") ||
                      field.field_title.toLowerCase().includes("comment") ||
                      field.field_title.toLowerCase().includes("instruction") ||
                      field.field_title.toLowerCase().includes("statement") ||
                      field.field_title.toLowerCase().includes("summary") ||
                      field.field_title.toLowerCase().includes("problem") ||
                      field.field_title.toLowerCase().includes("solution") ||
                      field.field_title.toLowerCase().includes("features") ||
                      field.field_title.toLowerCase().includes("abstract") ||
                      field.field_title.toLowerCase().includes("claims") ||
                      field.field_title.toLowerCase().includes("specification") ? (
                        <Textarea
                          id={`field-${index}`}
                          placeholder={`Enter ${field.field_title.toLowerCase()}`}
                          value={formValues[field.field_title] || ""}
                          onChange={(e) => handleInputChange(field.field_title, e.target.value)}
                          className="min-h-[80px]"
                        />
                      ) : (
                        <Input
                          id={`field-${index}`}
                          type="text"
                          placeholder={`Enter ${field.field_title.toLowerCase()}`}
                          value={formValues[field.field_title] || ""}
                          onChange={(e) => handleInputChange(field.field_title, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button onClick={handleSave} className="flex-1">
                  Save Form
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </>
          )}

          {!selectedType && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-pretty">
                Please select an application type to view and edit the relevant form fields.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
