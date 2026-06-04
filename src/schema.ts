export type SchemaKind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'bigint'
  | 'symbol'
  | 'date'
  | 'null'
  | 'undefined'
  | 'any'
  | 'object'
  | 'array'
  | 'enum'
  | 'union'
  | 'tuple'
  | 'literal'
  | 'unknown';

export interface TypeSchema {
  kind: SchemaKind;
  name?: string;
  properties?: PropertySchema[];
  elementType?: TypeSchema;
  types?: TypeSchema[];
  elements?: TypeSchema[];
  values?: EnumValueSchema[];
  value?: any;
}

export interface PropertySchema {
  name: string;
  schema: TypeSchema;
  optional?: boolean;
}

export interface EnumValueSchema {
  name: string;
  value: any;
}
