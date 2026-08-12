import type { DescribeMissing, MatchResult, Narrow, NeverCase, Pattern, Remove } from "./types.ts";
import { matchesPattern } from "./patterns.ts";
import { toString } from "../utils.ts";

// ─── Matcher ───────────────────────────────────────────────────────────────

/** One `.with()` case: a pattern and the handler to run when it matches. */
interface Case {
  readonly pattern: unknown;
  readonly handler: (value: unknown) => unknown;
}

/**
 * A chain of pattern-matching cases built by {@link match}.
 *
 * Add cases with `.with(pattern, handler)` and finish with exactly one
 * terminal method: {@link Match.exhaustive}, {@link Match.otherwise} or
 * {@link Match.run}. The return type of the terminal is the union of every
 * handler's return type.
 *
 * @template TInput The type of the value being matched.
 * @template TOutput The accumulated return type of all cases so far.
 * @template TRemaining The part of `TInput` not yet covered by any case;
 * `exhaustive()` errors at compile time if it is not `never`.
 */
export interface Match<TInput, TOutput = never, TRemaining = TInput> {
  /**
   * Adds a case: if `pattern` matches the input, run `handler` with the
   * narrowed value and return its result.
   *
   * @template P The pattern type (must be valid for `TInput`).
   * @template U The handler's return type.
   * @param pattern The pattern to test against the input.
   * @param handler Called with the narrowed value when the pattern matches.
   * @returns A new matcher with the case appended.
   *
   * @example
   * ```typescript
   * match(shape)
   *   .with({ type: "circle" }, ({ radius }) => radius * radius * Math.PI)
   *   .with(P.any, (s) => 0);
   * ```
   */
  with<P extends Pattern<TInput>, U>(
    pattern: P,
    handler: (value: Narrow<TInput, P>) => U,
  ): Match<TInput, TOutput | U, Remove<TRemaining, P>>;

  /**
   * A default case: runs `handler` with the whole input if no previous case
   * matched. Returns the union of all case results.
   *
   * @template U The handler's return type.
   * @param handler Called with the whole input when nothing else matched.
   * @returns The handler's result (or an earlier case's result if one matched).
   *
   * @example
   * ```typescript
   * match(value)
   *   .with(P.string, (s) => s.length)
   *   .otherwise(() => 0);
   * ```
   */
  otherwise<U>(handler: (value: TInput) => U): TOutput | U;

  /**
   * Runs the match and returns the matching case's result.
   *
   * If no case matches, this **throws** — the runtime counterpart of
   * exhaustiveness. Use `.otherwise()` for a default or `.run()` if the
   * value may legitimately not match any case.
   *
   * Compile-time exhaustiveness is enforced at this call: when the input
   * type is a union and some members remain unhandled, this property is a
   * **non-callable** `NeverCase<...>` carrying a custom error message, so
   * calling `.exhaustive()` itself fails to type-check with an error like
   * `NeverCase<"NonExhaustive: unhandled case { type: rect }">`. Add a case
   * for the remaining members, a catch-all (`P.any`), or switch to
   * `.otherwise()` / `.run()`.
   *
   * @returns The result of the first matching case.
   * @throws {Error} If no case matched the input.
   *
   * @example
   * ```typescript
   * match(shape)
   *   .with({ type: "circle" }, ({ radius }) => radius * radius * Math.PI)
   *   .with({ type: "rect" }, ({ width, height }) => width * height)
   *   .exhaustive();
   * ```
   */
  exhaustive: [TRemaining] extends [never]
    ? () => TOutput
    : NeverCase<`NonExhaustive: unhandled case ${DescribeMissing<TRemaining>}`>;

  /**
   * Runs the match and returns the matching case's result, or `undefined` if
   * no case matched (unlike `exhaustive`, which throws).
   *
   * The return type is exhaustiveness-aware: when the input type is fully
   * covered by the cases (`TRemaining` is `never`), `undefined` is excluded,
   * because no value can fall through at runtime. With partial coverage the
   * result is `TOutput | undefined`.
   *
   * @returns The result of the first matching case, or `undefined` when the
   * match is not exhaustive.
   *
   * @example
   * ```typescript
   * match(value).with(P.number, (n) => n * 2).run(); // number | undefined
   * match(shape)
   *   .with({ type: "circle" }, ({ radius }) => radius * radius * Math.PI)
   *   .with({ type: "rect" }, ({ width, height }) => width * height)
   *   .run(); // number — all cases covered
   * ```
   */
  run(): [TRemaining] extends [never] ? TOutput : TOutput | undefined;
}

/**
 * Internal implementation of {@link Match}. Not part of the public API; use
 * {@link match} to create a matcher.
 * @internal
 */
export class MatchImpl<TInput, TOutput, TRemaining = TInput>
  implements Match<TInput, TOutput, TRemaining> {
  readonly #input: TInput;
  readonly #cases: readonly Case[];

  constructor(input: TInput, cases: readonly Case[]) {
    this.#input = input;
    this.#cases = cases;
  }

  with<P extends Pattern<TInput>, U>(
    pattern: P,
    handler: (value: Narrow<TInput, P>) => U,
  ): Match<TInput, TOutput | U, Remove<TRemaining, P>> {
    // `handler` is stored erased to `(value: unknown) => unknown` so cases of
    // heterogeneous pattern types can live in one list; the narrowing cast on
    // `value` is safe because the case only runs after its pattern matched.
    const erased: (value: unknown) => unknown = (value) =>
      handler(value as Narrow<TInput, P>);
    return new MatchImpl<TInput, TOutput | U, Remove<TRemaining, P>>(
      this.#input,
      [...this.#cases, { pattern, handler: erased }],
    );
  }

  otherwise<U>(handler: (value: TInput) => U): TOutput | U {
    const found = this.#find();
    if (found.ok) return found.value as TOutput | U;
    return handler(this.#input);
  }

  /**
   * The exhaustive terminal (see {@link Match.exhaustive}): a function when
   * the match is complete, a non-callable error carrying the missing cases
   * otherwise.
   */
  exhaustive: [TRemaining] extends [never]
    ? () => TOutput
    : NeverCase<`NonExhaustive: unhandled case ${DescribeMissing<TRemaining>}`> =
      (() => {
        const found = this.#find();
        if (found.ok) {
          return found.value as [TRemaining] extends [never]
            ? TOutput
            : NeverCase<`NonExhaustive: unhandled case ${DescribeMissing<TRemaining>}`>;
        }
        throw new Error(
          `[rustify/match] No pattern matched the value ${toString(this.#input)}. ` +
            "Add a catch-all case (P.any) or use .otherwise() instead of .exhaustive().",
        );
      }) as [TRemaining] extends [never]
        ? () => TOutput
        : NeverCase<`NonExhaustive: unhandled case ${DescribeMissing<TRemaining>}`>;

  run(): [TRemaining] extends [never] ? TOutput : TOutput | undefined {
    const found = this.#find();
    if (found.ok) {
      return found.value as [TRemaining] extends [never]
        ? TOutput
        : TOutput | undefined;
    }
    // `as never` is assignable to both branches of the deferred conditional;
    // at runtime `undefined` is only reachable when the match is not
    // exhaustive, which the type system already reflects.
    return undefined as never;
  }

  #find(): MatchResult {
    for (const c of this.#cases) {
      const result = matchesPattern(c.pattern, this.#input);
      if (result.ok) {
        // `result.value` is the input for ordinary patterns and the
        // extracted (unwrapped) value for extract patterns.
        return { ok: true, value: c.handler(result.value) };
      }
    }
    return { ok: false };
  }
}

