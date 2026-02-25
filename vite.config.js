import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    modulePreload: {
      polyfill: false,
    },
    chunkSizeWarningLimit: 350,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (id.includes('better-react-mathjax') || id.includes('mathjax')) {
            return 'vendor-mathjax';
          }
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('scheduler')
          ) {
            return 'vendor-react';
          }
          if (
            id.includes('react-icons') ||
            id.includes('rc-slider') ||
            id.includes('react-select')
          ) {
            return 'vendor-ui';
          }
          return 'vendor-misc';
        },
      },
    },
  },
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: 'node',
  },
  base: '/Gate_QA/',
});
