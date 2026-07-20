import * as path from 'path';
import * as ts from 'typescript';
import MagicString from 'magic-string';
import { serializeType } from './transformer';

/**
 * Official Vite plugin for instancio-js.
 *
 * The core instancio-js transformer is a TypeScript *program* transformer: it needs the full type
 * checker to resolve `Instancio.of<T>()` into a schema. Pipelines built on `tsc`/ts-patch (and
 * ts-jest) run it natively, but Vite-based stacks compile TypeScript with esbuild or a framework
 * compiler and never execute `tsconfig` `plugins` transformers. In those stacks `Instancio.of<T>()`
 * reaches the runtime with no schema and falls back to primitive defaults.
 *
 * This plugin closes that gap without changing the authored source. The developer keeps writing the
 * zero-boilerplate API:
 *
 * ```ts
 * const user = Instancio.of<User>().generate();
 * ```
 *
 * and the plugin injects the schema the `tsc` transformer would have produced. It uses two
 * mechanisms so it works across the whole Vite ecosystem:
 *
 * 1. **Transform chaining** (`transform` hook, `enforce: 'pre'`). esbuild-based stacks - plain Vite,
 *    React + Vitest, Vue + Vitest - compile the code the plugin hands them, so injecting there is
 *    enough.
 * 2. **TypeScript read interception** (`buildStart`/`buildEnd`). `@analogjs/vite-plugin-angular`
 *    compiles the whole Angular program up front through its own `ts` host, bypassing Vite's
 *    per-file transform chain. The plugin briefly wraps `ts.sys.readFile` so the Angular compiler
 *    reads the schema-injected source. Only files that reference `Instancio.of` are ever rewritten,
 *    and the original reader is restored when the build ends.
 *
 * @example
 * // vitest.config.ts with Angular
 * import { defineConfig } from 'vitest/config';
 * import angular from '@analogjs/vite-plugin-angular';
 * import { instancio } from 'instancio-js/dist/vite';
 *
 * export default defineConfig({
 *   plugins: [instancio({ tsconfig: './tsconfig.spec.json' }), angular()],
 *   test: { globals: true, environment: 'happy-dom' },
 * });
 */

export interface InstancioPluginOptions {
  /**
   * Path to the `tsconfig` used to build the type-checking program, relative to the Vite root.
   * Defaults to the nearest `tsconfig.json`. Point this at your test tsconfig (e.g.
   * `tsconfig.spec.json`) so the program sees the same files and types your tests do.
   */
  tsconfig?: string;
  /**
   * Which files the plugin rewrites. Defaults to any `.ts`/`.tsx`/`.mts`/`.cts` file.
   */
  include?: RegExp;
}

/** Minimal structural type of a Vite plugin, so the plugin does not depend on `vite` at build time. */
interface VitePluginLike {
  name: string;
  enforce: 'pre';
  configResolved(config: { root: string }): void;
  buildStart(): void;
  buildEnd(): void;
  transform(code: string, id: string): { code: string; map: ReturnType<MagicString['generateMap']> } | null;
}

const DEFAULT_INCLUDE = /\.[cm]?tsx?$/;

/** Marker set on our patched `ts.sys.readFile` so overlapping plugin instances patch only once. */
const PATCH_MARKER = '__instancioReadFilePatched';

/** TypeScript works with forward slashes; align Vite ids (Windows may hand us backslashes). */
function normalizePath(id: string): string {
  return id.replace(/\\/g, '/');
}

interface SchemaEdit {
  pos: number;
  text: string;
}

/**
 * Walk a source file and collect the schema injections to perform, mirroring the AST transformer's
 * detection: `Instancio.of<T>()`, `Instancio.ofArray<T>(size)` and `Instancio.ofSet<T>(size)` calls
 * that do not already carry an explicit schema argument.
 */
