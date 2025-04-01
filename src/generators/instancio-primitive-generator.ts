import { PRIMITIVE_TYPES, PrimitiveTypeEnum } from '../primitive-type.enum';

/**
 * Abstract base class for primitive type generators.
 *
 * This class provides a structured way to generate values for primitive types.
 * It ensures that every primitive type defined in `PRIMITIVE_TYPES` is handled by the provided generator map.
 *
 * ## Extending this class
 * To create a custom generator, extend this class and override specific type generators as needed.
 * You can retrieve the default generators from `DefaultPrimitiveGenerator.getDefaultGenerators()`
 * and modify them before passing them to the superclass.
 *
 * ### Example: Customizing the string generator
 * ```typescript
 * import { DefaultPrimitiveGenerator } from './default-primitive-generator';
 * import { InstancioPrimitiveGenerator } from './instancio-primitive-generator';
 * import { PrimitiveTypeEnum } from '../primitive-type.enum';
 *
 * export class CustomGenerator extends InstancioPrimitiveGenerator {
 *   constructor() {
 *     // Retrieve the default generators
 *     const generators = DefaultPrimitiveGenerator.getDefaultGenerators();
 *
 *     // Override the string generator with a custom implementation
 *     generators.set(PrimitiveTypeEnum.String, () => 'MyCustomString');
 *
 *     // Call the parent constructor with the modified generators map
 *     super(generators);
 *   }
 * }
 * // => Now your Instancio generated strings will always be 'MyCustomString'.
 * ```
 * @see PrimitiveTypeEnum You can customize generation behavior for all of the PrimitiveType
 * @abstract cannot be instantiated.
 */
export abstract class InstancioPrimitiveGenerator {
  protected readonly generators: ReadonlyMap<PrimitiveTypeEnum, Function>;

  protected constructor(generators: ReadonlyMap<PrimitiveTypeEnum, Function>) {
    // At object creation, we make sure that every primitive type is handled.
    const unhandledTypes: PrimitiveTypeEnum[] = [];
    for (const type of PRIMITIVE_TYPES) {
      if (!generators.has(type)) {
        unhandledTypes.push(type);
      }
    }
    if (unhandledTypes.length > 0) {
      throw new Error(`The provided generator does not handle the following types: ${JSON.stringify(unhandledTypes)}.`);
    }
    this.generators = generators;
  }

  /**
   * This method can be overriden if you want to fully customize the generation
   * process, if you do not want to rely on the generators map and need to
   * handle more complex scenarios.
   * @param type the type to generate
   */
  public generatePrimitive(type: PrimitiveTypeEnum) {
    // Just in case, we enforce another time that the type is correctly handled.
    if (!this.generators.has(type)) {
      throw new Error(`Generator not found for type ${type}`);
    }

    // @ts-ignore
    return this.generators.get(type)();
  }
}
