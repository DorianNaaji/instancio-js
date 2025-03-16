import { describe, it, expect } from "vitest";
import { Instancio } from "../src";

/* execute n times to make sure randomness doesn't impact tests & to avoid flakky */
const EXECUTIONS = 100;

describe("Instancio Api generation tests", () => {
  // Golden test : test all the properties that can be handled.
  it("All types should be properly handled", () => {
    // Given
    const allTypesInOneInterface = Instancio.of<AllTypes>().generate();

    // Then
    console.log("allTypesinOneInterface =", allTypesInOneInterface);
    expect(typeof allTypesInOneInterface.string).toBe("string");
    expect(typeof allTypesInOneInterface.bigint).toBe("bigint");
    expect(typeof allTypesInOneInterface.number).toBe("number");
    expect(allTypesInOneInterface.boolean).toBeOneOf([true, false]);
    expect(typeof allTypesInOneInterface.boolean).toBe("boolean");
  });

  it("Interfaces generation should fill all fields", () => {
    // TODO
  });

  it("Class generation should fill all fields", () => {
    // TODO
  });

  it(`Type generation should fill all fields`, () => {
    // TODO
  });
});

/* helper interfaces, classes & types */

/**
 * Contains all the types that the library should be able to process. These
 * are the most useful/common types I could think of, in case there are issues
 * with the lib, this type is what should be looked after first to add
 * the handling of any new type.
 */
interface AllTypes {
  // Primitive Types
  string?: string;
  bigint?: bigint;
  number?: number;
  boolean?: boolean;
  // TODO
  // symbol?: symbol;
  // null?: null;
  // undefined?: undefined;

  // Object & Array Types
  // object?: object;
  // primitiveArray?: string[];
  // objectArray?: object[];
  // tuple?: [number, string];
  // objectType?: { red: any, green: any, blue: any };

  // Enums
  // enumInt?: RGB_Int;
  // enumStr?: RGB_Str;

  // Union & Intersection Types
  // unionStringArray?: string[] | string;
  // union?: string | number;
  // intersection?: FewProps & { extra: string };

  // Utility Types
  // readonlyString?: Readonly<string>;
  // requiredFewProps?: Required<FewProps>;
  // partialFewProps?: Partial<FewProps>;
  // pickFewProps?: Pick<FewProps, 'name' | 'age'>;
  // omitFewProps?: Omit<FewProps, 'birth'>;
  // record?: Record<string, number>;

  // Special Types
  // never?: never;
  // void?: void;
  // unknown?: unknown;
  // any?: any;

  // Function Types
  // functionType?: (param: string) => number;
  // methodExample?: () => void;

  // Mapped Types (Example)
  // mappedType?: { [K in keyof FewProps]?: FewProps[K] };
}

export enum RGB_Int {
  Red,
  Green,
  Blue,
}

export enum RGB_Str {
  Red = "Red",
  Green = "Green",
  Blue = "Blue",
}

export interface FewProps {
  name?: string;
  age?: number;
  birth?: Date;
}

/* interfaces */

export type UserInterfaceAllOpt = {
  name?: string;
  age?: number;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  zip?: string;
  roomMate?: RoomMate;
};

export type UserInterfaceAllRequired = {
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  zip: string;
  roomMate: RoomMate;
};

export type UserTypeAllOpt = {
  name?: string;
  age?: number;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  zip?: string;
  roomMate?: RoomMate;
};

export type UserTypeAllRequired = {
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  zip: string;
  roomMate: RoomMate;
};

export interface RoomMate {
  name?: string;
  age?: number;
  email?: string;
}
