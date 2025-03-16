import {
  ReflectedClassRef,
  ReflectedInterfaceRef,
  ReflectedObjectMember,
  ReflectedProperty,
} from "typescript-rtti";
import { ReflectedTypeRef } from "typescript-rtti/src/lib/reflect";
import { PrimitiveGenerator } from "./primitive-generator";
import { PRIMITIVE_TYPES, PrimitiveTypeEnum } from "./primitive-type.enum";

/**
 * The `InstancioApi` class is responsible for generating instances of a given type `T`.
 * It uses reflection provided by the `typescript-rtti` library to analyze the type
 * and dynamically generate values for primitive types or recursively generate complex objects.
 *
 * The class is designed to handle both simple primitive types (e.g., `string`, `number`)
 * as well as complex types such as classes, interfaces, or objects. It does so by inspecting
 * the type and leveraging the `PrimitiveGenerator` for primitive types and recursion for
 * more complex types.
 */
export class InstancioApi<T> {
  private readonly typeRef: ReflectedTypeRef;

  /**
   * Protected constructor to initialize the `InstancioApi` with a type reference.
   * This constructor is intended to be used internally by the `Instancio` class.
   *
   * @param typeRef The `ReflectedTypeRef` representing the type information of `T`.
   */
  protected constructor(typeRef: ReflectedTypeRef) {
    this.typeRef = typeRef;
  }

  /**
   * Main method to generate an instance of type `T`.
   * This method checks if the type is a primitive or complex,
   * and accordingly generates the appropriate instance.
   *
   * - For primitive types, it delegates to `PrimitiveGenerator`.
   * - For interfaces, classes, and objects, it recursively processes their properties.
   *
   * **Primitive Types** handled by this method include:
   * - `String`: Generates a random uppercase string of length 12.
   * - `Boolean`: Generates a random boolean value (`true` or `false`).
   * - `Number`: Generates a random integer between 0 and 999999.
   * - `BigInt`: Generates a random `BigInt` value between 0 and 999999999999.
   *
   * @returns An instance of type `T` with generated values.
   * @throws Error if the type cannot be processed.
   *
   */
  public generate(): T {
    // Handle primitive type (leaf)
    if (this.isPrimitive()) {
      return new PrimitiveGenerator(
        // @ts-ignore
        this.typeRef.class.name as PrimitiveTypeEnum,
      ).generatePrimitive();
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
   * Processes the properties of an object type, which can include properties of unions.
   *
   * @param props An array of reflected object members that belong to the type.
   * @returns An empty object as a placeholder for the generated instance.
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
   * Processes the properties of an interface or class.
   * It recursively calls the `InstancioApi.generate()` method for each property to generate its value.
   *
   * @param props An array of reflected properties from the interface or class.
   * @returns A partially constructed instance of type `T` with generated values for each property.
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
    }
    return result;
  }
}