function collectEdits(sourceFile: ts.SourceFile, checker: ts.TypeChecker): SchemaEdit[] {
  const edits: SchemaEdit[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const target = node.expression.expression;
      const method = node.expression.name.text;
      if (
        ts.isIdentifier(target) &&
        target.text === 'Instancio' &&
        (method === 'of' || method === 'ofArray' || method === 'ofSet')
      ) {
        // `of` takes the schema as its only argument; `ofArray`/`ofSet` take it after `size`.
        const hasExplicitSchema = method === 'of' ? node.arguments.length >= 1 : node.arguments.length >= 2;
        const typeNode = node.typeArguments?.[0];
        if (!hasExplicitSchema && typeNode) {
          const type = checker.getTypeFromTypeNode(typeNode);
          const schemaLiteral = JSON.stringify(serializeType(type, checker));
          const pos = node.arguments.end;
          if (method === 'of') {
            edits.push({ pos, text: schemaLiteral });
          } else if (node.arguments.length === 0) {
            // `ofArray<T>()` with no size: match the transformer's default of 0.
            edits.push({ pos, text: `0, ${schemaLiteral}` });
          } else {
            edits.push({ pos, text: `, ${schemaLiteral}` });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return edits;
}

export function instancio(options: InstancioPluginOptions = {}): VitePluginLike {
  const include = options.include ?? DEFAULT_INCLUDE;
  const snapshots = new Map<string, { version: number; text: string }>();

  // Captured raw reader. The language service and the read interception both read the *original*
  // source through this, never through the patched `ts.sys.readFile`, so type resolution and edit
  // positions are always computed against un-injected code (and injection stays idempotent).
  const sysReadFile: typeof ts.sys.readFile = ts.sys.readFile.bind(ts.sys);

  let root = process.cwd();
  let services: ts.LanguageService | undefined;
  let originalReadFile: typeof ts.sys.readFile | undefined;

  function ensureService(): ts.LanguageService {
    if (services) return services;

    const tsconfigPath = options.tsconfig
      ? path.resolve(root, options.tsconfig)
      : ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');
    if (!tsconfigPath) {
      throw new Error(`instancio-js/vite: could not find a tsconfig.json from "${root}". Pass { tsconfig } explicitly.`);
    }

    const configFile = ts.readConfigFile(tsconfigPath, sysReadFile);
    if (configFile.error) {
      throw new Error(
        `instancio-js/vite: failed to read ${tsconfigPath}: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')}`,
      );
    }
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigPath));
    const compilerOptions = parsed.options;
    const rootFileNames = parsed.fileNames.map(normalizePath);

    const host: ts.LanguageServiceHost = {
      getScriptFileNames: () => Array.from(new Set([...rootFileNames, ...snapshots.keys()])),
      getScriptVersion: (fileName) => (snapshots.get(normalizePath(fileName))?.version ?? 0).toString(),
      getScriptSnapshot: (fileName) => {
        const cached = snapshots.get(normalizePath(fileName));
        if (cached) return ts.ScriptSnapshot.fromString(cached.text);
        if (!ts.sys.fileExists(fileName)) return undefined;
        const text = sysReadFile(fileName);
        return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
      },
      getCurrentDirectory: () => path.dirname(tsconfigPath),
      getCompilationSettings: () => compilerOptions,
      getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
      fileExists: ts.sys.fileExists,
      readFile: sysReadFile,
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
      realpath: ts.sys.realpath,
    };

    services = ts.createLanguageService(host, ts.createDocumentRegistry());
    return services;
  }

  /**
   * Resolve the schema injections for `code` (the raw, un-injected source of `fileName`). Returns
   * `null` when there is nothing to do.
   */
  function editsFor(fileName: string, code: string): SchemaEdit[] | null {
    if (!code.includes('Instancio.of')) return null;
    const service = ensureService();

    const previous = snapshots.get(fileName);
    if (!previous || previous.text !== code) {
      snapshots.set(fileName, { version: (previous?.version ?? 0) + 1, text: code });
    }

    const program = service.getProgram();
    const sourceFile = program?.getSourceFile(fileName);
    if (!program || !sourceFile) return null;

    const edits = collectEdits(sourceFile, program.getTypeChecker());
    return edits.length > 0 ? edits : null;
  }

  function applyEdits(code: string, edits: SchemaEdit[], fileName: string) {
    const magic = new MagicString(code);
    for (const edit of edits) {
      magic.appendLeft(edit.pos, edit.text);
    }
    return { code: magic.toString(), map: magic.generateMap({ hires: true, source: fileName }) };
  }

  return {
    name: 'instancio-js',
    enforce: 'pre',

    configResolved(config) {
      root = config.root;
    },

    // Compiler-based stacks (notably @analogjs/vite-plugin-angular) build their whole TypeScript
    // program from disk before Vite's transform chain runs. Wrap ts.sys.readFile so that compiler
    // reads the schema-injected source. Untouched for files without Instancio.of.
    buildStart() {
      if ((ts.sys.readFile as unknown as Record<string, unknown>)[PATCH_MARKER]) return;
      ensureService();
      originalReadFile = ts.sys.readFile;

      const patched: typeof ts.sys.readFile = (fileName, encoding) => {
        const content = sysReadFile(fileName, encoding);
        if (content == null) return content;
        const normalized = normalizePath(fileName);
        if (!include.test(normalized) || !content.includes('Instancio.of')) return content;
        const edits = editsFor(normalized, content);
        return edits ? applyEdits(content, edits, normalized).code : content;
      };
      (patched as unknown as Record<string, unknown>)[PATCH_MARKER] = true;
      ts.sys.readFile = patched;
    },

    buildEnd() {
      if (originalReadFile) {
        ts.sys.readFile = originalReadFile;
        originalReadFile = undefined;
      }
    },

    // esbuild-based stacks (plain Vite, React/Vue + Vitest) compile the code the transform chain
    // produces, so injecting here is enough for them.
    transform(code, id) {
      if (id.startsWith('\0')) return null;
      const fileName = normalizePath(id.split('?')[0]);
      if (!include.test(fileName)) return null;
      const edits = editsFor(fileName, code);
      if (!edits) return null;
      return applyEdits(code, edits, fileName);
    },
  };
}

export default instancio;
