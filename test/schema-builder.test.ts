import 'reflect-metadata';

import { describe, it, expect } from 'vitest';
import { Instancio, t, Infer } from '../src';

/**
 * These tests pass an explicit schema built with `t`, without relying on the
 * compile-time transformer. This is the escape hatch for environments where the
 * transformer cannot run (jest with @swc/jest or babel-jest, esbuild, etc.).
 */
describe('Explicit schema builder (transformer-free escape hatch)', () => {
  const UserSchema = t.object({
    name: t.string,
    age: t.number,
    active: t.boolean,
    tags: t.array(t.string),
    role: t.enum(['admin', 'user', 'guest'] as const),
    pair: t.tuple(t.string, t.number),
  });
  type User = Infer<typeof UserSchema>;

  it('generates a fully populated object from an explicit schema', () => {
    const user: User = Instancio.of<User>(UserSchema).generate();

    expect(typeof user.name).toBe('string');
    expect(typeof user.age).toBe('number');
    expect(typeof user.active).toBe('boolean');
    expect(Array.isArray(user.tags)).toBe(true);
    expect(user.tags.every((tag) => typeof tag === 'string')).toBe(true);
    expect(['admin', 'user', 'guest']).toContain(user.role);
    expect(user.pair).toHaveLength(2);
    expect(typeof user.pair[0]).toBe('string');
    expect(typeof user.pair[1]).toBe('number');
  });

  it('honors set/supply/ignore with an explicit schema', () => {
    const user = Instancio.of<User>(UserSchema)
      .set('name', 'Alice')
      .supply('age', () => 30)
      .ignore('active')
      .generate();

    expect(user.name).toBe('Alice');
    expect(user.age).toBe(30);
    expect(user.active).toBeUndefined();
  });

  it('generates arrays and sets from an explicit schema', () => {
    const users = Instancio.ofArray<User>(4, UserSchema).generateArray();
    expect(users).toHaveLength(4);
    users.forEach((u) => expect(typeof u.name).toBe('string'));

    const set = Instancio.ofSet<User>(3, UserSchema).generateSet();
    expect(set.size).toBeGreaterThan(0);
  });

  it('supports nested objects, literals and unions', () => {
    const schema = t.object({
      id: t.literal('fixed-id'),
      nested: t.object({ value: t.number }),
      flag: t.union(t.boolean, t.literal('maybe')),
    });
    type Shape = Infer<typeof schema>;

    const obj: Shape = Instancio.of<Shape>(schema).generate();
    expect(obj.id).toBe('fixed-id');
    expect(typeof obj.nested.value).toBe('number');
    expect([true, false, 'maybe']).toContain(obj.flag);
  });
});
