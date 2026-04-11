/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@uxbridge/types"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
