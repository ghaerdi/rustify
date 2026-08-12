import type { BaseOptionStrategy, OptionMatcher } from "./types.ts";
import { SomeStrategy } from "./some.ts";
import { NoneStrategy } from "./none.ts";
import { PATTERN } from "../match/types.ts";
import type { AbsentPattern, ExtractPattern } from "../match/types.ts";
import { toString } from "../utils.ts";
import { Err, Ok } from "../result/index.ts";

/**
 * The method surface shared by every {@link Option}: the operations available
 * on both the `Some` and `None` variants. This interface is implemented by the
 * internal `OptionImpl` class and exists so the per-method documentation is
 * part of the public API.
 *
 * @template T The type of the contained value.
 */
export interface OptionMethods<T> {
  /**
   * @internal
   * The underlying strategy instance wrapped by this option.
   * Used by the library for strategy swapping; not part of the public API.
   */
  readonly _inner: BaseOptionStrategy<T>;

  /**
   * Returns `true` if the option is a `Some` value.
   * @example
   * ```typescript
   * Some(5).isSome(); // true
   * None().isSome(); // false
   * ```
   */
  isSome(): boolean;

  /**
   * Returns `true` if the option is `Some` and the value satisfies the predicate.
   * @param fn The predicate function to apply to the Some value.
   * @example
   * ```typescript
   * Some(5).isSomeAnd(x => x > 3); // true
   * Some(5).isSomeAnd(x => x < 3); // false
   * None().isSomeAnd(x => x > 3); // false
   * ```
   */
  isSomeAnd(fn: (value: T) => boolean): boolean;

  /**
   * Returns `true` if the option is `None`.
   * @example
   * ```typescript
   * None().isNone(); // true
   * Some(5).isNone(); // false
   * ```
   */
  isNone(): boolean;

  /**
   * Returns the contained `Some` value, or throws with `message` if `None`.
   * @param message The message to use if the option is None.
   * @returns The contained value.
   * @throws {Error} With `message` if the option is None.
   * @example
   * ```typescript
   * Some(5).expect("missing"); // 5
   * None().expect("missing"); // throws Error: missing
   * ```
   */
  expect(message: string): T;

  /**
   * Returns the contained `Some` value, or throws if `None`.
   * @returns The contained value.
   * @throws {Error} If the option is None.
   * @example
   * ```typescript
   * Some(5).unwrap(); // 5
   * None().unwrap(); // throws Error
   * ```
   */
  unwrap(): T;

  /**
   * Returns the contained value or `defaultValue` if `None`.
   * @param defaultValue The value to return if the option is None.
   * @example
   * ```typescript
   * Some(5).unwrapOr(0); // 5
   * None().unwrapOr(0); // 0
   * ```
   */
  unwrapOr(defaultValue: T): T;

  /**
   * Returns the contained value or computes it from `fn()` if `None`.
   * @param fn The closure to compute the default value.
   * @example
   * ```typescript
   * Some(5).unwrapOrElse(() => 0); // 5
   * None().unwrapOrElse(() => expensiveCompute()); // lazily computed
   * ```
   */
  unwrapOrElse(fn: () => T): T;

  /**
   * Maps `Some(value)` to `Some(fn(value))`, leaves `None` untouched.
   * @template U The type of the mapped value.
   * @param fn The function to apply to the Some value.
   * @example
   * ```typescript
   * Some(5).map(x => x * 2).unwrap(); // 10
   * None().map(x => x * 2).isNone(); // true
   * ```
   */
  map<U>(fn: (value: T) => U): Option<U>;

