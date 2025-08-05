"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { ArrowLeft, ShoppingCart, Calculator, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Banner } from "@/components/sections/Banner"
import { ServiceTabs } from "@/components/sections/ServiceTabs"
import { Cart } from "@/components/sections/Cart"
import { Milestones } from "@/components/sections/Milestones"
import { AuthModal } from "@/components/AuthModal"
import { useAuthForm } from "@/hooks/useAuthForm"
import { downloadQuotationPDF } from "@/utils/pdf"
import { getTotalPrice, calculateAdjustedTotal } from "@/utils/calculations"
import { servicePricing } from "@/constants/data"
import type { CartItem, CalculatorFields, ServiceFields } from "@/types"

export default function LegalIPWebsite() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showQuotePage, setShowQuotePage] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeServiceTab, setActiveServiceTab] = useState("patent")

  // Use the custom auth hook
  const { authForm, authMode, showPassword, setAuthForm, setShowPassword, switchAuthMode } = useAuthForm()

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

  // Memoize cart operations to prevent unnecessary re-renders
  const addToCart = useCallback((serviceName: string, category: string) => {
    const price = servicePricing[serviceName as keyof typeof servicePricing] || 0
    const newItem: CartItem = {
      id: `${serviceName}-${Date.now()}`,
      name: serviceName,
      price,
      category,
    }
    setCartItems((prev) => [...prev, newItem])
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const goToQuotePage = useCallback(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      setShowQuotePage(true)
    }
  }, [isAuthenticated])

  const backToMainPage = useCallback(() => {
    setShowQuotePage(false)
  }, [])

  const handleAuth = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    // Simulate authentication
    setIsAuthenticated(true)
    setShowAuthModal(false)
    setShowQuotePage(true)
  }, [])

  const handleDownloadPDF = useCallback(() => {
    downloadQuotationPDF(cartItems, () => getTotalPrice(cartItems))
  }, [cartItems])

  const getServicesByCategory = useCallback(
    (category: string) => {
      return cartItems.filter((item) => item.category === category)
    },
    [cartItems],
  )

  const hasServicesInCategory = useCallback(
    (category: string) => {
      return cartItems.some((item) => item.category === category)
    },
    [cartItems],
  )

  // Quote Page Component (same as before, but with memoized handlers)
  if (showQuotePage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header for Quote Page */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button onClick={backToMainPage} variant="ghost" className="mr-4 text-gray-600 hover:text-blue-600">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
                <span className="text-2xl font-bold text-gray-900">LegalIP Pro</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Quote Summary</span>
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-gray-600 mr-1" />
                  <span className="text-sm font-medium">{cartItems.length} services</span>
                </div>
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

              {/* Service-Specific Details Forms */}
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

                    {/* Total Calculation */}
                    <div className="border-t pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Total:</span>
                          <span>${getTotalPrice(cartItems).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Adjustments:</span>
                          <span>
                            $
                            {(
                              calculateAdjustedTotal(cartItems, calculatorFields) - getTotalPrice(cartItems)
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-blue-600 border-t pt-2">
                          <span>Final Total:</span>
                          <span>${calculateAdjustedTotal(cartItems, calculatorFields).toLocaleString()}</span>
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
                        onClick={handleDownloadPDF}
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
