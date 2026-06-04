import { defineConfig } from 'vitest/config';
import typescript from '@rollup/plugin-typescript';
export default defineConfig({
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    typecheck: {
      tsconfig: 'tsconfig.build.json',
    },
  },
  // Plugins are now handled by ts-patch
  plugins: [typescript()],
});
