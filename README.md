# rustify

[![npm version](https://img.shields.io/npm/v/@ghaerdi/rustify.svg)](https://www.npmjs.com/package/@ghaerdi/rustify)
[![JSR version](https://jsr.io/badges/@ghaerdi/rustify)](https://jsr.io/@ghaerdi/rustify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<br>
A TypeScript library implementing Rust-like error handling with `Result`, `Ok`, and `Err` types, promoting type-safe and explicit error management.

## Why rustify?

JavaScript/TypeScript error handling often relies on `try...catch` blocks or nullable return types, which can be verbose or hide potential errors. `rustify` brings the `Result` type, a pattern widely used in Rust, to TypeScript. This allows you to:

* **Handle errors explicitly:** Functions return a `Result` which is either `Ok(value)` for success or `Err(error)` for failure.
* **Improve type safety:** The types `T` (success) and `E` (error) are tracked by the type system.
* **Chain operations safely:** Methods like `andThen` and `orElse` allow elegant chaining.
* **Perform exhaustive checks:** The `match` method ensures you handle both `Ok` and `Err` cases explicitly.
* **Easily wrap unsafe functions:** `Result.from` provides a simple way to convert functions that might throw errors into functions that return a `Result`.
* **Destructure results easily:** Use `asTuple()` for Go-style `[err, val]` destructuring, or `asObject()` if you prefer `{ error, value }` destructuring.

## Installation

You can install `rustify` using your favorite package manager or directly from jsr.

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

Import `Ok`, `Err`, and `Result` from the library.

```typescript
import { Result, Ok, Err } from "@ghaerdi/rustify";

// --- Creating a function that returns a Result ---

// Example: A function that performs division but returns Err for division by zero
function divide(numerator: number, denominator: number): Result<number, string> {
  if (denominator === 0) {
    return Err("Cannot divide by zero"); // Failure case
  }
  const result = numerator / denominator;
  return Ok(result); // Success case
}

// --- Using the function and handling the Result ---

const result = divide(10, 2); // Try change 2 to 0 for an Err case

// Use 'match' to exhaustively handle both Ok and Err cases.
// This is often the clearest way to ensure all possibilities are handled.
const message = result.match({
  Ok: (value) => {
    // This runs only if result is Ok
    console.log(`Match Ok: Division successful, value is ${value}`);
    return `Result: ${value}`;
  },
  Err: (errorMessage) => {
    // This runs only if result is Err
    console.error("Match Err:", errorMessage);
    return `Error: ${errorMessage}`;
  }
});

console.log(message);

// Other methods like Result.from, isOk, map, andThen, unwrapOrElse, asTuple etc.
// allow for wrapping functions, specific checks, transformations, and handling patterns.
// See the API Overview section for more details.
```

## Core Concepts

* **`Result<T, E>`:** The main type, representing either success (`Ok<T>`) or failure (`Err<E>`).
* **`Ok<T>`:** Represents a successful result containing a value of type `T`. Created using the `Ok(value)` function.
    * If `T` is iterable (like an Array or String), the `Ok` instance itself becomes iterable.
* **`Err<E>`:** Represents a failure containing an error value of type `E`. Created using the `Err(error)` function.

## API Overview

The `Result` type provides numerous methods for handling and transformation:

* **Checking:**
    * `isOk()`: Returns `true` if `Ok`.
    * `isErr()`: Returns `true` if `Err`.
    * `isOkAnd(fn)`: Returns `true` if `Ok` and the value satisfies `fn`.
    * `isErrAnd(fn)`: Returns `true` if `Err` and the error satisfies `fn`.
* **Extracting Values:**
    * `ok()`: Returns the `Ok` value or `undefined`.
    * `err()`: Returns the `Err` value or `undefined`.
    * `unwrap()`: Returns the `Ok` value, throws if `Err`. **Use with caution.**
    * `unwrapErr()`: Returns the `Err` value, throws if `Ok`.
    * `expect(message)`: Returns `Ok` value, throws `message` if `Err`.
    * `expectErr(message)`: Returns `Err` value, throws `message` if `Ok`.
    * `unwrapOr(defaultValue)`: Returns `Ok` value or `defaultValue` if `Err`.
    * `unwrapOrElse(fn)`: Returns `Ok` value or computes default using `fn(errorValue)` if `Err`.
* **Mapping & Transformation:**
    * `map(fn)`: Maps `Ok<T>` to `Ok<U>`. Leaves `Err` untouched.
    * `mapErr(fn)`: Maps `Err<E>` to `Err<F>`. Leaves `Ok` untouched.
    * `mapOr(defaultValue, fn)`: Applies `fn` to `Ok` value, returns `defaultValue` if `Err`.
    * `mapOrElse(defaultFn, fn)`: Applies `fn` to `Ok` value, applies `defaultFn` to `Err` value.
* **Chaining & Side Effects:**
    * `and(res)`: Returns `res` if `Ok`, else returns self (`Err`).
    * `andThen(fn)`: Calls `fn(okValue)` if `Ok`, returns the resulting `Result`.
    * `or(res)`: Returns `res` if `Err`, else returns self (`Ok`).
    * `orElse(fn)`: Calls `fn(errValue)` if `Err`, returns the resulting `Result`.
    * `inspect(fn)`: Calls `fn(okValue)` if `Ok`, returns original `Result`.
    * `inspectErr(fn)`: Calls `fn(errValue)` if `Err`, returns original `Result`.
* **Pattern Matching:**
    * `match(matcher)`: Executes `matcher.Ok(value)` or `matcher.Err(error)`, returning the result.
* **Cloning:**
    * `cloned()`: Returns a new `Result` with a deep clone of the `Ok` value (using `structuredClone`). `Err` values are not cloned.
* **Destructuring / Representation:**
    * `asTuple()`: Represents the Result's state as a tuple `[error, value]`. Returns `[undefined, T]` for `Ok(T)` and `[E, undefined]` for `Err(E)`.
    * `asObject()`: Represents the Result's state as an object `{ error, value }`. Returns `{ error: undefined, value: T }` for `Ok(T)` and `{ error: E, value: undefined }` for `Err(E)`.
* **Utilities (Static Methods on `Result`):**
    * `Result.from(fn, errorTransform?)`: Wraps a sync function `fn` that might throw. Executes `fn`. Returns `Ok(result)` or `Err(error)`.
    * `Result.fromAsync(fn, errorTransform?)`: Wraps an async function `fn` returning a Promise. Returns `Promise<Result>`. Handles resolution/rejection.
    * `Result.isResult(value)`: Type guard, returns `true` if `value` is `Ok` or `Err`.
    * `wrapInResult(fn, errorTransform?)`: **[Deprecated]** Use `Result.from(() => fn(...args))` instead.
## Development

This project uses Bun.

* **Install Dependencies:**
    ```bash
    bun install
    ```
* **Type Checking:**
    ```bash
    bun run check --watch
    ```
* **Run Tests:**
    ```bash
    bun test --watch
    ```

## Contributing

Contributions welcome! Please submit issues and pull requests.

1.  Fork the repository.
2.  Create your feature branch.
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

## License

MIT License - see the LICENSE file for details.

## Links

* [GitHub Repository](https://github.com/ghaerdi/rustify)
* [Issue Tracker](https://github.com/ghaerdi/rustify/issues)
