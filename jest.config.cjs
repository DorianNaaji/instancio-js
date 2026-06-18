// Jest harness that exercises the shipped ts-jest entry point (dist/jest-transformer).
// It proves that `Instancio.of<T>().generate()` keeps working, with no per-call boilerplate,
// when the transformer is registered through ts-jest's astTransformers instead of ts-patch.
// The main test runner is still vitest (see vitest.config.ts); this only covers the ts-jest path.
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test-jest'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
        astTransformers: {
          before: ['./dist/jest-transformer.js'],
        },
      },
    ],
  },
};
