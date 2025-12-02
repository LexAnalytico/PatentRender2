import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Rocket, IndianRupee, Clock, Shield, AlertCircle, CheckCircle, TrendingUp, FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  title: "Startup Patent Filing Guide India 2025 | SIPP, Costs, Strategy & Timeline",
  description: "Complete patent filing guide for Indian startups. Learn SIPP benefits, cost-saving strategies, provisional patent filing, investor requirements, and expert tips from patent attorneys in Bangalore.",
  keywords: [
    "startup patent filing guide",
    "startup patent india",
    "patent for startups india",
    "SIPP scheme startups",
    "provisional patent startup",
    "startup patent cost",
    "patent filing for founders",
    "patent attorney bangalore",
    "startup IP protection",
    "investor patent requirements",
  ],
  alternates: {
    canonical: `${siteUrl}/knowledge-hub/startup-patent-filing-guide-india`,
  },
  openGraph: {
    type: "article",
    url: `${siteUrl}/knowledge-hub/startup-patent-filing-guide-india`,
    title: "Startup Patent Filing Guide India 2025 | Complete Strategy",
    description: "Essential patent filing guide for Indian startups covering SIPP, costs, timelines, and investor requirements.",
    siteName: "IP Protection India",
  },
};

export default function StartupPatentGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Startup Patent Filing Guide India 2025",
            "description": "Complete patent filing guide for Indian startups",
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

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/knowledge-hub" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Hub
            </Link>
          </div>
        </header>

        <article className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Startup Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Complete Patent Filing Guide for Indian Startups 2025
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Strategic patent filing guide for Indian startups and founders. Learn SIPP benefits, cost optimization, provisional patents, investor requirements, and expert advice from patent attorneys in Bangalore.
            </p>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6 mb-12">
              <h2 className="text-2xl font-bold mb-3">Why Startups Need Patents</h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Shield className="h-6 w-6 mb-2" />
                  <strong className="block mb-1">Competitive Advantage</strong>
                  <p className="opacity-90">Protect innovation from competitors</p>
                </div>
                <div>
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <strong className="block mb-1">Investor Confidence</strong>
                  <p className="opacity-90">Increase valuation & funding prospects</p>
                </div>
                <div>
                  <Rocket className="h-6 w-6 mb-2" />
                  <strong className="block mb-1">Market Leadership</strong>
                  <p className="opacity-90">Establish tech leadership & credibility</p>
                </div>
              </div>
            </div>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Startup-Specific Patent Strategy
              </h2>

              <Card className="mb-6 border-l-4 border-l-purple-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-6 w-6 text-purple-600" />
                    Phase-Based Patent Approach for Startups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <strong className="text-gray-900">Phase 1: Pre-Seed / Bootstrapped (₹0 - ₹50L funding)</strong>
                      <ul className="text-sm text-gray-700 mt-2 space-y-1">
                        <li>• File <strong>Provisional Patent</strong> (₹1,600 govt fee only)</li>
                        <li>• Establishes priority date with minimal cost</li>
                        <li>• Buys 12 months to refine invention & raise funds</li>
                        <li>• No examination required yet</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <strong className="text-gray-900">Phase 2: Seed / Angel Round (₹50L - ₹3Cr)</strong>
                      <ul className="text-sm text-gray-700 mt-2 space-y-1">
                        <li>• Convert provisional to <strong>Complete Patent Application</strong></li>
                        <li>• Apply under <strong>SIPP scheme</strong> (80% fee reduction)</li>
                        <li>• Draft comprehensive claims covering all embodiments</li>
                        <li>• Consider PCT filing for international protection</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <strong className="text-gray-900">Phase 3: Series A+ (₹3Cr+)</strong>
                      <ul className="text-sm text-gray-700 mt-2 space-y-1">
                        <li>• File continuation applications for new features</li>
                        <li>• International patent portfolio (US, EU, China)</li>
                        <li>• Request <strong>expedited examination</strong> for faster grant</li>
                        <li>• Build patent portfolio (5-10 patents)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                SIPP Scheme: 80% Cost Reduction for Startups
              </h2>

              <Card className="bg-green-50 border-green-200 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <IndianRupee className="h-6 w-6" />
                    Startups India Patent Protection (SIPP) Scheme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    DPIIT-recognized startups get <strong className="text-green-700">80% rebate</strong> on patent filing fees and facilitator support.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Eligibility Criteria:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>✓ DPIIT-recognized startup</li>
                        <li>✓ Incorporated ≤ 10 years ago</li>
                        <li>✓ Annual turnover ≤ ₹100 Cr (any FY)</li>
                        <li>✓ Working on innovation/technology</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Benefits:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>✓ 80% rebate on patent fees</li>
                        <li>✓ Free patent facilitator services</li>
                        <li>✓ Fast-track examination</li>
                        <li>✓ Covers filing to grant stage</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white border border-green-300 rounded-lg p-4 mt-4">
                    <h4 className="font-bold text-gray-900 mb-3">Cost Comparison:</h4>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-2">Fee Type</th>
                          <th className="text-right p-2">Regular</th>
                          <th className="text-right p-2">SIPP (80% off)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-2">Filing Fee</td>
                          <td className="text-right p-2">₹8,000</td>
                          <td className="text-right p-2 text-green-700 font-bold">₹1,600</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Examination Fee</td>
                          <td className="text-right p-2">₹20,000</td>
                          <td className="text-right p-2 text-green-700 font-bold">₹4,000</td>
                        </tr>
                        <tr className="border-t bg-green-100">
                          <td className="p-2 font-bold">Total Govt Fees</td>
                          <td className="text-right p-2">₹28,000</td>
                          <td className="text-right p-2 text-green-700 font-bold">₹5,600</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How to Apply for SIPP Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 text-sm text-gray-700">
                    <li><strong>1.</strong> Register on Startup India portal (startupindia.gov.in)</li>
                    <li><strong>2.</strong> Get DPIIT recognition certificate</li>
                    <li><strong>3.</strong> While filing patent, select "Startup" applicant category</li>
                    <li><strong>4.</strong> Upload DPIIT certificate with application</li>
                    <li><strong>5.</strong> Get facilitator assigned (optional but recommended)</li>
                  </ol>
                  <p className="text-xs text-gray-600 mt-3">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    SIPP benefits apply automatically once DPIIT certificate is verified by patent office.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Provisional Patent: Perfect for Early-Stage Startups
              </h2>

              <Card className="border-l-4 border-l-blue-600 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-blue-600" />
                    What is a Provisional Patent?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    A provisional patent is a <strong>temporary 12-month filing</strong> that establishes your priority date without requiring a complete patent specification.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Advantages for Startups
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>✓ Extremely low cost (₹1,600 for startups)</li>
                        <li>✓ Establishes priority date immediately</li>
                        <li>✓ 12 months to refine invention</li>
                        <li>✓ Can use "Patent Pending" status</li>
                        <li>✓ Allows pivoting without losing priority</li>
                        <li>✓ Easier to draft (less formal)</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Important Limitations
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>✗ Valid only 12 months</li>
                        <li>✗ Not examined or published</li>
                        <li>✗ Must file complete within 12 months</li>
                        <li>✗ Cannot add new matter later</li>
                        <li>✗ Abandoned if not converted</li>
                        <li>✗ No patent grant possible</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">When to Use Provisional Patent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Still Developing Product:</strong>
                        <p className="text-gray-700">Core technology ready but features still evolving</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Pre-Funding:</strong>
                        <p className="text-gray-700">Need protection before pitching to investors</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Urgent Filing:</strong>
                        <p className="text-gray-700">Need to file quickly before public disclosure or conference</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Budget Constraints:</strong>
                        <p className="text-gray-700">Can't afford complete filing yet (₹40K-80K for drafting)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Complete Cost Breakdown for Startups
              </h2>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Patent Costs with SIPP Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3">Stage</th>
                        <th className="text-left p-3">Description</th>
                        <th className="text-right p-3">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Provisional Filing</td>
                        <td className="p-3 text-gray-700">Govt fee (SIPP) + Basic drafting</td>
                        <td className="text-right p-3">₹10K - ₹20K</td>
                      </tr>
                      <tr className="border-t bg-gray-50">
                        <td className="p-3 font-medium">Complete Filing</td>
                        <td className="p-3 text-gray-700">Govt fee (₹1,600) + Professional drafting</td>
                        <td className="text-right p-3">₹40K - ₹80K</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Examination Request</td>
                        <td className="p-3 text-gray-700">Govt fee (₹4,000) + Attorney fee</td>
                        <td className="text-right p-3">₹20K - ₹30K</td>
                      </tr>
                      <tr className="border-t bg-gray-50">
                        <td className="p-3 font-medium">FER Response</td>
                        <td className="p-3 text-gray-700">Responding to objections</td>
                        <td className="text-right p-3">₹30K - ₹60K</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Grant & Publication</td>
                        <td className="p-3 text-gray-700">Final govt fees</td>
                        <td className="text-right p-3">₹5K - ₹10K</td>
                      </tr>
                      <tr className="border-t bg-purple-100">
                        <td className="p-3 font-bold">Total (Filing to Grant)</td>
                        <td className="p-3 text-gray-700">Complete patent process</td>
                        <td className="text-right p-3 font-bold text-purple-700">₹1.0L - ₹2.0L</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                    <p className="text-sm text-yellow-900">
                      <AlertCircle className="h-4 w-4 inline mr-2" />
                      <strong>Without SIPP:</strong> Total cost would be ₹2.5L - ₹4.0L. SIPP saves 50-60% overall.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Costs to Consider</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="font-bold">•</span>
                      <span><strong>Annual Maintenance:</strong> ₹800 - ₹8,000/year (increases over time)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">•</span>
                      <span><strong>PCT Filing:</strong> ₹1.5L - ₹2.5L for international protection</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">•</span>
                      <span><strong>National Phase (per country):</strong> ₹2L - ₹4L per jurisdiction</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">•</span>
                      <span><strong>Expedited Examination:</strong> ₹8,000 govt fee + attorney charges</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Patent Timeline for Startups
              </h2>

              <Card className="border-l-4 border-l-blue-600">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h4 className="font-bold text-gray-900 mb-1">Day 0: Provisional Filing</h4>
                        <p className="text-sm text-gray-700">File provisional patent (₹1,600). Priority date established.</p>
                        <span className="text-xs text-green-600 font-medium">Cost: ₹10K-20K total</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h4 className="font-bold text-gray-900 mb-1">Month 6-12: Complete Application</h4>
                        <p className="text-sm text-gray-700">Convert to complete specification before 12 months expires.</p>
                        <span className="text-xs text-blue-600 font-medium">Cost: ₹40K-80K</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h4 className="font-bold text-gray-900 mb-1">Month 12-48: Request Examination</h4>
                        <p className="text-sm text-gray-700">File examination request (must be within 48 months of filing).</p>
                        <span className="text-xs text-purple-600 font-medium">Cost: ₹20K-30K</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">4</div>
                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                      </div>
                      <div className="pb-6">
                        <h4 className="font-bold text-gray-900 mb-1">Month 24-36: FER Received</h4>
                        <p className="text-sm text-gray-700">Receive First Examination Report (FER) with objections.</p>
                        <span className="text-xs text-orange-600 font-medium">6 months to respond</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">5</div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Month 36-60: Patent Grant</h4>
                        <p className="text-sm text-gray-700">Patent granted and published in official gazette.</p>
                        <span className="text-xs text-teal-600 font-medium">20-year protection begins</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
                    <p className="text-sm text-blue-900">
                      <strong>Fast-Track Option:</strong> With expedited examination, startups can get patent grant in 12-18 months instead of 3-5 years. Available under SIPP.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Patents and Investor Due Diligence
              </h2>

              <Card className="border-l-4 border-l-green-600 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    What Investors Look For
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Seed/Angel Stage:</h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>At least 1 provisional patent filed</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>"Patent Pending" status for core tech</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Clear IP ownership (founder agreements)</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>No third-party IP conflicts</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Series A+ Stage:</h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>2-5 complete patent applications filed</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>At least 1 patent granted</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>International filings (PCT/national phase)</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Freedom to operate analysis done</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-purple-900">
                      <strong>Impact on Valuation:</strong> Startups with granted patents can see 15-40% higher valuations compared to those without IP protection, especially in deep-tech and pharma sectors.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Common Mistakes Startups Make
              </h2>

              <div className="space-y-4">
                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Public Disclosure Before Filing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Mistake:</strong> Presenting at conferences, publishing papers, or launching product before patent filing.
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Solution:</strong> File provisional patent BEFORE any public disclosure. Even your own disclosure destroys novelty in India.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Missing Provisional Deadline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Mistake:</strong> Forgetting to convert provisional to complete within 12 months.
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Solution:</strong> Set calendar reminders at 6 months and 11 months. File complete at least 2 weeks before deadline.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Unclear IP Ownership
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Mistake:</strong> No written agreement with co-founders/developers about IP ownership.
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Solution:</strong> Sign IP assignment agreements with all co-founders, developers, and contractors BEFORE they contribute to invention.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      DIY Patent Drafting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Mistake:</strong> Writing patent application without professional help to save money.
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Solution:</strong> Hire experienced patent attorney. Poor drafting = weak/rejected patent. Consult patent attorneys in Bangalore for professional drafting.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Ignoring International Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Mistake:</strong> Only filing in India when planning to expand globally or raise from foreign VCs.
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Solution:</strong> File PCT within 12 months of Indian filing to keep international options open. Decide specific countries later.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Should I file patent or focus on product development first?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      File provisional patent first (₹1,600 + basic drafting). This protects your idea while you build. Investors want to see both product AND IP protection. Don't wait until product is perfect.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I get funding without a patent?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      Yes, but it's harder for deep-tech/hardware startups. At minimum, have "Patent Pending" status (provisional filed). For software/service startups, patents are less critical than traction.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How long does DPIIT recognition take?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      Typically 2-4 weeks. Apply on Startup India portal with incorporation certificate, pitch deck, and innovation description. SIPP benefits apply retroactively once approved.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What if my co-founder leaves? Who owns the patent?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      If proper IP assignment agreement is signed, company owns it. Without agreement, co-founder may claim ownership. Always sign IP assignment at incorporation.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I patent an improvement to existing technology?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      Yes, if your improvement is non-obvious and provides technical advantage. Many startup patents are incremental improvements. Ensure freedom to operate for base technology.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Should I hire a patent attorney or use online services?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      For core technology, hire experienced patent attorney. For simpler mechanical inventions, online services may work. Bad drafting costs more in the long run (rejected/weak patent). Patent attorneys in Bangalore with startup experience provide best ROI.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-8">
              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Patent Strategy Consultation for Startups</h2>
                  <p className="text-lg mb-6 opacity-90">
                    Our patent attorneys in Bellandur, Bangalore specialize in helping startups navigate SIPP, provisional filing, and cost-effective patent strategies.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/contact">Get Free Startup Consultation</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600" asChild>
                      <Link href="/services/patent-filing">Patent Filing Services</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Patent Filing Cost for Startups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/knowledge-hub/patent-filing-cost-india-startups" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">What Can Be Patented in India</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/knowledge-hub/what-can-be-patented-in-india" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">How to File a Patent in India</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/knowledge-hub/how-to-file-patent-india-2025" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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
