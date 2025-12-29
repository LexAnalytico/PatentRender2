import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale, Shield, Clock, DollarSign, CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  title: "Patent vs Trademark: Key Differences and When to Use Each | 2025 Guide",
  description: "Understand the key differences between patents and trademarks. Learn which IP protection is right for your business - comprehensive comparison guide with examples, costs, and expert advice.",
  keywords: [
    "patent vs trademark",
    "difference between patent and trademark",
    "patent or trademark",
    "patent and trademark difference",
    "should i get patent or trademark",
    "trademark vs patent india",
    "patent vs copyright vs trademark",
  ],
  alternates: {
    canonical: `${siteUrl}/knowledge-hub/patent-vs-trademark-differences`,
  },
};

export default function PatentVsTrademarkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Patent vs Trademark: Key Differences and When to Use Each",
            "author": { "@type": "Organization", "name": "IP Protection India" },
            "publisher": { "@type": "Organization", "name": "IP Protection India", "logo": { "@type": "ImageObject", "url": `${siteUrl}/logo.svg` } },
            "datePublished": "2025-01-15"
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
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
            <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mb-4">IP Comparison</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Patent vs Trademark: Key Differences and When to Use Each
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Confused between patent and trademark? This comprehensive guide explains the differences, costs, and helps you choose the right IP protection for your business.
            </p>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Scale className="h-8 w-8 text-indigo-600" />
                Quick Comparison
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Aspect</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold bg-blue-50">Patent</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold bg-purple-50">Trademark</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium">What It Protects</td>
                      <td className="border border-gray-300 px-4 py-3 bg-blue-50/50">Inventions, technical innovations, processes</td>
                      <td className="border border-gray-300 px-4 py-3 bg-purple-50/50">Brand names, logos, slogans, brand identity</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium">Duration</td>
                      <td className="border border-gray-300 px-4 py-3 bg-blue-50/50">20 years (non-renewable)</td>
                      <td className="border border-gray-300 px-4 py-3 bg-purple-50/50">10 years (renewable indefinitely)</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium">Registration Authority</td>
                      <td className="border border-gray-300 px-4 py-3 bg-blue-50/50">Indian Patent Office (IPO)</td>
                      <td className="border border-gray-300 px-4 py-3 bg-purple-50/50">Trademark Registry (TMR)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium">Registration Time</td>
                      <td className="border border-gray-300 px-4 py-3 bg-blue-50/50">3-5 years (regular), 6-12 months (startup expedited)</td>
                      <td className="border border-gray-300 px-4 py-3 bg-purple-50/50">12-24 months</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium">Cost (Startup)</td>
                      <td className="border border-gray-300 px-4 py-3 bg-blue-50/50">₹35,000 - ₹2,00,000</td>
                      <td className="border border-gray-300 px-4 py-3 bg-purple-50/50">₹10,000 - ₹20,000 per class</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium">Public Disclosure</td>
                      <td className="border border-gray-300 px-4 py-3 bg-blue-50/50">Yes - full technical details published</td>
                      <td className="border border-gray-300 px-4 py-3 bg-purple-50/50">Yes - mark published in Journal</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-medium">Examination Required</td>
                      <td className="border border-gray-300 px-4 py-3 bg-blue-50/50">Yes - substantive examination for novelty</td>
                      <td className="border border-gray-300 px-4 py-3 bg-purple-50/50">Yes - examination for conflicts</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium">Maintenance</td>
                      <td className="border border-gray-300 px-4 py-3 bg-blue-50/50">Annual renewal fees from year 3</td>
                      <td className="border border-gray-300 px-4 py-3 bg-purple-50/50">Renewal every 10 years + usage requirement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Patent?</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                A patent protects <strong>inventions</strong> and <strong>technical innovations</strong>. It gives you exclusive rights to make, use, sell, or import your invention for 20 years. Patents protect the <strong>functional aspects</strong> of products or processes. Learn more about our <Link href="/services/patent-filing" className="text-blue-600 hover:text-blue-700 font-medium">patent filing services in India</Link>.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="border-l-4 border-l-green-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Examples of Patentable Inventions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• New machine or device</li>
                      <li>• Manufacturing process</li>
                      <li>• Chemical composition or formula</li>
                      <li>• Pharmaceutical drug</li>
                      <li>• Software with technical application</li>
                      <li>• Biotechnology innovation</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      NOT Patentable
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Business methods or ideas</li>
                      <li>• Mathematical formulas</li>
                      <li>• Algorithms per se</li>
                      <li>• Brand names or logos</li>
                      <li>• Artistic works</li>
                      <li>• Discovery of natural laws</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-blue-900">
                    <strong>Real Example:</strong> A company invents a new type of water purification filter. They can patent the filter design, purification process, and specific technical implementation. This prevents competitors from copying the technology. For startups, check our <Link href="/knowledge-hub/startup-patent-filing-guide-india" className="text-blue-600 hover:text-blue-700 font-medium">startup patent filing guide</Link> for cost-saving strategies.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Trademark?</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                A trademark protects <strong>brand identity</strong> - names, logos, slogans, colors, or sounds that distinguish your goods/services from competitors. It protects the <strong>commercial identity</strong>, not the product itself. For trademark registration support, see our guide on <Link href="/knowledge-hub/trademark-registration-bangalore" className="text-blue-600 hover:text-blue-700 font-medium">trademark registration in Bangalore</Link>.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="border-l-4 border-l-green-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Examples of Trademarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Company name (e.g., "Apple")</li>
                      <li>• Product name (e.g., "iPhone")</li>
                      <li>• Logo or design</li>
                      <li>• Slogan (e.g., "Just Do It")</li>
                      <li>• Shape of product/packaging</li>
                      <li>• Sound or jingle</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <X className="h-5 w-5 text-red-600" />
                      NOT Trademarkable
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Generic terms (e.g., "Water")</li>
                      <li>• Descriptive names without distinctiveness</li>
                      <li>• Government symbols</li>
                      <li>• Offensive/immoral words</li>
                      <li>• Deceptively similar to existing marks</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-purple-900">
                    <strong>Real Example:</strong> The same water purification company can trademark their brand name "AquaPure" and logo. This prevents other companies from using similar names that could confuse customers, even if they sell different types of filters.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">When to Get a Patent</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Choose Patent If:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You've invented something new and novel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Your innovation has technical advantages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You want to prevent competitors from copying your technology</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You need licensing/fundraising leverage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>R&D investment needs protection</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Examples:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• New medical device or diagnostic tool</li>
                      <li>• AI/ML algorithm with technical application</li>
                      <li>• Manufacturing process improvement</li>
                      <li>• Chemical formulation or compound</li>
                      <li>• Electronic circuit or hardware design</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-3">
                      Learn the complete process: <Link href="/knowledge-hub/how-to-file-patent-india-2025" className="text-blue-600 hover:text-blue-700 font-medium">How to file a patent in India</Link>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">When to Get a Trademark</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Choose Trademark If:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>You want to protect your brand name</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>You've designed a unique logo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>You need to prevent brand confusion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Building brand value and recognition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span>Launching a product or service</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Examples:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• E-commerce platform name</li>
                      <li>• Restaurant or cafe branding</li>
                      <li>• SaaS product name</li>
                      <li>• Fashion or apparel brand</li>
                      <li>• Mobile app name and icon</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Can You Have Both?</h2>
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="pt-6">
                  <p className="text-gray-700 mb-4">
                    <strong>Yes!</strong> Patents and trademarks protect different aspects and can coexist. Many successful companies use both:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Patent protects:</h3>
                      <ul className="text-gray-700 space-y-1">
                        <li>• The technology/invention itself</li>
                        <li>• How the product works</li>
                        <li>• Technical implementation</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Trademark protects:</h3>
                      <ul className="text-gray-700 space-y-1">
                        <li>• The brand name</li>
                        <li>• Logo and visual identity</li>
                        <li>• Product name</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    <strong>Example:</strong> Apple has patents for iPhone technology (touch screen, Face ID, etc.) AND trademarks for the "iPhone" name, Apple logo, and "Think Different" slogan.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Cost Comparison</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-t-4 border-t-blue-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Patent Costs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Government Fees (Startup):</span>
                        <span className="font-semibold">₹8,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Professional Services:</span>
                        <span className="font-semibold">₹30,000-₹2,00,000</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">₹35,000-₹2,00,000</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">Duration: 20 years (non-renewable)</p>
                  </CardContent>
                </Card>

                <Card className="border-t-4 border-t-purple-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      Trademark Costs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Government Fees (Startup):</span>
                        <span className="font-semibold">₹4,500/class</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Professional Services:</span>
                        <span className="font-semibold">₹5,000-₹15,000</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total (per class):</span>
                        <span className="text-purple-600">₹10,000-₹20,000</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">Duration: 10 years (renewable indefinitely)</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-8">
              <Card className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-0">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Still Confused? Get Expert Advice</h2>
                  <p className="text-lg mb-6 opacity-90">
                    Our IP attorneys in Bellandur, Bangalore can assess your needs and recommend the right protection strategy.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/contact">Get Free Consultation</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-indigo-600" asChild>
                      <Link href="/services/patent-filing">View IP Services</Link>
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
                    <CardTitle className="text-base">Trademark Registration in Bangalore</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/knowledge-hub/trademark-registration-bangalore" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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
