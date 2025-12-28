import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle, Clock, FileText, Search, PenTool, Send, Shield, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  title: "How to File a Patent in India 2025 - Complete Step-by-Step Guide",
  description: "Complete guide to filing a patent in India in 2025. Learn the patent filing process, required documents, costs, timeline, and expert tips for Indian inventors and startups. Updated with latest IPO regulations.",
  keywords: [
    "how to file patent in india",
    "patent filing process india 2025",
    "patent application india",
    "indian patent office filing",
    "patent registration india",
    "patent filing steps",
    "patent application process",
    "file patent online india",
    "patent filing guide india",
    "patent filing for startups india",
    "indian patent filing procedure",
    "patent filing bangalore",
  ],
  alternates: {
    canonical: `${siteUrl}/knowledge-hub/how-to-file-patent-india-2025`,
  },
  openGraph: {
    type: "article",
    url: `${siteUrl}/knowledge-hub/how-to-file-patent-india-2025`,
    title: "How to File a Patent in India 2025 - Complete Guide",
    description: "Step-by-step guide to filing patents in India. Learn the complete process, documents needed, costs, and timeline.",
    siteName: "IP Protection India",
  },
};

export default function PatentFilingGuidePage() {
  return (
    <>
      {/* JSON-LD Schema for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "How to File a Patent in India 2025 - Complete Step-by-Step Guide",
            "description": "Complete guide to filing a patent in India in 2025 including process, costs, timeline, and requirements",
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
            "dateModified": "2025-01-15",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${siteUrl}/knowledge-hub/how-to-file-patent-india-2025`
            }
          })
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": siteUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Knowledge Hub",
                "item": `${siteUrl}/knowledge-hub`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "How to File a Patent in India 2025",
                "item": `${siteUrl}/knowledge-hub/how-to-file-patent-india-2025`
              }
            ]
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/knowledge-hub" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Hub
            </Link>
          </div>
        </header>

        {/* Article Header */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                Patent Guide
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How to File a Patent in India 2025: Complete Step-by-Step Guide
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Everything you need to know about filing a patent in India - from patentability search to grant. Updated with 2025 IPO regulations.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  15 min read
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Complete Guide
                </span>
                <span>Last updated: January 2025</span>
              </div>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="container mx-auto px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li><a href="#understanding-patents" className="text-blue-600 hover:text-blue-700">1. Understanding Patents in India</a></li>
                  <li><a href="#eligibility" className="text-blue-600 hover:text-blue-700">2. What Can Be Patented?</a></li>
                  <li><a href="#filing-process" className="text-blue-600 hover:text-blue-700">3. Step-by-Step Patent Filing Process</a></li>
                  <li><a href="#documents" className="text-blue-600 hover:text-blue-700">4. Required Documents</a></li>
                  <li><a href="#costs" className="text-blue-600 hover:text-blue-700">5. Patent Filing Costs</a></li>
                  <li><a href="#timeline" className="text-blue-600 hover:text-blue-700">6. Timeline and Processing</a></li>
                  <li><a href="#expedited" className="text-blue-600 hover:text-blue-700">7. Expedited Examination for Startups</a></li>
                  <li><a href="#common-mistakes" className="text-blue-600 hover:text-blue-700">8. Common Mistakes to Avoid</a></li>
                  <li><a href="#expert-tips" className="text-blue-600 hover:text-blue-700">9. Expert Tips</a></li>
                  <li><a href="#faq" className="text-blue-600 hover:text-blue-700">10. Frequently Asked Questions</a></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <article className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
            
            {/* Section 1 */}
            <section id="understanding-patents" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Understanding Patents in India
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                A patent is an exclusive right granted by the Government of India to an inventor for their invention. It provides protection for 20 years from the date of filing, preventing others from making, using, selling, or importing your invention without permission.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                In India, patents are governed by the Patents Act, 1970, and are administered by the Indian Patent Office (IPO) under the Controller General of Patents, Designs, and Trademarks. The system follows the "first to file" principle, meaning the first person to file an application gets the priority.
              </p>
              <Card className="my-6 bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-blue-900">
                    <strong>Key Benefit:</strong> Patents provide monopoly rights, allowing you to commercially exploit your invention and prevent competitors from copying it. This is especially crucial for startups and MSMEs looking to attract investors.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Section 2 */}
            <section id="eligibility" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Can Be Patented in India?
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                For an invention to be patentable in India, it must meet three fundamental criteria:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 my-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Novel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      The invention must be new and not disclosed anywhere in the world before filing.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Inventive Step
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      It must involve a technical advancement or non-obvious improvement over existing knowledge.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Industrial Application
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      The invention must be capable of being made or used in an industry.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">What Cannot Be Patented?</h3>
              <p className="text-gray-700 mb-4">
                Under Section 3 and Section 4 of the Patents Act, the following are NOT patentable in India:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Frivolous inventions or those contrary to natural laws</li>
                <li>Mathematical methods, algorithms, and business methods</li>
                <li>Computer programs per se (though software with technical application may be patentable)</li>
                <li>Medical treatment methods for humans and animals</li>
                <li>Plants and animals in whole or part (except microorganisms)</li>
                <li>Inventions that are against public order or morality</li>
                <li>Traditional knowledge or aggregation of known properties</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="filing-process" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Step-by-Step Patent Filing Process in India
              </h2>

              <div className="space-y-6">
                {/* Step 1 */}
                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        1
                      </div>
                      <Search className="h-6 w-6 text-blue-600" />
                      Conduct Patentability Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Before filing, conduct a thorough prior art search to ensure your invention is novel. Search databases include:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-3">
                      <li>Indian Patent Office database (ipindiaservices.gov.in)</li>
                      <li>Google Patents (patents.google.com)</li>
                      <li>Espacenet (worldwide.espacenet.com)</li>
                      <li>USPTO, EPO, WIPO databases</li>
                    </ul>
                    <p className="text-sm text-gray-600">
                      <strong>Professional Tip:</strong> Hire a patent attorney for comprehensive search. A proper search saves time and money by identifying potential obstacles early.
                    </p>
                  </CardContent>
                </Card>

                {/* Step 2 */}
                <Card className="border-l-4 border-l-green-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        2
                      </div>
                      <PenTool className="h-6 w-6 text-green-600" />
                      Draft Patent Application
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Patent drafting is the most critical step. A patent application consists of:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-3">
                      <li><strong>Title:</strong> Clear and concise description</li>
                      <li><strong>Abstract:</strong> 150-word summary</li>
                      <li><strong>Field of Invention:</strong> Technical domain</li>
                      <li><strong>Background:</strong> Existing solutions and their limitations</li>
                      <li><strong>Summary:</strong> Overview of your invention</li>
                      <li><strong>Detailed Description:</strong> Complete technical disclosure with diagrams</li>
                      <li><strong>Claims:</strong> Legal boundaries defining the scope of protection</li>
                      <li><strong>Drawings:</strong> Illustrations of the invention</li>
                    </ul>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                      <p className="text-sm text-yellow-900">
                        <span className="text-lg font-bold mr-2">*</span>
                        <strong>Important:</strong> Claims define your patent scope. Poorly drafted claims = weak protection. Always hire an experienced patent attorney for drafting.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3 */}
                <Card className="border-l-4 border-l-purple-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        3
                      </div>
                      <Send className="h-6 w-6 text-purple-600" />
                      File Patent Application
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      File your application online through the Indian Patent Office e-filing portal:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2 text-gray-700 mb-3">
                      <li>Register on the IPO website (ipindiaonline.gov.in)</li>
                      <li>Choose application type: Provisional or Complete</li>
                      <li>Upload Form 1 (Application for Patent)</li>
                      <li>Upload Form 2 (Provisional/Complete Specification)</li>
                      <li>Upload Form 3 (Undertaking by Applicant)</li>
                      <li>Upload Form 5 (Declaration of Inventorship)</li>
                      <li>Pay the prescribed government fees</li>
                      <li>Submit and receive acknowledgment receipt</li>
                    </ol>
                    <p className="text-sm text-gray-600 mt-4">
                      <strong>Provisional vs Complete Application:</strong> File provisional first if your invention is still under development. You get 12 months to file the complete specification. If invention is ready, file complete application directly.
                    </p>
                  </CardContent>
                </Card>

                {/* Step 4 */}
                <Card className="border-l-4 border-l-orange-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        4
                      </div>
                      Publication (18 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Your patent application is published in the Patent Office Journal after 18 months from filing date (or priority date). You can request early publication by filing Form 9 with fees.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Why Early Publication?</strong> Accelerates the examination process and establishes your priority date publicly.
                    </p>
                  </CardContent>
                </Card>

                {/* Step 5 */}
                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        5
                      </div>
                      Request for Examination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      File Request for Examination (RFE) using Form 18 within 48 months from priority date. Without RFE, your application will be considered withdrawn.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Processing Time:</strong> After RFE, examination typically takes 1-2 years. Startups can opt for expedited examination (within 6 months).
                    </p>
                  </CardContent>
                </Card>

                {/* Step 6 */}
                <Card className="border-l-4 border-l-indigo-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        6
                      </div>
                      Respond to First Examination Report (FER)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      The patent examiner issues FER listing objections based on:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-3">
                      <li>Prior art citations affecting novelty</li>
                      <li>Lack of inventive step</li>
                      <li>Insufficient disclosure</li>
                      <li>Non-compliance with formalities</li>
                    </ul>
                    <p className="text-sm text-gray-600">
                      You have 6 months to respond with amendments and arguments. This is a critical stage requiring expert legal and technical skills.
                    </p>
                  </CardContent>
                </Card>

                {/* Step 7 */}
                <Card className="border-l-4 border-l-teal-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        7
                      </div>
                      Hearing (if required)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      If the examiner is not satisfied with your response, a hearing is scheduled. You or your patent attorney can present arguments and evidence to overcome objections.
                    </p>
                  </CardContent>
                </Card>

                {/* Step 8 */}
                <Card className="border-l-4 border-l-green-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        8
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      Grant of Patent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Upon acceptance, you receive a patent grant certificate. The patent is published in the Patent Office Journal and valid for 20 years from filing date.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Renewal Fees:</strong> Pay annual renewal fees starting from the 3rd year to keep your patent in force.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 4 */}
            <section id="documents" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Required Documents for Patent Filing
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Form 1:</strong> Patent application form with applicant details
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Form 2:</strong> Complete specification with title, abstract, description, claims, and drawings
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Form 3:</strong> Undertaking by applicant (for communication and compliance)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Form 5:</strong> Declaration of inventorship and right to file
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Proof of Right:</strong> Assignment deed if filing through assignee
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Priority Documents:</strong> If claiming priority from foreign application
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Sequence Listing:</strong> If biological sequences are involved
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Power of Attorney:</strong> If filing through patent agent/attorney
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Section 5 */}
            <section id="costs" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Patent Filing Costs in India (2025)
              </h2>
              <p className="text-gray-700 mb-6">
                Patent costs vary based on applicant category. Indian Patent Office offers significant fee reductions for startups and individuals.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Stage</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Natural Person/Startup</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Small Entity</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Large Entity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Filing (Complete)</td>
                      <td className="border border-gray-300 px-4 py-2">₹1,600</td>
                      <td className="border border-gray-300 px-4 py-2">₹4,000</td>
                      <td className="border border-gray-300 px-4 py-2">₹8,000</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Request for Examination</td>
                      <td className="border border-gray-300 px-4 py-2">₹4,000</td>
                      <td className="border border-gray-300 px-4 py-2">₹10,000</td>
                      <td className="border border-gray-300 px-4 py-2">₹20,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Early Publication</td>
                      <td className="border border-gray-300 px-4 py-2">₹2,500</td>
                      <td className="border border-gray-300 px-4 py-2">₹6,250</td>
                      <td className="border border-gray-300 px-4 py-2">₹12,500</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Grant Fees</td>
                      <td className="border border-gray-300 px-4 py-2">₹2,400</td>
                      <td className="border border-gray-300 px-4 py-2">₹6,000</td>
                      <td className="border border-gray-300 px-4 py-2">₹12,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Card className="mt-6 bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-green-900 mb-2">
                    <strong>Professional Service Costs:</strong> Patent attorney fees for drafting and prosecution range from ₹30,000 to ₹1,50,000 depending on complexity.
                  </p>
                  <p className="text-sm text-green-900">
                    Total cost for a startup typically ranges from ₹35,000 to ₹2,00,000 including government and professional fees.
                  </p>
                </CardContent>
              </Card>

              <p className="text-sm text-gray-600 mt-4">
                <Link href="/knowledge-hub/patent-filing-cost-india-startups" className="text-blue-600 hover:text-blue-700 underline">
                  Read detailed breakdown: Patent Filing Cost in India for Startups →
                </Link>
              </p>
            </section>

            {/* Section 6 */}
            <section id="timeline" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Patent Filing Timeline in India
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-32 font-semibold text-blue-600">Month 0</div>
                  <div className="flex-1">
                    <strong>Filing</strong> - Submit provisional or complete application
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-32 font-semibold text-blue-600">Month 12</div>
                  <div className="flex-1">
                    <strong>Complete Specification</strong> - File complete specification if provisional filed
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-32 font-semibold text-blue-600">Month 18</div>
                  <div className="flex-1">
                    <strong>Publication</strong> - Application published in Patent Journal
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-32 font-semibold text-blue-600">Within 48 months</div>
                  <div className="flex-1">
                    <strong>Request for Examination</strong> - Must be filed or application abandoned
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-32 font-semibold text-blue-600">12-24 months after RFE</div>
                  <div className="flex-1">
                    <strong>First Examination Report</strong> - Examiner issues objections
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-32 font-semibold text-blue-600">Within 6 months</div>
                  <div className="flex-1">
                    <strong>Response to FER</strong> - Submit compliance and arguments
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-32 font-semibold text-blue-600">3-5 years total</div>
                  <div className="flex-1">
                    <strong>Patent Grant</strong> - Certificate of patent issued
                  </div>
                </div>
              </div>

              <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-blue-900">
                    <strong>Average Time to Grant:</strong> 3-5 years for regular examination, 6-12 months for expedited examination (startups)
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Section 7 */}
            <section id="expedited" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Expedited Examination for Startups
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Indian startups recognized by DPIIT (Department for Promotion of Industry and Internal Trade) can avail expedited examination under the Startups Intellectual Property Protection (SIPP) scheme.
              </p>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">Benefits for Startups:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>80% rebate on patent filing fees</li>
                <li>Expedited examination within 6-12 months</li>
                <li>Government facilitators to assist with filing</li>
                <li>Panel of attorneys for subsidized professional services</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3">How to Apply:</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Get DPIIT recognition certificate for your startup</li>
                <li>File patent application with startup declaration</li>
                <li>File Form 18A for expedited examination</li>
                <li>Submit startup recognition certificate</li>
                <li>Examination begins within 1 month</li>
              </ol>
            </section>

            {/* Section 8 */}
            <section id="common-mistakes" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Common Mistakes to Avoid
              </h2>
              <div className="space-y-4">
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Public Disclosure Before Filing</h3>
                      <p className="text-sm text-gray-700">
                        Never disclose your invention publicly (publications, conferences, social media) before filing. It destroys novelty and makes it unpatentable.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">DIY Patent Drafting</h3>
                      <p className="text-sm text-gray-700">
                        Poorly drafted patents = weak protection. Claims are legal documents requiring expertise. Always hire a qualified patent attorney.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Missing Deadlines</h3>
                      <p className="text-sm text-gray-700">
                        Missing RFE deadline (48 months) or FER response deadline (6 months) leads to application abandonment. Set reminders!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Inadequate Prior Art Search</h3>
                      <p className="text-sm text-gray-700">
                        Skipping search leads to rejection. Invest in comprehensive search to identify obstacles early.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Not Paying Renewal Fees</h3>
                      <p className="text-sm text-gray-700">
                        Patents require annual renewal from year 3. Missing renewals = patent lapses and becomes public domain.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 9 */}
            <section id="expert-tips" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Expert Tips for Successful Patent Filing
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Document Everything
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Maintain detailed invention notebooks with dates, sketches, and experiments. This helps in drafting and proving inventorship.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      File Early
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      India follows first-to-file system. File as soon as you have a working concept. Use provisional if you need time to refine.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      Broad Claims
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Draft claims as broad as possible while maintaining novelty. Narrow claims = easy to design around.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      International Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Consider PCT filing for international markets. You have 12 months from Indian filing to claim priority abroad.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 10 - FAQ */}
            <section id="faq" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I file a patent myself without an attorney?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Yes, you can file yourself, but it's not recommended. Patent drafting requires legal and technical expertise. Poor drafting leads to weak protection or rejection. Professional fees are a worthy investment for strong protection.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How long does patent protection last in India?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Patents are valid for 20 years from the filing date. You must pay annual renewal fees from the 3rd year to maintain the patent.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What is the difference between provisional and complete application?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Provisional application is a placeholder with basic description, no claims required. It gives you 12 months to file complete specification. Complete application includes full disclosure and claims, ready for examination.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can software be patented in India?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Computer programs "per se" are not patentable. However, software with a technical application, involving hardware interaction, or producing a technical effect may be patentable. Consult a patent attorney for assessment.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Do I need separate patents for each country?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      Yes, patents are territorial. An Indian patent only protects in India. For international protection, file PCT application or directly in countries of interest. You can claim priority from your Indian application for 12 months.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What happens if someone infringes my patent?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      You can send cease and desist notice, negotiate licensing, or file infringement suit in court. Patent holder has the right to seek injunction, damages, and account of profits. Consult IP attorney for enforcement strategy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* CTA Section */}
            <section className="mb-8">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Need Help Filing Your Patent?</h2>
                  <p className="text-lg mb-6 opacity-90">
                    Our experienced patent attorneys in Bellandur, Bangalore provide end-to-end patent filing services for startups and businesses across India.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/services/patent-filing">
                        View Patent Filing Services
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" asChild>
                      <Link href="/contact">
                        Get Free Consultation
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Related Articles */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Patent Filing Cost in India for Startups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Detailed breakdown of government fees, professional charges, and cost-saving strategies.
                    </p>
                    <Link href="/knowledge-hub/patent-filing-cost-india-startups" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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
                      Complete guide to trademark registration from search to registration certificate.
                    </p>
                    <Link href="/knowledge-hub/trademark-registration-bangalore" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Patent vs Trademark: Key Differences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Understand which IP protection is right for your business and when to use each.
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
