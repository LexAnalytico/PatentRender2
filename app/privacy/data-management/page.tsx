"use client"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"
import { Shield, Trash2, Download, CheckCircle2, Clock, FileSearch, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DataManagementPage() {
  const lastUpdated = "January 15, 2024"

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Shield className="h-12 w-12 text-blue-300 mr-4" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">How We Handle Your Data</h1>
              <p className="text-blue-100 mt-2">What we collect, how we use it, and when we delete it</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm">
            Last Updated: {lastUpdated}
          </p>
          <div className="mt-4">
            <Link href="/privacy" className="inline-flex items-center text-blue-200 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* What we collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-gray-900">
              <FileSearch className="h-6 w-6 mr-3 text-blue-600" />
              Data We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-3">
            <p>We collect only the information necessary to provide our intellectual property services and operate our website effectively:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Account details such as name, email, phone, and company (if applicable)</li>
              <li>Service-related information for patents, trademarks, copyrights, and designs</li>
              <li>Usage, device, and analytics data to improve site performance and security</li>
              <li>Payment and billing details processed via trusted, PCI-compliant providers</li>
            </ul>
          </CardContent>
        </Card>

        {/* How we use it */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-gray-900">
              <Download className="h-6 w-6 mr-3 text-green-600" />
              How Your Data Is Used
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-3">
            <p>We use your data to deliver and improve our services, communicate with you, and comply with legal obligations:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Providing legal and IP services, managing cases, and processing payments</li>
              <li>Improving our products, website, and customer support</li>
              <li>Sending legal updates or newsletters with your consent (you can opt out)</li>
              <li>Ensuring security, preventing fraud, and maintaining regulatory compliance</li>
            </ul>
          </CardContent>
        </Card>

        {/* When and how we delete */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-gray-900">
              <Trash2 className="h-6 w-6 mr-3 text-red-600" />
              When We Delete Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-4">
            <p>We remove personal data when it is no longer required for the purposes it was collected, subject to legal and regulatory requirements.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center"><Clock className="h-4 w-4 mr-2 text-gray-600" /> Typical Retention Periods</h3>
                <ul className="text-sm space-y-1">
                  <li>Account data: until account deletion + 30 days</li>
                  <li>IP case files: up to 7 years after case closure</li>
                  <li>Payment records: 7 years for tax and accounting</li>
                  <li>Analytics data: up to 26 months</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Deletion Methods</h3>
                <ul className="text-sm space-y-1">
                  <li>Automated scheduled deletion workflows</li>
                  <li>Secure overwriting and disposal procedures</li>
                  <li>Audit trails and verification checks</li>
                  <li>Backups pruned within 90 days</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-600">Note: Some data may be retained longer where required by law, to resolve disputes, or enforce agreements.</p>
          </CardContent>
        </Card>

        {/* Your controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-gray-900">
              <Shield className="h-6 w-6 mr-3 text-indigo-600" />
              Your Controls and Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-3">
            <p>You can request access, correction, export, restriction, objection, or deletion of your personal information at any time.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Contact our Privacy Officer at privacy@legalippro.com</li>
              <li>Include your full name, email, and specific request</li>
              <li>We will verify your identity and respond within statutory timeframes</li>
            </ul>
            <div className="mt-4">
              <Link href="/privacy" className="text-blue-600 hover:underline">Read the full Privacy Policy</Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
