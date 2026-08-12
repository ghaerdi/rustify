# rustify

[![npm version](https://img.shields.io/npm/v/@ghaerdi/rustify.svg)](https://www.npmjs.com/package/@ghaerdi/rustify)
[![JSR version](https://jsr.io/badges/@ghaerdi/rustify)](https://jsr.io/@ghaerdi/rustify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<br> A TypeScript library inspired by Rust, providing `Result` and `Option`
types for safe error handling and null management with functional programming
patterns.

## Why rustify?

JavaScript/TypeScript error handling often relies on `try...catch` blocks or
nullable return types, which can be verbose or hide potential errors. `rustify`
brings Rust-inspired monads like `Result` and `Option` to TypeScript, enabling
functional programming patterns for safer code. This allows you to:

- **Handle errors explicitly:** Functions return a `Result` which is either
  `Ok(value)` for success or `Err(error)` for failure.
- **Manage nullable values safely:** Use `Option` to represent values that may
  or may not exist, eliminating null/undefined errors.
- **Improve type safety:** Both `Result<T, E>` and `Option<T>` types are tracked
  by the type system.
- **Chain operations safely:** Monadic methods like `andThen`, `map`, and
  `orElse` allow elegant functional composition.
- **Perform exhaustive checks:** The `match` method ensures you handle all cases
  explicitly.
- **Easily wrap unsafe functions:** `Result.from` and `Option.fromNullable`
  provide simple ways to convert potentially unsafe operations.
- **Destructure results easily:** Use `asTuple()` for Go-style `[err, val]`
  destructuring, or `asObject()` if you prefer `{ error, value }` destructuring.

## Installation

You can install `rustify` using your favorite package manager or directly from
jsr.

**npm:**

```bash
npm install @ghaerdi/rustify
# or
yarn add @ghaerdi/rustify
# or
pnpm add @ghaerdi/rustify
```

**jsr:**

```bash
npx jsr add @ghaerdi/rustify
# or
bunx jsr add @ghaerdi/rustify
# or
deno add @ghaerdi/rustify
```

## Basic Usage

Import `Ok`, `Err`, `Result`, `Some`, `None`, and `Option` from the library.

```typescript
import { Err, None, Ok, Option, Result, Some } from "@ghaerdi/rustify";

// --- Creating a function that returns a Result ---

function divide(
  numerator: number,
  denominator: number,
): Result<number, string> {
  if (denominator === 0) {
    return Err("Cannot divide by zero");
  }
  return Ok(numerator / denominator);
}

// --- Using the function and handling the Result ---

const result = divide(10, 2);

// Use 'match' to exhaustively handle both Ok and Err cases.
const message = result.match({
  Ok: (value) => `Result: ${value}`,
  Err: (error) => `Error: ${error}`,
});
console.log(message); // "Result: 5"

// Working with ok() and err() methods that return Option:
const okValue = result.ok(); // Returns Option<number>
if (okValue.isSome()) {
  console.log(`Ok value: ${okValue.unwrap()}`);
}

// Example with Option
const name: Option<string> = Some("Alice");
const greeting = name.match({
  Some: (value) => `Hello, ${value}!`,
  None: () => "Hello, stranger!",
});
console.log(greeting); // "Hello, Alice!"

// Wrapping unsafe operations
const parsed = Result.from(() => JSON.parse('{"x": 1}')); // Ok({x: 1})
const nullable = Option.fromNullable(() => document.getElementById("app")); // Some(element) or None
```

## Core Concepts

- **`Result<T, E>`:** Represents either success (`Ok<T>`) or failure (`Err<E>`).
  - `Ok<T>`: Contains a success value. Becomes iterable if `T` is iterable.
  - `Err<E>`: Contains an error value.
- **`Option<T>`:** Represents an optional value, either `Some<T>` or `None`.
  - `Some<T>`: Contains a value. Becomes iterable if `T` is iterable.
  - `None()`: Represents the absence of a value. Call `None()` to create a None
    instance.
- **`match`:** Type-safe pattern matching for **any** value — a chained
  `.with()` / `.exhaustive()` API inspired by
  [ts-pattern](https://github.com/gvergnaud/ts-pattern). Matches literals,
  object shapes, arrays, class instances, and your own algebraic types
  (including `Option` and `Result` via the dedicated `Option.some` /
  `Option.none` / `Result.ok` / `Result.err` patterns), with compile-time
  exhaustiveness checking.

## API Overview

### Result\<T, E\>

`Result<T, E>` is a **discriminated union** of `Ok<T>` and `Err<E>` — narrow
with `isOk()` / `isErr()` (or the `match()` patterns `Result.ok` /
`Result.err`, which hand the unwrapped value or error to the handler).

- **Checking:**
  - `isOk()`: Returns `true` if `Ok`.
  - `isErr()`: Returns `true` if `Err`.
  - `isOkAnd(fn)`: Returns `true` if `Ok` and the value satisfies `fn`.
  - `isErrAnd(fn)`: Returns `true` if `Err` and the error satisfies `fn`.
  - `contains(value)`: Returns `true` if `Ok` and the value equals `value`.
- **Extracting Values:**
  - `ok()`: Returns the `Ok` value as `Some(value)` or `None`.
  - `err()`: Returns the `Err` value as `Some(error)` or `None`.
  - `unwrap()`: Returns the `Ok` value, throws if `Err`. **Use with caution.**
  - `unwrapErr()`: Returns the `Err` value, throws if `Ok`.
  - `expect(message)`: Returns `Ok` value, throws `message` if `Err`.
  - `expectErr(message)`: Returns `Err` value, throws `message` if `Ok`.
  - `unwrapOr(defaultValue)`: Returns `Ok` value or `defaultValue` if `Err`.
  - `unwrapOrElse(fn)`: Returns `Ok` value or computes default using
    `fn(errorValue)` if `Err`.
  - `unwrapOrDefault()`: Returns `Ok` value or throws (no `Default` trait in
    TypeScript).
- **Mapping & Transformation:**
  - `map(fn)`: Maps `Ok<T>` to `Ok<U>`. Leaves `Err` untouched.
  - `mapErr(fn)`: Maps `Err<E>` to `Err<F>`. Leaves `Ok` untouched.
  - `mapOr(defaultValue, fn)`: Applies `fn` to `Ok` value, returns
    `defaultValue` if `Err`.
  - `mapOrElse(defaultFn, fn)`: Applies `fn` to `Ok` value, applies `defaultFn`
    to `Err` value.
  - `mapOrDefault(defaultValue, fn)`: Applies `fn` to `Ok` value, returns
    `defaultValue` if `Err`.
- **Chaining & Side Effects:**
  - `and(res)`: Returns `res` if `Ok`, else returns self (`Err`).
  - `andThen(fn)`: Calls `fn(okValue)` if `Ok`, returns the resulting `Result`.
  - `or(res)`: Returns `res` if `Err`, else returns self (`Ok`).
  - `orElse(fn)`: Calls `fn(errValue)` if `Err`, returns the resulting `Result`.
  - `inspect(fn)`: Calls `fn(okValue)` if `Ok`, returns original `Result`.
  - `inspectErr(fn)`: Calls `fn(errValue)` if `Err`, returns original `Result`.
- **Flattening & Transposing:**
  - `flatten()`: Converts `Result<Result<T, E>, E>` to `Result<T, E>`.
  - `transpose()`: Transposes `Result<Option<T>, E>` into
    `Option<Result<T, E>>`.
- **Pattern Matching:**
  - `match(matcher)`: Executes `matcher.Ok(value)` or `matcher.Err(error)`,
    returning the result.
- **Cloning:**
  - `cloned()`: Returns a new `Result` with a deep clone of the `Ok` value
    (using `structuredClone`). `Err` values are not cloned.
- **Destructuring:**
  - `asTuple()`: Returns `[undefined, T]` for `Ok` or `[E, undefined]` for
    `Err`.
  - `asObject()`: Returns `{ error: undefined, value: T }` for `Ok` or
    `{ error: E, value: undefined }` for `Err`.
- **Iteration:**
  - `iter()`: Returns an iterator that yields the `Ok` value once, or nothing if
    `Err`.
  - `[Symbol.iterator]()`: Iterator protocol — yields the `Ok` value if it is
    iterable.
- **Static Methods on `Result`:**
  - `Result.from(fn, errorTransform?)`: Wraps a sync function that might throw.
    Returns `Ok(result)` or `Err(error)`.
  - `Result.fromAsync(fn, errorTransform?)`: Wraps an async function returning a
    Promise. Returns `Promise<Result>`.
  - `Result.isResult(value)`: Type guard, returns `true` if `value` is `Ok` or
    `Err`.

### Option\<T\>

`Option<T>` is a **discriminated union** — every value exposes a literal
`tag`: `"some"` or `"none"` — so you can narrow with
`if (opt.tag === "some")` (or `isSome()` / `isNone()`).

- **Checking:**
  - `isSome()`: Returns `true` if `Some`.
  - `isNone()`: Returns `true` if `None`.
  - `isSomeAnd(fn)`: Returns `true` if `Some` and the value satisfies `fn`.
  - `contains(value)`: Returns `true` if `Some` and the value equals `value`.
- **Extracting Values:**
  - `unwrap()`: Returns the `Some` value, throws if `None`. **Use with
    caution.**
  - `expect(message)`: Returns the `Some` value, throws `message` if `None`.
  - `unwrapOr(defaultValue)`: Returns the `Some` value or `defaultValue` if
    `None`.
  - `unwrapOrElse(fn)`: Returns the `Some` value or computes default using
    `fn()` if `None`.
  - `unwrapOrDefault()`: Returns the `Some` value or throws (no `Default` trait
    in TypeScript).
- **Mapping & Transformation:**
  - `map(fn)`: Maps `Some<T>` to `Some<U>`. Leaves `None` untouched.
  - `mapOr(defaultValue, fn)`: Applies `fn` to `Some` value, returns
    `defaultValue` if `None`.
  - `mapOrElse(defaultFn, fn)`: Applies `fn` to `Some` value, applies
    `defaultFn` if `None`.
  - `mapOrDefault(defaultValue, fn)`: Applies `fn` to `Some` value, returns
    `defaultValue` if `None`.
- **Chaining & Side Effects:**
  - `and(res)`: Returns `res` if `Some`, else returns `None`.
  - `andThen(fn)`: Calls `fn(someValue)` if `Some`, returns the resulting
    `Option`.
  - `or(res)`: Returns self if `Some`, else returns `res`.
  - `orElse(fn)`: Returns self if `Some`, else calls `fn()` and returns the
    result.
  - `xor(other)`: Returns `Some` if exactly one of self or `other` is `Some`,
    else `None`.
  - `inspect(fn)`: Calls `fn(someValue)` if `Some`, returns original `Option`.
- **Filtering:**
  - `filter(predicate)`: Returns `Some(value)` if `Some` and predicate passes,
    else `None`.
- **Flattening & Transposing:**
  - `flatten()`: Converts `Option<Option<T>>` to `Option<T>`.
  - `transpose()`: Transposes `Option<Result<T, E>>` into
    `Result<Option<T>, E>`.
- **Inserting & Taking (Mutating):**
  - `getOrInsert(value)`: Returns the contained value. If `None`, inserts and
    returns `value`.
  - `getOrInsertWith(fn)`: Returns the contained value. If `None`, computes and
    inserts `fn()`.
  - `take()`: Extracts the value, leaving the option as `None`. Returns the
    value as `Some`.
  - `takeIf(predicate)`: Extracts the value if `Some` and predicate passes,
    leaving `None`.
- **Pattern Matching:**
  - `match(matcher)`: Executes `matcher.Some(value)` or `matcher.None()`,
    returning the result.
- **Cloning:**
  - `cloned()`: Returns a new `Option` with a deep clone of the `Some` value
    (using `structuredClone`).
- **Zipping:**
  - `zip(other)`: Zips `Some(a)` with `Some(b)` into `Some([a, b])`, else
    `None`.
  - `zipWith(other, fn)`: Zips `Some(a)` with `Some(b)` using `fn(a, b)` into
    `Some(result)`, else `None`.
- **Iteration:**
  - `[Symbol.iterator]()`: Iterator protocol — yields the `Some` value if it is
    iterable.
- **Converting to Result:**
  - `okOr(err)`: Converts `Some(v)` to `Ok(v)`, `None` to `Err(err)`.
  - `okOrElse(fn)`: Converts `Some(v)` to `Ok(v)`, `None` to `Err(fn())`.
- **Static Methods on `Option`:**
  - `Option.fromNullable(fn)`: Wraps a function that might return `null` or
    `undefined`. Returns `Some(value)` or `None`.
  - `Option.isOption(value)`: Type guard, returns `true` if `value` is `Some` or
    `None`.

### match

Import `match` and `P` from `@ghaerdi/rustify/match`.

- **Matching:**
  - `match(value)`: Starts a match chain, returning a `Match` you extend
    with `.with()` cases and terminate with `.exhaustive()`, `.otherwise()`
    or `.run()`.
  - `matches(value, pattern)`: Standalone predicate — returns `true` if
    `value` matches `pattern`.
- **Terminals:**
  - `.with(pattern, handler)`: Adds a case. `handler` receives the value
    narrowed to what `pattern` matches. Returns the extended match.
  - `.exhaustive()`: Runs the match and **throws** if nothing matched. At
    compile time, calling it on an incomplete match is a type error at the
    call site that names the missing cases (e.g.
    `NeverCase<"NonExhaustive: unhandled case { type: rect }">`).
  - `.otherwise(handler)`: Runs the match, calling `handler(value)` for
    anything no case matched.
  - `.run()`: Runs the match, returning `undefined` if nothing matched —
    excluded from the return type when every case is covered.
- **`Option`/`Result` patterns:** `Option.some`, `Option.none`, `Result.ok`
  and `Result.err` match the respective variant and pass the **unwrapped**
  value (or error) to the handler — `n` below is `number`, not `Option<number>`:
  ```typescript
  match(opt)
    .with(Option.some, (n) => n.toFixed(2))
    .with(Option.none, () => "none")
    .exhaustive();
  ```
  These patterns are **per-variant**: `.with(Option.some, ...).exhaustive()`
  alone is a compile error naming the missing variant
  (`NeverCase<"NonExhaustive: unhandled case { tag: none }">`).
- **Patterns (the `P` namespace):**
  - `P.any` / `P._`: Matches anything (catch-all).
  - `P.string`, `P.number`, `P.boolean`, `P.bigint`, `P.symbol`: Matches
    primitive types.
  - `P.nullish`: Matches `null` or `undefined`.
  - `P.array(pattern?)`: Matches arrays; optionally checks every element.
  - `P.instanceOf(Ctor)`: Matches class instances.
  - `P.union(...patterns)`: Matches any of the given patterns.
  - `P.when(guard)`: Matches when the type guard returns `true`.
  - `P.not(pattern)`: Matches everything except `pattern`.
  - `P.optional(pattern)`: Matches `undefined` or `pattern`.
- **Types:**
  - `Match`: the chain type returned by `match()`.
  - `Pattern<TInput>`: a valid pattern for `TInput`.
  - `Narrow<TInput, P>`: the type of a value matched by pattern `P`.

## Examples

### Chaining with Result

```typescript
import { Err, Ok, Result } from "@ghaerdi/rustify";

function parseAge(input: string): Result<number, string> {
  const num = parseInt(input, 10);
  if (isNaN(num)) return Err("Not a number");
  if (num < 0) return Err("Age cannot be negative");
  if (num > 150) return Err("Unrealistic age");
  return Ok(num);
}

const result = parseAge("25")
  .map((age) => age + 1) // Ok(26)
  .andThen((age) => Ok(age.toString())); // Ok("26")

console.log(result.unwrap()); // "26"
```

### Chaining with Option

```typescript
import { None, Option, Some } from "@ghaerdi/rustify";

const config: Option<Record<string, string>> = Some({
  theme: "dark",
  lang: "en",
});

const theme = config
  .map((c) => c.theme) // Some("dark")
  .filter((t) => t === "dark") // Some("dark")
  .unwrapOr("light"); // "dark"

console.log(theme);
```

### Converting throwing functions

```typescript
import { Option, Result } from "@ghaerdi/rustify";

// Result.from catches thrown errors
const parsed = Result.from(() => JSON.parse('{"valid": true}'));
// parsed is Ok({ valid: true })

const failed = Result.from(() => JSON.parse("invalid"));
// failed is Err("Unexpected token...")

// Option.fromNullable handles null/undefined
const element = Option.fromNullable(() => document.getElementById("app"));
// element is Some(element) or None
```

### Pattern matching with match()

```typescript
import { match, P } from "@ghaerdi/rustify/match";
import { Err, None, Ok, Option, Result, Some } from "@ghaerdi/rustify";

type Shape =
  | { type: "circle"; radius: number }
  | { type: "rect"; width: number; height: number };

// exhaustive() is checked at compile time: every Shape case must be handled.
const area = (shape: Shape): number =>
  match(shape)
    .with({ type: "circle" }, ({ radius }) => Math.PI * radius * radius)
    .with({ type: "rect" }, ({ width, height }) => width * height)
    .exhaustive();

console.log(area({ type: "circle", radius: 2 })); // ~12.57
console.log(area({ type: "rect", width: 3, height: 4 })); // 12

// Patterns can also be guards, catch-alls, and combinators:
const describe = (value: unknown): string =>
  match(value)
    .with(P.string, (s) => `a string: ${s}`)
    .with(P.number, (n) => `a number: ${n}`)
    .with(
      { type: "rect", width: P.number, height: P.number },
      ({ width }) => `a ${width}-wide rect`,
    )
    .otherwise(() => "something else");

console.log(describe("hi")); // "a string: hi"
console.log(describe({ type: "rect", width: 3, height: 4 })); // "a 3-wide rect"

// Option.some / Option.none / Result.ok / Result.err are ready-made
// patterns for the library's own types: they match the variant AND hand the
// unwrapped value (or error) straight to the handler.
const label = (value: Result<number, string> | Option<number>): string =>
  match(value)
    .with(Result.ok, (n) => `ok: ${n}`)
    .with(Result.err, (e) => `err: ${e}`)
    .with(Option.some, (n) => `some: ${n}`)
    .with(Option.none, () => "none")
    .exhaustive();

console.log(label(Ok(5))); // "ok: 5"
console.log(label(Err("boom"))); // "err: boom"
console.log(label(Some(5))); // "some: 5"
console.log(label(None())); // "none"
```


## Development

This project uses Bun.

- **Install Dependencies:**
  ```bash
  bun install
  ```
- **Type Checking:**
  ```bash
  bun run check --watch
  ```
- **Run Tests:**
  ```bash
  bun test --watch
  ```

## Contributing

Contributions welcome! Please submit issues and pull requests.

1. Fork the repository.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

## License

MIT License - see the LICENSE file for details.

## Links

- [GitHub Repository](https://github.com/ghaerdi/rustify)
- [Issue Tracker](https://github.com/ghaerdi/rustify/issues)
