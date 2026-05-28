/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ord-mirror.magiceden.dev'],
    unoptimized: true, // For local images
  },
  async redirects() {
    return [
      // The dashboard moved from /bridge to /wizard when the product
      // was renamed (the word "bridge" implied cross-chain transfer,
      // which this thing is not). 308 = permanent + preserves method.
      {
        source: '/bridge',
        destination: '/wizard',
        permanent: true,
      },
      // Catch any sub-paths under /bridge too, on the off chance we add
      // nested routes in the future (e.g. /bridge/burns).
      {
        source: '/bridge/:path*',
        destination: '/wizard/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;