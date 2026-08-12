import {
  PATTERN,
  type AnyPattern,
  type ArrayMarker,
  type BigintPattern,
  type BooleanPattern,
  type Constructor,
  type GuardPattern,
  type InstanceOfPattern,
  type Marker,
  type NotPattern,
  type NullishPattern,
  type NumberPattern,
  type OptionalPattern,
  type Pattern,
  type StringPattern,
  type SymbolPattern,
  type UnionPattern,
} from "./types.ts";

// ─── Pattern namespace ─────────────────────────────────────────────────────

/**
 * Namespace of composable pattern guards for use inside `match().with()` and
 * `matches()`.
 *
 * Plain values can be used directly as patterns (literals, object shapes,
 * arrays); `P.*` adds guards such as type checks, class checks, unions and
 * custom predicates.
 *
 * @example
 * ```typescript
 * match(x)
 *   .with({ type: "circle", radius: P.number }, ({ radius }) => radius)
 *   .with(P.instanceOf(Date), (d) => d.getFullYear())
 *   .with(P.when((v): v is string => typeof v === "string"), (s) => s.length)
 *   .otherwise(() => 0);
 * ```
 */
export const P = {
  /** Matches any value (alias: `P._`). */
  any: { [PATTERN]: "any" } as AnyPattern,

  /** Matches any value (alias of `P.any`). */
  _: { [PATTERN]: "any" } as AnyPattern,

  /** Matches any `string` value. */
  string: { [PATTERN]: "string" } as StringPattern,

  /** Matches any `number` value. */
  number: { [PATTERN]: "number" } as NumberPattern,

  /** Matches any `boolean` value. */
  boolean: { [PATTERN]: "boolean" } as BooleanPattern,

  /** Matches any `bigint` value. */
  bigint: { [PATTERN]: "bigint" } as BigintPattern,

  /** Matches any `symbol` value. */
  symbol: { [PATTERN]: "symbol" } as SymbolPattern,

  /** Matches `null` or `undefined`. */
  nullish: { [PATTERN]: "nullish" } as NullishPattern,

  /**
   * Matches an array. With no argument, matches any array; with a
   * `subPattern`, matches arrays where **every** element matches it.
   * @param pattern Optional pattern every element must match.
   */
  array: <T>(pattern?: Pattern<T>): ArrayMarker<T> => ({
    [PATTERN]: "array",
    pattern,
  }),

  /**
   * Matches instances of a class (constructor).
   * @param ctor The class to check with `instanceof`.
   */
  instanceOf: <T>(ctor: Constructor<T>): InstanceOfPattern<T> => ({
    [PATTERN]: "instanceOf",
    ctor,
  }),

  /**
   * Matches a value if **any** of the given patterns matches it.
   * @param patterns The patterns to try, in order.
   */
  union: <T>(...patterns: readonly Pattern<T>[]): UnionPattern => ({
    [PATTERN]: "union",
    patterns,
  }),

  /**
   * Matches a value with a custom predicate. The predicate may be a
   * type-guard (`value is T`) to narrow the handler's parameter.
   * @param guard The predicate; return `true` to match.
   */
  when: <T>(guard: (value: unknown) => value is T): GuardPattern<T> => ({
    [PATTERN]: "guard",
    guard,
  }),

  /**
   * Matches a value if the given pattern does **not** match it.
   * @param pattern The pattern to negate.
   */
  not: (pattern: unknown): NotPattern => ({ [PATTERN]: "not", pattern }),

  /**
   * Matches `undefined` or a value matching the given pattern (useful for
   * optional properties).
   * @param pattern The pattern for the present case.
   */
  optional: <T>(pattern: Pattern<T>): OptionalPattern<T> => ({
    [PATTERN]: "optional",
    pattern,
  }),
};

// ─── Runtime matching ──────────────────────────────────────────────────────

/** Returns `true` if `pattern` is a marker object created by the `P` namespace. */
function isMarker(pattern: unknown): pattern is Marker {
  return (
    typeof pattern === "object" && pattern !== null && PATTERN in pattern
  );
}

/**
 * Returns `true` when `value` matches `pattern`.
 *
 * @param pattern The pattern to test against.
 * @param value The value to test.
 * @returns Whether the value matches.
 * @internal
 */
export function matchesPattern(pattern: unknown, value: unknown): boolean {
  if (isMarker(pattern)) {
    switch (pattern[PATTERN]) {
      case "any":
        return true;
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number";
      case "boolean":
        return typeof value === "boolean";
      case "bigint":
        return typeof value === "bigint";
      case "symbol":
        return typeof value === "symbol";
      case "nullish":
        return value === null || value === undefined;
      case "instanceOf":
        return value instanceof (pattern as InstanceOfPattern<unknown>).ctor;
      case "union":
        return (pattern as UnionPattern).patterns.some((p) =>
          matchesPattern(p, value),
        );
      case "guard":
        return (pattern as GuardPattern<unknown>).guard(value) === true;
      case "array": {
        if (!Array.isArray(value)) return false;
        const sub = (pattern as ArrayMarker<unknown>).pattern;
        if (sub === undefined) return true;
        return value.every((item) => matchesPattern(sub, item));
      }
      case "not":
        return !matchesPattern((pattern as NotPattern).pattern, value);
      case "optional":
        return (
          value === undefined ||
          matchesPattern((pattern as OptionalPattern<unknown>).pattern, value)
        );
    }
  }

  // A class constructor used directly as a pattern: value instanceof pattern.
  if (typeof pattern === "function") {
    return (
      (pattern as { prototype?: unknown }).prototype !== undefined &&
      value instanceof (pattern as Constructor)
    );
  }

  // An array pattern: same length, every element matches pairwise.
  if (Array.isArray(pattern)) {
    return (
      Array.isArray(value) &&
      pattern.length === value.length &&
      pattern.every((p, i) => matchesPattern(p, value[i]))
    );
  }

  // A shape pattern: every own property of the pattern matches the value.
  if (typeof pattern === "object" && pattern !== null) {
    return (
      typeof value === "object" &&
      value !== null &&
      Object.keys(pattern).every((key) =>
        matchesPattern(
          (pattern as Record<string, unknown>)[key],
          (value as Record<string, unknown>)[key],
        ),
      )
    );
  }

  // Anything else is a literal, compared with Object.is (NaN matches NaN).
  return Object.is(pattern, value);
}

