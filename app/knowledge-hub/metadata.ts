import { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com"

export const metadata: Metadata = {
  title: "Knowledge Hub - IP Education & Resources",
  description: "Learn about patents, trademarks, copyrights, and design registration. Comprehensive guides, FAQs, and resources for intellectual property protection in India.",
  keywords: [
    "patent guide",
    "trademark guide",
    "copyright guide",
    "IP education",
    "intellectual property FAQ",
    "patent vs trademark",
    "how to file patent",
    "trademark registration process"
  ],
  openGraph: {
    title: "Knowledge Hub - IP Education & Resources | IP Protection India",
    description: "Learn about patents, trademarks, copyrights, and design registration. Comprehensive guides and FAQs for intellectual property protection.",
    url: `${siteUrl}/knowledge-hub`,
  },
  alternates: {
    canonical: `${siteUrl}/knowledge-hub`,
  }
}
