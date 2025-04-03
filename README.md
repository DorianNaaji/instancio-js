# instancio-js

instancio-js is a library for dynamically and recursively generating
JavaScript/TypeScript objects from interfaces, similar
to the functionality provided by [Instancio](https://github.com/instancio/instancio) in Java.
It allows you to quickly create objects with random values for testing purposes.

## Key Features

- Random Object Generation: Generate objects based on interfaces/classes with random values.
- Recursive Generation: Supports generating nested objects and recursive structures.
- Primitive Value Generators: Default generators for common primitive types like strings, numbers, booleans, dates, etc.
- Customizable Generation: Easily customize generation rules for specific types.

Example :

```typescript
import { Instancio } from 'instancio-js';

interface User {
  name: string;
  age: number;
}

const user: User = Instancio.of<User>().generate();
console.log(user);
```

**Output Example**:

```
{
  "name": "BZHWSMLUIWIQ", // Random uppercase string
  "age": 58753 // Random number
}
// note: generation can be customized
```

## To come

- **Intersection** type handling
- **Utility** types handling (`Pick`, `Omit`...)
- **Special** type handling (`never`, `void`...)

## Installation / Setup

To install the library via npm:

```bash
npm install instancio-js
```

### Prerequisites

- Typescript 4.8 - 5.1
- Node.js v14 or newer (when using Node.js)
  (see https://github.com/typescript-rtti/typescript-rtti)

### setting up tsconfig.json

DISCLAIMER: You must use a custom transformer in order to make the library work (see https://github.com/typescript-rtti/typescript-rtti).

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "typescript-rtti/dist/transformer"
      }
    ]
  }
}
```

### Examples

Here are few examples with basic projects showcasing how to install the library : https://github.com/DorianNaaji/instancio-js-examples

Repo contains examples:

**for testing libs:**

- vitest
- jest
- mocha
- tape

**for build libs:**

- standard (ts-node)
- rollup
- babel

## Usage

### Generating a Typed Object

You can generate a random object of a specific type based on a TypeScript interface or class.
(see intro example)

### Generating a Typed Array

You can generate an array of random objects with a specified type.

```typescript
export class CustomUserGenerator extends InstancioPrimitiveGenerator {
  constructor() {
    const generators = DefaultPrimitiveGenerator.getDefaultGenerators();
    const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
    generators.set(PrimitiveTypeEnum.String, () => names[Math.floor(Math.random() * names.length)]);
    generators.set(PrimitiveTypeEnum.Number, () => Math.floor(Math.random() * 100) + 1);
    super(generators);
  }
}

const users: User[] = Instancio.ofArray<User>(5).withCustomGenerator(new CustomUserGenerator()).generateArray();
console.log(users);
```

**Output Example**:

```typescript
[
  { name: 'Alice', age: 75 },
  { name: 'David', age: 4 },
  { name: 'Charlie', age: 69 },
  { name: 'Eve', age: 80 },
  { name: 'David', age: 49 },
];
```

### Developer note

Instancio-js being pre-release, there is no build in method to do
custom generation based on property name yet, bet if you need to do so,
you could do for instance:

```typescript
for (const user of users) {
  // @ts-ignore
  user.email = user.name.toLowerCase() + '@gmail.com';
}
console.log(users);
```

Similarly, you could do even more generation for nested keys with other generators...
It depends how much you need your data to be relevant.

Output

```json lines
[
  { "name": "David", "age": 14, "email": "david@gmail.com" },
  { "name": "David", "age": 16, "email": "david@gmail.com" },
  { "name": "Eve", "age": 37, "email": "eve@gmail.com" },
  { "name": "David", "age": 55, "email": "david@gmail.com" },
  { "name": "Eve", "age": 76, "email": "eve@gmail.com" }
]
```

Be creative 🚀

### Generating a Typed Set

Similarly, you can generate a set of random objects.

```typescript
const userSet: Set<User> = Instancio.ofSet<User>(5).generateSet();
console.log(userSet);
```

**Output Example**:

```
// Set
{
  { name: 'MGXIEYRLKAPG', age: 42 },
  { name: 'STZGVJHLRMLT', age: 25 },
  { name: 'FRUDNPBKCKAI', age: 34 },
  { name: 'VYMKHQSLGFWN', age: 31 },
  { name: 'HLOJCEZGWYIR', age: 22 },
}

```

### Generating Nested objects

Instancio-JS also supports recursive object generation for nested structures.

```typescript
interface RoomMate {
  name: string;
  age: number;
  email: string;
}

interface User {
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  zip: string;
  roomMate: RoomMate;
}

const user: User = Instancio.of<User>().generate();
console.log(user);
```

**Output Example**:

```json lines
{
  "name": "WQXFBHTPGXYQ",
  "age": 947618,
  "email": "EWOOTQTZDJPB",
  "phone": "917381",
  "address": "OAGVHHSONYFV",
  "country": "ABQKJDNTOZOA",
  "city": "MDXEZQDFNZQB",
  "zip": "4698786543",
  "roomMate": {
    "name": "AMQZFGKZDHKX",
    "age": 871270,
    "email": "AMQZFGKZDHKX"
  }
}
```

### Primitive Value Generators

Instancio-JS provides default generators for primitive types. Below is a list of types and their corresponding generator behavior:

- **String**: Random uppercase string (12 characters).
- **Symbol**: Symbol generated from a random string.
- **Number**: Random integer (6 digits).
- **BigInt**: Random BigInt (12 digits).
- **Boolean**: Random boolean value (`true` or `false`).
- **Date**: Random date between January 1st, 2000, and today.
- **Any**: Behaves like default (string).
- **DEFAULT**: Behaves like a string by default.

These can be fully customized.

### Customizing Object Generation

You can easily modify the behavior of how objects are generated by providing custom generators.

```typescript
import { DefaultPrimitiveGenerator, Instancio, InstancioPrimitiveGenerator } from '../../src';
import { PrimitiveTypeEnum } from '../../src/primitive-type.enum';

const generated: FewStringsProps = Instancio.of<FewStringsProps>().withCustomGenerator(new CustomGenerator()).generate();

// This is how you create a custom generator. This really simple
// generator just "extends" the Default one and overrides the behavior
// for String.
// You can do the same for every other PrimitiveTypes, or as well
// provide your own map, not even relying on the default one.
// Each key must be a PrimitiveTypeEnum and the value the generation function.
export class CustomGenerator extends InstancioPrimitiveGenerator {
  constructor() {
    const generators = DefaultPrimitiveGenerator.getDefaultGenerators();
    generators.set(PrimitiveTypeEnum.String, () => 'MyCustomGeneration');
    super(generators);
  }
}

export interface FewStringsProps {
  s1: string;
  s2: string;
  n: number;
}
```

## API Methods

### `Instancio.of<T>()`

Generates an object of the specified type `T`.

```typescript
const user: User = Instancio.of<User>().generate();
```

### `Instancio.ofArray<T>(size: number)`

Generates an array of objects of the specified type `T`.

```typescript
const users: User[] = Instancio.ofArray<User>(5).generateArray();
```

### `Instancio.ofSet<T>(size: number)`

Generates a set of objects of the specified type `T`.

```typescript
const userSet: Set<User> = Instancio.ofSet<User>(5).generateSet();
```

## License

Instancio-JS is distributed under the MIT license.

---

This README outlines the core features, installation process, and usage examples for the library. Feel free to extend or modify it as needed.
