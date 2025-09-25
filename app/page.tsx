"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from '../lib/supabase';
import { fetchServicePricingRules, computePriceFromRules } from "@/utils/pricing";
import AuthModal from "@/components/AuthModal"; // Adjust path
import { Footer } from "@/components/layout/Footer"
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { PaymentProcessingModal } from "@/components/PaymentProcessingModal";


const services = [
  "Patentability Search",
  "Drafting",
  "Patent Application Filing",
  "First Examination Response",
  "Trademark Registration",
  "Trademark Monitoring",
  "Copyright Registration",
  "DMCA Services",
  "Copyright Licensing",
  "Design Registration",
  "Design Search",
  "Design Portfolio",
]

import {
  ChevronLeft,
  ChevronRight,
  Scale,
  Shield,
  Copyright,
  Palette,
  Award,
  Clock,
  ShoppingCart,
  Download,
  ArrowLeft,
  Calculator,
  FileText,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
} from "lucide-react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import type { Session } from "@supabase/supabase-js"

export default function LegalIPWebsite() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const [currentSlide, setCurrentSlide] = useState(0)
  const [counters, setCounters] = useState({
    patents: 0,
    trademarks: 0,
    copyrights: 0,
    clients: 0,
  })

  const [cartItems, setCartItems] = useState<
    Array<{
      id: string
      name: string
      price: number
      category: string
      details?: string
    }>
  >([])
   
  const [showQuotePage, setShowQuotePage] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showOptionsPanel, setShowOptionsPanel] = useState(false)
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string | null>(null)
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null)
  const [optionsForm, setOptionsForm] = useState({
    applicantTypes: [] as string[],
    niceClasses: [] as string[],
    goodsServices: "",
    goodsServicesCustom: "",
    useType: "",
    firstUseDate: "",
    proofFileNames: [] as string[],
    searchType: "",
  })

  // Keep Logout button state in sync with Supabase session
  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error getting session:", error)
        return
      }
      if (active) setIsAuthenticated(!!data.session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsAuthenticated(!!session)
    })

    return () => {
      active = false
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])
  const [activeServiceTab, setActiveServiceTab] = useState("patent") // State for active tab
  const [session, setSession] = useState<Session | null>(null);  
  const [userEmail, setUserEmail] = useState<string | null>(null);  
 
  // Auth form state
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
  })

  // Calculator state
  const [calculatorFields, setCalculatorFields] = useState({
    urgency: "standard",
    complexity: "medium",
    additionalServices: false,
    consultationHours: 1,
    // Remove: discount: 0,
  })

  // Service-specific fields state
  const [serviceFields, setServiceFields] = useState({
    // Patent fields
    patentField1: "",
    patentField2: "",
    patentField3: "",
    patentField4: "",
    patentField5: "",

    // Trademark fields
    trademarkField1: "",
    trademarkField2: "",
    trademarkField3: "",
    trademarkField4: "",
    trademarkField5: "",

    // Copyright fields
    copyrightField1: "",
    copyrightField2: "",
    copyrightField3: "",
    copyrightField4: "",
    copyrightField5: "",

    // Design fields
    designField1: "",
    designField2: "",
    designField3: "",
    designField4: "",
    designField5: "",
  })


const services = [
  "Patentability Search",
  "Drafting",
  "Patent Application Filing",
  "First Examination Response",
  "Trademark Registration",
  "Trademark Monitoring",
  "Copyright Registration",
  "DMCA Services",
  "Copyright Licensing",
  "Design Registration",
  "Design Search",
  "Design Portfolio",
]

  const [servicePricing, setServicePricing] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  // Checkout Thank You modal (immediate) to open forms right after payment
  const [showCheckoutThankYou, setShowCheckoutThankYou] = useState(false)
  const [checkoutPayment, setCheckoutPayment] = useState<any | null>(null)
  const [checkoutOrders, setCheckoutOrders] = useState<any[]>([])

  // Map an order-like object to a canonical form type using the same logic as profile
  const resolveFormTypeFromOrderLike = (o: any): string => {
    if (!o) return 'patentability_search'
    // Prefer explicit type
    let t: string | null = o.type ?? null
    // If we only have a pricing key, leave as-is (forms page maps it)
    if (!t && o.service_pricing_key) t = String(o.service_pricing_key)
    // Derive from service name fallback
    if (!t && o.services && (o.services as any).name) {
      const svcName = String((o.services as any).name)
      const map: Record<string, string> = {
        'Patentability Search': 'patentability_search',
        'Drafting': 'drafting',
        'Patent Application Filing': 'provisional_filing',
        'First Examination Response': 'fer_response',
      }
      t = map[svcName] ?? null
    }
    return t || 'patentability_search'
  }

  // Fallback mapping if services table lookup by name is unavailable
  const serviceIdByName: Record<string, number> = {
    "Patentability Search": 1,
    "Drafting": 2,
    "Patent Application Filing": 3,
    "First Examination Response": 4,
  }

 
