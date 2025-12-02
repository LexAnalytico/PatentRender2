import { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com"

export const metadata: Metadata = {
  title: "Knowledge Hub - IP Education & Resources | IP Protection India",
  description: "Learn about patents, trademarks, copyrights, and design registration. Comprehensive guides on patent filing, trademark registration in Bangalore, costs, and IP comparisons for Indian startups.",
  keywords: [
    "patent guide india",
    "trademark guide bangalore",
    "how to file patent in india 2025",
    "patent filing cost for startups",
    "trademark registration bangalore",
    "patent vs trademark difference",
    "IP education india",
    "intellectual property FAQ",
    "patent filing process india",
    "trademark registration process",
    "patent attorney bangalore",
    "trademark lawyer bellandur",
    "IP protection india"
  ],
  openGraph: {
    title: "Knowledge Hub - IP Education & Resources | IP Protection India",
    description: "Complete guides on patent filing in India, trademark registration in Bangalore, IP costs, and expert comparisons. Updated for 2025.",
    url: `${siteUrl}/knowledge-hub`,
  },
  alternates: {
    canonical: `${siteUrl}/knowledge-hub`,
  }
}
