import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle, X, AlertCircle, Lightbulb, Shield, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  title: "What Can Be Patented in India? Complete Guide 2025 | Patentability Requirements",
  description: "Complete guide to what can and cannot be patented in India. Learn patentability criteria, examples, exclusions under Patents Act 1970, and expert tips from patent attorneys in Bangalore.",
  keywords: [
    "what can be patented in india",
    "patentable inventions india",
    "patent eligibility india",
    "what cannot be patented",
    "patentability criteria india",
    "patent act section 3",
    "software patent india",
    "business method patent india",
    "patent attorney bangalore",
    "patentability search india",
  ],
  alternates: {
    canonical: `${siteUrl}/knowledge-hub/what-can-be-patented-in-india`,
  },
  openGraph: {
    type: "article",
    url: `${siteUrl}/knowledge-hub/what-can-be-patented-in-india`,
    title: "What Can Be Patented in India? Complete Guide 2025",
    description: "Learn what inventions qualify for patent protection in India with examples and expert guidance.",
    siteName: "IP Protection India",
  },
};

export default function WhatCanBePatentedPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "What Can Be Patented in India? Complete Guide 2025",
            "description": "Complete guide to patentability criteria and requirements in India",
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

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
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
            <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Patent Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Can Be Patented in India? Complete Guide 2025
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Comprehensive guide to patentability criteria in India. Learn what inventions qualify for patent protection, exclusions under Section 3, and expert tips from patent attorneys in Bangalore.
            </p>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Shield className="h-8 w-8 text-teal-600" />
                Three Requirements for Patentability in India
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Under the Patents Act, 1970, an invention must satisfy three fundamental criteria to be eligible for patent protection in India:
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card className="border-l-4 border-l-green-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      1. Novelty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      The invention must be new and not disclosed anywhere in the world before the filing date. Even your own public disclosure destroys novelty.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      2. Inventive Step
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      The invention must involve a technical advancement or non-obvious improvement that wouldn't be obvious to a person skilled in that field.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      3. Industrial Applicability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      The invention must be capable of being made or used in an industry. Purely theoretical or abstract concepts don't qualify.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What CAN Be Patented in India
              </h2>

              <div className="space-y-6">
                <Card className="border-l-4 border-l-green-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      Mechanical Inventions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">Machines, devices, tools, mechanical systems and their components.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• New manufacturing equipment or production machinery</li>
                      <li>• Improved mechanical components (gears, bearings, valves)</li>
                      <li>• Innovative vehicle parts or engine components</li>
                      <li>• Agricultural machinery with novel features</li>
                      <li>• Medical devices and surgical instruments</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                      Chemical & Pharmaceutical Inventions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">New chemical compounds, compositions, and pharmaceutical products.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• New chemical compounds with industrial application</li>
                      <li>• Pharmaceutical formulations and drug delivery systems</li>
                      <li>• Chemical processes for manufacturing</li>
                      <li>• Biotechnology products (proteins, antibodies, vaccines)</li>
                      <li>• Cosmetic formulations with novel properties</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                      Electronic & Electrical Inventions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">Electronic circuits, devices, and electrical systems.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• New electronic circuits with technical advantages</li>
                      <li>• Semiconductor devices and manufacturing processes</li>
                      <li>• IoT devices with novel technical features</li>
                      <li>• Communication systems and protocols</li>
                      <li>• Power generation and transmission innovations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                      Software with Technical Application
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">Computer programs that produce a technical effect or solve a technical problem.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Software controlling industrial machinery</li>
                      <li>• Image processing algorithms with technical output</li>
                      <li>• Computer-aided design improvements</li>
                      <li>• Network optimization methods</li>
                      <li>• Embedded software with hardware interaction</li>
                    </ul>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-3">
                      <p className="text-sm text-yellow-900">
                        <span className="text-lg font-bold mr-2">*</span>
                        <strong>Note:</strong> Pure software/algorithms "per se" are NOT patentable. The software must have a technical application or effect beyond the algorithm itself.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-indigo-600" />
                      Manufacturing Processes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">New or improved methods of manufacturing products.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Novel production techniques</li>
                      <li>• Improved chemical synthesis methods</li>
                      <li>• Energy-efficient manufacturing processes</li>
                      <li>• Quality improvement processes</li>
                      <li>• Waste reduction or recycling methods</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-pink-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-pink-600" />
                      Biotechnology Inventions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">Microorganisms, genes, and biotechnological processes.</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Genetically modified microorganisms</li>
                      <li>• Gene sequences with disclosed function</li>
                      <li>• Recombinant DNA technology applications</li>
                      <li>• Diagnostic kits and methods</li>
                      <li>• Fermentation processes</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What CANNOT Be Patented in India
              </h2>
              <p className="text-gray-700 mb-6">
                Section 3 and Section 4 of the Patents Act, 1970 clearly define inventions that are NOT patentable in India:
              </p>

              <div className="space-y-4">
                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      Frivolous Inventions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Inventions that are contrary to natural laws, trivial, or obvious to a skilled person. Example: Perpetual motion machines.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      Mathematical Methods & Algorithms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      Mathematical formulas, algorithms, and mental processes are not patentable.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Mathematical equations or theorems</li>
                      <li>• Statistical methods</li>
                      <li>• Pure algorithms without technical application</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      Business Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      Methods of doing business, accounting, or financial management.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Business models or strategies</li>
                      <li>• Accounting methods</li>
                      <li>• Financial planning systems</li>
                      <li>• Marketing or sales techniques</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      Computer Programs "Per Se"
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      Pure software or computer programs without technical contribution.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Mobile apps without technical effect</li>
                      <li>• Website features or UI designs</li>
                      <li>• Business logic in software</li>
                      <li>• Database structures</li>
                    </ul>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                      <p className="text-xs text-blue-900">
                        <Lightbulb className="h-3 w-3 inline mr-1" />
                        <strong>Tip:</strong> If your software controls hardware, improves system performance, or solves a technical problem, it may be patentable. Consult a patent attorney in Bangalore for software patentability assessment.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      Medical Treatment Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      Methods of treatment for humans and animals (surgical, therapeutic, diagnostic).
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Surgical procedures and techniques</li>
                      <li>• Therapy methods</li>
                      <li>• Diagnostic procedures on living bodies</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-2">
                      <strong>Note:</strong> Medical devices, pharmaceutical compositions, and diagnostic kits CAN be patented.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      Plants & Animals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">
                      Plants, animals, and their parts (except microorganisms).
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Plant varieties</li>
                      <li>• Animal breeds</li>
                      <li>• Seeds, biological processes for plant/animal production</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-2">
                      <strong>Exception:</strong> Genetically modified microorganisms can be patented.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      Traditional Knowledge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Traditional knowledge or aggregation/duplication of known properties of traditionally known components.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      Inventions Against Public Order/Morality
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Inventions that are contrary to public order, morality, or cause serious harm to humans, animals, or the environment.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Real-World Examples
              </h2>

              <div className="space-y-6">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      PATENTABLE Examples
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong className="text-green-900">✓ Water Purification Device:</strong>
                        <p className="text-gray-700">New filtration mechanism using novel materials → PATENTABLE (mechanical invention)</p>
                      </div>
                      <div>
                        <strong className="text-green-900">✓ AI-Based Medical Imaging:</strong>
                        <p className="text-gray-700">Software that processes X-rays to detect abnormalities → PATENTABLE (technical application)</p>
                      </div>
                      <div>
                        <strong className="text-green-900">✓ Biodegradable Plastic:</strong>
                        <p className="text-gray-700">New polymer composition → PATENTABLE (chemical invention)</p>
                      </div>
                      <div>
                        <strong className="text-green-900">✓ Smart Agricultural Sensor:</strong>
                        <p className="text-gray-700">IoT device measuring soil parameters → PATENTABLE (electronic device with technical function)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <X className="h-5 w-5" />
                      NOT PATENTABLE Examples
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong className="text-red-900">✗ Food Delivery App:</strong>
                        <p className="text-gray-700">App connecting customers to restaurants → NOT PATENTABLE (business method)</p>
                      </div>
                      <div>
                        <strong className="text-red-900">✗ New Yoga Pose:</strong>
                        <p className="text-gray-700">Physical exercise method → NOT PATENTABLE (method of medical treatment)</p>
                      </div>
                      <div>
                        <strong className="text-red-900">✗ Mathematical Trading Algorithm:</strong>
                        <p className="text-gray-700">Stock prediction formula → NOT PATENTABLE (mathematical method)</p>
                      </div>
                      <div>
                        <strong className="text-red-900">✗ Website UI Design:</strong>
                        <p className="text-gray-700">User interface layout → NOT PATENTABLE (no technical effect)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Gray Areas & Complex Cases
              </h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Software Patents in India</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Software patentability in India is complex. The key test is whether the software goes beyond the algorithm:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="border-l-4 border-green-500 pl-3">
                        <strong className="text-green-700">May Be Patentable:</strong>
                        <ul className="text-gray-600 mt-2 space-y-1">
                          <li>• Improves computer functioning</li>
                          <li>• Controls industrial process</li>
                          <li>• Has hardware interaction</li>
                          <li>• Produces technical effect</li>
                        </ul>
                      </div>
                      <div className="border-l-4 border-red-500 pl-3">
                        <strong className="text-red-700">Not Patentable:</strong>
                        <ul className="text-gray-600 mt-2 space-y-1">
                          <li>• Pure business logic</li>
                          <li>• Data processing alone</li>
                          <li>• UI/UX features</li>
                          <li>• Content management</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI & Machine Learning Inventions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      AI/ML inventions are patentable if they produce a technical effect beyond the algorithm. Example: ML model optimizing manufacturing process (patentable) vs ML model for ad targeting (not patentable).
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How to Assess Your Invention's Patentability
              </h2>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600">1.</span>
                      <div>
                        <strong className="text-gray-900">Check Basic Criteria:</strong>
                        <p className="text-sm text-gray-700">Is it novel, non-obvious, and industrially applicable?</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600">2.</span>
                      <div>
                        <strong className="text-gray-900">Verify Not Excluded:</strong>
                        <p className="text-sm text-gray-700">Check against Section 3 exclusions listed above</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600">3.</span>
                      <div>
                        <strong className="text-gray-900">Conduct Prior Art Search:</strong>
                        <p className="text-sm text-gray-700">Search patent databases to ensure novelty</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600">4.</span>
                      <div>
                        <strong className="text-gray-900">Consult Patent Attorney:</strong>
                        <p className="text-sm text-gray-700">Get professional assessment from patent attorneys in Bangalore for complex inventions</p>
                      </div>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I patent an idea?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      No. Ideas alone cannot be patented. You must have a concrete, fully developed invention with technical details explaining how it works. Patents protect implementations, not abstract ideas.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I patent software in India?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      Computer programs "per se" are not patentable. However, software with technical contribution (hardware control, system improvement, technical effect) may be patentable. Consult a patent attorney for assessment.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Are business methods patentable in India?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      No. Business methods, financial methods, and accounting systems are explicitly excluded under Section 3(k) of the Patents Act. Even if implemented through software or technology, pure business methods cannot be patented.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I patent a pharmaceutical drug?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      Yes. New pharmaceutical compounds, formulations, and drug delivery systems are patentable. However, mere discovery of known substances or new forms without enhanced efficacy may not be patentable.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What if my invention has multiple aspects?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      If your invention combines patentable and non-patentable elements, you can file for the patentable portions. For example, a medical device (patentable) + diagnostic method (not patentable) → patent the device only.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How do I know if my invention is novel enough?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">
                      Conduct a patentability search across global patent databases. If your exact invention or similar solutions exist, it may not be novel. Professional patent attorneys in Bangalore can conduct comprehensive novelty searches.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-8">
              <Card className="bg-gradient-to-r from-teal-600 to-teal-700 text-white border-0">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Need Help Determining Patentability?</h2>
                  <p className="text-lg mb-6 opacity-90">
                    Our experienced patent attorneys in Bellandur, Bangalore provide professional patentability assessments and prior art searches.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/contact">Get Free Consultation</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-teal-600" asChild>
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
                    <CardTitle className="text-base">How to File a Patent in India 2025</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/knowledge-hub/how-to-file-patent-india-2025" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>

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
                    <CardTitle className="text-base">Patent vs Trademark Differences</CardTitle>
                  </CardHeader>
                  <CardContent>
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
