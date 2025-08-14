"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  email?: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

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

      if (email) {
        const { data: prof, error: profErr } = await supabase
          .from("patentprofiles")
          .select("first_name, last_name, company, email")
          .eq("email", email)
          .maybeSingle()

        if (profErr) {
          console.error("Failed to fetch profile:", profErr.message)
        } else if (prof) {
          setProfile(prof)
        } else {
          // If no row exists, at least show email
          setProfile({ email })
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

                  {/* Orders */}
                  <TabsContent value="orders">
                    <div className="space-y-3">
                      <Card className="border">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ClipboardList className="h-5 w-5 text-blue-700" />
                            <div>
                              <div className="font-medium text-gray-900">Trademark Registration</div>
                              <div className="text-xs text-gray-500">Order #TRX-10342 • In Review</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">View</Button>
                        </CardContent>
                      </Card>
                      <Card className="border">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ClipboardList className="h-5 w-5 text-blue-700" />
                            <div>
                              <div className="font-medium text-gray-900">Patent Search & Analysis</div>
                              <div className="text-xs text-gray-500">Order #PSA-98761 • Completed</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">View</Button>
                        </CardContent>
                      </Card>
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
