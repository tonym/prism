# Sanity Protocol

This document defines how agents must interact with Prism’s **Sanity domain** — the system responsible for content schemas, Studio configuration, GROQ queries, and typed content integration.

Sanity provides structured content models and an editor experience, but it is **not** a blueprint system, not a Storefront UI layer, and not an adapter.  
It is a **content management layer** that must integrate cleanly into Prism’s architecture without driving business logic.

---

## 🎯 Purpose of the Sanity Domain

The Sanity domain provides:

- Structured content schemas (`schema.ts`, `object.ts`, `document.ts`)
- A fully configured Sanity Studio (local or remote)
- Domain-specific content models used by Storefront features
- GROQ queries and content fetch utilities
- Preview components and Studio desk structure
- Internal helpers for validating schema consistency

Sanity is the system of **content definition and content editing**, but not a system of application architecture.

---

## 📂 What the Sanity Domain Contains

Sanity may include:

- `src/schemas/**` — document, object, reference, and field schema definitions
- `src/queries/**` — GROQ queries returning typed results
- `src/plugins/**` — Studio plugins or extensions
- `src/structure/**` — custom desk structure definitions
- `studio/**` — the Sanity Studio application
- Codegen for TypeScript types when appropriate
- Optional custom input components (UI Core wrappers only)

Sanity must **not** include:

- Business logic (pipelines own this)
- API clients or external integrations beyond the official Sanity client
- Blueprint definitions
- UI Core primitives
- Storefront feature UI
- Application logic or effects unrelated to content

---

## 🧭 Required Architectural Boundaries

### Directory Location

Sanity code lives in:

```
domains/sanity/**
```

With recommended structure:

```
domains/sanity/
  src/
    schemas/
    queries/
    plugins/
    structure/
  studio/
  package.json
  README.md
```

### Allowed Dependencies

Sanity may depend on:

- Official Sanity SDK + Studio tooling
- Shared utilities (logging, safe parsing)
- Blueprint types ONLY for mapping content → domain models
- UI Core tokens for custom inputs (if needed)

Sanity must **never depend** on:

- Storefront
- Pipelines
- Adapters
- Vendor SDKs
- Node-only, non-Sanity side-effect systems

---

## 🧱 Schema Rules for Agents

Schema files define content structures for Studio and must follow:

### 1. File Structure

Document schemas:

```
src/schemas/documents/<name>.schema.ts
```

Object schemas:

```
src/schemas/objects/<name>.schema.ts
```

Field definitions:

```
src/schemas/fields/<name>.field.ts
```

### 2. Schema Requirements

Agents must:

- Use Sanity’s schema creator (`defineType`, `defineField`)
- Include titles, descriptions, and helpful names
- Keep schemas flat unless hierarchy is needed
- Use references for relationships  
- Avoid overuse of deeply nested object types
- Prefer `object` + multiple fields over large documents  
- Include preview configuration for Studio UI

### 3. Blueprint Alignment

Sanity schemas:

- May reflect blueprint structures  
- Must never override blueprint structures  
- Must not define system-wide domain types  
- Must only represent **editable content**, not application logic

Blueprint → informs Sanity  
Sanity → never informs Blueprints

---

## 🔁 Interaction With Other Domains

### Storefront

Storefront consumes Sanity content using:

- Queries from `src/queries/`
- Mapped types (generated or manually aligned)
- Safe parsing utilities

Storefront must not modify Sanity schemas.

### Pipelines

Pipelines may pre-process or merge Sanity content with data from adapters.  
Pipelines do not call Sanity directly; Storefront does via helpers.

### Adapters

Completely isolated from Sanity.

### UI Core

Custom Studio components may use UI Core tokens or primitives, but such usage must be rare and documented.

### Blueprints

Blueprints define *application* structures; Sanity defines *content* structures.

---

## 🔍 GROQ Query Rules for Agents

Queries live in:

```
src/queries/<domain>/<name>.groq.ts
```

Rules:

- Queries must specify exact fields, never `*`
- Queries must sort deterministically
- Queries must include type-specific filtering (`_type == "myDoc"`)
- Queries must return stable shapes aligned with blueprint models
- Agents may generate GROQ helpers for filtering, pagination, and composition

Queries must not include:

- Business rules  
- Security logic  
- Computed fields requiring application-side processing  

---

## 🧪 Testing Requirements

Sanity domain tests must validate:

### 1. Schema Validity
- Schemas compile without warnings
- Required fields exist
- Reference integrity is maintained
- Preview configuration is functional

### 2. Query Validity
- GROQ queries parse correctly  
- Query shapes match TypeScript types  
- Mock content fixtures validate field presence  

### 3. Mapping Tests
- Blueprint → Sanity type alignment tests  
- Storefront-facing model transformations  

Tests live in:

```
domains/sanity/src/**/__tests__/**
```

Mocks:

```
domains/sanity/src/**/__fixtures__/**
```

Sanity tests must not:

- Hit real Sanity APIs  
- Use actual network I/O  
- Depend on Studio runtime behavior  

---

## 📄 Documentation Requirements

Each schema or major content model must include:

- Purpose of the schema  
- Blueprint types it aligns with  
- Notes for Storefront or Pipelines  
- Example queries  
- Preview behavior in Studio  
- Version history when breaking changes occur  

Documentation may be:

- Inline in schema files  
- In adjacent Markdown files  

---

## ✔️ Agent Behavior Summary

Agents working with Sanity must:

- Keep content schemas clean, simple, and human-friendly  
- Maintain strict boundaries between content and system logic  
- Follow blueprint-informed structures without duplicating system types  
- Use GROQ responsibly (explicit fields, deterministic shapes)  
- Document every schema and major query  
- Provide meaningful previews for humans using the Studio  
- Mock all external I/O in tests  
- Ask for human approval when introducing breaking schema changes  

By following this protocol, agents ensure that Sanity acts as a clean, structured, predictable content system — perfectly aligned with the Prism architectural model, but never controlling or polluting it.

---
