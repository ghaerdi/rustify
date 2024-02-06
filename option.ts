interface BaseOption<T> extends Iterable<T extends Iterable<infer U> ? U : never> {
  isSome(): boolean;
  isNone(): boolean;
  isSomeAnd(fn: (value: T) => boolean): boolean;
  expect(message: string): T;
  unwrap(): T;
  unwrapOr<U>(defaultValue: U): T | U;
  // unwrapOrElse<U>(fn: () => U): T | U;
  // unwrapOrDefault(): T;
  // unwrapUnchecked(): T;
  // map<U>(fn: (value: T) => U): Option<U>;
  // inspect(fn: (value: T) => void): Option<T>;\
  // iter(): Iterator<T extends Iterable<infer U> ? U : never>;
  // mapOr<U>(defaultValue: U, fn: (value: T) => U): U;
  // mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;
  // okOr<E>(defaultValue: E): Result<T, E>;
  // okOrElse<E>(defaultFn: () => E): Result<T, E>;
  // and<U>(res: Option<U>): Option<U>;
  // andThen<U>(fn: (value: T) => Option<U>): Option<U>;
  // filter(fn: (value: T) => boolean): Option<T>;
  // or(res: Option<T>): Option<T>;
  // orElse(fn: () => Option<T>): Option<T>;
  // xor(res: Option<T>): Option<T>;
  // insert(value: T): T;
  // getOrInsert(value: T): T;
  // getOrInsertDefault(fn: () => T): T;
  // getOrInsertWith(fn: () => T): T;
  // take(): Option<T>;
  // takeIf(fn: (value: T) => boolean): Option<T>;
  // replace(value: T): Option<T>;
  // zip<U>(other: Option<U>): Option<[T, U]>;
  // zipWith<U, V>(other: Option<U>, fn: (a: T, b: U) => V): Option<V>;
}

class SomeImpl<T> implements BaseOption<T> {
  readonly #value!: T;

  constructor(value: T) {
    if (this instanceof SomeImpl === false) {
      return new SomeImpl(value)
    }
    this.#value = value;
  }

  isSome(): boolean {
    return true;
  }
  isNone(): boolean {
    return false;
  }
  isSomeAnd(fn: (value: T) => boolean): boolean {
    return fn(this.#value);
  }
  expect(_message: string): T {
    return this.#value;
  }
  unwrap(): T {
    return this.#value;
  }
  unwrapOr<U>(_defaultValue: U): T | U {
    return this.#value;
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

class SomeNone implements BaseOption<never> {
  isSome(): boolean {
    return false;
  }
  isNone(): boolean {
    return true;
  }
  isSomeAnd(_fn: (value: never) => boolean): boolean {
    return false;
  }
  expect(message: string): never {
    throw new Error(message);
  }
  unwrap(): never {
    throw new Error("Tried to unwrap None");
  }
  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  [Symbol.iterator](): Iterator<never> {
    return {
      next(): IteratorResult<never> {
        return { done: true, value: undefined! }
      }
    }
  }
}

export const Some = <T>(value: T) => new SomeImpl(value);
export type Some<T> = SomeImpl<T>;
export const None = new SomeNone;
export type None = SomeNone;
export type Option<T> = Some<T> | None;
