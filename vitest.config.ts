import { defineConfig } from 'vitest/config';
import typescript from '@rollup/plugin-typescript';
import ttypescript from 'ttypescript'

export default defineConfig({
    test: {
        watch: false,
        globals: true,
        environment: 'node',
    },
    // Execute vitest with ttypescript to ensure transformers are working for reflection lib (reflect-metadata)
    plugins: [
        typescript({
            typescript: ttypescript,
        }),
    ],
});