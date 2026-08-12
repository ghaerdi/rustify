import type { Pattern } from "./types.ts";
import { MatchImpl } from "./matcher.ts";
import type { Match } from "./matcher.ts";
import { matchesPattern } from "./patterns.ts";

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Starts a pattern-matching expression on `value`.
 *
 * Chain `.with(pattern, handler)` cases and finish with `.exhaustive()`,
 * `.otherwise(handler)` or `.run()`.
 *
 * @template TInput The type of the value being matched.
 * @param value The value to match against the cases.
 * @returns A {@link Match} chain.
 *
 * @example
 * ```typescript
 * const result = match(value)
 *   .with({ status: "ok" }, ({ data }) => data)
 *   .with({ status: "error" }, ({ message }) => new Error(message))
 *   .exhaustive();
 * ```
 */
export function match<TInput>(value: TInput): Match<TInput, never> {
  return new MatchImpl<TInput, never>(value, []);
}

/**
 * Returns `true` if `value` matches `pattern`, without building a case chain.
 *
 * Useful for validation and for composing guards.
 *
 * @template TInput The type of the value being tested.
 * @param value The value to test.
 * @param pattern The pattern to test against.
 * @returns Whether the value matches the pattern.
 *
 * @example
 * ```typescript
 * matches({ type: "circle", radius: 5 }, { type: "circle" }); // true
 * matches("hello", P.string); // true
 * ```
 */
export function matches<TInput>(
  value: TInput,
  pattern: Pattern<TInput>,
): boolean {
  return matchesPattern(pattern, value).ok;
}
