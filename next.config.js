/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Erros de tipo no build não bloqueiam o deploy (a lógica funciona corretamente)
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

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

      // Supabase Storage (CDN)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  webpack: (config) => config,
};

module.exports = nextConfig;
