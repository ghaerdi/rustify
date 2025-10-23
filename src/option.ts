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
   * None.isSome(); // false
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
   * None.isSomeAnd(x => x > 3); // false
   * ```
   */
  isSomeAnd(fn: (value: T) => boolean): boolean;

  /**
   * Checks if the option is None.
   * @returns True if the option is None, false otherwise.
   * @example
   * ```typescript
   * None.isNone(); // true
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
   * @template U The type of the default value (can be different from T).
   * @param defaultValue The default value to return if the option is None.
   * @returns The Some value or `defaultValue`.
   * @example
   * ```typescript
   * Some(5).unwrapOr(0); // 5
   * None.unwrapOr(0); // 0
   * None.unwrapOr("default"); // "default"
   * ```
   */
  unwrapOr<U>(defaultValue: U): T | U;

  /**
   * Returns the contained Some value or computes it from a closure.
   * @template U The type of the value returned by the closure `fn` (can be different from T).
   * @param fn The closure to compute the default value.
   * @returns The Some value or the value computed by `fn()`.
   * @example
   * ```typescript
   * Some(5).unwrapOrElse(() => 0); // 5
   * None.unwrapOrElse(() => 0); // 0
   * ```
   */
  unwrapOrElse<U>(fn: () => U): T | U;

  /**
   * Maps an `Option<T>` to `Option<U>` by applying a function to a contained Some value,
   * leaving a None value untouched.
   * @template U The type of the mapped Some value.
   * @param fn The function to apply to the Some value.
   * @returns A new Option with the mapped Some value or None.
   * @example
   * ```typescript
   * Some(5).map(x => x.toString()).unwrap(); // "5"
   * None.map((x:any) => x.toString()).isNone(); // true
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
   * None.mapOr("bar", (v:any) => v.length); // "bar"
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
   * None.mapOrElse(() => "None!", (x:any) => `Some: ${x}`); // "None!"
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
   * None.inspect(x => console.log(x)); // Returns None
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
   * None.and(Some("late success")).isNone(); // true
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
   * None.andThen((x:any) => Some(x > 0)).isNone(); // true
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
   * None.or(Some(10)).unwrap(); // 10
   * None.or(None).isNone(); // true
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
   * None.orElse(() => Some(0)).unwrap(); // 0
   * None.orElse(() => None).isNone(); // true
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
   * Some(1).xor(None).unwrap(); // 1
   * None.xor(Some(2)).unwrap(); // 2
   * Some(1).xor(Some(2)).isNone(); // true
   * None.xor(None).isNone(); // true
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
   * None.cloned().isNone(); // true
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
   * None.zip(Some("a")).isNone(); // true
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
}

/**
 * @internal Implementation of the Some case for Option. Users should use the `Some` factory function.
 */
class SomeImpl<T> implements BaseOption<T> {
  readonly #value!: T;

  constructor(value: T) {
    if (!(this instanceof SomeImpl)) {
      return new SomeImpl(value);
    }
    this.#value = value;
  }

