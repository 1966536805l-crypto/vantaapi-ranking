import { describe, it, expect } from 'vitest';

describe('API Route Tests', () => {
  describe('Health Check API', () => {
    it('should return 200 status', async () => {
      const { GET } = await import('@/app/api/health/route');

      const response = await GET();

      expect(response.status).toBe(200);
    });

    it('should return JSON response', async () => {
      const { GET } = await import('@/app/api/health/route');

      const response = await GET();
      const data = await response.json();

      expect(data).toBeDefined();
      expect(data.status).toBeDefined();
      expect(['ok', 'operational', 'limited']).toContain(data.status);
    });
  });

  describe('CSRF Token API', () => {
    it('should generate CSRF token', async () => {
      const { GET } = await import('@/app/api/csrf/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.csrfToken).toBeDefined();
      expect(typeof data.csrfToken).toBe('string');
    });

    it('should set CSRF cookies', async () => {
      const { GET } = await import('@/app/api/csrf/route');

      const response = await GET();
      const cookies = response.cookies;

      expect(cookies.get('csrf-token')).toBeDefined();
      expect(cookies.get('csrf-signature')).toBeDefined();
    });

    it('should have no-store cache control', async () => {
      const { GET } = await import('@/app/api/csrf/route');

      const response = await GET();

      expect(response.headers.get('cache-control')).toBe('no-store');
    });
  });
});
