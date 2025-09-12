"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/hooks/use-toast"
import formData from "../data/forms-fields.json"

type FormField = {
  field_title: string
  patentability_search: string
  provisional_filing: string
  complete_provisional_filing: string
  pct_filing: string
  ps_cs: string
  trademark: string
  copyrights: string
  design: string
}

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

export default function IPFormBuilder() {
  const [selectedType, setSelectedType] = useState<string>("")
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const toastHook = useToast?.()
  const toast = toastHook ?? { toast: (opts: any) => { if (opts?.title) alert(`${opts.title}\n${opts?.description || ""}`) } }
  const searchParams = useSearchParams()

  // Initialize selectedType from query param if present and valid
  useEffect(() => {
    const type = searchParams?.get("type") || ""
    if (type && applicationTypes.some((t) => t.key === type)) {
      setSelectedType(type)
    }
    // Only on first render or when URL query changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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

    toast.toast?.({
      title: "Form Saved Successfully",
      description: `Saved ${filledFields.length} of ${relevantFields.length} fields for ${applicationTypes.find((t) => t.key === selectedType)?.label}.`,
    })

    // Persist locally for quick testing
    try { localStorage.setItem(`form_${selectedType}`, JSON.stringify(formValues)) } catch (_){ }
  }

  const handleCancel = () => {
    setFormValues({})
    toast.toast?.({
      title: "Form Cleared",
      description: "All form data has been cleared.",
    })
  }

  // hydrate from localStorage when selectedType changes
  useEffect(() => {
    if (!selectedType) return
    try {
      const raw = localStorage.getItem(`form_${selectedType}`)
      if (raw) setFormValues(JSON.parse(raw))
      else setFormValues({})
    } catch { setFormValues({}) }
  }, [selectedType])

  const relevantFields = selectedType ? getRelevantFields(selectedType) : []

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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