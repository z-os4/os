import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'window/index': 'src/window/index.ts',
    'quick-look/index': 'src/quick-look/index.ts',
    'notifications/index': 'src/notifications/index.ts',
    'theme/index': 'src/theme/index.ts',
    'context-menu/index': 'src/context-menu/index.ts',
    'a11y/index': 'src/a11y/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@z-os/core'],
  treeshake: true,
});
