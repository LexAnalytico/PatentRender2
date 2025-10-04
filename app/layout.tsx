import type { Metadata } from "next";
import Navbar from "@/components/Navbar"; // ✅ import your Navbar
import RefreshAppButton from "@/components/RefreshAppButton";
import AutoLogout from '@/components/AutoLogout'
import "./globals.css"; // ✅ make sure Tailwind or CSS is applied
import { GeistSans } from "geist/font/sans"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
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
        <main>{children}</main>
        <RefreshAppButton />
      </body>
    </html>
  );
}