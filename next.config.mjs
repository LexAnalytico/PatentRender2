/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optional: use in-memory webpack cache in dev to avoid FS rename issues
  webpack: (config, { dev }) => {
    if (dev && process.env.NEXT_DEV_MEMORY_CACHE === '1') {
      // Use in-memory cache during dev to avoid filesystem rename issues
      config.cache = { type: 'memory' }
    }
    return config
  },
  // Force fresh resources on every deployment to prevent stale client JS in Chrome
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        // Especially aggressive for API routes and data fetching
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
    ]
  },
  // Generate unique build IDs to bust Vercel edge cache on every deploy
  generateBuildId: async () => {
    // Use timestamp + random to ensure every build is unique
    return `build-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  },
}

export default nextConfig
