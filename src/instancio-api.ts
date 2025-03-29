import {
  ReflectedClassRef,
  ReflectedEnumRef,
  ReflectedInterfaceRef,
  ReflectedLiteralRef,
  ReflectedObjectMember,
  ReflectedProperty,
  ReflectedTupleElement,
  ReflectedTupleRef,
  ReflectedUnionRef,
} from 'typescript-rtti';
import { ReflectedTypeRef } from 'typescript-rtti/src/lib/reflect';
import { DefaultPrimitiveGenerator } from './generators/default-primitive-generator';
import { PRIMITIVE_TYPES, PrimitiveTypeEnum } from './primitive-type.enum';
import { InstancioPrimitiveGenerator } from './generators/instancio-primitive-generator';
import { CollectionKind } from './collection-kind';

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
   * Indicates how many instances will be generated with the `generateArray()` or `generateSet` methods.
   */
  private readonly rootCollectionSize: number;
  private nestedCollectionsSize = Math.round(Math.random() * (5 - 2) + 2); // Two to five random elements by default

  /**
   * Protected constructor to initialize the `InstancioApi` with a type reference.
   * This constructor is intended to be used internally by the `Instancio` class.
   *
   * @param typeRef The `ReflectedTypeRef` representing the type information of `T`.
   * @param rootCollectionSize opt: root collection size in case of multiple obj. generation
   */
  protected constructor(typeRef: ReflectedTypeRef, rootCollectionSize?: number) {
    this.typeRef = typeRef;
    this.rootCollectionSize = rootCollectionSize ?? 0;
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
   * array properties of the generated type. By default, the size of collections is determined
   * automatically (random number generation between 2 & 5),
   * but this method provides the option to specify a custom number of elements
   * for collections within nested properties.
   *
   * This can be useful when you want to control the size of collections for testing or other purposes,
   * ensuring that collections are generated with a consistent number of elements.
   *
   * @param size The number of elements to generate inside collections.
   * @returns The current instance of the `InstancioApi`, allowing for method chaining.
   */
  public withNestedCollectionsOfSize(size: number): Omit<this, 'withNestedCollectionsOfSize'> {
    this.nestedCollectionsSize = size;
    return this;
  }

  /**
   * Generates multiple instances of type `T`.
   *
   * @returns An array of `T` instances.
   */
  public generateArray(): T[] {
    return Array.from({ length: this.rootCollectionSize }, () => this.generate());
  }

  /**
   * Generates multiple instances of type `T`.
   *
   * @returns A Set of `T` instances.
   */
  public generateSet(): Set<T> {
    return new Set(Array.from({ length: this.rootCollectionSize }, () => this.generate()));
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
  // TODO : Enhance readability + switch case
  public generate(): T {
    // Handle primitive type (leaf)
    // @ts-ignore
    if (this.typeRef.kind === 'class' && PRIMITIVE_TYPES.includes(this.typeRef.class.name)) {
      // @ts-ignore
      return this.primitiveGenerator.generatePrimitive(this.typeRef.class.name as PrimitiveTypeEnum);
      // @ts-ignore
    } else if (this.typeRef.name === 'Object') {
      console.warn('Unrecognized type/object: falling back to default generation');
      return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.DEFAULT);
    }

    // Else, keep handling complex properties (branches)
    if (this.typeRef.kind === 'interface') {
      const interfaceTypeRef: ReflectedInterfaceRef = this.typeRef as unknown as ReflectedInterfaceRef;
      return this.processProperties(interfaceTypeRef.reflectedInterface.properties);
    } else if (this.typeRef.kind === 'class') {
      // When we are not able at runtime to determine the underlying type and end up with a branch being an 'object'
      // we kind of have no other choice than to fallback to the default generation => creating a leaf
      // This behavior can be customized with a customGenerator. overriding DEFAULT type.
      // @ts-ignore
      if (this.typeRef.class.name === 'Object') {
        console.warn('Unrecognized type/object: falling back to default generation');
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.DEFAULT);
      }
      const classTypeRef: ReflectedClassRef<any> = this.typeRef as unknown as ReflectedClassRef<any>;
      return this.processProperties(classTypeRef.reflectedClass.properties);
    } else if (this.typeRef.kind === 'object') {
      // @ts-ignore
      const props: ReflectedObjectMember[] = this.typeRef.members;
      // ReflectedObjectMember has enough overlap with ReflectedProperty to be used within 'processProperties'.
      return this.processProperties(props as unknown as ReflectedProperty[]);
    } else if (this.typeRef.kind === 'enum') {
      // For now, enum generation only consists in picking a random enum value
      const enumRef: ReflectedEnumRef = this.typeRef as unknown as ReflectedEnumRef;
      return enumRef.values[Math.floor(Math.random() * enumRef.values.length)].value as T;
    } else if (this.typeRef.kind === 'union') {
      const unionRef: ReflectedUnionRef = this.typeRef as unknown as ReflectedUnionRef;
      // @ts-ignore
      return new InstancioApi<T>(unionRef.types[Math.floor(Math.random() * unionRef.types.length)]).generate();
    } else if (this.typeRef.kind === 'intersection') {
      throw new Error('WIP');
    } else if (this.typeRef.kind === 'tuple') {
      return this.processTuple() as T;
    } else if (this.typeRef.kind === 'null') {
      return null as T;
    } else if (this.typeRef.kind === 'undefined') {
      return undefined as T;
    } else if (this.typeRef.kind === 'array') {
      // @ts-ignore
      const type = this.typeRef.elementType;
      return new InstancioApi<T>(type as unknown as ReflectedTypeRef, this.nestedCollectionsSize).generateArray() as T;
    } else if (this.typeRef.kind === 'literal') {
      console.warn('Encountered literal type, returning the value as it is');
      const literalRef: ReflectedLiteralRef = this.typeRef as unknown as ReflectedLiteralRef;
      return literalRef.value as T;
    } else {
      throw new Error(`Cannot handle typeRef.kind=[${this.typeRef.kind}] : Not implemented yet.
       If you think this is a mistake, please report an issue at (...)`);
    }
  }

  private processTuple(): [] {
    const value = [];
    const tupleRef: ReflectedTupleRef = this.typeRef as unknown as ReflectedTupleRef;
    for (const el of tupleRef.elements) {
      value.push(new InstancioApi<T>(el.type as unknown as ReflectedTypeRef).generate());
    }
    return value as [];
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
    let result = {};
    for (const prop of props) {
      // @ts-ignore
      result[prop.name] = new InstancioApi<T>(prop.type as unknown as ReflectedTypeRef).generate();
    }
    return result as T;
  }
}
