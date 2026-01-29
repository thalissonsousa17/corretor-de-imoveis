/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // PRODUÇÃO (domínio oficial)
      {
        protocol: "https",
        hostname: "imobhub.automatech.app.br",
        pathname: "/api/uploads/**",
      },

      // DESENVOLVIMENTO
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/api/uploads/**",
      },

      // (opcional) acesso por IP na VPS
      {
        protocol: "http",
        hostname: "170.239.185.21",
        pathname: "/api/uploads/**",
      },
    ],
  },

  webpack: (config) => config,
};

module.exports = nextConfig;
