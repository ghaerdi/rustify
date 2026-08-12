# Changelog

## 2.2.1

### Fixes

- **JSR documentation coverage is now 100%** (was 50%) — JSR's "Has docs for
  most symbols" score criterion now passes. The `option`, `result`, and `match`
  entrypoints used named re-exports (`export { X } from "..."`), which JSR's
  docs pipeline emits as undocumented declarations; they now use `export *`
  barrels, preserving each symbol's JSDoc.

### Refactoring

- Switched the `option/`, `result/`, and `match/` index files to `export *`
  barrel exports, and marked the internal `match` symbols (`PATTERN`,
  `PatternToValue`) with `@internal` JSDoc so they stay out of the public API.

### Documentation

- Added `AGENTS.md`, a `self-improve` skill, and updated module conventions;
  moved the project's agent skills into the repository (`.agents/skills/`).

## 2.2.0

### Breaking Changes

- **`Option<T>` is now a discriminated union** — was a single interface, now
  `OptionImpl<T, "some"> | OptionImpl<T, "none">` with a literal `__tag`
  property. Values created with `Some()`/`None()` and every method work
  unchanged; only code that extended or implemented the old `Option<T>`
  interface (or referenced the internal strategy types) needs to adapt — the
  method surface now lives on the internal `OptionMethods<T>` interface.

### New Features

