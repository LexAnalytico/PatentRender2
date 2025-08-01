"use client"

import { useState, useEffect } from "react"
import { milestones } from "@/constants/data"
import type { Counters } from "@/types"

export function Milestones() {
  const [counters, setCounters] = useState<Counters>({
    patents: 0,
    trademarks: 0,
    copyrights: 0,
    clients: 0,
  })

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

  return (
    <section id="milestones" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Achievements</h2>
          <p className="text-xl text-gray-600">Trusted by businesses worldwide for intellectual property protection</p>
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
  )
}
