# Prism Blueprint Protocol

This document defines how agents must create, update, validate, and maintain Prism Blueprints — the structural contracts that describe the data, shapes, flows, and UI intentions used across the Prism ecosystem.

Blueprints represent the shared language between humans, the orchestrator, and domain agents. They describe **what the system should be**, not **how it is implemented**. All pipelines, adapters, UI primitives, and storefront features must map cleanly onto blueprint definitions.

---

## 🎯 Purpose of Blueprints

Blueprints provide:

* Canonical structural definitions for domains (UI, pipelines, data flows)
* Declarative contracts for agents and orchestrators
* Versioned schemas that evolve safely over time
* A stable foundation for agent-driven generation across packages
* A shared specification for humans and agents to collaborate

Agents must treat blueprints as the **authoritative source of truth** for all structural work.

---

## 📦 What Blueprints Contain

Blueprints define:

* Shapes (objects, enums, tagged unions)
* Interfaces for flows and pipelines
* UI-intent contracts (abstract props, component families)
* Data schemas for orchestration
* Cross-package agreements (UI Core ↔ Storefront ↔ Pipelines ↔ Adapters)

Blueprints must **not** contain:

* Implementation details
* Rendering logic
* Pipeline orchestration code
* Vendor-specific structures
* UI primitives or styling logic

Blueprints are **purely structural**.

---

## 📐 Required Architectural Boundaries

Blueprints live only in:

```
packages/blueprints/src/**
```

Other packages may **read** blueprint contracts but must never:

* Modify blueprint files
* Inline blueprint types
* Duplicate or mirror blueprint structures outside this package

All agent-generated code must reference blueprint types **directly**.

---

## 🛠️ Code Generation Rules for Agents

When generating or modifying blueprint files, agents must follow these rules:

### 1. File Structure

Contracts:

```
packages/blueprints/src/<domain>/<name>.contract.ts
```

Schemas:

```
packages/blueprints/src/<domain>/<name>.schema.ts
```

### 2. Contract Rules

Contract files must:

* Use TypeScript interfaces, enums, or tagged unions
* Contain no helper functions
* Contain no side effects
* Contain no runtime logic

### 3. Schema Rules

Schema files must:

* Define JSON schema or Zod-like shapes
* Mirror contract files exactly
* Avoid validation beyond structural requirements
  (e.g., no business rules, no range checks, no regex constraints unless required by structure)

### 4. Pattern Reuse

Agents must:

* Search for existing domain patterns before creating new ones
* Follow established naming and folder conventions
* Create new patterns only when necessary and consistent with existing design

### 5. Deterministic Naming

* Names must be semantic, descriptive, and domain-specific
* Avoid generic names like `Item`, `Config`, `Options`

---

## 🧭 Blueprint Versioning Requirements

Blueprint changes fall into three categories.

### 1. Backward-Compatible Additions

Examples:

* Adding optional fields
* Adding new shapes without replacing old ones

These may be introduced without orchestrator intervention.

### 2. Breaking Changes

Examples:

* Removing or renaming fields
* Changing required fields
* Replacing core shapes
* Altering flow signatures

Agents making breaking changes must:

* Document intent in the file header
* Update all corresponding schemas
* Update dependent tests across affected packages
* Note the change in the commit message or orchestrator yield

### 3. Deprecations

* Deprecated shapes must remain until no longer referenced
* Mark with a clear `@deprecated` comment
* Remove only with explicit human or orchestrator approval

---

## 🧪 Testing Requirements

All blueprint changes must include:

* Schema-to-contract alignment tests
* Type-level tests (TypeScript-based expectations)
* Validation of required fields (structure only)

Blueprint tests live in:

```
packages/blueprints/src/**/__tests__/**
```

Blueprints do **not** include runtime tests.

---

## 📄 Documentation Requirements

Each contract file must include:

* A description of the shape’s purpose
* Notes for how pipeline agents should use it
* Notes for UI mapping (if relevant)
* Version history when substantive changes occur

Documentation lives:

* In the file header
* Or in an adjacent Markdown file when appropriate

---

## 🔗 Interaction With Other Packages

### UI Core

Uses blueprint definitions to build primitive components.
Never modifies blueprints.

### Storefront

Uses blueprint structures for page composition and rendering.
Must not redefine blueprint structures.

### Pipelines

Consume blueprint contracts as the input/output structures for flows.

### Adapters

Translate blueprint-defined structures into vendor-specific API payloads.
Blueprints must remain vendor-agnostic.

### Shared Utilities

May reference blueprint types.
Must not modify blueprint files.

---

## ✔️ Agent Behavior Summary

Agents working with Blueprints must:

* Preserve structural consistency
* Maintain purity and avoid implementation details
* Keep schemas aligned with contract files
* Use semantic, predictable naming
* Avoid breaking changes unless explicitly approved
* Prefer minimal diffs and pattern reuse
* Provide tests and documentation for all updates

By following this protocol, agents ensure that Prism’s blueprints remain stable, expressive, scalable, and aligned across all packages — forming the structural foundation that orchestrated agents and humans will rely on.

---
