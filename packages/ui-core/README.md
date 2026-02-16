# @prism/ui-core

`@prism/ui-core` currently provides deterministic theme infrastructure for Prism.

Phase 1 is intentionally infrastructure-only:

- no UI components
- no framework dependencies
- no DOM logic
- no runtime state or side effects

## Public API

The package exports:

- Theme types (`PrismTheme`, `ThemeOverride`, and related interfaces)
- Theme layers (`coreTheme`, `defaultTheme`, `overlayTheme`)
- `mergeTheme(coreTheme, defaultTheme, overlayTheme)` for deep constrained merge
- `resolveCssVariables(effectiveTheme)` for deterministic `--prism-` variables
- `cssVariablesToString(...)` and `resolveCssVariablesAsCss(...)` for optional CSS text output
- Prism token exports from `src/prism-tokens.ts`

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
