import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === 'analyze') {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        filename: 'artifacts/review/bundle-visualizer.html',
        gzipSize: true,
        brotliSize: true,
        open: false,
      })
    );
  }

  return {
    plugins,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      manifest: true,
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
      exclude: [
        'tests/e2e/**',
        'node_modules/**',
        'dist/**',
        '.git/**',
      ],
    },
    base: '/Gate_QA/',
  };
});
