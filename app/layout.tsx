import type { Metadata, Viewport } from "next";
import React from 'react'
import Link from 'next/link'
import Navbar from "@/components/Navbar"; // navbar component
import RefreshAppButton from "@/components/RefreshAppButton";
import AutoLogout from '@/components/AutoLogout'
import PointerEventsReset from "@/components/PointerEventsReset";
import OverlayInspector from "@/components/OverlayInspector";
import FocusProvider from '@/components/FocusProvider'
import "./globals.css";
import { GeistSans } from "geist/font/sans"

export const metadata: Metadata = {
  title: "PatentRender2",
  description: "PatentRender2 app",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={GeistSans.className}>
        <Navbar />
        <AutoLogout />
        <PointerEventsReset />
        <OverlayInspector />

        <a href="#page-heading" className="sr-only focus:not-sr-only" style={{position:'absolute',left:0,top:0,zIndex:1000}}>
          Skip to content
        </a>

        <header style={{padding:12,borderBottom:'1px solid #eee'}}>
          <nav>
            <Link href="/" style={{marginRight:12}}>Main</Link>
            <Link href="/orders">Orders</Link>
          </nav>
        </header>

        <FocusProvider>
          <main role="main" style={{minHeight:'60vh',padding:20}}>
            {children}
          </main>
        </FocusProvider>

        <RefreshAppButton />
        <footer style={{padding:12,borderTop:'1px solid #eee',marginTop:20}}>
          <small>PatentRender2</small>
        </footer>
      </body>
    </html>
  )
}
