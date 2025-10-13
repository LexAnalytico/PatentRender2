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
}

export default nextConfig
