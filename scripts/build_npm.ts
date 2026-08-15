import { build, emptyDir } from "@deno/dnt";
import * as esbuild from "esbuild";

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

// ─── Bundle ESM entries (webpack/Next.js SSR compat) ────────────────────────
//
// dnt emits each ESM entry as an `export * from "./x.js"` re-export shim. That
// star-re-export chain of namespace-merge objects (e.g. `Option`, `Result`)
// trips up webpack's SSR/RSC ESM interop — it produces a non-callable module
// (`__webpack_modules__[moduleId] is not a function`), forcing Next.js
// consumers to add `transpilePackages`. Bundling each entry down to a single
// self-contained file with one explicit `export { ... }` removes the chain and
// the workaround. CJS is left as dnt emitted it — `__createBinding` re-exports
// are webpack-safe.
const esmBundles = [
  "npm/esm/index.js",
  "npm/esm/option/index.js",
  "npm/esm/result/index.js",
  "npm/esm/match/index.js",
];
for (const entry of esmBundles) {
  const tmp = `${entry}.bundled.js`;
  await esbuild.build({
    entryPoints: [entry],
    outfile: tmp,
    bundle: true,
    format: "esm",
    platform: "neutral",
    logLevel: "warning",
  });
  await Deno.rename(tmp, entry);
}
await esbuild.stop();

// ─── Drop dead ESM per-file modules ─────────────────────────────────────────
//
// The bundled ESM entries (`esm/{index,option,result,match}/index.js`) are
// self-contained — they inline every module, so the per-file `.js` modules
// dnt also emitted (`esm/option/option.js`, `esm/match/match.js`, etc.) are
// unreferenced. Removing them shrinks the npm tarball. Their `.d.ts` siblings
// stay: the entry `.d.ts` files re-export from them for types. `esm/utils.js`
// is imported by the bundled code, so it's kept.
const liveEsmJs = new Set([
  "npm/esm/index.js",
  "npm/esm/utils.js",
  "npm/esm/option/index.js",
  "npm/esm/result/index.js",
  "npm/esm/match/index.js",
]);
for await (const dirEntry of Deno.readDir("npm/esm")) {
  if (!dirEntry.isDirectory) continue;
  for await (const file of Deno.readDir(`npm/esm/${dirEntry.name}`)) {
    if (!file.isFile || !file.name.endsWith(".js")) continue;
    const p = `npm/esm/${dirEntry.name}/${file.name}`;
    if (file.name !== "index.js" && !liveEsmJs.has(p)) {
      await Deno.remove(p);
    }
  }
}
