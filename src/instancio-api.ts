import { ReflectedClassRef, ReflectedInterfaceRef, ReflectedObjectMember, ReflectedProperty } from 'typescript-rtti';
import { ReflectedTypeRef } from 'typescript-rtti/src/lib/reflect';
import { DefaultPrimitiveGenerator } from './generators/default-primitive-generator';
import { PRIMITIVE_TYPES, PrimitiveTypeEnum } from './primitive-type.enum';
import { InstancioPrimitiveGenerator } from './generators/instancio-primitive-generator';

// TODO : Ideas for later
//  https://www.instancio.org/user-guide/#using-oncomplete
//  https://www.instancio.org/user-guide/#using-set

/**
 * The `InstancioApi` class is responsible for generating instances of a given type `T`.
 * It uses reflection provided by the `typescript-rtti` library to analyze the type
 * and dynamically generate values for primitive types or recursively generate complex objects.
 *
 * The class is designed to handle both simple primitive types (e.g., `string`, `number`)
 * as well as complex types such as classes, interfaces, or objects. It does so by inspecting
 * the type and leveraging the `PrimitiveGenerator` for primitive types and recursion for
 * more complex types.
 */
export class InstancioApi<T> {
  private readonly typeRef: ReflectedTypeRef;
  private primitiveGenerator: InstancioPrimitiveGenerator = new DefaultPrimitiveGenerator();
  /**
   * Indicates how many instances will be generated with the `generateMany()` method.
   * Configured with `times`.
   */
  private count = 1;
  private nbOfArrayElements = Math.random() * (5 - 2) + 2; // Two to five random elements by default

  /**
   * Protected constructor to initialize the `InstancioApi` with a type reference.
   * This constructor is intended to be used internally by the `Instancio` class.
   *
   * @param typeRef The `ReflectedTypeRef` representing the type information of `T`.
   */
  protected constructor(typeRef: ReflectedTypeRef) {
    this.typeRef = typeRef;
  }

  // TODO : DISABLED FOR V1 : WHEN USE CASES AND TESTS DONE FOR CUSTOM GENERATORS, THEN IT
  //  CAN BE ENABLED
  //  + PROVIDE DOCS AND EXAMPLES
  /**
   * Sets a custom primitive generator for generating primitive values.
   *
   * This method allows the user to replace the default `InstancioPrimitiveGenerator` with a custom generator
   * that defines how primitive values (e.g., `string`, `boolean`, `number`, `BigInt`) should be generated.
   * It is useful if a specific logic or configuration is required for generating primitive values
   * (e.g., different formats, constraints, or external libraries).
   *
   * The custom generator should implement the `InstancioPrimitiveGenerator` interface,
   * which provides the `generatePrimitive()` method to generate primitive values.
   *
   * @param generator The custom `InstancioPrimitiveGenerator` to be used for generating primitive values.
   * @returns The current instance of the `InstancioApi`, allowing for method chaining.
   */
  // public withCustomGenerator(generator: InstancioPrimitiveGenerator): Omit<this, 'withCustomGenerator'> {
  //   this.primitiveGenerator = generator;
  //   return this;
  // }

  /**
   * Customizes the number of elements generated inside nested array properties.
   *
   * This method allows you to control the number of elements that will be generated inside
   * array properties of the generated type. By default, the size of arrays is determined
   * automatically (random number generation between 2 & 5),
   * but this method provides the option to specify a custom number of elements
   * for arrays within nested properties.
   *
   * This can be useful when you want to control the size of arrays for testing or other purposes,
   * ensuring that arrays are generated with a consistent number of elements.
   *
   * @param size The number of elements to generate inside arrays.
   * @returns The current instance of the `InstancioApi`, allowing for method chaining.
   */
  public withElementsInArrays(size: number): Omit<this, 'withElementsInArrays'> {
    this.nbOfArrayElements = size;
    return this;
  }

  /**
   * Sets the number of instances to generate.
   *
   * @param count Number of times to generate an instance.
   * @returns The current instance of the `InstancioApi`, allowing method chaining.
   */
  public times(count: number): Omit<this, 'times' | 'generate'> {
    this.count = count;
    return this;
  }

  /**
   * Generates multiple instances of type `T`.
   * This method is available only after calling `times()`.
   *
   * @returns An array of `T` instances.
   */
  public generateMany(): T[] {
    return Array.from({ length: this.count }, () => this.generate());
  }

