# Claude Code Collaboration Notes

Read `AGENTS.md` first, then read `COLLABORATION.md`.

The user wants Codex and Claude Code to work together on the same learning/tools site.
Please avoid broad rewrites. Prefer small, shippable upgrades with `npm run lint`,
`npm run typecheck`, and `npm run build` before handoff.

Current split:

- Codex is owning AI provider routing, Ollama fallback, security, deployment, and release notes.
- Claude Code should preferably own user-facing learning workbench upgrades, especially
  English typing/fullscreen practice, compact layout polish, and smooth learning flows.

Please do not revert existing edits. The worktree already contains active Codex changes.
