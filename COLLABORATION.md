# Collaboration Board

## Product Direction

Build JinMing Lab / VantaAPI into a focused AI tools and learning lab:

- Fast AI helpers for English and programming.
- Fullscreen, low-friction English practice.
- Zero-foundation programming learning paths.
- Enterprise-minded security without hurting normal users.

## Current Codex State

Already deployed to production:

- AI coach streams answers and gives instant local drafts.
- The coach no longer exposes model reasoning content.
- Anonymous AI coach access is allowed with strict rate limits.
- GLM/OpenAI-compatible API is primary.
- Ollama fallback is now implemented behind `OLLAMA_ENABLED`.
- If all AI providers fail, the built-in coach still answers quickly.
- Admin AI provider status is being added at `/api/admin/ai-providers`
  and surfaced in `/admin/security`.

Latest deployment at the time of this note:

- `https://vantaapi.com`
- Deployment id: `dpl_D7pNpFmYNN6HDbRMDyWtFM66vudZ`

## Active Codex-Owned Files

Avoid editing these unless coordinating first:

- `lib/ai-client.ts`
- `lib/ai-coaches.ts`
- `components/learning/AICoachPanel.tsx`
- `lib/ai-provider-status.ts`
- `app/api/admin/ai-providers/route.ts`
- `components/admin/AIProviderStatusPanel.tsx`
- `.env.example`
- `README.md`

## Good Claude-Owned Next Tasks

1. Upgrade `app/english/typing/page.tsx` and `components/learning/EnglishTypingTrainer.tsx`.
   Make the English typing system feel like a real fullscreen training app:
   spell-to-pass, wrong-letter feedback, keyboard-first controls, compact stats,
   focus mode, and clean mobile layout.

2. Polish dense learning pages without making hero blocks huge:
   keep main content centered, compact, and app-like.

3. Improve English vocabulary practice flow without adding copyrighted dictionary data:
   original hints, user-created wordbook flow, legal synthetic pronunciation guidance,
   and better review rhythm.

## Safety Rules

- Do not commit secrets, `.env`, `.next`, `node_modules`, local DB files, or model keys.
- Do not expose Ollama port `11434` publicly.
- Do not add official exam questions or copied dictionary content.
- Keep login/register security and bot protection intact.
- Keep `proxy.ts` as the single Next request guard. Do not add `middleware.ts`
  because Next 16 fails the build when both files exist.
- Do not enable public C++ execution unless it runs in a separate hardened sandbox.

## Verification

Before handing back:

```bash
npm run lint
npm run typecheck
npm run build
```

For local AI fallback testing:

```bash
ollama pull qwen2.5:3b
OLLAMA_ENABLED=true OLLAMA_MODEL="qwen2.5:3b" npm run dev:3001
```
