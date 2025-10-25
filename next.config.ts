import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Augmenter la limite de taille pour les uploads (30MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',
    },
  },
  // Note: La config API est maintenant gérée via les route handlers
  // Pour configurer la taille max des requêtes, utilisez bodySizeLimit dans serverActions
  images: {
    qualities: [75, 90, 100],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ioyklugzwavjyondimwd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Augmenter la limite de taille pour les uploads de fichiers
  serverRuntimeConfig: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  // Désactiver les erreurs ESLint pendant le build (temporairement)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Garder les erreurs TypeScript
  },
};

export default nextConfig;
