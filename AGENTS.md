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
- `deno publish --dry-run` — verify JSR publishability
- `deno task build:npm` — compile the npm artifact (`npm/`, deno dnt) from
  `src/`, then bundle each ESM entry with esbuild into a self-contained file
  (webpack/Next.js SSR compat), prune the now-dead per-file ESM `.js`, and emit
  a `files` allowlist in the published `package.json`. Reads the version AND the
  publish metadata (description, keywords, author, repository, bugs, license)
  from package.json as the single source of truth — see `scripts/build_npm.ts`.
  This is what CI runs before publishing to npm (see Release). Requires
  `esbuild`, auto-installed via `"nodeModulesDir": "auto"`.
- `devenv test` — validate the dev environment (git-hooks + `deno task check`);
  `devenv shell` enters it

Tests and checks run natively under Deno (no install step). The npm build
(`deno task build:npm`) additionally uses `esbuild` from npm, auto-installed
into a gitignored `node_modules/` via `deno.json` `"nodeModulesDir": "auto"`.

## Layout

```
src/
  index.ts          — module doc + re-exports
  option/           — Option monad (Some/None; strategy impl for mutating methods)
  result/           — Result monad (Ok/Err; immutable variants)
  match/            — match() pattern matching
  immutable/        — Immutable<T> deep readonly utility type
  utils.ts          — shared helpers
test/
  option.test.ts, result.test.ts, match.test.ts, immutable.test.ts

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
- `package.json` keywords mirror the GitHub repo topics 1:1 (same token set; GH
  topics are kebab-case). `scripts/build_npm.ts` ships them verbatim to the npm
  `keywords` field, so edit package.json, then `gh api .../topics` to keep
  GitHub in sync.

## Release

Version bumps + CHANGELOG + git tag + draft GitHub release: follow the
`release-workflow` and `release-notes` skills (`.agents/skills/`).

Publishing is automated — `.github/workflows/publish.yml` runs on the GitHub
`release: published` event and publishes **both** registries from CI, no tokens
(OIDC):

- **JSR**: `deno publish` (TypeScript source, SLSA provenance).
- **npm**: `deno task build:npm` (compiled `npm/` via dnt, ESM entries bundled
  with esbuild for webpack/Next.js SSR compat) then `npm publish` via trusted
  publishing; the npm dist-tag derives from the tag's pre-release label
  (`-beta.N` → `beta`, stable → `latest`).

Bump the version in BOTH `package.json` and `deno.json` to the exact release
version before tagging — the workflow's version guard fails on a mismatch.

## Docs

Keep README.md, AGENTS.md, and JSDoc in sync with the code. After a session with
meaningful changes, run the `self-improve` skill to reconcile docs and capture
patterns.
