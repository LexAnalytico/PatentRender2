"use client"

import { Scale, ChevronDown } from "lucide-react"
import { patentServices, trademarkServices, copyrightServices, designServices } from "@/constants/services"

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">LegalIP Pro</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                Patent Services
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {patentServices.map((service) => (
                    <a
                      key={service.title}
                      href="#patent-services"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {service.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                Trademark Services
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {trademarkServices.map((service) => (
                    <a
                      key={service.title}
                      href="#trademark-services"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      {service.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                Copyright Services
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {copyrightServices.map((service) => (
                    <a
                      key={service.title}
                      href="#copyright-services"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      {service.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                Design Services
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {designServices.map((service) => (
                    <a
                      key={service.title}
                      href="#design-services"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      {service.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              Knowledge Hub
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
