# @prism/shared

`@prism/shared` contains foundational utilities, common types, helpers, and low-level building blocks used across the Prism workspace.

The shared domain provides foundational infrastructure primitives reused by other Prism domains.

It is intentionally lightweight, stable, and dependency-minimal.

---

## 🎯 Purpose

The shared domain exists to centralize reusable logic that is **not** domain-specific, **not** pipeline-specific, and **not** tied to any external service.

It provides:

### **1. Utility functions**
Small pieces of generic logic reused across domains, such as:

- safe JSON helpers
- object/array manipulation
- functional utilities
- type guards
- string and text helpers

These are used broadly across adapters, pipelines, CLI tooling, and evals.

---

### **2. Common TypeScript types**
Strong typing is core to Prism’s safety model.

Shared provides:

- generic utility types
- error types
- result wrappers
- discriminated unions
- async helpers
- common interface patterns

These form the baseline for consistent TypeScript structure throughout the codebase.

---

### **3. Cross-domain helpers**
Anything used by multiple domains but not specific to any one of them lives here.

Examples include:

- environment/config helpers
- stable timestamp or UUID helpers
- small pure functions
- formatting utilities

Keeping these centralized keeps duplication low and consistency high.

---

### **4. Zero external dependencies**
This domain intentionally does **not** wrap third-party APIs or SDKs.
That is the responsibility of `@prism/adapters`.

Shared remains clean and deterministic.

---

## 🧠 Design Principles

### **Minimal**
Only add things truly reused across domains.

### **Stable**
Changes here affect the whole workspace — consistency is key.

### **Pure**
Shared functions should avoid side effects and external dependencies.

### **Compositional**
Primitives should compose cleanly rather than attempt to be frameworks.

---

## 🔮 Future Directions

Possible expansions include:

- richer functional utility helpers
- consistent error taxonomy shared across the workspace
- reusable retry/backoff primitives (pure, adapter-agnostic)
- lightweight structured logging helpers
- schema utilities compatible with blueprints

---

## Summary

`@prism/shared` is the foundation layer of Prism.

It provides:

- reusable utilities
- common types
- pure helpers
- stable, dependency-free primitives

Every other domain in the monorepo can rely on `shared` without pulling in complexity.
