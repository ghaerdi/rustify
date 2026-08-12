/**
 * @module match
 *
 * Type-safe pattern matching for **any** JavaScript value, with a chained
 * `.with()` / `.exhaustive()` API inspired by
 * [ts-pattern](https://github.com/gvergnaud/ts-pattern) and
 * [megamatch](https://github.com/Snowflyt/megamatch).
 *
 * Unlike `Option`/`Result`, the matcher is not tied to a specific container:
 * the same API matches primitives, object shapes, arrays, class instances and
 * your own algebraic types.
 *
 * `match(value)` builds a chain of `.with(pattern, handler)` cases terminated
 * by `.exhaustive()` (throws if nothing matched), `.otherwise(handler)` (a
 * default case) or `.run()` (returns `undefined` if nothing matched). Patterns
 * are plain values (literals, object/array shapes) or guards from the
 * {@link P} namespace such as `P.any`, `P.string`, `P.instanceOf(...)`,
 * `P.union(...)` and `P.when(...)`.
 *
 * @example
 * ```typescript
 * import { match, P } from "@ghaerdi/rustify/match";
 *
 * type Shape =
 *   | { type: "circle"; radius: number }
 *   | { type: "rect"; width: number; height: number };
 *
 * const area = (shape: Shape): number =>
 *   match(shape)
 *     .with({ type: "circle" }, ({ radius }) => Math.PI * radius * radius)
 *     .with({ type: "rect" }, ({ width, height }) => width * height)
 *     .exhaustive();
 * ```
 */

export * from "./match.ts";
export * from "./patterns.ts";
export * from "./matcher.ts";
export * from "./types.ts";
