# UI Core Phase 3 MCP Distribution Surface — Context Summary

## Goal

Implement a deterministic TypeScript/Node MCP server inside `packages/ui-core` that acts as the distribution mechanism for ui-core artifacts (components, base theme, base fonts/font files, and blueprints) without introducing consumer customization-by-proxy behavior.

## Outcome

* Added MCP server implementation in `packages/ui-core/src/mcp/` with stdio JSON-RPC handling and locked tool registration.
* Implemented the v1 locked tool surface only:
  * `getStatus`
  * `listComponents`
  * `getComponentArtifact`
  * `getBaseTheme`
  * `getBaseFonts`
  * `listBaseFontFiles`
  * `getBaseFontFile`
  * `listBlueprints`
  * `getBlueprint`
* Added deterministic artifact resolution/store logic in `packages/ui-core/src/mcp/artifact-store.ts` and tool handlers in `packages/ui-core/src/mcp/tools.ts`.
* Added distributed base artifacts:
  * `packages/ui-core/src/generated/theme/prism-base-theme.css`
  * `packages/ui-core/src/generated/fonts/prism-base-fonts.css`
  * `packages/ui-core/src/generated/fonts/files/prism-public-sans-400.woff2`
  * `packages/ui-core/src/generated/fonts/files/prism-public-sans-500.woff2`
* Added MCP tests in `packages/ui-core/src/mcp/__tests__/tools.test.ts`.
* Added usage/docs + proof script:
  * MCP docs in `packages/ui-core/README.md`
  * Consumer override proof in `packages/ui-core/src/mcp/examples/consumer-css-override-example.ts`
* Added git hygiene for local temp output via `.gitignore` rule:
  * `packages/ui-core/.tmp-*/`

## Invariants (Must Remain True)

* ui-core distributes canonical artifacts only; it does not merge or synthesize consumer-specific themes.
* Blueprints remain source-of-truth governance artifacts and are exposed as deterministic distribution outputs.
* Server behavior remains read-only for repository artifacts (no mutation and no request-time regeneration).
* Tool responses remain machine-friendly and structured (`ok` + structured error payloads).
* Version selection remains explicit and deterministic (no implicit `latest` semantics).

## Key Decisions

* Implemented MCP server in TypeScript/Node within `packages/ui-core` to stay aligned with existing TS blueprints and generated artifacts.
* Chose file-backed artifact serving from checked-in/generated repo paths rather than regeneration at request time.
* Kept tool surface locked to exactly the nine required v1 tools; no extra helper/admin tools were added.
* Added strict version resolution with explicit `VERSION_NOT_FOUND` style errors instead of fallback behavior.
* Included metadata on artifacts (content type, filename, hash, size, mtime) to support orchestration/debugging without expanding tool count.
* Added an end-to-end consumer override proof that demonstrates CSS-variable override in consumer space, not server-side customization.

## System Constraints

* Scope constrained primarily to `packages/ui-core` plus one root `.gitignore` update.
* Domain boundary enforced: distribution only; no Eval logic and no storefront-level customization behavior inside this server.
* Existing artifact layout reused (`src/generated/components`, `src/blueprint/components`, new `src/generated/theme`, `src/generated/fonts`).
* Determinism requirement enforced by stable file addressing and explicit version contracts.
* MCP protocol support implemented via stdio JSON-RPC with only needed methods for initialization and tool execution.

## Failure Modes (Now Explicit)

* Unknown/unsupported versions return structured version errors instead of implicit fallback.
* Unknown IDs (`componentId`, `themeId`, `fontSetId`, `fileId`, `blueprintId`) return structured not-found errors.
* Missing artifact files return structured missing-artifact errors with context fields (id/path).
* Invalid input shapes return structured `INVALID_INPUT` errors rather than stack traces in normal tool paths.
* Tool tests now include strict typed extraction helpers to avoid editor/type-system ambiguity around generic JSON payloads.

## What Is Explicitly Out of Scope

* Any server-side consumer customization mechanism (theme overlay merge endpoints, per-consumer variant synthesis).
* Automatic regeneration of generated components/artifacts during MCP requests.
* Eval-domain checks/scoring/drift logic inside ui-core MCP server.
* Additional MCP tools beyond the locked v1 surface.
* PR merge/release orchestration.

## Open Questions / Inputs to Next Phase

* Should future versions expose multiple explicit artifact versions (for example, release channels) and if so what repository layout should own that mapping?
* Should font binary assets be replaced with production-grade packaged font artifacts from a dedicated font pipeline/package?
* Should MCP response schemas be formalized in a shared contract package for cross-domain consumer validation?

## Implementation Notes (Optional)

* Branch: `codex/ui-core-mcp-distribution`
* PR: `https://github.com/tonym/prism/pull/7` (target `develop`)
* Key commit sequence:
  * `8b67332` MCP server scaffold + component distribution tools
  * `638908a` base theme/font tools + artifacts
  * `d87cdb5` blueprint tools
  * `13c5add` docs + end-to-end override proof
  * `b279284` strict test typing fixes
  * `bbecad3` ignore local `.tmp-*` output
* Validation run during phase:
  * `pnpm --filter @prism/ui-core lint`
  * `pnpm --filter @prism/ui-core test`
  * `pnpm --filter @prism/ui-core mcp:example`

## End State

ui-core now has a working MCP distribution server that exposes deterministic component/theme/font/blueprint artifacts through a locked, machine-friendly tool surface, while preserving domain boundaries and keeping consumer customization in consumer CSS/tooling.
