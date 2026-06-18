import { EnumValueSchema, TypeSchema } from './schema';

/**
 * A `TypeSchema` carrying a phantom type `T`, so that the shape described by the
 * builder can be recovered at the type level through {@link Infer}.
 *
 * It is a plain `TypeSchema` at runtime: the `__type` brand never exists as a value.
 */
export interface Schema<T> extends TypeSchema {
  /** Phantom marker, never present at runtime. Do not read. */
  readonly __type?: T;
}

/**
 * Recovers the TypeScript type described by a {@link Schema} built with {@link t}.
 *
 * @example
 * const User = t.object({ name: t.string, age: t.number });
 * type User = Infer<typeof User>; // { name: string; age: number }
 */
export type Infer<S> = S extends Schema<infer T> ? T : never;

type InferProps<P extends Record<string, Schema<unknown>>> = {
  [K in keyof P]: Infer<P[K]>;
};

type InferTuple<E extends ReadonlyArray<Schema<unknown>>> = {
  [K in keyof E]: E[K] extends Schema<infer T> ? T : never;
};

function primitive<T>(kind: TypeSchema['kind']): Schema<T> {
  return { kind } as Schema<T>;
}

/**
 * Explicit schema builder for instancio-js.
 *
 * Use it to describe a type by hand when the compile-time transformer cannot run,
 * typically under test runners that strip types instead of compiling through `tsc`
 * (jest with `@swc/jest` or `babel-jest`, the nx default; esbuild; etc.).
 *
 * The produced schema is passed explicitly to `Instancio.of` / `ofArray` / `ofSet`:
 *
 * @example
 * import { Instancio, t, Infer } from 'instancio-js';
 *
 * const User = t.object({ name: t.string, age: t.number, active: t.boolean });
 * type User = Infer<typeof User>;
 *
 * const user = Instancio.of<User>(User).generate();
 */
export const t = {
  /** Random string. */
  get string(): Schema<string> {
    return primitive<string>('string');
  },
  /** Random number. */
  get number(): Schema<number> {
    return primitive<number>('number');
  },
  /** Random boolean. */
  get boolean(): Schema<boolean> {
    return primitive<boolean>('boolean');
  },
  /** Random bigint. */
  get bigint(): Schema<bigint> {
    return primitive<bigint>('bigint');
  },
  /** Random symbol. */
  get symbol(): Schema<symbol> {
    return primitive<symbol>('symbol');
  },
  /** Random date. */
  get date(): Schema<Date> {
    return primitive<Date>('date');
  },
  /** Behaves like a default string. */
  get any(): Schema<any> {
    return primitive<any>('any');
  },
  /** Behaves like a default string. */
  get unknown(): Schema<unknown> {
    return primitive<unknown>('unknown');
  },
  /** Always `null`. */
  get null(): Schema<null> {
    return primitive<null>('null');
  },
  /** Always `undefined`. */
  get undefined(): Schema<undefined> {
    return primitive<undefined>('undefined');
  },

  /** A literal value, returned as-is. */
  literal<const V>(value: V): Schema<V> {
    return { kind: 'literal', value } as Schema<V>;
  },

  /**
   * One value picked at random among `values`.
   * Accepts a list of values or a TypeScript enum object.
   */
  enum<const V>(values: readonly V[] | Record<string, V>): Schema<V> {
    const list: V[] = Array.isArray(values) ? [...values] : Object.values(values as Record<string, V>);
    const enumValues: EnumValueSchema[] = list.map((value) => ({ name: String(value), value }));
    return { kind: 'enum', values: enumValues } as Schema<V>;
  },

  /** An object whose properties are themselves schemas. */
  object<P extends Record<string, Schema<unknown>>>(properties: P): Schema<InferProps<P>> {
    return {
      kind: 'object',
      properties: Object.entries(properties).map(([name, schema]) => ({ name, schema })),
    } as Schema<InferProps<P>>;
  },

  /** An array of the given element schema. */
  array<E>(elementType: Schema<E>): Schema<E[]> {
    return { kind: 'array', elementType } as Schema<E[]>;
  },

  /** A fixed-length tuple of the given element schemas. */
  tuple<E extends ReadonlyArray<Schema<unknown>>>(...elements: E): Schema<InferTuple<E>> {
    return { kind: 'tuple', elements: [...elements] } as Schema<InferTuple<E>>;
  },

  /** A union: one of the given schemas is picked at random. */
  union<E extends ReadonlyArray<Schema<unknown>>>(...types: E): Schema<Infer<E[number]>> {
    return { kind: 'union', types: [...types] } as Schema<Infer<E[number]>>;
  },
};
