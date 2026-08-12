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
  type AbsentPattern,
  type ExtractPattern,
  type MatchResult,
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
export function matchesPattern(pattern: unknown, value: unknown): MatchResult {
  const hit = (ok: boolean): MatchResult => (ok ? { ok: true, value } : { ok: false });

  if (isMarker(pattern)) {
    switch (pattern[PATTERN]) {
      case "any":
        return hit(true);
      case "string":
        return hit(typeof value === "string");
      case "number":
        return hit(typeof value === "number");
      case "boolean":
        return hit(typeof value === "boolean");
      case "bigint":
        return hit(typeof value === "bigint");
      case "symbol":
        return hit(typeof value === "symbol");
      case "nullish":
        return hit(value === null || value === undefined);
      case "instanceOf":
        return hit(value instanceof (pattern as InstanceOfPattern<unknown>).ctor);
      case "union":
        return hit(
          (pattern as UnionPattern).patterns.some((p) => matchesPattern(p, value).ok),
        );
      case "guard":
        return hit((pattern as GuardPattern<unknown>).guard(value) === true);
      case "extract":
        // The extract function decides both whether the value matches AND what
        // the handler receives (e.g. the unwrapped Some/Ok value).
        return (pattern as ExtractPattern).extract(value);
      case "absent":
        return hit((pattern as AbsentPattern).test(value) === true);
      case "array": {
        if (!Array.isArray(value)) return hit(false);
        const sub = (pattern as ArrayMarker<unknown>).pattern;
        if (sub === undefined) return hit(true);
        return hit(value.every((item) => matchesPattern(sub, item).ok));
      }
      case "not":
        return hit(!matchesPattern((pattern as NotPattern).pattern, value).ok);
      case "optional":
        return hit(
          value === undefined ||
            matchesPattern((pattern as OptionalPattern<unknown>).pattern, value).ok,
        );
    }
  }

  // A class constructor used directly as a pattern: value instanceof pattern.
  if (typeof pattern === "function") {
    return hit(
      (pattern as { prototype?: unknown }).prototype !== undefined &&
        value instanceof (pattern as Constructor),
    );
  }

  // An array pattern: same length, every element matches pairwise.
  if (Array.isArray(pattern)) {
    return hit(
      Array.isArray(value) &&
        pattern.length === value.length &&
        pattern.every((p, i) => matchesPattern(p, value[i]).ok),
    );
  }

  // A shape pattern: every own property of the pattern matches the value.
  if (typeof pattern === "object" && pattern !== null) {
    return hit(
      typeof value === "object" &&
        value !== null &&
        Object.keys(pattern).every((key) =>
          matchesPattern(
            (pattern as Record<string, unknown>)[key],
            (value as Record<string, unknown>)[key],
          ).ok,
        ),
    );
  }

  // Anything else is a literal, compared with Object.is (NaN matches NaN).
  return hit(Object.is(pattern, value));
}

