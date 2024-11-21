import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import terser from '@rollup/plugin-terser'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 800,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      plugins: [terser()],
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-slot'],
          'vendor-utils': ['class-variance-authority', 'clsx', 'tailwind-merge'],
          'vendor-icons': ['lucide-react'],
          'vendor-forms': ['@hookform/resolvers', 'react-hook-form', 'zod'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
