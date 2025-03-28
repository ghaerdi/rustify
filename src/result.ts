import { toString } from "./utils.ts";

/**
 * BaseResult interface defines the common methods for Ok and Err implementations.
 * It allows iteration over the contained value *only* if it's `Ok` and the value itself is iterable.
 * @template T The type of the successful value.
 * @template E The type of the error value.
 */
interface BaseResult<T, E> extends Iterable<T extends Iterable<infer U> ? U : never> {
  /**
   * Checks if the result is Ok.
   * @returns True if the result is Ok, false otherwise.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * console.log(result.isOk()); // Output: true
   * ```
   */
  isOk(): boolean;

  /**
   * Checks if the result is Ok and the contained value satisfies a predicate.
   * @param fn The predicate function to apply to the Ok value.
   * @returns True if the result is Ok and the predicate returns true, false otherwise.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * console.log(result.isOkAnd(x => x > 3)); // Output: true
   * console.log(result.isOkAnd(x => x < 3)); // Output: false
   *
   * const errResult: Result<number, string> = Err("error");
   * console.log(errResult.isOkAnd(x => x > 3)); // Output: false
   * ```
   */
  isOkAnd(fn: (value: T) => boolean): boolean;

  /**
   * Checks if the result is Err.
   * @returns True if the result is Err, false otherwise.
   * @example
   * ```typescript
   * const result: Result<number, string> = Err("error");
   * console.log(result.isErr()); // Output: true
   *
   * const okResult: Result<number, string> = Ok(5);
   * console.log(okResult.isErr()); // Output: false
   * ```
   */
  isErr(): boolean;

  /**
   * Checks if the result is Err and the contained error satisfies a predicate.
   * @param fn The predicate function to apply to the Err value.
   * @returns True if the result is Err and the predicate returns true, false otherwise.
   * @example
   * ```typescript
   * const result: Result<number, string> = Err("error");
   * console.log(result.isErrAnd(e => e === "error")); // Output: true
   * console.log(result.isErrAnd(e => e === "other")); // Output: false
   *
   * const okResult: Result<number, string> = Ok(5);
   * console.log(okResult.isErrAnd(e => e === "error")); // Output: false
   * ```
   */
  isErrAnd(fn: (value: E) => boolean): boolean;

  /**
   * Returns the contained Ok value, if present.
   * @returns The Ok value, or undefined if the result is Err.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * console.log(result.ok()); // Output: 5
   *
   * const errResult: Result<number, string> = Err("error");
   * console.log(errResult.ok()); // Output: undefined
   * ```
   */
  ok(): T | undefined;