  /**
   * Applies `fn` to the value if `Some`, returns `defaultValue` if `None`.
   * @template U The return type.
   * @param defaultValue The value to return if None.
   * @param fn The function to apply to the Some value.
   * @example
   * ```typescript
   * Some(3).mapOr(0, x => x * 2); // 6
   * None().mapOr(0, x => x * 2); // 0
   * ```
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

  /**
   * Applies `fn` to the value if `Some`, calls `defaultFn()` if `None`.
   * @template U The return type.
   * @param defaultFn The function to compute the default if None.
   * @param fn The function to apply to the Some value.
   * @example
   * ```typescript
   * Some(3).mapOrElse(() => 0, x => x * 2); // 6
   * None().mapOrElse(() => 42, x => x * 2); // 42
   * ```
   */
  mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;

  /**
   * Calls `fn` with the value if `Some`, returns the original option.
   * Useful for debugging or side-effects without consuming the option.
   * @param fn The function to call with the Some value.
   * @returns The original `Option<T>`.
   * @example
   * ```typescript
   * Some(5).inspect(x => console.log(x)); // logs 5, returns Some(5)
   * None().inspect(x => console.log(x)); // does nothing, returns None
   * ```
   */
  inspect(fn: (value: T) => void): Option<T>;

  /**
   * Returns `res` if `Some`, otherwise returns `None`.
   * @template U The type of the other option's value.
   * @param res The option to return if self is Some.
   * @example
   * ```typescript
   * Some(2).and(Some("late success")).unwrap(); // "late success"
   * None().and(Some("late success")).isNone(); // true
   * ```
   */
  and<U>(res: Option<U>): Option<U>;

  /**
   * Calls `fn(value)` if `Some`, returns `None` otherwise. Also known as `flatMap`.
   * @template U The type of the value in the returned Option.
   * @param fn The function to call with the Some value, which must return an Option.
   * @example
   * ```typescript
   * Some(5).andThen(x => Some(x * 2)).unwrap(); // 10
   * Some(5).andThen(() => None()).isNone(); // true
   * ```
   */
  andThen<U>(fn: (value: T) => Option<U>): Option<U>;

  /**
   * Returns self if `Some`, otherwise returns `res`.
   * @param res The fallback option.
   * @example
   * ```typescript
   * Some(5).or(Some(10)).unwrap(); // 5
   * None().or(Some(10)).unwrap(); // 10
   * ```
   */
  or(res: Option<T>): Option<T>;

  /**
   * Returns self if `Some`, otherwise calls `fn()` and returns the result.
   * @param fn The function to produce a fallback option.
   * @example
   * ```typescript
   * None().orElse(() => Some(10)).unwrap(); // 10
   * ```
   */
  orElse(fn: () => Option<T>): Option<T>;

  /**
   * Returns `Some` if exactly one of self or `optb` is `Some`, otherwise `None`.
   * @param optb The other option.
   * @example
   * ```typescript
   * Some(1).xor(None()).unwrap(); // 1
   * None().xor(Some(2)).unwrap(); // 2
   * Some(1).xor(Some(2)).isNone(); // true
   * ```
   */
  xor(optb: Option<T>): Option<T>;

  /**
   * Returns a new `Option` with a deep clone of the value (via `structuredClone`).
   * @example
   * ```typescript
   * const original = Some({ a: 1 });
   * const clone = original.cloned();
   * original === clone; // false (different references)
   * ```
   */
  cloned(): Option<T>;

  /**
   * Zips two options into `Some([a, b])` if both are `Some`.
   * @template U The type of the other option's value.
   * @param other The other option to zip with.
   * @example
   * ```typescript
   * Some(1).zip(Some("a")).unwrap(); // [1, "a"]
   * Some(1).zip(None()).isNone(); // true
   * ```
   */
  zip<U>(other: Option<U>): Option<[T, U]>;

  /**
   * Zips two options using `fn` if both are `Some`.
   * @template U The type of the other option's value.
   * @template R The return type of the combining function.
   * @param other The other option.
   * @param fn The function to combine the two values.
   * @example
   * ```typescript
   * Some(1).zipWith(Some(2), (a, b) => a + b).unwrap(); // 3
   * ```
   */
  zipWith<U, R>(other: Option<U>, fn: (s: T, o: U) => R): Option<R>;

