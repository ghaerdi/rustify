/**
 * @module result
 *
 * The `Result` type for representing operations that may succeed or fail.
 *
 * A `Result<T, E>` is either `Ok(value)` (containing a success value of type `T`)
 * or `Err(error)` (containing a failure value of type `E`). This enables explicit
 * error handling without throwing exceptions.
 *
 * @see {@link Result} for the full API reference
 */

export { Ok, Err, Result } from "./result.ts";
