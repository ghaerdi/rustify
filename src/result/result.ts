/**
 * @module result
 *
 * Provides the `Result` type for representing operations that may succeed or fail.
 *
 * A `Result<T, E>` is either `Ok(value)` (containing a success value of type `T`)
 * or `Err(error)` (containing a failure value of type `E`). This enables explicit
 * error handling without throwing exceptions.
 *
 * ## Creating Results
 *
 * ```typescript
 * import { Ok, Err, Result } from "@ghaerdi/rustify/result";
 *
 * const success: Result<number, string> = Ok(42);
 * const failure: Result<number, string> = Err("something went wrong");
 *
 * // From a throwing function
 * const parsed = Result.from(() => JSON.parse("{\"x\": 1}"));
 *
 * // From an async function
 * const data = await Result.fromAsync(() => fetch("/api/data"));
 * ```
 *
 * ## Working with Results
 *
 * Results support functional chaining for error propagation:
 *
 * ```typescript
 * Ok(5)
 *   .map(x => x * 2)          // Ok(10)
 *   .andThen(x => x > 15 ? Err("too large") : Ok(x)) // Ok(10)
 *   .mapErr(e => new Error(e)) // Ok(10)
 *   .unwrap();                 // 10
 * ```
 *
 * ## Pattern Matching
 *
 * ```typescript
 * const message = result.match({
 *   Ok: (value) => `Success: ${value}`,
 *   Err: (error) => `Failed: ${error}`,
 * });
 * ```
 *
 * @see {@link Ok} to create a success value
 * @see {@link Err} to create a failure value
 */

import { OkImpl } from "./ok.ts";
import { ErrImpl } from "./err.ts";

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

/**
 * Creates a new `Ok` result containing the given success value.
 * @template T The type of the success value.
 * @param value The success value to wrap in a Result.
 * @returns An `Ok<T>` result containing `value`.
 * @example
 * ```typescript
 * Ok(42).unwrap(); // 42
 * ```
 */
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

/**
 * Creates a new `Err` result containing the given error value.
 * @template E The type of the error value.
 * @param value The error value to wrap in a Result.
 * @returns An `Err<E>` result containing `value`.
 * @example
 * ```typescript
 * Err("something went wrong").unwrapErr(); // "something went wrong"
 * ```
 */
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

/** Static methods for creating and checking `Result` values. */
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
    errorTransform?: (error: unknown) => E,
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
    errorTransform?: (error: unknown) => E,
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
  /** @inheritDoc */
  from<T, E = unknown>(
    fn: () => T | Result<T, any>,
    errorTransform: (error: unknown) => E = defaultErrorTransform,
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

  /** @inheritDoc */
  async fromAsync<T, E = unknown>(
    fn: () => Promise<T | Result<T, any>>,
    errorTransform: (error: unknown) => E = defaultErrorTransform,
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

  /** @inheritDoc */
  isResult<T, E>(value: unknown): value is Result<T, E> {
    return value instanceof OkImpl || value instanceof ErrImpl;
  },
};
