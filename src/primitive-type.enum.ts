export enum PrimitiveTypeEnum {
  String = "String",
  Number = "Number", // Generator has to handle decimal/hexadecimal/binaryh/octal
  // public statc TYPE_BIGINT = 'Bigint'
  Boolean = "Boolean",
}

export const PRIMITIVE_TYPES: PrimitiveTypeEnum[] =
  Object.values(PrimitiveTypeEnum);
