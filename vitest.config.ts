import { defineConfig } from 'vitest/config';
import typescript from '@rollup/plugin-typescript';
// @ts-ignore
import ttypescript from 'ttypescript';

export default defineConfig({
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    typecheck: {
      tsconfig: 'tsconfig.build.json',
    },
  },
  // Execute vitest with ttypescript to ensure transformers are working for reflection lib (reflect-metadata)
  plugins: [
    typescript({
      typescript: ttypescript,
    }),
  ],
});
