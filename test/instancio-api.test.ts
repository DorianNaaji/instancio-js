import { describe, it, expect } from "vitest";
import { Instancio } from "../src/instancio";

describe("Instancio Api tests", () => {
  it("test", () => {
    const i = Instancio.of<AllTypes>().generate();
    console.log(i);
  });
});

export interface AllTypes {
  string?: string;
  // bigint?: bigint;
  number?: number;
  // unknown?: unknown;
  boolean?: boolean;
  // object?: object;
  // any?: any;
  roomMate: RoomMate;
}

export type UserType = {
  name?: string;
  age?: number;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  zip?: string;
  roomMate: RoomMate;
};

export interface RoomMate {
  name?: string;
  age?: number;
  email?: string;
}
