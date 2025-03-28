import { type Result, Err, Ok, wrapInResult } from "../src/result.ts";
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
        throw new Error(MathError.DivisionByZero);
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

describe("Result.map", () => {
  test("should apply the function to the value if it is Ok", () => {
    const result = divide(10, 2).map(x => x * 2);
    expect(result.unwrap()).toBe(10);
  });

  test("should not apply the function if it is Err", () => {
    const result = divide(10, 0).map(x => x * 2);
    expect(result.isErr()).toBe(true);
    expect(result.err()).toBe(MathError.DivisionByZero);
  });
});

describe("Result.mapOr", () => {
  test("should apply the function to the value if it is Ok", () => {
    const result = divide(10, 2).mapOr(0, x => x * 2);
    expect(result).toBe(10);
  });

  test("should return the default value if it is Err", () => {
    const result = divide(10, 0).mapOr(0, x => x * 2);
    expect(result).toBe(0);
  });
});

describe("Result.mapOrElse", () => {
  test("should apply the function to the value if it is Ok", () => {
    const result = divide(10, 2).mapOrElse(() => 0, x => x * 2);
    expect(result).toBe(10);
  });

  test("should apply the default function if it is Err", () => {
    const result = divide(10, 0).mapOrElse(() => 0, x => x * 2);
    expect(result).toBe(0);
  });
});

describe("Result.mapErr", () => {
  test("should apply the function to the error if it is Err", () => {
    const result = divide(10, 0).mapErr(e => `Error: ${e}`);
    expect(result.err()).toBe("Error: cannot divide by zero");
  });

  test("should not apply the function if it is Ok", () => {
    const result = divide(10, 2).mapErr(e => `Error: ${e}`);
    expect(result.unwrap()).toBe(5);
  });
});

describe("Result.inspect", () => {
  test("should call the function with the value if it is Ok", () => {
    let inspectedValue: number | undefined;
    const result = divide(10, 2).inspect(x => {
      inspectedValue = x;
    });
    expect(inspectedValue).toBe(5);
    expect(result.unwrap()).toBe(5);
  });

  test("should not call the function if it is Err", () => {
    let inspectedValue: number | undefined;
    const result = divide(10, 0).inspect(x => {
      inspectedValue = x;
    });
    expect(inspectedValue).toBeUndefined();
    expect(result.isErr()).toBe(true);
  });
});

describe("Result.inspectErr", () => {
  test("should call the function with the error if it is Err", () => {
    let inspectedError: MathError | undefined;
    const result = divide(10, 0).inspectErr(e => {
      inspectedError = e;
    });
    expect(inspectedError).toBe(MathError.DivisionByZero);
    expect(result.isErr()).toBe(true);
  });

  test("should not call the function if it is Ok", () => {
    let inspectedError: MathError | undefined;
    const result = divide(10, 2).inspectErr(e => {
      inspectedError = e;
    });
    expect(inspectedError).toBeUndefined();
    expect(result.unwrap()).toBe(5);
  });
});

describe("Result.and", () => {
  test("should return the other Result if it is Ok", () => {
    const result = divide(10, 2).and(Ok("hello"));
    expect(result.unwrap()).toBe("hello");
  });

  test("should return the Err if it is Err", () => {
    const result = divide(10, 0).and(Ok("hello"));
    expect(result.isErr()).toBe(true);
    expect(result.err()).toBe(MathError.DivisionByZero);
  });

  test("should return the Err if the other Result is Err", () => {
    const result = divide(10, 2).and(Err(MathError.UnknownError));
    expect(result.isErr()).toBe(true);
    expect(result.err()).toBe(MathError.UnknownError);
  });
});

describe("Result.andThen", () => {
  test("should call the function and return the result if it is Ok", () => {
    const result = divide(10, 2).andThen(x => Ok(x.toString()));
    expect(result.unwrap()).toBe("5");
  });

  test("should not call the function and return the Err if it is Err", () => {
    const result = divide(10, 0).andThen(x => Ok(x.toString()));
    expect(result.isErr()).toBe(true);
    expect(result.err()).toBe(MathError.DivisionByZero);
  });

  test("should return Err if the function returns Err", () => {
    const result = divide(10, 2).andThen(_ => Err(MathError.UnknownError));
    expect(result.isErr()).toBe(true);
    expect(result.err()).toBe(MathError.UnknownError);
  });
});

