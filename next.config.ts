import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // local images from /public are always allowed — no config needed
    remotePatterns: [],
  },
}

export default nextConfig
