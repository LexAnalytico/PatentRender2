import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar"; // ✅ import your Navbar
import RefreshAppButton from "@/components/RefreshAppButton";
import AutoLogout from '@/components/AutoLogout'
import PointerEventsReset from "@/components/PointerEventsReset";
import OverlayInspector from "@/components/OverlayInspector";
import "./globals.css"; // ✅ make sure Tailwind or CSS is applied
import { GeistSans } from "geist/font/sans"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
};

// Ensure proper mobile scaling and safe-area support
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={GeistSans.className}>
        {/* ✅ Navbar appears on every page */}
        <Navbar />
        <AutoLogout />
        {/* Safety: clear any stuck body.pointerEvents after focus/visibility toggles */}
        <PointerEventsReset />
  {/* Debug-only: logs elementsFromPoint and highlights click target when enabled via flag */}
  <OverlayInspector />
        <main>{children}</main>
        <RefreshAppButton />
      </body>
    </html>
  );
}