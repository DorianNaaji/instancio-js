# instancio-js - Test Data Generator for TypeScript & JavaScript

instancio-js is a **TypeScript/JavaScript test data generator** that auto-populates objects, interfaces, and classes with random values for unit tests: no manual fixtures, no boilerplate.
Inspired by [Instancio](https://github.com/instancio/instancio) for Java.

## Why instancio-js?

Tired of writing manual test fixtures? instancio-js generates fully populated TypeScript objects directly from your existing interfaces and classes; no extra schema, no configuration.

|                             | instancio-js | faker.js | Manual fixtures |
| --------------------------- | ------------ | -------- | --------------- |
| Reads your TypeScript types | ✅           | ❌       | ❌              |
| Zero boilerplate            | ✅           | Partial  | ❌              |
| Nested objects              | ✅           | Manual   | Manual          |
| Arrays, Sets, Tuples, Enums | ✅           | Manual   | Manual          |
| Field-level customization   | ✅           | ❌       | ❌              |

## Key Features

- **Test Data Generation**: Generate objects based on interfaces/classes with random values, no manual setup.
- **Recursive Generation**: Supports generating nested objects and recursive structures automatically.
- **Field-level Customization**: Fix, supply, or ignore individual fields with `set()`, `supply()`, and `ignore()`.
- **Primitive Value Generators**: Default generators for strings, numbers, booleans, dates, and more, all customizable.
- **Collections**: Generate arrays, Sets, and Tuples out of the box.

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
npm install instancio-js ts-patch
npx ts-patch install
```

### Prerequisites

- Typescript 5.0 or newer
- [ts-patch](https://github.com/nonara/ts-patch)

### setting up tsconfig.json

DISCLAIMER: You must use a custom transformer in order to make the library work.

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "instancio-js/dist/transformer"
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

### `.set(field, value)`

Fixes a specific field to the given value; all other fields are still randomly generated.

```typescript
const user: User = Instancio.of<User>().set('email', 'test@example.com').generate();
// user.email === 'test@example.com'
```

### `.supply(field, supplier)`

Uses a supplier function to generate the value for a specific field, called once per generated object.

```typescript
const user: User = Instancio.of<User>()
  .supply('age', () => Math.floor(Math.random() * 18) + 18)
  .generate();
// user.age is always between 18 and 35
```

### `.ignore(field)`

Excludes a field from generation; the property will be absent (`undefined`) in the generated object.

```typescript
const user: User = Instancio.of<User>().ignore('password').generate();
// user.password === undefined
```

These three methods are chainable and can be combined freely:

```typescript
const user: User = Instancio.of<User>()
  .set('name', 'Alice')
  .supply('age', () => 30)
  .ignore('password')
  .generate();
```

## Usage

### Generating a Typed Object

You can generate a random object of a specific type based on a TypeScript interface or class.
(see intro example)

### Generating a Typed Array with a custom generator

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

### Combining field-level customization with a custom generator

`set()`, `supply()`, and `ignore()` can be combined with `withCustomGenerator()` for fine-grained control:

```typescript
const users: User[] = Instancio.ofArray<User>(5)
  .withCustomGenerator(new CustomUserGenerator())
  .set('role', 'admin')
  .supply('email', () => `user-${Date.now()}@example.com`)
  .ignore('password')
  .generateArray();
```

**Output Example**:

```json
[
  { "name": "Alice", "age": 75, "role": "admin", "email": "user-1234567890@example.com" },
  { "name": "Bob", "age": 42, "role": "admin", "email": "user-1234567891@example.com" }
]
```

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

## License

instancio-js is distributed under the MIT license.

---

This README outlines the core features, installation process, and usage examples for the library. Feel free to extend or modify it as needed.