  /**
   * Returns the contained Err value, if present.
   * @returns The Err value, or undefined if the result is Ok.
   * @example
   * ```typescript
   * const result: Result<number, string> = Err("error");
   * console.log(result.err()); // Output: "error"
   *
   * const okResult: Result<number, string> = Ok(5);
   * console.log(okResult.err()); // Output: undefined
   * ```
   */
  err(): E | undefined;

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained Ok value,
   * leaving an Err value untouched.
   * @template U The type of the mapped Ok value.
   * @param fn The function to apply to the Ok value.
   * @returns A new Result with the mapped Ok value or the original Err value.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * const mappedResult = result.map(x => x.toString());
   * console.log(mappedResult.unwrap()); // Output: "5"
   *
   * const errResult: Result<number, string> = Err("error");
   * const mappedErr = errResult.map(x => x.toString()); // Does nothing
   * console.log(mappedErr.err()); // Output: "error"
   * ```
   */
  map<U>(fn: (value: T) => U): Result<U, E>;

  /**
   * Returns the provided default value (if Err), or applies a function to the contained value (if Ok).
   * @template U The type returned by the function `fn` and the type of `defaultValue`.
   * @param defaultValue The default value to return if the result is Err.
   * @param fn The function to apply to the Ok value.
   * @returns The result of `fn(Ok_value)` or `defaultValue`.
   * @example
   * ```typescript
   * const result: Result<string, string> = Ok("foo");
   * console.log(result.mapOr(42, v => v.length)); // Output: 3
   *
   * const errResult: Result<string, string> = Err("bar");
   * console.log(errResult.mapOr(42, v => v.length)); // Output: 42
   * ```
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

  /**
   * Maps a `Result<T, E>` to `U` by applying a fallback function `defaultFn` to a contained Err value,
   * or function `fn` to a contained Ok value.
   * @template U The type returned by both functions.
   * @param defaultFn The function to apply to the Err value.
   * @param fn The function to apply to the Ok value.
   * @returns The result of `fn(Ok_value)` or `defaultFn(Err_value)`.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * const value = result.mapOrElse(e => `Error: ${e}`, x => `Success: ${x}`);
   * console.log(value); // Output: "Success: 5"
   *
   * const errResult: Result<number, string> = Err("failure");
   * const errValue = errResult.mapOrElse(e => `Error: ${e}`, x => `Success: ${x}`);
   * console.log(errValue); // Output: "Error: failure"
   * ```
   */
  mapOrElse<U>(defaultFn: (err: E) => U, fn: (value: T) => U): U;

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained Err value,
   * leaving an Ok value untouched.
   * @template F The type of the mapped Err value.
   * @param fn The function to apply to the Err value.
   * @returns A new Result with the mapped Err value or the original Ok value.
   * @example
   * ```typescript
   * const result: Result<number, string> = Err("error");
   * const mappedResult = result.mapErr(e => new Error(e));
   * console.log(mappedResult.err()); // Output: Error: error
   *
   * const okResult: Result<number, string> = Ok(5);
   * const mappedOk = okResult.mapErr(e => new Error(e)); // Does nothing
   * console.log(mappedOk.ok()); // Output: 5
   * ```
   */
  mapErr<F>(fn: (value: E) => F): Result<T, F>;

  /**
   * Calls the provided function with the contained value (if Ok). Returns the original result.
   * Useful for debugging or side-effects.
   * @param fn The function to call with the Ok value.
   * @returns The original `Result<T, E>`.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * const inspectedResult = result.inspect(x => console.log(`Value: ${x}`)); // Logs: Value: 5
   * console.log(inspectedResult.unwrap()); // Output: 5
   * ```
   */
  inspect(fn: (value: T) => void): Result<T, E>;

  /**
   * Calls the provided function with the contained value (if Err). Returns the original result.
   * Useful for debugging or logging errors.
   * @param fn The function to call with the Err value.
   * @returns The original `Result<T, E>`.
   * @example
   * ```typescript
   * const result: Result<number, string> = Err("error");
   * const inspectedResult = result.inspectErr(e => console.error(`Error occurred: ${e}`)); // Logs: Error occurred: error
   * console.log(inspectedResult.isErr()); // Output: true
   * ```
   */
  inspectErr(fn: (value: E) => void): Result<T, E>;

  /**
   * Returns the contained Ok value.
   * Throws an error if the value is an Err, using the provided message.
   * @param message The message prefix to use if the value is an Err.
   * @returns The Ok value.
   * @throws {Error} Throws an error prefixed with `message` if the result is Err.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * console.log(result.expect("should be Ok")); // Output: 5
   *
   * const errResult: Result<number, string> = Err("failure");
   * try {
   * errResult.expect("Value was an error");
   * } catch (e) {
   * console.error(e.message); // Output: Value was an error: failure (+ stacktrace)
   * }
   * ```
   */
  expect(message: string): T;

  /**
   * Returns the contained Ok value.
   * Throws an error if the value is an Err.
   * @returns The Ok value.
   * @throws {Error} Throws an error if the result is Err.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * console.log(result.unwrap()); // Output: 5
   *
   * const errResult: Result<number, string> = Err("failure");
   * try {
   * errResult.unwrap();
   * } catch (e) {
   * console.error(e.message); // Output: Tried to unwrap Error: failure (+ stacktrace)
   * }
   * ```
   */
  unwrap(): T;

