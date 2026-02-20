# Orchestration Protocol

This document defines how agents must create, update, and maintain Prism’s Orchestration domain — the validated execution flows that transform blueprint-defined structures into actionable logic across the Prism ecosystem.

The Orchestration domain is the primary execution layer of the hub-and-spoke model. It contains orchestration modules (`*.pipeline.ts`) that consume blueprint contracts, coordinate adapters, and shape UI-ready outputs. Orchestration flows must remain predictable, composable, and fully aligned with the orchestrating agent’s guidance.

---

## 🎯 Purpose of the Orchestration Domain

The orchestration domain provides orchestration flows with:

- Deterministic flows built from blueprint shapes
- Domain-specific logic composed of small, testable units
- Glue between adapters, shared utilities, and UI composition
- A stable substrate for executing plans produced by governed orchestrators
- A safe execution layer for LLM-driven or human-driven workflows

Orchestration flows describe **how data moves**, not business strategy or vendor logic.

---

## 📦 What the Orchestration Domain Contains

Orchestration modules may include:

- Input/output interfaces imported from blueprints
- Stateless transformation functions
- Composition utilities
- Decision modules derived from blueprint shapes
- Validation steps (structural, not business rules)
- Error-pattern definitions mapped to blueprint domains

Orchestration modules must **not** include:

- Vendor-specific API details (handled by adapters)
- UI code or rendering behavior
- Orchestrator logic or prompt structures
- Stateful caching or long-running processes
- Direct file system or network access (except via adapters)

---

## 🧭 Required Architectural Boundaries

Orchestration code lives exclusively in:

domains/orchestration/src/**

Orchestration modules may depend on:

- Blueprints
- Shared utilities
- Adapters

Orchestration modules must **never** depend on:

- Storefront (UI layer)
- UI Core primitives
- Other pipelines by circular reference
- External vendors (LLMs, SDKs, APIs)

All external access MUST flow through adapters.

---

## 🛠️ Code Generation Rules for Agents

### 1. File Structure

Orchestration modules follow:

domains/orchestration/src/<domain>/<name>.pipeline.ts

Optional supporting modules:

domains/orchestration/src/<domain>/utils/**
domains/orchestration/src/<domain>/steps/**

Agents may propose new folders only within the domain boundary.

---

### 2. Orchestration Flow Function Design

Orchestration flow functions must:

- Be pure or as close to pure as possible
- Accept explicit blueprint-defined inputs
- Return explicit blueprint-defined outputs
- Delegate side effects to adapters
- Use descriptive function names (generateInvoice, hydratePageModel, etc.)

Orchestration flow functions must not:

- Mutate input data
- Maintain internal mutable state
- Depend on ambient context
- Hide logic behind implicit defaults or magic behavior

---

### 3. Orchestration Flow Composition

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

Orchestration modules may call adapters, but adapters:

- Must be imported explicitly
- Must never be wrapped in business logic
- Must accept/return blueprint-aligned shapes
- Must encapsulate ALL vendor-specific details

Orchestration flows may orchestrate:

- Fan-out calls
- Retry logic (structural only)
- Aggregation of multiple adapters

But must not embed vendor semantics or vendor assumptions.

---

## 🧩 Interaction With Blueprints

Orchestration flows must:

- Use blueprints as the only contract source
- Never redefine shapes
- Never create local shadow types
- Validate structure (not business rules) using schemas

Every orchestration flow has at minimum:

- A blueprint-defined input
- A blueprint-defined output

If no blueprint exists, the agent must request human approval before proceeding.

---

## 🧪 Testing Requirements

All orchestration-flow changes must include:

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

domains/orchestration/src/**/__tests__/**

---

## 📄 Documentation Requirements

Each orchestration module must include:

- A header comment explaining its purpose
- A step-by-step outline or flow diagram
- Notes for orchestrator/agents on expected use
- References to blueprint contracts
- Version history for breaking changes

Supplemental Markdown documentation may be added alongside orchestration folders when appropriate.

---

## Authority Boundary

Orchestration modules do not decide what to execute.

They execute plans produced by governed orchestrators in accordance with blueprint contracts and substrate validation rules.

Planning, decomposition, retries, escalation, and eval coordination are governed exclusively by `/AGENTS/ORCHESTRATOR.md`.

---

## ✔️ Agent Behavior Summary

Agents working on Orchestration must:

- Preserve full blueprint alignment
- Maintain purity and statelessness
- Defer all side effects to adapters
- Use modular flow-composition patterns
- Prefer small diffs and pattern reuse
- Provide tests and documentation for all updates
- Request human approval when required shapes or flows are unclear

By following this protocol, agents ensure that Prism orchestration flows remain predictable, composable, and principled — forming the core execution layer powering the hub-and-spoke architecture.
