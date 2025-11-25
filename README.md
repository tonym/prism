# prism

This repository is now organized as a pnpm workspace covering two packages:

- `packages/stably`
- `packages/storefront`

Run `pnpm install` to bootstrap the workspace.

### Common scripts

- `pnpm build` runs each package's `build` script via `pnpm -r build`.
- `pnpm test` and `pnpm lint` do the same for `test` and `lint`.
