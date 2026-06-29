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
 * With `isolatedModules: false` ts-jest type-checks the whole program. Projects that import ESM-only
 * packages with no `require` condition (e.g. Angular 16+: `@angular/core/testing`) will get TS2307
 * (or TS1479 under node16/nodenext) for those imports. The transformer only needs *your* types; the
 * ESM modules are resolved at runtime by jest's `moduleNameMapper`. Suppress the resolution
 * diagnostics so the program still builds, without touching `module`/`moduleResolution`:
 *
 * ```js
 *   diagnostics: { ignoreCodes: [2307, 1479, 151002] },
 * ```
 *
 * @see https://kulshekhar.github.io/ts-jest/docs/getting-started/options/astTransformers
 */

/** ts-jest cache-busting version. Bump when the transformer behavior changes. */
export const version = 2;

/** Unique name used by ts-jest to key the transformer. */
export const name = 'instancio-js';

/**
 * The compiler instance ts-jest passes to `factory`. We only need a `Program` to reach the type
 * checker; typed loosely so this module does not depend on ts-jest at build time.
 *
 * ts-jest's legacy compiler stores its language service privately as `_languageService`, so we look
 * for both the public and the private field.
 */
interface TsCompilerInstanceLike {
  program?: ts.Program;
  languageService?: ts.LanguageService;
  _languageService?: ts.LanguageService;
}

/**
 * Resolve the live TypeScript `Program` from a ts-jest compiler instance.
 *
 * In language-service mode (`isolatedModules: false`) the language service owns the up-to-date,
 * multi-file `Program`. `compilerInstance.program` can be a *stale* snapshot captured before the
 * service loaded the project - notably with jest-preset-angular's `NgJestCompiler`, where reading
 * `compilerInstance.program` yields an empty program and the transformer then resolves every
 * `Instancio.of<T>()` to an empty schema. We therefore prefer the language service's `getProgram()`
 * and only fall back to `compilerInstance.program` when no service is exposed (pure program mode).
 */
function resolveProgram(compilerInstance: TsCompilerInstanceLike): ts.Program | undefined {
  const languageService = compilerInstance.languageService ?? compilerInstance._languageService;
  return languageService?.getProgram() ?? compilerInstance.program;
}

/**
 * ts-jest program-transformer factory. Returns the same transformer used by the `tsc`/ts-patch
 * pipeline, bound to the program ts-jest built for the current test file.
 */
export function factory(compilerInstance: TsCompilerInstanceLike): ts.TransformerFactory<ts.SourceFile> {
  const program = resolveProgram(compilerInstance);
  if (!program) {
    throw new Error(
      'instancio-js: ts-jest did not expose a TypeScript Program. Set `isolatedModules: false` in your ts-jest config so the type checker is available.',
    );
  }
  return instancioTransformer(program);
}
