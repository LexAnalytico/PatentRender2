import type { BannerSlide, Milestone } from "@/types"

export const servicePricing = {
  "Patent Search & Analysis": 500,
  "Patent Application Filing": 2500,
  "Patent Portfolio Management": 1500,
  "Trademark Search": 300,
  "Trademark Registration": 800,
  "Trademark Monitoring": 400,
  "Copyright Registration": 200,
  "DMCA Services": 350,
  "Copyright Licensing": 600,
  "Design Filing": 11000,
  "Response to FER": 5000,
  "Hearing": 5000,
  "Cancellation": 16500,
}

export const bannerSlides: BannerSlide[] = [
  // Reordered per request:
  // 1) Protect Your Intellectual Property
  // 2) Patent Registration Made Simple
  // 3) Trademark Your Brand Identity
  // 4) Design Protection (new)
  // 5) Copyright Protection Services
  {
    title: "Protect Your Intellectual Property",
    description:
      "Comprehensive IP services to safeguard your innovations and creative works with expert legal guidance",
  image: "/banners/a.jpg",
  },
  {
    title: "Patent Registration Made Simple",
    description: "Expert guidance through the complex patent application process with guaranteed results",
  image: "/banners/b.jpg",
  },
  {
    title: "Trademark Your Brand Identity",
    description: "Secure your brand with professional trademark services and comprehensive protection strategies",
  image: "/banners/c.jpg",
  },
  // Newly added design slide (format identical to others)
  {
    title: "Design Protection & Registration",
    description: "Protect your unique product designs with expert registration, compliance, and enforcement support across jurisdictions",
  image: "/banners/d.jpg",
  },
  {
    title: "Copyright Protection Services",
    description: "Protect your creative works with comprehensive copyright solutions and enforcement support",
  image: "/banners/e.jpg",
  },
]

export const milestones: Milestone[] = [
  { label: "Patents Filed", value: 2500, key: "patents" },
  { label: "Trademarks Registered", value: 1800, key: "trademarks" },
  { label: "Copyrights Protected", value: 3200, key: "copyrights" },
  { label: "Happy Clients", value: 950, key: "clients" },
]
