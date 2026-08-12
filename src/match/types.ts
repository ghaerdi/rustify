/**
 * Internal pattern-marker types and the public pattern type machinery for the
 * match module.
 *
 * The marker interfaces below are **not** part of the public API — they are
 * re-exported only so the sibling modules (`patterns.ts`, `matcher.ts`,
 * `match.ts`) can share them. Use the {@link P} namespace to build patterns.
 */

/**
 * Unique symbol used to tag patterns created by the {@link P} namespace so the
 * runtime can distinguish "guards" from plain shape patterns.
 */
export const PATTERN = Symbol("rustify.match.pattern");

// ─── Internal pattern marker types ─────────────────────────────────────────

/** @internal Marker for the `P.any` pattern. */
export interface AnyPattern {
	readonly [PATTERN]: "any";
}
/** @internal Marker for the `P.string` pattern. */
export interface StringPattern {
	readonly [PATTERN]: "string";
}
/** @internal Marker for the `P.number` pattern. */
export interface NumberPattern {
	readonly [PATTERN]: "number";
}
/** @internal Marker for the `P.boolean` pattern. */
export interface BooleanPattern {
	readonly [PATTERN]: "boolean";
}
/** @internal Marker for the `P.bigint` pattern. */
export interface BigintPattern {
	readonly [PATTERN]: "bigint";
}
/** @internal Marker for the `P.symbol` pattern. */
export interface SymbolPattern {
	readonly [PATTERN]: "symbol";
}
/** @internal Marker for the `P.nullish` pattern. */
export interface NullishPattern {
	readonly [PATTERN]: "nullish";
}
/**
 * A class constructor, usable directly as a pattern or via `P.instanceOf`.
 * @internal
 */
export type Constructor<T = unknown> = abstract new (...args: any[]) => T;

/** @internal Marker for the `P.instanceOf(ctor)` pattern. */
export interface InstanceOfPattern<I> {
	readonly [PATTERN]: "instanceOf";
	readonly ctor: Constructor<I>;
}
/** @internal Marker for the `P.union(...)` pattern. */
export interface UnionPattern {
	readonly [PATTERN]: "union";
	readonly patterns: readonly unknown[];
}
/** @internal Marker for the `P.when(guard)` pattern. */
export interface GuardPattern<T> {
	readonly [PATTERN]: "guard";
	readonly guard: (value: unknown) => value is T;
}
/** @internal Marker for the `P.array(pattern?)` pattern. */
export interface ArrayMarker<T> {
	readonly [PATTERN]: "array";
	readonly pattern?: Pattern<T>;
}
/** @internal Marker for the `P.not(pattern)` pattern. */
export interface NotPattern {
	readonly [PATTERN]: "not";
	readonly pattern: unknown;
}
/** @internal Marker for the `P.optional(pattern)` pattern. */
export interface OptionalPattern<T> {
	readonly [PATTERN]: "optional";
	readonly pattern: Pattern<T>;
}

/**
 * Any pattern marker object produced by the {@link P} namespace.
 * @internal
 */
export type Marker = {
	readonly [PATTERN]: string;
};

/**
 * A pattern describing values that are acceptable for input type `TInput`.
 *
 * Patterns are either plain values (a literal to compare with `Object.is`, an
 * object whose own properties are matched recursively, an array matched by
 * length and elements) or guards from the {@link P} namespace (`P.any`,
 * `P.string`, `P.instanceOf(...)`, ...).
 *
 * @template TInput The type of the value being matched.
 *
 * @example
 * ```typescript
 * // Valid patterns for a Shape:
 * //   { type: "circle" }
 * //   { type: "rect", width: P.number }
 * //   P.union(P.string, P.number)
 * ```
 */
export type Pattern<TInput> =
	| TInput
	| AnyPattern
	| StringPattern
	| NumberPattern
	| BooleanPattern
	| BigintPattern
	| SymbolPattern
	| NullishPattern
	| InstanceOfPattern<unknown>
	| UnionPattern
	| GuardPattern<unknown>
	| ArrayMarker<unknown>
	| NotPattern
	| OptionalPattern<unknown>
	| Constructor
	| (TInput extends readonly unknown[]
			? readonly Pattern<TInput[number]>[]
			: never)
	| (TInput extends object
			? { readonly [K in keyof TInput]?: Pattern<TInput[K]> }
			: never);