  /**
   * Returns the contained Ok value or a provided default value.
   * @template U The type of the default value (can be different from T).
   * @param defaultValue The default value to return if the result is Err.
   * @returns The Ok value or `defaultValue`.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * console.log(result.unwrapOr(0)); // Output: 5
   *
   * const errResult: Result<number, string> = Err("error");
   * console.log(errResult.unwrapOr(0)); // Output: 0
   *
   * const errResult2: Result<number, string> = Err("error");
   * console.log(errResult2.unwrapOr("default string")); // Output: "default string"
   * ```
   */
  unwrapOr<U>(defaultValue: U): T | U;

  /**
   * Returns the contained Ok value or computes it from a closure.
   * @template U The type of the value returned by the closure `fn` (can be different from T).
   * @param fn The closure to compute the default value from the Err value.
   * @returns The Ok value or the value computed by `fn(Err_value)`.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(5);
   * console.log(result.unwrapOrElse(() => 0)); // Output: 5
   *
   * const errResult: Result<number, string> = Err("error");
   * console.log(errResult.unwrapOrElse(e => e.length)); // Output: 5 (length of "error")
   * ```
   */
  unwrapOrElse<U>(fn: (value: E) => U): T | U;

  /**
   * Returns `res` if the result is Ok, otherwise returns the Err value of self.
   * This can be used for chaining operations where the intermediate Ok value is not needed.
   * @template U The type of the Ok value of the `res` Result.
   * @param res The other Result to return if self is Ok.
   * @returns `res` if self is Ok, otherwise the Err value of self.
   * @example
   * ```typescript
   * const r1: Result<number, string> = Ok(2);
   * const r2: Result<string, string> = Ok("late error");
   * console.log(r1.and(r2).unwrap()); // Output: "late error"
   *
   * const e1: Result<number, string> = Err("early error");
   * const e2: Result<string, string> = Ok("late error");
   * console.log(e1.and(e2).err()); // Output: "early error"
   * ```
   */
  and<U>(res: Result<U, E>): Result<U, E>;

  /**
   * Calls `fn` if the result is Ok, otherwise returns the Err value of self.
   * This is often used for chaining operations that might fail.
   * @template U The type of the Ok value of the Result returned by `fn`.
   * @param fn The function to call with the Ok value, which returns a new Result.
   * @returns The Result returned by `fn`, or the Err value of self.
   * @example
   * ```typescript
   * function checkPositive(x: number): Result<number, string> {
   * return x > 0 ? Ok(x) : Err("Not positive");
   * }
   *
   * const r1: Result<number, string> = Ok(5);
   * console.log(r1.andThen(checkPositive).unwrap()); // Output: 5
   *
   * const r2: Result<number, string> = Ok(-1);
   * console.log(r2.andThen(checkPositive).err()); // Output: "Not positive"
   *
   * const e1: Result<number, string> = Err("initial error");
   * console.log(e1.andThen(checkPositive).err()); // Output: "initial error"
   * ```
   */
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

  /**
   * Returns `res` if the result is Err, otherwise returns the Ok value of self.
   * This can be used to provide a fallback Result.
   * @template F The type of the Err value of the `res` Result.
   * @param res The other Result to return if self is Err.
   * @returns The Ok value of self, or `res`.
   * @example
   * ```typescript
   * const r1: Result<number, string> = Ok(5);
   * const r2: Result<number, string> = Ok(10);
   * console.log(r1.or(r2).unwrap()); // Output: 5
   *
   * const e1: Result<number, string> = Err("error");
   * const e2: Result<number, string> = Ok(10);
   * console.log(e1.or(e2).unwrap()); // Output: 10
   *
   * const e3: Result<number, string> = Err("error 1");
   * const e4: Result<number, number> = Err(2); // Different error type
   * console.log(e3.or(e4).err()); // Output: 2
   * ```
   */
  or<F>(res: Result<T, F>): Result<T, F>;

  /**
   * Calls `fn` if the result is Err, otherwise returns the Ok value of self.
   * This is often used for handling errors by trying an alternative operation.
   * @template F The type of the Err value of the Result returned by `fn`.
   * @param fn The function to call with the Err value, which returns a new Result.
   * @returns The Ok value of self, or the Result returned by `fn`.
   * @example
   * ```typescript
   * function fallback(e: string): Result<number, string> {
   * return Ok(0); // Provide a default value on error
   * }
   *
   * const r1: Result<number, string> = Ok(5);
   * console.log(r1.orElse(fallback).unwrap()); // Output: 5
   *
   * const e1: Result<number, string> = Err("error");
   * console.log(e1.orElse(fallback).unwrap()); // Output: 0
   * ```
   */
  orElse<F>(fn: (value: E) => Result<T, F>): Result<T, F>;

