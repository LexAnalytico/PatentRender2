import type { Service } from "@/types"

export const patentServices: Omit<Service, "icon">[] = [
  {
    title: "Patent Search & Analysis",
    description: "Comprehensive prior art search and patentability analysis",
  },
  {
    title: "Patent Application Filing",
    description: "Professional patent application preparation and filing",
  },
  {
    title: "Patent Portfolio Management",
    description: "Strategic management of your patent portfolio",
  },
]

export const trademarkServices: Omit<Service, "icon">[] = [
  {
    title: "Trademark Search",
    description: "Comprehensive trademark availability search",
  },
  {
    title: "Trademark Registration",
    description: "Complete trademark application and registration process",
  },
  {
    title: "Trademark Monitoring",
    description: "Ongoing monitoring and protection services",
  },
]

export const copyrightServices: Omit<Service, "icon">[] = [
  {
    title: "Copyright Registration",
    description: "Secure copyright protection for your creative works",
  },
  {
    title: "DMCA Services",
    description: "Digital Millennium Copyright Act compliance and enforcement",
  },
  {
    title: "Copyright Licensing",
    description: "Strategic licensing agreements for your copyrighted works",
  },
]

export const designServices: Omit<Service, "icon">[] = [
  {
    title: "Design Registration",
    description: "Protect your unique designs and visual elements",
  },
  {
    title: "Design Search",
    description: "Comprehensive design prior art search services",
  },
  {
    title: "Design Portfolio",
    description: "Strategic design portfolio development and management",
  },
]
