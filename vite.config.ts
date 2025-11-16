import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['images/homemates-logo.png'],
      manifest: {
        name: 'Homemates',
        short_name: 'Homemates',
        theme_color: '#C2185B',
        icons: [
          {
            src: '/images/homemates-logo.png',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/images/homemates-logo.png',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Add base URL configuration
  base: '/',
  // Add build configuration
  build: {
    outDir: 'dist', // Change to 'dist' as Netlify prefers this
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  },
  // Add cache busting
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    port: 3000,
    // Handle client-side routing in development
    historyApiFallback: true
  }
});
