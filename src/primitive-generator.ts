import { PrimitiveTypeEnum } from "./primitive-type.enum";

export class PrimitiveGenerator {
  private readonly typeName: string;

  public constructor(typeName: string) {
    this.typeName = typeName;
  }

  public generate() {
    switch (this.typeName) {
      case PrimitiveTypeEnum.String:
        return "random";
      case PrimitiveTypeEnum.Boolean:
        return false;
      case PrimitiveTypeEnum.Number:
        return 12345;
    }
  }
}
