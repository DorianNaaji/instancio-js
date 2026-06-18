import { defineConfig, configDefaults } from 'vitest/config';
import typescript from '@rollup/plugin-typescript';
export default defineConfig({
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    // test-jest/** runs under jest (ts-jest astTransformers), not vitest.
    exclude: [...configDefaults.exclude, 'test-jest/**'],
    typecheck: {
      tsconfig: 'tsconfig.build.json',
    },
  },
  // Plugins are now handled by ts-patch
  plugins: [typescript()],
});
