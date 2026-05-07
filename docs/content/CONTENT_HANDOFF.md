# Content Reduction Handoff

## Codex scope

Codex owns structural release cleanup:

- hide unfinished public entries from navigation/homepage
- keep security behavior from regressing
- preserve disabled C++ runner
- run release checks

Codex should avoid large visual rewrites unless needed for link removal.

## Claude Code scope

Claude Code owns frontend experience:

- homepage hierarchy and layout
- tool page sections and examples
- language consistency in visible UI
- visual polish within existing design style

Claude should avoid backend API, security logic, database schema, `proxy.ts`, and `SECURITY.md`.

## OpenClaw scope

OpenClaw owns rules and review assets:

- brand guide
- content reduction guide
- tool page content template
- launch content checklist
- advisory content scan script

OpenClaw should avoid implementing frontend/backend changes unless explicitly reassigned.

## Shared decision

Public brand: **VantaAPI**.

Homepage core:

1. AI tools
2. Coding practice
3. Learning roadmaps

Secondary modules should not dominate the homepage.
