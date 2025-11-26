# UI Core Protocol

This document defines how agents must interact with **Prism’s UI Core** layer — the system of low-level UI primitives, tokens, and rendering utilities shared across the entire Prism ecosystem.

UI Core is *not* a product UI and is *not* a framework. It is a stable primitive layer designed so that humans and agents can build consistent, deterministic UI from shared contracts.

---

## 🎯 Purpose of UI Core

UI Core provides:

- **Design tokens** (spacing, color, typography, motion)
- **Primitive components** (`Button`, `Panel`, `Text`, `Card`, `Tabs`, etc.)
- **Interaction utilities** (focus traps, keyboard helpers, semantics)
- **Blueprint → UI mappers** supporting agent‑generated UI
- **Rendering adapters** shared with Storefront

Agents must treat UI Core as the *canonical source of truth* for all UI primitives.

---

## 🧭 What Agents Can Modify

Agents **may**:

- Add new primitives that follow established patterns
- Update design tokens when explicitly requested
- Extend interactions in a backward‑compatible manner
- Add documentation and examples
- Contribute blueprint-aligned UI renderers

Agents **must not**:

- Introduce framework-specific components (React, Vue, Angular)
- Add styling logic directly to primitives (use tokens)
- Break deterministic behavior or introduce side-effects
- Add runtime dependencies without approval

---

## 📐 Required Architectural Boundaries

1. **UI Core never depends on Storefront.**
   Storefront may depend on UI Core, but not the other way around.

2. **Primitives must remain headless-first.**
   Styling is optional and must be expressed only through tokens.

3. **Blueprint alignment is mandatory.**
   New UI primitives must correspond to valid blueprint shapes.

4. **Deterministic rendering.**
   Every component must behave identically regardless of platform.

---

## 🛠️ Code Generation Rules for Agents

When generating or editing UI Core source files:

- All component code resides in
  `packages/ui-core/src/**`
- Style tokens live in
  `packages/ui-core/src/tokens/**`
- Behavioral utilities live in
  `packages/ui-core/src/utils/**`
- Blueprint mappers belong in
  `packages/ui-core/src/blueprint/**`

Agents must check for existing patterns before creating new files.
If no pattern exists, propose one and wait for human approval.

---

## 🧪 Testing Requirements

All changes must include:

- Unit tests for behavior
- Snapshot tests for deterministic output
- Token‑driven style checks
- Validation against existing blueprint contracts

Tests live at:
`packages/ui-core/src/**/__tests__/**`

---

## 📄 Documentation Requirements

Every contributed primitive must include:

- A README with usage examples
- A blueprint mapping example (if applicable)
- An explanation of supported props
- Notes on accessibility expectations

All docs live in the same folder as the component.

---

## 🧩 Interaction With Other Packages

- **Blueprints:** define the allowed shapes agents use to construct UI.
- **Storefront:** consumes UI Core to render actual product surfaces.
- **Pipelines/Agents:** may output UI blueprints, which map into UI Core.

UI Core is *never* allowed to depend on these packages.

---

## ✔️ Agent Behavior Summary

Agents working on UI Core must:

1. Preserve architectural boundaries
2. Maintain blueprint alignment
3. Keep primitives deterministic
4. Use tokens for all styling
5. Provide tests and documentation
6. Avoid adding dependencies
7. Prefer minimal diffs

---

By following this protocol, agents ensure that Prism’s UI Core grows in a consistent, safe, and predictable way that supports both human and agent‑generated interfaces.