/**
 * The type of values that match a given `pattern`.
 *
 * Used internally to narrow the handler parameter of `.with()`; exported so
 * advanced users can reason about what a pattern accepts.
 *
 * @template P The pattern type.
 */
export type PatternToValue<P> = P extends AnyPattern
	? unknown
	: P extends StringPattern
		? string
		: P extends NumberPattern
			? number
			: P extends BooleanPattern
				? boolean
				: P extends BigintPattern
					? bigint
					: P extends SymbolPattern
						? symbol
						: P extends NullishPattern
							? null | undefined
							: P extends InstanceOfPattern<infer I>
								? I
								: P extends {
											readonly [PATTERN]: "guard";
											readonly guard: infer G;
										}
									? G extends (value: unknown) => value is infer T
										? T
										: unknown
									: P extends UnionPattern
										? UnionToValue<P["patterns"]>
										: P extends OptionalPattern<infer T>
											? PatternToValue<T> | undefined
											: P extends ArrayMarker<infer T>
												? PatternToValue<T>[]
												: P extends NotPattern
													? unknown
													: P extends Constructor<infer I>
														? I
														: P extends readonly unknown[]
															? MapArray<P>
															: P extends object
																? {
																		readonly [K in keyof P]: PatternToValue<
																			P[K]
																		>;
																	}
																: P;

/** Maps a union pattern's member patterns to the union of their value types. */
type UnionToValue<Ps extends readonly unknown[]> = Ps extends readonly [
	infer H,
	...infer T,
]
	? PatternToValue<H> | UnionToValue<T>
	: never;

/**
 * Maps an array pattern to a tuple (for tuple patterns) or an array type (for
 * plain array patterns).
 */
type MapArray<P extends readonly unknown[]> = P extends readonly [
	infer H,
	...infer T,
]
	? [PatternToValue<H>, ...MapArray<T>]
	: PatternToValue<P[number]>[];

/**
 * The type of the value passed to a handler when `pattern` matches an input of
 * type `TInput`: the input type intersected with what the pattern requires, so
 * handlers see both the narrowed discriminant and any extra properties the
 * input actually carries at runtime.
 *
 * @template TInput The input type of the matcher.
 * @template P The pattern type.
 */
export type Narrow<TInput, P> = TInput & PatternToValue<P>;

/**
 * Removes the members of the input type that `pattern` can match, leaving the
 * type that still needs handling — the engine behind compile-time
 * exhaustiveness.
 *
 * Distributes over union members: a member is removed when it is assignable
 * to what the pattern matches (`[member] extends [PatternToValue<P>]`), i.e.
 * when the pattern can match *every* value of that member.
 *
 * @template TInput The type to subtract from.
 * @template P The pattern whose matches are removed.
 * @internal
 */
export type Remove<TInput, P> = TInput extends unknown
  ? [TInput] extends [PatternToValue<P>]
    ? never
    : TInput
  : never;

/**
 * Renders an unhandled input type as a short, human-readable string used in
 * the `exhaustive()` compile error — e.g. `{ type: rect }` for a
 * discriminated-union member, `42` for a number literal, or `string` for a
 * wide primitive.
 *
 * @template T The remaining (unhandled) input type.
 * @internal
 */
export type DescribeMissing<T> = T extends string
  ? string extends T
    ? "a string"
    : `${T & string}`
  : T extends number
    ? number extends T
      ? "a number"
      : `${T & number}`
    : T extends boolean
      ? "a boolean"
      : T extends bigint
        ? "a bigint"
        : T extends symbol
          ? "a symbol"
          : T extends null | undefined
            ? "null or undefined"
            : T extends { type: infer D extends PropertyKey }
              ? `{ type: ${D & string} }`
              : T extends { kind: infer D extends PropertyKey }
                ? `{ kind: ${D & string} }`
                : T extends { tag: infer D extends PropertyKey }
                  ? `{ tag: ${D & string} }`
                  : T extends object
                    ? "an object"
                    : "a value";

/**
 * The type of the `exhaustive` property when some input members are still
 * unhandled: a **non-callable** object carrying the custom error message, so
 * calling `.exhaustive()` itself fails to type-check with an error like
 * `NeverCase<"NonExhaustive: unhandled case { type: rect }">` — at the call
 * site, regardless of how the result is used.
 *
 * @template M The message string literal.
 * @internal
 */
export type NeverCase<M extends string> = { __nonExhaustive: M };
