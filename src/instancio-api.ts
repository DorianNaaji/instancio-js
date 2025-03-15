import {
  ReflectedClassRef,
  ReflectedInterfaceRef,
  ReflectedObjectMember,
  ReflectedProperty,
} from "typescript-rtti";
import { ReflectedTypeRef } from "typescript-rtti/src/lib/reflect";
import { PrimitiveGenerator } from "./primitive-generator";
import { PRIMITIVE_TYPES, PrimitiveTypeEnum } from "./primitive-type.enum";

export class InstancioApi<T> {
  private readonly typeRef: ReflectedTypeRef;

  protected constructor(typeRef: ReflectedTypeRef) {
    this.typeRef = typeRef;
  }

  public generate(): T {
    // Handle primitive type (leaf)
    if (this.isPrimitive()) {
      // @ts-ignore
      return new PrimitiveGenerator(
        this.typeRef.class.name as PrimitiveTypeEnum,
      ).generate();
    }

    // Else, keep handling complex properties (branches)
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
      /* Handle Type kind */
      // @ts-ignore
      const props: ReflectedObjectMember[] = this.typeRef.members;
      return this.processReflectedObjectMembers(props);
    } else {
      throw new Error(
        `cannot handle ${this.typeRef.kind}: Not implemented yet`,
      );
    }
  }

  private isPrimitive(): boolean {
    if (this.typeRef.isClass()) {
      // @ts-ignore
      return PRIMITIVE_TYPES.includes(this.typeRef.class.name);
    } else {
      return false;
    }
  }

  /**
   * Process the properties from a type (using type
   * @param props
   * @private
   */
  private processReflectedObjectMembers(props: ReflectedObjectMember[]): T {
    for (const prop of props) {
      if (prop.type.isUnion()) {
        // @ts-ignore
        console.log(`${prop.ref.n}:${prop.ref.t.t[1].name}`);
      } else {
        const propObj: ReflectedObjectMember = prop as ReflectedObjectMember;
        // TODO
        console.log(`${prop.name}:${prop.type}`);
      }
    }
    return {} as T;
  }

  /**
   * Process the properties from an interface or an object
   * @param props
   * @private
   */
  private processProperties(props: ReflectedProperty[]) {
    let result = {} as T;
    for (const prop of props) {
      const api: InstancioApi<T> = new InstancioApi<T>(
        prop.type as unknown as ReflectedTypeRef,
      );
      // @ts-ignore
      result[prop.name] = api.generate();
      console.log(prop.name);
    }
    return result;
  }
}
