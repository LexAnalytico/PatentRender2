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
  "Design Registration": 450,
  "Design Search": 250,
  "Design Portfolio": 750,
}

export const bannerSlides: BannerSlide[] = [
  {
    title: "Protect Your Intellectual Property",
    description:
      "Comprehensive IP services to safeguard your innovations and creative works with expert legal guidance",
    image: "/placeholder.svg?height=400&width=600&text=IP+Protection+Services",
  },
  {
    title: "Patent Registration Made Simple",
    description: "Expert guidance through the complex patent application process with guaranteed results",
    image: "/placeholder.svg?height=400&width=600&text=Patent+Application+Filing",
  },
  {
    title: "Trademark Your Brand Identity",
    description: "Secure your brand with professional trademark services and comprehensive protection strategies",
    image: "/placeholder.svg?height=400&width=600&text=Trademark+Registration",
  },
  {
    title: "Copyright Protection Services",
    description: "Protect your creative works with comprehensive copyright solutions and enforcement support",
    image: "/placeholder.svg?height=400&width=600&text=Copyright+Protection",
  },
]

export const milestones: Milestone[] = [
  { label: "Patents Filed", value: 2500, key: "patents" },
  { label: "Trademarks Registered", value: 1800, key: "trademarks" },
  { label: "Copyrights Protected", value: 3200, key: "copyrights" },
  { label: "Happy Clients", value: 950, key: "clients" },
]
