/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- RESTORED SETTINGS (AWS & Images) ---
  env: {
    NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_USE_DUMMY_DATA: process.env.NEXT_PUBLIC_USE_DUMMY_DATA,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'covers.openlibrary.org', port: '', pathname: '/b/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', port: '', pathname: '/**' },
    ],
    minimumCacheTTL: 60,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',

  // --- THE CORS FIX (Proxy) ---
  async rewrites() {
    // Fallback to the hardcoded IP if variable is missing
    const backendUrl = process.env.MINIKUBE_API_HOST || 'http://127.0.0.1:40029';

    console.log(`[Proxy] Routing /api/proxy -> ${backendUrl}`);

    return [
      {
        source: '/api/proxy/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  eslint: {
    // Allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TS errors if any pop up
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;