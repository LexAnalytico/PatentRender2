"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Banner } from "@/components/sections/Banner"
import { ServiceTabs } from "@/components/sections/ServiceTabs"
import { Cart } from "@/components/sections/Cart"
import { Milestones } from "@/components/sections/Milestones"
import { AuthModal } from "@/components/modals/AuthModal"
import { downloadQuotationPDF } from "@/utils/pdf"
import { getTotalPrice } from "@/utils/calculations"
import { servicePricing } from "@/constants/data"
import type { CartItem, AuthForm, CalculatorFields, ServiceFields } from "@/types"

export default function LegalIPWebsite() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showQuotePage, setShowQuotePage] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeServiceTab, setActiveServiceTab] = useState("patent")

  // Auth form state
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
  })

  // Calculator state
  const [calculatorFields, setCalculatorFields] = useState<CalculatorFields>({
    urgency: "standard",
    complexity: "medium",
    additionalServices: false,
    consultationHours: 1,
  })

  // Service-specific fields state
  const [serviceFields, setServiceFields] = useState<ServiceFields>({
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

  const addToCart = (serviceName: string, category: string) => {
    const price = servicePricing[serviceName as keyof typeof servicePricing] || 0
    const newItem: CartItem = {
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

  const clearCart = () => {
    setCartItems([])
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

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate authentication
    setIsAuthenticated(true)
    setShowAuthModal(false)
    setShowQuotePage(true)
  }

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

  const handleDownloadPDF = () => {
    downloadQuotationPDF(cartItems, () => getTotalPrice(cartItems))
  }

  if (showQuotePage) {
    // Quote page would be implemented here
    // For now, just show a placeholder
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quote Page</h1>
          <button onClick={backToMainPage} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to Main Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          authMode={authMode}
          authForm={authForm}
          showPassword={showPassword}
          setAuthForm={setAuthForm}
          setShowPassword={setShowPassword}
          switchAuthMode={switchAuthMode}
          handleAuth={handleAuth}
          setShowAuthModal={setShowAuthModal}
        />
      )}

      <Header />
      <Banner />

      {/* Main Content Area: Services on Left, Cart on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <ServiceTabs
          activeServiceTab={activeServiceTab}
          setActiveServiceTab={setActiveServiceTab}
          addToCart={addToCart}
        />

        <Cart
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          goToQuotePage={goToQuotePage}
          downloadQuotationPDF={handleDownloadPDF}
        />
      </div>

      <Milestones />
      <Footer />
    </div>
  )
}
