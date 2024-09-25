/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  // Remove any references to 'dist' here if they exist
  transpilePackages: ['axios'],
};

module.exports = nextConfig;