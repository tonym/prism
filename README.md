# Prism

Prism is organized as a **pnpm workspace**. It currently contains a single internal package and is designed to integrate cleanly with external packages such as **Stably**, your lightweight context-slicing engine.

## Workspace Structure

```
prism/
  packages/
    storefront/     ← Internal package (Angular/AI hub)
  pnpm-workspace.yaml
  package.json
  README.md
```

### Internal Packages

- **packages/storefront**  
  The application layer for experimentation, UI integration, and AI-driven features. Acts as the *hub* in the hub-and-spoke model described in upcoming documentation.

### External Packages

- **Stably** (external repo)  
  A lightweight context pipeline library intended for experimentation, chatbots, and targeted AI integrations.  
  Stably is consumed during development using `workspace:` linking and will later be published as a GitHub Packages module.

## Getting Started

Install all workspace dependencies:

```
pnpm install
```

### Common Scripts

```
pnpm build   # Runs each package's build task via pnpm -r build
pnpm test    # Runs tests across all workspace packages
pnpm lint    # Lints all workspace packages
```

## Development Model

Prism follows a **hybrid dependency approach**:

- During development, external packages like Stably are linked locally using `workspace:` references.
- When packages reach stability, they can be published to GitHub Packages and consumed as standard versioned dependencies.

This model keeps the monorepo clean while enabling open-source participation and flexible evolution.# prism

This repository is now organized as a pnpm workspace covering two packages:

- `packages/stably`
- `packages/storefront`
- `packages/ui-core`
- `packages/adapters`
- `packages/blueprints`
- `packages/pipelines`
- `packages/evals`
- `packages/cli`

Run `pnpm install` to bootstrap the workspace.

### Common scripts

- `pnpm build` runs each package's `build` script via `pnpm -r build`.
- `pnpm test` and `pnpm lint` do the same for `test` and `lint`.
