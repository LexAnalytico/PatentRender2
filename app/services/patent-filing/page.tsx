import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Shield, Award, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  title: "Patent Filing Services in India | Complete Application & Drafting Support",
  description: "Expert patent filing services in India. Get professional patentability search, drafting, and application filing support. Affordable rates for startups, MSMEs, and enterprises. Secure your innovation today.",
  keywords: [
    "patent filing india",
    "patent application filing",
    "patent drafting services",
    "patentability search",
    "patent attorney india",
    "file patent india",
    "patent registration india",
    "patent filing cost",
    "provisional patent filing",
    "complete patent filing",
  ],
  alternates: {
    canonical: `${siteUrl}/services/patent-filing`,
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/services/patent-filing`,
    title: "Patent Filing Services in India | IP Protection India",
    description: "Professional patent filing services including search, drafting, and application support. Protect your innovation with expert guidance.",
    siteName: "IP Protection India",
  },
};

export default function PatentFilingPage() {
  return (
    <>
      {/* JSON-LD Schema for Service */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Patent Filing Services India",
            "description": "Complete patent filing services including patentability search, drafting, application filing, and examination response support",
            "provider": {
              "@type": "ProfessionalService",
              "name": "IP Protection India",
              "url": siteUrl
            },
            "areaServed": {
              "@type": "Country",
              "name": "India"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Patent Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Patentability Search",
                    "description": "Comprehensive prior art search to determine novelty and patentability"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Patent Drafting",
                    "description": "Professional patent specification and claims drafting"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Patent Application Filing",
                    "description": "Complete patent application filing with Indian Patent Office"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "First Examination Response",
                    "description": "Expert response to patent office examination reports"
                  }
                }
              ]
            }
          })
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": siteUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Services",
                "item": `${siteUrl}/services`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Patent Filing",
                "item": `${siteUrl}/services/patent-filing`
              }
            ]
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/#services" className="hover:text-blue-600">Services</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Patent Filing</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Patent Filing Services in India
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Protect your innovation with expert patent filing support. From patentability search to complete application filing, we guide you through <Link href="/knowledge-hub/how-to-file-patent-india-2025" className="text-blue-600 hover:text-blue-700 font-medium underline">every step of the patent process in India</Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/#services">Start Filing Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#process">View Process</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why File a Patent in India?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Exclusive Rights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Secure 20 years of exclusive rights to make, use, sell, or license your invention in India.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Award className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Competitive Advantage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Establish market leadership and prevent competitors from copying your innovation.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Scale className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Asset Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Increase company valuation with valuable intellectual property assets for funding and partnerships.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Services */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Complete Patent Filing Services</h2>
            <div className="space-y-6">
              <Card className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                    1. Patentability Search
                  </CardTitle>
                  <CardDescription>Comprehensive prior art search and analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Before investing in a patent application, it's crucial to determine if your invention meets the <Link href="/knowledge-hub/what-can-be-patented-in-india" className="text-blue-600 hover:text-blue-700 font-medium">patentability requirements in India</Link>. Our comprehensive patentability search includes:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Extensive search across global patent databases, scientific publications, and prior art</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Detailed analysis of novelty, utility, and non-obviousness criteria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Professional report with patentability opinion and strategic recommendations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                    2. Patent Drafting
                  </CardTitle>
                  <CardDescription>Professional specification and claims preparation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    A well-drafted patent is the foundation of strong protection. Our expert drafting includes:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Clear and comprehensive specification covering all aspects of your invention</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Strategic claim drafting for maximum protection scope</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Patent-compliant drawings and technical diagrams</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Compliance with Indian Patent Office and international standards</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                    3. Patent Application Filing
                  </CardTitle>
                  <CardDescription>Complete filing with Indian Patent Office</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We handle the entire filing process, ensuring accuracy and compliance:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Preparation of all forms and supporting documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Electronic filing with Indian Patent Office</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Priority claim handling for international applications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Provisional or complete specification filing as per your needs</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                    4. First Examination Response
                  </CardTitle>
                  <CardDescription>Expert response to patent examiner objections</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    When the patent office raises objections, our professionals provide:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Detailed analysis of all objections and citations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Well-reasoned arguments and claim amendments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Strategic approach to maximize claim strength</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Timely submission within statutory deadlines</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Timeline */}
        <section id="process" className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Patent Filing Process & Timeline</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold">1</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Initial Consultation (Day 1-2)</h3>
                  <p className="text-gray-600">
                    Discuss your invention, business goals, and filing strategy. We'll recommend the best approach for your needs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold">2</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Patentability Search (Week 1)</h3>
                  <p className="text-gray-600">
                    Comprehensive search and analysis to determine novelty and assess patentability prospects.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold">3</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Patent Drafting (Week 2-3)</h3>
                  <p className="text-gray-600">
                    Professional drafting of specification, claims, abstract, and drawings with your review and approval.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold">4</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Application Filing (Week 4)</h3>
                  <p className="text-gray-600">
                    Complete filing with Indian Patent Office. You'll receive application number and filing receipt.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold">5</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Examination Request (Month 36-48)</h3>
                  <p className="text-gray-600">
                    Request for examination must be filed within 48 months. Early request available for startups.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold">6</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Patent Grant (Year 3-5)</h3>
                  <p className="text-gray-600">
                    After examination and any responses, patent is granted providing 20 years of protection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How long does patent filing take in India?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    The filing process itself takes 3-4 weeks. However, from application to grant typically takes 3-5 years, depending on examination workload and any objections raised. Startups can get expedited examination.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What can be patented in India?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Inventions that are novel, have an inventive step (non-obvious), and are capable of industrial application can be patented. This includes products, processes, machines, compositions, and improvements. Learn more about <Link href="/knowledge-hub/what-can-be-patented-in-india" className="text-blue-600 hover:text-blue-700 font-medium">patentability criteria and requirements in India</Link>. Software, business methods, and algorithms alone cannot be patented, but technical applications may qualify.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What is the cost of patent filing in India?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Official government fees range from ₹1,600 to ₹8,000 depending on applicant type (individual/startup vs large entity). Professional fees for search, drafting, and filing typically range from ₹50,000 to ₹1,50,000 depending on complexity. For a detailed breakdown, see our complete guide on <Link href="/knowledge-hub/patent-filing-cost-india-startups" className="text-blue-600 hover:text-blue-700 font-medium">patent filing costs for Indian startups</Link>. We offer competitive pricing with transparent quotations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do I need a patent attorney for filing?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    While not legally required, a patent attorney significantly increases success rates. Professional drafting ensures broader claim scope, fewer objections, and stronger protection. Our expertise helps avoid common mistakes that lead to rejection or weak patents.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Should I file provisional or complete specification first?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Provisional specification allows you to secure a filing date while continuing development. You have 12 months to file the complete specification. This is ideal for evolving inventions. Complete specification is filed when the invention is fully developed and ready for examination.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I file for international patent protection?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes, through PCT (Patent Cooperation Treaty) filing, you can seek protection in over 150 countries with a single international application. You have 12 months from Indian filing date to file PCT. We handle both Indian and international patent filings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl my-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Protect Your Innovation?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start your patent filing journey today with expert guidance every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/#services" className="flex items-center gap-2">
                  Start Filing Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                <Link href="/#contact">Schedule Consultation</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Related Services */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Related Services</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Trademark Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Protect your brand identity with trademark registration services.</p>
                  <Link href="/services/trademark-registration" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Copyright Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Secure copyright protection for your creative works and content.</p>
                  <Link href="/services/copyright-registration" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Design Filing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Protect the unique visual appearance of your product designs.</p>
                  <Link href="/services/design-filing" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
