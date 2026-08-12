# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

rustify — a TypeScript monad library inspired by Rust: `Result`, `Option`, and
`match()` for safe error handling and null management. Zero runtime
dependencies. Dual-published to npm (`@ghaerdi/rustify`) and JSR
(`@ghaerdi/rustify`). Runtime: Deno (no Node, no Bun).

## Commands

- `deno task check` — type-check all source and tests (`deno check src/ test/`)
- `deno test` — run the full test suite
- `deno fmt --check` / `deno fmt` — format check / format
- `deno lint` — lint
- `deno publish --dry-run` — verify publishability (JSR + npm via package.json)
- `devenv test` — validate the dev environment (git-hooks + `deno task check`);
  `devenv shell` enters it

No install step needed — tests and checks run natively under Deno.

## Layout

```
src/
  index.ts          — module doc + re-exports
  option/           — Option monad (Some/None; strategy impl for mutating methods)
  result/           — Result monad (Ok/Err; immutable variants)
  match/            — match() pattern matching
  utils.ts          — shared helpers
test/
  option.test.ts, result.test.ts, match.test.ts
.agents/skills/     — project skills, versioned in git (see self-improve skill)
```

## Conventions

- Monad module architecture: `types.ts` (internal interfaces) + one file per
  variant + public module file + `index.ts` re-exports. See
  `.agents/skills/monad-module-conventions` for the full layout.
- JSDoc on public interfaces only; `@internal` on internals; `@inheritDoc` on
  implementations; `@example` on user-facing methods; `@module` on entrypoints.
- No `as any` anywhere in `src/`.
- All relative imports use explicit `.ts` extensions.
- Tests: `describe`/`test` from `@std/testing/bdd`, `expect` from `@std/expect`,
  `spy`/`assertSpyCalls`/`assertSpyCall` from `@std/testing/mock`. Do NOT use
  `@std/expect` mock matchers — they are incompatible with std spies.
- Commits run devenv git-hooks (alejandra, deadnix, deno fmt/lint/check) — hooks
  live in `devenv.nix`; the generated `.pre-commit-config.yaml` is not
  hand-edited.

## Release

Version bumps + CHANGELOG + git tag + draft GitHub release: follow the
`release-workflow` and `release-notes` skills (`.agents/skills/`).

## Docs

Keep README.md, AGENTS.md, and JSDoc in sync with the code. After a session with
meaningful changes, run the `self-improve` skill to reconcile docs and capture
patterns.