useEffect(() => {
    async function fetchPricing() {
      const { data, error } = await supabase
        .from('patentrender')
        .select(
          'patent_search, patent_application, patent_portfolio, first_examination, trademark_search, trademark_registration, trademark_monitoring, copyright_registration, dmca_services, copyright_licensing, design_registration, design_search, design_portfolio'
        )
        .maybeSingle();
           
      if (error) {
        console.error("Error fetching pricing:", error)
      } else if (data) {
        const formattedPricing: Record<string, number> = {
          "Patentability Search": data.patent_search,
          "Drafting": data.patent_application,
          "Patent Application Filing": data.patent_portfolio,
          "First Examination Response": data.first_examination,  
          "Trademark Search": data.trademark_search,
          "Trademark Registration": data.trademark_registration,
          "Trademark Monitoring": data.trademark_monitoring,
          "Copyright Registration": data.copyright_registration,
          "DMCA Services": data.dmca_services,
          "Copyright Licensing": data.copyright_licensing,
          "Design Registration": data.design_registration,
          "Design Search": data.design_search,
          "Design Portfolio": data.design_portfolio,
        }
        setServicePricing(formattedPricing)
      } else {
        console.log("No pricing data found in the database. Please add a row to the 'patentrender' table.")
      }

      setLoading(false)
    }

    fetchPricing()
       
  }, [])


  const defaultBannerSlides = [
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
  const [bannerSlides, setBannerSlides] = useState(defaultBannerSlides)

  useEffect(() => {
    let cancelled = false
    const loadBanners = async () => {
      try {
        const res = await fetch('/api/banner-images', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const images: Array<{ url: string; filename: string }> = Array.isArray(json.images) ? json.images : []
        if (!cancelled) {
          // Keep original titles/descriptions; only replace the images for the first N slides
          const slides = defaultBannerSlides.map((s) => ({ ...s }))
          const n = Math.min(images.length, slides.length)
          for (let i = 0; i < n; i++) {
            slides[i].image = images[i].url
          }
          setBannerSlides(slides as any)
          setCurrentSlide(0)
        }
      } catch {}
    }
    loadBanners()
    return () => { cancelled = true }
  }, [])

const patentServices = [
    {
      title: "Patentability Search",
      description: "Comprehensive prior art search and patentability analysis",
      icon: <Scale className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Drafting",
      description: "Professional patent application preparation and filing",
      icon: <Shield className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Patent Application Filing",
      description: "Strategic management of your patent portfolio",
      icon: <Award className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "First Examination Response",
      description: "desctiption tbd",
      icon: <Award className="h-8 w-8 text-blue-600" />,
    },  
  ]

  const trademarkServices = [
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

  const copyrightServices = [
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

  const designServices = [
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

  const milestones = [
    { label: "Patents Filed", value: 2500, key: "patents" },
    { label: "Trademarks Registered", value: 1800, key: "trademarks" },
    { label: "Copyrights Protected", value: 3200, key: "copyrights" },
    { label: "Happy Clients", value: 950, key: "clients" },
  ]

  const reviews = [
    {
      quote: "LegalIP Pro streamlined our filing and kept us informed at every step. Outstanding experience.",
      name: "Anita S.",
      role: "Founder, HealthTech Co.",
      rating: 5,
    },
    {
      quote: "Clear guidance and timely updates helped us avoid costly delays. Highly recommended.",
      name: "Rahul M.",
      role: "CTO, IoT Startup",
      rating: 5,
    },
    {
      quote: "Excellent trademark strategy with practical advice we could implement quickly.",
      name: "Priya K.",
      role: "Brand Manager, D2C",
      rating: 4,
    },
  ]
  const [reviewIndex, setReviewIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(1, bannerSlides.length))
    }, 5000)
    return () => clearInterval(interval)
  }, [bannerSlides.length])
  useEffect(() => {
    const id = setInterval(() => setReviewIndex((i) => (i + 1) % reviews.length), 4000)
    return () => clearInterval(id)
  }, [reviews.length])

  useEffect(() => {
    const animateCounters = () => {
      milestones.forEach((milestone) => {
        let current = 0
        const increment = milestone.value / 100
        const timer = setInterval(() => {
          current += increment
          if (current >= milestone.value) {
            current = milestone.value
            clearInterval(timer)
          }
          setCounters((prev) => ({
            ...prev,
            [milestone.key]: Math.floor(current),
          }))
        }, 20)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 },
    )

    const counterSection = document.getElementById("milestones")
    if (counterSection) {
      observer.observe(counterSection)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }

  const addToCart = (serviceName: string, category: string) => {
    const price = servicePricing[serviceName as keyof typeof servicePricing] || 0
    const newItem = {
      id: `${serviceName}-${Date.now()}`,
  name: serviceName,
  // attempt to map human-readable service name to numeric service_id
  service_id: serviceIdByName[serviceName as keyof typeof serviceIdByName] ?? null,
      price,
      category,
    }
  console.debug('addToCart - newItem', newItem)
    setCartItems((prev) => [...prev, newItem])
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0)
  }

  const clearCart = () => {
    setCartItems([])
  }

  // Options panel helpers
  const openOptionsForService = (serviceName: string, category: string) => {
    setSelectedServiceTitle(serviceName)
    setSelectedServiceCategory(category)
    setShowOptionsPanel(true)
  }

  const resetOptionsForm = () => {
    setOptionsForm({
      applicantTypes: [],
      niceClasses: [],
      goodsServices: "",
      goodsServicesCustom: "",
      useType: "",
      firstUseDate: "",
      proofFileNames: [],
      searchType: "",
    })
  }

  const closeOptionsPanel = () => {
    setShowOptionsPanel(false)
    setSelectedServiceTitle(null)
    setSelectedServiceCategory(null)
    resetOptionsForm()
  }

  // Live fee preview state and pricing rules
  const [pricingRules, setPricingRules] = useState<any[] | null>(null)
  const [preview, setPreview] = useState({ total: 0, professional: 0, government: 0 })
  const [applicantPrices, setApplicantPrices] = useState<{ individual?: number; others?: number }>({})
  const [ferPrices, setFerPrices] = useState<{
    base_fee?: number
    response_due_anytime_after_15_days?: number
    response_due_within_11_15_days?: number
    response_due_within_4_10_days?: number
  }>({})
 
  // Load pricing rules when modal opens
  useEffect(() => {
    const loadRules = async () => {
      if (!showOptionsPanel || !selectedServiceTitle) {
        setPricingRules(null)
        return
      }
      let serviceId: number | null = null
      const { data: svc, error: svcErr } = await supabase
        .from("services")
        .select("id")
        .eq("name", selectedServiceTitle)
        .maybeSingle()
      if (!svcErr && svc?.id) serviceId = svc.id
      else {
        const mapped = serviceIdByName[selectedServiceTitle as keyof typeof serviceIdByName]
        serviceId = typeof mapped === "number" ? mapped : null
      }
      if (serviceId == null) {
        setPricingRules(null)
        return
      }
      try {
        const rules = await fetchServicePricingRules(serviceId)
        // Debug: log rules meta when loading
        console.log("[Rules] Loaded", {
          service: selectedServiceTitle,
          serviceId,
          count: Array.isArray(rules) ? rules.length : 0,
          appTypes: Array.isArray(rules) ? Array.from(new Set(rules.map((r: any) => r.application_type))) : [],
          sampleKeys: Array.isArray(rules) ? Array.from(new Set(rules.slice(0, 12).map((r: any) => r.key))) : [],
        })
        setPricingRules(rules as any)
      } catch (e) {
        console.error("Failed to load pricing rules:", e)
        setPricingRules(null)
      }
    }
    loadRules()
  }, [showOptionsPanel, selectedServiceTitle])

  // Recompute fee preview when selections change
  useEffect(() => {
    if (!pricingRules || !selectedServiceTitle) {
      setPreview({ total: 0, professional: 0, government: 0 })
      return
    }
    let applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"

    if (selectedServiceTitle === "Patent Application Filing" && (optionsForm.searchType === "individual" || optionsForm.searchType === "others")) {
      applicationType = optionsForm.searchType as any
    }

    const sel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: {
        dropdown: optionsForm.goodsServices || undefined,
        customText: optionsForm.goodsServicesCustom || undefined,
      },
      searchType: optionsForm.searchType || undefined,
      priorUse: {
        used: optionsForm.useType === "yes",
        firstUseDate: optionsForm.firstUseDate || undefined,
        proofFiles: optionsForm.proofFileNames,
      },
      option1: true,
    } as const

    const total = computePriceFromRules(pricingRules as any, sel as any)
    const profRule = (pricingRules as any).find(
      (r: any) => r.application_type === applicationType && r.key === "professional_fee"
    )
    const professional = profRule ? Number(profRule.amount) : 0
    const government = Math.max(0, total - professional)

    // Debug: log recompute context
    console.log("[Preview] Recompute", {
      service: selectedServiceTitle,
      applicationType,
      searchType: optionsForm.searchType,
      filingType: optionsForm.goodsServices,
      niceClasses: optionsForm.niceClasses,
      priorUse: optionsForm.useType,
      totals: { total, professional, government },
    })

    setPreview({ total, professional, government })
  }, [pricingRules, optionsForm, selectedServiceTitle])

  // Compute and show prices next to Applicant Type options for Patent Application Filing
  useEffect(() => {
    if (!pricingRules || selectedServiceTitle !== "Patent Application Filing") {
      setApplicantPrices({})
      return
    }

    const filingType = optionsForm.goodsServices && optionsForm.goodsServices !== "0" ? optionsForm.goodsServices : "provisional_filing"
    const baseSel = {
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: { dropdown: filingType },
      searchType: undefined,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any

    const prices: { [k: string]: number } = {}
    try {
      prices.individual = computePriceFromRules(pricingRules as any, { ...baseSel, applicationType: "individual" })
      prices.others = computePriceFromRules(pricingRules as any, { ...baseSel, applicationType: "others" })
    } catch (e) {
      console.error("Failed computing applicant type prices:", e)
    }
    const fallback = servicePricing["Patent Application Filing"] || 0
    if (!prices.individual || prices.individual <= 0) prices.individual = fallback
    if (!prices.others || prices.others <= 0) prices.others = fallback
    setApplicantPrices(prices)
  }, [pricingRules, selectedServiceTitle, optionsForm.goodsServices, optionsForm.niceClasses, optionsForm.useType])

  // Compute and show prices for First Examination Response options
  useEffect(() => {
    if (!pricingRules || selectedServiceTitle !== "First Examination Response") {
      setFerPrices({})
      return
    }

    const applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"

    const baseSel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      searchType: undefined,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any

    const values = [
      "base_fee",
      "response_due_anytime_after_15_days",
      "response_due_within_11_15_days",
      "response_due_within_4_10_days",
    ] as const

    const prices: Record<string, number> = {}
    try {
      for (const v of values) {
        prices[v] = computePriceFromRules(pricingRules as any, { ...baseSel, searchType: v })
      }
    } catch (e) {
      console.error("Failed computing FER prices:", e)
    }
    // Fallback to base service price if computed is zero
    const fallbackFER = servicePricing["First Examination Response"] || 0
    for (const k of Object.keys(prices)) {
      if (!prices[k] || prices[k] <= 0) prices[k] = fallbackFER
    }
    setFerPrices(prices)
  }, [pricingRules, selectedServiceTitle, optionsForm.applicantTypes, optionsForm.niceClasses, optionsForm.useType])

  // Helpers for turnaround pricing display in modal
const formatINR = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
const computeTurnaroundTotal = (turn: "standard" | "expediated" | "rush") => {    
    if (!pricingRules) return 0
     
    const applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"
    const sel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: { dropdown: turn },
      searchType: optionsForm.searchType || undefined,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any
    return computePriceFromRules(pricingRules as any, sel)
  }
 
  const basePrice = computeTurnaroundTotal("standard")
  const expediatedDiff = computeTurnaroundTotal("expediated") //- basePrice
  const rushDiff = computeTurnaroundTotal("rush") //- basePrice  

 
  // Compute price for a given Patentability Search type and turnaround, independent of current selection
  const computePatentSearchPrice = (
    type: "quick" | "full_without_opinion" | "full_with_opinion",
    turn: "standard" | "expediated" | "rush" = "standard"
  ) => {
    if (!pricingRules) return 0

    const applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"

    const sel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: { dropdown: turn },
      searchType: type,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any

    return computePriceFromRules(pricingRules as any, sel)
  }

const basePricePS = computePatentSearchPrice("quick")
const DiffWithoutPS = computePatentSearchPrice("full_without_opinion") //- basePricePS
const DiffWithPS = computePatentSearchPrice("full_with_opinion") //- basePricePS  
 
  // Compute price for a given Drafting type and turnaround, independent of current selection
  const computeDraftingPrice = (
    type: "ps" | "cs" | "ps_cs",
    turn: "standard" | "expediated" | "rush" = "standard"
    ) => {
    if (!pricingRules) return 0
           
    const applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"

    const sel = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: { dropdown: turn },
      searchType: type,
      priorUse: { used: optionsForm.useType === "yes" },
      option1: true,
    } as any

    return computePriceFromRules(pricingRules as any, sel)
  }
  const basePriceD = computeDraftingPrice("ps", "standard")
  const DiffWithoutD = computeDraftingPrice("cs", "expediated") //- basePriceD
  const DiffWithD = computeDraftingPrice("ps_cs", "rush") //- basePriceD      
 
    // Compute price for a given Search turnaround, independent of current selection
  const computeSearchPrice = (
  type: "quick" | "without_opinion" | "with_opinion",
  turn: "standard" | "expediated" | "rush" = "standard"
) => {
  if (!pricingRules) return 0

  const applicationType =
    optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
      ? "individual"
      : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
      ? "startup_msme"
      : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
      ? "others"
      : "individual"

  const sel = {
    applicationType,
    niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
    goodsServices: { dropdown: turn },   // turnaround speed
    searchType: type,                    // search type passed in
    priorUse: { used: optionsForm.useType === "yes" },
    option1: true,
  } as any

  return computePriceFromRules(pricingRules as any, sel)
}
     
  const computeFilingPrice = (
  filingType: "provisional_filing" | "complete_specification_filing" | "ps_cs_filing" | "pct_filing",
  appType: "individual" | "others"
) => {
  if (!pricingRules) return 0

  const sel = {
    applicationType: appType,
    niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
    goodsServices: { dropdown: filingType },
    searchType: optionsForm.searchType || undefined,
    priorUse: { used: optionsForm.useType === "yes" },
    option1: true,
  } as any

  return computePriceFromRules(pricingRules as any, sel)
}    
   
const selectedSearchType = optionsForm.searchType as
  | "quick"
  | "without_opinion"
  | "with_opinion"

const basePriceTurn = computeSearchPrice(selectedSearchType, "standard")
const diffExpediated = computeSearchPrice(selectedSearchType, "expediated") //- basePriceTurn
const diffRush = computeSearchPrice(selectedSearchType, "rush") //- basePriceTurn


  const handleOptionsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).map((f) => f.name)
    setOptionsForm((prev) => ({ ...prev, proofFileNames: files }))
  }

  const toggleApplicantType = (label: string) => {
    setOptionsForm((prev) => {
      const set = new Set(prev.applicantTypes)
      if (set.has(label)) set.delete(label)
      else set.add(label)
      return { ...prev, applicantTypes: Array.from(set) }
    })
  }
    const addToCartWithOptions = async () => {
    if (!selectedServiceTitle || !selectedServiceCategory) return

    // Map applicant type selection to pricing application_type
    let applicationType =
      optionsForm.applicantTypes.includes("Individual / Sole Proprietor")
        ? "individual"
        : optionsForm.applicantTypes.includes("Startup / Small Enterprise")
        ? "startup_msme"
        : optionsForm.applicantTypes.includes("Others (Company, Partnership, LLP, Trust, etc.)")
        ? "others"
        : "individual"
         

    // For Patent Application Filing, the Applicant Type select is stored in searchType.
    // If present, override the derived value so we price against the intended application type.
    if (
      selectedServiceTitle === "Patent Application Filing" &&
      (optionsForm.searchType === "individual" || optionsForm.searchType === "others")
    ) {
      applicationType = optionsForm.searchType as any
    }
   
    // If no turnaround selected, default to 'standard' for pricing
    const selectedTurnaround = optionsForm.goodsServices && optionsForm.goodsServices !== "0"
      ? optionsForm.goodsServices
      : "standard";

    const selectedOptions = {
      applicationType,
      niceClasses: optionsForm.niceClasses.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      goodsServices: {
        dropdown: selectedTurnaround,
        customText: optionsForm.goodsServicesCustom || undefined,
      },
      searchType: optionsForm.searchType || undefined,
      priorUse: {
        used: optionsForm.useType === "yes",
        firstUseDate: optionsForm.firstUseDate || undefined,
        proofFiles: optionsForm.proofFileNames,
      },
      // Include Option1 row by default per provided pricing table
      option1: true,
    } as const
       
    // Always compute price from DB rules using selected options
    const basePrice = servicePricing[selectedServiceTitle as keyof typeof servicePricing] || 0
    const { data: svc, error: svcErr } = await supabase
      .from("services")
      .select("id")
      .eq("name", selectedServiceTitle)
      .maybeSingle()

    let serviceId: number | null = null
    if (!svcErr && svc?.id) {
      serviceId = svc.id
    } else {
      const mapped = serviceIdByName[selectedServiceTitle as keyof typeof serviceIdByName]
      serviceId = typeof mapped === "number" ? mapped : null
    }

    let price = 0
    if (serviceId != null) {
      try {
        const rules = await fetchServicePricingRules(serviceId)
        if (rules && rules.length > 0) {
          price = computePriceFromRules(rules, selectedOptions as any)
        } else {
          // Fallback to base pricing table if no rules exist
          price = basePrice
        }
      } catch (e) {
        console.error("Pricing rules fetch/compute failed:", e)
        price = basePrice
      }
    } else {
      price = basePrice
    }
           
    // Debug: log add-to-cart computation context
    console.log("[Cart] Add with options", {
      service: selectedServiceTitle,
      serviceId,
      applicationType,
      searchType: optionsForm.searchType,
      filingType: selectedTurnaround,
      computedPrice: price,
    })

    // Determine the pricing key that corresponds to the selected options
    // This will be used as the type for the order/payment
    let pricingKey: string | null = null
   
    if (selectedServiceTitle === "Patentability Search") {
      const st = optionsForm.searchType
      const t = selectedTurnaround
     
      if (st === "full_without_opinion" && t) {
        pricingKey = `full_without_opinion_${t}`
      } else if (st === "full_with_opinion" && t) {
        pricingKey = `full_with_opinion_${t}`
      } else if (st === "quick" && t) {
        pricingKey = `turnaround_${t}`
      }
    } else if (selectedServiceTitle === "Drafting") {
      const st = optionsForm.searchType // ps, cs, ps_cs
      const t = selectedTurnaround
     
      if ((st === "ps" || st === "cs" || st === "ps_cs") && t) {
        const base = st === "ps" ? "provisional_specification" : st === "cs" ? "complete_specification" : "ps_cs"
        pricingKey = `${base}_${t}`
      }
    } else if (selectedServiceTitle === "Patent Application Filing") {
      // For filing, the turnaround dropdown contains direct keys
      const filingKeys = new Set([
        "provisional_filing",
        "complete_specification_filing",
        "ps_cs_filing",
        "pct_filing",
      ])
      if (selectedTurnaround && filingKeys.has(selectedTurnaround)) {
        pricingKey = selectedTurnaround
      }
    } else if (selectedServiceTitle === "First Examination Response") {
      // For FER, the searchType contains direct keys
      const ferKeys = new Set([
        "base_fee",
        "response_due_anytime_after_15_days",
        "response_due_within_11_15_days",
        "response_due_within_4_10_days",
      ])
      if (optionsForm.searchType && ferKeys.has(optionsForm.searchType)) {
        pricingKey = optionsForm.searchType
      }
    }
   
    console.log("[Cart] Determined pricing key:", pricingKey)
   
    // Store the pricing key in localStorage so checkout can use it
    if (pricingKey) {
      try {
        localStorage.setItem('selected_pricing_key', pricingKey)
      } catch (e) {
        console.warn('Failed to store pricing key in localStorage:', e)
      }
    }

    const prettySearchTypeMap = {
      // Patentability Search types
      quick: "Quick Knockout Search",
      full_without_opinion: "Full Patentability Search (No Opinion)",
      full_with_opinion: "Full Patentability Search (With Opinion)",
      // Drafting types
      ps: "Provisional Specification (PS)",
      cs: "Complete Specification (CS)",
      ps_cs: "PS-CS",
    } as const

    // Turnaround labels differ for Drafting vs. Patentability Search
    const prettyTurnaroundMap =
      selectedServiceTitle === "Drafting"
        ? {
            standard: "Standard (12-15 days)",
            expediated: "Expediated (8-10 Days)",
            rush: "Rush (5-7 days)",
          }
        : {
            standard: "Standard (7-10 days)",
            expediated: "Expediated (3-5 Days)",
            rush: "Rush (1-2 days)",
          }

    const goods = optionsForm.goodsServicesCustom || optionsForm.goodsServices
    const searchTypeLabel = optionsForm.searchType
      ? (prettySearchTypeMap as any)[optionsForm.searchType] ?? optionsForm.searchType
      : "N/A"
    const turnaroundLabel = selectedTurnaround
      ? (prettyTurnaroundMap as any)[selectedTurnaround] ?? selectedTurnaround
      : "N/A"

    const detailsLabel = selectedServiceTitle === "Drafting" ? "Type" : "Search"
    const details = `${detailsLabel}: ${searchTypeLabel}; Turnaround: ${turnaroundLabel}`

  const newItem = {
      id: `${selectedServiceTitle}-${Date.now()}`,
      name: selectedServiceTitle,
  service_id: serviceIdByName[selectedServiceTitle as keyof typeof serviceIdByName] ?? null,
      price,
      category: selectedServiceCategory,
      details,
    }
  console.debug('options-panel add - newItem', newItem)
    setCartItems((prev) => [...prev, newItem])
    closeOptionsPanel()
  }

  const calculateAdjustedTotal = () => {
    let baseTotal = getTotalPrice()

    // Urgency multiplier
    const urgencyMultipliers = {
      standard: 1,
      urgent: 1.25,
      rush: 1.5,
    }

    // Complexity multiplier
    const complexityMultipliers = {
      simple: 0.9,
      medium: 1,
      complex: 1.3,
    }

    baseTotal *= urgencyMultipliers[calculatorFields.urgency as keyof typeof urgencyMultipliers]
    baseTotal *= complexityMultipliers[calculatorFields.complexity as keyof typeof complexityMultipliers]

    // Additional services
    if (calculatorFields.additionalServices) {
      baseTotal += 500
    }

    // Consultation hours
    baseTotal += (calculatorFields.consultationHours - 1) * 150

    // Remove discount calculation
    // baseTotal -= (baseTotal * calculatorFields.discount) / 100

    return Math.max(0, baseTotal)
  }

  const goToQuotePage = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      setShowQuotePage(true)
    }
  }

  const backToMainPage = () => {
    setShowQuotePage(false)
  }
