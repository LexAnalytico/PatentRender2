"use client"

import React, { useEffect, useState, useMemo } from "react"
import Script from "next/script"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, BookOpen, Lightbulb, Scale, Shield, FileText, Rocket } from "lucide-react"

const articles = [
  {
    slug: "how-to-file-patent-india-2025",
    title: "How to File a Patent in India 2025 - Complete Guide",
    excerpt:
      "Complete step-by-step guide to filing patents in India. Learn the process, documents needed, costs, timeline, and expert tips for startups.",
    icon: <FileText className="h-5 w-5 text-blue-700" />,
    readTime: "15 min read",
    tag: "Patent Guide",
    href: "/knowledge-hub/how-to-file-patent-india-2025",
  },
  {
    slug: "what-can-be-patented-in-india",
    title: "What Can Be Patented in India? Complete Guide 2025",
    excerpt:
      "Learn patentability criteria in India. Understand what inventions qualify for patent protection, exclusions under Section 3, and examples with expert guidance.",
    icon: <Shield className="h-5 w-5 text-teal-700" />,
    readTime: "12 min read",
    tag: "Patent Guide",
    href: "/knowledge-hub/what-can-be-patented-in-india",
  },
  {
    slug: "startup-patent-filing-guide-india",
    title: "Complete Patent Filing Guide for Startups",
    excerpt:
      "Strategic patent filing guide for Indian startups. Learn SIPP benefits, provisional patents, costs, investor requirements, and expert tips from attorneys.",
    icon: <Rocket className="h-5 w-5 text-purple-700" />,
    readTime: "14 min read",
    tag: "Startup Guide",
    href: "/knowledge-hub/startup-patent-filing-guide-india",
  },
  {
    slug: "patent-filing-cost-india-startups",
    title: "Patent Filing Cost in India for Startups",
    excerpt:
      "Detailed breakdown of patent filing costs for startups in 2025. Government fees, professional charges, SIPP benefits, and cost-saving strategies.",
    icon: <Scale className="h-5 w-5 text-green-700" />,
    readTime: "10 min read",
    tag: "Cost Guide",
    href: "/knowledge-hub/patent-filing-cost-india-startups",
  },
  {
    slug: "trademark-registration-bangalore",
    title: "Trademark Registration Process in Bangalore",
    excerpt:
      "Complete guide to trademark registration in Bangalore. Expert attorneys in Bellandur for brand protection, search, filing, and registration.",
    icon: <Shield className="h-5 w-5 text-purple-700" />,
    readTime: "8 min read",
    tag: "Trademark Guide",
    href: "/knowledge-hub/trademark-registration-bangalore",
  },
  {
    slug: "patent-vs-trademark-differences",
    title: "Difference Between Patent and Trademark",
    excerpt:
      "Understand key differences between patents and trademarks. Learn which IP protection is right for your business with examples and expert advice.",
    icon: <Lightbulb className="h-5 w-5 text-orange-700" />,
    readTime: "7 min read",
    tag: "Comparisons",
    href: "/knowledge-hub/patent-vs-trademark-differences",
  },
  {
    slug: "smell-trademark-olfactory-mark-registration-india",
    title: "Smell as Trademark: Olfactory Mark Registration Challenges in India",
    excerpt:
      "Legal analysis of India's first smell trademark registration. Learn about olfactory mark challenges, graphical representation requirements, and enforcement issues under Trade Marks Act 1999.",
    icon: <Scale className="h-5 w-5 text-indigo-700" />,
    readTime: "18 min read",
    tag: "Legal Analysis",
    href: "/knowledge-hub/smell-trademark-olfactory-mark-registration-india",
  },
]

