import type { BaseOptionStrategy, OptionMatcher } from "./types.ts";
import { Err, Ok } from "../result/index.ts";

/** @internal Strategy for the None variant. */
export class NoneStrategy<T> implements BaseOptionStrategy<T> {
  /** @internal Literal discriminant used for discriminated-union narrowing. */
  readonly __tag = "none" as const;
  isSome(): boolean {
    return false;
  }
  isSomeAnd(_fn: (value: T) => boolean): boolean {
    return false;
  }
  isNone(): boolean {
    return true;
  }
  expect(message: string): T {
    throw new Error(message);
  }
  unwrap(): T {
    throw new Error("Tried to unwrap a None value");
  }
  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }
  unwrapOrElse(fn: () => T): T {
    return fn();
  }
  map<U>(_fn: (value: T) => U): NoneStrategy<U> {
    return new NoneStrategy<U>();
  }
  mapOr<U>(defaultValue: U, _fn: (value: T) => U): U {
    return defaultValue;
  }
  mapOrElse<U>(defaultFn: () => U, _fn: (value: T) => U): U {
    return defaultFn();
  }
  inspect(_fn: (value: T) => void): this {
    return this;
  }
  and<U>(_res: BaseOptionStrategy<U>): BaseOptionStrategy<U> {
    return new NoneStrategy<U>();
  }
  andThen<U>(_fn: (value: T) => BaseOptionStrategy<U>): BaseOptionStrategy<U> {
    return new NoneStrategy<U>();
  }
  or(res: BaseOptionStrategy<T>): BaseOptionStrategy<T> {
    return res;
  }
  orElse(fn: () => BaseOptionStrategy<T>): BaseOptionStrategy<T> {
    return fn();
  }
  xor(optb: BaseOptionStrategy<T>): BaseOptionStrategy<T> {
    return optb;
  }
  cloned(): BaseOptionStrategy<T> {
    return this;
  }
  zip<U>(_other: BaseOptionStrategy<U>): BaseOptionStrategy<[T, U]> {
    return new NoneStrategy<[T, U]>();
  }
  zipWith<U, R>(
    _other: BaseOptionStrategy<U>,
    _fn: (s: T, o: U) => R,
  ): BaseOptionStrategy<R> {
    return new NoneStrategy<R>();
  }
  match<U, V>(matcher: OptionMatcher<T, U, V>): U | V {
    return matcher.None();
  }
  flatten<U>(): BaseOptionStrategy<U> {
    return new NoneStrategy<U>();
  }
  filter(_predicate: (value: T) => boolean): BaseOptionStrategy<T> {
    return this;
  }
  okOr<E>(err: E): import("../result/index.ts").Result<T, E> {
    return Err(err);
  }
  okOrElse<E>(fn: () => E): import("../result/index.ts").Result<T, E> {
    return Err(fn());
  }
  transpose<U, E>(): import("../result/index.ts").Result<
    BaseOptionStrategy<U>,
    E
  > {
    return Ok(new NoneStrategy<U>());
  }
  unwrapOrDefault(): T {
    throw new Error(
      "Cannot unwrap None to default value. TypeScript doesn't have a Default trait. Use unwrapOr(defaultValue) instead.",
    );
  }
  asSlice(): T[] {
    return [];
  }
  getOrInsert(_value: T): T {
    throw new Error(
      "Cannot call getOrInsert on NoneStrategy — use OptionImpl.getOrInsert instead.",
    );
  }
  getOrInsertWith(_f: () => T): T {
    throw new Error(
      "Cannot call getOrInsertWith on NoneStrategy — use OptionImpl.getOrInsertWith instead.",
    );
  }
  take(): BaseOptionStrategy<T> {
    return this;
  }
  takeIf(_predicate: (value: T) => boolean): BaseOptionStrategy<T> {
    return this;
  }
  contains(_value: T): boolean {
    return false;
  }
}
