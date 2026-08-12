/**
 * @module rustify
 *
 * A TypeScript library that brings Rust-style algebraic types to JavaScript.
 *
 * Provides two core types inspired by Rust's standard library:
 *
 * - **{@link Option}** — Represents an optional value (`Some` or `None`).
 *   Use it to handle missing values without `null` or `undefined`.
 *
 * - **{@link Result}** — Represents a value that may be a success (`Ok`) or failure (`Err`).
 *   Use it for error handling without exceptions.
 *
 * Both types support functional combinators (`map`, `andThen`, `orElse`, etc.),
 * pattern matching via `match()`, and full iterator protocol support.
 *
 * @example
 * ```typescript
 * import { Some, None, Ok, Err } from "@ghaerdi/rustify";
 *
 * // Option
 * const name: Option<string> = Some("Alice");
 * name.map(n => n.toUpperCase()).unwrap(); // "ALICE"
 *
 * // Result
 * const parsed: Result<number, string> = Ok(42);
 * parsed.map(n => n * 2).unwrap(); // 84
 * ```
 */
export * from "./result/index.ts";
export * from "./option/index.ts";
export * from "./match/index.ts";
