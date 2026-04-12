import type { NextConfig } from 'next'
import path from 'node:path'

const isDevelopment = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  ...(isDevelopment
    ? {
        async rewrites() {
          const localAuthApi = 'http://127.0.0.1:8788'

          return [
            {
              source: '/api/auth',
              destination: `${localAuthApi}/api/auth`,
            },
            {
              source: '/api/auth/:path*',
              destination: `${localAuthApi}/api/auth/:path*`,
            },
          ]
        },
      }
    : {}),
}

export default nextConfig
