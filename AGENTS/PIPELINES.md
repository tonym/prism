# Pipelines Protocol

This document defines how agents must create, update, and maintain Prism Pipelines — the orchestrated flows that transform blueprint-defined structures into actionable logic across the Prism ecosystem.

Pipelines are the primary execution layer of the hub-and-spoke model. They consume blueprint contracts, coordinate adapters, and shape UI-ready outputs. Pipelines must remain predictable, composable, and fully aligned with the orchestrating agent’s guidance.

---

## 🎯 Purpose of Pipelines

Pipelines provide:

- Deterministic flows built from blueprint shapes
- Domain-specific logic composed of small, testable units
- Glue between adapters, shared utilities, and UI composition
- A stable substrate for orchestrated agent reasoning
- A safe execution layer for LLM-driven or human-driven workflows

Pipelines describe **how data moves**, not business strategy or vendor logic.

---

## 📦 What Pipelines Contain

Pipelines may include:

- Input/output interfaces imported from blueprints
- Stateless transformation functions
- Composition utilities
- Decision modules derived from blueprint shapes
- Validation steps (structural, not business rules)
- Error-pattern definitions mapped to blueprint domains

Pipelines must **not** include:

- Vendor-specific API details (handled by adapters)
- UI code or rendering behavior
- Orchestrator logic or prompt structures
- Stateful caching or long-running processes
- Direct file system or network access (except via adapters)

---

## 🧭 Required Architectural Boundaries

Pipelines live exclusively in:

packages/pipelines/src/**

Pipelines may depend on:

- Blueprints
- Shared utilities
- Adapters

Pipelines must **never** depend on:

- Storefront (UI layer)
- UI Core primitives
- Other pipelines by circular reference
- External vendors (LLMs, SDKs, APIs)

All external access MUST flow through adapters.

---

## 🛠️ Code Generation Rules for Agents

### 1. File Structure

Pipeline modules follow:

packages/pipelines/src/<domain>/<name>.pipeline.ts

Optional supporting modules:

packages/pipelines/src/<domain>/utils/**
packages/pipelines/src/<domain>/steps/**

Agents may propose new folders only within the domain boundary.

---

### 2. Pipeline Function Design

Pipelines must:

- Be pure or as close to pure as possible
- Accept explicit blueprint-defined inputs
- Return explicit blueprint-defined outputs
- Delegate side effects to adapters
- Use descriptive function names (generateInvoice, hydratePageModel, etc.)

Pipelines must not:

- Mutate input data
- Maintain internal mutable state
- Depend on ambient context
- Hide logic behind implicit defaults or magic behavior

---

### 3. Pipeline Flow Composition

Preferred composition pattern:

pipelineBuilder()
  .step(validateInput)
  .step(fetchExternalData)
  .step(transformResponse)
  .step(buildBlueprintOutput)
  .done()

This ensures:

- Clear, readable flows
- Modular testability
- Deterministic composition
- Smooth integration with orchestrating agents

Agents must reuse existing flow-composition patterns where present.

---

## 🔁 Interaction With Adapters

Pipeline modules may call adapters, but adapters:

- Must be imported explicitly
- Must never be wrapped in business logic
- Must accept/return blueprint-aligned shapes
- Must encapsulate ALL vendor-specific details

Pipelines may orchestrate:

- Fan-out calls
- Retry logic (structural only)
- Aggregation of multiple adapters

But must not embed vendor semantics or vendor assumptions.

---

## 🧩 Interaction With Blueprints

Pipelines must:

- Use blueprints as the only contract source
- Never redefine shapes
- Never create local shadow types
- Validate structure (not business rules) using schemas

Every pipeline has at minimum:

- A blueprint-defined input
- A blueprint-defined output

If no blueprint exists, the agent must request human approval before proceeding.

---

## 🧪 Testing Requirements

All pipeline changes must include:

### Unit Tests
- One test per function
- Table-driven tests encouraged for pure functions

### Composition Tests
- End-to-end flow tests with adapter mocks
- Validation of structural alignment with blueprints

### Determinism Tests
- Same input → same output
- No hidden state dependencies

Tests live in:

packages/pipelines/src/**/__tests__/**

---

## 📄 Documentation Requirements

Each pipeline must include:

- A header comment explaining its purpose
- A step-by-step outline or flow diagram
- Notes for orchestrator/agents on expected use
- References to blueprint contracts
- Version history for breaking changes

Supplemental Markdown documentation may be added alongside pipeline folders when appropriate.

---

## ✔️ Agent Behavior Summary

Agents working on Pipelines must:

- Preserve full blueprint alignment
- Maintain purity and statelessness
- Defer all side effects to adapters
- Use modular flow-composition patterns
- Prefer small diffs and pattern reuse
- Provide tests and documentation for all updates
- Request human approval when required shapes or flows are unclear

By following this protocol, agents ensure that Prism Pipelines remain predictable, composable, and principled — forming the core execution layer powering the hub-and-spoke architecture.# Pipelines Protocol
