# UI Core Protocol

This document defines how agents must interact with Prism's UI Core domain at `domains/ui-core/`.
UI Core is the deterministic primitive layer for Prism: theme tokens, component blueprints, generated Web Component artifacts, and distribution surfaces for downstream consumers.

UI Core is not an app surface and must not take dependencies on Storefront or orchestration code.

---

## Purpose of UI Core

UI Core provides:

- Theme token and layer contracts (`prism-tokens`, theme types, `mergeTheme`, CSS variable resolution)
- Blueprint contracts for supported component primitives (`button`, `icon-button`, `typography`, `surface`)
- Deterministic generation of `prism-*` Web Component artifacts from blueprints
- Artifact/status reporting used to verify distribution completeness
- MCP distribution tools that serve ui-core artifacts (components, theme, fonts, blueprints)
- Local Storybook workbench for maintainers to inspect generated artifacts

Agents must treat blueprints plus deterministic generation as the canonical source of UI component truth.

---

## Allowed and Disallowed Changes

Agents may:

- Update or extend blueprint contracts and template generation logic
- Update theme/token structures when explicitly requested and contract-aligned
- Modify MCP/status tooling that exposes ui-core artifacts
- Improve docs and examples that describe current ui-core behavior
- Add or update deterministic tests in existing test locations

Agents must not:

- Add UI Core dependencies on Storefront, orchestration, adapters, or other non-public cross-domain internals
- Hand-edit generated artifacts in `src/generated/**` as a source-of-truth change
- Introduce nondeterministic behavior in generation, hashing, serialization, or artifact responses
- Introduce framework-bound APIs that break the package's framework-agnostic Web Component contract
- Add runtime dependencies without explicit approval

---

## Required Architectural Boundaries

1. Blueprint-first:
   Component shape and behavior contracts are defined in `src/blueprint/**` and generation consumes those contracts.

2. Deterministic generation:
   Generator output must be stable for identical blueprint and token input.

3. Distribution integrity:
   MCP and status modules expose facts about package artifacts and versions; they must remain structured and deterministic.

4. Domain isolation:
   UI Core may be consumed by other domains, but UI Core does not import from product/application domains.

---

## Canonical UI Core Paths

- Public exports: `domains/ui-core/src/index.ts`
- Blueprint contracts: `domains/ui-core/src/blueprint/**`
- Generator logic: `domains/ui-core/src/generator/**`
- Theme and merge logic: `domains/ui-core/src/theme/**`
- CSS variable resolution: `domains/ui-core/src/css/**`
- Determinism utilities: `domains/ui-core/src/determinism/**`
- Status reporting: `domains/ui-core/src/status/**`
- MCP server/tools: `domains/ui-core/src/mcp/**`
- Generated artifacts: `domains/ui-core/src/generated/**`
- Storybook stories/workbench: `domains/ui-core/src/stories/**`

Agents should follow existing placement patterns and keep diffs minimal.

---

## Testing Rules (UI Core Specific)

Follow global testing policy in `AGENTS/ROOT.md` and `AGENTS/META.yml`.
For ui-core changes, this means:

- Add deterministic unit tests for modified behavior
- Cover happy paths, error paths, guard clauses, and edge cases
- Do not introduce snapshot tests
- Keep tests hermetic (no external services, no nondeterministic timers)

Current ui-core tests are colocated under module-level `__tests__` folders within `domains/ui-core/src/**`.

---

## Documentation Expectations

When behavior changes, update relevant ui-core documentation (for example `domains/ui-core/README.md`) so it remains consistent with:

- Public exports and package surfaces
- Blueprint and generation flow
- MCP distribution contract
- Consumer customization model (CSS variable overrides)

---

## Cross-Domain Interaction

- Blueprints domain defines architectural contracts that ui-core must honor.
- Storefront and other consumers consume ui-core outputs; ui-core does not depend on them.
- UI-producing pipelines should target blueprint-compatible primitives rather than bypassing ui-core contracts.

---

## Agent Summary

Agents working in UI Core must:

1. Keep blueprint and generator behavior aligned
2. Preserve deterministic output and status signals
3. Maintain domain isolation and import boundaries
4. Avoid editing generated artifacts as hand-authored source
5. Add meaningful tests without snapshot usage
6. Update docs when public behavior changes
7. Prefer minimal, contract-aligned diffs
