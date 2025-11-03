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
    async headers() {
    // Set no-store on the root document to emulate DevTools "Disable cache" for HTML only.
    // Static assets remain fingerprinted and cached under /_next/static/.
    return [
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ]
  },
}

export default nextConfig
