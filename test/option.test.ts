import { describe, expect, mock, test } from "bun:test";
import { None, Option, Some } from "../src/option/index"; // Path to src/option.ts
import { Err, Ok } from "../src/result"; // Path to src/result.ts

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
      const mockFn = mock(() => 0);
      expect(None<number>().unwrapOrElse(mockFn)).toBe(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
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
      const mockDefaultFn = mock(defaultFn);
      expect(None<number>().mapOrElse(mockDefaultFn, mapFn)).toBe("None!");
      expect(mockDefaultFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("inspect", () => {
    test("Some(value).inspect(fn) should call fn(value) and return Some(value)", () => {
      const mockFn = mock((_x: number) => {});
      const opt = Some(5);
      const result = opt.inspect(mockFn);
      expect(mockFn).toHaveBeenCalledWith(5);
      expect(result).toBe(opt);
    });
    test("None().inspect(fn) should not call fn and return None singleton", () => {
      const mockFn = mock((_x: any) => {});
      const opt = None();
      const result = opt.inspect(mockFn);
      expect(mockFn).not.toHaveBeenCalled();
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
      const errorFn = mock(() => "error");
      const result = opt.okOrElse(errorFn);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(5);
      expect(errorFn).not.toHaveBeenCalled();
    });
    test("None().okOrElse(fn) should return Err(fn())", () => {
      const errorFn = mock(() => "computed error");
      const result = None().okOrElse(errorFn);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("computed error");
      expect(errorFn).toHaveBeenCalledTimes(1);
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
});