//Google login
  async function upsertUserProfileFromSession() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return

  const u = data.user
  // Supabase Google OAuth provides user_metadata; common fields:
  // - full_name, name, given_name, family_name, avatar_url, picture
  const fullName = (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || ""
  const given = (u.user_metadata?.given_name as string) || ""
  const family = (u.user_metadata?.family_name as string) || ""

  // Derive first/last if not provided
  let firstName = given
  let lastName = family
  if (!firstName && !lastName && fullName) {
    const parts = fullName.split(" ")
    firstName = parts[0] || ""
    lastName = parts.slice(1).join(" ") || ""
  }

  // Upsert by id or email; using id is safest as it’s stable
  const { error: profileError } = await supabase.from("users").upsert(
    [{
      id: u.id,                  // UUID from auth.users
      email: u.email || null,
      first_name: firstName || null,
      last_name: lastName || null,
      company: null,             // unknown from Google; keep null or set later in profile form
      // add any defaults your schema needs
    }],
    { onConflict: "id" }         // or "email" if that’s your constraint
  )

  if (profileError) {
    console.error("[auth] upsert profile failed:", profileError.message)
  }
}

// In your component:
useEffect(() => {
  // Upsert on initial page load if already signed in
  upsertUserProfileFromSession()

  // And subscribe to future sign-ins (including Google OAuth redirects)
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      upsertUserProfileFromSession()
      // You can close modal or advance UI here if needed
      setIsAuthenticated(true)
      setShowAuthModal(false)
      setShowQuotePage(true)
    }
  })
  return () => sub?.subscription?.unsubscribe()
}, [])

