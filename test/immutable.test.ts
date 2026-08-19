import { assertType, type IsExact } from "@std/testing/types";
import { describe, test } from "@std/testing/bdd";
import type { Immutable } from "../src/immutable/index.ts";

describe("Immutable", () => {
  test("primitive types pass through unchanged", () => {
    const str: Immutable<string> = "foo";
    const num: Immutable<number> = 2;
    const _bool: Immutable<boolean> = true;

    const sym: Immutable<symbol> = Symbol("foo");

    assertType<IsExact<typeof str, string>>(true);
    assertType<IsExact<typeof num, number>>(true);
    assertType<IsExact<Immutable<boolean>, boolean>>(true);
    assertType<IsExact<typeof sym, symbol>>(true);
  });

  test("functions pass through unchanged", () => {
    const fn: Immutable<() => void> = () => console.log("called");
    assertType<IsExact<typeof fn, () => void>>(true);
  });

  test("array becomes ReadonlyArray", () => {
    const numbers: Immutable<number[]> = [1, 2, 3, 4, 5];
    assertType<IsExact<typeof numbers, readonly number[]>>(true);

    // @ts-expect-error — cannot assign to readonly array element
    numbers[0] = 0;
  });

  test("nested array becomes deeply readonly", () => {
    const matrix: Immutable<number[][]> = [
      [1, 2],
      [3, 4],
    ];
    assertType<IsExact<typeof matrix, readonly (readonly number[])[]>>(true);

    // @ts-expect-error — cannot reassign outer array element
    matrix[0] = [0, 1];
    // @ts-expect-error — cannot assign to deeply nested element
    matrix[0][0] = 0;
  });

  test("object properties become readonly", () => {
    type User = { id: number; profile: { name: string } };

    const user: Immutable<User> = {
      id: 0,
      profile: { name: "foo" },
    };

    assertType<
      IsExact<
        typeof user,
        { readonly id: number; readonly profile: { readonly name: string } }
      >
    >(true);

    // @ts-expect-error — cannot assign to readonly property
    user.id = 1;
    // @ts-expect-error — cannot assign to nested readonly property
    user.profile.name = "bar";
  });

  test("array of objects becomes readonly with readonly elements", () => {
    type User = { id: number; profile: { name: string } };

    const users: Immutable<User[]> = [
      { id: 0, profile: { name: "foo" } },
      { id: 1, profile: { name: "bar" } },
    ];

    assertType<
      IsExact<
        typeof users,
        readonly {
          readonly id: number;
          readonly profile: { readonly name: string };
        }[]
      >
    >(true);

    // @ts-expect-error — cannot reassign array element
    users[1] = { id: 2, profile: { name: "pepe" } };
    // @ts-expect-error — cannot assign to nested readonly property
    users[1].id = 3;
  });

  test("Map becomes ReadonlyMap", () => {
    const map: Immutable<Map<string, number>> = new Map([
      ["a", 1],
      ["b", 2],
    ]);

    assertType<IsExact<typeof map, ReadonlyMap<string, number>>>(true);

    // @ts-expect-error — cannot call mutating methods on ReadonlyMap
    map.set("c", 3);
    // @ts-expect-error — cannot call mutating methods on ReadonlyMap
    map.delete("a");
    // @ts-expect-error — cannot call mutating methods on ReadonlyMap
    map.clear();
  });

  test("nested Map has immutable key/value types", () => {
    type User = { name: string };
    const map: Immutable<Map<User, User[]>> = new Map();

    assertType<
      IsExact<
        typeof map,
        ReadonlyMap<
          { readonly name: string },
          readonly { readonly name: string }[]
        >
      >
    >(true);
  });

  test("Set becomes ReadonlySet", () => {
    const set: Immutable<Set<string>> = new Set(["a", "b", "c"]);

    assertType<IsExact<typeof set, ReadonlySet<string>>>(true);

    // @ts-expect-error — cannot call mutating methods on ReadonlySet
    set.add("d");
    // @ts-expect-error — cannot call mutating methods on ReadonlySet
    set.delete("a");
    // @ts-expect-error — cannot call mutating methods on ReadonlySet
    set.clear();
  });

  test("nested Set has immutable element type", () => {
    type User = { name: string };
    const set: Immutable<Set<User>> = new Set();

    assertType<
      IsExact<typeof set, ReadonlySet<{ readonly name: string }>>
    >(true);
  });

  test("Date passes through unchanged", () => {
    const date: Immutable<Date> = new Date();
    assertType<IsExact<typeof date, Date>>(true);
  });

  test("RegExp passes through unchanged", () => {
    const re: Immutable<RegExp> = /foo/;
    assertType<IsExact<typeof re, RegExp>>(true);
  });

  test("Promise passes through unchanged", () => {
    const p: Immutable<Promise<string>> = Promise.resolve("ok");
    assertType<IsExact<typeof p, Promise<string>>>(true);
  });

  test("WeakMap passes through unchanged", () => {
    const wm: Immutable<WeakMap<object, string>> = new WeakMap();
    assertType<IsExact<typeof wm, WeakMap<object, string>>>(true);
  });

  test("WeakSet passes through unchanged", () => {
    const ws: Immutable<WeakSet<object>> = new WeakSet();
    assertType<IsExact<typeof ws, WeakSet<object>>>(true);
  });

  test("ReadonlyArray passes through unchanged", () => {
    const arr: Immutable<readonly number[]> = [1, 2, 3];
    assertType<IsExact<typeof arr, readonly number[]>>(true);
  });

  test("ReadonlyMap passes through unchanged", () => {
    const map: Immutable<ReadonlyMap<string, number>> = new Map([
      ["a", 1],
    ]);
    assertType<IsExact<typeof map, ReadonlyMap<string, number>>>(true);
  });

  test("ReadonlySet passes through unchanged", () => {
    const set: Immutable<ReadonlySet<string>> = new Set(["a"]);
    assertType<IsExact<typeof set, ReadonlySet<string>>>(true);
  });
});
