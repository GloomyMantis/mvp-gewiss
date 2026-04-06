/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  generateBuildId: async () => 'build',
  // Skip prerendering pages that use Supabase
  output: 'standalone',
}
module.exports = nextConfig
