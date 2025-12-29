import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', '@z-os/core', '@z-os/ui', '@z-os/sdk'],
  treeshake: true,
});
