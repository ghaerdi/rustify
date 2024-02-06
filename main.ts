import { type Option, Some, None } from "./option.ts";
import { type Result, Ok, Err, ResultWrapper } from "./result.ts";

export const enum MathError {
  DivideByZero = "Cannot divide by zero",
}

export function divideResult(a: number, b: number): Result<number, MathError> {
  if (a === 0 || b === 0) {
    return Err(MathError.DivideByZero);
  }
  return Ok(a / b);
}

export function divideOption(a: number, b: number): Option<number> {
  if (a === 0 || b === 0) {
    return None;
  }
  return Some(a / b);
}

function divide(a: number, b: number): number {
  if (a === 0 || b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}


// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  ResultWrapper(divide)(10, 0).expect("Result of divive"); // error: Uncaught Error: Result of divive: Error: Cannot divide by zero
  ResultWrapper(divide)(10, 2).expect("Result of divive"); // 5
}

