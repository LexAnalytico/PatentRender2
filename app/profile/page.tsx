"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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
  const [loading, setLoading] = useState(true)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [editProfile, setEditProfile] = useState<Profile>({} as Profile)
  const [saving, setSaving] = useState(false)
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({})
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
                <Tabs defaultValue="summary" className="w-full">
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

                  {/* Orders */}
                  <TabsContent value="orders">
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <Card key={o.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ClipboardList className="h-5 w-5 text-blue-700" />
                                <div>
                                  <div className="font-medium text-gray-900">{o.title}</div>
                                  <div className="text-xs text-gray-500">Order #{o.id} • {o.status}</div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setExpandedOrderIds((prev) => ({ ...prev, [o.id]: !prev[o.id] }))
                                }
                              >
                                {expandedOrderIds[o.id] ? "Hide" : "View"}
                              </Button>
                            </div>

                            {expandedOrderIds[o.id] && (
                              <div className="mt-4 border-t pt-4 space-y-4">
                                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                                  <div className="p-3 rounded-lg bg-gray-50 border">
                                    <div className="text-xs text-gray-500">Placed</div>
                                    <div className="font-medium text-gray-900">{o.placedAt}</div>
                                  </div>
                                  <div className="p-3 rounded-lg bg-gray-50 border">
                                    <div className="text-xs text-gray-500">Status</div>
                                    <div className="font-medium">{o.status}</div>
                                  </div>
                                  <div className="p-3 rounded-lg bg-gray-50 border">
                                    <div className="text-xs text-gray-500">Total</div>
                                    <div className="font-medium">{o.total}</div>
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="rounded-lg border p-4">
                                    <div className="text-sm font-semibold mb-2">Items</div>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                      {o.details.items.map((it, idx) => (
                                        <li key={idx}>{it}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="rounded-lg border p-4">
                                    <div className="text-sm font-semibold mb-2">Form Details</div>
                                    <div className="space-y-2 text-sm text-gray-700">
                                      {o.details.form.fields.map((f, idx) => (
                                        <div key={idx} className="flex justify-between gap-4">
                                          <span className="text-gray-500">{f.label}</span>
                                          <span className="font-medium text-gray-900">{f.value}</span>
                                        </div>
                                      ))}
                                      {o.details.form.attachments && (
                                        <div className="pt-2">
                                          <div className="text-xs text-gray-500 mb-1">Attachments</div>
                                          <div className="flex flex-wrap gap-2">
                                            {o.details.form.attachments.map((a, idx) => (
                                              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded border">{a}</span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                  <div className="text-sm font-semibold mb-3">Timeline</div>
                                  <div className="space-y-2">
                                    {o.details.timeline.map((t, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-700">
                                          <Calendar className="h-4 w-4 text-gray-500" />
                                          <span>{t.label}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{t.date}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
