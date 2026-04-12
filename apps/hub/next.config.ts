import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    // Monorepo root — required for next-on-pages to find workspace packages
    root: path.resolve(__dirname, '../..'),
  },
}

export default nextConfig
