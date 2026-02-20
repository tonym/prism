# Adapters Protocol

This document defines how agents must interact with Prism’s **Adapters** layer — the system responsible for all external API communication, vendor SDK usage, authentication flows, and side-effect–bearing operations.

Adapters act as the strict boundary between Prism’s pure, composable pipeline logic and the outside world.

Adapters MUST remain predictable, consistent, and blueprint-aligned.

---

## 🎯 Purpose of Adapters

Adapters provide the only legal location for:

- Network requests  
- Database operations  
- Vendor SDK calls  
- OAuth or API authentication flows  
- Data translation into blueprint-defined shapes  
- Logging of external interactions  
- Error normalization for pipelines

Adapters DO NOT:

- Implement business logic  
- Transform data outside blueprint schema rules  
- Introduce new structural types  
- Perform computation that belongs in pipelines  
- Depend on Storefront or UI Core  

Their job is strictly **I/O and translation**, nothing else.

---

## 🛑 Authority of Adapters

Adapters have **no decision-making authority**.

They do not:
- choose strategies,
- select fallbacks,
- retry autonomously,
- suppress or reinterpret errors,
- or alter behavior based on context.

Adapters either:
- return blueprint-aligned data, or
- fail loudly and explicitly.

All decisions about retries, fallbacks, degradation, or escalation belong to pipelines and orchestrators.

---

## 🧭 What Agents Can Modify

Agents may:

- Add new vendor integrations  
- Extend adapter capabilities behind blueprint-defined contracts  
- Implement new authentication flows (with human approval)  
- Add translation helpers and error mappers  
- Add deterministic mocks for testing  

Agents must not:

- Create new local types duplicating blueprint shapes  
- Introduce hidden global state  
- Add retry logic without explicit instruction  
- Allow vendor logic to leak into pipelines  
- Modify unrelated adapters  

---

## 📐 Required Architectural Boundaries

Adapters must follow these invariants:

### 1. **Vendor Isolation**
Each adapter lives inside:

```
domains/adapters/src/<vendor>/<feature>.adapter.ts
```

No cross-vendor coupling is allowed.

### 2. **Blueprint Alignment**
All input/output contracts must trace directly to a blueprint file.  
If no blueprint exists, the agent MUST request human approval.

### 3. **Stateless Operation**
Adapters must remain stateless.  
State (tokens, keys, cached values) must be passed in as arguments or obtained from environment/config providers.

### 4. **Error Normalization**
All external errors must be mapped to predictable Prism-level failures (e.g., `ExternalServiceError`, `AuthFailure`, `RateLimitExceeded`).

### 5. **Side-Effects Only in Adapters**
Pipelines must perform no external operations.  
Adapters own:

- fetch calls  
- SQL queries  
- SDK calls  
- Storage lookups  
- Token refresh operations

Adapters must remain mechanically simple.

If adapter code begins to resemble planning, heuristics, scoring, or conditional behavior beyond request/response translation, it is mislocated and must be moved into pipelines or orchestration logic.

---

## 🛠️ Code Generation Rules for Agents

When generating adapter files, agents must:

- Follow file path conventions exactly  
- Use existing adapter patterns before introducing new ones  
- Implement a clear, minimal surface area for each vendor  
- Keep all functions pure except for their I/O role  
- Normalize vendor-specific quirks into blueprint-shaped data  
- Provide deterministic mocks in `__mocks__/` folders  

Example adapter layout:

```
domains/adapters/src/<vendor>/
  auth.adapter.ts
  content.adapter.ts
  analytics.adapter.ts
  __mocks__/
    auth.mock.ts
    content.mock.ts
```

---

## 🔐 Authentication Rules

When handling authentication:

- Never embed credentials directly in code  
- Use environment variables or secure config providers  
- Perform token refreshes only in isolated helper functions  
- Document refresh flows clearly in file headers  
- Never bypass vendor-provided OAuth/Key mechanisms unless approved  

If authentication logic becomes complex, propose a standalone `auth.adapter.ts`.

---

## ⚠️ Error Handling Rules

Adapters may normalize errors only to:
- map vendor-specific errors into blueprint-defined error shapes,
- preserve original error information,
- ensure deterministic failure modes.

Adapters must not:
- swallow errors,
- retry automatically,
- return partial or fabricated data,
- or downgrade failures into warnings.

Any non-successful adapter call is treated as a failure by default.

---

## 🧪 Testing Requirements

All adapters must include:

### Unit Tests
- One test per function  
- Mocks for all external I/O  
- Verification of error-normalization behavior  

### Integration Stubs
- Optional lightweight test adapters to mimic vendor responses  
- Zero reliance on live network access  

### Determinism Tests
- Same vendor responses → same normalized output  

Tests live in:

```
domains/adapters/src/**/__tests__/**
```

Mocks live in:

```
domains/adapters/src/**/__mocks__/**
```

---

## 📄 Documentation Requirements

Each adapter file MUST include:

- A header explaining purpose  
- Blueprint contract references (input/output)  
- Expected vendor behavior  
- Error-mapping logic  
- Auth flow notes (if applicable)  
- Version history when behavior changes  

Optionally, an adjacent Markdown file may describe complex vendor quirks.

---

## 🔗 Interaction With Other Domains

### Pipelines
Consume adapters as their only I/O boundary.

### Blueprints
Provide the structural contract for all adapter input/output.

### Shared
Offer helper utilities (e.g., safe parsing, logging, retry wrappers).

Adapters must not depend on:

- UI Core  
- Storefront  
- Other adapters  

---

## ✔️ Agent Behavior Summary

Agents working with Adapters must:

- Preserve vendor isolation  
- Maintain strict blueprint alignment  
- Normalize vendor behavior into predictable shapes  
- Avoid hidden state or side-effects outside adapter boundaries  
- Request human approval when vendor rules are ambiguous  
- Provide full tests and documentation  

By following these rules, agents ensure that Prism’s Adapters remain stable, deterministic, and interoperable — forming a reliable substrate for all orchestrated flows in the system.
