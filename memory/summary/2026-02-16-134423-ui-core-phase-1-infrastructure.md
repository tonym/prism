# UI Core Phase 1 Infrastructure — Context Summary

## Goal

Establish deterministic, framework-neutral Phase 1 infrastructure in `packages/ui-core` for Prism theme contracts and token-to-CSS resolution, without implementing any UI components.

## Outcome

`@prism/ui-core` now exposes a typed, deterministic theming foundation:

- Strict theme interfaces for color roles, constrained typography variants, shape, and elevation.
- Static Prism-native tokens with `coreTheme`, `defaultTheme`, and `overlayTheme` layers.
- Constrained deep merge logic with explicit runtime validation for unknown keys and shape/type violations.
- Deterministic CSS variable resolution with stable ordering and `--prism-` prefix.
- Pure logic tests covering merge semantics and deterministic resolver behavior.

## Invariants (Must Remain True)

- Functions are pure and deterministic; no hidden runtime state or side effects.
- No UI components, DOM/Web Component APIs, Angular code, or orchestration logic are included.
- Theme overlays may override existing values only; structure cannot be extended or deleted.
- CSS variable output remains flat, stable in order, and namespaced with `--prism-`.

## Key Decisions

- Use a single Prism-native token source file: `packages/ui-core/src/prism-tokens.ts`.
- Implement `mergeTheme(coreTheme, defaultTheme, overlayTheme)` in `packages/ui-core/src/theme/merge-theme.ts` with deep constrained merge + fail-fast validation.
- Keep Material 3-aligned semantic vocabulary for flat color roles and constrained typography variants (`display/headline/title/body/label` x `large/medium/small`), while preserving Prism-native packaging and naming.
- Include optional flat `shape` and `elevation` scales in the Phase 1 contract to avoid future structural churn.
- Keep public API minimal and explicit through `packages/ui-core/src/index.ts`.

## System Constraints

- All implementation work is scoped to `packages/ui-core/`.
- No dependencies on Angular, Material Web libraries, PromptUI, Stably, orchestration systems, or DOM APIs.
- No runtime theme switching/orchestration mechanisms.
- No dynamic color generation, tone computation, StyleDictionary integration, or Figma integration in this phase.

## Failure Modes (Now Explicit)

- `mergeTheme` throws on unknown keys at any nested depth.
- `mergeTheme` throws when required keys are missing from `coreTheme`.
- `mergeTheme` throws on type mismatches (object vs primitive, primitive type mismatch, undefined override values).
- `resolveCssVariables` throws if it encounters unsupported runtime value types while flattening.

## What Is Explicitly Out of Scope

- UI primitive/component implementation.
- Framework rendering adapters.
- Web Components or Angular integration.
- Token pipeline integrations (StyleDictionary/Figma/MCP).
- Runtime theme orchestration or stateful switching.

## Open Questions / Inputs to Next Phase

- Should additional Material 3 role variants (for example, fixed/fixed-dim roles) become part of the stable contract?
- Should `shape` and `elevation` stay mandatory at root theme level or move to optional extension modules?
- Should package publishing move from source exports to compiled `dist` outputs in a later packaging phase?
- What exact token handoff schema should be used for future token transformation tooling?

## Implementation Notes (Optional)

- Theme contract and layer modules:
  - `packages/ui-core/src/theme/types.ts`
  - `packages/ui-core/src/theme/layers.ts`
  - `packages/ui-core/src/theme/merge-theme.ts`
- CSS resolution modules:
  - `packages/ui-core/src/css/resolve-css-variables.ts`
- Token module:
  - `packages/ui-core/src/prism-tokens.ts`
- Public API:
  - `packages/ui-core/src/index.ts`
- Tests:
  - `packages/ui-core/src/theme/__tests__/merge-theme.test.ts`
  - `packages/ui-core/src/css/__tests__/resolve-css-variables.test.ts`
- Package/tooling updates:
  - `packages/ui-core/package.json`
  - `packages/ui-core/tsconfig.json`
  - `packages/ui-core/README.md`

Validation commands run:

- `pnpm --filter @prism/ui-core lint`
- `pnpm --filter @prism/ui-core build`
- `pnpm --filter @prism/ui-core test` (14 tests passing)

## End State

Phase 1 leaves `@prism/ui-core` in a stable infrastructure state: deterministic typed themes, strict constrained merge behavior, and deterministic CSS variable resolution are in place, enabling future UI and token-pipeline phases without framework coupling.
