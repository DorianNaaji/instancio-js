import { InstancioApi } from './instancio-api';
import { TypeSchema } from './schema';

/**
 * The `Instancio` class is a static utility that provides the `of()` method to instantiate
 * the `InstancioApi`. It is designed to handle generic type reflection for use with the
 * `InstancioApi` class, which depends on the type provided at runtime.
 *
 *  The `InstancioApi` itself is not meant to be directly instantiated or manipulated,
 *  but rather it is accessed through the `Instancio.of()` method.
 *
 *  This class is intended for use in type-safe dynamic object creation and reflection scenarios,
 *  using a custom transformer for runtime type inspection.
 *
 * @author https://github.com/DorianNaaji/instancio-js
 * @license MIT
 * @static The class should not be instantiated directly. Use the `of()` method to create an instance of `InstancioApi`.
 */
export class Instancio<T> extends InstancioApi<T> {
  private constructor() {
    super(null);
  }

  /**
   * The `of()` method is used to create an instance of the `InstancioApi` class.
   * This method is the entry point for obtaining a type-reflected Instancio API instance
   * for the given generic type `T`.
   *
   * By default the compile-time transformer extracts the type reference and injects the schema,
   * so you usually call this with no argument. When the transformer cannot run (test runners that
   * strip types such as jest with `@swc/jest` or `babel-jest`, esbuild, etc.), pass an explicit
   * schema built with `t` as an escape hatch.
   *
   * @param schema Normally injected by the transformer; leave it out. Provide a `t`-built schema
   * only when the transformer is unavailable (see the escape-hatch section in the README).
   * @returns An instance of `InstancioApi<T>` that reflects the provided type.
   *
   * @example const myType: MyType = Instancio.of<MyType>().generate(); // transformer
   * @example const myType: MyType = Instancio.of<MyType>(MyTypeSchema).generate(); // explicit schema
   */
  public static of<T>(schema?: TypeSchema): Omit<InstancioApi<T>, 'generateSet' | 'generateArray'> {
    return new InstancioApi(schema);
  }

  /**
   * The `ofArray()` method is used to create an instance of the `InstancioApi` class.
   * This method is the entry point for obtaining a type-reflected Instancio API instance
   * for the given generic type `T`.
   *
   * By default the compile-time transformer injects the schema; pass an explicit `t`-built schema
   * only when the transformer cannot run (see the escape-hatch section in the README).
   *
   * @param size the size of the array that will be generated
   * @param schema Normally injected by the transformer; provide a `t`-built schema only when the
   * transformer is unavailable.
   * @returns An instance of `InstancioApi<T>` that reflects the provided type.
   *
   * @example const arr: MyType[] = Instancio.ofArray<MyType>(5).generateArray();
   * @example const arr: MyType[] = Instancio.ofArray<MyType>(5, MyTypeSchema).generateArray();
   */
  public static ofArray<T>(size: number, schema?: TypeSchema): Omit<InstancioApi<T>, 'generate' | 'generateSet'> {
    return new InstancioApi(schema, size);
  }

  /**
   * The `ofSet()` method is used to create an instance of the `InstancioApi` class.
   * This method is the entry point for obtaining a type-reflected Instancio API instance
   * for the given generic type `T`.
   *
   * By default the compile-time transformer injects the schema; pass an explicit `t`-built schema
   * only when the transformer cannot run (see the escape-hatch section in the README).
   *
   * @param size the size of the set that will be generated
   * @param schema Normally injected by the transformer; provide a `t`-built schema only when the
   * transformer is unavailable.
   * @returns An instance of `InstancioApi<T>` that reflects the provided type.
   *
   * @example const arr: Set<MyType> = Instancio.ofSet<MyType>(5).generateSet();
   * @example const arr: Set<MyType> = Instancio.ofSet<MyType>(5, MyTypeSchema).generateSet();
   */
  public static ofSet<T>(size: number, schema?: TypeSchema): Omit<InstancioApi<T>, 'generate' | 'generateArray'> {
    return new InstancioApi(schema, size);
  }
}
