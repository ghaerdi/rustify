import { Option, Some, None } from "./option.ts";
import { toString } from "./utils.ts";

interface BaseResult<T, E> extends Iterable<T extends Iterable<infer U> ? U : never> {
  isOk(): boolean
  isOkAnd(fn: (value: T) => boolean): boolean;
  isErr(): boolean;
  isErrAnd(fn: (value: E) => boolean): boolean;
  ok(): Option<T>;
  err(): Option<E>;
  // map<U>(fn: (value: T) => U): Result<U, E>;
  // mapOr<U>(defaultValue: U, fn: (value: T) => U): U;
  // mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;
  // mapErr<F>(fn: (value: E) => F): Result<T, F>;
  // inspect(fn: (value: T) => void): Result<T, E>;
  // inspectErr(fn: (value: E) => void): Result<T, E>;
  // iter(): Iterator<T extends Iterable<infer U> ? U : never>;
  expect(message: string): T;
  unwrap(): T
  // unwrapOrDefault(): T;
  // expectErr(message: string): E;
  // unwrapErr(): E;
  // intoOk(): T;
  // intoErr(): E;
  // and<U>(res: Result<U, E>): Result<U, E>;
  // andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  // or<F>(res: Result<T, F>): Result<T, F>;
  // orElse<F>(fn: (value: E) => Result<T, F>): Result<T, F>;
  unwrapOr<U>(defaultValue: U): T | U;
  // unwrapOrElse<U>(fn: (value: E) => U): T | U;
  // unwrapUnchecked(): T;
  // unwrapErrUnchecked(): E;
}

class OkImpl<T> implements BaseResult<T, never> {
  readonly #value!: T;

  constructor(value: T) {
    if (this instanceof OkImpl === false) {
      return new OkImpl(value)
    }
    this.#value = value;
  }

  isOkAnd(fn: (value: T) => boolean): boolean {
    return fn(this.#value)
  }
  isOk(): boolean {
    return true
  }
  isErr(): boolean {
    return false
  }
  isErrAnd(_fn: (value: never) => boolean): boolean {
    return false
  }
  expect(_message: string): T {
    return this.#value
  }
  unwrap(): T {
    return this.#value
  }
  unwrapOr<U>(_defaultValue: U): T | U {
    return this.#value
  }
  ok(): Option<T> {
    return Some(this.#value)
  }
  err(): Option<never> {
    return None
  }

  [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
    const obj = Object(this.#value) as Iterable<any>;

    return Symbol.iterator in obj
      ? obj[Symbol.iterator]()
      : {
        next(): IteratorResult<T extends Iterable<infer U> ? U : never> {
          return { done: true, value: undefined! }
        }
      }
  }
}

export const Ok = <T>(value: T) => new OkImpl(value);
export type Ok<T> = OkImpl<T>;

class ErrImpl<E> implements BaseResult<never, E> {
  readonly #stack!: string;
  readonly #value!: E;

  constructor(value: E) {
    if (this instanceof ErrImpl === false) {
      return new ErrImpl(value)
    }

    const stackLines = new Error().stack!.split("\n").slice(2);
    if (stackLines?.length && stackLines[0].startsWith("ErrImpl")) {
      stackLines.shift();
    }

    this.#stack = stackLines.join("\n");
    this.#value = value;
  }

  isOkAnd(_fn: (value: never) => boolean): boolean {
    return false;
  }
  isOk(): boolean {
    return false
  }
  isErr(): boolean {
    return true
  }
  isErrAnd(fn: (value: E) => boolean): boolean {
    return fn(this.#value)
  }
  expect(message: string): never {
    throw new Error(`${message}: ${toString(this.#value)}\n${this.#stack}`)
  }
  unwrap(): never {
    throw new Error(`Tried to unwrap Error: ${toString(this.#value)}\n${this.#stack}`)
  }
  unwrapOr<U>(defaultValue: U): U {
    return defaultValue
  }
  ok(): Option<never> {
    return None
  }
  err(): Option<E> {
    return Some(this.#value)
  }

  [Symbol.iterator](): Iterator<never> {
    return {
      next(): IteratorResult<never> {
        return { done: true, value: undefined! }
      }
    }
  }
}

export const Err = <E>(value: E) => new ErrImpl(value);
export type Err<E> = ErrImpl<E>;

export type Result<T, E> = Ok<T> | Err<E>;

export function ResultWrapper<T, E>(fn: (...args: any[]) => T): (...args: any[]) => Result<T, E> {
  return (...args: any[]) => {
    try {
      return Ok(fn(...args));
    } catch (err) {
      return Err(err);
    }
  }
}