  /**
   * Main method to generate an instance of type `T`.
   * This method checks if the type is a primitive or complex,
   * and accordingly generates the appropriate instance.
   *
   * - For primitive types, it delegates to `DefaultPrimitiveGenerator`, unless a
   * custom generator was added with the `withCustomGenerator` method.
   * - For interfaces, classes, and objects, it recursively processes their properties.
   *
   * **Primitive Types** handled by this method include:
   * - `String`: Generates a random uppercase string of length 12.
   * - `Boolean`: Generates a random boolean value (`true` or `false`).
   * - `Number`: Generates a random integer between 0 and 999999.
   * - `BigInt`: Generates a random `BigInt` value between 0 and 999999999999.
   *
   * @returns An instance of type `T` with generated values.
   * @throws Error if the type cannot be processed.
   *
   */
  public generate(): T {
    // Handle primitive type (leaf)
    if (this.isPrimitive()) {
      // @ts-ignore
      return this.primitiveGenerator.generatePrimitive(this.typeRef.class.name as PrimitiveTypeEnum);
      // @ts-ignore
    } else if (this.typeRef.name === 'Object') {
      console.warn('Unrecognized type/object: falling back to default generation');
      return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.DEFAULT);
    }

    // Else, keep handling complex properties (branches)
    if (this.typeRef.isInterface()) {
      const interfaceTypeRef: ReflectedInterfaceRef = this.typeRef as unknown as ReflectedInterfaceRef;
      return this.processProperties(interfaceTypeRef.reflectedInterface.properties);
    } else if (this.typeRef.isClass()) {
      // Some primitive types like 'symbol' cannot be recognized by InstancioApi and are
      // processed as 'Object'.
      // Other primitive types like 'object' could be anything so we use a DEFAULT type
      // to handle generation for these particular scenarios.

      // When 'Symbol' type object is passed, use the primitive generator to generate a symbol.
      if (this.typeRef.matchesValue(PrimitiveTypeEnum.Symbol.toLowerCase())) {
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.Symbol);
      }
      // When we are not able at runtime to determine the underlying type and end up with a leaf being an 'object'
      // we kind of have no other choice than to fallback to the default generation.
      if (this.typeRef.class.name === 'Object') {
        console.warn('Unrecognized type/object: falling back to default generation');
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.DEFAULT);
      }
      const classTypeRef: ReflectedClassRef<any> = this.typeRef as unknown as ReflectedClassRef<any>;
      return this.processProperties(classTypeRef.reflectedClass.properties);
    } else if (this.typeRef.kind === 'object') {
      // TODO
      /* Handle Type kind */
      // @ts-ignore
      const props: ReflectedObjectMember[] = this.typeRef.members;
      return this.processReflectedObjectMembers(props);
    } else if (this.typeRef.isUnion()) {
      // TODO
      throw new Error('[Union Type] Work in progress');
    } else if (this.typeRef.isNull()) {
      return null as T;
    } else if (this.typeRef.isUndefined()) {
      return undefined as T;
    } else if (this.typeRef.isArray()) {
      // @ts-ignore
      const type = this.typeRef.elementType;
      return new InstancioApi<T>(type as unknown as ReflectedTypeRef).times(this.nbOfArrayElements).generateMany() as T;
    } else {
      throw new Error(`cannot handle typeRef.kind=[${this.typeRef.kind}] : Not implemented yet`);
    }
  }

  private isPrimitive(): boolean {
    if (this.typeRef.isClass()) {
      // @ts-ignore
      return PRIMITIVE_TYPES.includes(this.typeRef.class.name);
    } else {
      return false;
    }
  }

  /**
   * Processes the properties of an object type, which can include properties of unions.
   *
   * @param props An array of reflected object members that belong to the type.
   * @returns An empty object as a placeholder for the generated instance.
   * @private
   */
  private processReflectedObjectMembers(props: ReflectedObjectMember[]): T {
    for (const prop of props) {
      if (prop.type.isUnion()) {
        // @ts-ignore
        console.log(`${prop.ref.n}:${prop.ref.t.t[1].name}`);
      } else {
        const propObj: ReflectedObjectMember = prop as ReflectedObjectMember;
        // TODO
        console.log(`${prop.name}:${prop.type}`);
      }
    }
    return {} as T;
  }

  /**
   * Processes the properties of an interface or class.
   * It recursively calls the `InstancioApi.generate()` method for each property to generate its value.
   *
   * @param props An array of reflected properties from the interface or class.
   * @returns A partially constructed instance of type `T` with generated values for each property.
   * @private
   */
  private processProperties(props: ReflectedProperty[]) {
    let result = {} as T;
    for (const prop of props) {
      const api: InstancioApi<T> = new InstancioApi<T>(prop.type as unknown as ReflectedTypeRef);
      // @ts-ignore
      result[prop.name] = api.generate();
    }
    return result;
  }
}
