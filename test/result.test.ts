import { Err, Ok, Result } from "../src/result/index.ts";
import { None, Some } from "../src/option/index.ts";
import { describe, test } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";

describe("Result", () => {
  describe("Ok", () => {
    const value = "success";
    const okResult: Result<string, string> = Ok(value);

    test("isOk should return true", () => {
      expect(okResult.isOk()).toBe(true);
    });

    test("isErr should return false", () => {
      expect(okResult.isErr()).toBe(false);
    });

    test("ok should return Some with the value", () => {
      const okValue = okResult.ok();
      expect(okValue.isSome()).toBe(true);
      expect(okValue.unwrap()).toBe(value);
    });

    test("err should return None", () => {
      const errValue = okResult.err();
      expect(errValue.isNone()).toBe(true);
      expect(errValue.isNone()).toBe(true);
    });

    test("unwrap should return the value", () => {
      expect(okResult.unwrap()).toBe(value);
    });

    test("unwrapErr should throw", () => {
      expect(() => okResult.unwrapErr()).toThrow(/^Tried to unwrap Ok value:/);
    });

    test("unwrapOr should return the value", () => {
      expect(okResult.unwrapOr("default")).toBe(value);
    });

    test("map should apply function and wrap result in Ok", () => {
      const mapped = okResult.map((val) => val.length);
      expect(mapped.isOk()).toBe(true);
      expect(mapped.unwrap()).toBe(value.length);
    });

    test("mapErr should not apply function and return self", () => {
      const mapErrFn = spy((_err: string) => `Error: ${_err}`);
      const mappedErr = okResult.mapErr(mapErrFn);
      expect(mappedErr.isOk()).toBe(true);
      expect(mappedErr.unwrap()).toBe(value);
      assertSpyCalls(mapErrFn, 0);
    });

    test("andThen should apply function returning Result", () => {
      const andThenFn = spy((val: string) => Ok(val.length));
      const andThenResult = okResult.andThen(andThenFn);
      expect(andThenResult.isOk()).toBe(true);
      expect(andThenResult.unwrap()).toBe(value.length);
      assertSpyCall(andThenFn, 0, { args: [value] });
    });

    test("orElse should not apply function and return self", () => {
      const orElseFn = spy((err: string) => Err(`Error: ${err}`));
      const orElseResult = okResult.orElse(orElseFn);
      expect(orElseResult.isOk()).toBe(true);
      expect(orElseResult.unwrap()).toBe(value);
      assertSpyCalls(orElseFn, 0);
    });

    test("isOkAnd should return true if predicate matches", () => {
      expect(okResult.isOkAnd((v) => v === value)).toBe(true);
    });

    test("isOkAnd should return false if predicate does not match", () => {
      expect(okResult.isOkAnd((v) => v === "different")).toBe(false);
    });

    test("isErrAnd should return false", () => {
      expect(okResult.isErrAnd((_) => true)).toBe(false);
    });

    test("mapOr should apply function and return the result", () => {
      const mapOrFn = spy((val: string) => val.length);
      expect(okResult.mapOr(0, mapOrFn)).toBe(value.length);
      assertSpyCall(mapOrFn, 0, { args: [value] });
    });

    test("mapOrElse should apply ok function and return the result", () => {
      const okFn = spy((val: string) => val.length);
      const errFn = spy((_err: string) => 0);
      expect(okResult.mapOrElse(errFn, okFn)).toBe(value.length);
      assertSpyCall(okFn, 0, { args: [value] });
      assertSpyCalls(errFn, 0);
    });

    test("inspect should call function and return self", () => {
      const inspectFn = spy((_v: string) => {});
      const result = okResult.inspect(inspectFn);
      expect(result).toBe(okResult);
      assertSpyCall(inspectFn, 0, { args: [value] });
    });

    test("inspectErr should not call function and return self", () => {
      const inspectErrFn = spy((_e: string) => {});
      const result = okResult.inspectErr(inspectErrFn);
      expect(result).toBe(okResult);
      assertSpyCalls(inspectErrFn, 0);
    });

    test("expect should return the value", () => {
      expect(okResult.expect("should be Ok")).toBe(value);
    });

    test("expectErr should throw with message", () => {
      const message = "Value was Ok";
      expect(() => okResult.expectErr(message)).toThrow(`${message}: ${value}`);
    });

    test("unwrapOrElse should return the value", () => {
      const elseFn = spy((_err: string) => "default");
      expect(okResult.unwrapOrElse(elseFn)).toBe(value);
      assertSpyCalls(elseFn, 0);
    });

    test("and should return the other result if Ok", () => {
      const compatibleAndOk: Result<number, string> = Ok(99);
      const compatibleAndErr: Result<number, string> = Err("compatible error");
      expect(okResult.and(compatibleAndOk).unwrap()).toBe(99);
      expect(okResult.and(compatibleAndErr).err().unwrap()).toBe(
        "compatible error",
      );
    });

    test("or should return self if Ok", () => {
      expect(okResult.or(Ok("another success")).unwrap()).toBe(value);
      expect(okResult.or(Err(404)).unwrap()).toBe(value);
    });

    test("cloned should return a new Ok with a cloned value (object)", () => {
      const obj = { a: 1, b: { c: 2 } };
      const okObj = Ok(obj);
      const cloned = okObj.cloned();
      expect(cloned.isOk()).toBe(true);
      const unwrapped = cloned.unwrap();
      expect(unwrapped).toEqual(obj);
      expect(unwrapped).not.toBe(obj);
      expect(unwrapped.b).not.toBe(obj.b);
    });

    test("cloned should return a new Ok with the same value (primitive)", () => {
      const okPrimitive = Ok(123);
      const cloned = okPrimitive.cloned();
      expect(cloned.isOk()).toBe(true);
      expect(cloned.unwrap()).toBe(123);
    });

    test("asTuple should return [undefined, value]", () => {
      const [err, val] = okResult.asTuple();
      expect(err).toBeUndefined();
      expect(val).toBe(value);
    });

    test("asObject should return { error: undefined, value: value }", () => {
      const { error, value: val } = okResult.asObject();
      expect(error).toBeUndefined();
      expect(val).toBe(value);
    });

    describe("match", () => {
      const okValue = 100;
      const okResultInstance: Result<number, string> = Ok(okValue);

      test("should execute the Ok handler", () => {
        const okHandler = spy((v: number) => `Ok value: ${v}`);
        const errHandler = spy((e: string) => `Err value: ${e}`);

        const matchResult = okResultInstance.match({
          Ok: okHandler,
          Err: errHandler,
        });

        expect(matchResult).toBe(`Ok value: ${okValue}`);
        assertSpyCalls(okHandler, 1);
        assertSpyCall(okHandler, 0, { args: [okValue] });
        assertSpyCalls(errHandler, 0);
      });

      test("should return the correct type from the Ok handler", () => {
        const result = Ok(5).match({
          Ok: (v) => v * 2,
          Err: (e: string) => e.length,
        });
        expect(result).toBe(10);
      });

      test("should work with different Ok types", () => {
        const complexOk: Result<{ id: number }, boolean> = Ok({ id: 123 });

        const matchOk = complexOk.match({
          Ok: (data) => `ID: ${data.id}`,
          Err: (flag) => `Flag: ${flag}`,
        });
        expect(matchOk).toBe("ID: 123");
      });
    });

    describe("Iterator", () => {
      test("should yield values if Ok value is iterable (Array)", () => {
        const iterableValue = [1, 2, 3];
        const okIterable = Ok(iterableValue);
        const yielded = [...okIterable];
        expect(yielded).toEqual(iterableValue);
      });

      test("should yield values if Ok value is iterable (String)", () => {
        const result = Ok("abc");
        const iterated = [...result];
        expect(iterated).toEqual(["a", "b", "c"]);
      });

      test("should yield values if Ok value is iterable (Set)", () => {
        const setData = [1, 2, 3];
        const result = Ok(new Set(setData));
        const iterated = [...result];
        expect(iterated).toEqual(setData);
      });

      test("should yield key-value pairs if Ok value is iterable (Map)", () => {
        const mapData: [string, number][] = [
          ["a", 1],
          ["b", 2],
        ];
        const result = Ok(new Map(mapData));
        const iterated = [...result];
        expect(iterated).toEqual(mapData);
      });

      test("should yield nothing if Ok value is not iterable (Number)", () => {
        const result = Ok(123);
        const iterated = [...result];
        expect(iterated).toEqual([]);
      });

      test("should yield nothing if Ok value is not iterable (Object)", () => {
        const okNonIterable = Ok({ a: 1 });
        const yielded = [...okNonIterable];
        expect(yielded).toEqual([]);
      });

      test("should yield nothing if Ok value is null or undefined", () => {
        const okNull = Ok(null);
        const okUndefined = Ok(undefined);
        expect([...okNull]).toEqual([]);
        expect([...okUndefined]).toEqual([]);
      });
    });
  });

  describe("Err", () => {
    const error = "error message";
    const errResult: Result<string, string> = Err(error);

    test("isOk should return false", () => {
      expect(errResult.isOk()).toBe(false);
    });

    test("isErr should return true", () => {
      expect(errResult.isErr()).toBe(true);
    });

    test("ok should return None", () => {
      const okValue = errResult.ok();
      expect(okValue.isNone()).toBe(true);
      expect(okValue.isNone()).toBe(true);
    });

    test("err should return Some with the error", () => {
      const errValue = errResult.err();
      expect(errValue.isSome()).toBe(true);
      expect(errValue.unwrap()).toBe(error);
    });

    test("unwrap should throw", () => {
      expect(() => errResult.unwrap()).toThrow(/^Tried to unwrap Error:/);
    });

    test("unwrapErr should return the error", () => {
      expect(errResult.unwrapErr()).toBe(error);
    });

    test("unwrapOr should return the default value", () => {
      expect(errResult.unwrapOr("default")).toBe("default");
    });

    test("map should not apply function and return self", () => {
      const mapFn = spy((val: string) => val.length);
      const mapped = errResult.map(mapFn);
      expect(mapped.isErr()).toBe(true);
      expect(mapped.err().unwrap()).toBe(error);
      assertSpyCalls(mapFn, 0);
    });

    test("mapErr should apply function and wrap result in Err", () => {
      const mapErrFn = spy((err: string) => `Error: ${err}`);
      const mappedErr = errResult.mapErr(mapErrFn);
      expect(mappedErr.isErr()).toBe(true);
      const expectedError = `Error: ${error}`;
      expect(mappedErr.unwrapErr()).toBe(expectedError);
      assertSpyCall(mapErrFn, 0, { args: [error] });
    });

    test("andThen should not apply function and return self", () => {
      const andThenFn = spy((val: string) => Ok(val.length));
      const andThenResult = errResult.andThen(andThenFn);
      expect(andThenResult.isErr()).toBe(true);
      expect(andThenResult.err().unwrap()).toBe(error);
      assertSpyCalls(andThenFn, 0);
    });

    test("orElse should apply function returning Result", () => {
      const orElseFn = spy((err: string) => Ok(`Recovered from ${err}`));
      const orElseResult = errResult.orElse(orElseFn);
      const expectedValue = `Recovered from ${error}`;
      expect(orElseResult.isOk()).toBe(true);
      expect(orElseResult.unwrap()).toBe(expectedValue);
      assertSpyCall(orElseFn, 0, { args: [error] });
    });

    test("isOkAnd should return false", () => {
      expect(errResult.isOkAnd((_) => true)).toBe(false);
    });

    test("isErrAnd should return true if predicate matches", () => {
      expect(errResult.isErrAnd((e) => e === error)).toBe(true);
    });

    test("isErrAnd should return false if predicate does not match", () => {
      expect(errResult.isErrAnd((e) => e === "different")).toBe(false);
    });

    test("mapOr should return the default value", () => {
      const mapFn = spy((val: string) => val.length);
      const defaultValue = 99;
      expect(errResult.mapOr(defaultValue, mapFn)).toBe(defaultValue);
      assertSpyCalls(mapFn, 0);
    });

    test("mapOrElse should apply error function and return the result", () => {
      const okFn = spy((val: string) => `Success length: ${val.length}`);
      const errFn = spy((err: string) => `Error was: ${err}`);
      const expected = `Error was: ${error}`;
      expect(errResult.mapOrElse(errFn, okFn)).toBe(expected);
      assertSpyCall(errFn, 0, { args: [error] });
      assertSpyCalls(okFn, 0);
    });

    test("inspect should not call function and return self", () => {
      const inspectFn = spy((_v: string) => {});
      const result = errResult.inspect(inspectFn);
      expect(result).toBe(errResult);
      assertSpyCalls(inspectFn, 0);
    });

    test("inspectErr should call function and return self", () => {
      const inspectErrFn = spy((_e: string) => {});
      const result = errResult.inspectErr(inspectErrFn);
      expect(result).toBe(errResult);
      assertSpyCall(inspectErrFn, 0, { args: [error] });
    });

    test("expect should throw with message", () => {
      const message = "Value was an error";
      expect(() => errResult.expect(message)).toThrow(
        new RegExp(`^${message}: ${error}`),
      );
    });

    test("expectErr should return the error", () => {
      expect(errResult.expectErr("should be Err")).toBe(error);
    });

    test("unwrapOrElse should call function and return its result", () => {
      const elseFn = spy((err: string) => `Computed default: ${err.length}`);
      const expected = `Computed default: ${error.length}`;
      expect(errResult.unwrapOrElse(elseFn)).toBe(expected);
      assertSpyCall(elseFn, 0, { args: [error] });
    });

    test("and should return self if Err", () => {
      expect(errResult.and(Ok(99)).err().unwrap()).toBe(error);
      expect(errResult.and(Err("another error")).err().unwrap()).toBe(error);
    });

    test("or should return the other result if Err", () => {
      const compatibleOrOk: Result<string, number> = Ok("fallback success");
      const compatibleOrErr: Result<string, number> = Err(500);
      expect(errResult.or(compatibleOrOk).unwrap()).toBe("fallback success");
      expect(errResult.or(compatibleOrErr).err().unwrap()).toBe(500);
    });

    test("cloned should return self (Err is not cloned)", () => {
      const errObj = Err({ code: 500, msg: "server error" });
      const cloned = errObj.cloned();
      expect(cloned.isErr()).toBe(true);
      expect(cloned.err().unwrap()).toBe(errObj.err().unwrap());
      expect(cloned).toBe(errObj);
    });

    test("asTuple should return [error, undefined]", () => {
      const [err, val] = errResult.asTuple();
      expect(err).toBe(error);
      expect(val).toBeUndefined();
    });

    test("asObject should return { error: error, value: undefined }", () => {
      const { error: err, value } = errResult.asObject();
      expect(err).toBe(error);
      expect(value).toBeUndefined();
    });

    describe("match", () => {
      const errValue = "failure";
      const errResultInstance: Result<number, string> = Err(errValue);

      test("should execute the Err handler", () => {
        const okHandler = spy((v: number) => `Ok value: ${v}`);
        const errHandler = spy((e: string) => `Err value: ${e}`);

        const matchResult = errResultInstance.match({
          Ok: okHandler,
          Err: errHandler,
        });

        expect(matchResult).toBe(`Err value: ${errValue}`);
        assertSpyCalls(errHandler, 1);
        assertSpyCall(errHandler, 0, { args: [errValue] });
        assertSpyCalls(okHandler, 0);
      });

      test("should return the correct type from the Err handler", () => {
        const result = Err("error").match({
          Ok: (_v: number) => "was ok",
          Err: (_e: string) => false,
        });
        expect(result).toBe(false);
      });

      test("should work with different Err types", () => {
        const complexErr: Result<{ id: number }, boolean> = Err(true);

        const matchErr = complexErr.match({
          Ok: (data) => `ID: ${data.id}`,
          Err: (flag) => `Flag is ${flag}`,
        });
        expect(matchErr).toBe("Flag is true");
      });
    });

    describe("Iterator", () => {
      test("should yield nothing if Err", () => {
        const yielded = [...errResult];
        expect(yielded).toEqual([]);
      });
    });
  });

  describe("Result.isResult", () => {
    test("should return true for Ok", () => {
      expect(Result.isResult(Ok(1))).toBe(true);
    });

    test("should return true for Err", () => {
      expect(Result.isResult(Err("error"))).toBe(true);
    });

    test("should return false for plain object", () => {
      expect(Result.isResult({ isOk: true })).toBe(false);
    });

    test("should return false for null", () => {
      expect(Result.isResult(null)).toBe(false);
    });

    test("should return false for undefined", () => {
      expect(Result.isResult(undefined)).toBe(false);
    });

    test("should return false for primitive number", () => {
      expect(Result.isResult(123)).toBe(false);
    });

    test("should return false for primitive string", () => {
      expect(Result.isResult("hello")).toBe(false);
    });
  });

  describe("Result.from", () => {
    test("should return Ok with the result for a function that returns a value", () => {
      const result = Result.from(() => 5);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(5);
    });

    test("should return Err with the error message for a function that throws an Error", () => {
      const errMsg = "Something went wrong";
      const result = Result.from(() => {
        throw new Error(errMsg);
      });
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(errMsg);
    });

    test("should return Err with the thrown value if it is not an Error", () => {
      const errValue = "just a string error";
      const result = Result.from(() => {
        throw errValue;
      });
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(errValue);
    });

    test("should use errorTransform function if provided", () => {
      const transform = spy((err: unknown) => ({
        message: `Transformed: ${
          err instanceof Error ? err.message : String(err)
        }`,
        code: 500,
      }));
      const result = Result.from(() => {
        throw new Error("Original error");
      }, transform);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toEqual({
        message: "Transformed: Original error",
        code: 500,
      });
      assertSpyCalls(transform, 1);
    });

    test("should return existing Ok if function returns Ok", () => {
      const innerOk = Ok(10);
      const result = Result.from(() => innerOk);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(10);
      expect(result).toBe(innerOk);
    });

    test("should return existing Err if function returns Err", () => {
      const innerErr = Err("Inner error");
      const result = Result.from(() => innerErr);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("Inner error");
      expect(result).toBe(innerErr);
    });
  });

  describe("Result.fromAsync", () => {
    test("should return Ok with the resolved value for a promise that resolves", async () => {
      const result = await Result.fromAsync(async () => 5);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(5);
    });

    test("should return Err with the error message for a promise that rejects with an Error", async () => {
      const errMsg = "Async went wrong";
      const result = await Result.fromAsync(async () => {
        throw new Error(errMsg);
      });
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(errMsg);
    });

    test("should return Err with the rejection value if it is not an Error", async () => {
      const errValue = "just an async string error";
      const result = await Result.fromAsync(async () => {
        throw errValue;
      });
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(errValue);
    });

    test("should use errorTransform function if provided for rejection", async () => {
      const transform = spy((err: unknown) => ({
        message: `Async Transformed: ${
          err instanceof Error ? err.message : String(err)
        }`,
        code: 503,
      }));
      const result = await Result.fromAsync(async () => {
        throw new Error("Async Original error");
      }, transform);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toEqual({
        message: "Async Transformed: Async Original error",
        code: 503,
      });
      assertSpyCalls(transform, 1);
    });

    test("should return existing Ok if promise resolves with Ok", async () => {
      const innerOk = Ok(20);
      const result = await Result.fromAsync(async () => innerOk);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(20);
      expect(result).toBe(innerOk);
    });

    test("should return existing Err if promise resolves with Err", async () => {
      const innerErr = Err("Async Inner error");
      const result = await Result.fromAsync(async () => innerErr);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("Async Inner error");
      expect(result).toBe(innerErr);
    });

    test("should return Err if the async function throws synchronously", async () => {
      const errMsg = "Sync throw in async function";
      const result = await Result.fromAsync(() => {
        throw new Error(errMsg);
      });
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(errMsg);
    });
  });

  // Tests for new missing methods
  describe("flatten", () => {
    describe("Ok variant", () => {
      test("Ok(Ok(value)).flatten() should return Ok(value)", () => {
        const nested = Ok(Ok(5));
        const flattened = nested.flatten();
        expect(flattened.isOk()).toBe(true);
        expect(flattened.unwrap()).toBe(5);
      });
      test("Ok(Err(error)).flatten() should return Err(error)", () => {
        const nested = Ok(Err("inner error"));
        const flattened = nested.flatten();
        expect(flattened.isErr()).toBe(true);
        expect(flattened.unwrapErr()).toBe("inner error");
      });
    });
    describe("Err variant", () => {
      test("Err(error).flatten() should return Err(error)", () => {
        const nested = Err("outer error");
        const flattened = nested.flatten();
        expect(flattened.isErr()).toBe(true);
        expect(flattened.unwrapErr()).toBe("outer error");
      });
    });
  });

  describe("transpose", () => {
    describe("Ok variant", () => {
      test("Ok(Some(value)).transpose() should return Some(Ok(value))", () => {
        const result = Ok(Some(5));
        const transposed = result.transpose();
        expect(transposed.isSome()).toBe(true);
        expect(transposed.unwrap().isOk()).toBe(true);
        expect(transposed.unwrap().unwrap()).toBe(5);
      });
      test("Ok(None).transpose() should return None", () => {
        const result = Ok(None());
        const transposed = result.transpose();
        expect(transposed.isNone()).toBe(true);
        expect(transposed.isNone()).toBe(true);
      });
    });
    describe("Err variant", () => {
      test("Err(error).transpose() should return Some(Err(error))", () => {
        const result = Err("error");
        const transposed = result.transpose();
        expect(transposed.isSome()).toBe(true);
        expect(transposed.unwrap().isErr()).toBe(true);
        expect(transposed.unwrap().unwrapErr()).toBe("error");
      });
    });
  });

  describe("unwrapOrDefault", () => {
    describe("Ok variant", () => {
      test("Ok(value).unwrapOrDefault() should return value", () => {
        const result = Ok(5);
        const value = result.unwrapOrDefault();
        expect(value).toBe(5);
      });
    });
    describe("Err variant", () => {
      test("Err(error).unwrapOrDefault() should throw error (no Default trait in TypeScript)", () => {
        const result = Err("error");
        expect(() => result.unwrapOrDefault()).toThrow(
          "Cannot unwrap Err to default value. TypeScript doesn't have a Default trait. Use unwrapOr(defaultValue) instead.",
        );
      });
    });
  });

  describe("mapOrDefault", () => {
    describe("Ok variant", () => {
      test("Ok(value).mapOrDefault(default, fn) should return fn(value)", () => {
        const result = Ok(5);
        const mapped = result.mapOrDefault(0, (x) => x * 2);
        expect(mapped).toBe(10);
      });
    });
    describe("Err variant", () => {
      test("Err(error).mapOrDefault(default, fn) should return default", () => {
        const result = Err("error");
        const mapped = result.mapOrDefault(0, (x: number) => x * 2);
        expect(mapped).toBe(0);
      });
    });
  });

  describe("contains", () => {
    test("Ok(value).contains(value) should return true", () => {
      expect(Ok(5).contains(5)).toBe(true);
    });
    test("Ok(value).contains(differentValue) should return false", () => {
      expect(Ok(5).contains(10)).toBe(false);
    });
    test("Err(error).contains(value) should return false", () => {
      expect(Err("error").contains(5)).toBe(false);
    });
  });

  describe("iter", () => {
    describe("Ok variant", () => {
      test("Ok(value).iter() should yield the value once", () => {
        const result = Ok(5);
        const iter = result.iter();
        const values = [...iter];
        expect(values).toEqual([5]);
      });
    });
    describe("Err variant", () => {
      test("Err(error).iter() should yield nothing", () => {
        const result = Err("error");
        const iter = result.iter();
        const values = [...iter];
        expect(values).toEqual([]);
      });
    });
  });

  describe("Rust std parity", () => {
    describe("unwrapOrElse", () => {
      test("passes the error to the closure (count example)", () => {
        const count = (x: string) => x.length;
        const ok: Result<number, string> = Ok(2);
        const err: Result<number, string> = Err("foo");
        expect(ok.unwrapOrElse(count)).toBe(2);
        expect(err.unwrapOrElse(count)).toBe(3);
      });
    });

    describe("mapErr", () => {
      test("transforms the error type (stringify example)", () => {
        const stringify = (x: number) => `error code: ${x}`;
        const ok: Result<number, number> = Ok(2);
        const err: Result<number, number> = Err(13);
        expect(ok.mapErr(stringify).unwrap()).toBe(2);
        expect(err.mapErr(stringify).unwrapErr()).toBe("error code: 13");
      });
    });

    describe("mapOr", () => {
      test("string-length example", () => {
        const ok: Result<string, string> = Ok("foo");
        const err: Result<string, string> = Err("bar");
        expect(ok.mapOr(42, (v) => v.length)).toBe(3);
        expect(err.mapOr(42, (v) => v.length)).toBe(42);
      });
    });

    describe("isErrAnd", () => {
      test("with error properties (ErrorKind example)", () => {
        const notFound: Result<number, Error> = Err(new Error("not found"));
        const denied: Result<number, Error> = Err(new Error("denied"));
        const ok: Result<number, Error> = Ok(123);
        expect(notFound.isErrAnd((e) => e.message === "not found")).toBe(true);
        expect(denied.isErrAnd((e) => e.message === "not found")).toBe(false);
        expect(ok.isErrAnd((e) => e.message === "not found")).toBe(false);
      });
    });

    describe("andThen", () => {
      test("sq_then_to_string overflow example", () => {
        const sqThenToString = (x: number): Result<string, string> =>
          x * x > 1000 ? Err("overflowed") : Ok(String(x * x));
        const ok: Result<number, string> = Ok(2);
        const big: Result<number, string> = Ok(1000);
        const err: Result<number, string> = Err("not a number");
        expect(ok.andThen(sqThenToString).unwrap()).toBe("4");
        expect(big.andThen(sqThenToString).unwrapErr()).toBe("overflowed");
        expect(err.andThen(sqThenToString).unwrapErr()).toBe("not a number");
      });
    });

    describe("orElse", () => {
      test("chaining (sq/err example)", () => {
        const sq = (x: number): Result<number, number> => Ok(x * x);
        const err = (x: number): Result<number, number> => Err(x);
        const ok2: Result<number, number> = Ok(2);
        const err3: Result<number, number> = Err(3);
        expect(ok2.orElse(sq).orElse(sq).unwrap()).toBe(2);
        expect(ok2.orElse(err).orElse(sq).unwrap()).toBe(2);
        expect(err3.orElse(sq).orElse(err).unwrap()).toBe(9);
        expect(err3.orElse(err).orElse(err).unwrapErr()).toBe(3);
      });
    });

    describe("flatten", () => {
      test("removes one level at a time", () => {
        const x: Result<Result<Result<string, string>, string>, string> = Ok(
          Ok(Ok("hello")),
        );
        expect(x.flatten().unwrap().unwrap()).toBe("hello");
        expect(x.flatten().flatten().unwrap()).toBe("hello");
      });
    });
  });
});

