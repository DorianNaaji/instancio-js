import {
  reflect,
  ReflectedClassRef,
  ReflectedInterfaceRef,
  ReflectedObjectMember,
  ReflectedProperty,
} from "typescript-rtti";
import { ReflectedTypeRef } from "typescript-rtti/src/lib/reflect";

export class InstancioApi<T> {
  private readonly typeRef: ReflectedTypeRef;

  protected constructor(typeRef: ReflectedTypeRef) {
    this.typeRef = typeRef;
  }

  public generate(): T {
    if (this.typeRef.isInterface()) {
      const interfaceTypeRef: ReflectedInterfaceRef = this
        .typeRef as unknown as ReflectedInterfaceRef;
      return this.processProperties(
        interfaceTypeRef.reflectedInterface.properties,
      );
    } else if (this.typeRef.isClass()) {
      const classTypeRef: ReflectedClassRef<any> = this
        .typeRef as unknown as ReflectedClassRef<any>;
      return this.processProperties(classTypeRef.reflectedClass.properties);
    } else if (this.typeRef.kind === "object") {
      // Handle Type kind
      // @ts-ignore
      const props: ReflectedObjectMember[] = this.typeRef.members;
      return this.processReflectedObjectMembers(props);
    } else {
      throw new Error(
        `cannot handle ${this.typeRef.kind}: Not implemented yet`,
      );
    }
  }

  private processReflectedObjectMembers(props: ReflectedObjectMember[]): T {
    for (const prop of props) {
      if (prop.type.isUnion()) {
        // @ts-ignore
        console.log(`${prop.ref.n}:${prop.ref.t.t[1].name}`);
      } else {
        // handle ReflectedObjectMember
        const propObj: ReflectedObjectMember = prop as ReflectedObjectMember;
        // TODO
        console.log(`${prop.name}:${prop.type}`);
      }
    }
    return {} as T;
  }

  private processProperties(props: ReflectedProperty[]): T {
    for (const prop of props) {
      // TODO
      console.log(`${prop.name}:${prop.type}`);
      let i = prop.type;
      reflect<typeof i>(); // ???
    }
    return {} as T;
  }
}
