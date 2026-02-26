# Prism

Prism is built using the principles of [Radial Architecture](https://www.radialarchitecture.com/articles/radial-architecture/).

Prism is a **composable commerce proof of concept (POC)** currently under development.

This repository is a **blueprint-first monorepo** for exploring how a commerce platform can be assembled from composable domains:

- a storefront application (`@prism/storefront`)
- a UI primitive/design-system layer (`@prism/ui-core`)
- content management integration (`@prism/sanity`)
- contract definitions (`@prism/blueprints`)
- orchestration pipelines (`@prism/orchestration`)
- external service adapters (`@prism/adapters`)
- evals/quality gates (`@prism/evals`)
- shared utilities and CLI tooling (`@prism/shared`, `@prism/cli`)

The core idea is to keep business flows and UI composition **contract-driven and modular**, while isolating vendor integrations behind adapters.

## Prism and Radial Architecture

Prism’s structure aligns well with a radial architecture model:

- `@prism/blueprints` acts as a central contract/canonical layer that other domains orient around.
- Domain responsibilities are explicitly separated (`adapters`, `orchestration`, `ui-core`, `evals`, `storefront`, `sanity`) to reduce cross-coupling.
- Integrations are pushed to the edge via `@prism/adapters`, keeping core orchestration and contracts vendor-agnostic.
- The storefront and content surfaces consume stable internal contracts instead of directly owning all business/integration logic.
- Evals provide a governance/verification layer to detect drift as the system evolves.

In practice, Prism is using the repo’s domain boundaries to keep the center stable (contracts and shared primitives) while allowing outer layers (apps, integrations, tooling) to evolve independently.

## What Prism Is Trying to Prove

Prism is testing a development model where:

- **Blueprints define contracts first** (UI shapes, IO, invariants)
- **Adapters isolate providers** (CMS, APIs, AI/services, SDKs)
- **Orchestration composes workflows** from those contracts
- **UI Core generates/serves reusable UI artifacts**
- **Storefront consumes the composed pieces** to deliver the customer experience
- **Evals validate behavior** and guard against drift

This makes the system easier to evolve, test, and regenerate while staying consistent across domains.

## Architecture at a Glance

```
Blueprints (contracts / schemas / intent)
  -> Adapters (external integrations normalized to contracts)
  -> Orchestration (pipeline logic and sequencing)
  -> Evals (contract + behavior validation)

Blueprints
  -> UI Core (theme + generated UI primitives / artifacts)
  -> Storefront (app experience consuming UI + orchestration + content)

Sanity (content domain / studio) feeds content workflows
Shared + CLI support every domain
```

## Workspace Structure

```text
prism/
  domains/
    adapters/       # Integration boundary for third-party services
    blueprints/     # Source-of-truth contracts and schemas
    cli/            # Prism workspace tooling / scaffolding surface
    evals/          # Evaluation and regression harnesses
    orchestration/  # Composable pipeline execution logic
    sanity/         # Sanity Studio and content-domain integration
    shared/         # Cross-domain pure utilities and common types
    storefront/     # Customer-facing app (Angular app scaffold + app code)
    ui-core/        # Design-system primitives, theme infrastructure, generators
  package.json
  pnpm-workspace.yaml
  README.md
```

## Current State (POC / In Progress)

This repo is actively evolving and not all domains are at the same maturity level.

- `ui-core`, `blueprints`, `orchestration`, `adapters`, `evals`, `shared`, and `cli` include Prism-specific architectural docs/packages.
- `storefront` and `sanity` exist and are wired into the workspace, but parts of their local READMEs are still framework-generated scaffold docs.
- Root scripts are intentionally minimal while the architecture solidifies.

## Getting Started

Install workspace dependencies:

```bash
pnpm install
```

## Common Commands (Repo Root)

- `pnpm build` runs `build` scripts across workspace packages (`pnpm -r build`)
- `pnpm test` runs `test` scripts across workspace packages (`pnpm -r test`)

## Useful Domain Commands

- `pnpm --filter @prism/ui-core storybook` to inspect generated UI primitives locally
- `pnpm --filter @prism/ui-core generate:components` to regenerate deterministic UI component artifacts
- `pnpm --filter @prism/ui-core mcp:server` to run the ui-core MCP distribution server (internal)
- `pnpm --filter @prism/storefront start` to run the Angular storefront app
- `pnpm --filter @prism/sanity dev` to run the Sanity Studio

## How to Read This Repo First

If you are new to Prism, start here:

1. `domains/blueprints/README.md` for the contract-first model
2. `domains/orchestration/README.md` for pipeline composition
3. `domains/adapters/README.md` for integration boundaries
4. `domains/ui-core/README.md` for generated UI primitives/theme artifacts
5. `domains/evals/README.md` for validation strategy

Then inspect `storefront` and `sanity` to see how the application and content surfaces are being assembled around those domains.

## Workspace Notes

- Prism uses **pnpm workspaces** with domains under `domains/*`.
- `pnpm-workspace.yaml` also references a sibling workspace (`../stably`) for local linked development.
- Internal Prism domains are private workspace modules (for example `@prism/ui-core`).
