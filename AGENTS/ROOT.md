# Prism Agents Root

## 🤖 Purpose of This Directory

The `AGENTS/` directory defines how automated agents (including LLM-based assistants) must operate when interacting with the Prism codebase.
These documents establish **rules, boundaries, safety rails, and canonical conventions** for all agent-driven changes.

Agents should treat this folder as the authoritative protocol layer for how Prism expects code to be generated, reviewed, modified, and structured.

---

## 🧭 Canonical Architecture Overview

Prism is a modular monorepo built around strict domain boundaries.
Agents MUST respect these boundaries at all times.

### **Blueprints (source of truth for shapes & flows)**
`domains/blueprints/`
Defines contracts, schemas, UI structures, agent action contracts, and pipeline interface shapes.

### **Adapters (vendor integrations)**
`domains/adapters/`
Contains *all external service integration logic* (LLMs, APIs, SDKs, databases).
No other domain may directly depend on external vendors.

### **Orchestration (execution & sequencing)**
`domains/orchestration/`
Implements validated orchestration flows and ordered execution pipeline modules that consume adapters and blueprints.

### **Evals (quality & benchmarking)**
`domains/evals/`
Implements tests, scoring harnesses, regression checks, and evaluation suites for orchestration modules and other domains.

### **Shared Utilities**
`domains/shared/`
Reusable helpers, logging, math, parsing, validation, and general-purpose utilities.

### **Storefront (application layer)**
`domains/storefront/`
Implements app-level UI flows, routing, pages, and higher-level UX that uses UI Core.

### **UI Core (design system primitives)**
`domains/ui-core/`
Primitive UI building blocks, tokens, and blueprint → UI mappers.

---

## 📌 What Agents MUST Read Before Doing Work

The following protocol files define the rules for each domain:

- `/AGENTS/ADAPTERS.md` — How to generate or modify adapter integrations.
- `/AGENTS/BLUEPRINTS.md` — Structure and rules for blueprint creation & updates.
- `/AGENTS/EVALS.md` — How to create eval harnesses, tests, and scoring logic.
- `/AGENTS/ORCHESTRATION.md` — How to build orchestration pipeline modules aligned with blueprints.
- `/AGENTS/STOREFRONT.md` — Rules for Storefront contributions.
- `/AGENTS/UI_CORE.md` — How agents should construct or modify UI primitives.
- `/AGENTS/META.yml` — Global metadata, versions, and protocol alignment info.
- `/AGENTS/PROTOCOL_MANIFEST.yml` — Machine-readable protocol precedence, read order, and canonical terminology map.
- `/AGENTS/ORCHESTRATOR.md` — Planning, control, escalation, and eval coordination rules for orchestrating agents.


If a rule in any of these files contradicts code in the repo, the **AGENTS spec wins**, and the code should be updated accordingly.

---

## 🛡️ Operating Rules for All Agents

1. **Respect Domain Boundaries**
   Never introduce cross-domain dependencies that violate architectural lines.
   
2. **Global Import Rules (Required for All Agents)**

All generated or modified code **must follow monorepo import boundaries**.

**Allowed (Workspace Imports)**  
Agents must import from **workspace module names** (for example `@prism/*`), never by relative paths:

```ts
import { Button } from '@prism/ui-core';
import { getClient } from '@prism/adapters';
import { productSchema } from '@prism/sanity';
import { formatPrice } from '@prism/shared';
```

**Not Allowed (Relative Cross-Domain Paths)**  
Agents must **never** generate imports that cross domain boundaries via relative paths:

```ts
import { Button } from '../../ui-core/src/components/Button';
import { something } from '../../../shared/utils';
```

**Enforcement**
- Applies to all domains (UI, Angular, adapters, orchestration, evals, etc).
- Agents must refuse or fail output that violates import boundaries.
- Relative imports *within* the same workspace module are allowed and expected.

Following this rule guarantees:
- deterministic builds  
- safe refactors  
- consistent agent behavior  
- clean dependency graphs across the system
  
3. **Blueprint-First Development**
   All orchestration pipeline modules, adapters, and UI structures must map cleanly onto a blueprint contract.
   If no blueprint exists, propose one before implementing logic.

4. **Minimal, Localized Diffs**
   Make the smallest change required unless explicitly directed otherwise.

5. **Deterministic Output**
   Code generation must be stable, predictable, and strictly follow conventions defined in AGENTS protocols.

6. **Adhere to Canonical Paths**
   Only generate files in locations consistent with the domain directory rules.

7. **Never Guess**
   If a requirement is ambiguous or a file is missing, the agent MUST ask for human clarification.

8. **Document Intent**
   When adding new logic, update nearby docs, READMEs, or protocol files.

9. **Testing Conventions**

All generated or modified code **must include complete, deterministic test coverage**.

**Requirements (applies to every domain):**
- Every new component, utility, adapter, orchestration module, or blueprint MUST include a corresponding test file as a sibling to the tested file in the same folder.
- Tests MUST use exactly one `expect()` per `it()` — including table-driven tests, which MUST have at most one `expect()` per test case.
- Table-driven tests are allowed and encouraged for inputs with clear permutations.
- All tests MUST pass before an agent considers a task complete.
- Tests MUST follow the directory and naming structure defined by the domain (e.g., `__tests__`, mirroring file paths, or domain-specific conventions).
- Agents MUST NOT introduce snapshot tests.
- Tests MUST remain hermetic and deterministic—no reliance on external services or nondeterministic timers.

**Test Coverage Requirements**

- Agents MUST generate tests that exercise **all reachable branches** of logic — including happy paths, error paths, guard clauses, and edge cases.
- If a branch cannot be exercised, agents MUST flag the code for orchestrator review, as this often indicates:
  - unreachable or dead code  
  - overly defensive or redundant checks  
  - structural issues in flow control  
  - state transformations that cannot occur under real conditions
- Agents MAY refactor logic (when permitted) to improve testability and eliminate unreachable branches.
- Coverage MUST be meaningful, not superficial:
  - no trivial execution-only tests  
  - no placeholder tests  
  - no tautological assertions  
- Agents MUST avoid artificially inflating coverage through mocks that bypass meaningful logic.

The goal of coverage is to create **architectural pressure** that reveals structural weakness, ensures correctness, and drives higher-quality agent-generated output.

These requirements ensure:
- predictable system behavior  
- safe refactoring  
- verifiable agent output  
- consistent structure across all domains

---

## 📂 Canonical Paths for Generated Code

When generating or modifying files, agents MUST follow these patterns:

### Blueprints
`domains/blueprints/src/<domain>/<name>.contract.ts`
`domains/blueprints/src/<domain>/<name>.schema.ts`

### Adapters
`domains/adapters/src/<vendor>/<feature>.adapter.ts`

### Orchestration
`domains/orchestration/src/<domain>/<name>.pipeline.ts`

### Evals
`domains/evals/src/<domain>/<name>.eval.ts`

### Shared
`domains/shared/src/<utility>.ts`

### Storefront
`domains/storefront/src/<feature>/<component>.tsx`

### UI Core
`domains/ui-core/src/<primitive>/<PrimitiveName>.tsx`

Agents MAY propose new subdirectories *within these boundaries*, but must never create new top-level domains.

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
