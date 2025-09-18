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
              <li><span className="cursor-default">About Us</span></li>
              <li><span className="cursor-default">Our Team</span></li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><span className="cursor-default">Careers</span></li>
              <li><span className="cursor-default">Contact</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-gray-400">
              <p>8th Floor, A 10, Shilpitha Tech Park- iSprout, Devarabisanahalli Rd, Kariyammana Agrahara, Bellandur, Bengaluru, Karnataka 560103</p>
              <p>Phone: +91 99161 93248</p>
              <p>Email: info@lexanalytico.com</p>
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
