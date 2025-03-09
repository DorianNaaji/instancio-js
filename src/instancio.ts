import { CallSite, reflect } from "typescript-rtti";
import { ReflectedTypeRef } from "typescript-rtti/src/lib/reflect";
import { InstancioApi } from "./instancio-api";

export class Instancio extends InstancioApi<any> {
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
