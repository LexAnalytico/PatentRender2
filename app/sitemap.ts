import type { MetadataRoute } from 'next'

// Use production URL directly to avoid build-time environment variable issues
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ipprotectionindia.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/main', priority: 0.9, changeFreq: 'daily' as const },
    { path: '/knowledge-hub', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/knowledge-hub/how-to-file-patent-india-2025', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/knowledge-hub/what-can-be-patented-in-india', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/knowledge-hub/startup-patent-filing-guide-india', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/knowledge-hub/patent-filing-cost-india-startups', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/knowledge-hub/trademark-registration-bangalore', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/knowledge-hub/patent-vs-trademark-differences', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/knowledge-hub/smell-trademark-olfactory-mark-registration-india', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/forms', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFreq: 'monthly' as const },
  ]

  const now = new Date().toISOString()

  return routes.map(({ path, priority, changeFreq }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: changeFreq,
    priority,
  }))
}
