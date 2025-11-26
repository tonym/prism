# Prism Agents Root

## 🤖 Purpose of This Directory

The `AGENTS/` directory defines how automated agents (including LLM-based assistants) must operate when interacting with the Prism codebase.
These documents establish **rules, boundaries, safety rails, and canonical conventions** for all agent-driven changes.

Agents should treat this folder as the authoritative protocol layer for how Prism expects code to be generated, reviewed, modified, and structured.

---

## 🧭 Canonical Architecture Overview

Prism is a modular monorepo built around strict package boundaries.
Agents MUST respect these boundaries at all times.

### **Blueprints (source of truth for shapes & flows)**
`packages/blueprints/`
Defines contracts, schemas, UI structures, agent action contracts, and pipeline interface shapes.

### **Adapters (vendor integrations)**
`packages/adapters/`
Contains *all external service integration logic* (LLMs, APIs, SDKs, databases).
No other package may directly depend on external vendors.

### **Pipelines (orchestration & logic)**
`packages/pipelines/`
Implements workflows, chains, reasoning modules, and orchestrated flows that consume adapters & blueprints.

### **Evals (quality & benchmarking)**
`packages/evals/`
Implements tests, scoring harnesses, regression checks, and evaluation pipelines.

### **Shared Utilities**
`packages/shared/`
Reusable helpers, logging, math, parsing, validation, and general-purpose utilities.

### **Storefront (application layer)**
`packages/storefront/`
Implements app-level UI flows, routing, pages, and higher-level UX that uses UI Core.

### **UI Core (design system primitives)**
`packages/ui-core/`
Primitive UI building blocks, tokens, and blueprint → UI mappers.

---

## 📌 What Agents MUST Read Before Doing Work

The following protocol files define the rules for each domain:

- `/AGENTS/ADAPTERS.md` — How to generate or modify adapter integrations.
- `/AGENTS/BLUEPRINTS.md` — Structure and rules for blueprint creation & updates.
- `/AGENTS/EVALS.md` — How to create eval harnesses, tests, and scoring logic.
- `/AGENTS/PIPELINES.md` — How to build pipeline modules aligned with blueprints.
- `/AGENTS/STOREFRONT.md` — Rules for Storefront contributions.
- `/AGENTS/UI_CORE.md` — How agents should construct or modify UI primitives.
- `/AGENTS/META.yml` — Global metadata, versions, and protocol alignment info.

If a rule in any of these files contradicts code in the repo, the **AGENTS spec wins**, and the code should be updated accordingly.

---

## 🛡️ Operating Rules for All Agents

1. **Respect Package Boundaries**
   Never introduce cross-package dependencies that violate architectural lines.

2. **Blueprint-First Development**
   All pipelines, adapters, and UI structures must map cleanly onto a blueprint contract.
   If no blueprint exists, propose one before implementing logic.

3. **Minimal, Localized Diffs**
   Make the smallest change required unless explicitly directed otherwise.

4. **Deterministic Output**
   Code generation must be stable, predictable, and strictly follow conventions defined in AGENTS protocols.

5. **Adhere to Canonical Paths**
   Only generate files in locations consistent with the package directory rules.

6. **Never Guess**
   If a requirement is ambiguous or a file is missing, the agent MUST ask for human clarification.

7. **Document Intent**
   When adding new logic, update nearby docs, READMEs, or protocol files.

---

## 📂 Canonical Paths for Generated Code

When generating or modifying files, agents MUST follow these patterns:

### Blueprints
`packages/blueprints/src/<domain>/<name>.contract.ts`
`packages/blueprints/src/<domain>/<name>.schema.ts`

### Adapters
`packages/adapters/src/<vendor>/<feature>.adapter.ts`

### Pipelines
`packages/pipelines/src/<domain>/<name>.pipeline.ts`

### Evals
`packages/evals/src/<domain>/<name>.eval.ts`

### Shared
`packages/shared/src/<utility>.ts`

### Storefront
`packages/storefront/src/<feature>/<component>.tsx`

### UI Core
`packages/ui-core/src/<primitive>/<PrimitiveName>.tsx`

Agents MAY propose new subdirectories *within these boundaries*, but must never create new top-level packages.

---

## ✅ Summary

This ROOT spec defines the global expectations for agent operation inside Prism.
Agents must follow:

- Blueprint-first design
- Strict architectural boundaries
- Canonical paths
- Minimal diffs
- Full protocol compliance

All agent activity should reinforce a consistent, stable, and predictable Prism architecture.
