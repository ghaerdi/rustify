import { Result, Err, Ok } from "../src/result.ts";
import { Some, None } from "../src/option.ts";
import { describe, test, expect, mock } from "bun:test";


describe('Result', () => {
  describe('Ok', () => {
    const value = 'success';
    const okResult: Result<string, string> = Ok(value);

    test('isOk should return true', () => {
      expect(okResult.isOk()).toBeTrue();
    });

    test('isErr should return false', () => {
      expect(okResult.isErr()).toBeFalse();
    });

    test('ok should return Some with the value', () => {
      const okValue = okResult.ok();
      expect(okValue.isSome()).toBeTrue();
      expect(okValue.unwrap()).toBe(value);
    });

    test('err should return None', () => {
      const errValue = okResult.err();
      expect(errValue.isNone()).toBeTrue();
      expect(errValue).toBe(None);
    });

    test('unwrap should return the value', () => {
      expect(okResult.unwrap()).toBe(value);
    });

    test('unwrapErr should throw', () => {
      expect(() => okResult.unwrapErr()).toThrow(/^Tried to unwrap Ok value:/);
    });

    test('unwrapOr should return the value', () => {
      expect(okResult.unwrapOr('default')).toBe(value);
    });

    test('map should apply function and wrap result in Ok', () => {
      const mapped = okResult.map((val) => val.length);
      expect(mapped.isOk()).toBeTrue();
      expect(mapped.unwrap()).toBe(value.length);
    });

    test('mapErr should not apply function and return self', () => {
      const mapErrFn = mock((_err: string) => `Error: ${_err}`);
      const mappedErr = okResult.mapErr(mapErrFn);
      expect(mappedErr.isOk()).toBeTrue();
      expect(mappedErr.unwrap()).toBe(value);
      expect(mapErrFn).not.toHaveBeenCalled();
    });

    test('andThen should apply function returning Result', () => {
      const andThenFn = mock((val: string) => Ok(val.length));
      const andThenResult = okResult.andThen(andThenFn);
      expect(andThenResult.isOk()).toBeTrue();
      expect(andThenResult.unwrap()).toBe(value.length);
      expect(andThenFn).toHaveBeenCalledWith(value);
    });

    test('orElse should not apply function and return self', () => {
      const orElseFn = mock((err: string) => Err(`Error: ${err}`));
      const orElseResult = okResult.orElse(orElseFn);
      expect(orElseResult.isOk()).toBeTrue();
      expect(orElseResult.unwrap()).toBe(value);
      expect(orElseFn).not.toHaveBeenCalled();
    });

    test('isOkAnd should return true if predicate matches', () => {
      expect(okResult.isOkAnd(v => v === value)).toBeTrue();
    });

    test('isOkAnd should return false if predicate does not match', () => {
      expect(okResult.isOkAnd(v => v === 'different')).toBeFalse();
    });

    test('isErrAnd should return false', () => {
      expect(okResult.isErrAnd(_ => true)).toBeFalse();
    });

    test('mapOr should apply function and return the result', () => {
      const mapOrFn = mock((val: string) => val.length);
      expect(okResult.mapOr(0, mapOrFn)).toBe(value.length);
      expect(mapOrFn).toHaveBeenCalledWith(value);
    });

    test('mapOrElse should apply ok function and return the result', () => {
      const okFn = mock((val: string) => val.length);
      const errFn = mock((_err: string) => 0);
      expect(okResult.mapOrElse(errFn, okFn)).toBe(value.length);
      expect(okFn).toHaveBeenCalledWith(value);
      expect(errFn).not.toHaveBeenCalled();
    });

    test('inspect should call function and return self', () => {
      const inspectFn = mock((_v: string) => { });
      const result = okResult.inspect(inspectFn);
      expect(result).toBe(okResult);
      expect(inspectFn).toHaveBeenCalledWith(value);
    });

    test('inspectErr should not call function and return self', () => {
      const inspectErrFn = mock((_e: string) => { });
      const result = okResult.inspectErr(inspectErrFn);
      expect(result).toBe(okResult);
      expect(inspectErrFn).not.toHaveBeenCalled();
    });

    test('expect should return the value', () => {
      expect(okResult.expect('should be Ok')).toBe(value);
    });

    test('expectErr should throw with message', () => {
      const message = 'Value was Ok';
      expect(() => okResult.expectErr(message)).toThrow(`${message}: ${value}`);
    });

    test('unwrapOrElse should return the value', () => {
      const elseFn = mock((_err: string) => 'default');
      expect(okResult.unwrapOrElse(elseFn)).toBe(value);
      expect(elseFn).not.toHaveBeenCalled();
    });

    test('and should return the other result if Ok', () => {
      const compatibleAndOk: Result<number, string> = Ok(99);
      const compatibleAndErr: Result<number, string> = Err("compatible error");
      expect(okResult.and(compatibleAndOk).unwrap()).toBe(99);
      expect(okResult.and(compatibleAndErr).err().unwrap()).toBe("compatible error");
    });

    test('or should return self if Ok', () => {
      expect(okResult.or(Ok("another success")).unwrap()).toBe(value);
      expect(okResult.or(Err(404)).unwrap()).toBe(value);
    });

    test('cloned should return a new Ok with a cloned value (object)', () => {
      const obj = { a: 1, b: { c: 2 } };
      const okObj = Ok(obj);
      const cloned = okObj.cloned();
      expect(cloned.isOk()).toBeTrue();
      const unwrapped = cloned.unwrap();
      expect(unwrapped).toEqual(obj);
      expect(unwrapped).not.toBe(obj);
      expect(unwrapped.b).not.toBe(obj.b);
    });

    test('cloned should return a new Ok with the same value (primitive)', () => {
      const okPrimitive = Ok(123);
      const cloned = okPrimitive.cloned();
      expect(cloned.isOk()).toBeTrue();
      expect(cloned.unwrap()).toBe(123);
    });

    test('asTuple should return [undefined, value]', () => {
      const [err, val] = okResult.asTuple();
      expect(err).toBeUndefined();
      expect(val).toBe(value);
    });

    test('asObject should return { error: undefined, value: value }', () => {
      const { error, value: val } = okResult.asObject();
      expect(error).toBeUndefined();
      expect(val).toBe(value);
    });

    describe('match', () => {
      const okValue = 100;
      const okResultInstance: Result<number, string> = Ok(okValue);

      test('should execute the Ok handler', () => {
        const okHandler = mock((v: number) => `Ok value: ${v}`);
        const errHandler = mock((e: string) => `Err value: ${e}`);

        const matchResult = okResultInstance.match({
          Ok: okHandler,
          Err: errHandler,
        });

        expect(matchResult).toBe(`Ok value: ${okValue}`);
        expect(okHandler).toHaveBeenCalledTimes(1);
        expect(okHandler).toHaveBeenCalledWith(okValue);
        expect(errHandler).not.toHaveBeenCalled();
      });

      test('should return the correct type from the Ok handler', () => {
        const result = Ok(5).match({
          Ok: (v) => v * 2,
          Err: (e: string) => e.length,
        });
        expect(result).toBe(10);
      });

      test('should work with different Ok types', () => {
        const complexOk: Result<{ id: number }, boolean> = Ok({ id: 123 });

        const matchOk = complexOk.match({
          Ok: (data) => `ID: ${data.id}`,
          Err: (flag) => `Flag: ${flag}`,
        });
        expect(matchOk).toBe("ID: 123");
      });
    });

    describe('Iterator', () => {
      test('should yield values if Ok value is iterable (Array)', () => {
        const iterableValue = [1, 2, 3];
        const okIterable = Ok(iterableValue);
        const yielded = [...okIterable];
        expect(yielded).toEqual(iterableValue);
      });

      test('should yield values if Ok value is iterable (String)', () => {
        const result = Ok("abc");
        const iterated = [...result];
        expect(iterated).toEqual(['a', 'b', 'c']);
      });

      test('should yield values if Ok value is iterable (Set)', () => {
        const setData = [1, 2, 3];
        const result = Ok(new Set(setData));
        const iterated = [...result];
        expect(iterated).toEqual(setData);
      });

      test('should yield key-value pairs if Ok value is iterable (Map)', () => {
        const mapData: [string, number][] = [['a', 1], ['b', 2]];
        const result = Ok(new Map(mapData));
        const iterated = [...result];
        expect(iterated).toEqual(mapData);
      });

      test('should yield nothing if Ok value is not iterable (Number)', () => {
        const result = Ok(123);
        const iterated = [...result];
        expect(iterated).toEqual([]);
      });

      test('should yield nothing if Ok value is not iterable (Object)', () => {
        const okNonIterable = Ok({ a: 1 });
        const yielded = [...okNonIterable];
        expect(yielded).toEqual([]);
      });

      test('should yield nothing if Ok value is null or undefined', () => {
        const okNull = Ok(null);
        const okUndefined = Ok(undefined);
        expect([...okNull]).toEqual([]);
        expect([...okUndefined]).toEqual([]);
      });
    });
  });

  describe('Err', () => {
    const error = 'error message';
    const errResult: Result<string, string> = Err(error);

    test('isOk should return false', () => {
      expect(errResult.isOk()).toBeFalse();
    });

    test('isErr should return true', () => {
      expect(errResult.isErr()).toBeTrue();
    });

    test('ok should return None', () => {
      const okValue = errResult.ok();
      expect(okValue.isNone()).toBeTrue();
      expect(okValue).toBe(None);
    });

    test('err should return Some with the error', () => {
      const errValue = errResult.err();
      expect(errValue.isSome()).toBeTrue();
      expect(errValue.unwrap()).toBe(error);
    });

    test('unwrap should throw', () => {
      expect(() => errResult.unwrap()).toThrow(/^Tried to unwrap Error:/);
    });

    test('unwrapErr should return the error', () => {
      expect(errResult.unwrapErr()).toBe(error);
    });

    test('unwrapOr should return the default value', () => {
      expect(errResult.unwrapOr('default')).toBe('default');
    });

    test('map should not apply function and return self', () => {
      const mapFn = mock((val: string) => val.length);
      const mapped = errResult.map(mapFn);
      expect(mapped.isErr()).toBeTrue();
      expect(mapped.err().unwrap()).toBe(error);
      expect(mapFn).not.toHaveBeenCalled();
    });

    test('mapErr should apply function and wrap result in Err', () => {
      const mapErrFn = mock((err: string) => `Error: ${err}`);
      const mappedErr = errResult.mapErr(mapErrFn);
      expect(mappedErr.isErr()).toBeTrue();
      const expectedError = `Error: ${error}`;
      expect(mappedErr.unwrapErr()).toBe(expectedError);
      expect(mapErrFn).toHaveBeenCalledWith(error);
    });

    test('andThen should not apply function and return self', () => {
      const andThenFn = mock((val: string) => Ok(val.length));
      const andThenResult = errResult.andThen(andThenFn);
      expect(andThenResult.isErr()).toBeTrue();
      expect(andThenResult.err().unwrap()).toBe(error);
      expect(andThenFn).not.toHaveBeenCalled();
    });

    test('orElse should apply function returning Result', () => {
      const orElseFn = mock((err: string) => Ok(`Recovered from ${err}`));
      const orElseResult = errResult.orElse(orElseFn);
      const expectedValue = `Recovered from ${error}`;
      expect(orElseResult.isOk()).toBeTrue();
      expect(orElseResult.unwrap()).toBe(expectedValue);
      expect(orElseFn).toHaveBeenCalledWith(error);
    });

    test('isOkAnd should return false', () => {
      expect(errResult.isOkAnd(_ => true)).toBeFalse();
    });

    test('isErrAnd should return true if predicate matches', () => {
      expect(errResult.isErrAnd(e => e === error)).toBeTrue();
    });

    test('isErrAnd should return false if predicate does not match', () => {
      expect(errResult.isErrAnd(e => e === 'different')).toBeFalse();
    });

    test('mapOr should return the default value', () => {
      const mapFn = mock((val: string) => val.length);
      const defaultValue = 99;
      expect(errResult.mapOr(defaultValue, mapFn)).toBe(defaultValue);
      expect(mapFn).not.toHaveBeenCalled();
    });

    test('mapOrElse should apply error function and return the result', () => {
      const okFn = mock((val: string) => `Success length: ${val.length}`);
      const errFn = mock((err: string) => `Error was: ${err}`);
      const expected = `Error was: ${error}`;
      expect(errResult.mapOrElse(errFn, okFn)).toBe(expected);
      expect(errFn).toHaveBeenCalledWith(error);
      expect(okFn).not.toHaveBeenCalled();
    });

    test('inspect should not call function and return self', () => {
      const inspectFn = mock((_v: string) => { });
      const result = errResult.inspect(inspectFn);
      expect(result).toBe(errResult);
      expect(inspectFn).not.toHaveBeenCalled();
    });

    test('inspectErr should call function and return self', () => {
      const inspectErrFn = mock((_e: string) => { });
      const result = errResult.inspectErr(inspectErrFn);
      expect(result).toBe(errResult);
      expect(inspectErrFn).toHaveBeenCalledWith(error);
    });

    test('expect should throw with message', () => {
      const message = 'Value was an error';
      expect(() => errResult.expect(message)).toThrow(new RegExp(`^${message}: ${error}`));
    });

    test('expectErr should return the error', () => {
      expect(errResult.expectErr('should be Err')).toBe(error);
    });

    test('unwrapOrElse should call function and return its result', () => {
      const elseFn = mock((err: string) => `Computed default: ${err.length}`);
      const expected = `Computed default: ${error.length}`;
      expect(errResult.unwrapOrElse(elseFn)).toBe(expected);
      expect(elseFn).toHaveBeenCalledWith(error);
    });

    test('and should return self if Err', () => {
      expect(errResult.and(Ok(99)).err().unwrap()).toBe(error);
      expect(errResult.and(Err("another error")).err().unwrap()).toBe(error);
    });

    test('or should return the other result if Err', () => {
      const compatibleOrOk: Result<string, number> = Ok("fallback success");
      const compatibleOrErr: Result<string, number> = Err(500);
      expect(errResult.or(compatibleOrOk).unwrap()).toBe("fallback success");
      expect(errResult.or(compatibleOrErr).err().unwrap()).toBe(500);
    });

    test('cloned should return self (Err is not cloned)', () => {
      const errObj = Err({ code: 500, msg: 'server error' });
      const cloned = errObj.cloned();
      expect(cloned.isErr()).toBeTrue();
      expect(cloned.err().unwrap()).toBe(errObj.err().unwrap());
      expect(cloned).toBe(errObj);
    });

    test('asTuple should return [error, undefined]', () => {
      const [err, val] = errResult.asTuple();
      expect(err).toBe(error);
      expect(val).toBeUndefined();
    });

    test('asObject should return { error: error, value: undefined }', () => {
      const { error: err, value } = errResult.asObject();
      expect(err).toBe(error);
      expect(value).toBeUndefined();
    });

    describe('match', () => {
      const errValue = "failure";
      const errResultInstance: Result<number, string> = Err(errValue);

      test('should execute the Err handler', () => {
        const okHandler = mock((v: number) => `Ok value: ${v}`);
        const errHandler = mock((e: string) => `Err value: ${e}`);

        const matchResult = errResultInstance.match({
          Ok: okHandler,
          Err: errHandler,
        });

        expect(matchResult).toBe(`Err value: ${errValue}`);
        expect(errHandler).toHaveBeenCalledTimes(1);
        expect(errHandler).toHaveBeenCalledWith(errValue);
        expect(okHandler).not.toHaveBeenCalled();
      });

      test('should return the correct type from the Err handler', () => {
        const result = Err("error").match({
          Ok: (_v: number) => "was ok",
          Err: (_e: string) => false,
        });
        expect(result).toBe(false);
      });

      test('should work with different Err types', () => {
        const complexErr: Result<{ id: number }, boolean> = Err(true);

        const matchErr = complexErr.match({
          Ok: (data) => `ID: ${data.id}`,
          Err: (flag) => `Flag is ${flag}`,
        });
        expect(matchErr).toBe("Flag is true");
      });
    });

    describe('Iterator', () => {
      test('should yield nothing if Err', () => {
        const yielded = [...errResult];
        expect(yielded).toEqual([]);
      });
    });
  });

  describe('Result.isResult', () => {
    test('should return true for Ok', () => {
      expect(Result.isResult(Ok(1))).toBeTrue();
    });

    test('should return true for Err', () => {
      expect(Result.isResult(Err('error'))).toBeTrue();
    });

    test('should return false for plain object', () => {
      expect(Result.isResult({ isOk: true })).toBeFalse();
    });

    test('should return false for null', () => {
      expect(Result.isResult(null)).toBeFalse();
    });

    test('should return false for undefined', () => {
      expect(Result.isResult(undefined)).toBeFalse();
    });

    test('should return false for primitive number', () => {
      expect(Result.isResult(123)).toBeFalse();
    });

    test('should return false for primitive string', () => {
      expect(Result.isResult("hello")).toBeFalse();
    });
  });

  describe('Result.from', () => {
    test('should return Ok with the result for a function that returns a value', () => {
      const result = Result.from(() => 5);
      expect(result.isOk()).toBeTrue();
      expect(result.unwrap()).toBe(5);
    });

    test('should return Err with the error message for a function that throws an Error', () => {
      const errMsg = 'Something went wrong';
      const result = Result.from(() => { throw new Error(errMsg); });
      expect(result.isErr()).toBeTrue();
      expect(result.unwrapErr()).toBe(errMsg);
    });

    test('should return Err with the thrown value if it is not an Error', () => {
      const errValue = 'just a string error';
      const result = Result.from(() => { throw errValue; });
      expect(result.isErr()).toBeTrue();
      expect(result.unwrapErr()).toBe(errValue);
    });

    test('should use errorTransform function if provided', () => {
      const transform = mock((err: unknown) => ({ message: `Transformed: ${err instanceof Error ? err.message : String(err)}`, code: 500 }));
      const result = Result.from(() => { throw new Error('Original error'); }, transform);
      expect(result.isErr()).toBeTrue();
      expect(result.unwrapErr()).toEqual({ message: 'Transformed: Original error', code: 500 });
      expect(transform).toHaveBeenCalledTimes(1);
    });

    test('should return existing Ok if function returns Ok', () => {
      const innerOk = Ok(10);
      const result = Result.from(() => innerOk);
      expect(result.isOk()).toBeTrue();
      expect(result.unwrap()).toBe(10);
      expect(result).toBe(innerOk);
    });

    test('should return existing Err if function returns Err', () => {
      const innerErr = Err('Inner error');
      const result = Result.from(() => innerErr);
      expect(result.isErr()).toBeTrue();
      expect(result.unwrapErr()).toBe('Inner error');
      expect(result).toBe(innerErr);
    });
  });

  describe('Result.fromAsync', () => {
    test('should return Ok with the resolved value for a promise that resolves', async () => {
      const result = await Result.fromAsync(async () => 5);
      expect(result.isOk()).toBeTrue();
      expect(result.unwrap()).toBe(5);
    });

    test('should return Err with the error message for a promise that rejects with an Error', async () => {
      const errMsg = 'Async went wrong';
      const result = await Result.fromAsync(async () => { throw new Error(errMsg); });
      expect(result.isErr()).toBeTrue();
      expect(result.unwrapErr()).toBe(errMsg);
    });

    test('should return Err with the rejection value if it is not an Error', async () => {
      const errValue = 'just an async string error';
      const result = await Result.fromAsync(async () => { throw errValue; });
      expect(result.isErr()).toBeTrue();
      expect(result.unwrapErr()).toBe(errValue);
    });

    test('should use errorTransform function if provided for rejection', async () => {
      const transform = mock((err: unknown) => ({ message: `Async Transformed: ${err instanceof Error ? err.message : String(err)}`, code: 503 }));
      const result = await Result.fromAsync(async () => { throw new Error('Async Original error'); }, transform);
      expect(result.isErr()).toBeTrue();
      expect(result.unwrapErr()).toEqual({ message: 'Async Transformed: Async Original error', code: 503 });
      expect(transform).toHaveBeenCalledTimes(1);
    });

    test('should return existing Ok if promise resolves with Ok', async () => {
      const innerOk = Ok(20);
      const result = await Result.fromAsync(async () => innerOk);
      expect(result.isOk()).toBeTrue();
      expect(result.unwrap()).toBe(20);
      expect(result).toBe(innerOk);
    });

    test('should return existing Err if promise resolves with Err', async () => {
      const innerErr = Err('Async Inner error');
      const result = await Result.fromAsync(async () => innerErr);
      expect(result.isErr()).toBeTrue();
      expect(result.unwrapErr()).toBe('Async Inner error');
      expect(result).toBe(innerErr);
    });

    test('should return Err if the async function throws synchronously', async () => {
      const errMsg = 'Sync throw in async function';
      const result = await Result.fromAsync(() => {
        throw new Error(errMsg);
      });
      expect(result.isErr()).toBeTrue();
      expect(result.unwrapErr()).toBe(errMsg);
    });
  });

});

