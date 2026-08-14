import { build, emptyDir } from "@deno/dnt";

// Single source of truth for the version is package.json.
async function loadVersion(): Promise<string> {
  try {
    return JSON.parse(await Deno.readTextFile("./package.json")).version;
  } catch (err) {
    throw new Error(
      `Failed to read "version" from ./package.json: ${(err as Error).message}`,
    );
  }
}

await emptyDir("./npm");

await build({
  entryPoints: [
    "./src/index.ts",
    { name: "./option", path: "./src/option/index.ts" },
    { name: "./result", path: "./src/result/index.ts" },
    { name: "./match", path: "./src/match/index.ts" },
  ],
  outDir: "./npm",
  // The library uses no Deno namespace or non-standard globals: only
  // `structuredClone`, which is a standard JS global in Deno, Node and
  // browsers. No shims required.
  shims: {},
  // Tests use @std/testing and the Deno test runner directly (deno test), so
  // we skip dnt's Node-based test run. Source type-check is still enforced.
  test: false,
  // The library uses `structuredClone` and `console` (DOM globals) and dnt's
  // default lib omits them. Bump the libs so type-check passes.
  compilerOptions: {
    lib: ["ESNext", "DOM"],
  },
  // typeCheck "both" verifies the ESM and CJS/UMD outputs type-check.
  typeCheck: "both",
  package: {
    name: "@ghaerdi/rustify",
    version: await loadVersion(),
    description:
      "A TypeScript monad library inspired by Rust, providing Result and Option types for safe error handling and null management.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/ghaerdi/rustify.git",
    },
    bugs: {
      url: "https://github.com/ghaerdi/rustify/issues",
    },
    keywords: [
      "typescript",
      "rust",
      "monad",
      "option",
      "result",
      "error handling",
      "functional programming",
      "type-safe",
      "null safety",
      "maybe",
    ],
    author: "ghaerdi",
    engines: {
      node: ">=18",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
