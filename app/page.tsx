"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from '../lib/supabase';
import AuthModal from "@/components/AuthModal"; // Adjust path


const services = [
  "Patent Search & Analysis",
  "Patent Application Filing",
  "Patent Portfolio Management",
  "Trademark Search",
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs components

export default function LegalIPWebsite() {
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
    }>
  >([])
   
  const [showQuotePage, setShowQuotePage] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
/*
  // Service pricing
  const servicePricing = {
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
*/  

const services = [
  "Patent Search & Analysis",
  "Patent Application Filing",
  "Patent Portfolio Management",
  "Trademark Search",
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

 
  useEffect(() => {
    async function fetchPricing() {
      const { data, error } = await supabase
        .from('patentrender')
        .select(
          'patent_search, patent_application, patent_portfolio, trademark_search, trademark_registration, trademark_monitoring, copyright_registration, dmca_services, copyright_licensing, design_registration, design_search, design_portfolio'
        )
        .maybeSingle();
           
      if (error) {
        console.error("Error fetching pricing:", error)
      } else if (data) {
        const formattedPricing: Record<string, number> = {
          "Patent Search & Analysis": data.patent_search,
          "Patent Application Filing": data.patent_application,
          "Patent Portfolio Management": data.patent_portfolio,
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


  const bannerSlides = [
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

  const patentServices = [
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
      price,
      category,
    }
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
          .from("patentprofiles")
          .insert([
            {
              //id: signUpData.user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              company,
            },
          ]);

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
    redirectTo: "http://localhost:3000/reset-password", // or your domain
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password reset email sent! Check your inbox.");
  }
};

  useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}, []);

  const handlePayment = () => {
  const amount = Math.round(calculateAdjustedTotal() * 100); // Razorpay expects paise
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const options = {
    key: key,
    amount: amount,
    currency: "INR",
    name: "LegalIP Pro",
    description: "Patent Service Payment",
    handler: function (response: any) {
      alert(`Payment successful! ID: ${response.razorpay_payment_id}`);
    },
    prefill: {
      name: "John Doe",
      email: "john@example.com",
      contact: "9999999999",
    },
    notes: {
      service: "Quotation Payment"
    },
    theme: {
      color: "#1e40af",
    }
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
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
                <td class="price">$${item.price.toLocaleString()}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${getTotalPrice().toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Consultation (Included):</span>
            <span>$0</span>
          </div>
          <div class="total-row total-final">
            <span>Total Estimated Cost:</span>
            <span>$${getTotalPrice().toLocaleString()}</span>
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
     
 
  // Quote Page Component
  if (showQuotePage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header for Quote Page */}
        {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
           
            {/* ✅ Back button */}
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
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Knowledge Hub
              </a>
            </nav>
          </div>
        </div>
      </header>
     
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Left Side - Selected Services */}
            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Selected Services</h1>
                <p className="text-gray-600">Review your selected IP protection services and customize your quote</p>
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
                            Professional {item.category.toLowerCase()} service with comprehensive coverage and expert
                            guidance.
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-blue-600">${item.price.toLocaleString()}</span>
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

              {/* Service-Specific Details Forms - Moved here from right sidebar */}
              <div className="mt-8 space-y-6">
                {hasServicesInCategory("Patent") && (
                  <Card className="bg-white shadow-lg">
                    <CardHeader className="bg-blue-50 rounded-t-lg">
                      <CardTitle className="text-blue-900">Patent Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Patent Field 1</Label>
                          <Input
                            value={serviceFields.patentField1}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, patentField1: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Patent Field 2</Label>
                          <Input
                            value={serviceFields.patentField2}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, patentField2: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Patent Field 3</Label>
                        <Textarea
                          value={serviceFields.patentField3}
                          onChange={(e) => setServiceFields((prev) => ({ ...prev, patentField3: e.target.value }))}
                          className="mt-1"
                          placeholder="Enter details..."
                          rows={3}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Patent Field 4</Label>
                          <Select
                            value={serviceFields.patentField4}
                            onValueChange={(value) => setServiceFields((prev) => ({ ...prev, patentField4: value }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select option..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="option1">Option 1</SelectItem>
                              <SelectItem value="option2">Option 2</SelectItem>
                              <SelectItem value="option3">Option 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Patent Field 5</Label>
                          <Input
                            value={serviceFields.patentField5}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, patentField5: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {hasServicesInCategory("Trademark") && (
                  <Card className="bg-white shadow-lg">
                    <CardHeader className="bg-green-50 rounded-t-lg">
                      <CardTitle className="text-green-900">Trademark Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Trademark Field 1</Label>
                          <Input
                            value={serviceFields.trademarkField1}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, trademarkField1: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Trademark Field 2</Label>
                          <Input
                            value={serviceFields.trademarkField2}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, trademarkField2: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Trademark Field 3</Label>
                        <Textarea
                          value={serviceFields.trademarkField3}
                          onChange={(e) => setServiceFields((prev) => ({ ...prev, trademarkField3: e.target.value }))}
                          className="mt-1"
                          placeholder="Enter details..."
                          rows={3}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Trademark Field 4</Label>
                          <Select
                            value={serviceFields.trademarkField4}
                            onValueChange={(value) => setServiceFields((prev) => ({ ...prev, trademarkField4: value }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select option..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="option1">Option 1</SelectItem>
                              <SelectItem value="option2">Option 2</SelectItem>
                              <SelectItem value="option3">Option 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Trademark Field 5</Label>
                          <Input
                            value={serviceFields.trademarkField5}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, trademarkField5: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {hasServicesInCategory("Copyright") && (
                  <Card className="bg-white shadow-lg">
                    <CardHeader className="bg-purple-50 rounded-t-lg">
                      <CardTitle className="text-purple-900">Copyright Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Copyright Field 1</Label>
                          <Input
                            value={serviceFields.copyrightField1}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, copyrightField1: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Copyright Field 2</Label>
                          <Input
                            value={serviceFields.copyrightField2}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, copyrightField2: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Copyright Field 3</Label>
                        <Textarea
                          value={serviceFields.copyrightField3}
                          onChange={(e) => setServiceFields((prev) => ({ ...prev, copyrightField3: e.target.value }))}
                          className="mt-1"
                          placeholder="Enter details..."
                          rows={3}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Copyright Field 4</Label>
                          <Select
                            value={serviceFields.copyrightField4}
                            onValueChange={(value) => setServiceFields((prev) => ({ ...prev, copyrightField4: value }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select option..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="option1">Option 1</SelectItem>
                              <SelectItem value="option2">Option 2</SelectItem>
                              <SelectItem value="option3">Option 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Copyright Field 5</Label>
                          <Input
                            value={serviceFields.copyrightField5}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, copyrightField5: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {hasServicesInCategory("Design") && (
                  <Card className="bg-white shadow-lg">
                    <CardHeader className="bg-orange-50 rounded-t-lg">
                      <CardTitle className="text-orange-900">Design Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Design Field 1</Label>
                          <Input
                            value={serviceFields.designField1}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, designField1: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Design Field 2</Label>
                          <Input
                            value={serviceFields.designField2}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, designField2: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Design Field 3</Label>
                        <Textarea
                          value={serviceFields.designField3}
                          onChange={(e) => setServiceFields((prev) => ({ ...prev, designField3: e.target.value }))}
                          className="mt-1"
                          placeholder="Enter details..."
                          rows={3}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Design Field 4</Label>
                          <Select
                            value={serviceFields.designField4}
                            onValueChange={(value) => setServiceFields((prev) => ({ ...prev, designField4: value }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select option..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="option1">Option 1</SelectItem>
                              <SelectItem value="option2">Option 2</SelectItem>
                              <SelectItem value="option3">Option 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Design Field 5</Label>
                          <Input
                            value={serviceFields.designField5}
                            onChange={(e) => setServiceFields((prev) => ({ ...prev, designField5: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter details..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Side - Fixed Calculator */}
            <div className="w-80">
              <div className="sticky top-24 space-y-6">
                {/* Main Calculator */}
                <Card className="bg-white shadow-lg">
                  <CardHeader className="bg-blue-50 rounded-t-lg">
                    <CardTitle className="flex items-center text-blue-900">
                      <Calculator className="h-5 w-5 mr-2" />
                      Quote Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Urgency */}
                    <div>
                      <Label htmlFor="urgency" className="text-sm font-medium text-gray-700">
                        Service Urgency
                      </Label>
                      <Select
                        value={calculatorFields.urgency}
                        onValueChange={(value) => setCalculatorFields((prev) => ({ ...prev, urgency: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (No rush)</SelectItem>
                          <SelectItem value="urgent">Urgent (+25%)</SelectItem>
                          <SelectItem value="rush">Rush (+50%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Complexity */}
                    <div>
                      <Label htmlFor="complexity" className="text-sm font-medium text-gray-700">
                        Case Complexity
                      </Label>
                      <Select
                        value={calculatorFields.complexity}
                        onValueChange={(value) => setCalculatorFields((prev) => ({ ...prev, complexity: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple (-10%)</SelectItem>
                          <SelectItem value="medium">Medium (Standard)</SelectItem>
                          <SelectItem value="complex">Complex (+30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Consultation Hours */}
                    <div>
                      <Label htmlFor="consultation" className="text-sm font-medium text-gray-700">
                        Consultation Hours
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={calculatorFields.consultationHours}
                        onChange={(e) =>
                          setCalculatorFields((prev) => ({
                            ...prev,
                            consultationHours: Number.parseInt(e.target.value) || 1,
                          }))
                        }
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">First hour included, $150/hour additional</p>
                    </div>

                    {/* Additional Services */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="additional"
                        checked={calculatorFields.additionalServices}
                        onChange={(e) =>
                          setCalculatorFields((prev) => ({ ...prev, additionalServices: e.target.checked }))
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="additional" className="text-sm text-gray-700">
                        Priority Support (+$500)
                      </Label>
                    </div>

                    {/* Remove the Discount field entirely */}

                    {/* Total Calculation */}
                    <div className="border-t pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Total:</span>
                          <span>${getTotalPrice().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Adjustments:</span>
                          <span>${(calculateAdjustedTotal() - getTotalPrice()).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-blue-600 border-t pt-2">
                          <span>Final Total:</span>
                          <span>${calculateAdjustedTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <FileText className="h-4 w-4 mr-2" />
                        Request Final Quote
                      </Button>
                      <Button
                        onClick={downloadQuotationPDF}
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handlePayment}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Make Payment
                    </Button>
                    </div>
                  </CardContent>
                </Card>
               
                {/* Remove all Service-Specific Fields from here - they're now moved to the left side */}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
              />
            )}  

  {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">LegalIP Pro</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Knowledge Hub
              </a>
            </nav>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>  
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
          <Tabs value={activeServiceTab} onValueChange={setActiveServiceTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-8">
              <TabsTrigger value="patent">Patent Services</TabsTrigger>
              <TabsTrigger value="trademark">Trademark Services</TabsTrigger>
              <TabsTrigger value="copyright">Copyright Services</TabsTrigger>
              <TabsTrigger value="design">Design Services</TabsTrigger>
            </TabsList>

            <TabsContent value="patent">
              <section id="patent-services" className="bg-blue-50 py-8 rounded-lg">
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Patent Services</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      Comprehensive patent services to protect your innovations and inventions
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {patentServices.map((service, index) => (
                      <Card key={index} className="bg-white hover:shadow-lg transition-shadow relative">
                        <CardHeader className="text-center">
                          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">{service.icon}</div>
                          <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 text-center mb-4">
                            {service.description}
                          </CardDescription>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-blue-600">
                              {servicePricing[service.title] != null
                                ? `$${servicePricing[service.title].toLocaleString()}`
                                : "Price not available"}
                            </span>
                            <Button
                              onClick={() => addToCart(service.title, "Patent")}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 rounded-full w-8 h-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="trademark">
              <section id="trademark-services" className="bg-green-50 py-8 rounded-lg">
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trademark Services</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      Protect your brand identity with our comprehensive trademark services
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {trademarkServices.map((service, index) => (
                      <Card key={index} className="bg-white hover:shadow-lg transition-shadow relative">
                        <CardHeader className="text-center">
                          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">{service.icon}</div>
                          <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 text-center mb-4">
                            {service.description}
                          </CardDescription>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-600">
                              ${servicePricing[service.title as keyof typeof servicePricing]?.toLocaleString()}
                            </span>
                            <Button
                              onClick={() => addToCart(service.title, "Trademark")}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 rounded-full w-8 h-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="copyright">
              <section id="copyright-services" className="bg-purple-50 py-8 rounded-lg">
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Copyright Services</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      Safeguard your creative works with our expert copyright protection services
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {copyrightServices.map((service, index) => (
                      <Card key={index} className="bg-white hover:shadow-lg transition-shadow relative">
                        <CardHeader className="text-center">
                          <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">{service.icon}</div>
                          <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 text-center mb-4">
                            {service.description}
                          </CardDescription>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-purple-600">
                              ${servicePricing[service.title as keyof typeof servicePricing]?.toLocaleString()}
                            </span>
                            <Button
                              onClick={() => addToCart(service.title, "Copyright")}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 rounded-full w-8 h-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="design">
              <section id="design-services" className="bg-orange-50 py-8 rounded-lg">
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Design Services</h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      Protect your unique designs and visual innovations with our specialized services
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {designServices.map((service, index) => (
                      <Card key={index} className="bg-white hover:shadow-lg transition-shadow relative">
                        <CardHeader className="text-center">
                          <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">{service.icon}</div>
                          <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 text-center mb-4">
                            {service.description}
                          </CardDescription>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-orange-600">
                              ${servicePricing[service.title as keyof typeof servicePricing]?.toLocaleString()}
                            </span>
                            <Button
                              onClick={() => addToCart(service.title, "Design")}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 rounded-full w-8 h-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Cart Section */}
        <div className="w-full lg:w-80 bg-gray-50 border border-gray-200 rounded-lg p-4 flex-shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
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
                      <p className="text-sm font-semibold text-blue-600">${item.price.toLocaleString()}</p>
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
              <span className="text-xl font-bold text-blue-600">${getTotalPrice().toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={goToQuotePage}>
                Get Quote
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
            <p className="text-xs text-gray-500 mt-2 text-center">*Prices are estimates. Final costs may vary.</p>
          </div>
        </div>
      </div>

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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Scale className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-2xl font-bold">LegalIP Pro</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for comprehensive intellectual property protection services.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#patent-services" className="hover:text-white transition-colors">
                    Patent Services
                  </a>
                </li>
                <li>
                  <a href="#trademark-services" className="hover:text-white transition-colors">
                    Trademark Services
                  </a>
                </li>
                <li>
                  <a href="#copyright-services" className="hover:text-white transition-colors">
                    Copyright Services
                  </a>
                </li>
                <li>
                  <a href="#design-services" className="hover:text-white transition-colors">
                    Design Services
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Our Team
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <p>123 Legal Street</p>
                <p>IP City, LC 12345</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: info@legalippro.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LegalIP Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}