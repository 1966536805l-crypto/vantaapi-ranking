import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Setup test environment
  process.env = {
    ...process.env,
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test?sslmode=disable',
    JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
    CSRF_SECRET: 'test-csrf-secret-at-least-32-characters-long',
  };
});

afterAll(() => {
  // Cleanup
});