describe("Rust std parity: unwrapErrOrElse / intoOk / intoErr", () => {
  test("unwrapErrOrElse returns the error for Err without calling the closure", () => {
    const calls: number[] = [];
    const r: Result<number, string> = Err("boom");
    expect(
      r.unwrapErrOrElse((v) => {
        calls.push(v);
        return `had ${v}`;
      }),
    ).toBe("boom");
    expect(calls).toEqual([]); // lazy — closure never called
  });

  test("unwrapErrOrElse computes an error from the value for Ok", () => {
    const r: Result<number, string> = Ok(5);
    expect(r.unwrapErrOrElse((v) => `had ${v}`)).toBe("had 5");
  });

  test("intoOk returns the value for Ok", () => {
    const r: Result<number, string> = Ok(5);
    expect(r.intoOk()).toBe(5);
  });

  test("intoOk throws for Err", () => {
    const r: Result<number, string> = Err("boom");
    expect(() => r.intoOk()).toThrow("Tried to unwrap Error: boom");
  });

  test("intoErr returns the error for Err", () => {
    const r: Result<number, string> = Err("boom");
    expect(r.intoErr()).toBe("boom");
  });

  test("intoErr throws for Ok", () => {
    const r: Result<number, string> = Ok(5);
    expect(() => r.intoErr()).toThrow("Tried to unwrap Ok value: 5");
  });
});