  /**
   * Returns a new Result containing a clone of the contained Ok value.
   * Uses `structuredClone` for objects. Primitive values are copied directly.
   * Does *not* clone the Err value.
   * @returns A new Result with a clone of the Ok value, or the original Err value.
   * @example
   * ```typescript
   * const obj = { a: 5 };
   * const result: Result<{ a: number }, string> = Ok(obj);
   * const clonedResult = result.cloned();
   * const unwrapped = clonedResult.unwrap();
   * console.log(unwrapped); // Output: { a: 5 }
   * console.log(unwrapped === obj); // Output: false (it's a clone)
   *
   * const errResult: Result<number, string> = Err("error");
   * const clonedErr = errResult.cloned(); // Err value is not cloned
   * console.log(clonedErr.err()); // Output: "error"
   * ```
   */
  cloned(): Result<T, E>;

  /**
   * Returns the contained Err value.
   * Throws an error if the value is an Ok, using the provided message.
   * @param message The message prefix to use if the value is an Ok.
   * @returns The Err value.
   * @throws {Error} Throws an error prefixed with `message` if the result is Ok.
   * @example
   * ```typescript
   * const result: Result<number, string> = Err("error");
   * console.log(result.expectErr("should be Err")); // Output: "error"
   *
   * const okResult: Result<number, string> = Ok(5);
   * try {
   * okResult.expectErr("Value was Ok");
   * } catch (e) {
   * console.error(e.message); // Output: Value was Ok: 5
   * }
   * ```
   */
  expectErr(message: string): E;

  /**
   * Returns the contained Err value.
   * Throws an error if the value is an Ok.
   * @returns The Err value.
   * @throws {Error} Throws an error if the result is Ok.
   * @example
   * ```typescript
   * const result: Result<number, string> = Err("error");
   * console.log(result.unwrapErr()); // Output: "error"
   *
   * const okResult: Result<number, string> = Ok(5);
   * try {
   * okResult.unwrapErr();
   * } catch (e) {
   * console.error(e.message); // Output: Tried to unwrap Ok value: 5
   * }
   * ```
   */
  unwrapErr(): E;
}

/**
 * @internal Implementation of the Ok case for Result. Users should use the `Ok` factory function.
 */
class OkImpl<T, E = never> implements BaseResult<T, E> {
  readonly #value!: T;

  constructor(value: T) {
    if (this instanceof OkImpl === false) {
      return new OkImpl(value)
    }
    this.#value = value;
  }

