import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.pem'], // Handle .pem files as assets
  server: {
    host: '0.0.0.0', // Allow external connections (Docker)
    port: 3000,
    fs: {
      // Allow serving files from the entire app directory in Docker
      allow: [
        // Allow the entire container workspace
        '/app',
        // Allow the src directory specifically
        '/app/src',
        // Allow assets directory
        '/app/src/assets'
      ],
    },
    proxy: {
      '/api': {
        target: 'http://server:3001', // Use service name in Docker
        changeOrigin: true,
      },
      '/keys': {
        target: 'http://server:3001', // Use service name in Docker
        changeOrigin: true,
      }
    }
  }
})