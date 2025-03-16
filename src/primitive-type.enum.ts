export enum PrimitiveTypeEnum {
  String = "String",
  Number = "Number", // TODO - feature: Generator has to handle decimal/hexadecimal/binaryh/octal
  BigInt = "BigInt",
  Boolean = "Boolean",
}

export const PRIMITIVE_TYPES: PrimitiveTypeEnum[] =
  Object.values(PrimitiveTypeEnum);
