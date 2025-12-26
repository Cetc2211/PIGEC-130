import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['recharts'],
  experimental: {
    // Intento para resolver el problema de bloqueo del servidor.
    // A veces, cambiar cómo Turbopack maneja las rutas puede liberar bloqueos.
    turbopack: {
      resolveAlias: {
        'next/dist/server/web/spec-extension/user-agent':
          'next/dist/server/web/spec-extension/user-agent-none',
      },
      resolveExtensions: {
        '.tsx': ['.dev.tsx', '.tsx'],
      },
      useFileSystemWatching: false,
    },
  },
};

export default nextConfig;
