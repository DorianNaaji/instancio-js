import { PRIMITIVE_TYPES, PrimitiveTypeEnum } from '../primitive-type.enum';

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
