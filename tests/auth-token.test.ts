import { describe, it, expect } from 'vitest';
import { signAuthToken, verifyAuthToken, type AuthPayload } from '@/lib/auth-token';
import { UserRole } from '@prisma/client';

describe('JWT Token Management', () => {
  const validPayload: AuthPayload = {
    userId: 'test-user-123',
    role: UserRole.USER,
  };

  describe('signAuthToken', () => {
    it('should create a valid JWT token', () => {
      const token = signAuthToken(validPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should create tokens with consistent structure', () => {
      const token1 = signAuthToken(validPayload);
      const token2 = signAuthToken(validPayload);

      // Both should be valid JWT tokens
      expect(token1.split('.').length).toBe(3);
      expect(token2.split('.').length).toBe(3);
    });

    it('should create token for admin role', () => {
      const adminPayload: AuthPayload = {
        userId: 'admin-123',
        role: UserRole.ADMIN,
      };

      const token = signAuthToken(adminPayload);
      expect(token).toBeDefined();
    });
  });

  describe('verifyAuthToken', () => {
    it('should verify valid token', () => {
      const token = signAuthToken(validPayload);
      const verified = verifyAuthToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(validPayload.userId);
      expect(verified?.role).toBe(validPayload.role);
    });

    it('should reject invalid token', () => {
      const verified = verifyAuthToken('invalid.token.here');
      expect(verified).toBeNull();
    });

    it('should reject empty token', () => {
      const verified = verifyAuthToken('');
      expect(verified).toBeNull();
    });

    it('should reject tampered token', () => {
      const token = signAuthToken(validPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      const verified = verifyAuthToken(tamperedToken);
      expect(verified).toBeNull();
    });

    it('should verify admin token correctly', () => {
      const adminPayload: AuthPayload = {
        userId: 'admin-456',
        role: UserRole.ADMIN,
      };

      const token = signAuthToken(adminPayload);
      const verified = verifyAuthToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.role).toBe(UserRole.ADMIN);
    });
  });

  describe('Token lifecycle', () => {
    it('should maintain payload integrity through sign/verify cycle', () => {
      const payload: AuthPayload = {
        userId: 'user-789',
        role: UserRole.USER,
      };

      const token = signAuthToken(payload);
      const verified = verifyAuthToken(token);

      expect(verified).toEqual(payload);
    });
  });
});
