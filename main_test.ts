import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.205.0/assert/mod.ts";
import { divideResult, divideOption, MathError } from "./main.ts";

Deno.test("Option is Some(5)", () => {
  const result = divideOption(10, 2);
  assert(result.isSome());
  assert(!result.isNone());
  assert(result.isSomeAnd(value => value === 5));
  assertEquals(result.unwrap(), 5);
  assertEquals(result.expect("Expected 5"), 5);
  assertEquals(result.unwrapOr(0), 5);
});

Deno.test("Option is None", () => {
  const result = divideOption(10, 0);
  assert(!result.isSome());
  assert(result.isNone());
  assert(!result.isSomeAnd(value => value === 5));
  assertThrows(result.unwrap);
  assertThrows(() => result.expect("Expected 5"));
  assertEquals(result.unwrapOr(0), 0);
});

Deno.test("Result is Ok(5)", () => {
  const result = divideResult(10, 2);
  assert(result.isOk());
  assertEquals(result.unwrap(), 5);
  assert(result.isOkAnd(value => value === 5));
  assert(!result.isErr());
  assert(!result.isErrAnd(err => err === MathError.DivideByZero));
  assertEquals(result.unwrapOr(0), 5);
  assertEquals(result.expect("Expected 5"), 5);
  assert(result.ok().isSomeAnd(value => value === 5));
  assert(result.err().isNone());
});

Deno.test("Result is Err", () => {
  const result = divideResult(10, 0);
  assert(!result.isOk());
  assertThrows(result.unwrap);
  assert(!result.isOkAnd(value => value === 5));
  assert(result.isErr());
  assert(result.isErrAnd(err => err === MathError.DivideByZero));
  assertThrows(() => result.expect("Expected 5"));
  assertEquals(result.unwrapOr(0), 0);
  assert(result.err().isSomeAnd(err => err === MathError.DivideByZero));
  assert(result.ok().isNone());
})
