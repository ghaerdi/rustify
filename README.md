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

Import `Ok`, `Err`, `Result`, `Some`, `None`, and `Option` from the library.

```typescript
import { Result, Ok, Err, Option, Some, None } from "@ghaerdi/rustify";

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
const messageFromResult = result.match({
  Ok: (value) => {
    // This runs only if result is Ok
    console.log(`Match Ok (Result): Division successful, value is ${value}`);
    return `Result: ${value}`;
  },
  Err: (errorMessage) => {
    // This runs only if result is Err
    console.error("Match Err (Result):", errorMessage);
    return `Error: ${errorMessage}`;
  }
});

console.log(messageFromResult);

// Example with Option
const anOptionalString: Option<string> = Some("Hello, Option!");
const messageFromOption = anOptionalString.match({
    Some: (value) => `Option has value: ${value}`,
    None: () => "Option is None"
});
console.log(messageFromOption);


// Working with ok() and err() methods that now return Option:
const okValue = result.ok(); // Returns Option<number>
if (okValue.isSome()) {
  console.log(`Ok value: ${okValue.unwrap()}`);
}

const errValue = result.err(); // Returns Option<string> 
if (errValue.isSome()) {
  console.log(`Error: ${errValue.unwrap()}`);
}

// Other methods like Result.from, isOk, map, andThen, unwrapOrElse, asTuple etc.
// and Option.fromNullable, isSome, map, unwrapOr etc.
// allow for wrapping functions, specific checks, transformations, and handling patterns.
// See the API Overview sections for more details.
```

## Core Concepts

* **`Result<T, E>`:** Represents either success (`Ok<T>`) or failure (`Err<E>`).
    * `Ok<T>`: Contains a success value. Becomes iterable if `T` is iterable.
    * `Err<E>`: Contains an error value.
* **`Option<T>`:** Represents an optional value, either `Some<T>` or `None`.
    * `Some<T>`: Contains a value. Becomes iterable if `T` is iterable.
    * `None`: Represents the absence of a value. It is a **singleton instance**; all operations resulting in an empty option will return this exact `None` instance. This means you can check for `None` using direct referential equality (`myOption === None`).


## API Overview

The `Result` type provides numerous methods for handling and transformation:

* **Checking:**
    * `isOk()`: Returns `true` if `Ok`.
    * `isErr()`: Returns `true` if `Err`.
    * `isOkAnd(fn)`: Returns `true` if `Ok` and the value satisfies `fn`.
    * `isErrAnd(fn)`: Returns `true` if `Err` and the error satisfies `fn`.
* **Extracting Values:**
    * `ok()`: Returns the `Ok` value as `Some(value)` or `None`.
    * `err()`: Returns the `Err` value as `Some(error)` or `None`.
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

## Option Monad (`Option<T>`)

The `Option<T>` type represents an optional value: every `Option` is either `Some` and contains a value, or `None` and does not. It's useful for handling cases where a value might be absent, without resorting to `null` or `undefined` directly, thus making potential absences explicit.

`Option<T>` can be either:
*   `Some<T>`: Represents the presence of a value.
*   `None`: Represents the absence of a value. `None` is a **singleton instance**. All operations or functions that result in an "empty" option will return this exact instance.

### Creating Options

```typescript
import { Some, None, Option } from "@ghaerdi/rustify"; // Assuming published package, or adjust path e.g. "./src"

const someValue: Option<number> = Some(10);
const noValue: Option<number> = None; // None is a singleton

// From potentially null/undefined values
function findConfig(key: string): { value: string } | undefined {
  // ... some logic
  if (key === "timeout") return { value: "3000" };
  return undefined;
}

const timeoutConfig: Option<{ value: string }> = Option.fromNullable(() => findConfig("timeout"));
const missingConfig: Option<{ value: string }> = Option.fromNullable(() => findConfig("missing"));

console.log(timeoutConfig.unwrapOr({ value: "default" })); // { value: "3000" }
console.log(missingConfig.unwrapOr({ value: "default" })); // { value: "default" }
console.log(missingConfig === None); // true, because findConfig("missing") returns undefined
```

### Working with Options

Options provide a variety of methods to work with potential values safely. You can check if an option is `None` either by using `myOption.isNone()` or by direct comparison `myOption === None`.

```typescript
// Unwrapping (getting the value)
const val = Some(5).unwrapOr(0); // val is 5
const valOr = None.unwrapOr(0); // valOr is 0
console.log(`val: ${val}, valOr: ${valOr}`);

const valElse = None.unwrapOrElse(() => Math.random()); // valElse is a random number
console.log(`valElse: ${valElse}`);

// Expect (unwrap with a custom error if None)
// Some("data").expect("Data should be present"); // "data"
// None.expect("Data should be present"); // Throws Error: "Data should be present"
// console.log(Some("data").expect("Data should be present")); 
// try { None.expect("Data should be present"); } catch (e:any) { console.error(e.message); }


// Mapping
const lengthOpt = Some("hello").map(s => s.length); // Some(5)
const noLengthOpt = None.map((s: string) => s.length); // None (no generic <string> needed for None)
console.log(`lengthOpt: ${lengthOpt.unwrapOr(-1)}, noLengthOpt is None: ${noLengthOpt.isNone()}`);
console.log(`Is noLengthOpt actually None? ${noLengthOpt === None}`); // true


// Chaining (andThen / flatMap)
const parsed = Some("5").andThen(s => {
  const num = parseInt(s, 10);
  return isNaN(num) ? None : Some(num); // Return None singleton
}); // Some(5)
console.log(`parsed: ${parsed.unwrapOr(-1)}`);

const notParsed = Some("abc").andThen(s => {
  const num = parseInt(s, 10);
  return isNaN(num) ? None : Some(num); // Return None singleton
}); // None
console.log(`notParsed is None: ${notParsed.isNone()}`);
console.log(`Is notParsed actually None? ${notParsed === None}`); // true


// Matching
const optionNumber = Some(42);
const message = optionNumber.match({
  Some: value => `The number is: ${value}`,
  None: () => "No number provided" // Handler for the None singleton
}); // "The number is: 42"
console.log(message);

const noOptionNumber: Option<number> = None; // Assign the None singleton
const noMessage = noOptionNumber.match({
  Some: value => `The number is: ${value}`,
  None: () => "No number provided"
}); // "No number provided"
console.log(noMessage);

// Direct comparison with None
if (noOptionNumber === None) {
  console.log("noOptionNumber is indeed the None singleton.");
}
```

The `Option` type helps avoid common errors like `TypeError: Cannot read property '...' of null/undefined` by making the absence of a value an explicit state that must be handled. Since `None` is a singleton, you can reliably use `=== None` for checks.

A full API overview for `Option` would be similar to `Result`'s, including methods like:
`isSome`, `isNone`, `isSomeAnd`, `expect`, `unwrap`, `unwrapOr`, `unwrapOrElse`, `map`, `mapOr`, `mapOrElse`, `inspect`, `and`, `andThen` (flatMap), `or`, `orElse`, `xor`, `cloned`, `zip`, `zipWith`, and `match`. Refer to the source code or generated documentation for exhaustive details on each method's behavior and signature. (Note: when using these methods on `None`, they operate on the singleton instance, e.g., `None.map(...)`).

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
