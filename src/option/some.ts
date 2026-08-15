import type { BaseOptionStrategy, OptionMatcher } from "./types.ts";
import { NoneStrategy } from "./none.ts";
import { Err, Ok } from "../result/index.ts";

/** @internal Strategy for the Some variant. */
export class SomeStrategy<T> implements BaseOptionStrategy<T> {
  /** @internal Literal discriminant used for discriminated-union narrowing. */
  readonly __tag = "some" as const;
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  isSome(): boolean {
    return true;
  }
  isSomeAnd(fn: (value: T) => boolean): boolean {
    return fn(this.#value);
  }
  isNone(): boolean {
    return false;
  }
  expect(_message: string): T {
    return this.#value;
  }
  unwrap(): T {
    return this.#value;
  }
  unwrapOr(_defaultValue: T): T {
    return this.#value;
  }
  unwrapOrElse(_fn: () => T): T {
    return this.#value;
  }
  map<U>(fn: (value: T) => U): SomeStrategy<U> {
    return new SomeStrategy(fn(this.#value));
  }
  mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
    return fn(this.#value);
  }
  mapOrElse<U>(_defaultFn: () => U, fn: (value: T) => U): U {
    return fn(this.#value);
  }
  inspect(fn: (value: T) => void): this {
    fn(this.#value);
    return this;
  }
  and<U>(res: BaseOptionStrategy<U>): BaseOptionStrategy<U> {
    return res;
  }
  andThen<U>(fn: (value: T) => BaseOptionStrategy<U>): BaseOptionStrategy<U> {
    return fn(this.#value);
  }
  or(_res: BaseOptionStrategy<T>): BaseOptionStrategy<T> {
    return this;
  }
  orElse(_fn: () => BaseOptionStrategy<T>): BaseOptionStrategy<T> {
    return this;
  }
  xor(optb: BaseOptionStrategy<T>): BaseOptionStrategy<T> {
    return optb.isSome() ? new NoneStrategy<T>() : this;
  }
  cloned(): BaseOptionStrategy<T> {
    try {
      return new SomeStrategy(structuredClone(this.#value));
    } catch (e) {
      console.warn("Failed to structuredClone Some value:", this.#value, e);
      return this;
    }
  }
  zip<U>(other: BaseOptionStrategy<U>): BaseOptionStrategy<[T, U]> {
    return other.isSome()
      ? new SomeStrategy([this.#value, other.unwrap()] as [T, U])
      : new NoneStrategy<[T, U]>();
  }
  zipWith<U, R>(
    other: BaseOptionStrategy<U>,
    fn: (s: T, o: U) => R,
  ): BaseOptionStrategy<R> {
    return other.isSome()
      ? new SomeStrategy(fn(this.#value, other.unwrap()))
      : new NoneStrategy<R>();
  }
  match<U, V>(matcher: OptionMatcher<T, U, V>): U | V {
    return matcher.Some(this.#value);
  }
  flatten<U>(): BaseOptionStrategy<U> {
    return this.#value as unknown as BaseOptionStrategy<U>;
  }
  filter(predicate: (value: T) => boolean): BaseOptionStrategy<T> {
    return predicate(this.#value) ? this : new NoneStrategy<T>();
  }
  okOr<E>(_err: E): import("../result/index.ts").Result<T, E> {
    return Ok(this.#value);
  }
  okOrElse<E>(_fn: () => E): import("../result/index.ts").Result<T, E> {
    return Ok(this.#value);
  }
  transpose<U, E>(): import("../result/index.ts").Result<
    BaseOptionStrategy<U>,
    E
  > {
    const result = this
      .#value as unknown as import("../result/index.ts").Result<U, E>;
    return result.isOk()
      ? Ok(new SomeStrategy(result.unwrap()))
      : Err(result.unwrapErr());
  }
  unwrapOrDefault(): T {
    return this.#value;
  }
  asSlice(): T[] {
    return [this.#value];
  }
  getOrInsert(_value: T): T {
    return this.#value;
  }
  getOrInsertWith(_f: () => T): T {
    return this.#value;
  }
  take(): BaseOptionStrategy<T> {
    return this;
  }
  takeIf(_predicate: (value: T) => boolean): BaseOptionStrategy<T> {
    return this;
  }
  contains(value: T): boolean {
    return this.#value === value;
  }
}
