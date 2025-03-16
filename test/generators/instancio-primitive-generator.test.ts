import { describe, it, expect } from 'vitest';
import { PrimitiveTypeEnum } from '../../src/primitive-type.enum';
import { InstancioPrimitiveGenerator } from '../../src';

class CustomGenerator extends InstancioPrimitiveGenerator {
  constructor(generators: ReadonlyMap<PrimitiveTypeEnum, Function>) {
    super(generators);
  }
}

describe('InstancioPrimitiveGenerator tests', () => {
  it('Should throw an error when not all primitive types are handled', () => {
    // Create a partial generator map missing types
    const partialGenerators = new Map<PrimitiveTypeEnum, Function>()
      .set(PrimitiveTypeEnum.String, () => 'test')
      .set(PrimitiveTypeEnum.Number, () => 42);
    // Intentionally leaving out other types

    expect(() => new CustomGenerator(partialGenerators)).toThrowError(
      /The provided generator does not handle the following types:/,
    );
  });
});
