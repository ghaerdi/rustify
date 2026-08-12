/** @internal */
export interface OptionMatcher<T, U, V> {
  Some: (value: T) => U;
  None: () => V;
}

/** @internal Shared interface for the internal strategy classes. */
export interface BaseOptionStrategy<T> {
  /** The variant discriminant: `"some"` or `"none"`. */
  readonly tag: "some" | "none";
  isSome(): boolean;
  isSomeAnd(fn: (value: T) => boolean): boolean;
  isNone(): boolean;
  expect(message: string): T;
  unwrap(): T;
  unwrapOr(defaultValue: T): T;
  unwrapOrElse(fn: () => T): T;
  map<U>(fn: (value: T) => U): BaseOptionStrategy<U>;
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U;
  mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;
  inspect(fn: (value: T) => void): BaseOptionStrategy<T>;
  and<U>(res: BaseOptionStrategy<U>): BaseOptionStrategy<U>;
  andThen<U>(fn: (value: T) => BaseOptionStrategy<U>): BaseOptionStrategy<U>;
  or(res: BaseOptionStrategy<T>): BaseOptionStrategy<T>;
  orElse(fn: () => BaseOptionStrategy<T>): BaseOptionStrategy<T>;
  xor(optb: BaseOptionStrategy<T>): BaseOptionStrategy<T>;
  cloned(): BaseOptionStrategy<T>;
  zip<U>(other: BaseOptionStrategy<U>): BaseOptionStrategy<[T, U]>;
  zipWith<U, R>(
    other: BaseOptionStrategy<U>,
    fn: (s: T, o: U) => R,
  ): BaseOptionStrategy<R>;
  match<U, V>(matcher: OptionMatcher<T, U, V>): U | V;
  flatten<U>(): BaseOptionStrategy<U>;
  filter(predicate: (value: T) => boolean): BaseOptionStrategy<T>;
  okOr<E>(err: E): import("../result/index.ts").Result<T, E>;
  okOrElse<E>(fn: () => E): import("../result/index.ts").Result<T, E>;
  transpose<U, E>(): import("../result/index.ts").Result<
    BaseOptionStrategy<U>,
    E
  >;
  unwrapOrDefault(): T;
  getOrInsert(value: T): T;
  getOrInsertWith(f: () => T): T;
  take(): BaseOptionStrategy<T>;
  takeIf(predicate: (value: T) => boolean): BaseOptionStrategy<T>;
  contains(value: T): boolean;
}
