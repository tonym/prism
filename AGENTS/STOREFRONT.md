# Storefront Protocol

This document defines how agents must interact with Prism’s **Storefront** layer — the Angular 21 application responsible for user-facing flows, routing, page composition, and UI assembly using UI Core primitives and blueprint-aligned models.

Storefront is the **application surface**, not a design system and not a place for business logic.

---

## 🎯 Purpose of Storefront

Storefront provides:

- Angular page shells and routed features
- UI composition using UI Core primitives
- Presentation models mapped from pipeline outputs
- Local, view-specific state (signals, derived state)
- Event dispatch into pipelines or orchestrator flows
- A stable UI framework for both human and agent-driven feature development

Storefront describes **how the user experiences the system**, not **how data is processed or fetched**.

---

## 📦 What Storefront Contains

Storefront may include:

- Routed page components (`*.page.ts`)
- Feature directories (`/features/<domain>/**`)
- Standalone components composing UI Core primitives
- Presentation models (TypeScript types derived from blueprint shapes)
- Angular signals for local, ephemeral UI state
- Route configurations (`routes.ts`)
- Event handlers that trigger pipelines
- Layout containers, conditionally rendered sections, and visual logic
- Unit and integration tests for pages and flows

Storefront must **not** include:

- Pipeline logic
- Vendor or network calls (use Adapters via Pipelines)
- New primitives (UI Core owns primitives)
- Domain structures (Blueprints own structures)
- Business or orchestration logic
- Global stateful services unless explicitly approved

All cross-layer responsibilities must flow through Pipelines.

---

## 🧭 Required Architectural Boundaries

### 1. Directory and File Location

Storefront code lives exclusively in:

packages/storefront/src/**

Recommended structure:

- packages/storefront/src/app/routes.ts  
- packages/storefront/src/app/features/<feature>/<Feature>Page/  
- packages/storefront/src/app/features/<feature>/components/  
- packages/storefront/src/app/features/<feature>/services/ (UI-only, never business logic)

### 2. Allowed Dependencies

Storefront may depend on:

- UI Core (via Angular component imports)  
- Blueprints (for typed models)  
- Pipelines (for data flows and transformations)

Storefront must **never** depend on:

- Adapters  
- Node-only APIs  
- Other Storefront pages by circular reference  
- Vendor SDKs or raw HTTP calls

---

## 🧱 Page, Feature, and Component Structure Rules

### 1. Pages (Routable Components)

Storefront pages must:

- Be standalone Angular components  
- Use `@Component({ standalone: true })`  
- Represent entire screens or navigable views  
- Import UI Core primitives, not locally invented UI elements  
- Use signals for reactive local UI state  
- Map pipeline outputs into presentation-ready models  

Page naming rule:

`<Feature>Page`  
Example: `BillingPage`, `ProductListPage`

### 2. Feature Components

Feature sub-components:

- Live under: `/features/<domain>/components`  
- Must remain purely presentational when possible  
- May accept blueprint-derived models as `@Input()` signals  
- Must not fetch data or call pipelines directly (handled by page-level code)

### 3. Services in Storefront

Storefront-only services may exist only when:

- They encapsulate UI-only state  
- They orchestrate multiple presentational components  
- They do **not** contain business logic  
- They do **not** perform network operations  
- They do **not** translate blueprint types (pipelines own this)

Examples:
- debounce helpers  
- page-level filter state stored in signals  
- UI layout orchestration (expanded/collapsed state)  

### 4. Routing

Routes must be declared in:

packages/storefront/src/app/routes.ts

Rules:

- Use Angular’s modern functional routing  
- Route definitions must not embed business logic  
- Guard/Resolver responsibilities must remain minimal and UI-only  

---

## 🔁 Interaction With Other Layers

### Pipelines → Storefront

Pipelines provide:

- Blueprint-shaped data  
- Flattened models for presentation  
- Errors, loading states, result objects

Storefront must:

- Call pipelines through application-level orchestration handlers  
- Convert pipeline outputs into local signals  
- Handle loading/empty/error states deterministically  

### UI Core → Storefront

UI Core provides the primitives that Storefront composes.

Rules:

- Never create new primitives inside Storefront  
- Never hardcode design properties (use UI Core tokens)  
- Prefer stable UI Core patterns for typography, spacing, transitions  

### Blueprints → Storefront

Storefront consumes blueprint-defined types for:

- Domain representation  
- UI intent shapes  
- Display configuration structures

Blueprint-derived models must be imported, not redefined.

---

## 🛠️ Code Generation Rules for Agents

When generating Storefront code, agents must:

- Use standalone components (`standalone: true`)  
- Use Angular signals, not RxJS, for local UI state  
- Use strict types derived from blueprint models  
- Compose UI Core primitives for display  
- Keep logic declarative and template-driven  
- Avoid creating new UI primitives  
- Avoid embedding complex logic in the template (extract to component methods)

Additional rules:

- Avoid creating Angular modules unless explicitly required  
- Prefer pure functions for model mapping  
- Ask for human approval before introducing new routes or major features  

---

## 🧪 Testing Requirements

Storefront must include:

### Component Tests

- Render tests using `TestBed` with standalone imports  
- DOM structure tests  
- Input/output mapping tests  
- Conditional rendering tests  

### Flow / Page Tests

- Pipeline calls must be mocked  
- Route navigation tests must ensure determinism  
- Loading/error/empty state behavior must be verified  

### UI Stability Tests (Optional)

- Snapshot-like consistency checks  
- Accessibility role/ARIA validation  

Tests live in:

packages/storefront/src/**/__tests__/**

---

## 📄 Documentation Requirements

Each page/feature must include:

- A header explaining the page’s purpose  
- A list of blueprint types it uses  
- Which pipelines it depends on  
- Expected UI states (loading, error, empty)  
- Routing details (path, params)  
- Notes for agents producing or modifying the page  

More complex flows may include an adjacent Markdown doc.

---

## ✔️ Agent Behavior Summary

Agents modifying Storefront must:

- Follow Angular best practices (signals, standalone components, functional routing)  
- Compose UI using UI Core only  
- Conform strictly to blueprint and pipeline shapes  
- Keep logic declarative and UI-centric  
- Use signals for local state and avoid hidden global state  
- Provide adequate UI tests  
- Request human approval if a change implies new blueprints or pipeline behavior  

By following this protocol, agents ensure that Prism’s Angular Storefront layer stays maintainable, predictable, and aligned with the rest of the system — enabling rapid, high-quality UI development across features and flows.

---# Storefront Protocol
