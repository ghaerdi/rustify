import { type Result, Ok, Err } from "./result.ts";

const enum MathError {
  DivideByZero = "Cannot divide by zero",
}

export function divide(dividend: number, divisor: number): Result<number, MathError> {
  if (divisor === 0) {
    return Err(MathError.DivideByZero);
  }
  return Ok(dividend / divisor);
}

if (import.meta.main) {
  const result = divide(10, 0).unwrapOrElse(error => {
    // handle error and/or return a default value for result
    console.error(error);
    return 0;
  });
  console.log(result); // 0
}

