// next.config.js
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["strapi-speicher.s3.eu-central-1.amazonaws.com"],
    unoptimized: true,
  },
}
