import type { Metadata, Viewport } from "next";
import React from 'react'
import Link from 'next/link'
import Navbar from "@/components/Navbar"; // navbar component
import RefreshAppButton from "@/components/RefreshAppButton";
import AutoLogout from '@/components/AutoLogout'
import PointerEventsReset from "@/components/PointerEventsReset";
import OverlayInspector from "@/components/OverlayInspector";
import FocusProvider from '@/components/FocusProvider'
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";
import { Inter } from 'next/font/google'

// Configure the font with proper optimization - reduced preload to avoid unused warning
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Disable preload to avoid unused font warning
  fallback: ['system-ui', 'arial'], // Ensure immediate text rendering
  variable: '--font-inter'
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IP Protection India | Patent, Trademark & Copyright Services",
    template: "%s | IP Protection India",
  },
  description: "Expert patent filing, trademark registration, copyright protection, and design filing services in India. Affordable IP solutions for startups, MSMEs, and enterprises. Professional guidance from search to grant.",
  keywords: [
    "patent filing india",
    "trademark registration india",
    "copyright registration",
    "design filing",
    "intellectual property services",
    "patent drafting",
    "trademark search",
    "IP protection",
    "patent attorney india",
    "trademark attorney",
    "startup ip services",
    "msme patent filing",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "IP Protection India | Patent, Trademark & Copyright Services",
    description: "Expert patent filing, trademark registration, copyright protection, and design filing services in India. Affordable IP solutions for startups, MSMEs, and enterprises.",
    siteName: "IP Protection India",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Protection India | Patent, Trademark & Copyright Services",
    description: "Expert patent filing, trademark registration, copyright protection, and design filing services in India. Professional IP solutions for innovators and brands.",
    creator: "@ip_protection_india",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="google-site-verification" content="Ch7rOvvSFu6vmASxSecCat0uH6Ya8OWQZddSC4Q0S5c" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "IP Protection India",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description: "Professional patent, trademark, copyright, and design filing services in India",
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN"
              },
              sameAs: [
                "https://twitter.com/ip_protection_india"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "IP Protection India",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}/knowledge-hub?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <Navbar />
        <AutoLogout />
        <PointerEventsReset />
        <OverlayInspector />

        <a href="#page-heading" className="sr-only focus:not-sr-only" style={{position:'absolute',left:0,top:0,zIndex:1000}}>
          Skip to content
        </a>

        { /* Removed legacy sub-navigation (Main / Orders) below brand header */ }

        <FocusProvider>
          <main role="main" style={{minHeight:'60vh',padding:0}}>
            {children}
          </main>
        </FocusProvider>

        <RefreshAppButton />
        <footer style={{padding:12,borderTop:'1px solid #eee',marginTop:20}}>
          <small>IP Protection India</small>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