  /**
   * Pattern matches on `Some` or `None`.
   * @template U The return type of the `Some` handler.
   * @template V The return type of the `None` handler.
   * @param matcher An object with `Some` and `None` handler functions.
   * @returns The result of the executed handler.
   * @example
   * ```typescript
   * Some(5).match({ Some: x => "got " + x, None: () => "empty" }); // "got 5"
   * None().match({ Some: x => "got " + x, None: () => "empty" }); // "empty"
   * ```
   */
  match<U, V>(matcher: { Some: (value: T) => U; None: () => V }): U | V;

  /**
   * Flattens `Option<Option<T>>` to `Option<T>`, removing one level of nesting.
   * @example
   * ```typescript
   * Some(Some(5)).flatten().unwrap(); // 5
   * Some(None()).flatten().isNone(); // true
   * ```
   */
  flatten<U>(): Option<U>;

  /**
   * Returns `Some(value)` if `Some` and predicate passes, otherwise `None`.
   * @param predicate The function to test the contained value.
   * @example
   * ```typescript
   * Some(5).filter(x => x > 3).unwrap(); // 5
   * Some(5).filter(x => x > 10).isNone(); // true
   * ```
   */
  filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Converts to `Result<T, E>`: `Some(v)` becomes `Ok(v)`, `None` becomes `Err(err)`.
   * @template E The error type.
   * @param err The error value to use if None.
   * @example
   * ```typescript
   * Some(5).okOr("fail").unwrap(); // 5
   * None().okOr("fail").unwrapErr(); // "fail"
   * ```
   */
  okOr<E>(err: E): import("../result/index.ts").Result<T, E>;

  /**
   * Converts to `Result<T, E>`: `Some(v)` becomes `Ok(v)`, `None` becomes `Err(fn())`.
   * @template E The error type.
   * @param fn The function to lazily compute the error value.
   * @example
   * ```typescript
   * None().okOrElse(() => "computed").unwrapErr(); // "computed"
   * ```
   */
  okOrElse<E>(fn: () => E): import("../result/index.ts").Result<T, E>;

  /**
   * Transposes `Option<Result<T, E>>` into `Result<Option<T>, E>`.
   * `Ok(Some(v))` becomes `Some(Ok(v))`, `Ok(None)` becomes `None`, `Err(e)` becomes `Some(Err(e))`.
   * @example
   * ```typescript
   * Some(Ok(5)).transpose().unwrap().unwrap(); // 5
   * Some(Err("e")).transpose().unwrapErr(); // "e"
   * None().transpose().unwrap().isNone(); // true
   * ```
   */
  transpose<U, E>(): import("../result/index.ts").Result<Option<U>, E>;

  /**
   * Returns the contained value or throws (no `Default` trait in TypeScript).
   * @returns The contained value.
   * @throws {Error} Always throws for None.
   * @example
   * ```typescript
   * Some(5).unwrapOrDefault(); // 5
   * None().unwrapOrDefault(); // throws Error
   * ```
   */
  unwrapOrDefault(): T;

  /**
   * Inserts `value` into the option if it is `None`, then returns the contained value.
   * Mutates the option in place.
   * @param value The value to insert if None.
   * @example
   * ```typescript
   * const x = None<number>();
   * x.getOrInsert(10); // 10, x is now Some(10)
   * x.getOrInsert(20); // 10, already Some
   * ```
   */
  getOrInsert(value: T): T;

  /**
   * Inserts a value computed from `f()` if `None`, then returns the contained value.
   * Mutates the option in place. The closure is only called once.
   * @param f The function to compute the default value if None.
   * @example
   * ```typescript
   * const x = None<number>();
   * x.getOrInsertWith(() => expensiveCompute()); // only computes if None
   * ```
   */
  getOrInsertWith(f: () => T): T;

  /**
   * Takes the value out of the option, returning it as `Some`.
   * The original option becomes `None`.
   * @returns The value as a new `Some`, or `None` if already None.
   * @example
   * ```typescript
   * const x = Some(5);
   * const y = x.take(); // y is Some(5), x is now None
   * ```
   */
  take(): Option<T>;

