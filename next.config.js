/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        has: [
          {
            type: 'cookie',
            key: 'next-auth.session-token',
            value: 'undefined' // No token
          }
        ],
        destination: '/auth/signin',
        permanent: false
      }
    ];
  },
  swcMinify: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3004',
        pathname: '/uploads/**',
        search: ''
      },
      {
        protocol: 'https',
        hostname: 'hrapi.transporindo.com',
        pathname: '/uploads/**',
        search: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