  isOk(): true { return true; }
  isOkAnd(fn: (value: T) => boolean): boolean { return fn(this.#value); }
  isErr(): false { return false; }
  isErrAnd(_fn: (value: E) => boolean): false { return false; }
  ok(): T { return this.#value; }
  err(): undefined { return undefined; }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return Ok(fn(this.#value));
  }

  mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  mapOrElse<U>(_defaultFn: (err: never) => U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  mapErr<F>(_fn: (value: never) => F): Result<T, F> {
    return this as unknown as Result<T, F>; // Type assertion is safe here
  }

  inspect(fn: (value: T) => void): Result<T, E> {
    fn(this.#value);
    return this;
  }

  inspectErr(_fn: (value: never) => void): Result<T, E> {
    return this;
  }

  expect(_message: string): T {
    return this.#value;
  }

  unwrap(): T {
    return this.#value;
  }

  unwrapOr<U>(_defaultValue: U): T {
    return this.#value;
  }

  unwrapOrElse<U>(_fn: (value: never) => U): T {
    return this.#value;
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.#value);
  }

  or<F>(_res: Result<T, F>): Result<T, F> {
    return this as unknown as Result<T, F>; // Type assertion is safe here
  }

  orElse<F>(_fn: (value: never) => Result<T, F>): Result<T, F> {
    return this as unknown as Result<T, F>; // Type assertion is safe here
  }

  cloned(): Result<T, E> {
    try {
      // structuredClone handles primitives, objects, arrays, dates, regex, maps, sets, etc.
      // Throws DataCloneError for non-cloneable types like functions or DOM nodes.
      const clonedValue = structuredClone(this.#value);
      return Ok(clonedValue);
    } catch (e) {
      // If structuredClone fails, return the original Ok - best effort.
      // Alternatively, could return an Err indicating cloning failure.
      console.warn("Failed to structuredClone Ok value:", this.#value, e);
      return this;
    }
  }

  expectErr(message: string): never {
    throw new Error(`${message}: ${toString(this.#value)}`);
  }

  unwrapErr(): never {
    throw new Error(`Tried to unwrap Ok value: ${toString(this.#value)}`);
  }

  [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
    const value = this.#value as T;
    if (typeof value === 'object' && value !== null && Symbol.iterator in value) {
      return (value as Iterable<T extends Iterable<infer U> ? U : never>)[Symbol.iterator]();
    } else {
      return {
        next(): IteratorResult<T extends Iterable<infer U> ? U : never> {
          return { done: true, value: undefined! };
        }
      } as Iterator<T extends Iterable<infer U> ? U : never>;
    }
  }
}

/**
 * @internal Implementation of the Err case for Result. Users should use the `Err` factory function.
 */
class ErrImpl<T = never, E = unknown> implements BaseResult<T, E> {
  readonly #stack!: string;
  readonly #value!: E;

  /**
   * @internal Creates an Err instance.
   * Captures a stack trace at the point of creation, omitting the ErrImpl constructor frames
   * for better debugging experience when unwrapping/expecting.
   * @param value The error value.
   */
  constructor(value: E) {
    if (this instanceof ErrImpl === false) {
      return new ErrImpl(value)
    }

    const stackLines = (new Error().stack || '').split('\n');
    let firstRelevantFrame = 1;
    while (
      stackLines[firstRelevantFrame] &&
      (stackLines[firstRelevantFrame].includes('ErrImpl') || stackLines[firstRelevantFrame].includes(' Err '))
    ) {
      firstRelevantFrame++;
    }

    this.#stack = stackLines.slice(firstRelevantFrame).join('\n');
    this.#value = value;
  }

  isOk(): false { return false; }
  isOkAnd(_fn: (value: T) => boolean): false { return false; }
  isErr(): true { return true; }
  isErrAnd(fn: (value: E) => boolean): boolean { return fn(this.#value); }
  ok(): undefined { return undefined; }
  err(): E { return this.#value; }

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as unknown as Result<U, E>; // Type assertion is safe here
  }

  mapOr<U>(defaultValue: U, _fn: (value: never) => U): U {
    return defaultValue;
  }

  mapOrElse<U>(defaultFn: (err: E) => U, _fn: (value: never) => U): U {
    return defaultFn(this.#value);
  }

  mapErr<F>(fn: (value: E) => F): Result<T, F> {
    return Err(fn(this.#value));
  }

  inspect(_fn: (value: never) => void): Result<T, E> {
    return this;
  }

  inspectErr(fn: (value: E) => void): Result<T, E> {
    fn(this.#value);
    return this;
  }

  expect(message: string): never {
    throw new Error(`${message}: ${toString(this.#value)}\n${this.#stack}`);
  }

  unwrap(): never {
    throw new Error(`Tried to unwrap Error: ${toString(this.#value)}\n${this.#stack}`);
  }

  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  unwrapOrElse<U>(fn: (value: E) => U): U {
    return fn(this.#value);
  }

  and<U>(_res: Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>; // Type assertion is safe here
  }

  andThen<U>(_fn: (value: never) => Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>; // Type assertion is safe here
  }

  or<F>(res: Result<T, F>): Result<T, F> {
    return res;
  }

  orElse<F>(fn: (value: E) => Result<T, F>): Result<T, F> {
    return fn(this.#value);
  }

  cloned(): Result<T, E> {
    return this;
  }

  expectErr(_message: string): E {
    return this.#value;
  }

  unwrapErr(): E {
    return this.#value;
  }

  [Symbol.iterator](): Iterator<never> {
    return {
      next(): IteratorResult<never> {
        return { done: true, value: undefined! };
      }
    };
  }
}

/**
 * Represents the successful case (`Ok`) of a {@link Result}.
 * Contains the successful value of type `T`.
 * @template T The type of the successful value.
 * @example
 * ```typescript
 * const okValue: Ok<number> = Ok(10);
 * if (okValue.isOk()) {
 * console.log(okValue.unwrap()); // Output: 10
 * }
 * ```
 */
export type Ok<T, E = never> = OkImpl<T, E>;

/**
 * Creates a new Ok result containing the given value.
 * @template T The type of the successful value.
 * @param value The successful value.
 * @returns An Ok result wrapping the value.
 */
export const Ok = <T>(value: T): Ok<T, never> => new OkImpl(value);

/**
 * Represents the failure case (`Err`) of a {@link Result}.
 * Contains the error value of type `E`.
 * @template E The type of the error value.
 * @template T The type of the success value (usually `never` for Err).
 * @example
 * ```typescript
 * const error: Err<string> = Err("Something went wrong");
 * if (error.isErr()) {
 * console.error(error.unwrapErr()); // Output: Something went wrong
 * }
 * ```
 */
export type Err<T = never, E = unknown> = ErrImpl<T, E>;

/**
 * Creates a new Err result containing the given error value.
 * @template E The type of the error value.
 * @param value The error value.
 * @returns An Err result wrapping the error value.
 */
export const Err = <E>(value: E): Err<never, E> => new ErrImpl(value);

/**
 * `Result<T, E>` is a type that represents either success (`Ok<T>`) or failure (`Err<E>`).
 * It's commonly used for error handling without resorting to exceptions.
 * @template T The type of the successful result.
 * @template E The type of the error result.
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, string> {
 * if (b === 0) {
 * return Err("Cannot divide by zero");
 * }
 * return Ok(a / b);
 * }
 *
 * const result1 = divide(10, 2);
 * console.log(result1.unwrapOr(NaN)); // Output: 5
 *
 * const result2 = divide(10, 0);
 * console.log(result2.unwrapOr(NaN)); // Output: NaN
 * if (result2.isErr()) {
 * console.error(result2.err()); // Output: "Cannot divide by zero"
 * }
 * ```
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;

/**
 * Wraps a function that might throw an error, returning its result as a `Result<T, E>`.
 * If the function executes successfully, returns `Ok(returnValue)`.
 * If the function throws an error, catches it and returns `Err(transformedError)`.
 *
 * @template T The type of the successful result of `fn`.
 * @template E The type of the error value in the returned `Err`. Defaults to `unknown`.
 * @param fn The function to wrap. It can be any function that returns a value of type `T` or throws an error.
 * @param errorTransform An optional function to transform a caught error into the desired error type `E`.
 * @default errorTransform If omitted, uses `error.message` if `error` is an `Error` instance, otherwise uses `error` directly (casted to `E`).
 * @returns A new function that takes the same arguments as `fn` but returns a `Result<T, E>`.
 * @example
 * ```typescript
 * // Wrap JSON.parse using default error handling
 * const safeParse = wrapInResult(JSON.parse);
 *
 * // Successful call
 * const resultOk = safeParse('{"value": true}');
 * console.log(resultOk.unwrapOr({ value: false })); // Output: { value: true }
 *
 * // Failing call (JSON.parse throws)
 * const resultErr = safeParse('invalid json');
 * console.log(resultErr.err()); // Output: "Unexpected token i in JSON at position 0" (or similar)
 * ```
 */
export function wrapInResult<T, E = unknown>(
  fn: (...args: any[]) => T,
  errorTransform?: (error: unknown) => E
): (...args: any[]) => Result<T, E> {
  return (...args: any[]): Result<T, E> => {
    try {
      return Ok(fn(...args));
    } catch (error) {
      const transformedError: E = errorTransform
        ? errorTransform(error)
        : error instanceof Error ? error.message as E : error as E;
      return Err(transformedError);
    }
  };
}
