import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimize for development
  experimental: {
    // Enable Turbopack optimizations
    optimizePackageImports: [
      '@heroicons/react',
      'lucide-react',
      'date-fns',
      'recharts',
      '@tanstack/react-query',
      'axios',
      'react-hook-form',
      'framer-motion',
    ],
    // Reduce memory usage
    webpackMemoryOptimizations: true,
  },

  // Optimize module resolution
  modularizeImports: {
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },

  // Webpack optimizations for development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Use cheaper source maps in development
      config.devtool = 'eval-cheap-module-source-map';
      
      // Optimize chunk splitting
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);