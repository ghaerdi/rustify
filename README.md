# rustify

[![npm version](https://img.shields.io/npm/v/@ghaerdi/rustify.svg)](https://www.npmjs.com/package/@ghaerdi/rustify)
[![JSR version](https://jsr.io/badges/@ghaerdi/rustify)](https://jsr.io/@ghaerdi/rustify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript library inspired by Rust, providing `Result` and `Option` types for
safe error handling and null management with functional programming patterns.

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
```

**jsr:**

```bash
npx jsr add @ghaerdi/rustify
```

## Basic Usage

```typescript
import { Err, Ok, Result } from "@ghaerdi/rustify";
import { match } from "@ghaerdi/rustify/match";

function divide(
  numerator: number,
  denominator: number,
): Result<number, string> {
  if (denominator === 0) return Err("Cannot divide by zero");
  return Ok(numerator / denominator);
}

// match() handles both variants exhaustively — the Ok value and the error are
// narrowed to their types, so (v) is number and (e) is string.
const message = match(divide(10, 2))
  .with(Result.ok, (v) => `Result: ${v}`)
  .with(Result.err, (e) => `Error: ${e}`)
  .exhaustive();

console.log(message); // "Result: 5"
```

## Wrapping untrusted functions

Wrap throwing/rejecting code (like `JSON.parse` or an HTTP call) in
`Result.from` / `Result.fromAsync` to turn exceptions into `Err` values:

```typescript
import { match } from "@ghaerdi/rustify/match";
import { Result } from "@ghaerdi/rustify";

// sync — catches any thrown error into Err
const parsed = Result.from(() => JSON.parse('{"x": 1}'));
console.log(
  match(parsed)
    .with(Result.ok, (v) => `parsed: ${JSON.stringify(v)}`) // "parsed: {"x":1}"
    .with(Result.err, (e) => `error: ${e}`)
    .exhaustive(),
);

// async — awaits and catches both sync throws and rejected promises
const body = await Result.fromAsync(async () =>
  (await fetch("/api/user")).json()
);
if (body.isOk()) console.log(body.unwrap());
```

## Documentation

Full API reference, `match()` guide, and worked examples live in the
[**library wiki**](https://github.com/ghaerdi/rustify/wiki):

- [Result](https://github.com/ghaerdi/rustify/wiki/Result) — full `Result<T, E>`
  API.
- [Option](https://github.com/ghaerdi/rustify/wiki/Option) — full `Option<T>`
  API.
- [match](https://github.com/ghaerdi/rustify/wiki/match) — type-safe pattern
  matching.
- [Examples](https://github.com/ghaerdi/rustify/wiki/Examples) — worked
  examples.

## Development

This project uses Deno (>= 2.x). No install step is required — dependencies are
resolved from JSR via the lockfile.

- **Dev Environment (optional):** a `devenv` shell (`devenv.nix`) with git-hooks
  is available — `devenv test` validates the environment (hooks + type check),
  `devenv shell` enters it.

- **Formatting:**

  ```bash
  deno fmt
  ```

- **Linting:**

  ```bash
  deno lint
  ```

- **Type Checking:**

  ```bash
  deno task check
  ```

- **Run Tests:**

  ```bash
  deno test
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
- [Library Wiki](https://github.com/ghaerdi/rustify/wiki)
