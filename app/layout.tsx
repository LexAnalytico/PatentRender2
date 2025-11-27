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
    default: "IP Protection India",
    template: "%s | IP Protection India",
  },
  description: "Affordable patent, trademark, and IP services in India.",
  keywords: [
    "patent",
    "trademark",
    "intellectual property",
    "IP services",
    "India",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "IP Protection India",
    description: "Affordable patent, trademark, and IP services in India.",
    siteName: "IP Protection India",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Protection India",
    description: "Affordable patent, trademark, and IP services in India.",
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
      <head />
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
