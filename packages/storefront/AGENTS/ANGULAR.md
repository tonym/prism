# Angular Package Agent Instructions  
Extends: `AGENTS/ROOT.md` (global governance)  
Scope: `packages/storefront/**`

These instructions define **Angular-specific constraints**, **best practices**, and **allowed behaviors** for agents working inside the `storefront` package. They do **not** override root protocols; they only specialize them for Angular v21+.

---

## Purpose of This Package  
The `storefront` package implements the Angular application layer of the Prism ecosystem.  
Agents working here must:

- Only edit files inside `packages/storefront/**`
- Follow Angular v21+ best practices
- Maintain deterministic, maintainable, and accessible code
- Respect Prism package boundaries: you may import public exports from other packages (for example ui-core, future ui-* packages, shared, or other Prism packages), but must not edit their files or import from their internal/unstable paths

---

# TypeScript Best Practices (Angular Context)
- Use strict type checking.
- Prefer type inference when the type is obvious.
- Avoid `any`; use `unknown` when type is uncertain.
- Keep function signatures explicit when part of public APIs.
- Use readonly patterns where appropriate.

---

### Public API Surface (Angular Components)
- Export **only** the component class.
- Do not export separate “props,” “inputs,” or “outputs” interfaces; Angular’s input/output declarations define the component’s public API.
- For complex types, use internal `type` aliases for clarity, but do not export them.
- Do not expose component-local state, signals, computed values, helpers, or internal utilities.
- Consumers rely on Angular’s template type checking (TTC) and the component class surface for type safety.

---

# Angular Best Practices  
These are framework-level rules and **must** be followed.

### Imports & boundaries  
- Only import Angular APIs or public exports from other Prism packages.
- Never import from another package’s internal file paths.
- Never reference Node-only APIs inside Angular components/services.

---

### Architecture

- Always use **standalone components** (no NgModules).
- **Do not** set `standalone: true` manually; Angular v20+ sets this automatically.
- Use **signals** for local and shared state.
- Organize the application into **feature boundaries** that align with lazy-loaded routes.
- Implement **lazy loading** for all feature routes using `loadComponent` or `loadChildren`.
- Avoid `@HostBinding` and `@HostListener`; use the `host` object inside the component or directive decorator.
- Use `NgOptimizedImage` (`ngSrc`) for all static image assets:
  - Provides responsive `srcset`, lazy loading, and layout stability.
  - Not suitable for inline base64 or dynamically generated data URLs.
  - Always specify explicit `width` and `height` attributes.
- Keep components small, declarative, and focused on UI logic; move business logic into services or signals.

---
  
# Routing

- Use the **functional router API** (`provideRouter`, `Routes`, route functions).
- All feature routes must be **lazy loaded** using `loadComponent` or `loadChildren`.
- Route-level providers must use **functional providers** (`provide...`) instead of classes.
- Keep route declarations co-located with their features.
- Use strongly typed navigation APIs:
  ```ts
  router.navigate(['/product', productId]);
  ```
- Avoid wildcard or catch-all routes except at the application root.
- Keep guards pure and functional; use signals or services for shared state.
- Route components should not contain business logic; place logic in services or state containers.
- Prefer top-level layout components instead of deeply nested outlets.

---

# Accessibility Requirements  
Angular enforces accessibility as a first-class concern.

**All output must:**
- Pass **AXE** checks.
- Meet **WCAG AA** requirements.
- Include proper ARIA attributes where needed.
- Maintain correct focus management.
- Ensure text and UI contrast meet minimum ratios.

Accessibility issues are considered **violations** of Prism’s agent protocols.

---

# Components  
- Each component must follow the **single responsibility** principle.
- Use `input()` and `output()` functions instead of decorators.
- Use `computed()` for derived state.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in every component.
- Prefer **inline templates** for small components only.
- Prefer **Reactive Forms** over template-driven forms.
- Do **not** use `ngClass`; use `[class]` bindings.
- Do **not** use `ngStyle`; use `[style]` bindings.
- When templates or styles are external, paths must be **relative** to the component TS file.
- Keep component files small, predictable, and tightly focused.

---

# State Management  
- Use **signals** for component state.
- Use `computed()` for derived values.
- State transformations must be **pure and deterministic**.
- Do **not** use `mutate()`; use `set()` or `update()`.
- Store transient UI state locally in components; lift state only when required.
- Angular does not own application state; state is a system-level model provided by upstream pipelines and external orchestrators.
- 
---

# Templates  
- Keep templates simple and free of complex logic.
- Use Angular’s native control flow:  
  - `@if`  
  - `@for`  
  - `@switch`
- Use the **async pipe** to unwrap observables.
- Do **not** assume globals like `new Date()` are available.
- Do **not** write arrow functions in templates (not supported).
- Use built-in pipes and import them explicitly when used.

---

# Services  
- Follow the **single responsibility** rule.
- Provide services using `providedIn: 'root'` unless a narrower scope is prompted.
- Use the `inject()` function instead of constructor injection.
- Keep services small, stateless when possible, and free of UI concerns.

---

# Package-Level Rules  
These constraints ensure safe operation inside the Prism monorepo.

- Only edit files in `packages/storefront/**`.
- Never modify another package’s files or reference their internal paths.  
  You may import from their public API entrypoints (for example `@prism/ui-core`, future `@prism/ui-*` packages, or `@prism/shared`), but must not access `/src`, `/internal`, or other unstable file paths.- All tests must remain deterministic and follow Prism’s root test conventions.
- All code generation must adhere to the Angular best practices above.
- All output must pass TypeScript strict mode.
- All test files in `packages/storefront/**` must include complete unit test coverage for every public component, service, pipe, and utility.
- All storefront tests **must pass** and adhere to Prism’s global test conventions (strict determinism, one expect per `it()`, no snapshots, tables permitted).

---

# Out of Scope for This Agent  
- Non-Angular packages  
- Monorepo configuration outside this package  
- Build tooling configuration in the repo root  
- Persona-style writing, stylistic preferences, or example-heavy output

---

This file will evolve over time as Angular and Prism conventions evolve. Always refer to `AGENTS/ROOT.md` for global boundaries and invariants.
