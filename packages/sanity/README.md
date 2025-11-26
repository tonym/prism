# @prism/sanity

The **Sanity package** provides Prism’s content management layer.  
It defines Sanity schemas, GROQ queries, Studio configuration, and type-safe content helpers used throughout the Prism ecosystem.

Sanity offers structured, editable content for pages and features, but it does **not** define application logic, blueprints, or UI.  
It is strictly a *content* subsystem, aligned with Prism’s Hub-and-Spoke architecture.

---

## 🚀 Features

- Sanity Studio configuration (local or remote)
- Document, object, and field schemas
- Typed GROQ queries
- Schema → TypeScript alignment utilities
- Custom Studio structure and plugins
- Mock content fixtures for testing
- Stable, deterministic content retrieval patterns

---

## 📂 Directory Structure

```
packages/sanity/
  src/
    schemas/
      documents/
      objects/
      fields/
    queries/
    plugins/
    structure/
  studio/
  README.md
```

**Schemas** define editable content.  
**Queries** return typed, deterministic GROQ results.  
**Studio** provides a local editing environment.

---

## 🧭 Architectural Role

Sanity integrates with other Prism packages in a strictly limited way:

### Depends on:
- Shared utilities  
- Blueprint types (for mapping only)  

### Used by:
- Storefront (fetching content via published queries)
- Pipelines (optional content merging)

### Never depends on:
- Storefront  
- Pipelines  
- Adapters  
- UI Core primitives (except optional custom inputs)

Sanity is a *content provider*, not a logic layer.

---

## 📝 Development

### Install dependencies

```sh
pnpm install
```

### Start Sanity Studio

```sh
pnpm sanity dev
```

Studio typically runs at:

```
http://localhost:3333
```

### Build Studio

```sh
pnpm sanity build
```

Outputs are suitable for static hosting or embedding.

---

## 🧪 Testing

Sanity tests validate:

- Schema correctness
- Query shapes and field coverage
- Mapping between Sanity content and blueprint types
- Deterministic content results using fixtures

Tests live in:

```
src/**/__tests__/**
```

Fixtures:

```
src/**/__fixtures__/**
```

No test may call the live Sanity API.

---

## 🧩 Adding Schemas

Create new schemas in:

```
src/schemas/documents/
src/schemas/objects/
```

Follow the rules defined in:

```
/AGENTS/SANITY.md
```

Blueprints may *inform* Sanity schemas, but Sanity never defines domain logic.

---

## 📄 Queries

Queries live in:

```
src/queries/
```

Rules:

- Always specify fields explicitly  
- Sort deterministically  
- Return stable shapes  
- Match TypeScript types  

---

## 📘 Reference

- **Protocol:** `/AGENTS/SANITY.md`
- **Sanity Documentation:** https://www.sanity.io/docs
- **GROQ Docs:** https://www.sanity.io/docs/groq

---

Sanity provides the editable content foundation that Prism’s orchestrators, pipelines, and UI layers consume.  
By keeping schemas clean, predictable, and aligned with blueprints, Sanity stays a stable part of the Prism system.
