/**
 * @module option
 *
 * The `Option` type for representing optional values in a type-safe way.
 *
 * An `Option<T>` is either `Some(value)` (containing a value of type `T`) or `None`
 * (representing the absence of a value). This eliminates the need for `null` and
 * `undefined` checks and makes missing values explicit in the type system.
 *
 * @see {@link Option} for the full API reference
 */

export { None, Option, Some } from "./option.ts";