  /**
   * Takes the value out if `Some` and the predicate returns `true`.
   * The original option becomes `None` if the predicate passes.
   * @param predicate The function to test the contained value.
   * @returns Some(value) if predicate passes, None otherwise.
   * @example
   * ```typescript
   * const x = Some(5);
   * x.takeIf(v => v === 5); // returns Some(5), x is now None
   * ```
   */
  takeIf(predicate: (value: T) => boolean): Option<T>;

  /**
   * Returns `true` if the option is `Some` and the value equals `value` (via `===`).
   * @param value The value to compare against.
   * @example
   * ```typescript
   * Some(5).contains(5); // true
   * Some(5).contains(10); // false
   * None().contains(5); // false
   * ```
   */
  contains(value: T): boolean;

  /**
   * Iterator protocol — yields the value if `Some` and the value is iterable.
   * @example
   * ```typescript
   * for (const item of Some([1, 2, 3])) {
   *   console.log(item); // 1, 2, 3
   * }
   * ```
   */
  [Symbol.iterator](): Iterator<any>;

  /**
   * Inserts `value` into the option, replacing the current contents, and
   * returns the inserted value. Mirrors Rust's `Option::insert`.
   *
   * @param value The value to insert.
   * @returns The inserted value.
   *
   * @example
   * ```typescript
   * const x = None<number>();
   * x.insert(5); // 5 — x is now Some(5)
   * ```
   */
  insert(value: T): T;

  /**
   * Replaces the current contents with `value`, returning the previous
   * contents as an `Option`. Mirrors Rust's `Option::replace`.
   *
   * @param value The replacement value.
   * @returns The previous option (`Some` with the old value, or `None`).
   *
   * @example
   * ```typescript
   * Some(5).replace(10).unwrap(); // 5
   * None<number>().replace(10); // None — now Some(10)
   * ```
   */
  replace(value: T): Option<T>;

  /**
   * Returns `true` if the option is `None`, or if it contains a value that
   * satisfies the predicate. Mirrors Rust's `Option::is_none_or`.
   *
   * @param fn The predicate applied to the contained value.
   * @returns `true` if `None` or the predicate matches.
   *
   * @example
   * ```typescript
   * None<number>().isNoneOr((x) => x > 3); // true
   * Some(5).isNoneOr((x) => x > 3); // true
   * Some(2).isNoneOr((x) => x > 3); // false
   * ```
   */
  isNoneOr(fn: (value: T) => boolean): boolean;

  /**
   * Returns `undefined` if the option is `None`, otherwise throws with
   * `message` (followed by the contained value). Mirrors Rust's
   * `Option::expect_none`.
   *
   * @param message The panic message (defaults to `"Tried to expect None"`).
   * @throws {Error} If the option is `Some`.
   *
   * @example
   * ```typescript
   * None().expectNone(); // undefined
   * Some(5).expectNone(); // throws "Tried to expect None: 5"
   * ```
   */
  expectNone(message?: string): void;

  /**
   * Returns the number of elements in the option: `1` for `Some`, `0` for
   * `None`. Mirrors Rust's `Option::count`.
   *
   * @returns `1` if `Some`, `0` if `None`.
   */
  count(): number;

  /**
   * Returns the option unchanged. TypeScript passes values by value, so
   * `Option<T>` is already a copy for primitives and a reference for objects
   * — unlike Rust, no explicit `Copy` step is needed. Mirrors Rust's
   * `Option::copied` for `Copy` types.
   *
   * @returns The same option.
   */
  copied(): Option<T>;

