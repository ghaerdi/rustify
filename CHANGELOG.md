# Changelog

## 2.1.0

### New Features

- **`Option`**: Added `contains(value)` — checks if the option is `Some` and the value equals `value`.
- **`Option`**: Added `getOrInsert(value)` — returns the contained value, or inserts and returns `value` if `None`.
- **`Option`**: Added `getOrInsertWith(fn)` — returns the contained value, or computes, inserts, and returns `fn()` if `None`.
- **`Option`**: Added `take()` — extracts the value, leaving the option as `None`.
- **`Option`**: Added `takeIf(predicate)` — extracts the value if the predicate passes, leaving `None`.
- **`Result`**: Added `contains(value)` — checks if the result is `Ok` and the value equals `value`.

### Improvements

- Added module-level JSDoc to all entrypoints (`index.ts`, `option.ts`, `result.ts`).
- Updated README with complete API references for both `Option` and `Result`, plus practical examples.
- Removed all `as any` type assertions across the codebase.
- Fixed type annotations in tests to avoid `never` type issues with `None()` and `Err()`.

## 2.0.0

### Breaking Changes

- **`Option`**: Added full `Option<T>` monad with `Some` and `None` types.
- **`Result`**: Changed `ok()` and `err()` methods to return `Option<T>` / `Option<E>`.
- Removed deprecated `wrapInResult` function.
- Converted `None` from singleton to factory function.

### New Features

- **`Option`**: Full implementation with `map`, `andThen`, `orElse`, `filter`, `inspect`, `match`, `zip`, `zipWith`, `xor`, `cloned`, `flatten`, `transpose`, `okOr`, `okOrElse`, and iterator support.
- **`Result`**: Added `flatten` and `transpose` methods.
- Added direct import support for `option` and `result` submodules.

### Improvements

- Refactored `NoneImpl` methods to return `None` correctly.
- Optimized constructor performance.
- Removed custom stack trace handling from error methods.

## 1.2.0

### New Features

- **`Result`**: Added `asTuple()` — returns `[error, value]` for Go-style destructuring.
- **`Result`**: Added `asObject()` — returns `{ error, value }` for named destructuring.

### Fixes

- Fixed slow type errors.

## 1.1.0

### New Features

- **`Result`**: Added `match()` — pattern matching with `Ok` and `Err` handlers.
- **`Result`**: Added `Result.from()` — wraps a throwing function into a `Result`.
- **`Result`**: Added `Result.fromAsync()` — wraps an async throwing function into a `Promise<Result>`.
- **`Result`**: Added `Result.isResult()` — type guard to check if a value is a `Result`.

### Improvements

- Updated generic type signatures across method definitions.

## 1.0.0

Initial release.

- **`Result<T, E>`** with `Ok` and `Err` variants.
- Core methods: `unwrap`, `unwrapOr`, `unwrapOrElse`, `expect`, `unwrapErr`, `expectErr`.
- Combinators: `map`, `mapOr`, `mapOrElse`, `mapErr`, `and`, `andThen`, `or`, `orElse`.
- Side effects: `inspect`, `inspectErr`.
- Iteration: `[Symbol.iterator]` protocol support.
