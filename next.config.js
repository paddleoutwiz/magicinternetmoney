/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ord-mirror.magiceden.dev'],
    unoptimized: true, // For local images
  },
}

module.exports = nextConfig