describe("Result.isOk / Result.isErr type guards", () => {
  test("narrows the Ok branch and unwraps typed values", () => {
    const message = (res: Result<number, string>): string => {
      if (Result.isOk(res)) {
        // res: Ok<number, string> — unwrap() typed
        return `ok: ${res.unwrap()}`;
      }
      // res: Err<number, string> — unwrapErr() typed
      return `err: ${res.unwrapErr()}`;
    };
    expect(message(Ok(5) as Result<number, string>)).toBe("ok: 5");
    expect(message(Err("boom") as Result<number, string>)).toBe("err: boom");
  });

  test("narrows the Err branch", () => {
    const failed = (res: Result<number, string>): boolean => {
      if (Result.isErr(res)) return true;
      return false;
    };
    expect(failed(Err("x") as Result<number, string>)).toBe(true);
    expect(failed(Ok(1) as Result<number, string>)).toBe(false);
  });

  test("rejects non-Result values", () => {
    expect(Result.isOk(42)).toBe(false);
    expect(Result.isErr("hello")).toBe(false);
    expect(Result.isOk(undefined)).toBe(false);
  });
  describe("all", () => {
    test("all Ok values should return Ok of all values", () => {
      const result = Result.all([Ok(1), Ok(2), Ok(3)]);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual([1, 2, 3]);
    });
    test("should short-circuit and return the first Err", () => {
      const result = Result.all([Ok(1), Err("first"), Err("second")]);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("first");
    });
    test("should preserve tuple types for literals", () => {
      const result = Result.all([Ok(1), Ok("a")]);
      const values: [number, string] = result.unwrap();
      expect(values).toEqual([1, "a"]);
    });
    test("should unify error types into a union", () => {
      const result = Result.all([Ok(1), Err("a" as const), Err(2 as const)]);
      const err: "a" | 2 = result.unwrapErr();
      expect(["a", 2]).toContain(err);
    });
    test("empty array should return Ok([])", () => {
      const result = Result.all([]);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toEqual([]);
    });
  });

  describe("traverse", () => {
    test("should map all values when every result is Ok", () => {
      const result = Result.traverse([1, 2, 3], (n) => Ok(n * 2));
      expect(result.unwrap()).toEqual([2, 4, 6]);
    });
    test("should short-circuit and stop calling fn after first Err", () => {
      const calls = spy((n: number) => (n === 2 ? Err("boom") : Ok(n)));
      const result = Result.traverse([1, 2, 3, 4], calls);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("boom");
      assertSpyCalls(calls, 2);
    });
  });
});
