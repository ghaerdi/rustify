import { describe, test } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { assertSpyCall, assertSpyCalls, spy } from "@std/testing/mock";
import { None, Option, Some } from "../src/option/index.ts"; // Path to src/option.ts
import { Err, Ok } from "../src/result/index.ts"; // Path to src/result.ts

describe("Option", () => {
  describe("Creation & Basic Checks", () => {
    describe("Some", () => {
      const value = 5;
      const opt = Some(value);
      test("isSome should be true", () => expect(opt.isSome()).toBe(true));
      test("isNone should be false", () => expect(opt.isNone()).toBe(false));
      test("unwrap should return the value", () =>
        expect(opt.unwrap()).toBe(value));
    });

    describe("None Function", () => {
      const opt = None();
      test("isSome should be false", () => expect(opt.isSome()).toBe(false));
      test("isNone should be true", () => expect(opt.isNone()).toBe(true));
      test("should be instances of the same class", () => {
        const opt2 = None();
        expect(opt.constructor).toBe(opt2.constructor);
        expect(opt.isNone()).toBe(opt2.isNone());
      });
    });

    describe("Option.fromNullable", () => {
      test("should return Some for non-null value", () => {
        const option = Option.fromNullable(() => 10);
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(10);
      });
      test("should return Some for empty string", () => {
        const option = Option.fromNullable(() => "");
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe("");
      });
      test("should return Some for false", () => {
        const option = Option.fromNullable(() => false);
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(false);
      });
      test("should return Some for 0", () => {
        const option = Option.fromNullable(() => 0);
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(0);
      });
      test("should return None instance for null", () => {
        const option = Option.fromNullable(() => null);
        expect(option.isNone()).toBe(true);
        expect(option.isNone()).toBe(true);
      });
      test("should return None instance for undefined", () => {
        const option = Option.fromNullable(() => undefined);
        expect(option.isNone()).toBe(true);
        expect(option.isNone()).toBe(true);
      });
      test("should return None instance for a function returning undefined", () => {
        const option = Option.fromNullable(() => {
          return;
        });
        expect(option.isNone()).toBe(true);
        expect(option.isNone()).toBe(true);
      });
    });

    describe("Option.isOption", () => {
      test("should return true for Some", () =>
        expect(Option.isOption(Some(1))).toBe(true));
      test("should return true for None instance", () =>
        expect(Option.isOption(None())).toBe(true));
      test("should return false for null", () =>
        expect(Option.isOption(null)).toBe(false));
      test("should return false for undefined", () =>
        expect(Option.isOption(undefined)).toBe(false));
      test("should return false for a plain object", () =>
        expect(Option.isOption({})).toBe(false));
      test("should return false for a number", () =>
        expect(Option.isOption(123)).toBe(false));
      test("should return false for a string", () =>
        expect(Option.isOption("string")).toBe(false));
    });
  });

  describe("isSomeAnd", () => {
    test("Some(value).isSomeAnd(predicate) should be true if predicate is true", () => {
      expect(Some(5).isSomeAnd((x) => x > 3)).toBe(true);
    });
    test("Some(value).isSomeAnd(predicate) should be false if predicate is false", () => {
      expect(Some(5).isSomeAnd((x) => x < 3)).toBe(false);
    });
    test("None().isSomeAnd(predicate) should be false", () => {
      expect(None().isSomeAnd((x: any) => x > 3)).toBe(false); // Use singleton
    });
  });

  describe("expect", () => {
    test("Some(value).expect(message) should return value", () => {
      expect(Some(5).expect("should be Some")).toBe(5);
    });
    test("None().expect(message) should throw with the given message", () => {
      const msg = "Value is None!";
      try {
        None().expect(msg); // Use singleton
        throw new Error("Test failed: expect did not throw");
      } catch (e: any) {
        expect(e.message.startsWith(msg)).toBe(true);
      }
    });
  });

  describe("unwrap", () => {
    test("Some(value).unwrap() should return value", () => {
      expect(Some(5).unwrap()).toBe(5);
    });
    test("None().unwrap() should throw", () => {
      try {
        None().unwrap(); // Use singleton
        throw new Error("Test failed: unwrap did not throw");
      } catch (e: any) {
        expect(e.message.startsWith("Tried to unwrap a None value")).toBe(true);
      }
    });
  });

  describe("unwrapOr", () => {
    const defaultValue = 0;
    test("Some(value).unwrapOr(defaultValue) should return value", () => {
      expect(Some(5).unwrapOr(defaultValue)).toBe(5);
    });
    test("None().unwrapOr(defaultValue) should return defaultValue", () => {
      expect(None<number>().unwrapOr(0)).toBe(0);
      expect(None<string>().unwrapOr("default")).toBe("default");
    });
  });

  describe("unwrapOrElse", () => {
    const defaultValueFn = () => 0;
    test("Some(value).unwrapOrElse(fn) should return value", () => {
      expect(Some(5).unwrapOrElse(defaultValueFn)).toBe(5);
    });
    test("None().unwrapOrElse(fn) should compute and return defaultValue", () => {
      const mockFn = spy(() => 0);
      expect(None<number>().unwrapOrElse(mockFn)).toBe(0);
      assertSpyCalls(mockFn, 1);
    });
  });

  describe("map", () => {
    const mapFn = (x: number) => x.toString();
    test("Some(value).map(fn) should return Some(fn(value))", () => {
      const result = Some(5).map(mapFn);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe("5");
    });
    test("None().map(fn) should return None singleton", () => {
      const result = None<number>().map(mapFn);
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
  });

  describe("mapOr", () => {
    const defaultValue = "default";
    const mapFn = (x: number) => x.toString();
    test("Some(value).mapOr(defaultValue, fn) should return fn(value)", () => {
      expect(Some(5).mapOr(defaultValue, mapFn)).toBe("5");
    });
    test("None().mapOr(defaultValue, fn) should return defaultValue", () => {
      expect(None<number>().mapOr(defaultValue, mapFn)).toBe(defaultValue);
    });
  });

  describe("mapOrElse", () => {
    const defaultFn = () => "None!";
    const mapFn = (x: number) => `Some: ${x}`;
    test("Some(value).mapOrElse(defaultFn, fn) should return fn(value)", () => {
      expect(Some(5).mapOrElse(defaultFn, mapFn)).toBe("Some: 5");
    });
    test("None().mapOrElse(defaultFn, fn) should return defaultFn()", () => {
      const mockDefaultFn = spy(defaultFn);
      expect(None<number>().mapOrElse(mockDefaultFn, mapFn)).toBe("None!");
      assertSpyCalls(mockDefaultFn, 1);
    });
  });

  describe("inspect", () => {
    test("Some(value).inspect(fn) should call fn(value) and return Some(value)", () => {
      const mockFn = spy((_x: number) => {});
      const opt = Some(5);
      const result = opt.inspect(mockFn);
      assertSpyCall(mockFn, 0, { args: [5] });
      expect(result).toBe(opt);
    });
    test("None().inspect(fn) should not call fn and return None singleton", () => {
      const mockFn = spy((_x: any) => {});
      const opt = None();
      const result = opt.inspect(mockFn);
      assertSpyCalls(mockFn, 0);
      expect(result.isNone()).toBe(true);
    });
  });

  describe("and", () => {
    test("Some(value).and(Some(otherValue)) should return Some(otherValue)", () => {
      const result = Some(2).and(Some("late success"));
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe("late success");
    });
    test("Some(value).and(None()) should return None singleton", () => {
      const result = Some(2).and(None()); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
    test("None().and(Some(value)) should return None singleton", () => {
      const result = None().and(Some("late success")); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
    test("None().and(None()) should return None singleton", () => {
      const result = None().and(None()); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
  });

  describe("andThen", () => {
    const fnReturningSome = (x: number) => Some(x > 0);
    const fnReturningNone = (_x: number) => None();
    test("Some(value).andThen(fnReturningSome) should return result of fnReturningSome", () => {
      const result = Some(5).andThen(fnReturningSome);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(true);
    });
    test("Some(value).andThen(fnReturningNone) should return None singleton", () => {
      const result = Some(5).andThen(fnReturningNone);
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
    test("None().andThen(fn) should return None singleton", () => {
      const result = None<number>().andThen(fnReturningSome);
      expect(result.isNone()).toBe(true);
      const result2 = None<number>().andThen(fnReturningNone);
      expect(result2.isNone()).toBe(true);
    });
  });

  describe("or", () => {
    test("Some(value).or(Some(otherValue)) should return Some(value)", () => {
      const result = Some(5).or(Some(10));
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(5);
    });
    test("Some(value).or(None()) should return Some(value)", () => {
      const result = Some(5).or(None());
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(5);
    });
    test("None().or(Some(value)) should return Some(value)", () => {
      const result = None().or(Some(10));
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(10);
    });
    test("None().or(None()) should return None singleton", () => {
      const result = None().or(None());
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
  });

  describe("orElse", () => {
    const fnReturningSome = () => Some(0);
    const fnReturningNone = () => None();
    test("Some(value).orElse(fn) should return Some(value)", () => {
      const opt = Some(5);
      const result = opt.orElse(fnReturningSome);
      expect(result).toBe(opt);
    });
    test("None().orElse(fnReturningSome) should return result of fnReturningSome", () => {
      const result = None().orElse(fnReturningSome);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(0);
    });
    test("None().orElse(fnReturningNone) should return None singleton", () => {
      const result = None().orElse(fnReturningNone); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
  });

  describe("xor", () => {
    test("Some(value).xor(None()) should return Some(value)", () => {
      const result = Some(1).xor(None()); // Use singleton
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(1);
    });
    test("None().xor(Some(otherValue)) should return Some(otherValue)", () => {
      const result = None().xor(Some(2)); // Use singleton
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(2);
    });
    test("Some(value).xor(Some(otherValue)) should return None singleton", () => {
      const result = Some(1).xor(Some(2));
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
    test("None().xor(None()) should return None singleton", () => {
      const result = None().xor(None()); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
  });

  describe("cloned", () => {
    test("Some(primitive).cloned() should return a new Some with the same primitive", () => {
      const opt = Some(5);
      const clonedOpt = opt.cloned();
      expect(clonedOpt.isSome()).toBe(true);
      expect(clonedOpt.unwrap()).toBe(5);
      expect(clonedOpt).not.toBe(opt);
    });
    test("Some(object).cloned() should return a new Some with a structured clone of the object", () => {
      const obj = { a: 1, b: { c: 2 } };
      const opt = Some(obj);
      const clonedOpt = opt.cloned();
      const clonedValue = clonedOpt.unwrap();
      expect(clonedValue).toEqual(obj);
      expect(clonedValue).not.toBe(obj);
      expect(clonedValue.b).not.toBe(obj.b);
    });
    test("None().cloned() should return None singleton (no actual cloning occurs)", () => {
      const opt = None();
      const clonedOpt = opt.cloned();
      expect(clonedOpt.isNone()).toBe(true);
      expect(clonedOpt.isNone()).toBe(true);
    });
  });

  describe("zip", () => {
    test("Some(a).zip(Some(b)) should return Some([a,b])", () => {
      const result = Some(1).zip(Some("a"));
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual([1, "a"]);
    });
    test("Some(a).zip(None()) should return None singleton", () => {
      const result = Some(1).zip(None()); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
    test("None().zip(Some(b)) should return None singleton", () => {
      const result = None().zip(Some("a")); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
    test("None().zip(None()) should return None singleton", () => {
      const result = None().zip(None()); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result.isNone()).toBe(true);
    });
  });

  describe("zipWith", () => {
    const zipFn = (n: number, s: string) => `${n}${s}`;
    test("Some(a).zipWith(Some(b), fn) should return Some(fn(a,b))", () => {
      const result = Some(1).zipWith(Some("a"), zipFn);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe("1a");
    });
    test("Some(a).zipWith(None(), fn) should return None singleton", () => {
      const result = Some(1).zipWith(None<string>(), zipFn);
      expect(result.isNone()).toBe(true);
    });
    test("None().zipWith(Some(b), fn) should return None singleton", () => {
      const result = None<number>().zipWith(Some("a"), zipFn);
      expect(result.isNone()).toBe(true);
    });
    test("None().zipWith(None(), fn) should return None singleton", () => {
      const result = None<number>().zipWith(None<string>(), zipFn);
      expect(result.isNone()).toBe(true);
    });
  });

  describe("match", () => {
    const someHandler = (value: number) => `Success: ${value}`;
    const noneHandler = () => "It was None";
    test("Some(value).match({ Some: s => ..., None: () => ... }) should execute the Some handler", () => {
      const result = Some(10).match({ Some: someHandler, None: noneHandler });
      expect(result).toBe("Success: 10");
    });
    test("None().match({ Some: s => ..., None: () => ... }) should execute the None handler", () => {
      const result = None<number>().match({
        Some: someHandler,
        None: noneHandler,
      });
      expect(result).toBe("It was None");
    });
  });

  describe("Iterable Protocol", () => {
    test("Some(iterableValue) allows iteration", () => {
      const arr = [1, 2, 3];
      const opt = Some(arr);
      const result: number[] = [];
      for (const item of opt) result.push(item);
      expect(result).toEqual(arr);
    });
    test("None completes iteration immediately", () => {
      const opt = None();
      let count = 0;
      for (const _item of opt) count++;
      expect(count).toBe(0);
    });
  });

  // Tests for new missing methods
  describe("flatten", () => {
    test("Some(Some(value)).flatten() should return Some(value)", () => {
      const nested = Some(Some(5));
      const flattened = nested.flatten();
      expect(flattened.isSome()).toBe(true);
      expect(flattened.unwrap()).toBe(5);
    });
    test("Some(None).flatten() should return None singleton", () => {
      const nested = Some(None());
      const flattened = nested.flatten();
      expect(flattened.isNone()).toBe(true);
      expect(flattened.isNone()).toBe(true);
    });
    test("None().flatten() should return None singleton", () => {
      const flattened = None().flatten();
      expect(flattened.isNone()).toBe(true);
      expect(flattened.isNone()).toBe(true);
    });
  });

  describe("filter", () => {
    test("Some(value).filter(predicate) should return Some(value) if predicate is true", () => {
      const opt = Some(5);
      const filtered = opt.filter((x) => x > 3);
      expect(filtered.isSome()).toBe(true);
      expect(filtered.unwrap()).toBe(5);
    });
    test("Some(value).filter(predicate) should return None if predicate is false", () => {
      const opt = Some(5);
      const filtered = opt.filter((x) => x > 10);
      expect(filtered.isNone()).toBe(true);
      expect(filtered.isNone()).toBe(true);
    });
    test("None().filter(predicate) should return None singleton", () => {
      const filtered = None().filter((x: any) => x > 3);
      expect(filtered.isNone()).toBe(true);
      expect(filtered.isNone()).toBe(true);
    });
  });

  describe("contains", () => {
    test("Some(value).contains(value) should return true", () => {
      expect(Some(5).contains(5)).toBe(true);
    });
    test("Some(value).contains(differentValue) should return false", () => {
      expect(Some(5).contains(10)).toBe(false);
    });
    test("None().contains(value) should return false", () => {
      expect(None<number>().contains(5)).toBe(false);
    });
  });

  describe("okOr", () => {
    test("Some(value).okOr(err) should return Ok(value)", () => {
      const opt = Some(5);
      const result = opt.okOr("error");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(5);
    });
    test("None().okOr(err) should return Err(err)", () => {
      const result = None().okOr("error");
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("error");
    });
  });

  describe("okOrElse", () => {
    test("Some(value).okOrElse(fn) should return Ok(value)", () => {
      const opt = Some(5);
      const errorFn = spy(() => "error");
      const result = opt.okOrElse(errorFn);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(5);
      assertSpyCalls(errorFn, 0);
    });
    test("None().okOrElse(fn) should return Err(fn())", () => {
      const errorFn = spy(() => "computed error");
      const result = None().okOrElse(errorFn);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("computed error");
      assertSpyCalls(errorFn, 1);
    });
  });

  describe("transpose", () => {
    test("Some(Ok(value)).transpose() should return Ok(Some(value))", () => {
      const opt = Some(Ok(5));
      const transposed = opt.transpose();
      expect(transposed.isOk()).toBe(true);
      expect(transposed.unwrap().isSome()).toBe(true);
      expect(transposed.unwrap().unwrap()).toBe(5);
    });
    test("Some(Err(error)).transpose() should return Err(error)", () => {
      const opt = Some(Err("error"));
      const transposed = opt.transpose();
      expect(transposed.isErr()).toBe(true);
      expect(transposed.unwrapErr()).toBe("error");
    });
    test("None().transpose() should return Ok(None)", () => {
      const transposed = None().transpose();
      expect(transposed.isOk()).toBe(true);
      expect(transposed.unwrap().isNone()).toBe(true);
      expect(transposed.unwrap().isNone()).toBe(true);
    });
  });

  describe("unwrapOrDefault", () => {
    test("Some(value).unwrapOrDefault() should return value", () => {
      const opt = Some(5);
      const value = opt.unwrapOrDefault();
      expect(value).toBe(5);
    });
    test("None().unwrapOrDefault() should throw error (no Default trait in TypeScript)", () => {
      expect(() => None().unwrapOrDefault()).toThrow(
        "Cannot unwrap None to default value. TypeScript doesn't have a Default trait. Use unwrapOr(defaultValue) instead.",
      );
    });
  });

  describe("getOrInsert", () => {
    test("Some(value).getOrInsert() should return value", () => {
      expect(Some(5).getOrInsert(10)).toBe(5);
    });
    test("None().getOrInsert() should return inserted value", () => {
      expect(None<number>().getOrInsert(10)).toBe(10);
    });
    test("None().getOrInsert() should mutate to Some", () => {
      const x = None<number>();
      x.getOrInsert(10);
      expect(x.isSome()).toBe(true);
      expect(x.unwrap()).toBe(10);
    });
    test("None().getOrInsert() should only insert once", () => {
      const x = None<number>();
      x.getOrInsert(10);
      x.getOrInsert(20);
      expect(x.unwrap()).toBe(10);
    });
  });

  describe("getOrInsertWith", () => {
    test("Some(value).getOrInsertWith() should return value", () => {
      expect(Some(5).getOrInsertWith(() => 10)).toBe(5);
    });
    test("None().getOrInsertWith() should return inserted value", () => {
      expect(None<number>().getOrInsertWith(() => 10)).toBe(10);
    });
    test("None().getOrInsertWith() should mutate to Some", () => {
      const x = None<number>();
      x.getOrInsertWith(() => 10);
      expect(x.isSome()).toBe(true);
      expect(x.unwrap()).toBe(10);
    });
    test("None().getOrInsertWith() should only compute once", () => {
      const x = None<number>();
      let calls = 0;
      x.getOrInsertWith(() => {
        calls++;
        return 10;
      });
      x.getOrInsertWith(() => {
        calls++;
        return 20;
      });
      expect(calls).toBe(1);
      expect(x.unwrap()).toBe(10);
    });
  });

  describe("take", () => {
    test("Some(value).take() should return Some with the value", () => {
      const x = Some(5);
      const y = x.take();
      expect(x.isNone()).toBe(true);
      expect(y.isSome()).toBe(true);
      expect(y.unwrap()).toBe(5);
    });
    test("None().take() should return None", () => {
      const x = None<number>();
      const y = x.take();
      expect(x.isNone()).toBe(true);
      expect(y.isNone()).toBe(true);
    });
  });

  describe("takeIf", () => {
    test("Some(value).takeIf(predicate) should return Some when predicate is true", () => {
      const x = Some(5);
      const y = x.takeIf((value) => value === 5);
      expect(x.isNone()).toBe(true);
      expect(y.isSome()).toBe(true);
      expect(y.unwrap()).toBe(5);
    });
    test("Some(value).takeIf(predicate) should return None when predicate is false", () => {
      const x = Some(5);
      const y = x.takeIf((value) => value === 4);
      expect(x.isSome()).toBe(true);
      expect(y.isNone()).toBe(true);
    });
    test("None().takeIf(predicate) should return None", () => {
      const x = None<number>();
      const y = x.takeIf((value) => value === 5);
      expect(x.isNone()).toBe(true);
      expect(y.isNone()).toBe(true);
    });
  });

  describe("Rust std parity", () => {
    describe("expect", () => {
      test("None().expect(msg) should throw with exactly the custom message", () => {
        expect(() => None<string>().expect("fruits are healthy")).toThrow(
          "fruits are healthy",
        );
      });
    });

    describe("unwrap", () => {
      test("None().unwrap() should throw 'Tried to unwrap a None value'", () => {
        expect(() => None().unwrap()).toThrow("Tried to unwrap a None value");
      });
    });

    describe("unwrapOr", () => {
      test("car/bike example", () => {
        expect(Some("car").unwrapOr("bike")).toBe("car");
        expect(None<string>().unwrapOr("bike")).toBe("bike");
      });
    });

    describe("unwrapOrElse", () => {
      test("should NOT call the closure when Some (lazy evaluation)", () => {
        let calls = 0;
        const k = 10;
        const result = Some(4).unwrapOrElse(() => {
          calls++;
          return 2 * k;
        });
        expect(result).toBe(4);
        expect(calls).toBe(0);
      });
      test("should compute from the closure when None", () => {
        const k = 10;
        expect(None<number>().unwrapOrElse(() => 2 * k)).toBe(20);
      });
    });

    describe("map", () => {
      test("can change the contained type", () => {
        expect(
          Some("foo")
            .map((v) => v.length)
            .unwrap(),
        ).toBe(3);
      });
    });

    describe("mapOr", () => {
      test("string-length example", () => {
        expect(Some("foo").mapOr(42, (v) => v.length)).toBe(3);
        expect(None<string>().mapOr(42, (v) => v.length)).toBe(42);
      });
    });

    describe("andThen", () => {
      test("sq_then_to_string overflow example", () => {
        const sqThenToString = (x: number): Option<string> =>
          x * x > 1000 ? None() : Some(String(x * x));
        expect(Some(2).andThen(sqThenToString).unwrap()).toBe("4");
        expect(Some(1000).andThen(sqThenToString).isNone()).toBe(true);
        expect(None<number>().andThen(sqThenToString).isNone()).toBe(true);
      });
    });

    describe("orElse", () => {
      test("should NOT call the closure when Some (lazy evaluation)", () => {
        let calls = 0;
        const result = Some(4).orElse(() => {
          calls++;
          return Some(8);
        });
        expect(result.unwrap()).toBe(4);
        expect(calls).toBe(0);
      });
    });

    describe("filter", () => {
      test("is_even example", () => {
        const isEven = (n: number) => n % 2 === 0;
        expect(None<number>().filter(isEven).isNone()).toBe(true);
        expect(Some(3).filter(isEven).isNone()).toBe(true);
        expect(Some(4).filter(isEven).unwrap()).toBe(4);
      });
    });

    describe("inspect", () => {
      test("chained before expect (list example)", () => {
        const list = [1, 2, 3];
        const seen: number[] = [];
        const x = Some(list[1])
          .inspect((v) => seen.push(v))
          .expect("list should be long enough");
        expect(x).toBe(2);
        expect(seen).toEqual([2]);

        const noneSeen: number[] = [];
        None<number>().inspect((v) => noneSeen.push(v));
        expect(noneSeen).toEqual([]);
      });
    });

    describe("okOr", () => {
      test("foo/0 example", () => {
        const some = Some("foo").okOr(0);
        expect(some.isOk()).toBe(true);
        expect(some.unwrap()).toBe("foo");

        const none = None<string>().okOr(0);
        expect(none.isErr()).toBe(true);
        expect(none.unwrapErr()).toBe(0);
      });
    });

    describe("okOrElse", () => {
      test("foo/0 example with lazy error", () => {
        const some = Some("foo").okOrElse(() => 0);
        expect(some.unwrap()).toBe("foo");

        const none = None<string>().okOrElse(() => 0);
        expect(none.unwrapErr()).toBe(0);
      });
    });

    describe("zip", () => {
      test("zips different types", () => {
        const zipped = Some(1).zip(Some("hi"));
        expect(zipped.isSome()).toBe(true);
        expect(zipped.unwrap()).toEqual([1, "hi"]);
        expect(Some(1).zip(None<string>()).isNone()).toBe(true);
      });
    });

    describe("getOrInsert", () => {
      test("does not overwrite an existing value", () => {
        const x = None<number>();
        expect(x.getOrInsert(5)).toBe(5);
        expect(x.getOrInsert(7)).toBe(5);
        expect(x.unwrap()).toBe(5);
      });
    });

    describe("takeIf", () => {
      test("Rust-style two-step sequence", () => {
        const x = Some(42);

        // predicate false → not taken, option unchanged
        const prev1 = x.takeIf((v) => v !== 42);
        expect(x.isSome()).toBe(true);
        expect(prev1.isNone()).toBe(true);

        // predicate true → taken, option becomes None
        const prev2 = x.takeIf((v) => v === 42);
        expect(x.isNone()).toBe(true);
        expect(prev2.isSome()).toBe(true);
        expect(prev2.unwrap()).toBe(42);
      });
    });
  });
});

describe("Rust std parity: insert/replace/isNoneOr/expectNone/count/copied/unzip", () => {
  test("insert stores the value and returns it", () => {
    const x = None<number>();
    expect(x.insert(5)).toBe(5);
    expect(x.isSome()).toBe(true);
    expect(x.unwrap()).toBe(5);
  });

  test("insert overwrites an existing value", () => {
    const x = Some(1);
    expect(x.insert(2)).toBe(2);
    expect(x.unwrap()).toBe(2);
  });

  test("replace returns the previous contents", () => {
    const x = Some(5);
    expect(x.replace(10).unwrap()).toBe(5);
    expect(x.unwrap()).toBe(10);
  });

  test("replace on None returns None and stores the value", () => {
    const x = None<number>();
    expect(x.replace(10).isNone()).toBe(true);
    expect(x.unwrap()).toBe(10);
  });

  test("isNoneOr returns true for None without calling the predicate", () => {
    const calls: number[] = [];
    expect(
      None<number>().isNoneOr((v) => {
        calls.push(v);
        return true;
      }),
    ).toBe(true);
    expect(calls).toEqual([]); // lazy — predicate never called
  });

  test("isNoneOr matches the predicate for Some", () => {
    expect(Some(5).isNoneOr((v) => v > 3)).toBe(true);
    expect(Some(2).isNoneOr((v) => v > 3)).toBe(false);
  });

  test("expectNone returns undefined for None", () => {
    expect(None().expectNone()).toBeUndefined();
  });

  test("expectNone throws with message and value for Some", () => {
    expect(() => Some(5).expectNone()).toThrow("Tried to expect None: 5");
    expect(() => Some("x").expectNone("custom")).toThrow("custom: x");
  });

  test("count returns 1 for Some and 0 for None", () => {
    expect(Some(5).count()).toBe(1);
    expect(None().count()).toBe(0);
  });

  test("copied returns the same option", () => {
    const x = Some(5);
    expect(x.copied()).toBe(x);
    expect(None().copied().isNone()).toBe(true);
  });

  test("unzip splits Some([a, b]) into [Some(a), Some(b)]", () => {
    const [a, b] = Some([1, "one"] as [number, string]).unzip();
    expect(a.unwrap()).toBe(1);
    expect(b.unwrap()).toBe("one");
  });

  test("unzip on None returns [None, None]", () => {
    const [a, b] = None<[number, string]>().unzip();
    expect(a.isNone()).toBe(true);
    expect(b.isNone()).toBe(true);
  });
});

describe("Option.isSome / Option.isNone type guards", () => {
  test("narrows the Some branch and unwraps typed values", () => {
    const describe = (opt: Option<number>): string => {
      if (Option.isSome(opt)) {
        // opt: Option<number> & { __tag: "some" } — unwrap() is typed
        return `some: ${opt.unwrap()}`;
      }
      // opt: narrowed to the None variant
      return "none";
    };
    expect(describe(Some(5))).toBe("some: 5");
    expect(describe(None())).toBe("none");
  });

  test("narrows the None branch", () => {
    const isMissing = (opt: Option<number>): boolean => {
      if (Option.isNone(opt)) return true;
      return false;
    };
    expect(isMissing(None())).toBe(true);
    expect(isMissing(Some(5))).toBe(false);
  });

  test("works with Array.filter for type-safe Some extraction", () => {
    const values: Option<number>[] = [Some(1), None(), Some(3)];
    const someValues = values.filter(Option.isSome);
    // someValues: (Option<number> & { __tag: "some" })[] — unwrap() typed
    const doubled = someValues.map((s) => s.unwrap() * 2);
    expect(doubled).toEqual([2, 6]);
  });

  test("rejects non-Option values", () => {
    expect(Option.isSome(42)).toBe(false);
    expect(Option.isNone("hello")).toBe(false);
    expect(Option.isSome(null)).toBe(false);
  });
});
