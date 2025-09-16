"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Building2,
  Mail,
  Settings,
  ShieldCheck,
  User,
  ClipboardList,
  LogOut,
  Calendar,
} from "lucide-react"

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

export default function ProfilePage() {
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
  // Orders table state for the Orders tab
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [loadingUserOrders, setLoadingUserOrders] = useState(false)
  const [searchOrders, setSearchOrders] = useState<string>('')
  const [sortOrders, setSortOrders] = useState<string>('date_desc')
  const [selectedOrderRows, setSelectedOrderRows] = useState<Record<string, boolean>>({})
  const [currentTab, setCurrentTab] = useState<string>('summary')
  const [highlightPaymentId, setHighlightPaymentId] = useState<string | null>(null)

  // initialize tab from query param if present
  useEffect(() => {
    const t = searchParams?.get('tab') || 'summary'
    setCurrentTab(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // load user orders for Orders tab when the tab becomes active
  const loadUserOrders = async () => {
    setLoadingUserOrders(true)
    try {
      const userRes = await supabase.auth.getUser()
      const user = (userRes && (userRes as any).data) ? (userRes as any).data.user : null
  console.debug('loadUserOrders session userRes:', userRes)
  console.debug('loadUserOrders session user:', user)
      if (!user) return
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, service_id, category_id, payment_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Failed to load user orders', error)
        console.debug('loadUserOrders response', { data, error })
      }
      console.debug('loadUserOrders raw orders:', data)

      const ordersRaw = (data as any) ?? []

      // Batch fetch related rows (services, categories, payments) by their ids
      const serviceIds = Array.from(new Set(ordersRaw.map((o: any) => o.service_id).filter(Boolean)))
      const categoryIds = Array.from(new Set(ordersRaw.map((o: any) => o.category_id).filter(Boolean)))
      const paymentIds = Array.from(new Set(ordersRaw.map((o: any) => o.payment_id).filter(Boolean)))

      const [servicesRes, categoriesRes, paymentsRes] = await Promise.all([
        serviceIds.length ? supabase.from('services').select('id, name').in('id', serviceIds) : Promise.resolve({ data: [], error: null }),
        categoryIds.length ? supabase.from('categories').select('id, name').in('id', categoryIds) : Promise.resolve({ data: [], error: null }),
        paymentIds.length ? supabase.from('payments').select('id, razorpay_payment_id, total_amount, payment_status, payment_date, service_id').in('id', paymentIds) : Promise.resolve({ data: [], error: null }),
      ])

      if (servicesRes?.error) console.error('Failed to load services for orders', servicesRes.error)
      if (categoriesRes?.error) console.error('Failed to load categories for orders', categoriesRes.error)
      if (paymentsRes?.error) console.error('Failed to load payments for orders', paymentsRes.error)

      const servicesMap = new Map((servicesRes?.data ?? []).map((s: any) => [s.id, s]))
      const categoriesMap = new Map((categoriesRes?.data ?? []).map((c: any) => [c.id, c]))
      const paymentsMap = new Map((paymentsRes?.data ?? []).map((p: any) => [p.id, p]))

      const merged = ordersRaw.map((o: any) => ({
        ...o,
        services: servicesMap.get(o.service_id) ?? null,
        categories: categoriesMap.get(o.category_id) ?? null,
        payments: paymentsMap.get(o.payment_id) ?? null,
      }))

      console.debug('loadUserOrders merged:', merged)
      setUserOrders(merged)
      // auto-select/scroll when redirected after payment
      if (highlightPaymentId && merged && Array.isArray(merged) && merged.length > 0) {
        try {
          const matched = (merged as any[]).filter((r) => {
            const pay = (r.payments as any)
            if (!pay) return false
            return String(pay.razorpay_payment_id || pay.id || '').toLowerCase() === String(highlightPaymentId).toLowerCase()
          })
          if (matched.length > 0) {
            const sel: Record<string, boolean> = {}
            matched.forEach((m:any) => { sel[m.id] = true })
            setSelectedOrderRows(sel)
            setTimeout(() => {
              const el = document.querySelector(`[data-order-id="${matched[0].id}"]`)
              if (el && (el as HTMLElement).scrollIntoView) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 150)
          }
        } catch (e) {
          console.error('Auto-select orders error', e)
        }
      }
    } catch (e) {
      console.error('Exception loading user orders', e)
    } finally {
      setLoadingUserOrders(false)
    }
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
    if (pid) setHighlightPaymentId(pid)
  }, [searchParams])
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

        {/* State: Authenticated Dashboard */}
        {!loading && sessionEmail && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Profile Card */}
            <Card className="lg:col-span-1 bg-white border shadow-sm">
              <CardHeader className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <User className="h-10 w-10 text-blue-700" />
                </div>
                <CardTitle className="text-xl">{displayName}</CardTitle>
                <CardDescription className="text-sm">Member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{profile?.email || sessionEmail}</span>
                </div>
                {/* Debug panel: visible during development to show session and orders data */}
                <div className="mt-3 p-3 rounded-md border bg-yellow-50">
                  <div className="text-xs text-gray-600">Debug (dev):</div>
                  <div className="text-sm text-gray-800">Session user id: <span className="font-mono">{userId ?? 'null'}</span></div>
                  <div className="text-sm text-gray-800">Orders loaded (client): <span className="font-mono">{userOrders.length}</span></div>
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">Preview orders JSON</summary>
                    <pre className="max-h-40 overflow-auto text-xs p-2 bg-white rounded mt-2">{JSON.stringify(userOrders.slice(0,10), null, 2)}</pre>
                  </details>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{profile?.company || "Company not set"}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Security
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right column: Tabs and content */}
            <Card className="lg:col-span-2 bg-white border shadow-sm">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Manage your account information and review recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v)} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  {/* Summary */}
                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="border bg-gradient-to-br from-blue-50 to-white">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Account</CardTitle>
                          <CardDescription>Basic account information</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-700 space-y-1">
                          <div>
                            <span className="font-medium text-gray-900">Name: </span>
                            {displayName}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Email: </span>
                            {profile?.email || sessionEmail}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Company: </span>
                            {profile?.company || "—"}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Plan</CardTitle>
                          <CardDescription>Billing and subscription</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">Free</div>
                              <div className="text-xs text-gray-500">Upgrade for more features</div>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Upgrade</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Quick Stats</CardTitle>
                        <CardDescription>Recent engagement</CardDescription>
                        <div className="ml-auto">
                          <a href="/profile/overview?tab=overview" className="inline-block text-sm text-blue-600 hover:underline">Open Profile Overview</a>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 rounded-lg bg-gray-50 border">
                            <div className="text-2xl font-bold text-blue-700">3</div>
                            <div className="text-xs text-gray-500">Open Quotes</div>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 border">
                            <div className="text-2xl font-bold text-blue-700">1</div>
                            <div className="text-xs text-gray-500">Active Orders</div>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 border">
                            <div className="text-2xl font-bold text-blue-700">5</div>
                            <div className="text-xs text-gray-500">Saved Services</div>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 border">
                            <div className="text-2xl font-bold text-blue-700">2025</div>
                            <div className="text-xs text-gray-500">Member Since</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Profile */}
                  <TabsContent value="profile">
                    <Card className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Manage Profile</CardTitle>
                        <CardDescription>Update your contact and company information</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">First Name</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.first_name ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, first_name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.last_name ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, last_name: e.target.value }))}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-gray-700">Company</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.company ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, company: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Phone</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.phone ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, phone: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Address</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.address ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, address: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">City</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.city ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, city: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">State</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.state ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, state: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Country</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.country ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, country: e.target.value }))}
                            />
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            <Button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                              {saving ? "Saving..." : "Save Profile"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Orders - Table view */}
                  <TabsContent value="orders">
                    <Card className="border">
                      <CardHeader>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>Your payments and orders</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex items-center gap-3">
                          <Input placeholder="Search by category, service or amount" value={searchOrders} onChange={(e) => setSearchOrders((e.target as HTMLInputElement).value)} />
                          <Select value={sortOrders} onValueChange={(v) => setSortOrders(v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date_desc">Date (newest)</SelectItem>
                              <SelectItem value="date_asc">Date (oldest)</SelectItem>
                              <SelectItem value="amount_desc">Amount (high → low)</SelectItem>
                              <SelectItem value="amount_asc">Amount (low → high)</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={() => {
                            const selected = userOrders.filter(o => selectedOrderRows[o.id])
                            const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `orders-${Date.now()}.json`
                            a.click()
                            URL.revokeObjectURL(url)
                          }} disabled={!Object.values(selectedOrderRows).some(Boolean)}>Download Form</Button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full table-auto border-collapse">
                            <thead>
                              <tr>
                                <th className="p-2 text-left"><input type="checkbox" onChange={(e) => {
                                  const checked = (e.target as HTMLInputElement).checked
                                  const newSel: Record<string, boolean> = {}
                                  filteredOrders(userOrders, searchOrders, sortOrders).forEach((r:any) => { newSel[r.id] = checked })
                                  setSelectedOrderRows(newSel)
                                }} /></th>
                                <th className="p-2 text-left">Category</th>
                                <th className="p-2 text-left">Service</th>
                                <th className="p-2 text-left">Type</th>
                                <th className="p-2 text-left">Amount</th>
                                <th className="p-2 text-left">Razorpay ID</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loadingUserOrders && <tr><td colSpan={6} className="p-4">Loading...</td></tr>}
                              {!loadingUserOrders && filteredOrders(userOrders, searchOrders, sortOrders).length === 0 && <tr><td colSpan={6} className="p-4">No orders found</td></tr>}
                              {!loadingUserOrders && filteredOrders(userOrders, searchOrders, sortOrders).map((r:any) => (
                                <tr key={r.id} className="border-t" data-order-id={r.id}>
                                  <td className="p-2"><input type="checkbox" checked={!!selectedOrderRows[r.id]} onChange={() => setSelectedOrderRows(prev => ({ ...prev, [r.id]: !prev[r.id]}))} /></td>
                                  <td className="p-2">{(r.categories as any)?.name ?? 'N/A'}</td>
                                  <td className="p-2">{(r.services as any)?.name ?? 'N/A'}</td>
                                  <td className="p-2">{/* Type intentionally blank */}</td>
                                  <td className="p-2">{(r.payments as any)?.total_amount ?? 'N/A'}</td>
                                  <td className="p-2">{(r.payments as any)?.razorpay_payment_id ?? (r.payments as any)?.id ?? 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Activity */}
                  <TabsContent value="activity">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-md border bg-gray-50">
                        <Calendar className="h-4 w-4 mt-0.5 text-gray-600" />
                        <div>
                          <div className="text-sm"><span className="font-medium text-gray-900">You</span> added a new service to cart</div>
                          <div className="text-xs text-gray-500">2 days ago</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-md border bg-gray-50">
                        <Calendar className="h-4 w-4 mt-0.5 text-gray-600" />
                        <div>
                          <div className="text-sm"><span className="font-medium text-gray-900">Order</span> PSA-98761 marked as completed</div>
                          <div className="text-xs text-gray-500">Last week</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
