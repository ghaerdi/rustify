import { describe, expect, test } from "bun:test";
import { match, matches, P } from "../src/match/index";
import { None, Option, Some } from "../src/option";
import { Err, Ok, Result } from "../src/result";

describe("match", () => {
	describe("Literal patterns", () => {
		test("matches string literals", () => {
			const result = match<"circle" | "square">("circle")
				.with("circle", () => "it's a circle")
				.with("square", () => "it's a square")
				.exhaustive();
			expect(result).toBe("it's a circle");
		});

		test("matches number literals", () => {
			const result = match<0 | 42>(42)
				.with(0, () => "zero")
				.with(42, () => "answer")
				.exhaustive();
			expect(result).toBe("answer");
		});

		test("matches boolean literals", () => {
			expect(
				match(true)
					.with(true, () => "yes")
					.with(false, () => "no")
					.exhaustive(),
			).toBe("yes");
		});

		test("matches null and undefined literals", () => {
			expect(
				match(null)
					.with(null, () => "null")
					.otherwise(() => "other"),
			).toBe("null");
			expect(
				match(undefined)
					.with(undefined, () => "undefined")
					.otherwise(() => "other"),
			).toBe("undefined");
		});

		test("matches NaN with Object.is semantics", () => {
			expect(
				match(NaN)
					.with(NaN, () => "nan")
					.otherwise(() => "other"),
			).toBe("nan");
		});
	});

	describe("Object shape patterns", () => {
		type Shape =
			| { type: "circle"; radius: number }
			| { type: "rect"; width: number; height: number };

		const area = (shape: Shape): number =>
			match(shape)
				.with({ type: "circle" }, ({ radius }) => Math.PI * radius * radius)
				.with({ type: "rect" }, ({ width, height }) => width * height)
				.exhaustive();

		test("matches discriminated unions and narrows the handler", () => {
			expect(area({ type: "circle", radius: 2 })).toBeCloseTo(Math.PI * 4);
			expect(area({ type: "rect", width: 3, height: 4 })).toBe(12);
		});

		test("nested patterns inside shapes", () => {
			type Config = {
				name: string;
				retries: number;
				opts?: { verbose: boolean };
			};
			const f = (config: Config): string =>
				match(config)
					.with(
						{ name: "prod", retries: P.number },
						({ retries }) => `prod with ${retries} retries`,
					)
					.with({ opts: { verbose: true } }, () => "verbose mode")
					.otherwise((c) => `default ${c.name}`);

			expect(f({ name: "prod", retries: 3 })).toBe("prod with 3 retries");
			expect(f({ name: "dev", retries: 0, opts: { verbose: true } })).toBe(
				"verbose mode",
			);
			expect(f({ name: "dev", retries: 0 })).toBe("default dev");
		});
	});

	describe("Wildcard patterns", () => {
		test("P.any matches anything", () => {
			expect(
				match(123)
					.with(0, () => "zero")
					.with(P.any, () => "anything")
					.exhaustive(),
			).toBe("anything");
		});

		test("P._ is an alias of P.any", () => {
			expect(
				match("hello")
					.with(P._, (v) => `got ${v}`)
					.exhaustive(),
			).toBe("got hello");
		});
	});

	describe("Type guard patterns", () => {
		test("P.string / P.number / P.boolean", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(P.string, (s) => `string:${s}`)
					.with(P.number, (n) => `number:${n.toFixed(1)}`)
					.with(P.boolean, (b) => `boolean:${b}`)
					.otherwise(() => "other");

			expect(f("hi")).toBe("string:hi");
			expect(f(3.14)).toBe("number:3.1");
			expect(f(true)).toBe("boolean:true");
		});

		test("P.bigint / P.symbol / P.nullish", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(P.bigint, (b) => `bigint:${b}`)
					.with(P.symbol, () => "symbol")
					.with(P.nullish, () => "nullish")
					.otherwise(() => "other");

			expect(f(10n)).toBe("bigint:10");
			expect(f(Symbol("x"))).toBe("symbol");
			expect(f(null)).toBe("nullish");
			expect(f(undefined)).toBe("nullish");
		});
	});

	describe("Array patterns", () => {
		test("array literal patterns match by length and elements", () => {
			const f = (v: number[]): string =>
				match(v)
					.with([], () => "empty")
					.with([1, 2], () => "one two")
					.with([P.number, P.number, P.number], () => "three numbers")
					.otherwise(() => "other");

			expect(f([])).toBe("empty");
			expect(f([1, 2])).toBe("one two");
			expect(f([7, 8, 9])).toBe("three numbers");
			expect(f([1])).toBe("other");
		});

		test("P.array() matches any array; P.array(sub) matches every element", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(P.array(), () => "any array")
					.otherwise(() => "not an array");
			expect(f([1, 2, 3])).toBe("any array");
			expect(f("nope")).toBe("not an array");

			const allNumbers = (v: unknown): boolean =>
				match(v)
					.with(P.array(P.number), () => true)
					.otherwise(() => false);
			expect(allNumbers([1, 2, 3])).toBe(true);
			expect(allNumbers([1, "two"])).toBe(false);
		});
	});

	describe("Class instance patterns", () => {
		test("P.instanceOf matches class instances", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(P.instanceOf(Date), (d) => `date:${d.getFullYear()}`)
					.with(P.instanceOf(Error), (e) => `error:${e.message}`)
					.otherwise(() => "other");

			expect(f(new Date("2024-01-01"))).toBe("date:2024");
			expect(f(new Error("boom"))).toBe("error:boom");
		});

		test("a bare class constructor can be used as a pattern", () => {
			class Point {
				constructor(
					readonly x: number,
					readonly y: number,
				) {}
			}
			const f = (v: unknown): string =>
				match(v)
					.with(Point, (p) => `point(${p.x},${p.y})`)
					.with(Date, () => "a date")
					.otherwise(() => "other");
			expect(f(new Point(1, 2))).toBe("point(1,2)");
			expect(f(new Date())).toBe("a date");
			expect(f(42)).toBe("other");
		});
	});

	describe("Composable guard patterns", () => {
		test("P.union matches any of its patterns", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(P.union(P.string, P.number), () => "string or number")
					.otherwise(() => "other");
			expect(f("a")).toBe("string or number");
			expect(f(3)).toBe("string or number");
			expect(f(true)).toBe("other");
		});

		test("P.when runs a custom predicate and narrows via type guard", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(
						P.when(
							(x): x is { id: number } =>
								typeof x === "object" && x !== null && "id" in x,
						),
						(x) => `id:${x.id}`,
					)
					.otherwise(() => "no id");
			expect(f({ id: 7 })).toBe("id:7");
			expect(f("nope")).toBe("no id");
		});

		test("P.not matches when the pattern does not match", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(P.not(P.string), () => "not a string")
					.otherwise(() => "a string");
			expect(f(42)).toBe("not a string");
			expect(f("hi")).toBe("a string");
		});

		test("P.optional matches undefined or the pattern", () => {
			const f = (v: unknown): string =>
				match(v)
					.with({ count: P.optional(P.number) }, ({ count }) =>
						count === undefined ? "no count" : `count:${count}`,
					)
					.otherwise(() => "no count prop");
			expect(f({ count: 3 })).toBe("count:3");
			expect(f({})).toBe("no count");
			expect(f({ count: undefined })).toBe("no count");
		});
	});

	describe("Terminal methods", () => {
		test("exhaustive returns the matching case result", () => {
			expect(
				match<1 | 2>(1)
					.with(1, () => "one")
					.with(2, () => "two")
					.exhaustive(),
			).toBe("one");
		});

		test("exhaustive throws when nothing matches", () => {
			expect(() =>
				match("unknown")
					// A lying type-guard: the types say this covers `string`,
					// but the runtime predicate never matches — so the runtime
					// safety net of `exhaustive()` still throws.
					.with(P.when((_v): _v is string => false), () => 1)
					.exhaustive(),
			).toThrow(/No pattern matched/);
		});

		test("otherwise provides a default case", () => {
			expect(
				match("x")
					.with("a", () => 1)
					.otherwise(() => 0),
			).toBe(0);
			expect(
				match("a")
					.with("a", () => 1)
					.otherwise(() => 0),
			).toBe(1);
		});

		test("run returns undefined when nothing matches", () => {
			expect(
				match("x")
					.with("a", () => 1)
					.run(),
			).toBeUndefined();
			expect(
				match("a")
					.with("a", () => 1)
					.run(),
			).toBe(1);
		});

		test("first matching case wins", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(P.number, () => "number")
					.with(P.any, () => "anything")
					.exhaustive();
			expect(f(5)).toBe("number");
			expect(f("x")).toBe("anything");
		});
	});

	describe("Compile-time exhaustiveness", () => {
		type Shape =
			| { type: "circle"; radius: number }
			| { type: "rect"; width: number; height: number };

		test("accepts fully covered unions", () => {
			const area = (shape: Shape): number =>
				match(shape)
					.with({ type: "circle" }, ({ radius }) => Math.PI * radius * radius)
					.with({ type: "rect" }, ({ width, height }) => width * height)
					.exhaustive()
			expect(area({ type: "circle", radius: 2 })).toBeCloseTo(Math.PI * 4);
			expect(area({ type: "rect", width: 3, height: 4 })).toBe(12);
		});

		test("rejects a missing union member (the user's example)", () => {
			const shape: Shape = { type: "circle", radius: 2 };
			// `as Shape` prevents const control-flow narrowing, so the input
			// stays the full union and the missing "rect" case is detected.
			const area: number = match(shape as Shape)
				.with({ type: "circle" }, ({ radius }) => Math.PI * radius * radius)
				// @ts-expect-error — the "rect" case is unhandled
				.exhaustive();
			// At runtime the circle case matches; the compile error is the point.
			expect(area).toBeCloseTo(Math.PI * 4);
		});

		test("rejects a missing member inside a typed return", () => {
			const area = (shape: Shape): number =>
				match(shape)
				.with({ type: "circle" }, ({ radius }) => Math.PI * radius * radius)
				// @ts-expect-error — the "rect" case is unhandled
				.exhaustive();
			expect(typeof area).toBe("function");
		});

		test("rejects when a literal union is not fully covered", () => {
			const s: "circle" | "square" = "circle" as "circle" | "square";
			// The cast prevents const control-flow narrowing, so "square"
			// stays unhandled and exhaustiveness is rejected.
			const result: string = match(s)
				.with("circle", () => "round")
				// @ts-expect-error — "square" is unhandled
				.exhaustive();
			// At runtime the circle case matches; the compile error is the point.
			expect(result).toBe("round");
		});

		test("accepts fully covered literal unions", () => {
			const describe = (s: "circle" | "square"): string =>
				match(s)
					.with("circle", () => "round")
					.with("square", () => "four corners")
					.exhaustive();
			expect(describe("circle")).toBe("round");
			expect(describe("square")).toBe("four corners");
		});

		test("a catch-all (P.any) satisfies exhaustiveness", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(P.string, (s) => `string:${s}`)
					.with(P.any, () => "other")
					.exhaustive();
			expect(f("hi")).toBe("string:hi");
			expect(f(5)).toBe("other");
		});

		test("otherwise() is an escape hatch that needs no exhaustiveness", () => {
			const f = (v: unknown): string =>
				match(v)
					.with(P.string, (s) => s)
					.otherwise(() => "not a string");
			expect(f("hi")).toBe("hi");
			expect(f(5)).toBe("not a string");
		});

		test("run() on a fully covered union excludes undefined", () => {
			// The `: number` annotation only compiles because the match is
			// exhaustive — otherwise run() would be `number | undefined`.
			const area = (shape: Shape): number =>
				match(shape)
					.with({ type: "circle" }, ({ radius }) => Math.PI * radius * radius)
					.with({ type: "rect" }, ({ width, height }) => width * height)
					.run();
			expect(area({ type: "circle", radius: 2 })).toBeCloseTo(Math.PI * 4);
			expect(area({ type: "rect", width: 3, height: 4 })).toBe(12);
		});
	});

	describe("matches() helper", () => {
		test("returns whether a value matches a pattern", () => {
			expect(matches({ type: "circle", radius: 5 }, { type: "circle" })).toBe(
				true,
			);
			expect(matches({ type: "rect", width: 1 }, { type: "circle" })).toBe(
				false,
			);
			expect(matches("hello", P.string)).toBe(true);
			expect(matches(42, P.string)).toBe(false);
			expect(matches([1, 2], P.array(P.number))).toBe(true);
			expect(matches([1, "x"], P.array(P.number))).toBe(false);
		});
	});

	describe("Integration with rustify types", () => {
		test("matches Option values via P.when type guards", () => {
			const describe = (opt: Option<number>): string =>
				match(opt)
					.with(
						P.when(
							(v): v is Option<number> => Option.isOption(v) && v.isSome(),
						),
						(s) => `Some(${s.unwrap()})`,
					)
					.with(
						P.when(
							(v): v is Option<number> => Option.isOption(v) && v.isNone(),
						),
						() => "None",
					)
					.exhaustive();

			expect(describe(Some(5))).toBe("Some(5)");
			expect(describe(None())).toBe("None");
		});

		test("matches Result values via P.when type guards", () => {
			const describe = (res: Result<number, string>): string =>
				match(res)
					.with(
						P.when(
							(v): v is Result<number, string> =>
								Result.isResult(v) && v.isOk(),
						),
						(ok) => `Ok(${ok.unwrap()})`,
					)
					.with(
						P.when(
							(v): v is Result<number, string> =>
								Result.isResult(v) && v.isErr(),
						),
						(err) => `Err(${err.unwrapErr()})`,
					)
					.exhaustive();

			expect(describe(Ok(42))).toBe("Ok(42)");
			expect(describe(Err("boom"))).toBe("Err(boom)");
		});

		test("Option.some passes the unwrapped value to the handler", () => {
			// The `n: number` annotations only compile because the handler
			// parameter is inferred from `Option<number>["unwrap"]`.
			const describe = (opt: Option<number>): string =>
				match(opt)
					.with(Option.some, (n: number) => `Some(${n.toFixed(2)})`)
					.with(Option.none, () => "None")
					.exhaustive();
			expect(describe(Some(5))).toBe("Some(5.00)");
			expect(describe(None())).toBe("None");
		});

		test("Option.none matches None; Option.some rejects non-Option values", () => {
			expect(matches(Some(5), Option.some)).toBe(true);
			expect(matches(None(), Option.some)).toBe(false);
			expect(matches(42, Option.some)).toBe(false);
			expect(matches(Some(5), Option.none)).toBe(false);
			expect(matches(None(), Option.none)).toBe(true);
		});

		test("Result.ok and Result.err pass unwrapped value/error to handlers", () => {
			const describe = (res: Result<number, string>): string =>
				match(res)
					.with(Result.ok, (v: number) => `Ok(${v.toFixed(2)})`)
					.with(Result.err, (e: string) => `Err(${e.toUpperCase()})`)
					.exhaustive();
			expect(describe(Ok(42))).toBe("Ok(42.00)");
			expect(describe(Err("boom"))).toBe("Err(BOOM)");
		});

		test("Option/Result patterns work on `unknown` input via P.any narrowing", () => {
			// Matching an unknown value: the pattern type argument pins the
			// handler parameter to the extracted type.
			const classify = (v: unknown): string =>
				match(v)
					.with(P.when((x): x is Option<number> => Option.isOption(x) && x.isSome()), (s) =>
						`Some(${s.unwrap()})`,
					)
					.with(P.when((x): x is Option<number> => Option.isOption(x) && x.isNone()), () => "None")
					.with(P.when((x): x is Result<number, string> => Result.isResult(x)), (r) =>
						r.isOk() ? `Ok(${r.unwrap()})` : `Err(${r.unwrapErr()})`,
					)
					.with(P.any, () => "other")
					.exhaustive();
			expect(classify(Some(5))).toBe("Some(5)");
			expect(classify(None())).toBe("None");
			expect(classify(Ok(7))).toBe("Ok(7)");
			expect(classify(Err("x"))).toBe("Err(x)");
			expect(classify("hi")).toBe("other");
		});
	});
});
