# @prism/ui-core

`@prism/ui-core` provides deterministic theme infrastructure and blueprint-driven Web Component artifacts for Prism.

Phase 2 introduces generated, theme-driven primitives while keeping deterministic behavior:

- `Button` (`prism-button`)
- `IconButton` (`prism-icon-button`)
- `Typography` (`prism-typography`)
- `Surface/Card` (`prism-surface`)

## Storybook Workbench (Internal)

`@prism/ui-core` includes a Storybook workbench for the ui-core domain team to inspect generated Web Components locally.

This workbench is:

- an internal inspection surface for ui-core maintainers
- loaded directly from local `@prism/ui-core` workspace artifacts

This workbench is not:

- an MCP interface
- a package distribution surface
- a customization-by-proxy mechanism

Run from the repo root:

```bash
pnpm --filter @prism/ui-core storybook
```

The Storybook preview loads these artifacts globally:

- base theme CSS defaults (`@prism/ui-core/generated/theme/base.css`)
- base fonts CSS (`@prism/ui-core/generated/fonts/base.css`)
- generated custom element registrations (`@prism/ui-core/generated/components`)

Stories use real `<prism-*>` elements and include focused examples that override one `--prism-*` CSS variable at the story wrapper level to verify custom-property cascade into Shadow DOM-rendered components.
Canvas inspection uses built-in Controls (args/argTypes) and the Accessibility panel (`@storybook/addon-a11y`) for quick interactive and a11y checks during local inspection.

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

## Figma Authoring Alignment (Maintainer)

Figma is the internal authoring substrate for UI Core token review.
Published contract truth remains UI Core blueprints and token exports in this repository.

This workflow is implemented under `domains/ui-core/authoring/**` and is intentionally non-public.
No authoring modules are exported from `src/index.ts`.

### Prerequisites

- A Figma access token available as `FIGMA_ACCESS_TOKEN` (recommended in `.env`)
- Figma variable collection name exactly: `Prism UI Core Tokens`
- Optional: a configured Codex MCP server entry for `figma_console` when using `--transport mcp`

### Commands

Run from repo root:

```bash
pnpm --filter @prism/ui-core figma:extract -- --file-url "https://www.figma.com/design/<fileKey>/<name>"
# optional MCP mode:
pnpm --filter @prism/ui-core figma:extract -- --transport mcp --file-url "https://www.figma.com/design/<fileKey>/<name>"
pnpm --filter @prism/ui-core figma:map:suggest
pnpm --filter @prism/ui-core figma:map:check
```

`figma:extract` defaults to `--transport rest` and loads `./.env` automatically.

`figma:map:suggest` behavior:

- read-only by default (does not modify mapping file)
- write mappings only when `--write` is provided
- mapping writes only apply high-confidence, single-candidate suggestions

### Artifacts

- Snapshots:
  - `domains/ui-core/authoring/snapshots/figma/<snapshotId>.json`
  - `domains/ui-core/authoring/snapshots/figma/latest.json`
- Mapping:
  - `domains/ui-core/authoring/mappings/figma-token-map.json`
- Reports:
  - `domains/ui-core/authoring/reports/figma-map-check-*.json`
  - `domains/ui-core/authoring/reports/latest.json`

Snapshot IDs use `YYYYMMDDTHHmmssZ-<hash8>` and include a deterministic content hash.
Normalized snapshots are stable-ordered and omit volatile runtime metadata.

### Mapping and Checks

- Canonical mapping target keys are dot-path repo token keys inferred from `src/prism-tokens.ts` exports.
- Figma variable names are interpreted from the `prism-` prefix plus hyphen hierarchy.
- `figma:map:check` is warn-only for:
  - unmapped Figma variables
  - unmapped repo token keys
- `figma:map:check` fails (non-zero) for structural issues:
  - invalid mapping JSON shape
  - invalid repo token key references in mapping entries

### Boundary Rule

The authoring layer must not be imported by core runtime surfaces:

- `src/generator/**`
- `src/determinism/**`
- `src/status/**`
- `src/mcp/**`
- `src/theme/**`
- `src/css/**`

This is enforced by `pnpm --filter @prism/ui-core check:authoring:boundaries` and is included in `lint` and `test`.

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
