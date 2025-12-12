/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Ambiente Local (DESENVOLVIMENTO)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/uploads/**",
      },

      // Ambiente Produção (VPS)
      {
        protocol: "http",
        hostname: "170.239.185.21",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },

  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
