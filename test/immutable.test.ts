import { assertType, type IsExact } from "@std/testing/types";
import { describe, test } from "@std/testing/bdd";
import type { Immutable, Mutable } from "../src/immutable/index.ts";

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

describe("Mutable", () => {
  test("primitive types pass through unchanged", () => {
    const str: Mutable<string> = "foo";
    const num: Mutable<number> = 2;
    const _bool: Mutable<boolean> = true;

    assertType<IsExact<typeof str, string>>(true);
    assertType<IsExact<typeof num, number>>(true);
    assertType<IsExact<Mutable<boolean>, boolean>>(true);
  });

  test("functions pass through unchanged", () => {
    const fn: Mutable<() => void> = () => console.log("called");
    assertType<IsExact<typeof fn, () => void>>(true);
  });

  test("ReadonlyArray becomes mutable Array", () => {
    const numbers: Mutable<readonly number[]> = [1, 2, 3, 4, 5];
    assertType<IsExact<typeof numbers, number[]>>(true);

    numbers[0] = 0; // should compile
    numbers.push(6); // should compile
  });

  test("nested ReadonlyArray becomes deeply mutable", () => {
    const matrix: Mutable<readonly (readonly number[])[]> = [
      [1, 2],
      [3, 4],
    ];
    assertType<IsExact<typeof matrix, number[][]>>(true);

    matrix[0] = [0, 1]; // should compile
    matrix[0][0] = 0; // should compile
  });

  test("object properties become mutable", () => {
    type FrozenUser = Immutable<{ id: number; profile: { name: string } }>;

    const user: Mutable<FrozenUser> = {
      id: 0,
      profile: { name: "foo" },
    };

    assertType<IsExact<typeof user, { id: number; profile: { name: string } }>>(
      true,
    );

    user.id = 1; // should compile
    user.profile.name = "bar"; // should compile
  });

  test("ReadonlyMap becomes mutable Map", () => {
    const map: Mutable<ReadonlyMap<string, number>> = new Map([
      ["a", 1],
      ["b", 2],
    ]);

    assertType<IsExact<typeof map, Map<string, number>>>(true);

    map.set("c", 3); // should compile
    map.delete("a"); // should compile
    map.clear(); // should compile
  });

  test("nested Map has mutable key/value types", () => {
    type FrozenUser = Immutable<{ name: string }>;
    const map: Mutable<ReadonlyMap<FrozenUser, FrozenUser[]>> = new Map();

    assertType<IsExact<typeof map, Map<{ name: string }, { name: string }[]>>>(
      true,
    );
  });

  test("ReadonlySet becomes mutable Set", () => {
    const set: Mutable<ReadonlySet<string>> = new Set(["a", "b", "c"]);

    assertType<IsExact<typeof set, Set<string>>>(true);

    set.add("d"); // should compile
    set.delete("a"); // should compile
    set.clear(); // should compile
  });

  test("nested Set has mutable element type", () => {
    type FrozenUser = Immutable<{ name: string }>;
    const set: Mutable<ReadonlySet<FrozenUser>> = new Set();

    assertType<IsExact<typeof set, Set<{ name: string }>>>(true);
  });

  test("Date passes through unchanged", () => {
    const date: Mutable<Date> = new Date();
    assertType<IsExact<typeof date, Date>>(true);
  });

  test("RegExp passes through unchanged", () => {
    const re: Mutable<RegExp> = /foo/;
    assertType<IsExact<typeof re, RegExp>>(true);
  });

  test("Promise passes through unchanged", () => {
    const p: Mutable<Promise<string>> = Promise.resolve("ok");
    assertType<IsExact<typeof p, Promise<string>>>(true);
  });

  test("WeakMap passes through unchanged", () => {
    const wm: Mutable<WeakMap<object, string>> = new WeakMap();
    assertType<IsExact<typeof wm, WeakMap<object, string>>>(true);
  });

  test("WeakSet passes through unchanged", () => {
    const ws: Mutable<WeakSet<object>> = new WeakSet();
    assertType<IsExact<typeof ws, WeakSet<object>>>(true);
  });

  test("Mutable is inverse of Immutable", () => {
    type Original = {
      name: string;
      tags: string[];
      metadata: {
        count: number;
        items: string[];
      };
    };

    type Frozen = Immutable<Original>;
    type Unfrozen = Mutable<Frozen>;

    assertType<IsExact<Unfrozen, Original>>(true);
  });

  test("Mutable handles readonly modifier from Immutable", () => {
    type Frozen = Immutable<{ x: number; y: string }>;
    type MutableVersion = Mutable<Frozen>;

    assertType<IsExact<MutableVersion, { x: number; y: string }>>(true);
  });

  test("Mutable is idempotent", () => {
    type Original = {
      name: string;
      tags: string[];
    };

    type Once = Mutable<Original>;
    type Twice = Mutable<Once>;

    assertType<IsExact<Once, Original>>(true);
    assertType<IsExact<Twice, Original>>(true);
  });

  test("Mutable on already mutable type is no-op", () => {
    type MutableUser = {
      name: string;
      tags: string[];
      metadata: { count: number };
    };

    type Result = Mutable<MutableUser>;
    assertType<IsExact<Result, MutableUser>>(true);
  });

  test("tuple becomes mutable array (tuple structure not preserved)", () => {
    type FrozenTuple = Immutable<[string, number, boolean]>;
    // Immutable converts tuples to ReadonlyArray, so Mutable returns a plain array
    const tuple: Mutable<FrozenTuple> = ["hello", 42, true];

    assertType<IsExact<typeof tuple, (string | number | boolean)[]>>(true);

    tuple[0] = "world"; // should compile
    tuple[1] = 100; // should compile
    tuple[2] = false; // should compile
    tuple.push("extra"); // should compile (no longer a tuple)
  });

  test("complex nested structure with all collection types", () => {
    type Frozen = Immutable<{
      users: Map<string, { name: string; tags: Set<number> }[]>;
      config: {
        features: readonly string[];
        metadata: ReadonlyMap<string, ReadonlySet<number>>;
      };
    }>;

    type MutableVersion = Mutable<Frozen>;

    assertType<
      IsExact<
        MutableVersion,
        {
          users: Map<string, { name: string; tags: Set<number> }[]>;
          config: {
            features: string[];
            metadata: Map<string, Set<number>>;
          };
        }
      >
    >(true);
  });

  test("union types with Mutable", () => {
    type Frozen = Immutable<string | number | { value: string }>;
    type Result = Mutable<Frozen>;

    assertType<IsExact<Result, string | number | { value: string }>>(true);
  });

  test("class instances pass through unchanged", () => {
    class User {
      constructor(public name: string) {}
    }

    const user: Mutable<User> = new User("Alice");
    assertType<IsExact<typeof user, User>>(true);
  });
});
