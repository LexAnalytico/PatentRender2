import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award, CheckCircle, Clock, FileText, Search, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  title: "Trademark Registration in Bangalore 2025 - Complete Process Guide",
  description: "Complete guide to trademark registration in Bangalore. Expert trademark attorneys in Bellandur for brand registration, search, filing, and protection services. Updated 2025 process.",
  keywords: [
    "trademark registration bangalore",
    "trademark attorney bangalore",
    "brand registration bangalore",
    "trademark lawyer bellandur",
    "trademark filing bangalore",
    "trademark search bangalore",
    "bangalore trademark services",
    "trademark registration bellandur",
    "trademark attorney bellandur bangalore",
  ],
  alternates: {
    canonical: `${siteUrl}/knowledge-hub/trademark-registration-bangalore`,
  },
};

export default function TrademarkBangalorePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Trademark Registration in Bangalore 2025 - Complete Process Guide",
            "author": { "@type": "Organization", "name": "IP Protection India" },
            "publisher": { "@type": "Organization", "name": "IP Protection India", "logo": { "@type": "ImageObject", "url": `${siteUrl}/logo.svg` } },
            "datePublished": "2025-01-15"
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/knowledge-hub" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Hub
            </Link>
          </div>
        </header>

        <article className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-4">Trademark Guide</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trademark Registration in Bangalore 2025: Complete Process Guide
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Expert guide to trademark registration from our Bellandur, Bangalore office. Protect your brand with professional trademark attorneys.
            </p>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-600" />
                Why Register Your Trademark in Bangalore?
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Bangalore, India's startup capital, is home to thousands of innovative brands. As a tech and business hub, trademark registration is crucial for startups and established businesses in Bellandur, Koramangala, Whitefield, and across Bengaluru. If you also need to protect technical innovations, check out our <Link href="/services/patent-filing" className="text-blue-600 hover:text-blue-700 font-medium">patent filing services in India</Link>.
              </p>
              <p className="text-gray-700 mb-4">
                Our trademark attorneys in Bellandur, Bangalore specialize in brand protection for tech startups, e-commerce businesses, and service providers across Karnataka and India. Not sure if you need a trademark or patent? Read our guide on <Link href="/knowledge-hub/patent-vs-trademark-differences" className="text-blue-600 hover:text-blue-700 font-medium">patent vs trademark differences</Link>.
              </p>

              <div className="grid md:grid-cols-3 gap-4 my-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Brand Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Exclusive rights to use your brand name and logo across India</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Legal Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Sue infringers and protect against copycats and counterfeiters</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      Brand Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Registered trademark is an intangible asset that increases company valuation</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Step-by-Step Trademark Registration Process</h2>
              
              <div className="space-y-6">
                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                      <Search className="h-6 w-6 text-blue-600" />
                      Trademark Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Search the Trademark Registry database to ensure your mark is available and not similar to existing registered marks.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Cost:</strong> ₹1,000-₹5,000 (professional search) | <strong>Time:</strong> 1-2 days
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                      <FileText className="h-6 w-6 text-green-600" />
                      Application Filing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      File TM-A form online with trademark representation, class selection, and applicant details.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Government Fee:</strong> ₹4,500 (individual/startup), ₹9,000 (company) per class
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                      Vienna Codification & Examination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      Trademark office assigns Vienna codes (for logos) and examines for conflicts and compliance.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Time:</strong> 6-12 months for examination report
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                      Publication in Journal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                      If accepted, mark is published in Trademark Journal for 4-month opposition period.
                    </p>
                    <p className="text-sm text-gray-600">
                      Anyone can oppose registration within 4 months if they have prior rights
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">5</div>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      Registration Certificate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">
                    If no opposition, registration certificate is issued. Valid for 10 years, renewable indefinitely. For innovative trademark types, explore our article on <Link href="/knowledge-hub/smell-trademark-olfactory-mark-registration-india" className="text-blue-600 hover:text-blue-700 font-medium">smell trademark registration in India</Link>.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Total Time:</strong> 12-24 months from filing to registration
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Trademark Classes and Costs</h2>
              <p className="text-gray-700 mb-4">
                Trademarks are registered per class of goods/services. Choose classes carefully based on your business activities.
              </p>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left">Fee Type</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Individual/Startup</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Filing Fee (per class)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹4,500</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">₹9,000</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Trademark Search</td>
                      <td className="border border-gray-300 px-4 py-2 text-center" colSpan={2}>₹1,000-₹5,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Professional Fees</td>
                      <td className="border border-gray-300 px-4 py-2 text-center" colSpan={2}>₹5,000-₹15,000 per class</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Response to Objection</td>
                      <td className="border border-gray-300 px-4 py-2 text-center" colSpan={2}>₹2,000-₹8,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-blue-900">
                    <strong>Typical Cost for Bangalore Startup:</strong> ₹10,000-₹20,000 total per class (including government and professional fees)
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Trademark Classes for Bangalore Businesses</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Class 9 - Software & Technology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Computer software, mobile apps, SaaS platforms, tech products</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Class 35 - Business Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Advertising, marketing, e-commerce platforms, business consulting</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Class 42 - IT Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Software development, cloud services, IT consulting, web hosting</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Class 25 - Apparel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Clothing, footwear, fashion brands</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-8">
              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Need Trademark Registration in Bangalore?</h2>
                  <p className="text-lg mb-6 opacity-90">
                    Our trademark attorneys in Bellandur, Bangalore provide end-to-end brand registration services for startups and businesses.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/contact">Get Free Consultation</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600" asChild>
                      <Link href="/#trademark-services">View Trademark Services</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">How to File a Patent in India 2025</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/knowledge-hub/how-to-file-patent-india-2025" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Patent vs Trademark Differences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/knowledge-hub/patent-vs-trademark-differences" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">Patent Filing Cost for Startups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/knowledge-hub/patent-filing-cost-india-startups" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Read More →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