  isSome(): true { return true; }
  isSomeAnd(fn: (value: T) => boolean): boolean { return fn(this.#value); }
  isNone(): false { return false; }

  expect(_message: string): T {
    return this.#value;
  }

  unwrap(): T {
    return this.#value;
  }

  unwrapOr<U>(_defaultValue: U): T {
    return this.#value;
  }

  unwrapOrElse<U>(_fn: () => U): T {
    return this.#value;
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return Some(fn(this.#value));
  }

  mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  mapOrElse<U>(_defaultFn: () => U, fn: (value: T) => U): U {
    return fn(this.#value);
  }
  
  inspect(fn: (value: T) => void): Option<T> {
    fn(this.#value);
    return this;
  }

  and<U>(res: Option<U>): Option<U> {
    return res;
  }

  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.#value);
  }

  or(_res: Option<T>): Option<T> {
    return this;
  }

  orElse(_fn: () => Option<T>): Option<T> {
    return this;
  }

  xor(optb: Option<T>): Option<T> {
    if (optb.isSome()) {
      return None; // Return singleton
    }
    return this;
  }

  cloned(): Option<T> {
    try {
      const clonedValue = structuredClone(this.#value);
      return Some(clonedValue);
    } catch (e) {
      console.warn("Failed to structuredClone Some value:", this.#value, e);
      return this; 
    }
  }

  zip<U>(other: Option<U>): Option<[T, U]> {
    if (other.isSome()) {
      return Some([this.#value, other.unwrap()] as [T, U]);
    }
    return None; // Return singleton
  }

  zipWith<U, R>(other: Option<U>, fn: (s: T, o: U) => R): Option<R> {
    if (other.isSome()) {
      return Some(fn(this.#value, other.unwrap()));
    }
    return None; // Return singleton
  }
  
  match<U, V>(matcher: OptionMatcher<T, U, V>): U | V {
    return matcher.Some(this.#value);
  }
  
  [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
    const value = this.#value as T;
    if (value !== null && value !== undefined && typeof (value as any)[Symbol.iterator] === "function") {
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
   constructor() {
  }

  isSome(): false { return false; }
  isSomeAnd(_fn: (value: T) => boolean): false { return false; }
  isNone(): true { return true; }

  expect(message: string): T {
    const callSiteError = new Error();
    const stackLines = (callSiteError.stack || '').split('\n');
    let firstRelevantFrame = 1;
     while (
      stackLines[firstRelevantFrame] &&
      (stackLines[firstRelevantFrame].includes('NoneImpl') || // expect method itself
       stackLines[firstRelevantFrame].includes(' expect ') // handle cases where it might be bound or proxied
      )
    ) {
      firstRelevantFrame++;
    }
    throw new Error(`${message}\n${stackLines.slice(firstRelevantFrame).join('\n')}`);
  }

  unwrap(): T {
    const callSiteError = new Error();
    const stackLines = (callSiteError.stack || '').split('\n');
     let firstRelevantFrame = 1;
     while (
      stackLines[firstRelevantFrame] &&
      (stackLines[firstRelevantFrame].includes('NoneImpl') || // unwrap method itself
       stackLines[firstRelevantFrame].includes(' unwrap ') 
      )
    ) {
      firstRelevantFrame++;
    }
    throw new Error(`Tried to unwrap a None value\n${stackLines.slice(firstRelevantFrame).join('\n')}`);
  }

  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  unwrapOrElse<U>(fn: () => U): U {
    return fn();
  }

  map<U>(_fn: (value: T) => U): Option<U> {
    return None;
  }

  mapOr<U>(defaultValue: U, _fn: (value: T) => U): U {
    return defaultValue;
  }

  mapOrElse<U>(defaultFn: () => U, _fn: (value: T) => U): U {
    return defaultFn();
  }
  
  inspect(_fn: (value: T) => void): Option<T> {
    return None;
  }

  and<U>(_res: Option<U>): Option<U> {
    return None;
  }

  andThen<U>(_fn: (value: T) => Option<U>): Option<U> {
    return None;
  }

  or<U>(res: Option<U>): Option<U> {
    return res;
  }

  orElse<U>(fn: () => Option<U>): Option<U> {
    return fn();
  }
  
  xor<U>(optb: Option<U>): Option<U> {
    return optb;
  }

  cloned(): Option<T> {
    return None;
  }

  zip<U>(_other: Option<U>): Option<[T, U]> {
    return None
  }

  zipWith<U, R>(_other: Option<U>, _fn: (s: T, o: U) => R): Option<R> {
    return None
  }
  
  match<U, V>(matcher: OptionMatcher<T, U, V>): U | V {
    return matcher.None();
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
export const Some = <T>(value: T): Some<T> => new SomeImpl(value);


/**
 * Represents the absence of a value (`None`) in an {@link Option}.
 * This is a singleton instance.
 * @example
 * ```typescript
 * None.isNone(); // true
 * const noValue: Option<number> = None;
 * if (myOption === None) {
 *   // ...
 * }
 * ```
 */
export const None = new NoneImpl<never>();;
/**
 * The type of the `None` singleton.
 */
export type NoneType = typeof None;


/**
 * `Option<T>` is a type that represents an optional value: 
 * every `Option` is either `Some` and contains a value, or `None` (the singleton) and does not.
 * @template T The type of the value that might be contained.
 */
export type Option<T> = Some<T> | NoneType;

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
  fromNullable<T>(fn: () => T | null | undefined): Option<NonNullable<T>> {
    const value = fn();
    if (value === null || value === undefined) {
      return None; // Return singleton
    }
    return Some(value as NonNullable<T>);
  },
  isOption<T>(value: unknown): value is Option<T> {
    return value instanceof SomeImpl || value === None; // Check against singleton
  }
};
