"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { patentServices, trademarkServices, copyrightServices, designServices } from "@/constants/services"
import { servicePricing } from "@/constants/data"

interface ServiceTabsProps {
  activeServiceTab: string
  setActiveServiceTab: (tab: string) => void
  addToCart: (serviceName: string, category: string) => void
}

export function ServiceTabs({ activeServiceTab, setActiveServiceTab, addToCart }: ServiceTabsProps) {
  return (
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
                          ${servicePricing[service.title as keyof typeof servicePricing]?.toLocaleString()}
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
  )
}
