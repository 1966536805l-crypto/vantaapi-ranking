# VantaAPI Content Reduction Guide

Owner: OpenClaw
Scope: brand, product copy, content hierarchy, and release-readiness review. This guide does not define backend API behavior or page implementation details.

## Decision

Use **VantaAPI** as the public product brand.

Reasons:

- The production domain is `vantaapi.com`.
- The current repository and security docs already use VantaAPI in several release-facing places.
- A single product name is easier to remember, search, and trust.

## Brand rules

Use:

- VantaAPI
- VantaAPI AI Tools
- VantaAPI Coding Lab

Avoid in public UI and SEO metadata:

- JinMing Lab
- JinMing AI Coding Lab
- immortal
- vantaapi-ranking

Allowed exceptions:

- Historical internal docs and handoff notes.
- Existing localStorage/cookie keys when renaming would break users.
- Source paths or repository names in technical reports.

## Homepage focus

The homepage should explain only three primary things:

1. AI tools
2. Programming practice
3. Learning roadmaps

Everything else should be secondary:

- English learning
- world languages
- typing practice
- question banks
- admin pages
- reports/games/projects/experimental pages

Secondary modules can remain discoverable through lower-priority links, search, or internal pages. They should not compete with the homepage hero or primary cards.

## Recommended homepage copy

Chinese UI:

```text
VantaAPI
AI 工具与编程实验室

一个面向零基础学习者和独立开发者的 AI 工具与编程训练平台。
用更清晰的提示词、更快的代码理解、更系统的练习路线，提升你的学习和开发效率。

按钮：
- 开始使用 AI 工具
- 进入编程训练
```

English UI:

```text
VantaAPI
AI Tools & Coding Lab

A focused AI tools and programming practice platform for beginners and independent developers.
Use clearer prompts, faster code understanding, and structured practice paths to improve how you learn and build.

Buttons:
- Start with AI Tools
- Enter Coding Practice
```

## Navigation priority

Primary navigation:

- AI 工具 / AI Tools
- 编程训练 / Coding Practice
- 学习路线 / Roadmaps

Secondary navigation:

- 英语学习 / English
- 世界语言 / Languages
- 今日计划 / Today
- 搜索 / Search

Do not put admin/security pages in normal learner-facing primary navigation.

## Hide unfinished entries before public launch

Hide from homepage and primary navigation if not complete:

- `/report`
- `/games`
- `/projects`
- `/questions`
- empty placeholder pages
- pages that mainly redirect without clear user value
- pages that return 404 from normal user paths

Do not delete code just to hide unfinished entries. Remove or downgrade links first.

## Claims and numbers

Avoid large exact claims unless the shipped content truly supports them.

Replace:

- IELTS 5000
- TOEFL 5000
- every language has 5000 questions
- 1000 passages
- enterprise-grade security
- complete production-ready platform

With:

- 持续更新的词汇训练
- 原创题库持续扩充
- 零基础编程练习
- 逐步完善的学习路线
- 发布前安全基线
- security baseline

## Language consistency

Chinese pages should use Chinese UI labels:

- AI 工具
- 编程实验室
- 学习路线
- 开始学习
- 输入示例
- 输出示例
- 使用限制

English pages should use English UI labels:

- AI Tools
- Coding Lab
- Learning Roadmaps
- Start Learning
- Input Example
- Output Example
- Limitations

Avoid mixed blocks such as:

```text
AI Tools Coding Lab World Languages 世界语言 Zero Foundation Start English
```

Mixed technical terms are acceptable only when they are normal product terms, such as API, JSON, GitHub, TypeScript, or Next.js.

## Tool page content standard

Each tool page should contain:

1. What this tool does
2. Who it is for
3. Input example
4. Output example
5. Common questions
6. Usage limits

Do not add new product features just to fill these sections. Use static examples when needed.

### Prompt Optimizer examples

- Writing prompt optimization
- Code generation prompt optimization
- Learning plan prompt optimization

### GitHub Repo Analyzer examples

- Understand how to run a public repository
- Review project structure before contributing
- Check README, CI, deployment, and security gaps

## Tone rules

Prefer:

- focused
- practical
- clear
- cautious
- evidence-based

Avoid:

- hype
- exaggerated numbers
- overpromising safety
- claiming official exam affiliation
- claiming private repo support in the MVP

## Launch content acceptance checklist

Before public launch, confirm:

- Public brand is VantaAPI across homepage, tool pages, metadata, and footer.
- Homepage hero mentions only AI tools, coding practice, and roadmaps.
- Unfinished routes are hidden from primary navigation.
- Large exact content-count claims are removed or softened.
- Chinese UI blocks are not mixed with random English labels.
- Tool pages include examples, FAQ, and limitations.
- Admin/security pages are not promoted to normal users.
- Security language says baseline/checklist, not absolute protection.
