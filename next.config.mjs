/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimise for production deployments (standalone output for Docker/serverless)
  output: "standalone",

  // Remove the "X-Powered-By: Next.js" header for security
  poweredByHeader: false,

  // Compress responses automatically
  compress: true,

  // Strict React mode for catching potential issues early
  reactStrictMode: true,

  // Allow images from external sources (extend as needed)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },

  // Production security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
