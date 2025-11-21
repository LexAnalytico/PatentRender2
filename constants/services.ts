import type { Service } from "@/types"

export const patentServices: Omit<Service, "icon">[] = [
  {
    title: "Patentability Search",
    description: "Comprehensive prior art search and patentability analysis",
  },
  {
    title: "Drafting",
    description: "Patent drafting is the process of preparing a detailed and legally sound document that defines the invention in clear and precise terms. It includes describing technical features, crafting strategic claims, and ensuring compliance with patent office requirements. A well-drafted patent forms the foundation of strong IP protection. Our experts create high-quality drafts, balancing legal strength and technical depth to safeguard innovation, maximize enforceability, and support future licensing or commercialization opportunities.",
  },
  {
    title: "Patent Application Filing",
    description: "Patent application filing is the formal submission of your drafted patent to the respective patent office for examination and protection. It requires compliance with procedural, legal, and technical standards specific to each jurisdiction. Our team manages complete filing logistics, documentation, and formality checks while ensuring deadlines and requirements are met, streamlining your path to patent grant and global protection.",
  },
    {
    title: "First Examination Response",
    description: "A first examination response addresses the patent examiner's objections or rejections raised during examination. It involves detailed technical and legal reasoning to clarify, amend, or defend claims. Our professionals prepare strong, well-reasoned responses that align with patent laws and protect your invention's scope. We aim to resolve objections effectively and move your application toward successful grant.",
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
    title: "Design Filing",
    description: "Complete design registration filing to protect your unique product designs and visual elements with strategic compliance across jurisdictions",
  },
  {
    title: "Response to FER",
    description: "Expert responses to First Examination Reports for design applications, addressing examiner objections with technical and legal precision",
  },
  {
    title: "Hearing",
    description: "Professional representation at design application hearings, presenting evidence and arguments to support your registration",
  },
  {
    title: "Cancellation",
    description: "Strategic cancellation proceedings to challenge or defend design registrations, protecting your design rights and market position",
  },
]
