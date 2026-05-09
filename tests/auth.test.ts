import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

// Test password hashing directly with bcryptjs
async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

describe('Password Hashing', () => {
  it('should hash a password', async () => {
    const password = 'testPassword123';
    const hashed = await hashPassword(password);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(password);
    expect(hashed.length).toBeGreaterThan(0);
  });

  it('should verify correct password', async () => {
    const password = 'testPassword123';
    const hashed = await hashPassword(password);
    const isValid = await verifyPassword(password, hashed);

    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'testPassword123';
    const hashed = await hashPassword(password);
    const isValid = await verifyPassword('wrongPassword', hashed);

    expect(isValid).toBe(false);
  });
});
