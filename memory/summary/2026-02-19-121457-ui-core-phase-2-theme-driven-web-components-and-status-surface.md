# UI Core Phase 2 Theme-Driven Web Components and Status Surface — Context Summary

## Goal

Deliver the first blueprint-driven, theme-contract-bound Web Components in ui-core and establish a deterministic, facts-only component status surface for Phase 3 MCP consumption.

## Outcome

* Added blueprint authority for Button, IconButton, Typography, and Surface in `packages/ui-core/src/blueprint/components/`.
* Added deterministic blueprint -> Web Component generation in `packages/ui-core/src/generator/`.
* Added checked-in generated artifacts in `packages/ui-core/src/generated/components/`.
* Added facts-only status registry and reporting in `packages/ui-core/src/status/` with stable hashing and factual status flags.
* Added tests for generator determinism and status determinism/error-flag behavior.

## Invariants (Must Remain True)

* `ui-core` remains domain-owned and framework-neutral.
* Blueprints remain the single source of truth; generated files are derived artifacts.
* Components bind to `--prism-*` variables from the Prism theme contract.
* Theme merge strictness remains intact: no unknown keys, no structural extension via overrides, deterministic output ordering.
* Status reporting remains facts-only (no health scoring, no recommendations).

## Key Decisions

* Implemented a template-kind-based generator (`button`, `icon-button`, `typography`, `surface`) for deterministic source emission.
* Constrained Typography variant/size blueprint options to theme typing keys from the Prism typography contract.
* Stored generator identity input with registry entries and incorporated it into generator hash derivation.
* Enforced `mayRegenerate`/`regenerationAdvisory` relationship at the type level using discriminated unions.
* Kept regeneration explicit via a script (`generate:components`) with no automatic regeneration behavior.

## System Constraints

* Changes were contained to `packages/ui-core`.
* No Eval-domain health logic or MCP server implementation was introduced.
* No framework adapters/orchestration/runtime theme-switching were introduced.
* Determinism is required for generation output and status reporting output.
* Locked status model field set and enum domains were preserved.

## Failure Modes (Now Explicit)

* Missing blueprint/artifact/generator refs are reported via factual `statusFlags` and `missing` hashes rather than throwing.
* Invalid theme overrides still fail early via runtime validation in theme merge.
* Icon-only accessible-name gaps are represented as explicit accessibility facts/flags, not inferred health judgments.

## What Is Explicitly Out of Scope

* MCP server implementation.
* Eval/system health recommendations.
* Automatic request-time regeneration.
* Versioning/migrations framework work.
* Non-ui-core package changes and framework adapters.

## Open Questions / Inputs to Next Phase

* Should fallback literals in generated component CSS be further reduced in favor of strict theme-variable-only declarations?
* Should we add additional generated component contracts in Phase 2.x (inputs, toggles, fields) or defer to Phase 3?
* Do we want stricter static type tests around registry authoring patterns beyond current discriminated-union enforcement?

## Implementation Notes (Optional)

* Branch: `codex/ui-core-phase2-theme-components`.
* Core commits include generator/scaffolding, status surface, docs example, and post-review invariant tightening.
* Validation run: `pnpm --filter @prism/ui-core build`, `pnpm --filter @prism/ui-core lint`, and `pnpm --filter @prism/ui-core test`.

## End State

ui-core now has a deterministic, blueprint-authoritative generation pipeline for the initial theme-driven Web Components and a locked, facts-only status surface suitable for later MCP exposure without introducing eval or health-domain coupling.
