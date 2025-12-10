import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default ({ mode }) => {
  // Load environment variables from .env files
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [
      react(),
      tsconfigPaths(),
      sentryVitePlugin({
        org: 'sentry',
        project: 'recipes-ui',
        url: 'https://sentry.alexfricker.com',
        release: process.env.VITE_SENTRY_RELEASE ? { name: process.env.VITE_SENTRY_RELEASE } : undefined,
      }),
    ],

    define: {
      // Ensure proper environment detection for isomorphic effects
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || mode),
    },

    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        '@mantine/core',
        '@mantine/hooks',
        '@mantine/form',
        '@mantine/notifications'
      ],
      exclude: [],
    },

    resolve: {
      alias: {
        // Ensure consistent React usage
        'react': 'react',
        'react-dom': 'react-dom',
        // Force React to resolve to a single instance
        'react/jsx-runtime': 'react/jsx-runtime',
      },
      dedupe: ['react', 'react-dom'],
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.mjs',
    },

    build: {
      sourcemap: true,
      target: 'es2015',
      rollupOptions: {
        output: {
          format: 'es',
          // Let Vite handle chunking automatically for now
        },
      },
    },

    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/admin': {
          target: 'http://localhost:8000/admin',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/admin/, ''),
        },
        '/djangostatic': {
          target: 'http://localhost:8000/djangostatic',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/djangostatic/, ''),
        },
        '/media': {
          target: 'http://localhost:8000/media',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/media/, ''),
        },
      },
    },
  });
};
