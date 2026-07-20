// This fixture is read as raw text by ../vite.test.ts to drive the Vite plugin transform.
// It is intentionally excluded from the test tsconfig (not a *.test.ts file), so the unresolved
// `Instancio` reference here never breaks the suite build.

interface Address {
  city: string;
  zip: number;
}

export interface User {
  name: string;
  age: number;
  active: boolean;
  address: Address;
  tags: string[];
}

// Zero-boilerplate call: the plugin must inject the schema as the sole argument here.
export const user = Instancio.of<User>().generate();

// ofArray keeps its size argument; the schema is injected right after it.
export const users = Instancio.ofArray<User>(3).generateArray();

// An explicit schema must be left untouched.
export const explicit = Instancio.of<User>({ kind: 'object', properties: [] }).generate();
