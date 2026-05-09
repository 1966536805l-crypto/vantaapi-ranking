# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in JinMing Lab and provides guidelines for maintaining optimal performance.

## Implemented Optimizations

### 1. Next.js Configuration

**Image Optimization**
- AVIF and WebP format support for modern browsers
- Minimum cache TTL of 60 seconds
- Automatic image optimization on-demand

**Package Import Optimization**
- Optimized imports for `recharts` and `date-fns`
- Reduces bundle size by tree-shaking unused code

**Production Optimizations**
- Console statements removed in production builds
- Gzip compression enabled
- Source maps disabled in production

### 2. Caching Strategy

**Static Assets**
- `/_next/static/*`: 1 year cache with immutable flag
- `/favicon.ico`: 24 hour cache
- API routes: no-store (always fresh)

**Headers**
- DNS prefetch enabled
- Strict security headers
- HSTS with preload

### 3. Bundle Size Management

Run bundle analysis:
```bash
npm run perf:bundle
```

This generates a visual report of bundle sizes to identify optimization opportunities.

### 4. Performance Monitoring

**Lighthouse Audits**
```bash
# Local development
npm run dev
npm run perf:lighthouse

# Production URL
npm run perf:lighthouse -- --url=https://your-domain.com
```

**Performance Targets**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

Reports are saved to `.lighthouse/` directory.

## Best Practices

### Code Splitting

Use dynamic imports for heavy components:
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

### Database Queries

**Use Prisma efficiently:**
- Select only needed fields
- Use pagination for large datasets
- Implement proper indexes (already configured in schema)

```typescript
// Good: Select specific fields
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true },
  take: 20,
  skip: page * 20,
});

// Avoid: Fetching all fields and relations
const users = await prisma.user.findMany({
  include: { progress: true, attempts: true },
});
```

### API Routes

**Rate Limiting**
- Redis-backed rate limits enabled in production
- Per-IP and per-fingerprint budgets
- Configurable via `SECURITY_MODE` environment variable

**Response Caching**
- Use `Cache-Control` headers appropriately
- API routes default to `no-store`
- Static content cached at CDN level

### Frontend Performance

**React Best Practices**
- Use `React.memo()` for expensive components
- Implement proper key props in lists
- Avoid inline function definitions in render

**CSS Optimization**
- Tailwind CSS purges unused styles in production
- Critical CSS inlined automatically by Next.js

### Monitoring in Production

**Vercel Analytics** (if enabled)
- Core Web Vitals tracking
- Real user monitoring
- Performance insights

**Custom Monitoring**
```typescript
// Add to app/layout.tsx
export const metadata = {
  other: {
    'web-vitals': 'enabled',
  },
};
```

## Performance Checklist

Before deploying:

- [ ] Run `npm run perf:lighthouse` and verify scores
- [ ] Check bundle size with `npm run perf:bundle`
- [ ] Verify all images use Next.js Image component
- [ ] Ensure database queries are optimized
- [ ] Test with slow 3G network throttling
- [ ] Verify Redis rate limiting is enabled
- [ ] Check Core Web Vitals in production

## Common Issues

### Slow Initial Load
- Check bundle size
- Implement code splitting
- Optimize images
- Enable CDN caching

### Slow API Responses
- Add database indexes
- Implement Redis caching
- Optimize Prisma queries
- Check rate limit configuration

### High Memory Usage
- Review Prisma connection pooling
- Check for memory leaks in long-running processes
- Monitor Redis memory usage

## Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
