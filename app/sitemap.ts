import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/main',
    '/knowledge-hub',
    '/forms',
    '/privacy',
  ]

  const now = new Date().toISOString()

  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1.0 : 0.7,
  }))
}
