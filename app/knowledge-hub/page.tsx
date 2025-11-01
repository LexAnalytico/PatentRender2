"use client"

import React, { useEffect, useState } from "react"
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
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Knowledge Hub</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learn about Intellectual Property</h1>
            <p className="text-gray-600">Hand-picked primers to help you get oriented. You can replace these later.</p>
          </div>
          <div className="w-64 hidden md:block">
            <Input placeholder="Search articles..." className="bg-white" />
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
            <h2 className="text-xl font-semibold mb-2">Intellectual Property Basics</h2>
            <p className="text-gray-700">
              Intellectual property (IP) is a category of property that includes intangible creations of the human mind.
              Common types include patents (inventions), trademarks (brands), copyrights (creative works), and designs
              (aesthetic features of products). IP rights encourage innovation by granting creators limited exclusive
              rights to their works, typically in exchange for public disclosure.
            </p>
          </section>

          <section id="patent-vs-trademark" className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-2">Patent vs. Trademark</h2>
            <p className="text-gray-700">
              Patents protect technical inventions (processes, machines, compositions of matter). Trademarks protect
              brand identifiers like names, logos, and slogans that distinguish goods or services. Use patents when you
              want to protect how something works; use trademarks to protect how customers recognize your brand.
            </p>
          </section>

          <section id="copyright-online" className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-2">Copyright in the Digital Age</h2>
            <p className="text-gray-700">
              Copyright automatically protects original works like software, articles, photos, and videos. Online, it
              often involves licensing, fair use, and dealing with infringement (e.g., DMCA takedowns). Consider
              attaching explicit licenses and using monitoring tools if content protection is a priority.
            </p>
          </section>

          <section id="filing-patent" className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-2">Filing a Patent: A Simple Roadmap</h2>
            <p className="text-gray-700">
              Start with a prior art search, refine your invention’s novelty, prepare a detailed specification with
              claims, and consider professional drafting. File with the appropriate patent office and monitor
              prosecution (office actions, responses). Strategy and scope matter—focus claims on core value.
            </p>
          </section>

          {/* Troubleshooting / FAQ */}
          <section id="troubleshooting" className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-medium">Q: I’m testing the Vercel app. On one PC (Windows 11 + Chrome) I log in and my user name is displayed; tab out and back in and everything is fine. On macOS + Chrome, tab out and back in causes the user name to disappear. Is this a Chrome setting on macOS?</p>
                <p className="mt-2">A: It’s not a Chrome setting. macOS Chrome can briefly report no session right after a tab-in or page restore. We adjusted the app to preserve your signed‑in header during that short window and rehydrate the name on focus/pageshow. If you still momentarily don’t see the name, wait a second or reopen the menu—the state will refresh. Sign Out remains available when truly signed in.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
