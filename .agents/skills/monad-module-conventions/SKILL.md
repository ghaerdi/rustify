---
name: "monad-module-conventions"
description: "Follow this repo's monad module architecture conventions when adding a new monad type (e.g. Either/Future), splitting an existing module into the directory structure, or refactoring Option/Result internals. Covers the Strategy pattern, namespace-merge statics, JSDoc placement, the no-as-any rule, import/circular-dependency handling, and export updates. Use whenever touching src/option/, src/result/, or creating a new src/<mod>/ directory."
version: 4
created: "2026-08-10"
updated: "2026-08-15"
---

## When to Use
Trigger when adding a new monad type to this repo, restructuring src/ (e.g. splitting result.ts into src/result/), extending Option/Result with new methods that mirror Rust, or reviewing code in src/option/ or src/result/ for convention compliance (JSDoc placement, no as any, module layout).

## Procedure
1. Directory layout per module: src/<mod>/types.ts (internal strategy/base interfaces, @internal), src/<mod>/<variant>.ts (one file per variant class, e.g. some.ts/none.ts, ok.ts/err.ts), src/<mod>/<mod>.ts (public interface + factories + statics + public type aliases), src/<mod>/index.ts (module doc + `export *` barrel re-exports only — never named re-exports, see the JSR doc-coverage pitfall).
2. Variant classes implement an internal Base interface (e.g. BaseOptionStrategy<T>/BaseResult<T,E>) and are marked @internal with a note to use the factory functions instead.
3. Strategy pattern for MUTATING methods only: if the type needs in-place mutation (getOrInsert, getOrInsertWith, take, takeIf), wrap the variants in an impl class (OptionImpl) that holds a private strategy field and swaps it (SomeStrategy <-> NoneStrategy). Non-mutating types (Result) keep plain variant classes.
4. Public API shape: an interface for the monad (Option<T>) + namespace merge for static helpers (Option.fromNullable, Option.isOption), factory functions (Some/None, Ok/Err), and type aliases for the variants (Some<T> = Option<T> etc.). Implementers (OptionImpl) implement a widened internal interface (OptionInstance<T>) that overrides return types to the public Option<T>.
5. JSDoc: full docs on the public interface only; `/** @inheritDoc */` on every implementation method; module-level doc on index.ts and the top-level src/index.ts; @internal on internal classes/interfaces; include @example on user-facing methods.
6. Handle cross-module deps: `import type { ... }` for type-only references across modules. For value imports across the option<->result cycle, use static ESM imports at the top of the file (`import { Ok, Err } from "../result/index.ts"`) — ESM live bindings resolve the cycle at call time, since these factories are only used inside method bodies. All relative imports use explicit `.ts` extensions (Deno requirement). Do NOT use CommonJS `require()` — the repo is pure ESM under Deno.
7. After any rename/split: update src/index.ts, deno.json exports (the `exports` field; jsr.json no longer exists), package.json exports, and test import paths; grep for the old filename to catch stragglers.
8. Verify: deno task check (zero errors), deno test (all pass), deno publish --dry-run succeeds, and entrypoint doc coverage is 100% (see jsr-doc-coverage skill).

## Pitfalls
- Never use `as any` — the repo rule is zero occurrences. Prefer precise type design; use `as unknown as` only when genuinely unavoidable (flatten/transpose/iterator runtime checks), and keep it isolated.
- Result does NOT need a ResultImpl-style wrapper: its OkImpl/ErrImpl are immutable (readonly #value, no mutating methods). Only Option needed the Strategy+wrapper pattern because getOrInsert/take/takeIf mutate in place. Do not add wrappers without a mutating-methods reason.
- JSDoc belongs on the PUBLIC interface (Option<T>/Result<T>), with @param/@returns/@throws/@example. Impl methods use `/** @inheritDoc */` — do not duplicate full docs on implementations.
- Namespace-merged statics: `export namespace Option { export const fromNullable = OptionImpl.fromNullable; }` — the namespace declaration itself needs its own doc comment or JSR doc coverage drops (see jsr-doc-coverage skill).
- Tuple-preserving static combinators (`Result.all`, `Option.all`, ...) require a `const` type parameter — `all<const T extends readonly Result<unknown, unknown>[]>(results: T)` — plus `-readonly` mapped types on the output. A plain `T extends readonly X[]` param infers an ARRAY (union element type), not a tuple: `all([Ok(1), Ok("a")])` degrades to `(number | string)[]`. Add `{ -readonly [K in keyof T]: ... }` to strip the `readonly` that `const` infers, so callers get mutable tuples. Validated with a scratch `deno check` file before implementing.
- Circular imports between option/ and result/ are real (result uses Some/None, option uses Result types). Use `import type` for types; for values rely on static ESM imports + live bindings (the factories are only referenced inside method bodies, so the cycle resolves at call time). Never reintroduce `require()`.
- When splitting/renaming a module, update ALL of: src/index.ts re-exports, deno.json exports, package.json exports, tests' import paths, and every internal import reference (grep for the old filename).
- Module entrypoints (src/option/index.ts, src/result/index.ts) need a `@module` doc comment for the JSR 'Has module docs in all entrypoints' criterion.
- Named re-exports in entrypoints break JSR doc coverage: `export { X } from "./x.ts"` is emitted by JSR's pinned deno_doc as an undocumented Reference declaration, so every re-exported symbol counts against the score (v2.2.1 fixed 50% → 100% by switching to `export *` barrels). `export *` hoists the source module's docs; mark any internal symbols that would leak via `export *` with `@internal` (e.g. PATTERN, PatternToValue in match).

## Verification
1. deno task check passes with zero TypeScript errors (and `grep -rn 'as any' src/` returns nothing).
2. deno test passes with the full suite.
3. deno publish --dry-run succeeds, and all entrypoints (src/index.ts, src/option/index.ts, src/result/index.ts) report 100% documented declarations via the jsr-doc-coverage check.
4. Both import paths work: `@ghaerdi/rustify` and the submodule (`@ghaerdi/rustify/option`, `@ghaerdi/rustify/result`).
