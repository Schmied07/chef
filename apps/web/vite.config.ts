import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@services': path.resolve(__dirname, './src/services'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@chef/templates': path.resolve(__dirname, '../../packages/templates/src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    outDir: 'dist',
    // Sprint 5.5 - Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Code splitting for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          editor: ['codemirror', '@codemirror/lang-javascript', '@codemirror/lang-css'],
          ui: ['framer-motion', '@radix-ui/react-icons'],
          state: ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
  envPrefix: ['VITE_', 'REACT_APP_'],
});
