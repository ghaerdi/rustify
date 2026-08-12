---
name: "rust-parity-tests"
description: "Add Rust standard library parity tests for the Option and Result monads in this repo. Use whenever adding or extending Option/Result methods, when the user asks to match Rust std behavior (\"what does Rust test here?\", \"add the Rust test cases\"), or when verifying a method's semantics match Rust (lazy evaluation, error message content, chaining examples)."
version: 2
created: "2026-08-10"
updated: "2026-08-12"
---

## When to Use
Trigger when working on test/option.test.ts or test/result.test.ts and the goal is Rust-behavior parity; when the user asks what cases Rust std tests for a method, or asks to add Rust's test cases; when adding a new Option/Result method that mirrors a Rust std method.

## Procedure
1. Run the existing tests (deno test) or grep test names in test/option.test.ts and test/result.test.ts to establish baseline coverage per method.
2. Fetch the Rust std docs for the methods: https://doc.rust-lang.org/std/option/enum.Option.html and https://doc.rust-lang.org/std/result/enum.Result.html. Extract the doctest examples from each method's '## Examples' sections.
3. For each method in the library, map the Rust doctests to TS tests covering: (a) both variants (Some/None, Ok/Err); (b) lazy vs eager evaluation (call counter proving a closure is NOT invoked when the value is present); (c) exact error-message content for panicking methods; (d) chaining examples from Rust docs (sq_then_to_string, or_else chains, double flatten); (e) type-changing examples (map string -> length).
4. Add tests to the matching describe blocks, or group them in a 'Rust std parity' describe block at the end of the file, following the existing naming style (e.g. 'car/bike example', 'sq_then_to_string overflow example').
5. Use explicit type annotations on Result/Option variables when closures need concrete E/T types to avoid never-type inference issues.
6. Run deno task check and deno test; verify all tests pass and the count increased.

## Pitfalls
- Some Rust Option methods don't exist in this library (insert, replace, get_or_insert_default, is_none_or) — ask the user whether to implement the method or skip the tests before adding parity cases.
- Rust's take_if takes the predicate a MUTABLE reference and allows mutating the value inside it; this repo's takeIf passes the value by value, so mutation-in-predicate cases cannot be replicated.
- never-type issues: Ok(2) has type Ok<number, never>; when the closure needs a concrete error type, annotate explicitly, e.g. `const x: Result<number, string> = Ok(2);`. Same for Some()/None() with empty generics.
- Rust's iter() returns Option<&T> (Some(&4) or None); this repo uses [Symbol.iterator] yielding the raw value (or nothing). Assert accordingly ([...Some(4)] === [4], not Some(4)).
- Rust unwrap_or/unwrap_or_else are lazy vs eager — test that closures are NOT called when the value is present using a call counter, not just that the return value is right.
- Error message content matters: Rust panics with specific messages. Assert the exact thrown message (e.g. 'Tried to unwrap a None value', or `${message}: ${value}` for expect/expectErr) rather than just that it throws.
- Do not duplicate existing coverage: list the existing test names first (grep -n "test(" test/option.test.ts test/result.test.ts — Deno has no `test --list`; use `deno test --filter <name>` to target a single method) and only add what's missing.

## Verification
1. deno task check passes (zero TypeScript errors).
2. deno test passes with the new tests included (verify the new test names appear in output).
3. Every library method now has Rust-parity coverage for both variants, laziness, and error messages where applicable.