const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}` },
    })
    if (error) {
      console.error("Google login error:", error.message)
      alert("Google login failed!")
    }
  }
   
const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();

  const { email, password, confirmPassword, firstName, lastName, company } = authForm;

  if (authMode === "signup") {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName, company },
      },
    });

    if (error) {
      alert(`Signup failed: ${error.message}`);
      console.error("Signup Error:", error);
    } else {
      alert("Signup successful! Please check your email to verify.");
      setShowAuthModal(false);

      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from("users")
          .upsert(
            [
              {
                id: signUpData.user.id,
                email,
                first_name: firstName || null,
                last_name: lastName || null,
                company: company || null,
              },
            ],
            { onConflict: "email" }
          );

        if (profileError) {
          console.error("Failed to store profile info:", profileError.message);
        }
      }
    }
  } else {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Sign-in failed: ${error.message}`);
      console.error("Sign-in Error:", error);
    } else {
      alert("Signed in successfully!");
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setShowQuotePage(true);
    }
  }
};

  const handleLogout = async () => {
  await supabase.auth.signOut();
  setIsAuthenticated(false);
  setShowQuotePage(false); // optional: hide content that should only be visible when logged in
  setShowAuthModal(true); // ✅ Show login/signup modal again
  resetAuthForm();
  // Clear cart and reset options panel state
  setCartItems([]);
  setShowOptionsPanel(false);
  setSelectedServiceTitle(null);
  setSelectedServiceCategory(null);
  resetOptionsForm();
};
 
  const resetAuthForm = () => {
    setAuthForm({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      company: "",
    })
  }

  const switchAuthMode = (mode: "signin" | "signup") => {
    setAuthMode(mode)
    resetAuthForm()
    setShowPassword(false)
  }

  const handleForgotPassword = async () => {
  if (!authForm.email) {
    alert("Please enter your email above before resetting password.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(authForm.email, {
    redirectTo: "http://localhost:3000/reset-password",
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password reset email sent! Check your inbox.");
  }
};
//add here
const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}, []);

  const handlePayment = async () => {
    try {
      const amount = Math.round(calculateAdjustedTotal() * 100); // paise

      // 1) fetch authenticated user's details so we can attach user_id to the order
      const userRes = await supabase.auth.getUser();
      const user = (userRes && (userRes as any).data) ? (userRes as any).data.user : null;

      // 2) create an order on the server so the secret key stays on the server
      // read pricing key determined when adding to cart
      const selectedPricingKey = (typeof window !== 'undefined') ? (localStorage.getItem('selected_pricing_key') || null) : null
      console.log("[Checkout] Using pricing key:", selectedPricingKey)
     
      const orderResp = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR', user_id: user?.id || null, service_id: (cartItems[0] as any)?.service_id ?? null, type: selectedPricingKey }),
      });

      if (!orderResp.ok) {
        let reason = 'Unknown error'
        try {
          const maybeJson = await orderResp.json()
          reason = (maybeJson && (maybeJson.error || maybeJson.message)) ? (maybeJson.error || maybeJson.message) : JSON.stringify(maybeJson)
        } catch {
          try { reason = await orderResp.text() } catch {}
        }
        console.error('create-order failed:', reason)
        alert(`Failed to start payment. ${reason || 'Please try again.'}`)
        return
      }

      const order = await orderResp.json();
      const firstItem = cartItems[0];

      // 3) Build Razorpay options; order.id comes from server (/api/create-order)
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount || amount,
        currency: order.currency || 'INR',
        name: 'LegalIP Pro',
        description: firstItem?.name || 'IP Service Payment',
        order_id: order.id || order.id, // server-provided Razorpay order id
  handler: async function (response: any) {
          // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
              setIsProcessingPayment(true);
      // Forward the payment result to the server for signature verification
            const verifyResp = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                // include authenticated user id so server can attach payment to profile
                user_id: user?.id || null,
        // include service selection so server can persist service_id reliably
        service_id: (cartItems[0] as any)?.service_id ?? null,
                // include application form type (if the user selected one)
                type: selectedPricingKey,
                // include minimal customer/context data for server processing
                name: user?.user_metadata?.full_name || user?.email || '',
                email: user?.email || '',
                phone: user?.phone || '',
                message: options.description,
                complexity: serviceFields.patentField1 || 'standard',
                urgency: calculatorFields.urgency || 'standard',
                cart: cartItems,
              }),
            });

            const verifyJson = await verifyResp.json();
            if (!verifyResp.ok || !verifyJson.success) {
              console.error('verify-payment failed', verifyJson);
              alert('Payment verification failed. Please contact support.');
              setIsProcessingPayment(false);  
              return;
            }
            // Show local Thank You modal so the user can open forms immediately
            const persisted = verifyJson.persistedPayment ?? null
            const createdOrders = Array.isArray(verifyJson.createdOrdersClient) ? verifyJson.createdOrdersClient : (Array.isArray(verifyJson.createdOrders) ? verifyJson.createdOrders : [])
            const paymentIdentifier = persisted?.razorpay_payment_id ?? persisted?.id ?? null
            setCheckoutPayment(persisted)
            setCheckoutOrders(createdOrders)
            setShowCheckoutThankYou(true)
            // Fallbacks:
            // 1) If no orders were created on server (unexpected), redirect to Profile Orders so the server-side Thank You can load.
            if (!createdOrders || createdOrders.length === 0) {
              const base = (typeof window !== 'undefined') ? window.location.origin : ''
              if (paymentIdentifier) window.location.href = `${base}/profile?tab=orders&payment_id=${encodeURIComponent(String(paymentIdentifier))}`
              else window.location.href = `${base}/profile?tab=orders`
              return
            }
            // 2) If the popup somehow fails to render in time, redirect as a safety net.
            setTimeout(() => {
              try {
                const el = document.getElementById('checkout-thankyou-modal')
                if (!el) {
                  const base = (typeof window !== 'undefined') ? window.location.origin : ''
                  if (paymentIdentifier) window.location.href = `${base}/profile?tab=orders&payment_id=${encodeURIComponent(String(paymentIdentifier))}`
                  else window.location.href = `${base}/profile?tab=orders`
                }
              } catch {}
            }, 1200)
          } catch (err) {
            console.error('Error verifying payment:', err);
            alert('Payment succeeded but verification failed. We will investigate.');
            setIsProcessingPayment(false);  
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          service: firstItem?.name || 'Quotation Payment',
        },
        theme: { color: '#1e40af' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('handlePayment error:', err);
      alert('An error occurred while initiating payment.');
    }
  };
 
   
  const getServicesByCategory = (category: string) => {
    return cartItems.filter((item) => item.category === category)
  }

  const hasServicesInCategory = (category: string) => {
    return cartItems.some((item) => item.category === category)
  }

  const downloadQuotationPDF = () => {
    // Create the PDF content as HTML
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const quotationNumber = `LIP-${Date.now().toString().slice(-6)}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>LegalIP Pro - Service Quotation</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .company-info {
            color: #666;
            font-size: 14px;
          }
          .quotation-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          .quotation-info div {
            flex: 1;
          }
          .quotation-info h3 {
            margin: 0 0 10px 0;
            color: #2563eb;
            font-size: 16px;
          }
          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .services-table th,
          .services-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .services-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #374151;
          }
          .category-header {
            background-color: #e0f2fe !important;
            font-weight: bold;
            color: #0369a1;
          }
          .price {
            text-align: right;
            font-weight: bold;
          }
          .total-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .total-final {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            border-top: 2px solid #2563eb;
            padding-top: 10px;
          }
          .terms {
            background: #fefce8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #eab308;
          }
          .terms h3 {
            margin-top: 0;
            color: #a16207;
          }
          .terms ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .terms li {
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .quotation-info { display: block; }
            .quotation-info div { margin-bottom: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">⚖️ LegalIP Pro</div>
          <div class="company-info">
            Professional Intellectual Property Services<br>
            123 Legal Street, IP City, LC 12345<br>
            Phone: (555) 123-4567 | Email: info@legalippro.com
          </div>
        </div>

        <div class="quotation-info">
          <div>
            <h3>Quotation Details</h3>
            <strong>Quotation #:</strong> ${quotationNumber}<br>
            <strong>Date:</strong> ${currentDate}<br>
            <strong>Valid Until:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </div>
          <div>
            <h3>Client Information</h3>
            <strong>Prepared For:</strong> Prospective Client<br>
            <strong>Services:</strong> IP Protection Services<br>
            <strong>Status:</strong> Preliminary Estimate
          </div>
        </div>

        <table class="services-table">
          <thead>
            <tr>
              <th>Service Description</th>
              <th>Category</th>
              <th class="price">Estimated Cost</th>
            </tr>
          </thead>
          <tbody>
            ${cartItems
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td class="price">${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(getTotalPrice())}</span>
          </div>
          <div class="total-row">
            <span>Consultation (Included):</span>
            <span>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(0)}</span>
          </div>
          <div class="total-row total-final">
            <span>Total Estimated Cost:</span>
            <span>${new Intl.NumberFormat('en-IN', { style: 'currency', 'currency': 'INR', maximumFractionDigits: 0 }).format(getTotalPrice())}</span>
          </div>
        </div>

        <div class="terms">
          <h3>Terms & Conditions</h3>
          <ul>
            <li><strong>Validity:</strong> This quotation is valid for 30 days from the date of issue.</li>
            <li><strong>Estimates:</strong> All prices are estimates and may vary based on complexity and specific requirements.</li>
            <li><strong>Payment:</strong> 50% advance payment required to commence services, balance upon completion.</li>
            <li><strong>Timeline:</strong> Service timelines will be provided upon engagement and may vary by service type.</li>
            <li><strong>Consultation:</strong> Free initial consultation included with any service package.</li>
            <li><strong>Additional Costs:</strong> Government fees, filing fees, and third-party costs are additional.</li>
          </ul>
        </div>

        <div class="footer">
          <p>This quotation was generated on ${currentDate} by LegalIP Pro.<br>
          For questions or to proceed with services, please contact us at info@legalippro.com or (555) 123-4567.</p>
        </div>
      </body>
      </html>
    `

    // Create a new window and write the HTML content
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }
     
 
  /// Quote Page Component
