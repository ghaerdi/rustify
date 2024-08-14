import { type Result, Err, Ok } from "../src/result.ts";
import { describe, test, expect } from "bun:test";

const enum MathError {
  DivisionByZero = "Cannot divide by zero"
}

function divide(a: number, b: number): Result<number, MathError> {
  return b === 0 ? Err(MathError.DivisionByZero) : Ok(a / b);
}

describe("unwrapOrElse", () => {
  test("should return the value if it is Ok", () => {
    const result = divide(10, 2).unwrapOrElse(_ => {
      return 0;
    });
    expect(result).toBe(5);
  });
  test("should return the default value if it is Err", () => {
    const result = divide(10, 0).unwrapOrElse(_ => {
      return 0;
    });
    expect(result).toBe(0);
  });
  test("should throw error message if it is Err", () => {
    expect(() => {
      divide(10, 0).unwrapOrElse(_ => {
        throw new Error("Cannot divide by zero");
      });
    }).toThrow(MathError.DivisionByZero);
  });
});
