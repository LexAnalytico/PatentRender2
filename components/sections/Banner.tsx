"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { bannerSlides } from "@/constants/data"

export function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Autoplay removed per request: slides now only change via user interaction

  // Navigation via dots only; arrow controls removed

  return (
    <section className="banner-section relative h-[150px] md:h-[160px] overflow-hidden">
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
                <div className="grid lg:grid-cols-2 gap-4 items-center">
                  {/* Content Side */}
                  <div className="text-white space-y-2">
                    <div className="inline-block px-2 py-0.5 bg-blue-600/20 backdrop-blur-sm rounded-full border border-blue-400/30">
                      <span className="text-blue-200 text-[9px] font-medium tracking-wide">Professional IP Services</span>
                    </div>

                    <h1 className="text-lg md:text-2xl font-bold leading-snug">{slide.title}</h1>

                    <p className="text-[13px] md:text-sm text-blue-100 leading-snug max-w-md">{slide.description}</p>

                    <div className="flex flex-col sm:flex-row gap-1.5 pt-0.5">
                      <Button
                        size="lg"
                        aria-disabled
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-[12px] font-semibold rounded-md shadow transition-all pointer-events-none"
                      >
                        Get Started Today
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        aria-disabled
                        className="border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-[12px] font-semibold rounded-md bg-transparent pointer-events-none"
                      >
                        Learn More
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="text-center">
                        <div className="text-sm font-bold text-white leading-tight">2500+</div>
                        <div className="text-blue-200 text-[9px]">Patents Filed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white leading-tight">1800+</div>
                        <div className="text-blue-200 text-[9px]">Trademarks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white leading-tight">950+</div>
                        <div className="text-blue-200 text-[9px]">Happy Clients</div>
                      </div>
                    </div>
                  </div>

                  {/* Image Side */}
                  <div className="relative">
                    <div className="relative z-10">
                      <div className="bg-white/10 backdrop-blur-lg rounded-md p-2.5 border border-white/20 shadow">
                        <img
                          src={slide.image || "/placeholder.svg"}
                          alt={slide.title}
                          className="w-full h-20 md:h-24 object-cover rounded-md shadow-lg"
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

    {/* Navigation arrows removed */}

      {/* Enhanced Dot Indicators */}
  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide ? "w-5 h-1.5 bg-white shadow" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Progress Bar (no autoplay: short transition on manual change) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{ width: `${((currentSlide + 1) / bannerSlides.length) * 100}%` }}
        />
      </div>

      {/* Floating Elements */}
  <div className="absolute top-5 left-5 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse"></div>
  <div className="absolute top-10 right-8 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse delay-1000"></div>
  <div className="absolute bottom-6 left-8 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-2000"></div>
    </section>
  )
}
