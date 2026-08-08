/**
 * @module option
 *
 * Provides the `Option` type for representing optional values in a type-safe way.
 *
 * An `Option<T>` is either `Some(value)` (containing a value of type `T`) or `None`
 * (representing the absence of a value). This eliminates the need for `null` and
 * `undefined` checks and makes missing values explicit in the type system.
 *
 * ## Creating Options
 *
 * ```typescript
 * import { Some, None, Option } from "@ghaerdi/rustify/option";
 *
 * const some: Option<number> = Some(5);
 * const none: Option<number> = None();
 * const fromNull: Option<string> = Option.fromNullable(() => maybeGetValue());
 * ```
 *
 * ## Working with Options
 *
 * Options support a rich set of combinators for chaining operations:
 *
 * ```typescript
 * Some(5)
 *   .map(x => x * 2)        // Some(10)
 *   .filter(x => x > 8)     // Some(10)
 *   .andThen(x => Some(x + 1)) // Some(11)
 *   .unwrap();               // 11
 * ```
 *
 * ## Pattern Matching
 *
 * ```typescript
 * const result = some.match({
 *   Some: (value) => `Got: ${value}`,
 *   None: () => "Nothing",
 * });
 * ```
 *
 * @see {@link Some} to create a present value
 * @see {@link None} to represent an absent value
 */

/**
 * Interface defining the structure for the pattern matching handlers used by the `match` method.
 * @template T The type of the value.
 * @template U The return type of the Some handler.
 * @template V The return type of the None handler.
 */
interface OptionMatcher<T, U, V> {
  /**
   * Handler function for the Some case.
   * @param value The value of type T.
   * @returns A value of type U.
   */
  Some: (value: T) => U;
  /**
   * Handler function for the None case.
   * @returns A value of type V.
   */
  None: () => V;
}

/**
 * BaseOption interface defines the common methods for Some and None implementations.
 * It allows iteration over the contained value *only* if it's `Some` and the value itself is iterable.
 * @template T The type of the value.
 */
interface BaseOption<T> extends Iterable<T extends Iterable<infer U> ? U : never> {
  /**
   * Checks if the option is Some.
   * @returns True if the option is Some, false otherwise.
   * @example
   * ```typescript
   * Some(5).isSome(); // true
   * None().isSome(); // false
   * ```
   */
  isSome(): boolean;

  /**
   * Checks if the option is Some and the contained value satisfies a predicate.
   * @param fn The predicate function to apply to the Some value.
   * @returns True if the option is Some and the predicate returns true, false otherwise.
   * @example
   * ```typescript
   * Some(5).isSomeAnd(x => x > 3); // true
   * Some(5).isSomeAnd(x => x < 3); // false
   * None().isSomeAnd(x => x > 3); // false
   * ```
   */
  isSomeAnd(fn: (value: T) => boolean): boolean;

  /**
   * Checks if the option is None.
   * @returns True if the option is None, false otherwise.
   * @example
   * ```typescript
   * None().isNone(); // true
   * Some(5).isNone(); // false
   * ```
   */
  isNone(): boolean;

  /**
   * Returns the contained Some value.
   * Throws an error if the value is None, using the provided message.
   * @param message The message to use if the value is None.
   * @returns The Some value.
   * @throws {Error} Throws an error with `message` if the option is None.
   * @example
   * ```typescript
   * Some(5).expect("should be Some"); // 5
   * // None.expect("should be Some"); // Throws "should be Some"
   * ```
   */
  expect(message: string): T;

  /**
   * Returns the contained Some value.
   * Throws an error if the value is None.
   * @returns The Some value.
   * @throws {Error} Throws an error if the option is None.
   * @example
   * ```typescript
   * Some(5).unwrap(); // 5
   * // None.unwrap(); // Throws "Tried to unwrap a None value"
   * ```
   */
  unwrap(): T;

  /**
   * Returns the contained Some value or a provided default value.
   * @param defaultValue The default value to return if the option is None.
   * @returns The Some value or `defaultValue`.
   * @example
   * ```typescript
   * Some(5).unwrapOr(0); // 5
   * None().unwrapOr(0); // 0
   * ```
   */
  unwrapOr(defaultValue: T): T;

