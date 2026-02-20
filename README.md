# Prism

Prism is organized as a **pnpm workspace** with internal domains under `domains/`.

## Workspace Structure

```
prism/
  domains/
    storefront/
    ui-core/
    adapters/
    blueprints/
    orchestration/
    evals/
    cli/
    shared/
    sanity/
  pnpm-workspace.yaml
  package.json
  README.md
```

## Getting Started

Install all workspace dependencies:

```bash
pnpm install
```

### Common scripts

- `pnpm build` runs each domain build via `pnpm -r build`.
- `pnpm test` runs tests across all workspace domains.
- `pnpm lint` lints all workspace domains.

## Development Model

- External workspaces like Stably can be linked with `workspace:` references during development.
- Internal Prism domains are private workspace modules.
