export enum PrimitiveTypeEnum {
  String = 'String',
  Number = 'Number',
  BigInt = 'BigInt',
  Boolean = 'Boolean',
  Date = 'Date',
  // Particular case to document
  DEFAULT = 'DEFAULT',
}

export const PRIMITIVE_TYPES: PrimitiveTypeEnum[] = Object.values(PrimitiveTypeEnum);
