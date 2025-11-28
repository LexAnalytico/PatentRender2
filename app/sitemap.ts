import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/main', priority: 0.9, changeFreq: 'daily' as const },
    { path: '/knowledge-hub', priority: 0.8, changeFreq: 'weekly' as const },
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