export default function KnowledgeHubPage() {
  const [currentTrending, setCurrentTrending] = useState(0)
  const trending = articles.slice(0, 4)
  const siteUrl = useMemo(() => process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com", [])

  useEffect(() => {
    // Set page title and meta dynamically for client component
    document.title = "Knowledge Hub - IP Education & Resources | IP Protection India"
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Learn about patents, trademarks, copyrights, and design registration. Comprehensive guides, FAQs, and resources for intellectual property protection in India.')
    }
  }, [])

  useEffect(() => {
    if (trending.length <= 1) return
    const id = setInterval(() => {
      setCurrentTrending((i) => (i + 1) % trending.length)
    }, 3000)
    return () => clearInterval(id)
  }, [trending.length])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Non-sticky since main navbar is already sticky */}
      <header className="bg-white border-b" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span id="page-heading" className="text-lg font-semibold">Knowledge Hub</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" role="main">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-gray-900">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900">Knowledge Hub</li>
          </ol>
        </nav>
        {/* BreadcrumbList JSON-LD */}
        <Script id="kh-breadcrumbs" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
              { "@type": "ListItem", position: 2, name: "Knowledge Hub", item: `${siteUrl}/knowledge-hub` },
            ]
          })}
        </Script>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Intellectual Property Knowledge Hub</h1>
            <p className="text-gray-700 mt-2">Comprehensive guides on patents, trademarks, copyrights, and design registration in India. Learn from experts and protect your innovations.</p>
          </div>
          <div className="w-64 hidden md:block">
            <label htmlFor="kh-search" className="sr-only">Search articles</label>
            <Input id="kh-search" placeholder="Search articles..." className="bg-white" />
          </div>
        </div>

        {/* Trending banner */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-3 overflow-hidden">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Trending</span>
            <div className="relative h-6 flex-1">
              {trending.map((a, idx) => (
                <Link
                  key={a.slug}
                  href={a.href}
                  className={`absolute inset-0 flex items-center text-sm text-blue-800 hover:underline transition-all duration-500 ${idx === currentTrending ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                  aria-label={`Go to ${a.title}`}
                >
                  • {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {articles.map((a) => (
            <Card key={a.slug} className="bg-white border hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {a.icon}
                  <span>{a.tag}</span>
                </div>
                <CardTitle className="text-lg">{a.title}</CardTitle>
                <CardDescription>{a.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{a.readTime}</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={a.href}>Read Article →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links to Popular Topics */}
        <div className="mt-10 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/knowledge-hub/how-to-file-patent-india-2025" className="group">
              <Card className="h-full border-2 hover:border-blue-600 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <FileText className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-2">Patent Filing Guide</h3>
                  <p className="text-sm text-gray-600">Complete process for 2025</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/knowledge-hub/patent-filing-cost-india-startups" className="group">
              <Card className="h-full border-2 hover:border-green-600 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <Scale className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-2">Patent Costs</h3>
                  <p className="text-sm text-gray-600">Startup fee breakdown</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/knowledge-hub/trademark-registration-bangalore" className="group">
              <Card className="h-full border-2 hover:border-purple-600 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <Shield className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-2">Trademark Registration</h3>
                  <p className="text-sm text-gray-600">Bangalore process guide</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/knowledge-hub/patent-vs-trademark-differences" className="group">
              <Card className="h-full border-2 hover:border-orange-600 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <Lightbulb className="h-8 w-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-2">Patent vs Trademark</h3>
                  <p className="text-sm text-gray-600">Key differences explained</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 mb-10">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Need Expert IP Protection Services?</h2>
                <p className="text-lg mb-6 opacity-90">
                  Our experienced attorneys in Bellandur, Bangalore provide comprehensive patent, trademark, and copyright services for startups and businesses across India.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild className="font-semibold">
                    <Link href="/contact">Get Free Consultation</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold" asChild>
                    <Link href="/services/patent-filing">View All Services</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-10 space-y-10">
          <section id="faq" className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-1 bg-blue-600 rounded-full"></div>
                          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        </div>
                        <div className="space-y-3">
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700">
                              <span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>
                              What is the difference between patents and trademarks?
                            </summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Patents protect inventions and how they work; trademarks protect brand identifiers like names and logos.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700">
                              <span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>
                              Do I need to register copyright?
                            </summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Copyright exists automatically upon creation, but registration helps assert rights and is useful in enforcement.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>How long does a patent application take?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Typical timelines range from 18–36+ months depending on the field, office workload, and how quickly objections are addressed.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>Is a trademark search necessary before filing?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Yes. A comprehensive search reduces the risk of objections and rejections, saving time and cost during prosecution.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>Can startups/MSMEs get reduced government fees?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Many IP categories in India offer reduced official fees for recognized startups and MSMEs. Documentation is required.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>Do designs protect functionality?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">No. Design registration protects the aesthetic appearance of products. Functional aspects are protected via patents.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>What is a DMCA takedown?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">A DMCA takedown is a formal notice to remove infringing content hosted online. It's frequently used to enforce copyright.</div>
                          </details>
                          
                          <div className="pt-6 mt-6 border-t-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-8 w-1 bg-green-600 rounded-full"></div>
                              <h3 className="font-bold text-xl text-gray-900">About Our Online Services</h3>
                            </div>
                          </div>
                          
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>How does online IP filing work?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Our platform lets you select services, fill forms online, upload documents, and make secure payments. Our experts review your submission, prepare professional applications, and file them with the appropriate IP office. You receive updates throughout the process via your dashboard.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>Is online filing as reliable as visiting an attorney's office?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Yes. Our platform is designed by IP attorneys and all applications are professionally reviewed before filing. You get the same quality service with added convenience of online access, transparent pricing, and real-time tracking.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>What documents do I need to upload for patent/trademark filing?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Requirements vary by service. Typically: identification proof, invention/design details, technical drawings, and supporting documents. Our forms guide you through exactly what's needed for your specific filing.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>How long does it take to get started after I place an order?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Once you complete payment and submit required forms, our team begins review within 24-48 hours. You'll receive confirmation and next steps via email and your dashboard.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>Can I track my application status online?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Yes. Your dashboard shows real-time status updates for all your orders—from initial review to filing confirmation to examination responses. You'll also receive email notifications at key milestones.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>What payment methods do you accept?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">We accept credit cards, debit cards, UPI, net banking, and digital wallets through our secure payment gateway powered by Razorpay. All transactions are encrypted and PCI-DSS compliant.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>Do you provide refunds if my application is rejected?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Our professional fees cover application preparation and filing services. Government fees are non-refundable. If an application faces objections, we offer response preparation services to address them and improve approval chances.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>Can I consult with an attorney before filing?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Yes. We offer consultation services where you can discuss your IP needs with our attorneys. This helps determine the best protection strategy before you commit to filing.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>What if I need help filling out the forms?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Our forms include helpful tooltips and guidance. If you need assistance, our support team is available via email or chat to guide you through the process. You can also save partial progress and return later.</div>
                          </details>
                          <details className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2 group-open:text-blue-700"><span className="text-blue-600 group-open:rotate-90 transition-transform">▶</span>Is my data secure on your platform?</summary>
                            <div className="mt-3 pl-6 text-sm text-gray-700 leading-relaxed">Absolutely. We use bank-grade encryption (SSL/TLS), secure cloud storage, and strict access controls. Your sensitive information and documents are protected with industry-standard security measures and regular audits.</div>
                          </details>
                        </div>
                      </section>
                      {/* FAQPage JSON-LD */}
                      <Script id="kh-faq" type="application/ld+json" strategy="afterInteractive">
                        {JSON.stringify({
                          "@context": "https://schema.org",
                          "@type": "FAQPage",
                          mainEntity: [
                            { "@type": "Question", name: "What is the difference between patents and trademarks?", acceptedAnswer: { "@type": "Answer", text: "Patents protect inventions and how they work; trademarks protect brand identifiers like names and logos." } },
                            { "@type": "Question", name: "Do I need to register copyright?", acceptedAnswer: { "@type": "Answer", text: "Copyright exists automatically upon creation, but registration helps assert rights and is useful in enforcement." } }
                            ,{ "@type": "Question", name: "How long does a patent application take?", acceptedAnswer: { "@type": "Answer", text: "Typical timelines range from 18–36+ months depending on the field, office workload, and how quickly objections are addressed." } }
                            ,{ "@type": "Question", name: "Is a trademark search necessary before filing?", acceptedAnswer: { "@type": "Answer", text: "Yes. A comprehensive search reduces the risk of objections and rejections, saving time and cost during prosecution." } }
                            ,{ "@type": "Question", name: "Can startups/MSMEs get reduced government fees?", acceptedAnswer: { "@type": "Answer", text: "Many IP categories in India offer reduced official fees for recognized startups and MSMEs. Documentation is required." } }
                            ,{ "@type": "Question", name: "Do designs protect functionality?", acceptedAnswer: { "@type": "Answer", text: "No. Design registration protects the aesthetic appearance of products. Functional aspects are protected via patents." } }
                            ,{ "@type": "Question", name: "What is a DMCA takedown?", acceptedAnswer: { "@type": "Answer", text: "A DMCA takedown is a formal notice to remove infringing content hosted online. It's frequently used to enforce copyright." } }
                            ,{ "@type": "Question", name: "How does online IP filing work?", acceptedAnswer: { "@type": "Answer", text: "Our platform lets you select services, fill forms online, upload documents, and make secure payments. Our experts review your submission and file with the appropriate IP office." } }
                            ,{ "@type": "Question", name: "Is online filing as reliable as visiting an attorney's office?", acceptedAnswer: { "@type": "Answer", text: "Yes. Our platform is designed by IP attorneys and all applications are professionally reviewed before filing." } }
                            ,{ "@type": "Question", name: "Can I track my application status online?", acceptedAnswer: { "@type": "Answer", text: "Yes. Your dashboard shows real-time status updates for all your orders from initial review to filing confirmation." } }
                            ,{ "@type": "Question", name: "What payment methods do you accept?", acceptedAnswer: { "@type": "Answer", text: "We accept credit cards, debit cards, UPI, net banking, and digital wallets through our secure payment gateway." } }
                            ,{ "@type": "Question", name: "Is my data secure on your platform?", acceptedAnswer: { "@type": "Answer", text: "Yes. We use bank-grade encryption, secure cloud storage, and strict access controls to protect your information." } }
                          ]
                        })}
                      </Script>
        </div>
      </main>
    </div>
  )
}
