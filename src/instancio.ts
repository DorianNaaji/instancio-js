import { CallSite, reflect } from 'typescript-rtti';
import { ReflectedTypeRef } from 'typescript-rtti/src/lib/reflect';
import { InstancioApi } from './instancio-api';
import 'reflect-metadata';
import { CollectionKind } from './collection-kind';

/**
 * The `Instancio` class is a static utility that provides the `of()` method to instantiate
 * the `InstancioApi`. It is designed to handle generic type reflection for use with the
 * `InstancioApi` class, which depends on the type provided at runtime.
 *
 *  The `InstancioApi` itself is not meant to be directly instantiated or manipulated,
 *  but rather it is accessed through the `Instancio.of()` method.
 *
 *  This class is intended for use in type-safe dynamic object creation and reflection scenarios,
 *  using the `typescript-rtti` library for runtime type inspection.
 *
 * @author https://github.com/DorianNaaji/instancio-js
 * @license MIT
 * @static The class should not be instantiated directly. Use the `of()` method to create an instance of `InstancioApi`.
 */
export class Instancio<T> extends InstancioApi<T> {
  private constructor() {
    super(null as unknown as ReflectedTypeRef);
  }

  /**
   * The `of()` method is used to create an instance of the `InstancioApi` class.
   * This method is the entry point for obtaining a type-reflected Instancio API instance
   * for the given generic type `T`.
   *
   * The method uses the `CallSite` metadata to extract the type reference and
   * initialize an `InstancioApi` instance that is tied to that type. **Do not provide this argument**
   *
   * @param doNotProvideMe **DO NOT PROVIDE AN ARGUMENT FOR THIS** : The `CallSite` argument is used internally by the method
   * to extract the reflected type. Do not provide an argument when calling this method.
   * @returns An instance of `InstancioApi<T>` that reflects the provided type.
   *
   * @example const myType: MyType = Instancio.of<MyType>().generate();
   */
  public static of<T>(doNotProvideMe?: CallSite): Omit<InstancioApi<T>, 'generateSet' | 'generateArray'> {
    const callSite = doNotProvideMe as CallSite;
    // @ts-ignore
    const typeRef: ReflectedTypeRef = reflect(callSite).typeParameters[0];
    return new InstancioApi(typeRef);
  }

  /**
   * The `ofArray()` method is used to create an instance of the `InstancioApi` class.
   * This method is the entry point for obtaining a type-reflected Instancio API instance
   * for the given generic type `T`.
   *
   * The method uses the `CallSite` metadata to extract the type reference and
   * initialize an `InstancioApi` instance that is tied to that type. **Do not provide this argument**
   *
   * @param size the size of the array that will be generated
   * @param doNotProvideMe **DO NOT PROVIDE AN ARGUMENT FOR THIS** : The `CallSite` argument is used internally by the method
   * to extract the reflected type. Do not provide an argument when calling this method.
   * @returns An instance of `InstancioApi<T>` that reflects the provided type.
   *
   * @example const arr: MyType[] = Instancio.ofArray<MyType>(5).generateArray();
   */
  public static ofArray<T>(size: number, doNotProvideMe?: CallSite): Omit<InstancioApi<T>, 'generate' | 'generateSet'> {
    const callSite = doNotProvideMe as CallSite;
    // @ts-ignore
    const typeRef: ReflectedTypeRef = reflect(callSite).typeParameters[0];
    return new InstancioApi(typeRef, size);
  }

  /**
   * The `ofSet()` method is used to create an instance of the `InstancioApi` class.
   * This method is the entry point for obtaining a type-reflected Instancio API instance
   * for the given generic type `T`.
   *
   * The method uses the `CallSite` metadata to extract the type reference and
   * initialize an `InstancioApi` instance that is tied to that type. **Do not provide this argument**
   *
   * @param size the size of the set that will be generated
   * @param doNotProvideMe **DO NOT PROVIDE AN ARGUMENT FOR THIS** : The `CallSite` argument is used internally by the method
   * to extract the reflected type. Do not provide an argument when calling this method.
   * @returns An instance of `InstancioApi<T>` that reflects the provided type.
   *
   * @example const arr: Set<MyType> = Instancio.ofSet<MyType>(5).generateSet();
   */
  public static ofSet<T>(size: number, doNotProvideMe?: CallSite): Omit<InstancioApi<T>, 'generate' | 'generateArray'> {
    const callSite = doNotProvideMe as CallSite;
    // @ts-ignore
    const typeRef: ReflectedTypeRef = reflect(callSite).typeParameters[0];
    return new InstancioApi(typeRef, size);
  }
}
