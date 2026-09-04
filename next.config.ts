import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: 'pub-c555bbd45f8b41b3bd6910202b4ee75d.r2.dev',
      },
      // Old WordPress-era URLs still referenced in some migrated content
      {
        protocol: 'https',
        hostname: 'staging.alloypress.com',
      },
      {
        protocol: 'https',
        hostname: 'staging1.alloypress.com',
      },
    ],
  },
}

export default nextConfig