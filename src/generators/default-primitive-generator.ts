import { PrimitiveTypeEnum } from '../primitive-type.enum';
import { InstancioPrimitiveGenerator } from './instancio-primitive-generator';
import random from 'random-string-generator';

export class DefaultPrimitiveGenerator extends InstancioPrimitiveGenerator {
  /**
   * random object from random-string-generator
   * @protected
   * @see https://www.npmjs.com/package/random-string-generator
   */
  private static readonly random = random;

  private static readonly defaultStringGenerator: Function = () => DefaultPrimitiveGenerator.random(12, 'upper');
  /**
   * Default generators, making use of the random library to generate
   * random values to populate primitive properties.
   * @private
   */
  private static readonly generators: ReadonlyMap<PrimitiveTypeEnum, Function> = new Map<PrimitiveTypeEnum, Function>()
    .set(PrimitiveTypeEnum.String, DefaultPrimitiveGenerator.defaultStringGenerator)
    .set(PrimitiveTypeEnum.Symbol, () => Symbol(DefaultPrimitiveGenerator.defaultStringGenerator()))
    .set(PrimitiveTypeEnum.Number, () => Number.parseInt(random(6, 'numeric')))
    .set(PrimitiveTypeEnum.BigInt, () => BigInt(random(12, 'numeric')))
    .set(PrimitiveTypeEnum.Boolean, () => Math.random() < 0.5)
    .set(PrimitiveTypeEnum.Date, () => {
      const start = new Date(2000, 0, 1).getTime(); // Start date (Jan 1, 2000)
      const end = new Date().getTime(); // Current date
      return new Date(start + Math.random() * (end - start));
    })
    .set(PrimitiveTypeEnum.DEFAULT, DefaultPrimitiveGenerator.defaultStringGenerator);

  /**
   * Returns a new instance of the default generators map.
   *
   * This method provides access to the static, private `generators` map, which contains
   * the default logic for generating random values for primitive types. The returned map
   * is a shallow copy, meaning any modifications to the map returned by this method will
   * not affect the original static `generators` map inside the class.
   *
   * The `generators` map contains generator functions for the following primitive types:
   *
   * - **String**: Generates a random uppercase string of length 12.
   * - **Symbol**: Same than for String.
   * - **Number**: Generates a random integer value between 0 and 999999.
   * - **BigInt**: Generates a random BigInt value between 0 and 999999999999.
   * - **Boolean**: Generates a random boolean value (`true` or `false`).
   * - **Date**: Generates a random date between Jan 1 2000 and today.
   * - **DEFAULT**: When an object is encountered and Instancio cannot process child properties,
   * default behavior is applied (same than for string).
   * @returns {Map<PrimitiveTypeEnum, Function>} A shallow copy of the default generators map.
   * @see {@link https://www.npmjs.com/package/random-string-generator} for the `random-string-generator` library used in the generators.
   *
   */
  public static getDefaultGenerators() {
    return new Map(DefaultPrimitiveGenerator.generators);
  }

  public constructor() {
    super(DefaultPrimitiveGenerator.generators);
  }
}