  /**
   * Converts `Option<[A, B]>` into a tuple of two options. Mirrors Rust's
   * `Option::unzip`.
   *
   * @template A The first element type of the pair.
   * @template B The second element type of the pair.
   * @returns `[Some(a), Some(b)]` for `Some([a, b])`, `[None, None]` for `None`.
   *
   * @example
   * ```typescript
   * Some([1, "a"] as [number, string]).unzip(); // [Some(1), Some("a")]
   * None<[number, string]>().unzip(); // [None(), None()]
   * ```
   */
  unzip<A, B>(this: Option<[A, B]>): [Option<A>, Option<B>];
}

/**
 * Represents an optional value: either `Some` (containing a value) or `None`
 * (absent).
 *
 * `Option<T>` is the core type of this module. Every `Option` is either
 * `Some(value)` (containing a value of type `T`) or `None` (representing the
 * absence of a value). This eliminates the need for `null` and `undefined`
 * checks and makes missing values explicit in the type system.
 *
 * The type is a **discriminated union** on the `__tag` property (`"some"` /
 * `"none"`), so `if (opt.__tag === "some")` narrows, and the `match` module's
 * `Option.some` / `Option.none` patterns account for each variant in
 * exhaustiveness checking.
 *
 * @template T The type of the contained value.
 *
 * @example Creating options
 * ```typescript
 * import { Some, None, Option } from "@ghaerdi/rustify/option";
 *
 * const some: Option<number> = Some(5);
 * const none: Option<number> = None<number>();
 * const fromNull: Option<string> = Option.fromNullable(() => maybeGetValue());
 * ```
 *
 * @example Chaining operations
 * ```typescript
 * Some(5)
 *   .map(x => x * 2)           // Some(10)
 *   .filter(x => x > 8)        // Some(10)
 *   .andThen(x => Some(x + 1)) // Some(11)
 *   .unwrap();                  // 11
 * ```
 *
 * @example Pattern matching
 * ```typescript
 * const msg = some.match({
 *   Some: (value) => `Got: ${value}`,
 *   None: () => "Nothing",
 * });
 * ```
 *
 * @see {@link Some} to create a present value
 * @see {@link None} to represent an absent value
 */
export type Option<T> = OptionImpl<T, "some"> | OptionImpl<T, "none">;

// ─── Public OptionImpl ────────────────────────────────────────────────────

class OptionImpl<T, K extends "some" | "none"> implements OptionMethods<T> {
  /** @internal */ #inner: BaseOptionStrategy<T>;

  /** @internal */ constructor(
    inner: BaseOptionStrategy<T> & { readonly __tag: K },
  ) {
    this.#inner = inner;
  }

  /**
   * The variant discriminant: `"some"` or `"none"`. Lets the `Option` type be
   * a discriminated union, so type guards and pattern matching can narrow by
   * variant.
   * @internal
   */
  get __tag(): K {
    return this.#inner.__tag as K;
  }

