export enum PrimitiveTypeEnum {
  String = 'String',
  Symbol = 'Symbol',
  Number = 'Number',
  BigInt = 'BigInt',
  Boolean = 'Boolean',
  Date = 'Date',
  Any = 'Any',
  /**
   * When Instancio API is not able to recognize the primitive type of a property (spotted as 'Object' at
   * runtime), it will fallback to this type. Default-primitive-generator uses the same generation as for
   * type 'String' when falling back to 'DEFAULT'.
   */
  DEFAULT = 'DEFAULT',
}

export const PRIMITIVE_TYPES: PrimitiveTypeEnum[] = Object.values(PrimitiveTypeEnum);
