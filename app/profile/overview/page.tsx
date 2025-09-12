"use client"

import React, { useEffect, useState } from "react"
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

export default function ProfileOverviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<string>("overview")
  const [selectedType, setSelectedType] = useState<string>("")

  useEffect(() => {
    const urlTab = searchParams?.get("tab") || "overview"
    setTab(urlTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (selectedType) {
      router.push(`/forms?type=${encodeURIComponent(selectedType)}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

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
            <p className="text-sm text-muted-foreground">Overview content goes here.</p>
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