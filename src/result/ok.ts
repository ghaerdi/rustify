import type { BaseResult, ResultMatcher } from "./types.ts";
import type { Option } from "../option/index.ts";
import { None, Some } from "../option/index.ts";
import { Ok } from "./result.ts";
import type { Result } from "./result.ts";
import { toString } from "../utils.ts";

/**
 * @internal
 * Implementation of the Ok case for Result. Users should use the `Ok` factory function.
 */
export class OkImpl<T, E = never> implements BaseResult<T, E> {
  readonly #value!: T;

  constructor(value: T) {
    if (!(this instanceof OkImpl)) {
      return new OkImpl(value);
    }
    this.#value = value;
  }

  /** @inheritDoc */
  asTuple(): [undefined, T] {
    return [undefined, this.#value];
  }

  /** @inheritDoc */
  asObject(): { error: undefined; value: T } {
    return { error: undefined, value: this.#value };
  }

  /** @inheritDoc */
  isOk(): true {
    return true;
  }
  /** @inheritDoc */
  isOkAnd(fn: (value: T) => boolean): boolean {
    return fn(this.#value);
  }
  /** @inheritDoc */
  isErr(): false {
    return false;
  }
  /** @inheritDoc */
  isErrAnd(_fn: (value: E) => boolean): false {
    return false;
  }
  /** @inheritDoc */
  ok(): Option<T> {
    return Some(this.#value);
  }
  /** @inheritDoc */
  err(): Option<E> {
    return None();
  }

  /** @inheritDoc */
  map<U>(fn: (value: T) => U): Result<U, E> {
    return Ok(fn(this.#value));
  }

  /** @inheritDoc */
  mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  /** @inheritDoc */
  mapOrElse<U>(_defaultFn: (err: E) => U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  /** @inheritDoc */
  mapErr<F>(_fn: (value: E) => F): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  /** @inheritDoc */
  inspect(fn: (value: T) => void): Result<T, E> {
    fn(this.#value);
    return this;
  }

  /** @inheritDoc */
  inspectErr(_fn: (value: E) => void): Result<T, E> {
    return this;
  }

  /** @inheritDoc */
  expect(_message: string): T {
    return this.#value;
  }

  /** @inheritDoc */
  unwrap(): T {
    return this.#value;
  }

  /** @inheritDoc */
  unwrapOr(_defaultValue: T): T {
    return this.#value;
  }

  /** @inheritDoc */
  unwrapOrElse(_fn: (value: E) => T): T {
    return this.#value;
  }

  /** @inheritDoc */
  unwrapErrOrElse(fn: (value: T) => E): E {
    return fn(this.#value);
  }

  /** @inheritDoc */
  intoOk(): T {
    return this.unwrap();
  }

  /** @inheritDoc */
  intoErr(): E {
    return this.unwrapErr();
  }

  /** @inheritDoc */
  and<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  /** @inheritDoc */
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.#value);
  }

  /** @inheritDoc */
  or<F>(_res: Result<T, F>): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  /** @inheritDoc */
  orElse<F>(_fn: (value: E) => Result<T, F>): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  /** @inheritDoc */
  cloned(): Result<T, E> {
    try {
      const clonedValue = structuredClone(this.#value);
      return Ok(clonedValue);
    } catch (e) {
      console.warn("Failed to structuredClone Ok value:", this.#value, e);
      return this;
    }
  }

  /** @inheritDoc */
  expectErr(message: string): E {
    throw new Error(`${message}: ${toString(this.#value)}`);
  }

  /** @inheritDoc */
  unwrapErr(): E {
    throw new Error(`Tried to unwrap Ok value: ${toString(this.#value)}`);
  }

  /** @inheritDoc */
  match<U, V>(matcher: ResultMatcher<T, E, U, V>): U | V {
    return matcher.Ok(this.#value);
  }

  /** @inheritDoc */
  flatten<U, F>(this: OkImpl<Result<U, F>, E>): Result<U, E | F> {
    return this.#value as Result<U, E | F>;
  }

  /** @inheritDoc */
  transpose<U>(this: OkImpl<Option<U>, E>): Option<Result<U, E>> {
    const option = this.#value as Option<U>;
    if (option.isSome()) {
      return Some(Ok(option.unwrap()));
    } else {
      return None();
    }
  }

  /** @inheritDoc */
  unwrapOrDefault(): T {
    return this.#value;
  }

  /** @inheritDoc */
  mapOrDefault<U>(_defaultValue: U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  /** @inheritDoc */
  contains(value: T): boolean {
    return this.#value === value;
  }

  /** @inheritDoc */
  iter(): Iterable<T> {
    const value = this.#value;
    return {
      [Symbol.iterator](): Iterator<T> {
        let done = false;
        return {
          next(): IteratorResult<T> {
            if (!done) {
              done = true;
              return { done: false, value };
            }
            return { done: true, value: undefined! };
          },
        };
      },
    };
  }

  /**
   * Returns an iterator over the contained Ok value, if it is itself iterable.
   * Used by `for...of` loops and spread syntax on a `Result`.
   * If the contained value is not iterable, yields nothing.
   * @returns An iterator over the elements of the contained Ok value.
   * @example
   * ```typescript
   * for (const x of Ok([1, 2, 3])) console.log(x); // 1, 2, 3
   * for (const x of Err("error")) console.log(x); // (nothing)
   * ```
   */
  [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
    const value = this.#value as T;
    if (
      value !== null && value !== undefined &&
      typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] ===
        "function"
    ) {
      return (value as unknown as Iterable<
        T extends Iterable<infer U> ? U : never
      >)[Symbol.iterator]();
    } else {
      return {
        next(): IteratorResult<T extends Iterable<infer U> ? U : never> {
          return { done: true, value: undefined! };
        },
      } as Iterator<T extends Iterable<infer U> ? U : never>;
    }
  }
}
