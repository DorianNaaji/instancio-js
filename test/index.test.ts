import { getRandomNumber } from "../src";
import { describe, it, expect } from 'vitest';
import { Instancio } from "../src/instancio";

describe('Utility Functions', () => {
    // Test for getRandomNumber
    it('should generate a random number between 1 and 10', () => {
        const result = getRandomNumber(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
    });



    it('test', () => {
        Instancio.of<User>().generate();
    });
});

export interface User {
    name?: string;
    age?: number;
    email?: string;
    phone?: string;
    address?: string;
    country?: string;
    city?: string;
    zip?: string;
    // roomMate: RoomMate;
}

export interface RoomMate {
    name?: string;
    age?: number;
    email?: string;
}

