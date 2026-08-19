/**
 * Deeply immutable version of a type.
 *
 * - `Array` → `ReadonlyArray`
 * - `Map` → `ReadonlyMap`
 * - `Set` → `ReadonlySet`
 * - Plain objects → all properties made `readonly` recursively
 * - Primitives, functions, `Date`, `RegExp`, `Promise`, `WeakMap`,
 *   `WeakSet`, and already-readonly collections pass through unchanged.
 *
 * @module
 */

type Fn = (...args: unknown[]) => unknown;
type KeepMutable =
  | Fn
  | WeakMap<object, unknown>
  | WeakSet<object>
  | Date
  | RegExp
  | Promise<unknown>
  | ReadonlyMap<unknown, unknown>
  | ReadonlySet<unknown>
  | ReadonlyArray<unknown>;

/**
 * Deeply immutable version of a type. Recursively makes all properties
 * `readonly` and converts mutable collections to their readonly counterparts.
 *
 * @typeParam T - The type to make deeply immutable.
 *
 * @example
 * ```ts
 * type User = { name: string; tags: string[] };
 * type Frozen = Immutable<User>;
 * // { readonly name: string; readonly tags: readonly string[] }
 * ```
 */
export type Immutable<T> = T extends Array<infer Item> ? ImmutableArray<Item>
  : T extends Map<infer K, infer V> ? ImmutableMap<K, V>
  : T extends Set<infer Item> ? ImmutableSet<Item>
  : T extends KeepMutable ? T
  : T extends object ? ImmutableObject<T>
  : T;

type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;
type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;
type ImmutableSet<T> = ReadonlySet<Immutable<T>>;
type ImmutableObject<T> = { readonly [Key in keyof T]: Immutable<T[Key]> };
