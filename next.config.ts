import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // .svg sources (our placeholders) are served as-is: Next never optimizes SVG.
    // Phase 2: add { protocol: 'https', hostname: 'cdn.shopify.com' }
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'radix-ui'],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
