# GEMINI.md

> Project instructions for Google Gemini Code Assist / Gemini CLI / Antigravity.

**grammar** — A software project.

## Project Rules

@.ai/rules/*.md

## Antigravity Agent Kit
This project uses the **Antigravity Agent Kit** for collaborative jobs and context-aware agent behaviors.
- Use `npx agentkit` for rule and skill management.
- Integration: **Gemini Embeddings 2** (`gemini-embedding-2-preview`) for multimodal memory.

## InsForge UI Build
Use **InsForge** agents to expedite UI building within the `agenticui-nextui` framework.
- CLI: `@insforge/cli`
- Purpose: Automated backend provisioning and rapid UI prototyping.

## Architecture Decisions & Memory

- `.ai/decisions/` — Architecture Decision Records (ADRs) with context and rationale
- `.ai/changelog/` — Monthly change logs with context, reasoning, and impact
- `.ai/skills/` — Portable skill definitions — read and execute `.ai/skills/<name>/skill.md` when triggered
- `.ai/memory/` — Shared memory files (debugging patterns, known issues, refactoring log)
- `.specs/` — PRD、设计、Epic、Story — 通过 /spec 管理

## 交互语言

所有 AI 回复、代码注释、commit message 和文档一律使用 **中文**。
