"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PatentFormAlt() {
  const [formData, setFormData] = useState({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const handleCancel = () => {
    console.log("Form cancelled")
    setFormData({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-t-xl shadow-sm border border-border p-8 text-center">
          <h1 className="font-heading text-4xl font-bold text-foreground tracking-tight">Patent Application Form</h1>
          <p className="mt-2 text-muted-foreground">Complete all required fields to submit your patent application</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-xl shadow-lg border-x border-b border-border">
          <div className="p-8 space-y-10">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="font-heading text-2xl font-bold text-foreground">Basic Information</h2>
              </div>
              <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clientRef" className="text-sm font-semibold text-foreground">
                    Client Reference Number
                  </Label>
                  <Input
                    id="clientRef"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter reference number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patentTitle" className="text-sm font-semibold text-foreground">
                    Patent Title
                  </Label>
                  <Input
                    id="patentTitle"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter patent title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicalField" className="text-sm font-semibold text-foreground">
                  Technical Field
                </Label>
                <Textarea
                  id="technicalField"
                  rows={3}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="Describe the technical field"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background" className="text-sm font-semibold text-foreground">
                  Background of the Invention
                </Label>
                <Textarea
                  id="background"
                  rows={4}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="Provide background information"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary" className="text-sm font-semibold text-foreground">
                  Summary of the Invention
                </Label>
                <Textarea
                  id="summary"
                  rows={4}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="Summarize the invention"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="detailedDescription" className="text-sm font-semibold text-foreground">
                  Detailed Description
                </Label>
                <Textarea
                  id="detailedDescription"
                  rows={6}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="Provide detailed description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claims" className="text-sm font-semibold text-foreground">
                  Claims
                </Label>
                <Textarea
                  id="claims"
                  rows={5}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="List all claims"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract" className="text-sm font-semibold text-foreground">
                  Abstract
                </Label>
                <Textarea
                  id="abstract"
                  rows={3}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="Write abstract"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drawings" className="text-sm font-semibold text-foreground">
                  Drawings/Figures
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="drawings"
                    type="file"
                    multiple
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-white transition-all whitespace-nowrap bg-transparent"
                  >
                    Upload Files
                  </Button>
                </div>
              </div>
            </div>

            {/* Applicant Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="font-heading text-2xl font-bold text-foreground">Applicant Information</h2>
              </div>
              <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="applicantName" className="text-sm font-semibold text-foreground">
                    Applicant Name
                  </Label>
                  <Input
                    id="applicantName"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter applicant name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicantType" className="text-sm font-semibold text-foreground">
                    Applicant Type
                  </Label>
                  <Select>
                    <SelectTrigger className="border-border focus:border-accent focus:ring-accent/20 transition-all">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicantAddress" className="text-sm font-semibold text-foreground">
                  Applicant Address
                </Label>
                <Textarea
                  id="applicantAddress"
                  rows={3}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="Enter complete address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="applicantCountry" className="text-sm font-semibold text-foreground">
                    Country
                  </Label>
                  <Input
                    id="applicantCountry"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicantNationality" className="text-sm font-semibold text-foreground">
                    Nationality
                  </Label>
                  <Input
                    id="applicantNationality"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter nationality"
                  />
                </div>
              </div>
            </div>

            {/* Inventor Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="font-heading text-2xl font-bold text-foreground">Inventor Information</h2>
              </div>
              <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="inventorName" className="text-sm font-semibold text-foreground">
                    Inventor Name
                  </Label>
                  <Input
                    id="inventorName"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter inventor name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventorNationality" className="text-sm font-semibold text-foreground">
                    Inventor Nationality
                  </Label>
                  <Input
                    id="inventorNationality"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter nationality"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventorAddress" className="text-sm font-semibold text-foreground">
                  Inventor Address
                </Label>
                <Textarea
                  id="inventorAddress"
                  rows={3}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="Enter complete address"
                />
              </div>
            </div>

            {/* Filing Details Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="font-heading text-2xl font-bold text-foreground">Filing Details</h2>
              </div>
              <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priorityNumber" className="text-sm font-semibold text-foreground">
                    Priority Application Number
                  </Label>
                  <Input
                    id="priorityNumber"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter priority number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorityDate" className="text-sm font-semibold text-foreground">
                    Priority Date
                  </Label>
                  <Input
                    id="priorityDate"
                    type="date"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priorityCountry" className="text-sm font-semibold text-foreground">
                    Priority Country
                  </Label>
                  <Input
                    id="priorityCountry"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filingType" className="text-sm font-semibold text-foreground">
                    Filing Type
                  </Label>
                  <Select>
                    <SelectTrigger className="border-border focus:border-accent focus:ring-accent/20 transition-all">
                      <SelectValue placeholder="Select filing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provisional">Provisional</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="pct">PCT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priorityDocument" className="text-sm font-semibold text-foreground">
                  Priority Document
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="priorityDocument"
                    type="file"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-white transition-all whitespace-nowrap bg-transparent"
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Response Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h2 className="font-heading text-2xl font-bold text-foreground">Response Information</h2>
              </div>
              <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="applicationNumber" className="text-sm font-semibold text-foreground">
                    Application Number
                  </Label>
                  <Input
                    id="applicationNumber"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                    placeholder="Enter application number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filingDate" className="text-sm font-semibold text-foreground">
                    Filing Date
                  </Label>
                  <Input
                    id="filingDate"
                    type="date"
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="officialAction" className="text-sm font-semibold text-foreground">
                  Official Action/FER Details
                </Label>
                <Textarea
                  id="officialAction"
                  rows={4}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="Enter official action details"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responseStrategy" className="text-sm font-semibold text-foreground">
                  Response Strategy
                </Label>
                <Textarea
                  id="responseStrategy"
                  rows={4}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="Describe response strategy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amendments" className="text-sm font-semibold text-foreground">
                  Proposed Amendments
                </Label>
                <Textarea
                  id="amendments"
                  rows={4}
                  className="border-border focus:border-accent focus:ring-accent/20 transition-all resize-none"
                  placeholder="List proposed amendments"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportingDocuments" className="text-sm font-semibold text-foreground">
                  Supporting Documents
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="supportingDocuments"
                    type="file"
                    multiple
                    className="border-border focus:border-accent focus:ring-accent/20 transition-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-white transition-all whitespace-nowrap bg-transparent"
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-border p-6 rounded-b-xl shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 border-2 border-border hover:bg-muted transition-all font-semibold bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}


