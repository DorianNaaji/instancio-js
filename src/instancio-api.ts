import { DefaultPrimitiveGenerator } from './generators/default-primitive-generator';
import { PrimitiveTypeEnum } from './primitive-type.enum';
import { InstancioPrimitiveGenerator } from './generators/instancio-primitive-generator';
import { PropertySchema, TypeSchema } from './schema';

/**
 * The `InstancioApi` class is responsible for generating instances of a given type `T`.
 * It uses a custom schema extracted at compile-time to analyze the type
 * and dynamically generate values for primitive types or recursively generate complex objects.
 *
 * The class is designed to handle both simple primitive types (e.g., `string`, `number`)
 * as well as complex types such as classes, interfaces, or objects. It does so by inspecting
 * the schema and leveraging the `PrimitiveGenerator` for primitive types and recursion for
 * more complex types.
 */
export class InstancioApi<T> {
  private readonly schema: TypeSchema;
  private primitiveGenerator: InstancioPrimitiveGenerator = new DefaultPrimitiveGenerator();
  /**
   * Indicates how many instances will be generated with the `generateArray()` or `generateSet` methods.
   */
  private readonly rootCollectionSize: number;
  private nestedCollectionsSize = Math.round(Math.random() * (5 - 2) + 2); // Two to five random elements by default

  /**
   * Protected constructor to initialize the `InstancioApi` with a type schema.
   * This constructor is intended to be used internally by the `Instancio` class.
   *
   * @param schema The `TypeSchema` representing the type information of `T`.
   * @param rootCollectionSize opt: root collection size in case of multiple obj. generation
   */
  protected constructor(schema: any, rootCollectionSize?: number) {
    this.schema = schema as TypeSchema;
    this.rootCollectionSize = rootCollectionSize ?? 0;
  }

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
  public withCustomGenerator(generator: InstancioPrimitiveGenerator): Omit<this, 'withCustomGenerator'> {
    this.primitiveGenerator = generator;
    return this;
  }

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
  public generate(): T {
    if (!this.schema) {
      console.warn('No schema provided: falling back to default generation');
      return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.DEFAULT) as T;
    }

    switch (this.schema.kind) {
      case 'string':
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.String) as T;
      case 'number':
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.Number) as T;
      case 'boolean':
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.Boolean) as T;
      case 'bigint':
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.BigInt) as T;
      case 'date':
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.Date) as T;
      case 'symbol':
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.Symbol) as T;
      case 'any':
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.Any) as T;
      case 'null':
        return null as T;
      case 'undefined':
        return undefined as T;
      case 'literal':
        return this.schema.value as T;
      case 'enum':
        if (this.schema.values && this.schema.values.length > 0) {
          const randomIndex = Math.floor(Math.random() * this.schema.values.length);
          return this.schema.values[randomIndex].value as T;
        }
        return undefined as T;
      case 'array':
        return new InstancioApi<T>(this.schema.elementType, this.nestedCollectionsSize)
          .withCustomGenerator(this.primitiveGenerator)
          .generateArray() as unknown as T;
      case 'tuple':
        return this.processTuple() as T;
      case 'union':
        if (this.schema.types && this.schema.types.length > 0) {
          const randomIndex = Math.floor(Math.random() * this.schema.types.length);
          return new InstancioApi<T>(this.schema.types[randomIndex])
            .withCustomGenerator(this.primitiveGenerator)
            .withNestedCollectionsOfSize(this.nestedCollectionsSize)
            .generate();
        }
        return undefined as T;
      case 'object':
        return this.processProperties(this.schema.properties || []);
      default:
        console.warn(`Unrecognized type/object [${this.schema.kind}]: falling back to default generation`);
        return this.primitiveGenerator.generatePrimitive(PrimitiveTypeEnum.DEFAULT) as T;
    }
  }

  private processTuple(): T {
    const value = [];
    if (this.schema.elements) {
      for (const el of this.schema.elements) {
        value.push(
          new InstancioApi<T>(el)
            .withCustomGenerator(this.primitiveGenerator)
            .withNestedCollectionsOfSize(this.nestedCollectionsSize)
            .generate(),
        );
      }
    }
    return value as unknown as T;
  }

  /**
   * Processes the properties of an interface or class.
   * It recursively calls the `InstancioApi.generate()` method for each property to generate its value.
   *
   * @param props An array of reflected properties from the interface or class.
   * @returns A partially constructed instance of type `T` with generated values for each property.
   * @private
   */
  private processProperties(props: PropertySchema[]) {
    let result: any = {};
    for (const prop of props) {
      result[prop.name] = new InstancioApi<T>(prop.schema)
        .withCustomGenerator(this.primitiveGenerator)
        .withNestedCollectionsOfSize(this.nestedCollectionsSize)
        .generate();
    }
    return result as T;
  }
}