  /**
   * Wraps a strategy produced by a strategy operation into a public `Option`,
   * picking the concrete variant type from the strategy's discriminant.
   * @internal
   */
  #wrap<U>(strategy: BaseOptionStrategy<U>): Option<U> {
    return strategy.isSome()
      ? new OptionImpl(strategy as SomeStrategy<U>)
      : new OptionImpl(strategy as NoneStrategy<U>);
  }

  /** @internal */ get _inner(): BaseOptionStrategy<T> {
    return this.#inner;
  }

  /** @inheritDoc */ isSome(): boolean {
    return this.#inner.isSome();
  }
  /** @inheritDoc */ isSomeAnd(fn: (value: T) => boolean): boolean {
    return this.#inner.isSomeAnd(fn);
  }
  /** @inheritDoc */ isNone(): boolean {
    return this.#inner.isNone();
  }
  /** @inheritDoc */ expect(message: string): T {
    return this.#inner.expect(message);
  }
  /** @inheritDoc */ unwrap(): T {
    return this.#inner.unwrap();
  }
  /** @inheritDoc */ unwrapOr(defaultValue: T): T {
    return this.#inner.unwrapOr(defaultValue);
  }
  /** @inheritDoc */ unwrapOrElse(fn: () => T): T {
    return this.#inner.unwrapOrElse(fn);
  }
  /** @inheritDoc */ map<U>(fn: (value: T) => U): Option<U> {
    return this.#wrap(this.#inner.map(fn));
  }
  /** @inheritDoc */ mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
    return this.#inner.mapOr(defaultValue, fn);
  }
  /** @inheritDoc */ mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U {
    return this.#inner.mapOrElse(defaultFn, fn);
  }
  /** @inheritDoc */ inspect(fn: (value: T) => void): Option<T> {
    this.#inner.inspect(fn);
    return this as Option<T>;
  }
  /** @inheritDoc */ and<U>(res: Option<U>): Option<U> {
    return this.#wrap(this.#inner.and(res._inner));
  }
  /** @inheritDoc */ andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return this.#wrap(this.#inner.andThen((v) => fn(v)._inner));
  }
  /** @inheritDoc */ or(res: Option<T>): Option<T> {
    return this.#inner.isSome() ? (this as Option<T>) : res;
  }
  /** @inheritDoc */ orElse(fn: () => Option<T>): Option<T> {
    return this.#inner.isSome() ? (this as Option<T>) : fn();
  }
  /** @inheritDoc */ xor(optb: Option<T>): Option<T> {
    return this.#wrap(this.#inner.xor(optb._inner));
  }
  /** @inheritDoc */ cloned(): Option<T> {
    return this.#wrap(this.#inner.cloned());
  }
  /** @inheritDoc */ zip<U>(other: Option<U>): Option<[T, U]> {
    return this.#wrap(this.#inner.zip(other._inner));
  }
  /** @inheritDoc */ zipWith<U, R>(
    other: Option<U>,
    fn: (s: T, o: U) => R,
  ): Option<R> {
    return this.#wrap(this.#inner.zipWith(other._inner, fn));
  }
  /** @inheritDoc */ match<U, V>(matcher: OptionMatcher<T, U, V>): U | V {
    return this.#inner.match(matcher);
  }
  /** @inheritDoc */ flatten<U>(): Option<U> {
    return this.#wrap(this.#inner.flatten());
  }
  /** @inheritDoc */ filter(predicate: (value: T) => boolean): Option<T> {
    if (this.#inner.isSome() && predicate(this.#inner.unwrap())) {
      return this as Option<T>;
    }
    return new OptionImpl(new NoneStrategy<T>());
  }
  /** @inheritDoc */ okOr<E>(
    err: E,
  ): import("../result/index.ts").Result<T, E> {
    return this.#inner.okOr(err);
  }
  /** @inheritDoc */ okOrElse<E>(
    fn: () => E,
  ): import("../result/index.ts").Result<T, E> {
    return this.#inner.okOrElse(fn);
  }
  /** @inheritDoc */ transpose<U, E>(): import("../result/index.ts").Result<
    Option<U>,
    E
  > {
    const result = this.#inner
      .transpose() as import("../result/index.ts").Result<
        BaseOptionStrategy<U>,
        E
      >;
    if (result.isOk()) {
      return Ok(this.#wrap(result.unwrap() as BaseOptionStrategy<U>));
    } else {
      return Err(result.unwrapErr());
    }
  }
  /** @inheritDoc */ unwrapOrDefault(): T {
    return this.#inner.unwrapOrDefault();
  }

  /** @inheritDoc */ getOrInsert(value: T): T {
    if (this.#inner.isNone()) this.#inner = new SomeStrategy(value);
    return this.#inner.unwrap();
  }
  /** @inheritDoc */ getOrInsertWith(f: () => T): T {
    if (this.#inner.isNone()) this.#inner = new SomeStrategy(f());
    return this.#inner.unwrap();
  }
  /** @inheritDoc */ take(): Option<T> {
    if (this.#inner.isSome()) {
      const value = this.#inner.unwrap();
      this.#inner = new NoneStrategy<T>();
      return new OptionImpl(new SomeStrategy(value));
    }
    return new OptionImpl(new NoneStrategy<T>());
  }
  /** @inheritDoc */ takeIf(predicate: (value: T) => boolean): Option<T> {
    if (this.#inner.isSome() && predicate(this.#inner.unwrap())) {
      const value = this.#inner.unwrap();
      this.#inner = new NoneStrategy<T>();
      return new OptionImpl(new SomeStrategy(value));
    }
    return new OptionImpl(new NoneStrategy<T>());
  }
  /** @inheritDoc */ contains(value: T): boolean {
    return this.#inner.contains(value);
  }

  /** @inheritDoc */ [Symbol.iterator](): Iterator<
    T extends Iterable<infer U> ? U : never
  > {
    if (!this.#inner.isSome()) {
      return {
        next(): IteratorResult<T extends Iterable<infer U> ? U : never> {
          return { done: true, value: undefined! };
        },
      } as Iterator<T extends Iterable<infer U> ? U : never>;
    }
    const value = this.#inner.unwrap() as T;
    if (
      value !== null && value !== undefined &&
      typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] ===
        "function"
    ) {
      return (value as unknown as Iterable<
        T extends Iterable<infer U> ? U : never
      >)[Symbol.iterator]();
    }
    return {
      next(): IteratorResult<T extends Iterable<infer U> ? U : never> {
        return { done: true, value: undefined! };
      },
    } as Iterator<T extends Iterable<infer U> ? U : never>;
  }

  /** @inheritDoc */
  insert(value: T): T {
    this.#inner = new SomeStrategy(value);
    return value;
  }

  /** @inheritDoc */
  replace(value: T): Option<T> {
    const previous = this.#wrap(this.#inner);
    this.#inner = new SomeStrategy(value);
    return previous;
  }

  /** @inheritDoc */
  isNoneOr(fn: (value: T) => boolean): boolean {
    return this.#inner.isNone() || this.#inner.isSomeAnd(fn);
  }

  /** @inheritDoc */
  expectNone(message = "Tried to expect None"): void {
    if (this.#inner.isSome()) {
      throw new Error(`${message}: ${toString(this.#inner.unwrap())}`);
    }
  }

  /** @inheritDoc */
  count(): number {
    return this.#inner.isSome() ? 1 : 0;
  }

  /** @inheritDoc */
  copied(): Option<T> {
    return this as Option<T>;
  }

  /** @inheritDoc */
  unzip<A, B>(this: Option<[A, B]>): [Option<A>, Option<B>] {
    if (this.#inner.isSome()) {
      const [a, b] = this.#inner.unwrap() as [A, B];
      return [Some(a), Some(b)];
    }
    return [None<A>(), None<B>()];
  }

  /**
   * Wraps a function that might return `null` or `undefined`, converting its result to an `Option`.
   *
   * @template T The return type of the function.
   * @param fn The function to wrap and execute.
   * @returns `Some(value)` if the function returns a non-null value, `None` otherwise.
   *
   * @example
   * ```typescript
   * OptionImpl.fromNullable(() => 5).unwrap(); // 5
   * OptionImpl.fromNullable(() => null).isNone(); // true
   * ```
   */
  static fromNullable<T>(
    fn: () => T | null | undefined,
  ): Option<NonNullable<T>> {
    const value = fn();
    if (value === null || value === undefined) return None<NonNullable<T>>();
    return Some(value as NonNullable<T>);
  }

  /**
   * Checks if a value is an `Option` created by this library.
   *
   * @param value The value to check.
   * @returns `true` if the value is a `Some` or `None` instance.
   *
   * @example
   * ```typescript
   * OptionImpl.isOption(Some(1)); // true
   * OptionImpl.isOption(None()); // true
   * OptionImpl.isOption(42); // false
   * ```
   */
  static isOption<T>(value: unknown): value is Option<T> {
    return value instanceof OptionImpl;
  }
}

// ─── Factory functions ────────────────────────────────────────────────────

/**
 * Creates a new `Some` option containing the given value.
 *
 * @template T The type of the value.
 * @param value The value to wrap in an Option.
 * @returns An `Option<T>` that is `Some`.
 *
 * @example
 * ```typescript
 * const x = Some(5);
 * x.unwrap(); // 5
 * x.isSome(); // true
 * ```
 */
export const Some = <T>(value: T): Option<T> =>
  new OptionImpl(new SomeStrategy(value));

/**
 * Creates a new `None` option representing the absence of a value.
 *
 * @template T The type parameter for the Option.
 * @returns An `Option<T>` that is `None`.
 *
 * @example
 * ```typescript
 * const x = None<number>();
 * x.isNone(); // true
 * x.unwrapOr(0); // 0
 * ```
 */
export const None = <T>(): Option<T> => new OptionImpl(new NoneStrategy<T>());

// ─── Static methods (namespace merge with Option interface) ────────────────

/**
 * Namespace containing static utility functions merged with the {@link Option} interface.
 *
 * These functions are accessible as `Option.fromNullable(...)` and `Option.isOption(...)`.
 *
 * @see {@link Option} for the interface itself
 */
export namespace Option {
  /** @inheritDoc */
  export const fromNullable = OptionImpl.fromNullable;
  /** @inheritDoc */
  export const isOption = OptionImpl.isOption;

  /**
   * Type guard that narrows a value to the `Some` variant of `Option<T>` —
   * the imperative counterpart of the {@link Option.some} match pattern.
   *
   * After `Option.isSome(value)`, `value` has type
   * `Option<T> & { __tag: "some" }` (and the false branch is narrowed to
   * `{ __tag: "none" }`).
   *
   * ```typescript
   * const describe = (opt: Option<number>): string => {
   *   if (Option.isSome(opt)) return `Some(${opt.unwrap()})`; // opt: Some
   *   return "None"; // opt: None
   * };
   *
   * const values: Option<number>[] = [Some(1), None()];
   * values.filter(Option.isSome).map((s) => s.unwrap() + 1); // [2]
   * ```
   */
  export const isSome = <T>(
    value: unknown,
  ): value is Option<T> & { __tag: "some" } =>
    OptionImpl.isOption(value) && value.isSome();

  /**
   * Type guard that narrows a value to the `None` variant of `Option<T>` —
   * the imperative counterpart of the {@link Option.none} match pattern.
   *
   * ```typescript
   * const isMissing = (opt: Option<number>): boolean => Option.isNone(opt);
   * ```
   */
  export const isNone = <T>(
    value: unknown,
  ): value is Option<T> & { __tag: "none" } =>
    OptionImpl.isOption(value) && value.isNone();
  /**
   * A pattern for `match()` that matches a `Some` and passes the **unwrapped
   * value** to the handler — no `P.when` annotation needed, the handler
   * parameter type is inferred from the matched input.
   *
   * ```typescript
   * import { match } from "@ghaerdi/rustify/match";
   * import { Option } from "@ghaerdi/rustify";
   *
   * const opt: Option<number> = Some(5);
   * const label = match(opt)
   *   .with(Option.some, (n) => `Some(${n.toFixed(2)})`) // n: number
   *   .with(Option.none, () => "None")
   *   .exhaustive();
   * ```
   */
  export const some: ExtractPattern<"unwrap", { __tag: "some" }> = {
    [PATTERN]: "extract",
    extract: (value) => {
      if (OptionImpl.isOption(value) && value.isSome()) {
        return { ok: true, value: value.unwrap() };
      }
      return { ok: false };
    },
  };

  /**
   * A pattern for `match()` that matches `None` (see {@link Option.some}).
   *
   * The handler receives the matched input value; there is no inner value to
   * unwrap, so it is typically ignored.
   */
  export const none: AbsentPattern<{ __tag: "none" }> = {
    [PATTERN]: "absent",
    test: (value) => OptionImpl.isOption(value) && value.isNone(),
  };
}
