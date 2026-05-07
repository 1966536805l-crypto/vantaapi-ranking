# OpenClaw ↔ Codex handoff

## User direction

鱼明确要求：不要把站点简单改成全英文；要做得更高级，升级为中英双语、考试导向的学习站。

## Completed by OpenClaw

- Spawned two collaboration tasks:
  - English exam vocabulary content design
  - C++ 1000 question bank design
- Implemented vocabulary upgrade:
  - `lib/exam-content.ts`
  - `app/english/vocabulary/page.tsx`
  - `app/english/vocabulary/[pack]/page.tsx`
- Added 5 exam vocabulary packs:
  - IELTS 5000
  - TOEFL 5000
  - CET 4
  - CET 6
  - Postgraduate Entrance English
- Each pack now has 20 priority words with:
  - word
  - phonetic
  - Chinese meaning
  - English meaning
  - collocation
  - example sentence
  - exam note
- Added bilingual writing / reading sentence frames and reading logic words.
- Implemented C++ bank upgrade:
  - `lib/cpp-bank.ts`
  - `app/cpp/quiz/[id]/page.tsx`
  - `app/cpp/page.tsx`
  - `prisma/seed.cjs`
- C++ 1000 bank now uses 8 categories × 125 questions:
  - syntax-types
  - control-flow
  - arrays-strings
  - pointers-references
  - oop
  - stl
  - algorithms
  - code-reading-output
- Page renders 25 questions per page instead of dumping 1000 at once.
- No online runner added; C++ remains static quiz / code-reading / output-prediction MVP.

## Verification

- `node --check prisma/seed.cjs` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅
- Local preview route checks on port 3012 ✅
  - `/`
  - `/english/vocabulary`
  - `/english/vocabulary/ielts-5000`
  - `/english/vocabulary/toefl-5000`
  - `/english/vocabulary/cet-4-core`
  - `/english/vocabulary/cet-6-core`
  - `/english/vocabulary/postgraduate-core`
  - `/cpp`
  - `/cpp/quiz/mega-1000`
  - `/cpp/quiz/mega-1000?page=6`

## Notes

- I briefly stopped the local `next dev --port 3001` server to clear a Next build lock, then restarted it after validation.
- No production deployment has been run.
- If deploying, run the normal Vercel flow only after reviewing the large working tree diff.
