"use client"

import React, { useEffect, useState, useMemo } from "react"
import Script from "next/script"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, BookOpen, Lightbulb, Scale, Shield, FileText } from "lucide-react"

const articles = [
  {
    slug: "ip-basics",
    title: "Intellectual Property Basics",
    excerpt:
      "A high-level overview of patents, trademarks, copyrights, and designs—what they protect and when to use each.",
    icon: <Lightbulb className="h-5 w-5 text-blue-700" />,
    readTime: "5 min read",
    tag: "Fundamentals",
  },
  {
    slug: "patent-vs-trademark",
    title: "Patent vs. Trademark: Key Differences",
    excerpt:
      "Understand how patents protect inventions while trademarks protect brand identity such as names and logos.",
    icon: <Scale className="h-5 w-5 text-green-700" />,
    readTime: "6 min read",
    tag: "Comparisons",
  },
  {
    slug: "copyright-online",
    title: "Copyright in the Digital Age",
    excerpt:
      "Explore how copyright applies to online content, software, and media—plus essential DMCA considerations.",
    icon: <Shield className="h-5 w-5 text-purple-700" />,
    readTime: "7 min read",
    tag: "Guides",
  },
  {
    slug: "filing-patent",
    title: "Filing a Patent: A Simple Roadmap",
    excerpt:
      "From prior art searching to drafting and submission—follow this step-by-step outline to get started.",
    icon: <FileText className="h-5 w-5 text-orange-700" />,
    readTime: "8 min read",
    tag: "How-To",
  },
]

export default function KnowledgeHubPage() {
  const [currentTrending, setCurrentTrending] = useState(0)
  const trending = articles.slice(0, 4)
  const siteUrl = useMemo(() => process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com", [])

  useEffect(() => {
    if (trending.length <= 1) return
    const id = setInterval(() => {
      setCurrentTrending((i) => (i + 1) % trending.length)
    }, 3000)
    return () => clearInterval(id)
  }, [trending.length])

  const scrollTo = (slug: string) => {
    const el = document.getElementById(slug)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b sticky top-0 z-40" role="banner">
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
            <h1 className="text-3xl font-bold text-gray-900">Learn About Intellectual Property</h1>
            <p className="text-gray-700">Hand‑picked primers to help you get oriented. You can replace these later.</p>
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
                <button
                  key={a.slug}
                  onClick={() => scrollTo(a.slug)}
                  className={`absolute inset-0 flex items-center text-sm text-blue-800 hover:underline transition-all duration-500 ${idx === currentTrending ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                  aria-label={`Go to ${a.title}`}
                >
                  • {a.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Card key={a.slug} className="bg-white border hover:shadow-md transition-shadow">
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
                  <Link href={`#${a.slug}`}>Read</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample content sections (anchors for now) */}
        <div className="mt-10 space-y-10">
          <section id="ip-basics" className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-2">Intellectual Property Basics</h2>
            <p className="text-gray-700">
              Intellectual property (IP) is a category of property that includes intangible creations of the human mind.
              Common types include patents (inventions), trademarks (brands), copyrights (creative works), and designs
              (aesthetic features of products). IP rights encourage innovation by granting creators limited exclusive
              rights to their works, typically in exchange for public disclosure.
            </p>
          </section>

          <section id="patent-vs-trademark" className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-2">Patent vs. Trademark</h2>
            <p className="text-gray-700">
              Patents protect technical inventions (processes, machines, compositions of matter). Trademarks protect
              brand identifiers like names, logos, and slogans that distinguish goods or services. Use patents when you
              want to protect how something works; use trademarks to protect how customers recognize your brand.
            </p>
          </section>

          <section id="copyright-online" className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-2">Copyright in the Digital Age</h2>
            <p className="text-gray-700">
              Copyright automatically protects original works like software, articles, photos, and videos. Online, it
              often involves licensing, fair use, and dealing with infringement (e.g., DMCA takedowns). Consider
              attaching explicit licenses and using monitoring tools if content protection is a priority.
            </p>
          </section>

          <section id="filing-patent" className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-2">Filing a Patent: A Simple Roadmap</h2>
            <p className="text-gray-700">
              A patent application typically requires conducting a prior art search, preparing a detailed specification with claims, and filing with the appropriate patent office. Professional guidance is often recommended to ensure proper scope and protection.
            </p>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="bg-white rounded-lg border p-6">
                        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                          <details className="group border rounded-md p-3">
                            <summary className="cursor-pointer font-medium">What is the difference between patents and trademarks?</summary>
                            <div className="mt-2 text-sm text-gray-700">Patents protect inventions and how they work; trademarks protect brand identifiers like names and logos.</div>
                          </details>
                          <details className="group border rounded-md p-3">
                            <summary className="cursor-pointer font-medium">Do I need to register copyright?</summary>
                            <div className="mt-2 text-sm text-gray-700">Copyright exists automatically upon creation, but registration helps assert rights and is useful in enforcement.</div>
                          </details>
                          <details className="group border rounded-md p-3">
                            <summary className="cursor-pointer font-medium">How long does a patent application take?</summary>
                            <div className="mt-2 text-sm text-gray-700">Typical timelines range from 18–36+ months depending on the field, office workload, and how quickly objections are addressed.</div>
                          </details>
                          <details className="group border rounded-md p-3">
                            <summary className="cursor-pointer font-medium">Is a trademark search necessary before filing?</summary>
                            <div className="mt-2 text-sm text-gray-700">Yes. A comprehensive search reduces the risk of objections and rejections, saving time and cost during prosecution.</div>
                          </details>
                          <details className="group border rounded-md p-3">
                            <summary className="cursor-pointer font-medium">Can startups/MSMEs get reduced government fees?</summary>
                            <div className="mt-2 text-sm text-gray-700">Many IP categories in India offer reduced official fees for recognized startups and MSMEs. Documentation is required.</div>
                          </details>
                          <details className="group border rounded-md p-3">
                            <summary className="cursor-pointer font-medium">Do designs protect functionality?</summary>
                            <div className="mt-2 text-sm text-gray-700">No. Design registration protects the aesthetic appearance of products. Functional aspects are protected via patents.</div>
                          </details>
                          <details className="group border rounded-md p-3">
                            <summary className="cursor-pointer font-medium">What is a DMCA takedown?</summary>
                            <div className="mt-2 text-sm text-gray-700">A DMCA takedown is a formal notice to remove infringing content hosted online. It’s frequently used to enforce copyright.</div>
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
                            ,{ "@type": "Question", name: "What is a DMCA takedown?", acceptedAnswer: { "@type": "Answer", text: "A DMCA takedown is a formal notice to remove infringing content hosted online. It’s frequently used to enforce copyright." } }
                          ]
                        })}
                      </Script>
        </div>
      </main>
    </div>
  )
}
