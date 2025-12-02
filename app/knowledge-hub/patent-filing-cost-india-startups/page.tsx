import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, DollarSign, TrendingDown, Calculator, CheckCircle, AlertCircle, Clock, Shield, Percent } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  title: "Patent Filing Cost in India for Startups 2025 - Complete Fee Breakdown",
  description: "Detailed breakdown of patent filing costs in India for startups in 2025. Government fees, professional charges, SIPP scheme benefits, and cost-saving strategies. Updated with latest IPO fee structure.",
  keywords: [
    "patent filing cost india",
    "patent cost for startups",
    "patent filing fees india 2025",
    "patent attorney fees india",
    "patent registration cost",
    "patent filing charges",
    "startup patent cost",
    "indian patent office fees",
    "patent filing budget",
    "affordable patent filing india",
    "patent cost calculator india",
    "patent filing cost bangalore",
  ],
  alternates: {
    canonical: `${siteUrl}/knowledge-hub/patent-filing-cost-india-startups`,
  },
  openGraph: {
    type: "article",
    url: `${siteUrl}/knowledge-hub/patent-filing-cost-india-startups`,
    title: "Patent Filing Cost in India for Startups 2025",
    description: "Complete cost breakdown for patent filing in India. Government fees, professional charges, and savings for startups.",
    siteName: "IP Protection India",
  },
};

