# Original English Content Expansion Report

Date: 2026-05-06
Scope: English article library and question-bank expansion for vantaapi MVP. No production deployment was performed.

## User requirement

- English articles must be created by us, not copied from outside sources.
- Each grade needs 300 English reading chapters.
- IELTS needs 1000 original reading passages.
- TOEFL needs 1000 original reading passages.
- IELTS + TOEFL need 3000 multiple-choice questions and 3000 fill-blank questions.
- Each grade needs 1000 mixed multiple-choice/fill-blank questions.

## Implemented approach

Because the requested content volume is very large, the site now uses a deterministic internal original-content generator rather than hardcoding tens of thousands of static objects. This keeps the MVP fast and deployable while exposing the requested counts through paginated routes.

All generated content is produced from local templates, local topic pools, local grammar/vocabulary targets, and deterministic indexes. No external article source is fetched or copied.

## New files / routes

### Generator

- `lib/original-english-bank.ts`
  - Defines reading packs and question packs.
  - Generates original reading chapters with passage paragraphs, vocabulary, and after-reading tasks.
  - Generates original multiple-choice and fill-blank questions with answers and explanations.

### Reading library

- `/english/reading`
  - Hub page for all original article packs.
- `/english/reading/[pack]?page=N`
  - Paginated article route.
  - Examples:
    - `/english/reading/grade-7?page=300&lang=zh`
    - `/english/reading/ielts-reading-1000?page=1000&lang=zh`
    - `/english/reading/toefl-reading-1000?page=1000&lang=zh`

### Question bank

- `/english/question-bank`
  - Hub page for original question packs.
- `/english/question-bank/[pack]?page=N`
  - Paginated question route, 20 questions per page.
  - Uses existing `QuizBlock` for instant local checking.
  - Examples:
    - `/english/question-bank/ielts-original-3000?page=150&lang=zh`
    - `/english/question-bank/toefl-original-3000?page=150&lang=zh`
    - `/english/question-bank/grade-12-1000?page=50&lang=zh`

## Counts covered

### Reading articles

- Grade 7: 300 chapters
- Grade 8: 300 chapters
- Grade 9: 300 chapters
- Grade 10: 300 chapters
- Grade 11: 300 chapters
- Grade 12: 300 chapters
- IELTS: 1000 passages
- TOEFL: 1000 passages

Total reading articles exposed: 3800.

### Questions

- IELTS: 1500 multiple-choice + 1500 fill-blank
- TOEFL: 1500 multiple-choice + 1500 fill-blank

Total IELTS/TOEFL exam questions exposed: 3000 multiple-choice + 3000 fill-blank.

Grade packs:

- Grade 7: 500 multiple-choice + 500 fill-blank
- Grade 8: 500 multiple-choice + 500 fill-blank
- Grade 9: 500 multiple-choice + 500 fill-blank
- Grade 10: 500 multiple-choice + 500 fill-blank
- Grade 11: 500 multiple-choice + 500 fill-blank
- Grade 12: 500 multiple-choice + 500 fill-blank

Total grade questions exposed: 6000.

## UI integration

- Updated `/english` module cards to include:
  - Original Reading Library
  - Original Question Bank
- Existing vocabulary, grammar, and quiz routes remain available.

## Verification

Passed:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

Local route checks on `127.0.0.1:3033` passed with HTTP 200:

- `/english?lang=zh`
- `/english/reading?lang=zh`
- `/english/reading/grade-7?page=300&lang=zh`
- `/english/reading/ielts-reading-1000?page=1000&lang=zh`
- `/english/reading/toefl-reading-1000?page=1000&lang=zh`
- `/english/question-bank?lang=zh`
- `/english/question-bank/ielts-original-3000?page=150&lang=zh`
- `/english/question-bank/toefl-original-3000?page=150&lang=zh`
- `/english/question-bank/grade-12-1000?page=50&lang=zh`

## Next improvement suggestions

1. Add filters for grammar point, difficulty, exam skill, and topic.
2. Add persistent progress for generated local questions if needed.
3. Add richer passage templates for each grade and exam band.
4. Add admin import/export if the generated content later needs editorial review.
5. Deploy only after explicit user command: “部署”.
