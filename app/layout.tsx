import type { Metadata } from "next";
import Navbar from "@/components/Navbar"; // ✅ import your Navbar
import "./globals.css"; // ✅ make sure Tailwind or CSS is applied

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
      <body>
        {/* ✅ Navbar appears on every page */}
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}