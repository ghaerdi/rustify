import type { BaseOptionStrategy, OptionMatcher } from "./types.ts";
import { SomeStrategy } from "./some.ts";
import { NoneStrategy } from "./none.ts";

/** @internal */
interface OptionInstance<T> extends BaseOptionStrategy<T> {
  readonly _inner: BaseOptionStrategy<T>;
  map<U>(fn: (value: T) => U): Option<U>;
  inspect(fn: (value: T) => void): Option<T>;
  and<U>(res: Option<U>): Option<U>;
  andThen<U>(fn: (value: T) => Option<U>): Option<U>;
  or(res: Option<T>): Option<T>;
  orElse(fn: () => Option<T>): Option<T>;
  xor(optb: Option<T>): Option<T>;
  cloned(): Option<T>;
  zip<U>(other: Option<U>): Option<[T, U]>;
  zipWith<U, R>(other: Option<U>, fn: (s: T, o: U) => R): Option<R>;
  flatten<U>(): Option<U>;
  filter(predicate: (value: T) => boolean): Option<T>;
  transpose<U, E>(): import("../result/index.ts").Result<Option<U>, E>;
  take(): Option<T>;
  takeIf(predicate: (value: T) => boolean): Option<T>;
  [Symbol.iterator](): Iterator<any>;
}

/**
 * Represents an optional value: either `Some` (containing a value) or `None` (absent).
 *
 * `Option<T>` is the core type of this module. Every `Option` is either
 * `Some(value)` (containing a value of type `T`) or `None` (representing
 * the absence of a value). This eliminates the need for `null` and
 * `undefined` checks and makes missing values explicit in the type system.
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
export interface Option<T> {
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
}

// ─── Public OptionImpl ────────────────────────────────────────────────────

class OptionImpl<T> implements OptionInstance<T> {
  /** @internal */ #inner: BaseOptionStrategy<T>;

  /** @internal */ constructor(inner: BaseOptionStrategy<T>) {
    this.#inner = inner;
  }

  /** @internal */ get _inner(): BaseOptionStrategy<T> { return this.#inner; }

  /** @inheritDoc */ isSome(): boolean { return this.#inner.isSome(); }
  /** @inheritDoc */ isSomeAnd(fn: (value: T) => boolean): boolean { return this.#inner.isSomeAnd(fn); }
  /** @inheritDoc */ isNone(): boolean { return this.#inner.isNone(); }
  /** @inheritDoc */ expect(message: string): T { return this.#inner.expect(message); }
  /** @inheritDoc */ unwrap(): T { return this.#inner.unwrap(); }
  /** @inheritDoc */ unwrapOr(defaultValue: T): T { return this.#inner.unwrapOr(defaultValue); }
  /** @inheritDoc */ unwrapOrElse(fn: () => T): T { return this.#inner.unwrapOrElse(fn); }
  /** @inheritDoc */ map<U>(fn: (value: T) => U): Option<U> { return new OptionImpl(this.#inner.map(fn)); }
  /** @inheritDoc */ mapOr<U>(defaultValue: U, fn: (value: T) => U): U { return this.#inner.mapOr(defaultValue, fn); }
  /** @inheritDoc */ mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U { return this.#inner.mapOrElse(defaultFn, fn); }
  /** @inheritDoc */ inspect(fn: (value: T) => void): Option<T> { this.#inner.inspect(fn); return this; }
  /** @inheritDoc */ and<U>(res: Option<U>): Option<U> { return new OptionImpl(this.#inner.and(res._inner)); }
  /** @inheritDoc */ andThen<U>(fn: (value: T) => Option<U>): Option<U> { return new OptionImpl(this.#inner.andThen((v) => fn(v)._inner)); }
  /** @inheritDoc */ or(res: Option<T>): Option<T> { return this.#inner.isSome() ? this : res; }
  /** @inheritDoc */ orElse(fn: () => Option<T>): Option<T> { return this.#inner.isSome() ? this : fn(); }
  /** @inheritDoc */ xor(optb: Option<T>): Option<T> { return new OptionImpl(this.#inner.xor(optb._inner)); }
  /** @inheritDoc */ cloned(): Option<T> { return new OptionImpl(this.#inner.cloned()); }
  /** @inheritDoc */ zip<U>(other: Option<U>): Option<[T, U]> { return new OptionImpl(this.#inner.zip(other._inner)); }
  /** @inheritDoc */ zipWith<U, R>(other: Option<U>, fn: (s: T, o: U) => R): Option<R> { return new OptionImpl(this.#inner.zipWith(other._inner, fn)); }
  /** @inheritDoc */ match<U, V>(matcher: OptionMatcher<T, U, V>): U | V { return this.#inner.match(matcher); }
  /** @inheritDoc */ flatten<U>(): Option<U> { return new OptionImpl(this.#inner.flatten()); }
  /** @inheritDoc */ filter(predicate: (value: T) => boolean): Option<T> {
    if (this.#inner.isSome() && predicate(this.#inner.unwrap())) return this;
    return new OptionImpl(new NoneStrategy<T>());
  }
  /** @inheritDoc */ okOr<E>(err: E): import("../result/index.ts").Result<T, E> { return this.#inner.okOr(err); }
  /** @inheritDoc */ okOrElse<E>(fn: () => E): import("../result/index.ts").Result<T, E> { return this.#inner.okOrElse(fn); }
  /** @inheritDoc */ transpose<U, E>(): import("../result/index.ts").Result<Option<U>, E> {
    const result = this.#inner.transpose() as import("../result/index.ts").Result<BaseOptionStrategy<U>, E>;
    if (result.isOk()) {
      const { Ok } = require("../result/index.ts");
      return Ok(new OptionImpl(result.unwrap()));
    } else {
      const { Err } = require("../result/index.ts");
      return Err(result.unwrapErr());
    }
  }
  /** @inheritDoc */ unwrapOrDefault(): T { return this.#inner.unwrapOrDefault(); }

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
  /** @inheritDoc */ contains(value: T): boolean { return this.#inner.contains(value); }

  /** @inheritDoc */ [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
    if (!this.#inner.isSome()) {
      return { next(): IteratorResult<T extends Iterable<infer U> ? U : never> { return { done: true, value: undefined! }; } } as Iterator<T extends Iterable<infer U> ? U : never>;
    }
    const value = this.#inner.unwrap() as T;
    if (value !== null && value !== undefined && typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] === "function") {
      return (value as unknown as Iterable<T extends Iterable<infer U> ? U : never>)[Symbol.iterator]();
    }
    return { next(): IteratorResult<T extends Iterable<infer U> ? U : never> { return { done: true, value: undefined! }; } } as Iterator<T extends Iterable<infer U> ? U : never>;
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
  static fromNullable<T>(fn: () => T | null | undefined): Option<NonNullable<T>> {
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
export const Some = <T>(value: T): Option<T> => new OptionImpl(new SomeStrategy(value));

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
}
