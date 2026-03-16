# GRAMMAR Architecture

GRAMMAR is ACHIEVEMOR’s API-first, vision-first action runtime designed to turn human intent into governed, multi-role execution.

## System Map

```text
GRAMMAR/
|
+-- Core_Runtime/                # Governed Logic & Routing
|   |
|   +-- NTNTN/                   # Intent Framing & Normalization
|   +-- MIM/                     # Context Management (NOT an agent)
|   +-- ACHEEVY/                 # Orchestration & Sequencing
|   +-- Picker_Ang/              # Capability-first Routing
|   +-- BuildSmith/              # Output Assembly & Manifests
|   +-- Review_Hone/             # Validation & Gating
|   +-- Packaging/               # Final Delivery Bundling
|
+-- Workflow_Spine/              # Durable Execution & State
|   |
|   +-- LangGraph/               # Graph Definitions & Checkpointing
|
+-- Execution_Branches/          # Specialized Work Units
|   |
|   +-- Boomer_Angs/             # General Execution Roles
|   +-- DeerFlow/                # Research-heavy Search & Synthesis
|   +-- OpenSandbox/             # Isolated Code/Browser Execution
|   +-- Playwright_MCP/          # Deterministic Browser Interaction
|   +-- OpenRouter/              # LLM Layer & Provider Switching
|   +-- Mercury_2/               # Fast Reasoner for Huddles/Intent
|   +-- Brave/                   # Search Grounding
|   +-- Firecrawl/               # Scraping & Extraction
|   +-- CoPaw/                   # Operator-facing Helper Flows
|   +-- OpenCode/                # IDE-side Development Assistance
|
+-- Experience_Plane/            # UI & Interaction Surfaces
|   |
|   +-- Chat_w_ACHEEVY/          # Main Interface
|   +-- Board_Monitor/           # Execution Tracking
|   +-- Review_Surface/          # Approval Gates
|   +-- Artifact_Retrieval/      # Bundle Downloads
|
+-- Platform_Plane/              # Infrastructure & Persistence
    |
    +-- Postgres/                # Source of Truth (State/Lineage)
    +-- Redis/                   # Events & Live State
    +-- Object_Storage/          # Artifacts & Bundles
    +-- WebSocket_Event_Layer/   # Live Updates
    +-- Auth_RBAC/               # Access Control
    +-- Observability/           # Traces & Cost Tracking
```

## Runtime Roles

- **NTNTN**: Frames and normalizes user intent into an objective context.
- **MIM**: Governs context, revisions, memory, and distribution. *Explicitly NOT an agent.*
- **ACHEEVY**: Orchestrates sequencing, huddles, and checkpoints.
- **Boomer_Angs**: Specialized execution roles (Research, Coding, Analysis).
- **Picker_Ang**: Capability-first routing logic.
- **BuildSmith**: Assembles approved deliverables for packaging.
- **Review/Hone**: Validates, corrects, and gates releases.
- **Packaging**: Prepares handoff bundles and evidence manifests.

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Runtime**: Node.js/TypeScript
- **BaaS**: InsForge (PostgreSQL, Auth, Storage, AI)
- **Workflow**: LangGraph
- **Discovery**: Brave Search / Firecrawl
- **Sandbox**: OpenSandbox (Playwright/E2B)
- **LLM Layer**: OpenRouter (Mercury-2 for high-speed reasoning)
