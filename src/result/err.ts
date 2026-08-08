import type { BaseResult, ResultMatcher } from "./types.ts";
import type { Option } from "../option/index.ts";
import { None, Some } from "../option/index.ts";
import { Err } from "./result.ts";
import type { Result } from "./result.ts";
import { toString } from "../utils.ts";

/**
 * @internal
 * Implementation of the Err case for Result. Users should use the `Err` factory function.
 */
export class ErrImpl<T = never, E = unknown> implements BaseResult<T, E> {
  readonly #value!: E;

  /**
   * @internal
   * Creates an Err instance.
   * @param value The error value.
   */
  constructor(value: E) {
    if (!(this instanceof ErrImpl)) {
      return new ErrImpl(value);
    }
    this.#value = value;
  }

  /** @inheritDoc */
  asTuple(): [E, undefined] {
    return [this.#value, undefined];
  }

  /** @inheritDoc */
  asObject(): { error: E; value: undefined } {
    return { error: this.#value, value: undefined };
  }

  /** @inheritDoc */
  isOk(): false {
    return false;
  }
  /** @inheritDoc */
  isOkAnd(_fn: (value: T) => boolean): false {
    return false;
  }
  /** @inheritDoc */
  isErr(): true {
    return true;
  }
  /** @inheritDoc */
  isErrAnd(fn: (value: E) => boolean): boolean {
    return fn(this.#value);
  }
  /** @inheritDoc */
  ok(): Option<T> {
    return None();
  }
  /** @inheritDoc */
  err(): Option<E> {
    return Some(this.#value);
  }

  /** @inheritDoc */
  map<U>(_fn: (value: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  /** @inheritDoc */
  mapOr<U>(defaultValue: U, _fn: (value: T) => U): U {
    return defaultValue;
  }

  /** @inheritDoc */
  mapOrElse<U>(defaultFn: (err: E) => U, _fn: (value: T) => U): U {
    return defaultFn(this.#value);
  }

  /** @inheritDoc */
  mapErr<F>(fn: (value: E) => F): Result<T, F> {
    return Err(fn(this.#value));
  }

  /** @inheritDoc */
  inspect(_fn: (value: T) => void): Result<T, E> {
    return this;
  }

  /** @inheritDoc */
  inspectErr(fn: (value: E) => void): Result<T, E> {
    fn(this.#value);
    return this;
  }

  /** @inheritDoc */
  expect(message: string): T {
    throw new Error(`${message}: ${toString(this.#value)}`);
  }

  /** @inheritDoc */
  unwrap(): T {
    throw new Error(`Tried to unwrap Error: ${toString(this.#value)}`);
  }

  /** @inheritDoc */
  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  /** @inheritDoc */
  unwrapOrElse(fn: (value: E) => T): T {
    return fn(this.#value);
  }

  /** @inheritDoc */
  and<U>(_res: Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  /** @inheritDoc */
  andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  /** @inheritDoc */
  or<F>(res: Result<T, F>): Result<T, F> {
    return res;
  }

  /** @inheritDoc */
  orElse<F>(fn: (value: E) => Result<T, F>): Result<T, F> {
    return fn(this.#value);
  }

  /** @inheritDoc */
  cloned(): Result<T, E> {
    return this;
  }

  /** @inheritDoc */
  expectErr(_message: string): E {
    return this.#value;
  }

  /** @inheritDoc */
  unwrapErr(): E {
    return this.#value;
  }

  /** @inheritDoc */
  match<U, V>(matcher: ResultMatcher<T, E, U, V>): U | V {
    return matcher.Err(this.#value);
  }

  /** @inheritDoc */
  flatten<U, F>(): Result<U, E | F> {
    return this as unknown as Result<U, E | F>;
  }

  /** @inheritDoc */
  transpose<U>(): Option<Result<U, E>> {
    return Some(Err(this.#value));
  }

  /** @inheritDoc */
  unwrapOrDefault(): T {
    throw new Error(
      "Cannot unwrap Err to default value. TypeScript doesn't have a Default trait. Use unwrapOr(defaultValue) instead.",
    );
  }

  /** @inheritDoc */
  mapOrDefault<U>(defaultValue: U, _fn: (value: T) => U): U {
    return defaultValue;
  }

  /** @inheritDoc */
  contains(_value: unknown): boolean {
    return false;
  }

  /** @inheritDoc */
  iter(): Iterable<T> {
    return {
      [Symbol.iterator](): Iterator<T> {
        return {
          next(): IteratorResult<T> {
            return { done: true, value: undefined! };
          },
        };
      },
    };
  }

  /**
   * Returns an iterator over the contained Ok value, if it is itself iterable.
   * Since an `Err` contains no Ok value, this iterator always yields nothing.
   * @returns An empty iterator.
   * @example
   * ```typescript
   * for (const x of Err("error")) console.log(x); // (nothing)
   * ```
   */
  [Symbol.iterator](): Iterator<never> {
    return {
      next(): IteratorResult<never> {
        return { done: true, value: undefined! };
      },
    };
  }
}
