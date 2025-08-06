import { Scale } from 'lucide-react'
import Link from "next/link"

export function Footer() {
  return (
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
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
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
  )
}
