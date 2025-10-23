import { toString } from "./utils.ts";
import type { Option } from "./option.ts";
import { Some, None } from "./option.ts";

/**
 * Interface defining the structure for the pattern matching handlers used by the `match` method.
 * @template T The type of the successful value.
 * @template E The type of the error value.
 * @template U The return type of the Ok handler.
 * @template V The return type of the Err handler.
 */
interface ResultMatcher<T, E, U, V> {
  /**
   * Handler function for the Ok case.
   * @param value The successful value of type T.
   * @returns A value of type U.
   */
  Ok: (value: T) => U;
  /**
   * Handler function for the Err case.
   * @param err The error value of type E.
   * @returns A value of type V.
   */
  Err: (err: E) => V;
}


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
   * Ok(5).isOk(); // true
   * Err("error").isOk(); // false
   * ```
   */
  isOk(): boolean;

  /**
   * Checks if the result is Ok and the contained value satisfies a predicate.
   * @param fn The predicate function to apply to the Ok value.
   * @returns True if the result is Ok and the predicate returns true, false otherwise.
   * @example
   * ```typescript
   * Ok(5).isOkAnd(x => x > 3); // true
   * Ok(5).isOkAnd(x => x < 3); // false
   * Err("error").isOkAnd(x => x > 3); // false
   * ```
   */
  isOkAnd(fn: (value: T) => boolean): boolean;

  /**
   * Checks if the result is Err.
   * @returns True if the result is Err, false otherwise.
   * @example
   * ```typescript
   * Err("error").isErr(); // true
   * Ok(5).isErr(); // false
   * ```
   */
  isErr(): boolean;

  /**
   * Checks if the result is Err and the contained error satisfies a predicate.
   * @param fn The predicate function to apply to the Err value.
   * @returns True if the result is Err and the predicate returns true, false otherwise.
   * @example
   * ```typescript
   * Err("error").isErrAnd(e => e === "error"); // true
   * Err("error").isErrAnd(e => e === "other"); // false
   * Ok(5).isErrAnd(e => e === "error"); // false
   * ```
   */
  isErrAnd(fn: (value: E) => boolean): boolean;

  /**
   * Returns the contained Ok value, if present.
   * @returns The Ok value as Some, or None if the result is Err.
   * @example
   * ```typescript
   * Ok(5).ok(); // Some(5)
   * Err("error").ok(); // None
   * ```
   */
  ok(): Option<T>;

  /**
   * Returns the contained Err value, if present.
   * @returns The Err value as Some, or None if the result is Ok.
   * @example
   * ```typescript
   * Err("error").err(); // Some("error")
   * Ok(5).err(); // None
   * ```
   */
  err(): Option<E>;

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained Ok value,
   * leaving an Err value untouched.
   * @template U The type of the mapped Ok value.
   * @param fn The function to apply to the Ok value.
   * @returns A new Result with the mapped Ok value or the original Err value.
   * @example
   * ```typescript
   * Ok(5).map(x => x.toString()).unwrap(); // "5"
   * Err("error").map(x => x.toString()).err(); // "error"
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
   * Ok("foo").mapOr(42, v => v.length); // 3
   * Err("bar").mapOr(42, v => v.length); // 42
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
   * Ok(5).mapOrElse(e => `Err: ${e}`, x => `Ok: ${x}`); // "Ok: 5"
   * Err("fail").mapOrElse(e => `Err: ${e}`, x => `Ok: ${x}`); // "Err: fail"
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
   * Err("error").mapErr(e => new Error(e)).err()?.message; // "error"
   * Ok(5).mapErr(e => new Error(e)).ok(); // 5
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
   * Ok(5).inspect(x => console.log(x)); // Logs 5, returns Ok(5)
   * Err("error").inspect(x => console.log(x)); // Returns Err("error")
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
   * Err("error").inspectErr(e => console.error(e)); // Logs "error", returns Err("error")
   * Ok(5).inspectErr(e => console.error(e)); // Returns Ok(5)
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
   * Ok(5).expect("should be Ok"); // 5
   * // Err("fail").expect("should be Ok"); // Throws "should be Ok: fail"
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
   * Ok(5).unwrap(); // 5
   * // Err("fail").unwrap(); // Throws "Tried to unwrap Error: fail"
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
   * Ok(5).unwrapOr(0); // 5
   * Err("error").unwrapOr(0); // 0
   * Err("error").unwrapOr("default"); // "default"
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
   * Ok(5).unwrapOrElse(() => 0); // 5
   * Err("error").unwrapOrElse(e => e.length); // 5
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
   * Ok(2).and(Ok("late success")).unwrap(); // "late success"
   * Err("early").and(Ok("late success")).err(); // "early"
   * Ok(2).and(Err("late error")).err(); // "late error"
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
   * Ok(5).andThen(x => Ok(x > 0)).unwrap(); // true
   * Ok(-1).andThen(x => x > 0 ? Ok(x) : Err("neg")).err(); // "neg"
   * Err("init").andThen(x => Ok(x > 0)).err(); // "init"
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
   * Ok(5).or(Ok(10)).unwrap(); // 5
   * Err("error").or(Ok(10)).unwrap(); // 10
   * Err("error1").or(Err(2)).err(); // 2
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
   * Ok(5).orElse(e => Ok(0)).unwrap(); // 5
   * Err("error").orElse(e => Ok(0)).unwrap(); // 0
   * Err("fail").orElse(e => Err(e.length)).err(); // 4
   * ```
   */
  orElse<F>(fn: (value: E) => Result<T, F>): Result<T, F>;

  /**
   * Returns a new Result containing a clone of the contained Ok value.
   * Uses `structuredClone` for objects. Primitive values are copied directly.
   * Does *not* clone the Err value.
   * @returns A new Result with a clone of the Ok value, or the original Err value.
   * @note Not a standard Rust Result method. Uses `structuredClone`.
   * @example
   * ```typescript
   * Ok({ a: 1 }).cloned().unwrap(); // { a: 1 } (new object)
   * Err("error").cloned().err(); // "error"
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
   * Err("error").expectErr("should be Err"); // "error"
   * // Ok(5).expectErr("should be Err"); // Throws "should be Err: 5"
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
   * Err("error").unwrapErr(); // "error"
   * // Ok(5).unwrapErr(); // Throws "Tried to unwrap Ok value: 5"
   * ```
   */
  unwrapErr(): E;

  /**
   * Executes one of two provided functions based on whether the Result is Ok or Err.
   * This allows for pattern matching on the Result type.
   *
   * @template U The return type of the `Ok` handler.
   * @template V The return type of the `Err` handler.
   * @param matcher An object containing `Ok` and `Err` functions.
   * @returns The value returned by the executed handler (`U` or `V`).
   * @note Inspired by Rust's `match` expression, but not a standard method on Rust's `Result`.
   * @example
   * ```typescript
   * const result: Result<number, string> = Ok(10);
   * const message = result.match({
   *   Ok: (value) => `Success: ${value}`,
   *   Err: (error) => `Error: ${error}`
   * });
   * // message is "Success: 10"
   *
   * const result2: Result<number, string> = Err("Failed");
   * const message2 = result2.match({
   *   Ok: (value) => `Success: ${value}`,
   *   Err: (error) => `Error: ${error}`
   * });
   * // message2 is "Error: Failed"
   * ```
   */
  match<U, V>(matcher: ResultMatcher<T, E, U, V>): U | V;

  /**
 * Represents the Result's state as a tuple `[error, value]`.
 * Useful for destructuring assignments.
 * - If `Ok(v)`, returns `[undefined, v]`.
 * - If `Err(e)`, returns `[e, undefined]`.
 * @returns A tuple representing the error and value state: `[E, undefined] | [undefined, T]`.
 * @note Not a standard Rust Result method.
 * @example
 * ```typescript
 * const [err, val] = Ok(10).asTuple(); // err is undefined, val is 10
 * const [err2, val2] = Err("fail").asTuple(); // err2 is "fail", val2 is undefined
 * ```
 */
  asTuple(): [E, undefined] | [undefined, T];

  /**
   * Represents the Result's state as an object `{ error, value }`.
   * Useful for destructuring assignments with named properties.
   * - If `Ok(v)`, returns `{ error: undefined, value: v }`.
   * - If `Err(e)`, returns `{ error: e, value: undefined }`.
   * @returns An object representing the error and value state: `{ error: E; value: undefined } | { error: undefined; value: T }`.
   * @note Not a standard Rust Result method.
   * @example
   * ```typescript
   * const { error, value } = Ok(10).asObject(); // error is undefined, value is 10
   * const { error: err2, value: val2 } = Err("fail").asObject(); // err2 is "fail", val2 is undefined
   * ```
   */
  asObject(): { error: E, value: undefined } | { error: undefined, value: T };
}

/**
 * @internal Implementation of the Ok case for Result. Users should use the `Ok` factory function.
 */
class OkImpl<T, E = never> implements BaseResult<T, E> {
  readonly #value!: T;

  constructor(value: T) {
    if (!(this instanceof OkImpl)) {
      return new OkImpl(value);
    }
    this.#value = value;
  }

  asTuple(): [undefined, T] {
    return [undefined, this.#value];
  }

  asObject(): { error: undefined; value: T; } {
    return { error: undefined, value: this.#value };
  }

  isOk(): true { return true; }
  isOkAnd(fn: (value: T) => boolean): boolean { return fn(this.#value); }
  isErr(): false { return false; }
  isErrAnd(_fn: (value: E) => boolean): false { return false; }
  ok(): Option<T> { return Some(this.#value); }
  err(): Option<E> { return None; }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return Ok(fn(this.#value));
  }

  mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  mapOrElse<U>(_defaultFn: (err: E) => U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  mapErr<F>(_fn: (value: E) => F): Result<T, F> {
    // Type assertion is safe because the E type parameter is unused in OkImpl.
    return this as unknown as Result<T, F>;
  }

  inspect(fn: (value: T) => void): Result<T, E> {
    fn(this.#value);
    return this;
  }

  inspectErr(_fn: (value: E) => void): Result<T, E> {
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

  unwrapOrElse<U>(_fn: (value: E) => U): T {
    return this.#value;
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.#value);
  }

  or<F>(_res: Result<T, F>): Result<T, F> {
    // Type assertion is safe because the E type parameter is unused in OkImpl.
    return this as unknown as Result<T, F>;
  }

  orElse<F>(_fn: (value: E) => Result<T, F>): Result<T, F> {
    // Type assertion is safe because the E type parameter is unused in OkImpl.
    return this as unknown as Result<T, F>;
  }

  cloned(): Result<T, E> {
    try {
      const clonedValue = structuredClone(this.#value);
      return Ok(clonedValue);
    } catch (e) {
      console.warn("Failed to structuredClone Ok value:", this.#value, e);
      return this;
    }
  }

  expectErr(message: string): E {
    throw new Error(`${message}: ${toString(this.#value)}`);
  }

  unwrapErr(): E {
    throw new Error(`Tried to unwrap Ok value: ${toString(this.#value)}`);
  }

  match<U, V>(matcher: ResultMatcher<T, E, U, V>): U | V {
    return matcher.Ok(this.#value);
  }

  [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
    const value = this.#value as T;
    if (value !== null && value !== undefined && typeof (value as any)[Symbol.iterator] === "function") {
      return (value as unknown as Iterable<T extends Iterable<infer U> ? U : never>)[Symbol.iterator]();
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
    if (!(this instanceof ErrImpl)) {
      return new ErrImpl(value);
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

  asTuple(): [E, undefined] {
    return [this.#value, undefined];
  }

  asObject(): { error: E, value: undefined } {
    return { error: this.#value, value: undefined };
  }

  isOk(): false { return false; }
  isOkAnd(_fn: (value: T) => boolean): false { return false; }
  isErr(): true { return true; }
  isErrAnd(fn: (value: E) => boolean): boolean { return fn(this.#value); }
  ok(): Option<T> { return None; }
  err(): Option<E> { return Some(this.#value); }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    // Type assertion is safe because the T type parameter is unused in ErrImpl.
    return this as unknown as Result<U, E>;
  }

  mapOr<U>(defaultValue: U, _fn: (value: T) => U): U {
    return defaultValue;
  }

  mapOrElse<U>(defaultFn: (err: E) => U, _fn: (value: T) => U): U {
    return defaultFn(this.#value);
  }

  mapErr<F>(fn: (value: E) => F): Result<T, F> {
    return Err(fn(this.#value));
  }

  inspect(_fn: (value: T) => void): Result<T, E> {
    return this;
  }

  inspectErr(fn: (value: E) => void): Result<T, E> {
    fn(this.#value);
    return this;
  }

  expect(message: string): T {
    throw new Error(`${message}: ${toString(this.#value)}\n${this.#stack}`);
  }

  unwrap(): T {
    throw new Error(`Tried to unwrap Error: ${toString(this.#value)}\n${this.#stack}`);
  }

  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  unwrapOrElse<U>(fn: (value: E) => U): U {
    return fn(this.#value);
  }

  and<U>(_res: Result<U, E>): Result<U, E> {
    // Type assertion is safe as T is unused.
    return this as unknown as Result<U, E>;
  }

  andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    // Type assertion is safe as T is unused.
    return this as unknown as Result<U, E>;
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

  match<U, V>(matcher: ResultMatcher<T, E, U, V>): U | V {
    return matcher.Err(this.#value);
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
 * @template E The error type (typically `never` for Ok).
 * @example
 * ```typescript
 * Ok(10).unwrap(); // 10
 * ```
 */
export type Ok<T, E = never> = OkImpl<T, E>;
export const Ok = <T>(value: T): Ok<T, never> => new OkImpl(value);

/**
 * Represents the failure case (`Err`) of a {@link Result}.
 * Contains the error value of type `E`.
 * @template E The type of the error value.
 * @template T The type of the success value (usually `never` for Err).
 * @example
 * ```typescript
 * Err("fail").unwrapErr(); // "fail"
 * ```
 */
export type Err<T = never, E = unknown> = ErrImpl<T, E>;
export const Err = <E>(value: E): Err<never, E> => new ErrImpl(value);

/**
 * `Result<T, E>` is a type that represents either success (`Ok<T>`) or failure (`Err<E>`).
 * It's commonly used for error handling without resorting to exceptions.
 * @template T The type of the successful result.
 * @template E The type of the error result.
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>;


/**
 * Default error transformation function used by `Result.from` and `Result.fromAsync`.
 * Extracts the `message` property if the error is an `Error` instance, otherwise returns the error as is.
 * @param error The caught error.
 * @returns The transformed error, typically a string or the original error.
 * @note Not a standard Rust Result method. Helper for `Result.from` and `Result.fromAsync`.
 * @example
 * ```typescript
 * defaultErrorTransform(new Error("Failed")); // "Failed"
 * defaultErrorTransform("Just string"); // "Just string"
 * ```
 */
function defaultErrorTransform<E = unknown>(error: unknown): E {
  return (error instanceof Error ? error.message : error) as E;
}


interface ResultTypeStatics {
  /**
   * Wraps a synchronous function that might throw an error or return a Result,
   * returning its outcome as a `Result<T, E>`. Executes the function immediately.
   * - If `fn()` returns a `Result`, it's returned directly.
   * - If `fn()` returns a value `v`, it's wrapped in `Ok(v)`.
   * - If `fn()` throws an error, it's caught and returned as `Err(transformedError)`.
   *
   * @template T The type of the successful result of `fn` (if it doesn't return a Result).
   * @template E The type of the error value in the returned `Err`. Defaults to `unknown`.
   * @param fn The synchronous function to wrap and execute.
   * @param errorTransform An optional function to transform a caught error into the desired error type `E`.
   * Defaults to extracting `error.message` if it's an Error instance, otherwise uses the error directly.
   * @returns A `Result<T, E>` representing the outcome.
   * @note Not a standard Rust Result method. Convenience for converting throwing functions or existing Results.
   * @example
   * ```typescript
   * Result.from(() => JSON.parse('{"a": 1}')).unwrap(); // { a: 1 }
   * Result.from(() => JSON.parse('invalid')).isErr(); // true
   * Result.from(() => Ok(10)).unwrap(); // 10
   * Result.from(() => { throw "err"; }, (e) => ({ m: e })).err(); // { m: "err" }
   * ```
   */
  from<T, E = unknown>(
    fn: () => T | Result<T, any>,
    errorTransform?: (error: unknown) => E
  ): Result<T, E>;

  /**
   * Wraps an asynchronous function (returning a Promise) that might throw, reject,
   * or resolve with a Result, returning its outcome as a `Promise<Result<T, E>>`.
   * Executes the function immediately and awaits its result.
   * - If the promise resolves with a `Result`, it's returned directly.
   * - If the promise resolves with a value `v`, it's wrapped in `Ok(v)`.
   * - If the function throws synchronously or the promise rejects, the error is caught and returned as `Err(transformedError)`.
   *
   * @template T The type of the successful resolved value (if it's not a Result).
   * @template E The type of the error value in the returned `Err`. Defaults to `unknown`.
   * @param fn The asynchronous function to wrap and execute. It should return `Promise<T>` or `Promise<Result<T, any>>`.
   * @param errorTransform An optional function to transform a caught error (sync or async) into the desired error type `E`.
   * Defaults to extracting `error.message` if it's an Error instance, otherwise uses the error directly.
   * @returns A `Promise<Result<T, E>>` representing the eventual outcome.
   * @note Not a standard Rust Result method. Convenience for handling Promises.
   * @example
   * ```typescript
   * // Assuming async functions:
   * // await Result.fromAsync(async () => 5); // Resolves to Ok(5)
   * // await Result.fromAsync(async () => { throw "err"; }); // Resolves to Err("err")
   * // await Result.fromAsync(async () => Ok(10)); // Resolves to Ok(10)
   * ```
   */
  fromAsync<T, E = unknown>(
    fn: () => Promise<T | Result<T, any>>,
    errorTransform?: (error: unknown) => E
  ): Promise<Result<T, E>>;

  /**
   * Checks if a value is a Result (either Ok or Err) created by this library.
   * Useful for type guards or conditional logic based on whether a value is a Result.
   * @param value The value to check.
   * @returns True if the value is an Ok or Err instance, false otherwise.
   * @note Not a standard Rust Result method. Utility for type checking.
   * @example
   * ```typescript
   * Result.isResult(Ok(1)); // true
   * Result.isResult(Err("error")); // true
   * Result.isResult(123); // false
   * Result.isResult(null); // false
   * ```
   */
  isResult<T, E>(value: unknown): value is Result<T, E>;
}

/**
 * Provides static methods for creating and handling Result instances.
 */
export const Result: ResultTypeStatics = {
  from<T, E = unknown>(
    fn: () => T | Result<T, any>,
    errorTransform: (error: unknown) => E = defaultErrorTransform
  ): Result<T, E> {
    try {
      const value = fn();
      if (Result.isResult<T, E>(value)) {
        return value as Result<T, E>;
      }
      return Ok(value as T);
    } catch (error) {
      return Err(errorTransform(error));
    }
  },

  async fromAsync<T, E = unknown>(
    fn: () => Promise<T | Result<T, any>>,
    errorTransform: (error: unknown) => E = defaultErrorTransform
  ): Promise<Result<T, E>> {
    try {
      const value = await fn();
      if (Result.isResult<T, E>(value)) {
        return value as Result<T, E>;
      }
      return Ok(value as T);
    } catch (error) {
      return Err(errorTransform(error));
    }
  },

  isResult<T, E>(value: unknown): value is Result<T, E> {
    return value instanceof OkImpl || value instanceof ErrImpl;
  }
};