export default function PatentCostGuidePage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Patent Filing Cost in India for Startups 2025 - Complete Fee Breakdown",
            "description": "Detailed breakdown of patent filing costs in India for startups including government fees and professional charges",
            "author": {
              "@type": "Organization",
              "name": "IP Protection India"
            },
            "publisher": {
              "@type": "Organization",
              "name": "IP Protection India",
              "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo.svg`
              }
            },
            "datePublished": "2025-01-15",
            "dateModified": "2025-01-15"
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/knowledge-hub" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Hub
            </Link>
          </div>
        </header>

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Cost Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Patent Filing Cost in India for Startups 2025
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Complete breakdown of government fees, professional charges, and cost-saving strategies for Indian startups. Updated with 2025 IPO fee structure.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                10 min read
              </span>
              <span>Last updated: January 2025</span>
            </div>
          </div>
        </section>

        <article className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            
            {/* Quick Summary */}
            <Card className="mb-8 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-green-600" />
                  Quick Cost Summary for Startups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">₹35,000 - ₹80,000</div>
                    <div className="text-sm text-gray-600">Simple Invention (Basic complexity)</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">₹80,000 - ₹1,50,000</div>
                    <div className="text-sm text-gray-600">Moderate Invention (Average complexity)</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">₹1,50,000 - ₹3,00,000</div>
                    <div className="text-sm text-gray-600">Complex Invention (High-tech)</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  *Includes government fees + professional services for DPIIT-recognized startups
                </p>
              </CardContent>
            </Card>

            {/* Government Fees Table */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                Official Government Fees (2025)
              </h2>
              
              <p className="text-gray-700 mb-6">
                The Indian Patent Office categorizes applicants into three types with different fee structures. Startups recognized by DPIIT enjoy 80% fee reduction.
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Fee Type</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Natural Person/Startup</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Small Entity</th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Large Entity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Filing (Provisional)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹1,600</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹4,000</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹8,000</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">Filing (Complete)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹1,600</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹4,000</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹8,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Request for Examination (RFE)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹4,000</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹10,000</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹20,000</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">Early Publication (Form 9)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹2,500</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹6,250</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹12,500</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Expedited Examination (Form 18A)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹8,000</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹20,000</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹60,000</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">Patent Grant Fees</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹2,400</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹6,000</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹12,000</td>
                    </tr>
                    <tr className="font-semibold bg-blue-50">
                      <td className="border border-gray-300 px-4 py-2">Total (Complete + RFE + Grant)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-green-600">₹8,000</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹20,000</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹40,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-yellow-900">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    <strong>Startup Benefit:</strong> DPIIT-recognized startups save ₹32,000 in government fees (80% discount) compared to large entities!
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Professional Service Costs */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Professional Service Costs
              </h2>
              
              <p className="text-gray-700 mb-6">
                Patent attorney fees constitute the major cost component. Professional services include patentability search, drafting, filing, and prosecution (responding to examination reports).
              </p>

              <div className="space-y-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patentability Search</CardTitle>
                    <CardDescription>Prior art search to assess novelty</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Cost Range:</span>
                      <span className="text-xl font-bold text-blue-600">₹5,000 - ₹25,000</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Depends on technical complexity and depth of search required
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patent Drafting & Filing</CardTitle>
                    <CardDescription>Complete specification preparation and application filing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Simple Invention:</span>
                        <span className="font-semibold text-blue-600">₹25,000 - ₹50,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">Moderate Complexity:</span>
                        <span className="font-semibold text-blue-600">₹50,000 - ₹1,00,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">High Complexity (Biotech/Pharma):</span>
                        <span className="font-semibold text-blue-600">₹1,00,000 - ₹2,50,000</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Complexity determined by number of claims, drawings, technical domain, and innovation level
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Examination Response (FER)</CardTitle>
                    <CardDescription>Responding to First Examination Report objections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Cost Range:</span>
                      <span className="text-xl font-bold text-blue-600">₹15,000 - ₹60,000</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Depends on number of objections, amendments required, and arguments complexity
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hearing Representation</CardTitle>
                    <CardDescription>Attorney representation at IPO hearing (if required)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Cost Range:</span>
                      <span className="text-xl font-bold text-blue-600">₹10,000 - ₹40,000</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Per hearing session, includes preparation and representation
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>Total Professional Service Cost (Typical Startup):</strong>
                  </p>
                  <p className="text-sm text-blue-900">
                    Search (₹10,000) + Drafting (₹50,000) + Filing Support (₹5,000) + FER Response (₹25,000) = <strong>₹90,000</strong>
                  </p>
                  <p className="text-xs text-blue-800 mt-2">
                    Add government fees of ₹8,000 for total cost of approximately ₹98,000 for a typical startup patent
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Startup Benefits */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-green-600" />
                Cost-Saving Benefits for DPIIT Startups
              </h2>

              <p className="text-gray-700 mb-6">
                Startups recognized by DPIIT (Department for Promotion of Industry and Internal Trade) under the Startup India initiative can significantly reduce patent costs through the SIPP (Startups Intellectual Property Protection) scheme.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="border-l-4 border-l-green-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-green-600" />
                      80% Fee Rebate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Government filing, examination, and grant fees reduced by 80%
                    </p>
                    <div className="text-sm text-gray-600">
                      <div>Regular: ₹40,000</div>
                      <div className="font-bold text-green-600">Startup: ₹8,000</div>
                      <div className="text-xs mt-1">Savings: ₹32,000</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Subsidized Professional Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Access to panel of facilitators and patent attorneys at subsidized rates
                    </p>
                    <div className="text-sm text-gray-600">
                      Government reimbursement up to ₹10,000 per patent for professional fees
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Expedited Examination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Fast-track examination within 6-12 months vs 2-3 years regular timeline
                    </p>
                    <div className="text-sm text-gray-600">
                      Reduces opportunity cost and enables faster commercialization
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      Free Consultation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Free initial consultation and guidance from government-empaneled facilitators
                    </p>
                    <div className="text-sm text-gray-600">
                      Help with DPIIT registration and patent filing process
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-2">How to Avail SIPP Benefits?</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-sm">
                    <li>Register on Startup India portal (startupindia.gov.in)</li>
                    <li>Get DPIIT recognition certificate (usually within 2-3 weeks)</li>
                    <li>Apply for patent with startup category declaration</li>
                    <li>Submit DPIIT certificate with patent application</li>
                    <li>Automatically receive 80% fee reduction</li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Additional Costs */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Additional Costs to Consider
              </h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Annual Renewal Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Patent maintenance requires annual renewal fees starting from the 3rd year:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Years 3-6: ₹800/year (Startup)</li>
                      <li>• Years 7-10: ₹2,400/year (Startup)</li>
                      <li>• Years 11-15: ₹4,800/year (Startup)</li>
                      <li>• Years 16-20: ₹8,000/year (Startup)</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-3">
                      <strong>Total renewal cost over 20 years:</strong> Approximately ₹60,000 for startups
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">International Patent Filing (PCT)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">
                      If you plan to protect your invention in multiple countries:
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>PCT Filing (International application):</span>
                        <span className="font-semibold">₹1,50,000 - ₹3,00,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>National Phase Entry (per country):</span>
                        <span className="font-semibold">₹1,00,000 - ₹2,50,000</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      PCT allows you to defer national filings while maintaining priority date
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Translation Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      If filing in non-English speaking countries, translation costs: ₹20,000 - ₹80,000 per language depending on specification length
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Enforcement & Litigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm mb-2">
                      If you need to enforce your patent against infringers:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Cease & desist notice: ₹15,000 - ₹50,000</li>
                      <li>• Patent infringement litigation: ₹5,00,000 - ₹50,00,000+</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Cost Comparison Example */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Real-World Cost Example: Tech Startup
              </h2>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle>Case Study: Mobile App Invention</CardTitle>
                  <CardDescription>E-commerce recommendation engine with AI/ML components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-2 border-b">
                      <span className="font-medium">Service</span>
                      <span className="font-medium">Cost</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Patentability Search</span>
                      <span>₹12,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Patent Drafting (Moderate complexity)</span>
                      <span>₹60,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filing & Formalities</span>
                      <span>₹5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Government Fees (Filing + RFE + Grant)</span>
                      <span>₹8,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Early Publication</span>
                      <span>₹2,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expedited Examination (Startup)</span>
                      <span>₹8,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FER Response (1 objection cycle)</span>
                      <span>₹30,000</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-base text-green-600">
                      <span>Total Cost to Grant</span>
                      <span>₹1,25,500</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">
                    Same patent for large entity would cost ₹1,85,500 (₹60,000 more in government fees)
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Cost-Saving Tips */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                10 Cost-Saving Strategies for Startups
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Get DPIIT Recognition", desc: "Save 80% on government fees - most important step!" },
                  { title: "File Provisional First", desc: "Lower initial cost, buy 12 months time to refine invention" },
                  { title: "Choose Right Complexity", desc: "Don't over-complicate claims unnecessarily" },
                  { title: "Thorough Prior Art Search", desc: "Avoid filing unpatentable inventions, saves later costs" },
                  { title: "Bundle Multiple Inventions", desc: "File related inventions together to share costs" },
                  { title: "Use In-House Technical Writing", desc: "Provide detailed technical description to reduce attorney drafting time" },
                  { title: "Respond Promptly to FER", desc: "Avoid late fees and additional office actions" },
                  { title: "Opt for Expedited Exam", desc: "Faster resolution reduces opportunity cost" },
                  { title: "DIY Renewals", desc: "File renewal fees yourself online, save agent charges" },
                  { title: "Compare Attorney Quotes", desc: "Get 3-4 quotes, but prioritize experience over lowest price" }
                ].map((tip, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                          <p className="text-sm text-gray-600">{tip.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Is patent filing expensive for startups?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Not necessarily. With DPIIT recognition, startups can file patents for as low as ₹35,000-₹80,000 total cost. The 80% government fee rebate and subsidized professional services make it affordable. ROI from patent protection far outweighs the investment.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Should I hire a patent attorney or file myself?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Always hire a qualified patent attorney. DIY patents often get rejected or provide weak protection due to poor claim drafting. Professional fees are a worthy investment - a strong patent can be worth millions, while a weak patent is worthless.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I get funding to cover patent costs?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Yes! SIPP scheme provides up to ₹10,000 reimbursement per patent for professional fees. Additionally, some state governments and incubators offer IP grants. Startup accelerators often cover patent costs for portfolio companies.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What happens if I can't pay renewal fees?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Patent lapses and enters public domain. You have 6-month grace period with late fees. If still unpaid, patent is permanently abandoned and anyone can use your invention. Plan renewal costs in advance.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How much does international patent filing cost?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      PCT filing: ₹1.5-3 lakhs. National phase entry per country: ₹1-2.5 lakhs. For 5 countries, expect ₹8-15 lakhs total. Start with Indian patent, file PCT within 12 months if you have international market potential.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
              <CardContent className="pt-8 pb-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Get Accurate Cost Estimate for Your Patent</h2>
                <p className="text-lg mb-6 opacity-90">
                  Contact our patent attorneys in Bellandur, Bangalore for a free consultation and customized cost estimate based on your invention.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/contact">Get Free Consultation</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-green-600" asChild>
                    <Link href="/services/patent-filing">View Patent Services</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">How to File a Patent in India 2025</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete step-by-step guide to patent filing process in India.
                    </p>
                    <Link href="/knowledge-hub/how-to-file-patent-india-2025" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Trademark Registration Process in Bangalore</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete guide to trademark registration from search to certificate.
                    </p>
                    <Link href="/knowledge-hub/trademark-registration-bangalore" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Patent vs Trademark Differences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Understand which IP protection is right for your business.
                    </p>
                    <Link href="/knowledge-hub/patent-vs-trademark-differences" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>

          </div>
        </article>
      </div>
    </>
  );
}
