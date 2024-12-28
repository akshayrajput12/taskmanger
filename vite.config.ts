import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      '@supabase/auth-ui-react',
      '@supabase/auth-ui-shared'
    ]
  }
})