describe("Result.or", () => {
  test("should return the Ok if it is Ok", () => {
    const result = divide(10, 2).or(Ok(0));
    expect(result.unwrap()).toBe(5);
  });

  test("should return the Ok if it is Err and the other is Ok", () => {
    const result = divide(10, 0).or(Ok(0));
    expect(result.unwrap()).toBe(0);
  });

  test("should return the Err if both are Err", () => {
    const result = divide(10, 0).or(Err("other error"));
    expect(result.isErr()).toBe(true);
    expect(result.err()).toBe("other error");
  });
});

describe("Result.orElse", () => {
  test("should return the Ok if it is Ok", () => {
    const result = divide(10, 2).orElse(() => Ok(0));
    expect(result.unwrap()).toBe(5);
  });

  test("should call the function and return the result if it is Err", () => {
    const result = divide(10, 0).orElse(() => Ok(0));
    expect(result.unwrap()).toBe(0);
  });

  test("should return Err if the function returns Err", () => {
    const result = divide(10, 0).orElse(() => Err("other error"));
    expect(result.isErr()).toBe(true);
    expect(result.err()).toBe("other error");
  });
});

describe("Result.expectErr", () => {
  test("should return the error if it is Err", () => {
    expect(divide(10, 0).expectErr("should throw error message")).toBe(MathError.DivisionByZero);
  });

  test("should throw if it is Ok", () => {
    expect(() => {
      divide(10, 2).expectErr("should throw error message");
    }).toThrow();
  });
});

describe("Result.unwrapErr", () => {
  test("should return the error if it is Err", () => {
    expect(divide(10, 0).unwrapErr()).toBe(MathError.DivisionByZero);
  });

  test("should throw if it is Ok", () => {
    expect(() => {
      divide(10, 2).unwrapErr();
    }).toThrow();
  });
});

describe("Result.cloned", () => {
  test("should clone the Ok value (primitive)", () => {
    const result = Ok(5).cloned();
    expect(result.unwrap()).toBe(5);
  });

  test("should clone the Ok value (object)", () => {
    const original = { a: 1, b: "hello" };
    const result = Ok(original).cloned();
    const cloned = result.unwrap();
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });

  test("should not clone the Err value", () => {
    const result: Result<number, string> = Err("error").cloned();
    expect(result.err()).toBe("error");
  });
});

describe("Result [Symbol.iterator]", () => {
  test("should iterate over Ok value if it is iterable (Array)", () => {
    const result = Ok([1, 2, 3]);
    const iterated = [...result];
    expect(iterated).toEqual([1, 2, 3]);
  });

  test("should iterate over Ok value if it is iterable (String)", () => {
    const result = Ok("abc");
    const iterated = [...result];
    expect(iterated).toEqual(['a', 'b', 'c']);
  });

  test("should yield nothing if Ok value is not iterable (number)", () => {
    const result = Ok(123);
    const iterated = [...result];
    expect(iterated).toEqual([]);
  });

  test("should yield nothing if Ok value is not iterable (object)", () => {
    const result = Ok({ a: 1 });
    const iterated = [...result];
    expect(iterated).toEqual([]);
  });

  test("should yield nothing if it is Err", () => {
    const result: Result<number[], string> = Err("error");
    const iterated = [...result];
    expect(iterated).toEqual([]);
  });
});

describe("wrapInResult", () => {
  const divide = (a: number, b: number) => {
    if (b === 0) {
      throw new Error(MathError.DivisionByZero);
    }
    return a / b;
  }
  const safeDivide = wrapInResult<number, MathError>(divide);

  test("should return Ok with the function's result if the function does not throw an error", () => {
    const result = safeDivide(10, 2);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(5);
  });

  test("should return Err with the thrown error message if the function throws an error", () => {
    const result = safeDivide(10, 0);
    expect(result.isErr()).toBe(true);
    expect(result.err()).toBe(MathError.DivisionByZero);
  });

  test("should return Err with a transformed error if errorTransform is provided", () => {
    const divideWithTransform = wrapInResult<number, { message: string; code: number }>(
      divide,
      (error) => {
        if (error instanceof Error) {
          return { message: error.message, code: 500 }
        }
        return { message: String(error), code: 500 };
      }
    );

    const result = divideWithTransform(10, 0);
    expect(result.isErr()).toBe(true);
    expect(result.err()).toEqual({ message: MathError.DivisionByZero, code: 500 });
  });

  test("should handle non-Error throws", () => {
    const throwString = wrapInResult<string, string>(() => {
      throw "This is a string error";
    });
    const result = throwString();
    expect(result.isErr()).toBe(true);
    expect(result.err()).toBe("This is a string error");
  });
});