  /**
   * Returns the contained Some value or computes it from a closure.
   * @param fn The closure to compute the default value.
   * @returns The Some value or the value computed by `fn()`.
   * @example
   * ```typescript
   * Some(5).unwrapOrElse(() => 0); // 5
   * None().unwrapOrElse(() => 0); // 0
   * ```
   */
  unwrapOrElse(fn: () => T): T;

  /**
   * Maps an `Option<T>` to `Option<U>` by applying a function to a contained Some value,
   * leaving a None value untouched.
   * @template U The type of the mapped Some value.
   * @param fn The function to apply to the Some value.
   * @returns A new Option with the mapped Some value or None.
   * @example
   * ```typescript
   * Some(5).map(x => x.toString()).unwrap(); // "5"
   * None().map((x:any) => x.toString()).isNone(); // true
   * ```
   */
  map<U>(fn: (value: T) => U): Option<U>;

  /**
   * Returns the provided default value (if None), or applies a function to the contained value (if Some).
   * @template U The type returned by the function `fn` and the type of `defaultValue`.
   * @param defaultValue The default value to return if the option is None.
   * @param fn The function to apply to the Some value.
   * @returns The result of `fn(Some_value)` or `defaultValue`.
   * @example
   * ```typescript
   * Some("foo").mapOr("bar", v => v.length); // 3
   * None().mapOr("bar", (v:any) => v.length); // "bar"
   * ```
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

  /**
   * Computes a default value (if None), or applies a function to the contained value (if Some).
   * @template U The type returned by both functions.
   * @param defaultFn The function to compute the default value if None.
   * @param fn The function to apply to the Some value.
   * @returns The result of `fn(Some_value)` or `defaultFn()`.
   * @example
   * ```typescript
   * Some(5).mapOrElse(() => "None!", x => `Some: ${x}`); // "Some: 5"
   * None().mapOrElse(() => "None!", (x:any) => `Some: ${x}`); // "None!"
   * ```
   */
  mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;
  
  /**
   * Calls the provided function with the contained value (if Some). Returns the original option.
   * Useful for debugging or side-effects.
   * @param fn The function to call with the Some value.
   * @returns The original `Option<T>`.
   * @example
   * ```typescript
   * Some(5).inspect(x => console.log(x)); // Logs 5, returns Some(5)
   * None().inspect(x => console.log(x)); // Returns None
   * ```
   */
  inspect(fn: (value: T) => void): Option<T>;

  /**
   * Returns `res` if the option is Some, otherwise returns None.
   * @template U The type of the Some value of the `res` Option.
   * @param res The other Option to return if self is Some.
   * @returns `res` if self is Some, otherwise None.
   * @example
   * ```typescript
   * Some(2).and(Some("late success")).unwrap(); // "late success"
   * None().and(Some("late success")).isNone(); // true
   * Some(2).and(None).isNone(); // true
   * ```
   */
  and<U>(res: Option<U>): Option<U>;

  /**
   * Calls `fn` if the option is Some, otherwise returns None.
   * This is often used for chaining operations that might return an Option.
   * (Also known as `flatMap`)
   * @template U The type of the Some value of the Option returned by `fn`.
   * @param fn The function to call with the Some value, which returns a new Option.
   * @returns The Option returned by `fn`, or None if self is None.
   * @example
   * ```typescript
   * Some(5).andThen(x => Some(x > 0)).unwrap(); // true
   * Some(-1).andThen(x => x > 0 ? Some(x) : None).isNone(); // true
   * None().andThen((x:any) => Some(x > 0)).isNone(); // true
   * ```
   */
  andThen<U>(fn: (value: T) => Option<U>): Option<U>; // flatMap

  /**
   * Returns the option if it contains a value, otherwise returns `res`.
   * @param res The other Option to return if self is None.
   * @returns The option if it is Some, otherwise `res`.
   * @example
   * ```typescript
   * Some(5).or(Some(10)).unwrap(); // 5
   * None().or(Some(10)).unwrap(); // 10
   * None().or(None()).isNone(); // true
   * ```
   */
  or(res: Option<T>): Option<T>;

  /**
   * Returns the option if it contains a value, otherwise calls `fn` and returns its result.
   * @param fn The function to call to produce an alternative Option if self is None.
   * @returns The option if it is Some, otherwise the result of `fn()`.
   * @example
   * ```typescript
   * Some(5).orElse(() => Some(0)).unwrap(); // 5
   * None().orElse(() => Some(0)).unwrap(); // 0
   * None().orElse(() => None()).isNone(); // true
   * ```
   */
  orElse(fn: () => Option<T>): Option<T>;

