import { describe, it, expect } from 'vitest';
import { Instancio } from '../src';
import { InstancioApi } from '../src/instancio-api';

describe('Instancio Api generation tests', () => {
  // Golden test : test all the properties that can be handled.
  it('All types should be properly handled', () => {
    // Given
    const allTypesInOneInterface = Instancio.of<AllTypes>().generate();

    // Then
    console.log('allTypesInOneInterface =', allTypesInOneInterface);
    /* Primitive Types */
    expect(typeof allTypesInOneInterface.string).toBe('string');
    expect(typeof allTypesInOneInterface.bigint).toBe('bigint');
    expect(typeof allTypesInOneInterface.number).toBe('number');
    expect(allTypesInOneInterface.boolean).toBeOneOf([true, false]);
    expect(typeof allTypesInOneInterface.boolean).toBe('boolean');
    expect(typeof allTypesInOneInterface.symbol).toBe('string');
    expect(typeof allTypesInOneInterface._symbol).toBe('string');
    expect(typeof allTypesInOneInterface.__symbol).toBe('symbol');
    expect(allTypesInOneInterface.null).toBeNull();
    expect(allTypesInOneInterface.undefined).toBeUndefined();

    /* Object & Array Types */
    expect(typeof allTypesInOneInterface.object).toBe('string');
    // Test default array size
    expect(allTypesInOneInterface.stringArray?.length).toBeGreaterThanOrEqual(2);
    expect(allTypesInOneInterface.stringArray?.length).toBeLessThanOrEqual(5);

    expect(allTypesInOneInterface.stringArray).toBeInstanceOf(Array);
    for (const str of allTypesInOneInterface.stringArray) {
      expect(typeof str).toBe('string');
    }

    expect(allTypesInOneInterface.numberArray).toBeInstanceOf(Array);
    for (const num of allTypesInOneInterface.numberArray) {
      expect(typeof num).toBe('number');
    }

    expect(allTypesInOneInterface.booleanArray).toBeInstanceOf(Array);
    for (const bool of allTypesInOneInterface.booleanArray) {
      expect(typeof bool).toBe('boolean');
    }

    expect(allTypesInOneInterface.objectArray).toBeInstanceOf(Array);
    for (const obj of allTypesInOneInterface.objectArray) {
      expect(typeof obj).toBe('string');
    }

    expect(allTypesInOneInterface.clazzArray).toBeInstanceOf(Array);
    for (const clazz of allTypesInOneInterface.clazzArray) {
      expect(typeof clazz.age).toBe('number');
      expect(typeof clazz.name).toBe('string');
      expect(clazz._age).toBe(1);
    }

    expect(allTypesInOneInterface.typeArray).toBeInstanceOf(Array);
    for (const type of allTypesInOneInterface.typeArray) {
      expect(typeof type.age).toBe('number');
      expect(typeof type.name).toBe('string');
    }
    // tuple: [number, string, boolean, Symbol, Clazz, FewPropsInterface];
    expect(typeof allTypesInOneInterface.tuple[0]).toBe('number');
    expect(typeof allTypesInOneInterface.tuple[1]).toBe('string');
    expect(typeof allTypesInOneInterface.tuple[2]).toBe('boolean');
    expect(typeof allTypesInOneInterface.tuple[3]).toBe('symbol');
    // Clazz inside tuple
    expect(typeof allTypesInOneInterface.tuple[4].age).toBe('number');
    expect(typeof allTypesInOneInterface.tuple[4].name).toBe('string');
    expect(allTypesInOneInterface.tuple[4]._age).toBe(1);
    // FewPropsInterface inside tuple
    expect(typeof allTypesInOneInterface.tuple[5].age).toBe('number');
    expect(typeof allTypesInOneInterface.tuple[5].name).toBe('string');
    expect(allTypesInOneInterface.tuple[5].birth).toBeInstanceOf(Date);

    // objectType
    expect(typeof allTypesInOneInterface.objectType.red).toBe('number');
    expect(typeof allTypesInOneInterface.objectType.green).toBe('number');
    expect(typeof allTypesInOneInterface.objectType.blue).toBe('number');

    // enumType
    expect(typeof allTypesInOneInterface.enumStr).toBe('string');
    expect(typeof allTypesInOneInterface.enumNum).toBe('number');

    // Unions
    expect(typeof allTypesInOneInterface.unionStringArray).toBeOneOf(['string', 'array']);
    expect(typeof allTypesInOneInterface.union).toBeOneOf(['string', 'number']);

    // TODO : Intersection
    //  expect(typeof allTypesInOneInterface.intersection.extra).toBe('string');
    //  expect(typeof allTypesInOneInterface.intersection.age).toBe('number');
    //  expect(typeof allTypesInOneInterface.intersection.name).toBe('string');
    //  expect(typeof allTypesInOneInterface.intersection.birth).toBeInstanceOf(Date);
  });

  it(`Array generation (Clazz)`, () => {
    // Given
    const clazzArray: Clazz[] = Instancio.ofArray<Clazz>(10).generateArray();

    // Then
    console.log(clazzArray);
    expect(clazzArray).toHaveLength(10);
    expect(clazzArray).toBeInstanceOf(Array);
    for (const clazz of clazzArray) {
      expect(typeof clazz.age).toBe('number');
      expect(typeof clazz.name).toBe('string');
    }
  });

  it(`Set generation (Clazz)`, () => {
    // Given
    const clazzSet: Set<Clazz> = Instancio.ofSet<Clazz>(10).generateSet();

    // Then
    console.log(clazzSet);
    expect(clazzSet).toHaveLength(10);
    expect(clazzSet).toBeInstanceOf(Set);
    for (const clazz of clazzSet) {
      expect(typeof clazz.age).toBe('number');
      expect(typeof clazz.name).toBe('string');
    }
  });

  it(`Interface generation (FewProps)`, () => {
    // Given
    const fewPropsArray: FewPropsInterface[] = Instancio.ofArray<FewPropsInterface>(5).generateArray();

    // Then
    console.log(fewPropsArray);
    expect(fewPropsArray).toHaveLength(5);
    expect(fewPropsArray).toBeInstanceOf(Array);
    for (const fewProps of fewPropsArray) {
      expect(typeof fewProps.age).toBe('number');
      expect(typeof fewProps.name).toBe('string');
      expect(fewProps.birth).toBeInstanceOf(Date);
    }
  });

  it('Interfaces generation should fill all fields', () => {
    const user: UserInterface = Instancio.of<UserInterface>().generate();
    expect(typeof user.name).toBe('string');
    expect(typeof user.age).toBe('number');
    expect(typeof user.email).toBe('string');
    expect(typeof user.phone).toBe('string');
    expect(typeof user.address).toBe('string');
    expect(typeof user.country).toBe('string');
    expect(typeof user.city).toBe('string');
    expect(typeof user.zip).toBe('string');
    expect(typeof user.roomMate.age).toBe('number');
    expect(typeof user.roomMate.name).toBe('string');
    expect(typeof user.roomMate.email).toBe('string');
  });

  it('Class generation should fill all fields', () => {
    const clazz: Clazz = Instancio.of<Clazz>().generate();
    expect(typeof clazz.age).toBe('number');
    expect(typeof clazz.name).toBe('string');
  });

  it(`Type generation should fill all fields`, () => {
    const userType: UserType = Instancio.of<UserType>().generate();
    console.log(userType);
    expect(typeof userType.name).toBe('string');
    expect(typeof userType.age).toBe('number');
    expect(typeof userType.email).toBe('string');
    expect(typeof userType.phone).toBe('string');
    expect(typeof userType.address).toBe('string');
    expect(typeof userType.country).toBe('string');
    expect(typeof userType.city).toBe('string');
    expect(typeof userType.zip).toBe('string');
    const roomMate: RoomMate = userType.roomMate;
    expect(typeof roomMate.name).toBe('string');
    expect(typeof roomMate.age).toBe('number');
    expect(typeof roomMate.email).toBe('string');
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
  /* Primitive Types */
  string: string;
  bigint: bigint;
  number: number;
  boolean: boolean;
  readonly symbol: symbol; // Falls back to default generation
  readonly _symbol: unique symbol; // Falls back to default generation
  readonly __symbol: Symbol;
  null: null;
  undefined: undefined;
  /* Object & Array Types */
  object: object; // Falls back to default generation
  stringArray: string[];
  numberArray: number[];
  booleanArray: boolean[];
  objectArray: object[]; // Array items fall back to default generation
  clazzArray: Clazz[];
  interfaceArray: FewPropsInterface[];
  typeArray: CustomType[];
  tuple: [number, string, boolean, Symbol, Clazz, FewPropsInterface];
  objectType: { red: number; green: number; blue: number };
  /* Enums */
  enumNum: RGB_Numb;
  enumStr: RGB_Str;
  /* Union & Intersection Types */
  unionStringArray: string[] | string;
  union: string | number;
  unionObj: Clazz | FewPropsInterface;
  // TODO
  // intersection: FewPropsInterface & { extra: string };
  /* Utility Types */
  // readonlyString: Readonly<string>;
  // requiredFewProps: Required<FewProps>;
  // partialFewProps: Partial<FewProps>;
  // pickFewProps: Pick<FewProps, 'name' | 'age'>;
  // omitFewProps: Omit<FewProps, 'birth'>;
  // record: Record<string, number>;
  /* Special Types */
  // never: never;
  // void: void;
  // unknown: unknown;
  any: any;
  /* Function Types */
  // functionType: (param: string) => number;
  // functionType_: Function;
  // methodExample: () => void;
  /* Mapped Types */
  // mappedType: { [K in keyof FewProps]?: FewProps[K] };
}

export enum RGB_Numb {
  Red,
  Green,
  Blue,
}

export enum RGB_Str {
  Red = 'Red',
  Green = 'Green',
  Blue = 'Blue',
}

export interface FewPropsInterface {
  name: string;
  age: number;
  birth: Date;
}

export class Clazz {
  name?: string;
  age?: number;
  readonly _age = 1;
  private test() {}
}

export type CustomType = {
  name: string;
  age: number;
};

/* interfaces */

export type UserInterface = {
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

export type UserType = {
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
  name: string;
  age: number;
  email: string;
}
