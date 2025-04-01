import { describe, expect, it } from 'vitest';
import { DefaultPrimitiveGenerator, Instancio, InstancioPrimitiveGenerator } from '../../src';
import { PrimitiveTypeEnum } from '../../src/primitive-type.enum';

describe('CustomGenerator tests', () => {
  it(`should use custom generator for string`, () => {
    const generated: FewStringsProps = Instancio.of<FewStringsProps>().withCustomGenerator(new CustomGenerator()).generate();

    expect(generated.s1).toEqual('MyCustomGeneration');
    expect(generated.s2).toEqual('MyCustomGeneration');
    expect((generated.n + '').length).toBe(6); // default behavior
  });

  it(`Another Example`, () => {
    const users: User[] = Instancio.ofArray<User>(5).withCustomGenerator(new CustomUserGenerator()).generateArray();

    for (const user of users) {
      // @ts-ignore
      user.email = user.name.toLowerCase() + '@gmail.com';
    }
    console.log(users);
  });
});

export class CustomGenerator extends InstancioPrimitiveGenerator {
  constructor() {
    const generators = DefaultPrimitiveGenerator.getDefaultGenerators();
    generators.set(PrimitiveTypeEnum.String, () => 'MyCustomGeneration');
    super(generators);
  }
}

export class CustomUserGenerator extends InstancioPrimitiveGenerator {
  constructor() {
    const generators = DefaultPrimitiveGenerator.getDefaultGenerators();
    const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
    generators.set(PrimitiveTypeEnum.String, () => names[Math.floor(Math.random() * names.length)]);
    generators.set(PrimitiveTypeEnum.Number, () => Math.floor(Math.random() * 100) + 1);
    super(generators);
  }
}

export interface FewStringsProps {
  s1: string;
  s2: string;
  n: number;
}

export interface User {
  name: string;
  age: number;
}