  /**
   * Returns Some if exactly one of self, optb is Some, otherwise returns None.
   * If self is Some and optb is None, returns Some(self).
   * If self is None and optb is Some, returns Some(optb).
   * Otherwise (both are Some or both are None), returns None.
   * @param optb The other Option.
   * @returns An Option containing the value of the single Some, or None.
   * @example
   * ```typescript
   * Some(1).xor(None()).unwrap(); // 1
   * None().xor(Some(2)).unwrap(); // 2
   * Some(1).xor(Some(2)).isNone(); // true
   * None().xor(None()).isNone(); // true
   * ```
   */
  xor(optb: Option<T>): Option<T>;
  
  /**
   * Returns a new Option containing a clone of the contained Some value.
   * Uses `structuredClone` for objects. Primitive values are copied directly.
   * If the value is None, returns None.
   * @returns A new Option with a clone of the Some value, or None.
   * @note Uses `structuredClone`.
   * @example
   * ```typescript
   * Some({ a: 1 }).cloned().unwrap(); // { a: 1 } (new object)
   * None().cloned().isNone(); // true
   * ```
   */
  cloned(): Option<T>;

  /**
   * Zips self with another Option.
   * If self is `Some(s)` and other is `Some(o)`, returns `Some([s, o])`.
   * Otherwise, returns `None`.
   * @template U The type of the value in the other Option.
   * @param other The other Option.
   * @returns An Option containing a tuple of the two Some values, or None.
   * @example
   * ```typescript
   * Some(1).zip(Some("a")).unwrap(); // [1, "a"]
   * Some(1).zip(None).isNone(); // true
   * None().zip(Some("a")).isNone(); // true
   * ```
   */
  zip<U>(other: Option<U>): Option<[T, U]>;

  /**
   * Zips self with another Option using a custom function.
   * If self is `Some(s)` and other is `Some(o)`, returns `Some(fn(s, o))`.
   * Otherwise, returns `None`.
   * @template U The type of the value in the other Option.
   * @template R The type of the value returned by the zipping function.
   * @param other The other Option.
   * @param fn The function to combine the two Some values.
   * @returns An Option containing the result of `fn`, or None.
   * @example
   * ```typescript
   * Some(1).zipWith(Some("a"), (n, s) => `${n}${s}`).unwrap(); // "1a"
   * Some(1).zipWith(None, (n, s) => `${n}${s}`).isNone(); // true
   * ```
   */
  zipWith<U, R>(other: Option<U>, fn: (s: T, o: U) => R): Option<R>;

  /**
   * Executes one of two provided functions based on whether the Option is Some or None.
   * This allows for pattern matching on the Option type.
   *
   * @template U The return type of the `Some` handler.
   * @template V The return type of the `None` handler.
   * @param matcher An object containing `Some` and `None` functions.
   * @returns The value returned by the executed handler (`U` or `V`).
   * @example
   * ```typescript
   * const option: Option<number> = Some(10);
   * const message = option.match({
   *   Some: (value) => `Success: ${value}`,
   *   None: () => `It was None`
   * });
   * // message is "Success: 10"
   *
   * const option2: Option<number> = None;
   * const message2 = option2.match({
   *   Some: (value) => `Success: ${value}`,
   *   None: () => `It was None`
   * });
   * // message2 is "It was None"
   * ```
   */
  match<U, V>(matcher: OptionMatcher<T, U, V>): U | V;

  /**
   * Flattens an `Option<Option<T>>` to `Option<T>`.
   * @returns Some(value) if the option contains Some(Some(value)), None otherwise.
   * @example
   * ```typescript
   * Some(Some(5)).flatten().unwrap(); // 5
   * Some(None).flatten().isNone(); // true
   * None().flatten().isNone(); // true
   * ```
   */
  flatten<U>(this: Option<Option<U>>): Option<U>;

