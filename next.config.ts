import type { NextConfig } from 'next';

// Allow Server Actions from any Railway-generated or custom domain
const allowedOrigins = [
  'localhost:3000',
  // Railway injects RAILWAY_PUBLIC_DOMAIN at runtime; we handle it
  // by accepting all origins in the serverActions config below.
  ...(process.env.RAILWAY_PUBLIC_DOMAIN
    ? [process.env.RAILWAY_PUBLIC_DOMAIN]
    : []),
  ...(process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, '')]
    : []),
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure Next.js uses the PORT env var that Railway injects
  // (Next.js 15 honours PORT automatically, but this makes it explicit)
  ...(process.env.PORT ? { } : {}),
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

export default nextConfig;
