---
name: "self-improve"
description: "Keep this repo's documentation in sync with the code and capture reusable patterns from each working session. Trigger whenever the user asks to update documentation, improve docs, run self-improve, 'learn from this session', sync or create README.md / AGENTS.md, fix or add JSDoc, or save a working pattern as a skill. Also trigger proactively at the end of any session that produced meaningful changes (API additions, refactors, migrations, convention shifts, user corrections) and when existing docs or skills reference stale tooling (e.g. 'bun' or 'jsr.json' after the Deno migration). Do NOT wait for the user to spell out 'self-improve' — if docs are out of date with the code you just changed, this skill applies."
version: 3
created: "2026-08-12"
updated: "2026-08-12"
---

## What This Skill Does

After a working session, reconcile the repo's four documentation surfaces with
what the code actually became, and capture what the session taught:

1. **README.md** — reflect new/changed public API and commands.
2. **AGENTS.md** — keep agent onboarding (commands, layout, conventions) truthful.
3. **JSDoc** — fix/add docs on symbols the session touched.
4. **Skills** (`.agents/skills/<name>/SKILL.md`) — extract reusable procedures
   from the session; create new skills or update stale ones.

The goal is not more documentation — it's *truthful* documentation. A doc that
lies about the code (stale commands, removed exports, outdated conventions)
costs every future session more than missing docs do. Every edit here should
either fix a lie or record a real, reusable lesson.

## When to Run

- User says: "update the docs", "run self-improve", "learn from this session",
  "sync README/AGENTS", "fix the JSDoc", "save this as a skill".
- End of a session with meaningful change: API additions/renames, refactors,
  runtime migrations, convention shifts, user corrections, new tooling.
  Offer to run it rather than silently doing a full pass; a light session
  (one typo fix) does not need it.

## Workflow

### 0. Reconstruct the session first

Before touching anything, establish what changed:

- `git status` + `git log --oneline` since the last meaningful commit; diff the
  changed files (`git diff` / `git show`).
- Identify: new/changed public API, renamed semantics, changed commands or
  tooling, new patterns, and any user corrections or explicit decisions made
  during the session.
- Read the current state of README.md, AGENTS.md (if it exists), and the
  `.agents/skills/` directory so edits match existing style.
- Gather learnings = decisions + corrections + conventions + tool quirks.
  These are the raw material for duties 2 and 4.

Then apply each duty only where the session actually touched that surface.
Do not sweep the whole repo.

### 1. Update README.md

- Match the existing section structure (badges → Why rustify? → Installation →
  Basic Usage → Core Concepts → API Overview with `### Result<T, E>` /
  `### Option<T>` / `### match` → Examples → Development → Contributing →
  License → Links). Never reorder sections or rewrite prose that is still true.
- Update when: public API changed (new exports, renamed methods, changed
  semantics), install/usage instructions changed (package manager switches,
  import paths), commands in the Development section changed, or an example no
  longer matches test behavior.
- Keep every code example runnable and consistent with the tests — a broken
  README example is a lie in the most visible place.
- Update badge or install links only if the publish targets actually changed.

### 2. Update AGENTS.md

- Create it from `references/agents-template.md` if missing, trimmed to the
  repo's actual state.
- Update when the session changed: commands, repo layout, conventions, or
  release process. This file is the single onboarding source for future
  agents — stale commands here actively mislead.
- If the session established a *new* convention (naming, error handling,
  testing style, module layout), record it here AND consider whether it
  deserves its own skill (duty 4).
- Keep it short: commands, layout, conventions, pointers. One screen or less
  if possible. Details live in skills.

### 3. Update JSDoc

- Only symbols the session touched (files in the diff). Never churn unrelated
  files — doc noise on untouched code is worse than no change.
- Follow this repo's conventions (see `.agents/skills/monad-module-conventions`
  and `references/agents-template.md`): full docs on the public interface;
  `@internal` on internal classes/interfaces; `@param`/`@returns`/`@throws`/
  `@example` on user-facing methods; `{@link}` cross-references; `@template`
  for generics; `@inheritDoc` on implementation methods; `@module` on
  entrypoints (`src/index.ts`, `src/<mod>/index.ts`).
- Fix JSDoc that is now *wrong* (changed behavior, renamed params) before
  adding new blocks.
