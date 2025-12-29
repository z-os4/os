/**
 * Vite Config Template for zOS Apps
 *
 * Apps built with this config will:
 * - Bundle only app-specific code
 * - Use shared OS libraries from runtime
 * - Export as ES module for dynamic loading
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Output as ES module library
    lib: {
      entry: 'src/index.tsx',
      formats: ['es'],
      fileName: 'index',
    },

    // Externalize OS libraries - they're provided by runtime
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@z-os/core',
        '@z-os/ui',
        '@z-os/sdk',
      ],
      output: {
        // Preserve module structure for tree-shaking
        preserveModules: false,
        // Use global references for externals
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@z-os/core': 'ZOSCore',
          '@z-os/ui': 'ZOSUI',
          '@z-os/sdk': 'ZOSSDK',
        },
      },
    },

    // Small chunks for fast loading
    chunkSizeWarningLimit: 50,

    // Minify for production
    minify: 'esbuild',

    // Source maps for debugging
    sourcemap: true,
  },

  // Define for production build
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
