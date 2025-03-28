# rustify

[![npm version](https://img.shields.io/npm/v/@ghaerdi/rustify.svg)](https://www.npmjs.com/package/@ghaerdi/rustify)
[![JSR version](https://jsr.io/badges/@ghaerdi/rustify)](https://jsr.io/@ghaerdi/rustify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<br>
A TypeScript library implementing Rust-like error handling with `Result`, `Ok`, and `Err` types, promoting type-safe and explicit error management.

## Why rustify?

JavaScript/TypeScript error handling often relies on `try...catch` blocks or nullable return types, which can be verbose or hide potential errors. `rustify` brings the `Result` type, a pattern widely used in Rust, to TypeScript. This allows you to:

* **Handle errors explicitly:** Functions return a `Result` which is either `Ok(value)` for success or `Err(error)` for failure, forcing you to handle both cases.
* **Improve type safety:** The types `T` (success) and `E` (error) are tracked by the type system.
* **Chain operations safely:** Methods like `andThen` and `orElse` allow elegant chaining of operations that might fail.
* **Write cleaner code:** Avoid deeply nested `try...catch` blocks or excessive null checks.

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

Import `Ok`, `Err`, and `Result` from the library. Functions that can fail should return a `Result<T, E>`.

```typescript
import { Result, Ok, Err } from "@ghaerdi/rustify";

// Example function that might fail
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Err("Cannot divide by zero"); // Return Err on failure
  }
  return Ok(a / b); // Return Ok on success
}

// --- Handling the result ---

const result1 = divide(10, 2);

// 1. Using unwrapOr: Provide a default value if it's an Err
console.log(result1.unwrapOr(NaN)); // Output: 5

// 2. Using pattern matching (isOk/isErr)
if (result1.isOk()) {
  console.log("Success:", result1.unwrap()); // Safely unwrap Ok value
} else {
  console.error("Error:", result1.unwrapErr()); // Safely unwrap Err value
}

const result2 = divide(10, 0);

console.log(result2.unwrapOr(NaN)); // Output: NaN

if (result2.isErr()) {
  console.error("Error:", result2.err()); // Get the error value
  // Output: Error: Cannot divide by zero
}

// 3. Expecting a value (throws if it's an Err)
try {
  const value = result2.expect("Division failed");
  // This line won't be reached
} catch (e) {
  console.error(e.message); // Output: Division failed: Cannot divide by zero
}
```

## Core Concepts

* **`Result<T, E>`:** The main type, representing either success (`Ok<T>`) or failure (`Err<E>`).
* **`Ok<T>`:** Represents a successful result containing a value of type `T`. Created using the `Ok(value)` function.
* **`Err<E>`:** Represents a failure containing an error value of type `E`. Created using the `Err(error)` function.

## API Overview

The `Result` type provides numerous methods for convenient handling and transformation:

* **Checking:**
    * `isOk()`: Returns `true` if the result is `Ok`.
    * `isErr()`: Returns `true` if the result is `Err`.
    * `isOkAnd(fn)`: Returns `true` if `Ok` and the value satisfies the predicate `fn`.
    * `isErrAnd(fn)`: Returns `true` if `Err` and the error satisfies the predicate `fn`.
* **Extracting Values:**
    * `ok()`: Returns the `Ok` value or `undefined` if `Err`.
    * `err()`: Returns the `Err` value or `undefined` if `Ok`.
    * `unwrap()`: Returns the `Ok` value, throws an error if `Err`. **Use with caution.**
    * `unwrapErr()`: Returns the `Err` value, throws an error if `Ok`.
    * `expect(message)`: Returns the `Ok` value, throws an error with `message` if `Err`.
    * `expectErr(message)`: Returns the `Err` value, throws an error with `message` if `Ok`.
    * `unwrapOr(defaultValue)`: Returns the `Ok` value or `defaultValue` if `Err`.
    * `unwrapOrElse(fn)`: Returns the `Ok` value or computes a default value using `fn(errorValue)` if `Err`.
* **Mapping & Transformation:**
    * `map(fn)`: Maps `Ok<T>` to `Ok<U>` by applying `fn` to the value, leaves `Err` untouched.
    * `mapErr(fn)`: Maps `Err<E>` to `Err<F>` by applying `fn` to the error, leaves `Ok` untouched.
    * `mapOr(defaultValue, fn)`: Applies `fn` to the `Ok` value, returns `defaultValue` if `Err`.
    * `mapOrElse(defaultFn, fn)`: Applies `fn` to the `Ok` value, applies `defaultFn` to the `Err` value.
* **Chaining & Side Effects:**
    * `and(res)`: Returns `res` (another `Result`) if self is `Ok`, otherwise returns self (`Err`).
    * `andThen(fn)`: Calls `fn(okValue)` if self is `Ok`, returning the resulting `Result`. Returns self (`Err`) otherwise. Useful for chaining operations that return `Result`.
    * `or(res)`: Returns `res` (another `Result`) if self is `Err`, otherwise returns self (`Ok`).
    * `orElse(fn)`: Calls `fn(errValue)` if self is `Err`, returning the resulting `Result`. Returns self (`Ok`) otherwise. Useful for handling errors by trying an alternative.
    * `inspect(fn)`: Calls `fn(okValue)` if `Ok`, returns the original `Result`. Useful for debugging.
    * `inspectErr(fn)`: Calls `fn(errValue)` if `Err`, returns the original `Result`. Useful for logging errors.
* **Cloning:**
    * `cloned()`: Returns a new `Result` with a deep clone of the `Ok` value (using `structuredClone`). `Err` values are not cloned.
* **Utilities:**
    * `wrapInResult(fn, errorTransform?)`: Wraps a function `fn` that might throw. Returns a new function that returns `Ok(returnValue)` on success or `Err(error)` on failure. Optionally transforms the caught error.

```typescript
import { wrapInResult, Ok, Err } from "@ghaerdi/rustify";

// Wrap JSON.parse
const safeParse = wrapInResult(JSON.parse);

const resultOk = safeParse('{"value": true}');
console.log(resultOk.unwrapOr({ value: false })); // Output: { value: true }

const resultErr = safeParse('invalid json');
console.log(resultErr.err()); // Output: "Unexpected token i..."
```

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

Contributions are welcome! Please feel free to submit issues and pull requests.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Links

* [GitHub Repository](https://github.com/ghaerdi/rustify)
* [Issue Tracker](https://github.com/ghaerdi/rustify/issues)
