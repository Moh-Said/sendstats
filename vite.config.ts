import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // we need manual chunks to reduce bundle size
        manualChunks: {
          // Vendor libraries chunk (React ecosystem)
          'vendor': ['react', 'react-dom', '@tanstack/react-query'],
          // Chart library chunk
          'charts': ['recharts'],
          // UI libraries chunk
          'ui-libs': ['lucide-react'],
        },
      },
    },
  },
})
