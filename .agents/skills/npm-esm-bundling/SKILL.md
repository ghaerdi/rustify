---
name: "npm-esm-bundling"
description: "This repo's npm package ships webpack/Next.js-SSR-safe ESM. Trigger when working on scripts/build_npm.ts, when a Next.js/webpack consumer reports `__webpack_modules__[moduleId] is not a function` against @ghaerdi/rustify, or when revisiting how the npm artifact is produced. Covers why dnt's ESM `export *` re-export chain breaks webpack SSR, the esbuild bundling + dead-file pruning + `files` allowlist added to build:npm, and how to verify the tarball."
version: 2
created: "2026-08-15"
updated: "2026-08-15"
---

## When to Use

- Editing `scripts/build_npm.ts` (the dnt npm build) or `deno.json` npm/`nodeModulesDir` config.
- A Next.js or webpack consumer reports `__webpack_modules__[moduleId] is not a function` against `@ghaerdi/rustify`.
- Reviewing what the published npm tarball contains (esm/ vs script/), why it's bundled on the ESM side but not CJS, or whether transpilePackages is still needed on the consumer side.

## Procedure

1. `build:npm` is a two-phase build. First `@deno/dnt` (in `scripts/build_npm.ts`) emits `npm/` with ESM (`esm/`, `{"type":"module"}`) and CommonJS (`script/`, `{"type":"commonjs"}`), plus `.d.ts` for each module. Multiple `entryPoints` produce `index.js` + `esm/{option,result,match}/index.js`.
2. dnt's ESM entry files are `export * from "./x.js"` re-export shims over namespace-merge objects (`Option || (Option = {})`, `Result = { from, fromAsync, ... }`). Webpack's SSR/RSC ESM interop resolves the star-reexport chain to a non-callable module → `__webpack_modules__[moduleId] is not a function`, which Next.js consumers historically worked around with `transpilePackages: ["@ghaerdi/rustify"]`.
3. After dnt, esbuild-bundle each ESM entry into ONE self-contained file: `esbuild.build({ entryPoints:[entry], bundle:true, format:"esm", platform:"neutral" })`, write to a temp path, then `Deno.rename` over the entry (esbuild refuses to overwrite the input file → must use a temp output + rename). Each bundled entry has zero imports and one explicit `export { ... }` — webpack-safe, and consumers drop `transpilePackages`.
4. Bundling orphans the per-file ESM `.js` modules dnt emitted (nothing imports them anymore). Prune them: iterate `npm/esm/<mod>/`, remove any `.js` that is not `index.js`; keep `esm/utils.js` (imported by bundled code) and all `.d.ts` (the entry `.d.ts` still `export * from "./xxx.js"` for types — keep those per-file `.d.ts`).
5. Do NOT bundle the CJS (`script/`) side — dnt's `__createBinding`/`__exportStar` CJS re-exports are already webpack-safe (verified), and `script/index.js` requires its per-file modules, so they are live, not dead.
6. Set an explicit `files` allowlist in the dnt `package` config: `files: ["esm/", "script/", "LICENSE", "README.md"]`. It becomes a denylist-free guarantee that stray source/artifacts never ship (npm auto-includes package.json). The rest of the `package` block — `description`, `keywords`, `author`, `repository`, `bugs`, `license` — is read straight from the repo `package.json` (single source of truth), so edit package.json to change npm metadata, NOT the hardcoded script (build_npm.ts copies those fields from `pkg.*`; only dnt-specific outputs `files`/`engines` are defined in the script).
7. `esbuild` is a dev dependency: `deno.json` adds `"esbuild": "npm:esbuild@^0.28.2"` under `imports` and `"nodeModulesDir": "auto"` (top level). `deno.lock` pins it. `node_modules/` is gitignored.
8. Verify: `deno task build:npm`, then `cd npm && npm pack --dry-run` — confirm dead ESM `.js` are gone, tarball is ~61 files, and no `src/`/lockfiles slip in. Confirm ESM + CJS + types all work (`import('./npm/esm/index.js')`, `require('./script/index.js')`, and a tsc consumer that type-narrows via `.d.ts`).

## Pitfalls

- esbuild throws `Refusing to overwrite input file` if `outfile` equals the entry — always bundle to a temp file then `Deno.rename`.
- Never delete the per-file `.d.ts` even after bundling: the entry `.d.ts` re-exports from them for TYPE declarations (a tsc consumer still narrows `match(value).with(P.string, ...)` to `string`). Only the dead `.js` modules are removable.
- Leaning only on `.npmignore` (a denylist) is fragile — an explicit `files` allowlist is the robust default and self-documents the shipped contents.
- The webpack SSR error is NOT a rustify code bug and is not fixed by any TypeScript compiler choice (tsc/esbuild/dnt all emit the same `export *` chain) — bundling the ESM entries is the fix.
- The npm ESM/`esm` dir and CJS/`script` dir are opposite: you bundle ESM (its `export *` is the problem) and leave CJS (its `__createBinding` is fine).
- `npm pack --dry-run` from the repo root packs the WRONG thing (repo files). Run it from inside `npm/` where the generated package.json lives.

## Verification

1. `deno task build:npm` completes and `npm/esm/index.js` + `npm/esm/{option,result,match}/index.js` each have zero `export * from` (grep) and one top-level `export { ... }`.
2. Dead per-file ESM `.js` are gone (e.g. `npm/esm/option/option.js`), but their `.d.ts` remain.
3. `cd npm && npm pack --dry-run` shows ~61 files, and `grep -c "src/"` in the listing is 0.
4. Runtime + types: node ESM import and CJS require both work; a strict tsc consumer type-errors on `const x: number = match("a").with(P.string, s => s).exhaustive()`.
5. `gh`-side: a newly published version's tarball on the npm registry shows the same slim contents; downstream Next.js consumers need no `transpilePackages`.
