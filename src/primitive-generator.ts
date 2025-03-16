import { PrimitiveTypeEnum } from "./primitive-type.enum";
import random from "random-string-generator";

// TODO : Add the ability to pass a CustomGenerator to InstancioApi.generate()
export class PrimitiveGenerator {
  private readonly typeName: string;

  public constructor(typeName: string) {
    this.typeName = typeName;
  }

  public generatePrimitive(): any {
    switch (this.typeName) {
      case PrimitiveTypeEnum.String:
        return random(12, "upper");
      case PrimitiveTypeEnum.Boolean:
        return Math.random() < 0.5;
      case PrimitiveTypeEnum.Number:
        return Number.parseInt(random(6, "numeric"));
      case PrimitiveTypeEnum.BigInt:
        return BigInt(random(12, "numeric"));
      default:
        return undefined;
    }
  }
}
