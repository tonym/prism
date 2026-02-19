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
