# GRAMMAR

**GRAMMAR** is the governed multimodal execution runtime for ACHIEVEMOR's Plug platform in Deploy by ACHIEVEMOR.

## Repository role

GRAMMAR is the primary implementation repo for:
- agent orchestration,
- typed Plug/tool execution,
- voice-first and vision-first interaction scaffolding,
- memory-aware iteration,
- policy and safety controls,
- consistent chat and data-source UX behavior.

## Implemented in this phase

- Core module scaffolding under `src/` for orchestrator, tools, multimodal, platform, agents, UI, and shared layers.
- SOP pack under `docs/sop` covering FDH, Look/Listen/Learn, ASCII-first gates, change-order memory, QA/security, chat standards, and data-source flow.
- Typed contracts (Zod) for agents, tools, orchestration payloads, and ASCII prototypes.
- First memory layer storing session notes, preferences, change orders, approvals, rejections, and data-source selections.
- First working orchestration slice: text request -> routing -> policy-checked tool run -> response payload.
- Chat shell state scaffold with exact bezel label `Chat w/ACHEEVY` and multi-source attach behavior.
- ASCII prototype artifact support and baseline prototype for chat shell.
- Unit and integration tests for schemas, routing, policy, memory/prototypes, chat state, and orchestration flow.

## Key docs

- [`docs/README.md`](docs/README.md)
- [`docs/architecture/implementation-overview.md`](docs/architecture/implementation-overview.md)
- [`docs/integration-foundation.md`](docs/integration-foundation.md)
- [`docs/prototypes/chat-shell-v1.md`](docs/prototypes/chat-shell-v1.md)
