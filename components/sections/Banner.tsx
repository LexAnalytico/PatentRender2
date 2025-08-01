"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { bannerSlides } from "@/constants/data"

export function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }

  return (
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
  )
}
