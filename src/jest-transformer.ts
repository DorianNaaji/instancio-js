import * as ts from 'typescript';
import instancioTransformer from './transformer';

/**
 * ts-jest entry point for the instancio-js transformer.
 *
 * The core transformer is a TypeScript *program* transformer: it needs the full type checker to
 * resolve `Instancio.of<T>()` into a schema. ts-jest can run it directly through its
 * `astTransformers` option, without `ts-patch` and without a `tsconfig` `plugins` entry.
 *
 * This is the recommended way to keep the zero-boilerplate `Instancio.of<T>().generate()` API in
 * environments where the default `tsc`/ts-patch pipeline does not run, e.g. an nx monorepo whose
 * jest projects must use ts-jest instead of `@swc/jest`.
 *
 * Register it in your jest config:
 *
 * ```js
 * transform: {
 *   '^.+\\.tsx?$': ['ts-jest', {
 *     // a program transformer needs the real Program, so isolatedModules must stay false
 *     isolatedModules: false,
 *     astTransformers: { before: ['instancio-js/dist/jest-transformer'] },
 *   }],
 * }
 * ```
 *
 * @see https://kulshekhar.github.io/ts-jest/docs/getting-started/options/astTransformers
 */

/** ts-jest cache-busting version. Bump when the transformer behavior changes. */
export const version = 1;

/** Unique name used by ts-jest to key the transformer. */
export const name = 'instancio-js';

/**
 * The compiler instance ts-jest passes to `factory`. We only need its `program` to reach the
 * type checker; typed loosely so this module does not depend on ts-jest at build time.
 */
interface TsCompilerInstanceLike {
  program?: ts.Program;
  languageService?: ts.LanguageService;
}

/**
 * ts-jest program-transformer factory. Returns the same transformer used by the `tsc`/ts-patch
 * pipeline, bound to the program ts-jest built for the current test file.
 */
export function factory(compilerInstance: TsCompilerInstanceLike): ts.TransformerFactory<ts.SourceFile> {
  const program = compilerInstance.program ?? compilerInstance.languageService?.getProgram();
  if (!program) {
    throw new Error(
      'instancio-js: ts-jest did not expose a TypeScript Program. Set `isolatedModules: false` in your ts-jest config so the type checker is available.',
    );
  }
  return instancioTransformer(program);
}