- Full-coverage sweeps are a separate concern — that is the `jsr-doc-coverage`
  skill's job, not this one.

### 4. Create or update skills (`.agents/skills/<name>/SKILL.md`)

The skill surface for this repo lives in `.agents/skills/`, versioned in git.

- **Create** a skill when the session revealed a repeatable procedure:
  a multi-step workflow (release, migration, adding a method), a convention
  worth enforcing, or a non-obvious pattern that cost real effort to discover.
  If the session's procedure would have saved you an hour at the start, write
  it down. Do NOT create skills for one-off tasks.
- **Update** existing skills when they drift from reality. Example: after the
  Bun→Deno migration, `monad-module-conventions` still said `bun run check`,
  `require()` lazy imports, and `jsr.json` — all false. When you see a stale
  reference in any skill, fix it.
- All project skills live in this directory — there is no second copy to
  reconcile elsewhere (the Pi projects-memory copies were moved here).
- Skill format — follow the existing frontmatter shape:

```markdown
---
name: "skill-name"
description: "When to trigger + what it does. Include concrete trigger phrases;
make it slightly pushy — under-triggering is the failure mode."
version: 1
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---

## When to Use
## Procedure
## Pitfalls
## Verification
```

  Bump `version` and set `updated` whenever you edit an existing skill.
  Procedure steps are ordered; pitfalls are concrete failure modes; verification
  lists the exact commands that prove the skill worked.

- Prefer one skill per concern. If a new skill overlaps an existing one, extend
  the existing one instead of adding a near-duplicate.

## Establishing Patterns

"Establish existing patterns" means codifying how this repo works so future
sessions follow it without rediscovery. The canonical pattern list lives in
AGENTS.md (Conventions section) and the monad-module-conventions skill.
When the session changed a pattern, update both. Current baseline:

- Module layout `src/<mod>/`: `types.ts` (internal interfaces), one file per
  variant (`some.ts`/`none.ts`, `ok.ts`/`err.ts`), public module file,
  `index.ts` (module doc + `export *` barrel re-exports only — named re-exports break JSR doc coverage, see monad-module-conventions).
- Strategy pattern for mutating types (Option); plain immutable variants for
  Result. No impl wrapper without a mutating-methods reason.
- Public interface + namespace-merged statics + factory functions + variant
  type aliases.
- No `as any` anywhere in `src/`.
- All relative imports use explicit `.ts` extensions.
- Tests: `test/<mod>.test.ts`, `describe`/`test` from `@std/testing/bdd`,
  `expect` from `@std/expect`, `spy`/`assertSpyCalls`/`assertSpyCall` from
  `@std/testing/mock` (NOT `@std/expect` mock matchers — they are incompatible
  with std spies).
- Commands: `deno task check`, `deno test`, `deno fmt --check`, `deno lint`,
  `deno publish --dry-run`.

## Verification

Before declaring done:

1. `deno fmt --check`, `deno lint`, `deno task check`, `deno test` — all green
   (docs can break type-checking via imports/examples).
2. `git diff` reviewed — only intended doc changes, no unrelated churn.
3. No stale tooling references in what you touched: grep for `bun`, `jsr.json`,
   `require(` (CJS) in README.md, AGENTS.md, and `.agents/skills/`; fix hits
   that describe the current toolchain.
4. Every skill file you created or edited has valid frontmatter (name,
   description, version, created/updated) and the four standard sections.
5. README examples still match test behavior.

## Pitfalls

- **Don't rewrite what's still true.** Touch only the surfaces the session
  changed. A full README rewrite on every session is noise and erodes trust.
- **Stale references poison docs.** A README that says `bun test` after the
  Deno migration is actively harmful — it is the first thing a new agent tries.
  When you see stale tooling anywhere in docs or skills, fix it.
- **Don't edit CHANGELOG.md here.** Release notes/changelog are the
  release-workflow skill's job. This skill owns README, AGENTS, JSDoc, and
  skills only.
- **JSDoc churn on untouched files is vandalism.** Scope to the diff.
- **Don't create a skill for a one-off.** The bar is repeatability.
- **AGENTS.md must describe reality.** Never document a command you have not
  run this session; verify it first.
- **Keep frontmatter honest.** Bump `updated` (and `version` on behavior
  changes) on every skill you edit — a skill with a stale date reads as
  current when it isn't.
