"use client"

import React, { useEffect, useState } from "react"
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const applicationTypes = [
  { key: "patentability_search", label: "Patentability Search" },
  { key: "provisional_filing", label: "Provisional Filing" },
  { key: "complete_provisional_filing", label: "Complete Provisional Filing" },
  { key: "pct_filing", label: "PCT Filing" },
  { key: "ps_cs", label: "PS CS" },
  { key: "trademark", label: "Trademark" },
  { key: "copyrights", label: "Copyrights" },
  { key: "design", label: "Design" },
]

export default function ProfileOverviewClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<string>("overview")
  const [selectedType, setSelectedType] = useState<string>("")
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [search, setSearch] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('date_desc')
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [highlightPaymentId, setHighlightPaymentId] = useState<string | null>(null)

  useEffect(() => {
    const urlTab = searchParams?.get("tab") || "overview"
    setTab(urlTab)
  const pid = searchParams?.get('payment_id') || null
  if (pid) setHighlightPaymentId(pid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (selectedType) {
      router.push(`/forms?type=${encodeURIComponent(selectedType)}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

  // load orders for the signed-in user
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoadingOrders(true)
        const userRes = await supabase.auth.getUser()
        const user = (userRes && (userRes as any).data) ? (userRes as any).data.user : null
        if (!user) return

        // select orders joined with services, categories and payments
        const { data, error } = await supabase
          .from('orders')
          .select('id, service_id, category_id, payment_id, created_at, services(name), categories(name), payments(id, razorpay_payment_id, total_amount)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (error) {
          console.error('Failed to load orders', error)
          return
        }
        if (!mounted) return
        setOrders((data as any) ?? [])
        // if we have a payment id in the query, try to auto-select the matching order(s)
        if (mounted && highlightPaymentId) {
          try {
            const matches = (data as any) ?? []
            const matched = matches.filter((r:any) => {
              const pay = (r.payments as any)
              if (!pay) return false
              return String(pay.razorpay_payment_id || pay.id || '').toLowerCase() === String(highlightPaymentId).toLowerCase()
            })
            if (matched.length > 0) {
              const sel: Record<string, boolean> = {}
              matched.forEach((m:any) => { sel[m.id] = true })
              setSelectedRows(sel)
              // scroll to first matched row
              setTimeout(() => {
                const el = document.querySelector(`[data-order-id="${matched[0].id}"]`)
                if (el && (el as HTMLElement).scrollIntoView) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
              }, 100)
            }
          } catch (e) {
            console.error('Auto-select error', e)
          }
        }
      } catch (e) {
        console.error('Exception loading orders', e)
      } finally {
        if (mounted) setLoadingOrders(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const applicationTypesMap: Record<string, string> = Object.fromEntries(applicationTypes.map(t => [t.key, t.label]))

  const filtered = orders.filter(o => {
    if (!search) return true
    const s = search.toLowerCase()
    const svc = (o.services as any)?.name ?? ''
    const cat = (o.categories as any)?.name ?? ''
    const amt = (o.payments as any)?.total_amount ?? ''
    return svc.toLowerCase().includes(s) || cat.toLowerCase().includes(s) || String(amt).includes(s)
  }).sort((a,b) => {
    if (sortBy === 'date_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sortBy === 'date_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sortBy === 'price_desc') return Number((b.payments as any)?.total_amount ?? 0) - Number((a.payments as any)?.total_amount ?? 0)
    if (sortBy === 'price_asc') return Number((a.payments as any)?.total_amount ?? 0) - Number((b.payments as any)?.total_amount ?? 0)
    return 0
  })

  const toggleRow = (id: string) => setSelectedRows(prev => ({ ...prev, [id]: !prev[id]}))

  const downloadSelected = () => {
    const selected = orders.filter(o => selectedRows[o.id])
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex gap-4">
        <Button variant={tab === "overview" ? undefined : "ghost"} onClick={() => router.push("/profile/overview?tab=overview")}>Overview</Button>
        <Button variant={tab === "orders" ? undefined : "ghost"} onClick={() => router.push("/profile/overview?tab=orders")}>Orders</Button>
      </div>

      {tab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your account summary and recent activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-3">
              <Input placeholder="Search by service, category or price" value={search} onChange={(e) => setSearch((e.target as HTMLInputElement).value)} />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Date (newest)</SelectItem>
                  <SelectItem value="date_asc">Date (oldest)</SelectItem>
                  <SelectItem value="price_desc">Price (high → low)</SelectItem>
                  <SelectItem value="price_asc">Price (low → high)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={downloadSelected} disabled={!Object.values(selectedRows).some(Boolean)}>Download Form</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left"><input type="checkbox" onChange={(e) => {
                      const checked = (e.target as HTMLInputElement).checked
                      const newSel: Record<string, boolean> = {}
                      filtered.forEach((o:any) => { newSel[o.id] = checked })
                      setSelectedRows(newSel)
                    }} /></th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Service</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders && <tr><td colSpan={6} className="p-4">Loading...</td></tr>}
                  {!loadingOrders && filtered.length === 0 && <tr><td colSpan={6} className="p-4">No orders found</td></tr>}
                  {!loadingOrders && filtered.map((o: any) => (
                    <tr key={o.id} className="border-t" data-order-id={o.id}>
                      <td className="p-2"><input type="checkbox" checked={!!selectedRows[o.id]} onChange={() => toggleRow(o.id)} /></td>
                      <td className="p-2">{(o.categories as any)?.name ?? 'N/A'}</td>
                      <td className="p-2">{(o.services as any)?.name ?? 'N/A'}</td>
                      <td className="p-2">{applicationTypesMap[(o as any).type] ?? 'N/A'}</td>
                      <td className="p-2">{(o.payments as any)?.total_amount ?? 'N/A'}</td>
                      <td className="p-2">{o.created_at ? new Date(o.created_at).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "orders" && (
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Select a form to open the form builder page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label className="mb-2 block text-sm font-medium">Open Form</Label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a form" />
                </SelectTrigger>
                <SelectContent>
                  {applicationTypes.map((t) => (
                    <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="mt-3 text-sm text-muted-foreground">Choosing an option will navigate to the Forms page for that application type.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
