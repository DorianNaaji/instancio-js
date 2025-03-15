import { CallSite, reflect } from "typescript-rtti";
import { ReflectedTypeRef } from "typescript-rtti/src/lib/reflect";
import { InstancioApi } from "./instancio-api";
import "reflect-metadata";

export class Instancio<T> extends InstancioApi<T> {
  private constructor() {
    super(null as unknown as ReflectedTypeRef);
  }

  /**
   *
   * @param callSite do not provide argument
   */
  public static of<T>(callSite?: CallSite): InstancioApi<T> {
    // @ts-ignore
    const typeRef: ReflectedTypeRef = reflect(callSite).typeParameters[0];
    return new InstancioApi(typeRef);
  }
}
