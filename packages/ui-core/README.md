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

## UI Core MCP Distribution Server (v1)

The ui-core MCP server is the distribution surface for ui-core artifacts.
It only serves base artifacts and does not perform consumer customization.
Consumers customize by applying their own CSS variable overrides (for example, overriding `--prism-*` values).

Run locally:

```bash
pnpm --filter @prism/ui-core mcp:server
```

The server exposes only these tools in v1:

1. `getStatus()`
2. `listComponents(options?)`
3. `getComponentArtifact({ componentId, version? })`
4. `getBaseTheme({ themeId?, version? })`
5. `getBaseFonts({ fontSetId?, version? })`
6. `listBaseFontFiles({ fontSetId?, version? })`
7. `getBaseFontFile({ fileId })`
8. `listBlueprints(options?)`
9. `getBlueprint({ blueprintId?, componentId?, version? })`

Call contract:

- Use MCP `tools/list` to discover tools.
- Use MCP `tools/call` with `name` and `arguments`.
- `version` is deterministic: omitted means current package version, and unsupported versions return a structured `VERSION_NOT_FOUND` error.
- Tool responses use structured `ok` results:
  - success: `{ ok: true, data: { ... } }`
  - error: `{ ok: false, error: { code, message, details? } }`

### Minimal End-to-End Consumer Override Proof

Generate a standalone HTML example that fetches base theme CSS + one component artifact and applies consumer-side variable overrides:

```bash
pnpm --filter @prism/ui-core mcp:example > /tmp/prism-ui-core-mcp-override-demo.html
```

The generated page includes:

- base theme CSS from `getBaseTheme()`
- button component artifact from `getComponentArtifact({ componentId: "button" })`
- consumer CSS override:
  - `--prism-color-primary: #14532d;`
  - `--prism-color-on-primary: #f8fafc;`

This demonstrates customization is performed in consumer CSS, not by server-side theme merging.

## Concrete Template Override Example

This example shows a minimal custom `button-brand` template kind that extends the existing button template with a branded border and shadow.

### 1) Add a new template kind

File: `src/blueprint/component-blueprint.ts`

```ts
export type ComponentTemplateKind =
  | 'button'
  | 'button-brand'
  | 'icon-button'
  | 'typography'
  | 'surface';
```

### 2) Add a custom blueprint using the new kind

File: `src/blueprint/components/button-brand.blueprint.ts`

```ts
import type { ComponentBlueprint } from '../component-blueprint.js';
import { buttonBlueprint } from './button.blueprint.js';

export const buttonBrandBlueprint: ComponentBlueprint = {
  ...buttonBlueprint,
  componentId: 'button-brand',
  tagName: 'prism-button-brand',
  className: 'PrismButtonBrandElement',
  templateKind: 'button-brand'
};
```

### 3) Route the new template kind in the generator

File: `src/generator/generate-components.ts`

```ts
function buttonBrandSource(blueprint: ComponentBlueprint): string {
  const baseSource = buttonSource(blueprint);

  return baseSource.replace(
    '.control {',
    `.control {
  border: 2px solid var(--prism-color-tertiary, #705c9b);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--prism-color-tertiary, #705c9b) 24%, transparent);
`
  );
}

function generateSourceForBlueprint(blueprint: ComponentBlueprint): string {
  switch (blueprint.templateKind) {
    case 'button':
      return buttonSource(blueprint);
    case 'button-brand':
      return buttonBrandSource(blueprint);
    case 'icon-button':
      return iconButtonSource(blueprint);
    case 'typography':
      return typographySource(blueprint);
    case 'surface':
      return surfaceSource(blueprint);
  }
}
```

### 4) Include the blueprint and regenerate

Add `buttonBrandBlueprint` to your blueprint list (`src/blueprint/components/index.ts`) and regenerate:

```bash
pnpm --filter @prism/ui-core generate:components
```

Result: you get a new deterministic artifact (`prism-button-brand.component.js`) while the original `prism-button` template remains unchanged.
