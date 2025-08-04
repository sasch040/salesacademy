/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "strapi-speicher.s3.eu-central-1.amazonaws.com",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
