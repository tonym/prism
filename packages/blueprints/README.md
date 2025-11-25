# @prism/blueprints

Blueprints are the **source of truth** for Prism’s internal contracts.

They define the shapes, invariants, and intent of the system in a way that is:
- type-safe
- implementation-agnostic
- generative-agent friendly

Blueprints are **never published** as a package. They exist solely to guide and constrain the rest of the workspace.

---

## What lives here

Blueprints describe, they do not execute.

Typical artifacts include:

- **Contracts**
  JSON- or TypeScript-based specifications that define:
  - props and state for UI components
  - input/output schemas for pipelines and adapters
  - allowed variants, sizes, and modes
  - accessibility and behavioral expectations

- **Style blueprints**
  Token- and class-level definitions that map design intent to implementation:
  - Tailwind utility shapes
  - variant → class mappings
  - alignment with design tokens and theming rules

- **Semantic metadata**
  Hints and annotations that help generative agents:
  - understand what a contract is *for*
  - choose appropriate patterns (e.g., control vs layout)
  - reason about constraints and safe defaults

No runtime behavior, network calls, or side effects should appear in this package.

---

## How other packages use blueprints

Blueprints are consumed by generative and build-time tooling to produce:

- **UI components** in `@prism/ui-core`
  - Contracts → Radix/Tailwind components
  - Style maps → variant/size/class wiring

- **Integration adapters** in `@prism/adapters`
  - IO schemas → normalized request/response shapes
  - Error/edge-case modeling → predictable error handling

- **Pipelines and evals**
  - Data flow shapes → pipeline composition and validation
  - Expected behaviors → test and eval scaffolding

In all cases, blueprints act as the **single source of truth**. If a contract changes here, generated artifacts in other packages should be updated to match.

---

## Design principles

Blueprints follow a few key principles:

1. **Deterministic inputs and outputs**
   Every contract must clearly define:
   - what goes in
   - what comes out
   - what states and variants are allowed

2. **No hidden behavior**
   Blueprints describe structures and intent only.
   They do not:
   - fetch data
   - call APIs
   - manage side effects

3. **Human- and agent-readable**
   The format should be:
   - easy for humans to read and review in PRs
   - structured enough for agents to parse and generate from reliably

4. **Stable, not static**
   Contracts evolve, but changes are deliberate:
   - breaking changes are explicit
   - migration is part of the design conversation
   - generated artifacts are treated as downstream of this package

---

## When to add or update a blueprint

Add or modify a blueprint when you:

- Introduce a **new component**, adapter, or pipeline shape
- Change a **public contract** (props, IO, variants)
- Need to capture **design intent** that should be enforced in generated code
- Want agents to generate or refactor code with a clear, constrained target

If you are editing runtime code in another package and discover that the contract is unclear, incomplete, or duplicated, the fix usually belongs here first.

---

## Summary

`@prism/blueprints` is the **contract layer** of Prism.

- It is private and never published.
- It defines *what the system is allowed to be*.
- Generative agents and build tooling use it to produce everything else.

If Prism were a building, this package would be the architectural drawings — not the concrete, wiring, or furniture, but the plans that make everything coherent.
