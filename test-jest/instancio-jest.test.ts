import { Instancio } from '../src';

interface RoomMate {
  name: string;
  age: number;
}

interface User {
  name: string;
  age: number;
  active: boolean;
  roomMate: RoomMate;
}

/**
 * Runs under jest with ts-jest + the instancio-js transformer registered via `astTransformers`
 * (see jest.config.cjs). No ts-patch, no tsconfig `plugins`, no explicit schema: the bare
 * `Instancio.of<T>()` API must keep working, exactly as under the tsc/vitest pipeline.
 */
describe('instancio via ts-jest astTransformers (no boilerplate)', () => {
  it('generates a fully populated nested object', () => {
    const user = Instancio.of<User>().generate();

    expect(user).toMatchObject({
      name: expect.any(String),
      age: expect.any(Number),
      active: expect.any(Boolean),
      roomMate: {
        name: expect.any(String),
        age: expect.any(Number),
      },
    });
  });

  it('generates arrays', () => {
    const users = Instancio.ofArray<User>(3).generateArray();
    expect(users).toHaveLength(3);
    users.forEach((u) => expect(typeof u.name).toBe('string'));
  });
});
