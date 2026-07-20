import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { instancio } from '../src/vite';
import { Instancio } from '../src';

const fixturePath = path.resolve(__dirname, 'fixtures/vite-fixture.ts');

function transformFixture() {
  const plugin = instancio({ tsconfig: 'tsconfig.json' });
  plugin.configResolved({ root: process.cwd() });
  const code = fs.readFileSync(fixturePath, 'utf8');
  return plugin.transform(code, fixturePath);
}

/** Extract a JSON object literal starting at the first `{` after `marker`, matching balanced braces. */
function extractSchema(code: string, marker: string): unknown {
  const from = code.indexOf(marker);
  if (from === -1) throw new Error(`marker not found: ${marker}`);
  const open = code.indexOf('{', from);
  let depth = 0;
  let end = open;
  for (; end < code.length; end++) {
    if (code[end] === '{') depth++;
    else if (code[end] === '}' && --depth === 0) {
      end++;
      break;
    }
  }
  return JSON.parse(code.slice(open, end));
}

describe('instancio-js vite plugin', () => {
  it('injects the resolved schema into a zero-arg Instancio.of<T>()', () => {
    const result = transformFixture();
    expect(result).not.toBeNull();
    expect(result!.code).toContain('Instancio.of<User>({"kind":"object"');
    // nested objects and arrays are serialized recursively
    expect(result!.code).toContain('"name":"address"');
    expect(result!.code).toContain('"kind":"array"');
  });

  it('injects the schema after the size argument for ofArray<T>(size)', () => {
    const result = transformFixture();
    expect(result!.code).toContain('Instancio.ofArray<User>(3, {"kind":"object"');
  });

  it('leaves a call with an explicit schema untouched', () => {
    const result = transformFixture();
    expect(result!.code).toContain("Instancio.of<User>({ kind: 'object', properties: [] })");
  });

  it('emits a source map', () => {
    const result = transformFixture();
    expect(result!.map).toBeTruthy();
  });

  it('the injected schema generates a fully populated object at runtime', () => {
    const result = transformFixture();
    const schema = extractSchema(result!.code, 'Instancio.of<User>({"kind"');
    const generated = Instancio.of<Record<string, any>>(schema as any).generate();

    expect(typeof generated.name).toBe('string');
    expect(typeof generated.age).toBe('number');
    expect(typeof generated.active).toBe('boolean');
    expect(typeof generated.address.city).toBe('string');
    expect(typeof generated.address.zip).toBe('number');
    expect(Array.isArray(generated.tags)).toBe(true);
    expect(generated.tags.every((t: unknown) => typeof t === 'string')).toBe(true);
  });

  it('returns null for files without Instancio.of calls', () => {
    const plugin = instancio({ tsconfig: 'tsconfig.json' });
    plugin.configResolved({ root: process.cwd() });
    expect(plugin.transform('export const x = 1;', path.resolve('noop.ts'))).toBeNull();
  });
});
