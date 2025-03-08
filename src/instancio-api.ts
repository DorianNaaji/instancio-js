import { ReflectedClassRef, ReflectedInterfaceRef, ReflectedProperty } from "typescript-rtti";
import { ReflectedTypeRef } from "typescript-rtti/src/lib/reflect";

export class InstancioApi<T> {

  private readonly typeRef: ReflectedTypeRef;

  protected constructor(typeRef: ReflectedTypeRef) {
    this.typeRef = typeRef;
  }

  public generate(): T {
    if (this.typeRef.isInterface()) {
      const interfaceTypeRef: ReflectedInterfaceRef = this.typeRef as unknown as ReflectedInterfaceRef;
      return this.processProperties(interfaceTypeRef.reflectedInterface.properties);
    } else {
      const classTypeRef: ReflectedClassRef<any> = this.typeRef as unknown as ReflectedClassRef<any>;
      this.processProperties(classTypeRef.reflectedClass.properties);
      throw new Error(`cannot handle ${this.typeRef.kind}: Not implemented yet`);
    }
  }

  private processProperties(props: ReflectedProperty[]): T {
    for (const prop of props) {
      // TODO
      console.log(`${prop.name}:${prop.type}`)
    }
    return {} as T;
  }
}