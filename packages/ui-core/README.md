# @prism/ui-core

`@prism/ui-core` provides deterministic theme infrastructure and blueprint-driven Web Component artifacts for Prism.

Phase 2 introduces generated, theme-driven primitives while keeping deterministic behavior:

- `Button` (`prism-button`)
- `IconButton` (`prism-icon-button`)
- `Typography` (`prism-typography`)
- `Surface/Card` (`prism-surface`)

## Public API

The package exports:

- Theme types (`PrismTheme`, `ThemeOverride`, and related interfaces)
- Theme layers (`coreTheme`, `defaultTheme`, `overlayTheme`)
- `mergeTheme(coreTheme, defaultTheme, overlayTheme)` for deep constrained merge
- `resolveCssVariables(effectiveTheme)` for deterministic `--prism-` variables
- `cssVariablesToString(...)` and `resolveCssVariablesAsCss(...)` for optional CSS text output
- Prism token exports from `src/prism-tokens.ts`
- Component blueprints in `src/blueprint/components/*.blueprint.ts`
- Deterministic generator utilities in `src/generator/**`
- Generated component artifacts in `src/generated/components/**`
- Facts-only component status reporting in `src/status/**`

## Merge Rules

`mergeTheme` applies layers with strict precedence:

`coreTheme < defaultTheme < overlayTheme`

It enforces:

- deep merge semantics
- value overrides only (no structural changes)
- unknown-key rejection at runtime
- no input mutation
- deterministic output

## CSS Variable Rules

`resolveCssVariables`:

- accepts an effective `PrismTheme`
- emits a flat map of CSS variables with `--prism-` prefix
- uses deterministic ordering for stable output

Example keys:

- `--prism-color-primary`
- `--prism-typography-body-large-font-size`

## Blueprint + Generation Flow

- Blueprints are the source of truth.
- Generated components are derived artifacts.
- Regeneration is explicit and deterministic.

Regenerate artifacts:

```bash
pnpm --filter @prism/ui-core generate:components
```