  /**
   * Returns None if the option is None, otherwise calls predicate with the wrapped value and returns:
   * - Some(value) if predicate returns true
   * - None if predicate returns false
   * @param predicate The predicate function to test the Some value.
   * @returns Some(value) if predicate is true, None otherwise.
   * @example
   * ```typescript
   * Some(5).filter(x => x > 3).unwrap(); // 5
   * Some(5).filter(x => x > 10).isNone(); // true
   * None().filter(x => x > 3).isNone(); // true
   * ```
   */
  filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(err).
   * @template E The error type.
   * @param err The error value to use if the option is None.
   * @returns Ok(value) if Some, Err(err) if None.
   * @example
   * ```typescript
   * Some(5).okOr("error").unwrap(); // 5
   * None().okOr("error").unwrapErr(); // "error"
   * ```
   */
  okOr<E>(err: E): import("./result.ts").Result<T, E>;

  /**
   * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(fn()).
   * @template E The error type.
   * @param fn The function to compute the error if the option is None.
   * @returns Ok(value) if Some, Err(fn()) if None.
   * @example
   * ```typescript
   * Some(5).okOrElse(() => "error").unwrap(); // 5
   * None().okOrElse(() => "error").unwrapErr(); // "error"
   * ```
   */
  okOrElse<E>(fn: () => E): import("./result.ts").Result<T, E>;




  /**
   * Transposes an Option of a Result into a Result of an Option.
   * @returns Result<Option<T>, E> based on the inner Result.
   * @example
   * ```typescript
   * Some(Ok(5)).transpose().unwrap().unwrap(); // 5
   * Some(Err("error")).transpose().unwrapErr(); // "error"
   * None().transpose().unwrap().isNone(); // true
   * ```
   */
  transpose<U, E>(this: Option<import("./result.ts").Result<U, E>>): import("./result.ts").Result<Option<U>, E>;

  /**
   * Returns the contained Some value or a default value for the type.
   * Note: Unlike Rust, TypeScript doesn't have a Default trait, so this method
   * will throw an error. Use unwrapOr(defaultValue) instead.
   * @returns The Some value or throws an error.
   * @throws {Error} Always throws for None since TypeScript has no Default trait.
   * @example
   * ```typescript
   * Some(5).unwrapOrDefault(); // 5
   * None().unwrapOrDefault(); // throws Error
   * ```
   */
  unwrapOrDefault(): T;

  /**
   * Inserts `value` into the option if it is `None`, then returns the contained value.
   * If the option already contains a value, the old value is returned unchanged.
   * @param value The value to insert if the option is None.
   * @returns The contained value (existing or newly inserted).
   * @example
   * ```typescript
   * Some(5).getOrInsert(10); // 5
   * None().getOrInsert(10);  // 10
   * ```
   */
  getOrInsert(value: T): T;

  /**
   * Inserts a value computed from `f` into the option if it is `None`,
   * then returns the contained value.
   * @param f The function to compute the default value if None.
   * @returns The contained value (existing or computed).
   * @example
   * ```typescript
   * Some(5).getOrInsertWith(() => 10); // 5
   * None().getOrInsertWith(() => 10);  // 10
   * ```
   */
  getOrInsertWith(f: () => T): T;

  /**
   * Takes the value out of the option, returning it.
   * @returns The contained value if Some, or None if None.
   * @example
   * ```typescript
   * const x = Some(5);
   * const y = x.take(); // y is Some(5)
   * ```
   */
  take(): Option<T>;

  /**
   * Takes the value out of the option if the predicate returns true.
   * @param predicate The predicate to test the contained value.
   * @returns Some(value) if predicate returns true, None otherwise.
   * @example
   * ```typescript
   * Some(5).takeIf(v => v > 3); // Some(5)
   * Some(5).takeIf(v => v > 10); // None
   * None().takeIf(v => true); // None
   * ```
   */
  takeIf(predicate: (value: T) => boolean): Option<T>;

  /**
   * Returns `true` if the option is `Some` and the contained value equals `value`.
   * @param value The value to compare against.
   * @returns `true` if the option is `Some` and equal to `value`.
   * @example
   * ```typescript
   * Some(5).contains(5);  // true
   * Some(5).contains(10); // false
   * None().contains(5);   // false
   * ```
   */
  contains(value: T): boolean;
}

/**
 * @internal Implementation of the Some case for Option. Users should use the `Some` factory function.
 */
class SomeImpl<T> implements BaseOption<T> {
  #value!: T;
  #taken = false;

  constructor(value: T) {
    if (!(this instanceof SomeImpl)) {
      return new SomeImpl(value);
    }
    this.#value = value;
  }

