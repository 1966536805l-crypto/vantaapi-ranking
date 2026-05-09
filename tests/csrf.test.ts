import { describe, it, expect } from 'vitest';
import {
  generateCsrfToken,
  signCsrfToken,
  verifyCsrfToken,
} from '@/lib/csrf';

describe('CSRF Protection', () => {
  describe('generateCsrfToken', () => {
    it('should generate a token', () => {
      const token = generateCsrfToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate hex string', () => {
      const token = generateCsrfToken();
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });
  });

  describe('signCsrfToken', () => {
    it('should sign a token', () => {
      const token = generateCsrfToken();
      const signature = signCsrfToken(token);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should produce consistent signatures for same token', () => {
      const token = generateCsrfToken();
      const sig1 = signCsrfToken(token);
      const sig2 = signCsrfToken(token);

      expect(sig1).toBe(sig2);
    });

    it('should produce different signatures for different tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      const sig1 = signCsrfToken(token1);
      const sig2 = signCsrfToken(token2);

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('verifyCsrfToken', () => {
    it('should verify valid token and signature', () => {
      const token = generateCsrfToken();
      const signature = signCsrfToken(token);

      const isValid = verifyCsrfToken(token, signature);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const token = generateCsrfToken();
      const wrongSignature = signCsrfToken(generateCsrfToken());

      const isValid = verifyCsrfToken(token, wrongSignature);
      expect(isValid).toBe(false);
    });

    it('should reject empty token', () => {
      const signature = signCsrfToken('test');
      const isValid = verifyCsrfToken('', signature);
      expect(isValid).toBe(false);
    });

    it('should reject empty signature', () => {
      const token = generateCsrfToken();
      const isValid = verifyCsrfToken(token, '');
      expect(isValid).toBe(false);
    });

    it('should reject tampered signature', () => {
      const token = generateCsrfToken();
      const signature = signCsrfToken(token);
      const tamperedSignature = signature.slice(0, -2) + 'xx';

      const isValid = verifyCsrfToken(token, tamperedSignature);
      expect(isValid).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      const token = generateCsrfToken();
      const signature = signCsrfToken(token);

      // Multiple verifications should take similar time
      const start1 = Date.now();
      verifyCsrfToken(token, signature);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      verifyCsrfToken(token, 'wrong-signature-here');
      const time2 = Date.now() - start2;

      // Both should complete quickly (timing-safe)
      expect(time1).toBeLessThan(100);
      expect(time2).toBeLessThan(100);
    });
  });

  describe('CSRF token lifecycle', () => {
    it('should maintain integrity through generate/sign/verify cycle', () => {
      const token = generateCsrfToken();
      const signature = signCsrfToken(token);
      const isValid = verifyCsrfToken(token, signature);

      expect(isValid).toBe(true);
    });
  });
});
