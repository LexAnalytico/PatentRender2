"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { patentServices } from "@/constants/services"
import { servicePricing } from "@/constants/data"
import { getServiceIcon } from "@/utils/serviceIcons"
import { Clock, Sparkles } from "lucide-react"

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
                      <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                        {getServiceIcon(service.title, "Patent")}
                      </div>
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
          <section id="trademark-services" className="bg-green-50 py-12 rounded-lg">
            <div className="px-4 sm:px-6 lg:px-8 text-center">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-100 ring-2 ring-green-200 flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Trademark Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">We’re polishing a great set of trademark services to secure your brand. Launching soon.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Sparkles className="h-4 w-4 mr-2" /> Notify me
                </Button>
                <Button variant="outline" onClick={() => setActiveServiceTab("patent")}>Explore Patent Services</Button>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="copyright">
          <section id="copyright-services" className="bg-purple-50 py-12 rounded-lg">
            <div className="px-4 sm:px-6 lg:px-8 text-center">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-purple-100 ring-2 ring-purple-200 flex items-center justify-center">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Copyright Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">We’re crafting copyright offerings to protect your creative work. Coming soon.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Sparkles className="h-4 w-4 mr-2" /> Notify me
                </Button>
                <Button variant="outline" onClick={() => setActiveServiceTab("patent")}>Explore Patent Services</Button>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="design">
          <section id="design-services" className="bg-orange-50 py-12 rounded-lg">
            <div className="px-4 sm:px-6 lg:px-8 text-center">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-orange-100 ring-2 ring-orange-200 flex items-center justify-center">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Design Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Beautiful design protection services are on the way. Stay tuned!</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Sparkles className="h-4 w-4 mr-2" /> Notify me
                </Button>
                <Button variant="outline" onClick={() => setActiveServiceTab("patent")}>Explore Patent Services</Button>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
