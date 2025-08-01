import { Scale, Shield, Copyright, Palette, Award, Clock } from "lucide-react"
import type { Service } from "@/types"

export const patentServices: Service[] = [
  {
    title: "Patent Search & Analysis",
    description: "Comprehensive prior art search and patentability analysis",
    icon: <Scale className="h-8 w-8 text-blue-600" />,
  },
  {
    title: "Patent Application Filing",
    description: "Professional patent application preparation and filing",
    icon: <Shield className="h-8 w-8 text-blue-600" />,
  },
  {
    title: "Patent Portfolio Management",
    description: "Strategic management of your patent portfolio",
    icon: <Award className="h-8 w-8 text-blue-600" />,
  },
]

export const trademarkServices: Service[] = [
  {
    title: "Trademark Search",
    description: "Comprehensive trademark availability search",
    icon: <Scale className="h-8 w-8 text-green-600" />,
  },
  {
    title: "Trademark Registration",
    description: "Complete trademark application and registration process",
    icon: <Shield className="h-8 w-8 text-green-600" />,
  },
  {
    title: "Trademark Monitoring",
    description: "Ongoing monitoring and protection services",
    icon: <Clock className="h-8 w-8 text-green-600" />,
  },
]

export const copyrightServices: Service[] = [
  {
    title: "Copyright Registration",
    description: "Secure copyright protection for your creative works",
    icon: <Copyright className="h-8 w-8 text-purple-600" />,
  },
  {
    title: "DMCA Services",
    description: "Digital Millennium Copyright Act compliance and enforcement",
    icon: <Shield className="h-8 w-8 text-purple-600" />,
  },
  {
    title: "Copyright Licensing",
    description: "Strategic licensing agreements for your copyrighted works",
    icon: <Award className="h-8 w-8 text-purple-600" />,
  },
]

export const designServices: Service[] = [
  {
    title: "Design Registration",
    description: "Protect your unique designs and visual elements",
    icon: <Palette className="h-8 w-8 text-orange-600" />,
  },
  {
    title: "Design Search",
    description: "Comprehensive design prior art search services",
    icon: <Scale className="h-8 w-8 text-orange-600" />,
  },
  {
    title: "Design Portfolio",
    description: "Strategic design portfolio development and management",
    icon: <Award className="h-8 w-8 text-orange-600" />,
  },
]
