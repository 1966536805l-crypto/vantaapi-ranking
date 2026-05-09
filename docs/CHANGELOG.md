# Changelog

All notable changes to JinMing Lab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-07

### Added

#### Learning Features
- **English Typing System**: Real-time spell validation with instant feedback (green/red)
- **Vocabulary Trainer**: Four-choice drill with Ebbinghaus spaced repetition
- **Custom Wordbook**: User-created vocabulary with bulk import and local storage
- **C++ Question Bank**: 1000-question bank across 8 categories
- **Programming Lab**: Zero-foundation learning paths for 25+ programming languages
- **Progress Tracking**: Local progress storage with wrong-question review

#### AI Features
- **AI Coach**: Streaming responses for English and programming questions
- **Ollama Integration**: Local AI fallback for offline/self-hosted deployments
- **Circuit Breaker**: Automatic failover when AI providers are unavailable
- **Built-in Coach**: Instant fallback responses when all AI providers fail

#### User Experience
- **Mobile Responsive**: Touch-friendly design with 44x44px minimum touch targets
- **Fullscreen Mode**: Distraction-free learning with keyboard-first controls
- **Real-time Feedback**: Instant validation as you type
- **Compact Design**: Professional Apple-like design language throughout

#### Security & Infrastructure
- **Enterprise Security Baseline**: Auth cookies, password hashing, rate limiting
- **DDoS Protection**: Edge-level and adaptive request shielding
- **Bot Protection**: Multi-layer bot detection and blocking
- **Supply Chain Security**: Automated dependency scanning and security gates
- **Security Headers**: CSP, HSTS, X-Frame-Options, and more
- **Admin Dashboard**: AI provider status monitoring and security controls

### Technical Stack
- Next.js 16.2.4 with TypeScript
- Prisma ORM with MySQL/MariaDB
- Tailwind CSS for styling
- Redis support for distributed rate limits and AI circuit breaker state

### Deployment
- Production target: https://vantaapi.com
- Vercel/CDN-ready deployment baseline
- Edge WAF and DDoS guidance documented

## [Unreleased]

### Planned
- Payment integration
- Live streaming features
- Community forum
- Additional language support
- Online C++ code execution only after a separately isolated sandbox/worker is implemented

---

For detailed history, see the repository Git log.
