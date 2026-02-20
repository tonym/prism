# Evals Protocol

This document defines how agents must create, maintain, and execute evaluation frameworks ("evals") inside the Prism ecosystem.  
Evals are the quality and regression backbone for Prism’s hub-and-spoke architecture.

Evals ensure that pipelines, adapters, blueprints, UI Core primitives, and Storefront behavior remain **deterministic, consistent, and aligned with the AGENTS specifications**.

---

## 🎯 Purpose of Evals

Evals provide:

- Automated regression checks for all agent-generated code  
- Deterministic validation of pipelines, adapters, UI Core, and Storefront  
- Scoring and comparison over time (baseline vs. proposed changes)  
- Guardrails preventing accidental architectural violations  
- Safety checks for orchestrated agents  
- Confidence that agent contributions meet Prism standards  

Evals are Prism’s **quality enforcement engine**, guaranteeing long-term stability even as agents automate more of the system.

---

## 🔁 Relationship to Orchestration

Evals are external to both worker and orchestrator agents.

Orchestrators may:
- invoke evals,
- receive eval results,
- replan based on eval failure.

Orchestrators may not:
- suppress eval execution,
- alter eval criteria,
- reinterpret failing results as acceptable.

Eval authority is **upstream of execution and planning**, not downstream of them.

---

## 🛑 Authority of Evals

Evals are **binding enforcement mechanisms**, not advisory signals.

When an eval fails:
- execution must stop,
- proposed changes must not proceed,
- orchestrators must halt or replan,
- workers must not attempt correction without authorization.

Eval outcomes may not be:
- overridden,
- reinterpreted,
- bypassed,
- retried indefinitely to obtain a passing result.

Evals define **whether a plan, change, or output is acceptable**, not whether it is convenient.

---

## 📦 What Evals Contain

Evals may include:

- Test harnesses for deterministic pipeline outputs  
- Schema compliance checks against blueprints  
- Adapter behavior normalization tests  
- UI Core primitive stability checks  
- Storefront flow tests using mocked pipelines  
- Scoring logic (pass/fail or graded)  
- Fixture data representing known-good scenarios  
- Regression snapshots where appropriate  

Evals must **not** include:

- Business logic  
- Vendor-specific API access  
- Storefront rendering logic beyond validation  
- Any attempt to modify system state  
- LLM-specific heuristics or prompting behavior  

Evals are **analysis**, not implementation.

---

## 🧭 Required Architectural Boundaries

All evals live inside:

domains/evals/src/**

Subdirectories should follow domain groups:

domains/evals/src/blueprints/**  
domains/evals/src/pipelines/**  
domains/evals/src/adapters/**  
domains/evals/src/ui-core/**  
domains/evals/src/storefront/**

Evals may depend on:

- Blueprints  
- Pipelines (mocked adapters only)  
- UI Core primitives  
- Storefront components (with mocks)  
- Shared utilities  

Evals must **never** depend on:

- Adapters making real network calls  
- Vendor SDKs  
- Global state  
- Orchestrator agent logic  

All external I/O must be mocked.

---

## 🛠️ Eval Generation Rules for Agents

When creating or modifying evals, agents must follow:

### 1. Determinism First
Evals must produce the **same output every time**, regardless of environment.

### 2. No External I/O
All API calls, adapters, and SDKs must be mocked or stubbed.

### 3. Pure Scoring Logic
Scoring must be:

- Simple  
- Interpretable  
- Based on blueprint or structural correctness  

Examples:

- “Does the pipeline produce the expected blueprint shape?”  
- “Does the adapter normalize vendor responses correctly?”  
- “Does the UI Core primitive output the same DOM tree?”  

### 4. Minimal, Isolated Fixtures
Fixture data must be:

- Local  
- Lightweight  
- Blueprint-aligned  

Fixtures belong in:

domains/evals/src/<domain>/fixtures/**

### 5. Explicit Domain Segmentation
Each domain has its own eval type:

- **Blueprint Evals** → shape, schema alignment  
- **Pipeline Evals** → flow correctness, determinism  
- **Adapter Evals** → normalization + error mapping  
- **UI Core Evals** → snapshot stability + semantic output  
- **Storefront Evals** → flow + route stability  

---

## 📐 Blueprint Evals

Blueprint evals MUST validate:

- Contract ↔ schema alignment  
- Required fields  
- Optional fields  
- Union/tag consistency  
- Deterministic expansion of derived types  

Blueprint evals must never validate UI or business rules.

---

## 🔁 Pipeline Evals

Pipeline evals MUST validate:

- Deterministic outputs for known inputs  
- Structural compliance with blueprint schemas  
- Flow composition correctness  
- Error propagation behavior  
- Domain-specific mapping logic  

Pipeline evals MUST mock adapters.

---

## 🔌 Adapter Evals

Adapter evals MUST:

- Mock vendor responses  
- Test normalization logic  
- Test error mapping behavior  
- Validate blueprint-aligned output  
- Include negative-path tests (invalid payloads, rate limits, etc.)

Adapters must not call real networks under any circumstances.

---

## 🧱 UI Core Evals

UI Core evals MUST validate:

- Deterministic rendered structure (snapshot or semantic check)  
- Token usage (spacing, color, typography)  
- Accessibility traits (roles, ARIA attributes)  
- Prop behavior consistency  

UI Core evals must not test Storefront logic.

---

## 🖥️ Storefront Evals

Storefront evals MUST test:

- Page-level routing  
- Loading, empty, and error state behavior  
- Pipeline integration (mocked)  
- State transitions (signals)  
- DOM behavior for primary flows  

Storefront evals must be shallow: no deep DOM rendering outside core flows.

---

## 🧪 Scoring and Regression Rules

Eval outcomes are binding and may not be overridden by orchestrators or workers.

### 1. Baseline Creation
Agents create baselines whenever:

- A blueprint changes  
- A major pipeline update occurs  
- UI Core primitives evolve  
- Storefront flow changes are introduced  

### 2. Acceptable Deviations
Agents must:

- Treat any score drop as a regression  
- Provide justification for intentional breaking changes  
- Ask for human approval before committing deviations  

### 3. Test Stability
Evals must run identically on:

- Local machines  
- Remote CI  
- Agent-orchestrated environments  

No flaky or random tests are allowed.

---

## ⛔ Failure Conditions

If an eval cannot be executed due to:
- missing fixtures,
- undefined criteria,
- incompatible schemas,
- or insufficient context,
the system must stop. Absence of validation is treated as failure. Evals must never be skipped due to uncertainty or time pressure.

---

## 📄 Documentation Requirements

Each eval suite must include:

- A description of the domain under test  
- How to run the eval locally  
- How to interpret pass/fail outcomes  
- Example fixtures  
- Version history if scoring logic changes  

Optional Markdown files may exist adjacent to complex suites.

---

## ✔️ Agent Behavior Summary

Agents working with Evals must:

- Prioritize determinism and reproducibility  
- Mock all external I/O  
- Align tests strictly with blueprint structures  
- Validate behavior, not implementation details  
- Treat regressions as critical failures  
- Request human approval for breaking changes  
- Provide clear documentation and fixtures  

By following this protocol, agents ensure that Prism remains predictable, stable, and safe — enabling humans and orchestrators to trust automated contributions confidently.