if (showQuotePage) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentProcessingModal isVisible={isProcessingPayment} />
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setShowQuotePage(false)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              ← Back to Home
            </button>
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">LegalIP Pro</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Knowledge Hub
              </a>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isAuthenticated}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Side - Selected Services */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Selected Services</h1>
              <p className="text-gray-600">
                Review your selected IP protection services and customize your quote
              </p>
            </div>

            <div className="space-y-6">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-3">
                            {item.category}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          Professional {item.category.toLowerCase()} service with comprehensive coverage and expert guidance.
                        </p>
                        {item.details && (
                          <p className="text-xs text-gray-500 mb-2">Details: {item.details}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatINR(item.price)}
                          </span>
                          <Button
                            onClick={() => removeFromCart(item.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {cartItems.length === 0 && (
                <Card className="bg-white">
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No services selected</h3>
                    <p className="text-gray-600 mb-4">Add some services to create your quote</p>
                    <Button onClick={backToMainPage} className="bg-blue-600 hover:bg-blue-700">
                      Browse Services
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Make Payment Button */}
            <div className="flex justify-center items-center mt-8">
              <Button
                className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handlePayment}
              >
                <FileText className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

 
  return (
    <div className="min-h-screen bg-white">
      {/* Auth Modal */}
       
              {showAuthModal && (
  <AuthModal
    authForm={authForm}
    setAuthForm={setAuthForm}
    authMode={authMode}
    switchAuthMode={switchAuthMode}
    handleAuth={handleAuth}
    handleForgotPassword={handleForgotPassword}
    showPassword={showPassword}
    setShowPassword={setShowPassword}
    setShowAuthModal={setShowAuthModal}
    googleSignInButton={
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_17_40)">
            <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29H37.1C36.5 32.1 34.5 34.7 31.7 36.4V42H39.3C44 38.1 47.5 32.1 47.5 24.5Z" fill="#4285F4"/>
            <path d="M24 48C30.6 48 36.1 45.8 39.3 42L31.7 36.4C29.9 37.6 27.7 38.3 24 38.3C18.7 38.3 14.1 34.7 12.5 29.9H4.7V35.7C7.9 42.1 15.3 48 24 48Z" fill="#34A853"/>
            <path d="M12.5 29.9C12.1 28.7 11.9 27.4 11.9 26C11.9 24.6 12.1 23.3 12.5 22.1V16.3H4.7C3.2 19.1 2.5 22.4 2.5 26C2.5 29.6 3.2 32.9 4.7 35.7L12.5 29.9Z" fill="#FBBC05"/>
            <path d="M24 9.7C27.1 9.7 29.5 10.8 31.2 12.3L39.4 4.1C36.1 1.1 30.6-1 24 0C15.3 0 7.9 5.9 4.7 12.3L12.5 18.1C14.1 13.3 18.7 9.7 24 9.7Z" fill="#EA4335"/>
          </g>
          <defs>
            <clipPath id="clip0_17_40">
              <rect width="48" height="48" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        Continue with Google
      </button>
    }
  />
)}

  {/* Header */}
      <header className="bg-white shadow-md p-4">
      <div className="hidden md:flex items-center space-x-6 justify-end w-full">
        <a href="/knowledge-hub" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
          Knowledge Hub
        </a>
        <div className="relative">
          <button onClick={toggleMenu} className="focus:outline-none">
            <UserCircleIcon className="h-8 w-8 text-gray-700 hover:text-blue-600" />
          </button>
   
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 border border-gray-200 z-50">
              <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Manage Profile</a>
              {/*<a href="/profile/overview?tab=overview" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile Overview</a>*/}
              {/*<a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">View Your Orders</a>*/}
              {/*<button
                onClick={() => { window.location.href = '/forms'; setIsOpen(false); }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
               View Forms
              </button>*/}
              <button
                onClick={() => { goToQuotePage(); setIsOpen(false); }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Sign In
              </button>
                   
             
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                disabled={!isAuthenticated}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

   

      {/* Enhanced Carousel Banner */}
      <section className="banner-section relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>

        {/* Carousel Container */}
        <div className="relative h-full">
          {bannerSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 transform translate-x-0"
                  : index < currentSlide
                    ? "opacity-0 transform -translate-x-full"
                    : "opacity-0 transform translate-x-full"
              }`}
            >
              <div className="h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content Side */}
                    <div className="text-white space-y-6">
                      <div className="inline-block px-4 py-2 bg-blue-600/20 backdrop-blur-sm rounded-full border border-blue-400/30">
                        <span className="text-blue-200 text-sm font-medium">Professional IP Services</span>
                      </div>

                      <h1 className="text-4xl md:text-6xl font-bold leading-tight">{slide.title}</h1>

                      <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-2xl">{slide.description}</p>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                        >
                          Get Started Today
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-lg bg-transparent"
                        >
                          Learn More
                        </Button>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-8 pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">2500+</div>
                          <div className="text-blue-200 text-sm">Patents Filed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">1800+</div>
                          <div className="text-blue-200 text-sm">Trademarks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">950+</div>
                          <div className="text-blue-200 text-sm">Happy Clients</div>
                        </div>
                      </div>
                    </div>

                    {/* Image Side */}
                    <div className="relative">
                      <div className="relative z-10">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                          <img
                            src={slide.image || "/placeholder.svg"}
                            alt={slide.title}
                            className="w-full h-80 object-cover rounded-xl shadow-lg"
                          />
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-4 rounded-full shadow-lg transition-all duration-300 border border-white/30 group z-20"
        >
          <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-4 rounded-full shadow-lg transition-all duration-300 border border-white/30 group z-20"
        >
          <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Enhanced Dot Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide ? "w-12 h-3 bg-white shadow-lg" : "w-3 h-3 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-5000 ease-linear"
            style={{ width: `${((currentSlide + 1) / bannerSlides.length) * 100}%` }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-2000"></div>
      </section>

      {/* Main Content Area: Services on Left, Cart on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Tabbed Services */}
        <div className="flex-1">
          {/* Scrollable nav styled as tabs */}
          <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-8">
            <button onClick={() => scrollToSection('patent-services')} className="px-3 py-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Patent Services</button>
            <button onClick={() => scrollToSection('trademark-services')} className="px-3 py-2 rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100">Trademark Services</button>
            <button onClick={() => scrollToSection('copyright-services')} className="px-3 py-2 rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100">Copyright Services</button>
            <button onClick={() => scrollToSection('design-services')} className="px-3 py-2 rounded bg-neutral-50 text-neutral-700 hover:bg-neutral-100">Design Services</button>
          </div>

          {/* Patent Services */}
          <section id="patent-services" className="bg-blue-50 py-8 rounded-lg">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Patent Services</h2>
                <p className="text-lg text-gray-600 max-w-3xl">Comprehensive patent services to protect your innovations and inventions.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                {patentServices.map((service, index) => (
                  <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                    <CardContent className="p-7">
                      <div className="flex items-start justify-between">
                        <div className="p-3 bg-blue-100 rounded-full">{service.icon}</div>
                        <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                      </div>
                      <p className="text-gray-600 mt-4">
                        {service.description} Our experts perform in-depth analysis, draft precise documents, and guide you across the full lifecycle to maximize protection and value.
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-2xl font-bold text-blue-600">
                          {servicePricing[service.title] != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(servicePricing[service.title]) : 'Price not available'}
                        </span>
                        <Button onClick={() => openOptionsForService(service.title, 'Patent')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Select</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Trademark Services */}
          <section id="trademark-services" className="bg-neutral-50 py-8 rounded-lg mt-8 border border-neutral-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Trademark Services</h2>
                <p className="text-lg text-gray-600 max-w-3xl">Protect your brand identity with tailored search, filing, and monitoring solutions.</p>
              </div>
              <div className="text-center py-12">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-neutral-100 ring-2 ring-neutral-200 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-neutral-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Coming soon</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">We’re polishing our trademark offerings. Meanwhile, explore our fully available patent services.</p>
                <div className="mt-6">
                  <Button variant="outline" className="border-neutral-200" onClick={() => scrollToSection('patent-services')}>
                    Explore Patent Services
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Copyright Services */}
          <section id="copyright-services" className="bg-neutral-50 py-8 rounded-lg mt-8 border border-neutral-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Copyright Services</h2>
                <p className="text-lg text-gray-600 max-w-3xl">Safeguard creative works with registration, licensing, and enforcement support.</p>
              </div>
              <div className="text-center py-12">
                  <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-neutral-100 ring-2 ring-neutral-200 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-neutral-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Coming soon</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">We’re crafting copyright solutions to protect your creative work. Check back shortly.</p>
                <div className="mt-6">
                  <Button variant="outline" className="border-neutral-200" onClick={() => scrollToSection('patent-services')}>
                    Explore Patent Services
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Design Services */}
          <section id="design-services" className="bg-neutral-50 py-8 rounded-lg mt-8 border border-neutral-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Design Services</h2>
                <p className="text-lg text-gray-600 max-w-3xl">Protect unique designs with strategic search, filing, and portfolio support.</p>
              </div>
              <div className="text-center py-12">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-neutral-100 ring-2 ring-neutral-200 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-neutral-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Coming soon</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">Our design protection services are nearly ready. Stay tuned!</p>
                <div className="mt-6">
                  <Button variant="outline" className="border-neutral-200" onClick={() => scrollToSection('patent-services')}>
                    Explore Patent Services
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Cart Section */}
        <div className="w-full lg:w-72 bg-gray-50 border border-gray-200 rounded-lg p-4 flex-shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="pb-4 border-b mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Scale className="h-5 w-5 mr-2 text-blue-600" />
              Service Cart
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                </div>
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add services to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.category}</p>
                      {item.details && (
                        <p className="text-[11px] text-gray-600 mt-1">{item.details}</p>
                      )}
                      <p className="text-sm font-semibold text-blue-600">{formatINR(item.price)}</p>
                    </div>
                    <Button
                      onClick={() => removeFromCart(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
         

          <div className="pt-4 border-t mt-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900">Total Estimate:</span>
              <span className="text-xl font-bold text-blue-600">{formatINR(getTotalPrice())}</span>
            </div>
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={goToQuotePage}>
                Go To Payments
              </Button>
               
              <Button
                onClick={downloadQuotationPDF}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Quotation PDF
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  clearCart()
                }}
              >
                Clear Cart
              </Button>
            </div>
            {showOptionsPanel && (
              <Dialog open={showOptionsPanel} onOpenChange={(open) => { if (!open) closeOptionsPanel() }}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Options for: {selectedServiceTitle}</DialogTitle>
                    <DialogDescription>Select the options for this service.</DialogDescription>

                    {selectedServiceTitle === 'Drafting' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Specification Type</Label>
                          <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm((p) => ({ ...p, searchType: v }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choose specification" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ps">Provisional Specification (PS) — {formatINR(computeDraftingPrice("ps", "standard"))}</SelectItem>
                              <SelectItem value="cs">Complete Specification (CS) — {formatINR(computeDraftingPrice("cs", "standard"))}</SelectItem>
                              <SelectItem value="ps_cs">PS-CS — {formatINR(computeDraftingPrice("ps_cs", "standard"))}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <>
                          {optionsForm.searchType && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Turnaround</Label>
                              <Select value={optionsForm.goodsServices} onValueChange={(v) => setOptionsForm((p) => ({ ...p, goodsServices: v }))}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Choose turnaround" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="standard">Standard (12-15 days) — {formatINR(computeTurnaroundTotal("standard"))}</SelectItem>
                                  <SelectItem value="expediated">Expediated (8-10 Days) — {formatINR(expediatedDiff)}</SelectItem>
                                  <SelectItem value="rush">Rush (5-7 days) — {formatINR(rushDiff)}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {/* Fee Preview for Drafting */}
                          <div className="rounded-md border p-3 bg-gray-50 mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Professional Fee</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Government Fee</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(0)}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                              <span>Total</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                            </div>
                          </div>
                        </>
                      </>
                    )}

                    {selectedServiceTitle === 'Patent Application Filing' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Applicant Type</Label>
                          <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm((p) => ({ ...p, searchType: v }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choose applicant type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">SStart-Up/Individuals/MSMEs/Educational Institute{" "}
                                  {applicantPrices.individual !== undefined ? `— ₹${applicantPrices.individual}` : ""}</SelectItem>
                              <SelectItem value="others">Large Entity/Others{" "}
                                  {applicantPrices.others !== undefined ? `— ₹${applicantPrices.others}` : ""}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <>
                          {optionsForm.searchType && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Filing Type</Label>
                              <Select value={optionsForm.goodsServices} onValueChange={(v) => setOptionsForm((p) => ({ ...p, goodsServices: v }))}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Choose filing type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="provisional_filing">Provisional Filing (4 days) — {formatINR(computeFilingPrice("provisional_filing", optionsForm.searchType as any))}</SelectItem>
                                  <SelectItem value="complete_specification_filing">Complete Specification Filing (4 days) — {formatINR(computeFilingPrice("complete_specification_filing", optionsForm.searchType as any))}</SelectItem>
                                  <SelectItem value="ps_cs_filing">PS-CS Filing (4 days) — {formatINR(computeFilingPrice("ps_cs_filing", optionsForm.searchType as any))}</SelectItem>
                                  <SelectItem value="pct_filing">PCT Filing — {formatINR(computeFilingPrice("pct_filing", optionsForm.searchType as any))}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {/* Fee Preview for Patent Application Filing */}
                          <div className="rounded-md border p-3 bg-gray-50 mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Professional Fee</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Government Fee</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(0)}</span>
                            </div>
                            <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                              <span>Total</span>
                              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                            </div>
                          </div>
                        </>
                      </>
                    )}

                    {selectedServiceTitle === 'First Examination Response' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Response Due</Label>
                          <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm((p) => ({ ...p, searchType: v }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Choose option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="base_fee">Base Fee (Response due date after 3 months) — {ferPrices.base_fee !== undefined ? formatINR(ferPrices.base_fee) : ""}</SelectItem>
                              <SelectItem value="response_due_anytime_after_15_days">Response due anytime after 15 days — {ferPrices.response_due_anytime_after_15_days !== undefined ? formatINR(ferPrices.response_due_anytime_after_15_days) : ""}</SelectItem>
                              <SelectItem value="response_due_within_11_15_days">Response due within 11-15 days — {ferPrices.response_due_within_11_15_days !== undefined ? formatINR(ferPrices.response_due_within_11_15_days) : ""}</SelectItem>
                              <SelectItem value="response_due_within_4_10_days">Response due within 4-10 days — {ferPrices.response_due_within_4_10_days !== undefined ? formatINR(ferPrices.response_due_within_4_10_days) : ""}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Fee Preview for First Examination Response */}
                        <div className="rounded-md border p-3 bg-gray-50 mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Professional Fee</span>
                            <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Government Fee</span>
                            <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(0)}</span>
                          </div>
                          <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </DialogHeader>

                  <TooltipProvider>
                    <div className="space-y-6 mb-4" style={{ display: selectedServiceTitle !== 'Patentability Search' ? 'none' : undefined }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-700">Search Type</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Select the scope of search and whether a legal opinion is included.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select value={optionsForm.searchType} onValueChange={(v) => setOptionsForm((p) => ({ ...p, searchType: v }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose search type" />
                        </SelectTrigger>
 
                          <SelectContent>
                          <SelectItem value="quick">
                            Quick Knockout Search — {formatINR(basePricePS)}
                          </SelectItem>
                          <SelectItem value="full_without_opinion">
                            Full Patentability Search (Without Opinion) — {formatINR(DiffWithoutPS)}
                          </SelectItem>
                          <SelectItem value="full_with_opinion">
                            Full Patentability Search with Opinion — {formatINR(DiffWithPS)}
                          </SelectItem>
                        </SelectContent>
                         
                      </Select>
                    </div>

                    {optionsForm.searchType && (
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-700">Turnaround</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>Choose delivery speed. Faster options may add to the fee per rules.</TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={optionsForm.goodsServices} onValueChange={(v) => setOptionsForm((p) => ({ ...p, goodsServices: v }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Choose turnaround" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard (7-10 days) — {formatINR(computeTurnaroundTotal("standard"))}</SelectItem>
                            <SelectItem value="expediated">Expediated (3-5 Days) — {formatINR(expediatedDiff)}
</SelectItem>
                            <SelectItem value="rush">Rush (1-2 days) — {formatINR(rushDiff)}
</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="rounded-md border p-3 bg-gray-50">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Professional Fee</span>
                        <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Government Fee</span>
                        <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(0)}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold border-t mt-2 pt-2">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(preview.total)}</span>
                      </div>
                    </div>
                  </div>
                  </TooltipProvider>
           
                  <DialogFooter>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={addToCartWithOptions}
                      disabled={
                        (selectedServiceTitle === "Patentability Search" && (!optionsForm.searchType || !optionsForm.goodsServices)) ||
                        (selectedServiceTitle === "Drafting" && (!optionsForm.searchType || !optionsForm.goodsServices)) ||
                        (selectedServiceTitle === "Patent Application Filing" && (!optionsForm.searchType || !optionsForm.goodsServices)) ||
                        (selectedServiceTitle === "First Examination Response" && (!optionsForm.searchType))
                      }
                    >
                      Add
                    </Button>
                    <Button variant="outline" onClick={closeOptionsPanel}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">*Prices are estimates. Final costs may vary.</p>
          </div>
        </div>
      </div>

      {/* Reviews Carousel */}
    {/*}  <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What clients say</h2>
            <p className="text-gray-600 mt-2">Real feedback from founders, counsel, and operators</p>
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="min-h-[160px] relative">
              {reviews.map((r, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${idx === reviewIndex ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
                >
                  <div className="bg-gray-50 border rounded-xl p-6 md:p-8 shadow-sm">
                    <p className="text-lg md:text-xl text-gray-800 leading-relaxed">“{r.quote}”</p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <span key={`f-${i}`}>★</span>
                      ))}
                      {Array.from({ length: 5 - r.rating }).map((_, i) => (
                        <span key={`e-${i}`}>☆</span>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-600 text-center">— {r.name}, {r.role}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              aria-label="Previous review"
              onClick={() => setReviewIndex((i) => (i - 1 + reviews.length) % reviews.length)}
              className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border rounded-full p-2 shadow hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next review"
              onClick={() => setReviewIndex((i) => (i + 1) % reviews.length)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border rounded-full p-2 shadow hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${i === reviewIndex ? "w-6 bg-blue-600" : "w-2.5 bg-gray-300"}`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>*/}

{/* Milestone Counter (Full Width) */}
      <section id="milestones" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
            <p className="text-xl text-gray-600">
              Trusted by businesses worldwide for intellectual property protection
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {counters[milestone.key as keyof typeof counters].toLocaleString()}+
                </div>
                <div className="text-gray-600 font-medium">{milestone.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Checkout Thank You Modal: open forms immediately */}
      {showCheckoutThankYou && (
        <div id="checkout-thankyou-modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Thank you for your order</h2>
              <p className="text-sm text-gray-600">Payment verified. You can proceed to the forms now.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <div className="text-gray-500">Payment ID</div>
                <div className="font-medium">{checkoutPayment?.razorpay_payment_id ?? checkoutPayment?.id ?? '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Date</div>
                <div className="font-medium">{checkoutPayment?.payment_date ? new Date(checkoutPayment.payment_date).toLocaleString() : '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Amount</div>
                <div className="font-medium">{checkoutPayment?.total_amount ?? '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium">{checkoutPayment?.payment_status ?? '—'}</div>
              </div>
            </div>

            {checkoutOrders.length > 1 ? (
              <div>
                <div className="mb-2 text-sm text-gray-600">Multiple services detected. Open each form below:</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {checkoutOrders.map((o) => (
                    <button
                      key={o.id}
                      className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                      onClick={() => {
                        try {
                          const base = typeof window !== 'undefined' ? window.location.origin : ''
                          const type = resolveFormTypeFromOrderLike(o)
                          const pk = o.service_pricing_key ? String(o.service_pricing_key) : ''
                          const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ''}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
                          window.open(url, '_blank')
                        } catch (e) { console.error('Open form error', e) }
                      }}
                    >
                      {(o.services as any)?.name || 'Service'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-end">
                  <button
                    className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={() => {
                      try {
                        const base = typeof window !== 'undefined' ? window.location.origin : ''
                        checkoutOrders.forEach((o) => {
                          const type = resolveFormTypeFromOrderLike(o)
                          const pk = o.service_pricing_key ? String(o.service_pricing_key) : ''
                          const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ''}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
                          window.open(url, '_blank')
                        })
                      } catch (e) { console.error('Open all forms error', e) }
                    }}
                  >
                    Proceed to Forms
                  </button>
                </div>
              </div>
            ) : null}

            {checkoutOrders.length === 1 ? (
              <div className="flex items-center justify-between">
                <div />
                <button
                  className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  onClick={() => {
                    const o = checkoutOrders[0]
                    try {
                      const base = typeof window !== 'undefined' ? window.location.origin : ''
                      const type = resolveFormTypeFromOrderLike(o)
                      const pk = o.service_pricing_key ? String(o.service_pricing_key) : ''
                      const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ''}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
                      window.open(url, '_blank')
                    } catch (e) { console.error('Open form error', e) }
                  }}
                >
                  Proceed to Form
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end">
                <button className="rounded border px-3 py-2 text-sm" onClick={() => setShowCheckoutThankYou(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}