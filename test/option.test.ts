import { expect, test, describe, mock } from "bun:test";
import { Some, None, Option } from "../src/option"; // Path to src/option.ts

describe("Option", () => {
  describe("Creation & Basic Checks", () => {
    describe("Some", () => {
      const value = 5;
      const opt = Some(value);
      test("isSome should be true", () => expect(opt.isSome()).toBe(true));
      test("isNone should be false", () => expect(opt.isNone()).toBe(false));
      test("unwrap should return the value", () => expect(opt.unwrap()).toBe(value));
    });

    describe("None Singleton", () => {
      const opt = None; // Use singleton
      test("isSome should be false", () => expect(opt.isSome()).toBe(false));
      test("isNone should be true", () => expect(opt.isNone()).toBe(true));
      test("should be referentially equal to other None instances", () => {
        const opt2 = None;
        expect(opt).toBe(opt2);
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
      test("should return None singleton for null", () => {
        const option = Option.fromNullable(() => null);
        expect(option.isNone()).toBe(true);
        expect(option).toBe(None); // Check for singleton
      });
      test("should return None singleton for undefined", () => {
        const option = Option.fromNullable(() => undefined);
        expect(option.isNone()).toBe(true);
        expect(option).toBe(None); // Check for singleton
      });
       test("should return None singleton for a function returning undefined", () => {
        const option = Option.fromNullable(() => { return; });
        expect(option.isNone()).toBe(true);
        expect(option).toBe(None); // Check for singleton
      });
    });

    describe("Option.isOption", () => {
      test("should return true for Some", () => expect(Option.isOption(Some(1))).toBe(true));
      test("should return true for None singleton", () => expect(Option.isOption(None)).toBe(true)); // Use singleton
      test("should return false for null", () => expect(Option.isOption(null)).toBe(false));
      test("should return false for undefined", () => expect(Option.isOption(undefined)).toBe(false));
      test("should return false for a plain object", () => expect(Option.isOption({})).toBe(false));
      test("should return false for a number", () => expect(Option.isOption(123)).toBe(false));
      test("should return false for a string", () => expect(Option.isOption("string")).toBe(false));
    });
  });

  describe("isSomeAnd", () => {
    test("Some(value).isSomeAnd(predicate) should be true if predicate is true", () => {
      expect(Some(5).isSomeAnd(x => x > 3)).toBe(true);
    });
    test("Some(value).isSomeAnd(predicate) should be false if predicate is false", () => {
      expect(Some(5).isSomeAnd(x => x < 3)).toBe(false);
    });
    test("None.isSomeAnd(predicate) should be false", () => {
      expect(None.isSomeAnd((x: any) => x > 3)).toBe(false); // Use singleton
    });
  });

  describe("expect", () => {
    test("Some(value).expect(message) should return value", () => {
      expect(Some(5).expect("should be Some")).toBe(5);
    });
    test("None.expect(message) should throw with the given message", () => {
      const msg = "Value is None!";
      try {
        None.expect(msg); // Use singleton
        throw new Error("Test failed: expect did not throw");
      } catch (e: any) {
        expect(e.message.startsWith(msg)).toBe(true);
        expect(e.message.includes("\n")).toBe(true); // Stack trace check
      }
    });
  });

  describe("unwrap", () => {
    test("Some(value).unwrap() should return value", () => {
      expect(Some(5).unwrap()).toBe(5);
    });
    test("None.unwrap() should throw", () => {
      try {
        None.unwrap(); // Use singleton
        throw new Error("Test failed: unwrap did not throw");
      } catch (e: any) {
        expect(e.message.startsWith("Tried to unwrap a None value")).toBe(true);
        expect(e.message.includes("\n")).toBe(true); // Stack trace check
      }
    });
  });

  describe("unwrapOr", () => {
    const defaultValue = 0;
    test("Some(value).unwrapOr(defaultValue) should return value", () => {
      expect(Some(5).unwrapOr(defaultValue)).toBe(5);
    });
    test("None.unwrapOr(defaultValue) should return defaultValue", () => {
      expect(None.unwrapOr(defaultValue)).toBe(defaultValue); // Use singleton
      expect(None.unwrapOr("default")).toBe("default"); // Use singleton
    });
  });

  describe("unwrapOrElse", () => {
    const defaultValueFn = () => 0;
    test("Some(value).unwrapOrElse(fn) should return value", () => {
      expect(Some(5).unwrapOrElse(defaultValueFn)).toBe(5);
    });
    test("None.unwrapOrElse(fn) should compute and return defaultValue", () => {
      const mockFn = mock(defaultValueFn);
      expect(None.unwrapOrElse(mockFn)).toBe(0); // Use singleton
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
    test("None.map(fn) should return None singleton", () => {
      const result = None.map(mapFn); // Use singleton, no generic needed for None
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
  });

  describe("mapOr", () => {
    const defaultValue = "default";
    const mapFn = (x: number) => x.toString();
    test("Some(value).mapOr(defaultValue, fn) should return fn(value)", () => {
      expect(Some(5).mapOr(defaultValue, mapFn)).toBe("5");
    });
    test("None.mapOr(defaultValue, fn) should return defaultValue", () => {
      expect(None.mapOr(defaultValue, mapFn as any)).toBe(defaultValue); // Use singleton
    });
  });

  describe("mapOrElse", () => {
    const defaultFn = () => "None!";
    const mapFn = (x: number) => `Some: ${x}`;
    test("Some(value).mapOrElse(defaultFn, fn) should return fn(value)", () => {
      expect(Some(5).mapOrElse(defaultFn, mapFn)).toBe("Some: 5");
    });
    test("None.mapOrElse(defaultFn, fn) should return defaultFn()", () => {
      const mockDefaultFn = mock(defaultFn);
      expect(None.mapOrElse(mockDefaultFn, mapFn as any)).toBe("None!"); // Use singleton
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
    test("None.inspect(fn) should not call fn and return None singleton", () => {
      const mockFn = mock((_x: any) => {});
      const opt = None; // Use singleton
      const result = opt.inspect(mockFn);
      expect(mockFn).not.toHaveBeenCalled();
      expect(result).toBe(None); // Check for singleton
    });
  });

  describe("and", () => {
    test("Some(value).and(Some(otherValue)) should return Some(otherValue)", () => {
      const result = Some(2).and(Some("late success"));
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe("late success");
    });
    test("Some(value).and(None) should return None singleton", () => {
      const result = Some(2).and(None); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
    test("None.and(Some(value)) should return None singleton", () => {
      const result = None.and(Some("late success")); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
    test("None.and(None) should return None singleton", () => {
      const result = None.and(None); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
  });

  describe("andThen", () => {
    const fnReturningSome = (x: number) => Some(x > 0);
    const fnReturningNone = (_x: number) => None; // Return singleton
    test("Some(value).andThen(fnReturningSome) should return result of fnReturningSome", () => {
      const result = Some(5).andThen(fnReturningSome);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(true);
    });
    test("Some(value).andThen(fnReturningNone) should return None singleton", () => {
      const result = Some(5).andThen(fnReturningNone);
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
    test("None.andThen(fn) should return None singleton", () => {
      const result = None.andThen(fnReturningSome); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
      const result2 = None.andThen(fnReturningNone); // Use singleton
      expect(result2.isNone()).toBe(true);
      expect(result2).toBe(None); // Check for singleton
    });
  });

  describe("or", () => {
    test("Some(value).or(Some(otherValue)) should return Some(value)", () => {
      const result = Some(5).or(Some(10));
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(5);
    });
    test("Some(value).or(None) should return Some(value)", () => {
      const result = Some(5).or(None);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(5);
    });
    test("None.or(Some(value)) should return Some(value)", () => {
      const result = None.or(Some(10));
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(10);
    });
    test("None.or(None) should return None singleton", () => {
      const result = None.or(None);
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None);
    });
  });

  describe("orElse", () => {
    const fnReturningSome = () => Some(0);
    const fnReturningNone = () => None;
    test("Some(value).orElse(fn) should return Some(value)", () => {
      const opt = Some(5);
      const result = opt.orElse(fnReturningSome);
      expect(result).toBe(opt);
    });
    test("None.orElse(fnReturningSome) should return result of fnReturningSome", () => {
      const result = None.orElse(fnReturningSome);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(0);
    });
    test("None.orElse(fnReturningNone) should return None singleton", () => {
      const result = None.orElse(fnReturningNone); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
  });

  describe("xor", () => {
    test("Some(value).xor(None) should return Some(value)", () => {
      const result = Some(1).xor(None); // Use singleton
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(1);
    });
    test("None.xor(Some(otherValue)) should return Some(otherValue)", () => {
      const result = None.xor(Some(2)); // Use singleton
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(2);
    });
    test("Some(value).xor(Some(otherValue)) should return None singleton", () => {
      const result = Some(1).xor(Some(2));
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
    test("None.xor(None) should return None singleton", () => {
      const result = None.xor(None); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
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
    test("None.cloned() should return None singleton (no actual cloning occurs)", () => {
      const opt = None; // Use singleton
      const clonedOpt = opt.cloned();
      expect(clonedOpt.isNone()).toBe(true);
      expect(clonedOpt).toBe(None); // Should return the singleton itself
    });
  });

  describe("zip", () => {
    test("Some(a).zip(Some(b)) should return Some([a,b])", () => {
      const result = Some(1).zip(Some("a"));
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual([1, "a"]);
    });
    test("Some(a).zip(None) should return None singleton", () => {
      const result = Some(1).zip(None); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
    test("None.zip(Some(b)) should return None singleton", () => {
      const result = None.zip(Some("a")); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
    test("None.zip(None) should return None singleton", () => {
      const result = None.zip(None); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
  });

  describe("zipWith", () => {
    const zipFn = (n: number, s: string) => `${n}${s}`;
    test("Some(a).zipWith(Some(b), fn) should return Some(fn(a,b))", () => {
      const result = Some(1).zipWith(Some("a"), zipFn);
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe("1a");
    });
    test("Some(a).zipWith(None, fn) should return None singleton", () => {
      const result = Some(1).zipWith(None, zipFn); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
    test("None.zipWith(Some(b), fn) should return None singleton", () => {
      const result = None.zipWith(Some("a"), zipFn as any); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
    test("None.zipWith(None, fn) should return None singleton", () => {
      const result = None.zipWith(None, zipFn as any); // Use singleton
      expect(result.isNone()).toBe(true);
      expect(result).toBe(None); // Check for singleton
    });
  });

  describe("match", () => {
    const someHandler = (value: number) => `Success: ${value}`;
    const noneHandler = () => "It was None";
    test("Some(value).match({ Some: s => ..., None: () => ... }) should execute the Some handler", () => {
      const result = Some(10).match({ Some: someHandler, None: noneHandler });
      expect(result).toBe("Success: 10");
    });
    test("None.match({ Some: s => ..., None: () => ... }) should execute the None handler", () => {
      const result = None.match({ Some: someHandler as any, None: noneHandler }); // Use singleton
      expect(result).toBe("It was None");
    });
  });

  describe("Iterable Protocol", () => {
    test("Some(iterableValue) allows iteration", () => {
      const arr = [1, 2, 3];
      const opt = Some(arr);
      const result: number[] = [];
      for (const item of opt) { result.push(item); }
      expect(result).toEqual(arr);
    });
    test("None completes iteration immediately", () => {
      const opt = None; // Use singleton
      let count = 0;
      for (const _item of opt) { count++; }
      expect(count).toBe(0);
    });
  });
});