  /** @inheritDoc */
  isSome(): boolean { return !this.#taken; }
  /** @inheritDoc */
  isSomeAnd(fn: (value: T) => boolean): boolean { return !this.#taken && fn(this.#value); }
  /** @inheritDoc */
  isNone(): boolean { return this.#taken; }

  /** @inheritDoc */
  expect(message: string): T {
    if (this.#taken) throw new Error(message);
    return this.#value;
  }

  /** @inheritDoc */
  unwrap(): T {
    if (this.#taken) throw new Error('Tried to unwrap a None value');
    return this.#value;
  }

  /** @inheritDoc */
  unwrapOr(_defaultValue: T): T {
    if (this.#taken) return _defaultValue;
    return this.#value;
  }

  /** @inheritDoc */
  unwrapOrElse(fn: () => T): T {
    if (this.#taken) return fn();
    return this.#value;
  }

  /** @inheritDoc */
  map<U>(fn: (value: T) => U): Option<U> {
    if (this.#taken) return None();
    return Some(fn(this.#value));
  }

  /** @inheritDoc */
  mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
    if (this.#taken) return _defaultValue;
    return fn(this.#value);
  }

  /** @inheritDoc */
  mapOrElse<U>(_defaultFn: () => U, fn: (value: T) => U): U {
    if (this.#taken) return _defaultFn();
    return fn(this.#value);
  }
  
  /** @inheritDoc */
  inspect(fn: (value: T) => void): Option<T> {
    if (!this.#taken) fn(this.#value);
    return this;
  }

  /** @inheritDoc */
  and<U>(res: Option<U>): Option<U> {
    if (this.#taken) return None();
    return res;
  }

  /** @inheritDoc */
  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    if (this.#taken) return None();
    return fn(this.#value);
  }

  /** @inheritDoc */
  or(_res: Option<T>): Option<T> {
    if (this.#taken) return _res;
    return this;
  }

  /** @inheritDoc */
  orElse(fn: () => Option<T>): Option<T> {
    if (this.#taken) return fn();
    return this;
  }

  /** @inheritDoc */
  xor(optb: Option<T>): Option<T> {
    if (this.#taken) return optb;
    if (optb.isSome()) {
      return None();
    }
    return this;
  }

  /** @inheritDoc */
  cloned(): Option<T> {
    if (this.#taken) return None();
    try {
      const clonedValue = structuredClone(this.#value);
      return Some(clonedValue);
    } catch (e) {
      console.warn("Failed to structuredClone Some value:", this.#value, e);
      return this; 
    }
  }

  /** @inheritDoc */
  zip<U>(other: Option<U>): Option<[T, U]> {
    if (this.#taken) return None();
    if (other.isSome()) {
      return Some([this.#value, other.unwrap()] as [T, U]);
    }
    return None();
  }

  /** @inheritDoc */
  zipWith<U, R>(other: Option<U>, fn: (s: T, o: U) => R): Option<R> {
    if (this.#taken) return None();
    if (other.isSome()) {
      return Some(fn(this.#value, other.unwrap()));
    }
    return None();
  }
  
  /** @inheritDoc */
  match<U, V>(matcher: OptionMatcher<T, U, V>): U | V {
    if (this.#taken) return matcher.None();
    return matcher.Some(this.#value);
  }

  /** @inheritDoc */
  flatten<U>(this: SomeImpl<Option<U>>): Option<U> {
    if (this.#taken) return None();
    return this.#value;
  }

  /** @inheritDoc */
  filter(predicate: (value: T) => boolean): Option<T> {
    if (this.#taken) return None();
    if (predicate(this.#value)) {
      return this;
    }
    return None();
  }

  /** @inheritDoc */
  okOr<E>(_err: E): import("./result.ts").Result<T, E> {
    if (this.#taken) {
      const { Err } = require("./result.ts");
      return Err(_err);
    }
    const { Ok } = require("./result.ts");
    return Ok(this.#value);
  }

  /** @inheritDoc */
  okOrElse<E>(_fn: () => E): import("./result.ts").Result<T, E> {
    if (this.#taken) {
      const { Err } = require("./result.ts");
      return Err(_fn());
    }
    const { Ok } = require("./result.ts");
    return Ok(this.#value);
  }

  /** @inheritDoc */
  transpose<U, E>(this: SomeImpl<import("./result.ts").Result<U, E>>): import("./result.ts").Result<Option<U>, E> {
    if (this.#taken) {
      const { Ok } = require("./result.ts");
      return Ok(None());
    }
    const result = this.#value as import("./result.ts").Result<U, E>;
    if (result.isOk()) {
      const { Ok } = require("./result.ts");
      return Ok(Some(result.unwrap()));
    } else {
      const { Err } = require("./result.ts");
      return Err(result.unwrapErr());
    }
  }

  /** @inheritDoc */
  unwrapOrDefault(): T {
    if (this.#taken) throw new Error("Cannot unwrap None to default value. TypeScript doesn't have a Default trait. Use unwrapOr(defaultValue) instead.");
    return this.#value;
  }

  /** @inheritDoc */
  getOrInsert(value: T): T {
    if (this.#taken) return value;
    return this.#value;
  }

  /** @inheritDoc */
  getOrInsertWith(f: () => T): T {
    if (this.#taken) return f();
    return this.#value;
  }

  /** @inheritDoc */
  take(): Option<T> {
    if (this.#taken) return None();
    this.#taken = true;
    return Some(this.#value);
  }

  /** @inheritDoc */
  takeIf(predicate: (value: T) => boolean): Option<T> {
    if (this.#taken) return None();
    if (predicate(this.#value)) {
      this.#taken = true;
      return Some(this.#value);
    }
    return None();
  }

  /** @inheritDoc */
  contains(value: T): boolean {
    if (this.#taken) return false;
    return this.#value === value;
  }
  
  [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
    if (this.#taken) {
      return {
        next(): IteratorResult<T extends Iterable<infer U> ? U : never> {
          return { done: true, value: undefined! };
        }
      } as Iterator<T extends Iterable<infer U> ? U : never>;
    }
    const value = this.#value as T;
    if (value !== null && value !== undefined && typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] === "function") {
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
 * @internal Implementation of the None case for Option. Users should use the `None` singleton.
 */
class NoneImpl<T = never> implements BaseOption<T> {
  #value?: T;
  
  constructor() {
  }

  /** @inheritDoc */
  isSome(): false { return false; }
  /** @inheritDoc */
  isSomeAnd(_fn: (value: T) => boolean): false { return false; }
  /** @inheritDoc */
  isNone(): true { return true; }

  /** @inheritDoc */
  expect(message: string): T {
    throw new Error(message);
  }

  /** @inheritDoc */
  unwrap(): T {
    throw new Error('Tried to unwrap a None value');
  }

  /** @inheritDoc */
  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  /** @inheritDoc */
  unwrapOrElse(fn: () => T): T {
    return fn();
  }

  /** @inheritDoc */
  map<U>(_fn: (value: T) => U): Option<U> {
    return None();
  }

  /** @inheritDoc */
  mapOr<U>(defaultValue: U, _fn: (value: T) => U): U {
    return defaultValue;
  }

  /** @inheritDoc */
  mapOrElse<U>(defaultFn: () => U, _fn: (value: T) => U): U {
    return defaultFn();
  }
  
  /** @inheritDoc */
  inspect(_fn: (value: T) => void): Option<T> {
    return None();
  }

  /** @inheritDoc */
  and<U>(_res: Option<U>): Option<U> {
    return None();
  }

  /** @inheritDoc */
  andThen<U>(_fn: (value: T) => Option<U>): Option<U> {
    return None();
  }

  /** @inheritDoc */
  or<U>(res: Option<U>): Option<U> {
    return res;
  }

  /** @inheritDoc */
  orElse<U>(fn: () => Option<U>): Option<U> {
    return fn();
  }
  
  /** @inheritDoc */
  xor<U>(optb: Option<U>): Option<U> {
    return optb;
  }

  /** @inheritDoc */
  cloned(): Option<T> {
    return None();
  }

  /** @inheritDoc */
  zip<U>(_other: Option<U>): Option<[T, U]> {
    return None()
  }

  /** @inheritDoc */
  zipWith<U, R>(_other: Option<U>, _fn: (s: T, o: U) => R): Option<R> {
    return None()
  }
  
  /** @inheritDoc */
  match<U, V>(matcher: OptionMatcher<T, U, V>): U | V {
    return matcher.None();
  }

  /** @inheritDoc */
  flatten<U>(): Option<U> {
    return None();
  }

  /** @inheritDoc */
  filter(_predicate: (value: T) => boolean): Option<T> {
    return None();
  }

  /** @inheritDoc */
  okOr<E>(err: E): import("./result.ts").Result<T, E> {
    const { Err } = require("./result.ts");
    return Err(err);
  }

  /** @inheritDoc */
  okOrElse<E>(fn: () => E): import("./result.ts").Result<T, E> {
    const { Err } = require("./result.ts");
    return Err(fn());
  }

  /** @inheritDoc */
  transpose<U, E>(): import("./result.ts").Result<Option<U>, E> {
    const { Ok } = require("./result.ts");
    return Ok(None());
  }

  /** @inheritDoc */
  unwrapOrDefault(): T {
    throw new Error("Cannot unwrap None to default value. TypeScript doesn't have a Default trait. Use unwrapOr(defaultValue) instead.");
  }

  /** @inheritDoc */
  getOrInsert(value: T): T {
    return value;
  }

  /** @inheritDoc */
  getOrInsertWith(f: () => T): T {
    return f();
  }

  /** @inheritDoc */
  take(): Option<T> {
    return None();
  }

  /** @inheritDoc */
  takeIf(_predicate: (value: T) => boolean): Option<T> {
    return None();
  }

  /** @inheritDoc */
  contains(_value: T): boolean {
    return false;
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
 * Represents the presence of a value (`Some`) in an {@link Option}.
 * Contains the value of type `T`.
 * @template T The type of the value.
 * @example
 * ```typescript
 * Some(10).unwrap(); // 10
 * ```
 */
export type Some<T> = SomeImpl<T>;
/** Creates a new `Some` option containing the given value. */
export const Some = <T>(value: T): Some<T> => new SomeImpl(value);


/**
 * Represents the absence of a value (`None`) in an {@link Option}.
 * @template T The type parameter for the Option
 * @example
 * ```typescript
 * None().isNone(); // true
 * const noValue: Option<number> = None<number>();
 * // Or with type inference:
 * const noValue: Option<number> = None();
 * ```
 */
export type None<T = never> = NoneImpl<T>;
/** Creates a new `None` option representing the absence of a value. */
export const None = <T = never>(): None<T> => new NoneImpl<T>();


/**
 * `Option<T>` is a type that represents an optional value: 
 * every `Option` is either `Some` and contains a value, or `None` and does not.
 * @template T The type of the value that might be contained.
 */
export type Option<T> = Some<T> | None<T>;

/** Static methods for creating and checking `Option` values. */
interface OptionTypeStatics {
  /**
   * Wraps a function that might return null or undefined, converting its result to an `Option<T>`.
   * - If `fn()` returns a non-null/non-undefined value `v`, it's wrapped in `Some(v)`.
   * - If `fn()` returns `null` or `undefined`, it's converted to `None`.
   *
   * @template T The type of the successful result of `fn`.
   * @param fn The function to wrap and execute. It should return `T | null | undefined`.
   * @returns An `Option<T>` representing the outcome.
   * @example
   * ```typescript
   * Option.fromNullable((): number | null => null).isNone(); // true
   * Option.fromNullable((): number | null => 5).unwrap(); // 5
   * Option.fromNullable(() => null) === None; // true
   * ```
   */
  fromNullable<T>(fn: () => T | null | undefined): Option<NonNullable<T>>;
  
  /**
   * Checks if a value is an Option (either Some or None) created by this library.
   * Useful for type guards or conditional logic.
   * @param value The value to check.
   * @returns True if the value is a Some or None instance, false otherwise.
   * @example
   * ```typescript
   * Option.isOption(Some(1)); // true
   * Option.isOption(None); // true
   * Option.isOption(null); // false
   * ```
   */
  isOption<T>(value: unknown): value is Option<T>;
}


/**
 * Provides static methods for creating and handling Option instances.
 */
export const Option: OptionTypeStatics = {
  /** @inheritDoc */
  fromNullable<T>(fn: () => T | null | undefined): Option<NonNullable<T>> {
    const value = fn();
    if (value === null || value === undefined) {
      return None();
    }
    return Some(value as NonNullable<T>);
  },
  /** @inheritDoc */
  isOption<T>(value: unknown): value is Option<T> {
    return value instanceof SomeImpl || value instanceof NoneImpl;
  }
};
