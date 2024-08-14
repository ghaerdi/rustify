import { type Result, Err, Ok, ResultWrapper } from "../src/result.ts";
import { describe, test, expect } from "bun:test";

const enum MathError {
  DivisionByZero = "cannot divide by zero",
  UnknownError = "unknown error"
}

function divide(a: number, b: number): Result<number, MathError> {
  return b === 0 ? Err(MathError.DivisionByZero) : Ok(a / b);
}

describe("Result.unwrapOrElse", () => {
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
        throw new Error("cannot divide by zero");
      });
    }).toThrow(MathError.DivisionByZero);
  });
});

describe("Result.unwrapOr", () => {
  test("should return the value if it is Ok", () => {
    expect(divide(10, 2).unwrapOr(0)).toBe(5);
  });

  test("should return the default value if it is Err", () => {
    expect(divide(10, 0).unwrapOr(0)).toBe(0);
  });
});

describe("Result.unwrap", () => {
  test("should return the value if it is Ok", () => {
    expect(divide(10, 2).unwrap()).toBe(5);
  });

  test("should throw error message if it is Err", () => {
    expect(() => {
      divide(10, 0).unwrap();
    }).toThrow(MathError.DivisionByZero);
  });
});

describe("Result.expect", () => {
  test("should return the value if it is Ok", () => {
    const result = divide(10, 2).expect("should divide successfully");
    expect(result).toBe(5);
  });

  test("should throw error message if it is Err", () => {
    expect(() => {
      divide(10, 0).expect("should throw error message");
    }).toThrow("should throw error message");
  });
});

describe("Result.isOk", () => {
  test("should return true if it is Ok", () => {
    expect(divide(10, 2).isOk()).toBeTrue();
  });

  test("should return false if it is Err", () => {
    expect(divide(10, 0).isOk()).toBeFalse();
  });
});

describe("Result.ok", () => {
  test("should return the value if it is Ok", () => {
    expect(divide(10, 2).ok()).toBe(5);
  });

  test("should return undefined if it is Err", () => {
    expect(divide(10, 0).ok()).toBeUndefined();
  });
});

describe("Result.err", () => {
  test("should return the error if it is Err", () => {
    expect(divide(10, 0).err()).toBe(MathError.DivisionByZero);
  });

  test("should return undefined if it is Ok", () => {
    expect(divide(10, 2).err()).toBeUndefined();
  });
});

describe("Result.isErr", () => {
  test("should return true if it is Err", () => {
    expect(divide(10, 0).isErr()).toBeTrue();
  });

  test("should return false if it is Ok", () => {
    expect(divide(10, 2).isErr()).toBeFalse();
  });
});

describe("Result.isOkAnd", () => {
  test("should return false if it is Err", () => {
    expect(divide(10, 0).isOkAnd(result => result === 5)).toBeFalse();
  });

  test("should return true if it is Ok and condition is met", () => {
    expect(divide(10, 2).isOkAnd(result => result === 5)).toBeTrue();
  });

  test("should return false if it is Ok and condition is not met", () => {
    expect(divide(10, 2).isOkAnd(result => result === 10)).toBeFalse();
  });
});

describe("Result.isErrAnd", () => {
  test("should return true if it is Err and condition is met", () => {
    expect(divide(10, 0).isErrAnd(error => error === MathError.DivisionByZero)).toBeTrue();
  });

  test("should return false if it is Err and condition is not met", () => {
    expect(divide(10, 0).isErrAnd(error => error === MathError.UnknownError)).toBeFalse();
  });

  test("should return false if it is Ok", () => {
    expect(divide(10, 2).isErrAnd(error => error === MathError.DivisionByZero)).toBeFalse();
  });
});

describe("ResultWrapper", () => {
  const divide = ResultWrapper<number, MathError>((a: number, b: number) => {
    if (b === 0) {
      throw new Error(MathError.DivisionByZero);
    }
    return a / b;
  });

  test("should return Ok if the function does not throw an error", () => {
    expect(divide(10, 2).isOk()).toBeTrue();
  });

  test("should return Err if the function throws an error", () => {
    expect(divide(10, 0).isErr()).toBeTrue();
  });
});