- **`match` module — type-safe pattern matching for any value** (inspired by
  [ts-pattern](https://github.com/gvergnaud/ts-pattern) and
  [megamatch](https://github.com/Snowflyt/megamatch)):
  - `match(value)` builds a chain of `.with(pattern, handler)` cases, terminated
    by `.exhaustive()` (throws if nothing matched), `.otherwise(handler)` (a
    default case), or `.run()` (returns `undefined` if nothing matched).
  - Patterns are plain values (literals, object shapes, arrays) or composable
    guards from the `P` namespace: `P.any`, `P.string`, `P.number`, `P.boolean`,
    `P.bigint`, `P.symbol`, `P.nullish`, `P.array`, `P.instanceOf`, `P.union`,
    `P.when`, `P.not`, `P.optional`.
  - `matches(value, pattern)` — standalone predicate form.
  - **Compile-time exhaustiveness**: `.exhaustive()` is a _property_ that
    becomes a non-callable `NeverCase<...>` carrying a readable message
    (`NeverCase<"NonExhaustive: unhandled case { type: rect }">`) when input
    union members are unhandled — the error fires at the `.exhaustive()` call
    site, whether or not the result is used. `.run()` is exhaustiveness-aware:
    it excludes `undefined` from its return type when the input is fully
    covered.
  - **First-class `Option`/`Result` patterns** — `Option.some` and `Option.none`
    match the `Option` variants, `Result.ok` and `Result.err` match the `Result`
    variants, and the handler receives the **unwrapped** value (or error)
    directly:

    ```typescript
    match(opt)
      .with(Option.some, (n) => n.toFixed(2)) // n: number
      .with(Option.none, () => "none")
      .exhaustive();
    ```

  - **`Option<T>` is now a discriminated union** —
    `OptionImpl<T, "some"> |
    OptionImpl<T, "none">` (new `__tag` property,
    literal per variant). This is what powers per-variant exhaustiveness and
    enables `if (opt.__tag ===
    "some")` narrowing. The method surface is
    preserved via the internal `OptionMethods<T>` interface (used for
    `@inheritDoc` docs; not part of the public API); behavior is unchanged.
  - Public types: `Match`, `Pattern`, `Narrow`.

### Improvements

- **Rust std parity — 10 missing methods added:**
  - `Option`: `insert`, `replace`, `isNoneOr`, `expectNone`, `count`, `copied`,
    `unzip` (matches Rust std `Option` semantics; `copied` is an identity since
    TS passes by value).
  - `Result`: `unwrapErrOrElse`, `intoOk`, `intoErr` (matches Rust std `Result`;
    `intoOk`/`intoErr` are aliases of `unwrap`/`unwrapErr` since TS has no
    borrow semantics).
  - All with JSDoc examples; 18 new tests (laziness + exact panic-message
    assertions per the Rust parity suite).

- **Per-variant type guards for imperative narrowing** — `Option.isSome` /
  `Option.isNone` and `Result.isOk` / `Result.isErr` narrow to a single variant
  (e.g. `value is Option<T> & { __tag: "some" }`), so `if`/`else`,
  `Array.filter`, and plain code get the same precision as the `match()`
  patterns. 7 new tests.

- **JSR documentation coverage is now 100%** (was ~75%):
  - Documented the `Option` namespace declaration.
  - Documented the `Option._inner` property.
  - Documented `OkImpl.[Symbol.iterator]` and `ErrImpl.[Symbol.iterator]`.
  - Documented `utils.ts` `toString` and removed a stray `@inheritDoc` from
    `defaultErrorTransform`.
- Added a GitHub Actions CI workflow (`.github/workflows/ci.yml`) that runs type
  checking, tests, and a JSR publish dry-run on push/PR to `main`.

### Documentation

- Documented the new `match` module in the README: a `match` entry in Core
  Concepts, a full `### match` API section (terminals, `P` namespace, public
  types), and a worked `### Pattern matching with match()` example (exhaustive
  unions, guards, and `Option`/`Result` integration).

### Tests

- Added `test/match.test.ts` (263 tests): literals, shapes, guards, arrays,
  `instanceOf`, combinators, terminals, exhaustiveness (positive and negative),
  and Option/Result integration.
- Added 23 Rust standard library parity tests for `Option` and `Result`,
  matching the documented doctests from Rust's std (lazy evaluation, error
  message content, `sq_then_to_string` chaining, `or_else` chaining,
  one-level-at-a-time `flatten`, and more).

### Refactoring

- Split `result.ts` into a `src/result/` directory with dedicated files:
  `types.ts`, `ok.ts`, `err.ts`, `result.ts`, and `index.ts` — mirroring the
  `option/` structure. All internal imports and entrypoint exports were updated
  to the new paths.
- Replaced the lazy `require()` calls in `OkImpl.transpose` with clean static
  imports.
- Reformatted the codebase (README, CHANGELOG, package.json, and all source
  files) for consistent style.

## 2.1.1

### Fixes

- **`Option`**: `getOrInsert`/`getOrInsertWith` now actually store the value
  when called on `None`, fixing patterns like singletons where the inserted
  value was lost.
- **`Option`**: `take`/`takeIf` now properly revert a `Some` to `None` by
  swapping the inner strategy.

### Refactoring

- Split `option.ts` into `option/` directory with separate files: `types.ts`,
  `some.ts`, `none.ts`, `option.ts`, `index.ts`.
- Adopted Strategy pattern: `OptionImpl` wraps `SomeStrategy`/`NoneStrategy`,
  enabling in-place mutations via strategy swapping.
- `OptionImpl` now implements the `Option<T>` interface.
- Merged `Option.fromNullable` and `Option.isOption` into `OptionImpl` as static
  methods.
- Full JSDoc with `@param`, `@returns`, `@throws`, `@example` on all public
  `Option<T>` interface methods.
- Added `@inheritDoc` to all `OptionImpl` methods for IDE tooltip support.

## 2.1.0

### New Features

- **`Option`**: Added `contains(value)` — checks if the option is `Some` and the
  value equals `value`.
- **`Option`**: Added `getOrInsert(value)` — returns the contained value, or
  inserts and returns `value` if `None`.
- **`Option`**: Added `getOrInsertWith(fn)` — returns the contained value, or
  computes, inserts, and returns `fn()` if `None`.
- **`Option`**: Added `take()` — extracts the value, leaving the option as
  `None`.
- **`Option`**: Added `takeIf(predicate)` — extracts the value if the predicate
  passes, leaving `None`.
- **`Result`**: Added `contains(value)` — checks if the result is `Ok` and the
  value equals `value`.

### Improvements

- Added module-level JSDoc to all entrypoints (`index.ts`, `option.ts`,
  `result.ts`).
- Updated README with complete API references for both `Option` and `Result`,
  plus practical examples.
- Removed all `as any` type assertions across the codebase.
- Fixed type annotations in tests to avoid `never` type issues with `None()` and
  `Err()`.

## 2.0.0

### Breaking Changes

- **`Option`**: Added full `Option<T>` monad with `Some` and `None` types.
- **`Result`**: Changed `ok()` and `err()` methods to return `Option<T>` /
  `Option<E>`.
- Removed deprecated `wrapInResult` function.
- Converted `None` from singleton to factory function.

### New Features

- **`Option`**: Full implementation with `map`, `andThen`, `orElse`, `filter`,
  `inspect`, `match`, `zip`, `zipWith`, `xor`, `cloned`, `flatten`, `transpose`,
  `okOr`, `okOrElse`, and iterator support.
- **`Result`**: Added `flatten` and `transpose` methods.
- Added direct import support for `option` and `result` submodules.

### Improvements

- Refactored `NoneImpl` methods to return `None` correctly.
- Optimized constructor performance.
- Removed custom stack trace handling from error methods.

## 1.2.0

### New Features

- **`Result`**: Added `asTuple()` — returns `[error, value]` for Go-style
  destructuring.
- **`Result`**: Added `asObject()` — returns `{ error, value }` for named
  destructuring.

### Fixes

- Fixed slow type errors.

## 1.1.0

### New Features

- **`Result`**: Added `match()` — pattern matching with `Ok` and `Err` handlers.
- **`Result`**: Added `Result.from()` — wraps a throwing function into a
  `Result`.
- **`Result`**: Added `Result.fromAsync()` — wraps an async throwing function
  into a `Promise<Result>`.
- **`Result`**: Added `Result.isResult()` — type guard to check if a value is a
  `Result`.

### Improvements

- Updated generic type signatures across method definitions.

## 1.0.0

Initial release.

- **`Result<T, E>`** with `Ok` and `Err` variants.
- Core methods: `unwrap`, `unwrapOr`, `unwrapOrElse`, `expect`, `unwrapErr`,
  `expectErr`.
- Combinators: `map`, `mapOr`, `mapOrElse`, `mapErr`, `and`, `andThen`, `or`,
  `orElse`.
- Side effects: `inspect`, `inspectErr`.
- Iteration: `[Symbol.iterator]` protocol support.
