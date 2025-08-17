import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei', 'gsap', 'framer-motion'],
    optimizeCss: true,
    webpackBuildWorker: true,
  },

  // Production compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Bundle analyzer for production builds
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analyzer-report.html'
          })
        );
      }
      return config;
    }
  }),
  
  // Configure webpack for 3D assets and production optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            three: {
              name: 'three',
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            animations: {
              name: 'animations',
              test: /[\\/]node_modules[\\/](gsap|framer-motion)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Handle GLTF/GLB files with compression
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/models/[name].[contenthash:8][ext]'
      },
      parser: {
        dataUrlCondition: {
          maxSize: 1024 // 1KB - compress small models inline
        }
      }
    });

    // Handle audio files for casino sounds
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/audio/[name].[contenthash:8][ext]'
      }
    });

    // Handle texture files with optimization
    config.module.rules.push({
      test: /\.(jpg|jpeg|png|webp|avif)$/,
      type: 'asset',
      generator: {
        filename: 'static/textures/[name].[contenthash:8][ext]'
      },
      parser: {
        dataUrlCondition: {
          maxSize: 8192 // 8KB
        }
      }
    });

    // Bundle analyzer integration
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../bundle-analyzer-report.html'
        })
      );
    }

    return config;
  },

  // Image optimization for casino assets
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // CDN configuration for production
    ...(process.env.NODE_ENV === 'production' && process.env.CDN_URL && {
      loader: 'custom',
      loaderFile: './src/lib/utils/imageLoader.ts',
    }),
  },

  // Asset prefix for CDN in production
  ...(process.env.NODE_ENV === 'production' && process.env.CDN_URL && {
    assetPrefix: process.env.CDN_URL,
  }),

  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BUILD_TIME: new Date().toISOString(),
    BUILD_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // Headers for better performance and SEO
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/audio/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Generate sitemap and robots.txt
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap'
      }
    ];
  }
};

export default nextConfig;
