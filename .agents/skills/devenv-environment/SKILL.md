---
name: "devenv-environment"
description: "Work with this repo's devenv dev environment: enter the shell, run or debug git-hooks, add packages/hooks to devenv.nix, and validate with devenv test. Use whenever the user mentions devenv, a pre-commit hook fails on commit, the generated .pre-commit-config.yaml, or asks to add a dev tool/package to the environment."
version: 1
created: "2026-08-12"
updated: "2026-08-12"
---

## When to Use

The user mentions devenv, git-hooks/pre-commit hooks failing (alejandra, deadnix, denofmt, denolint, deno-check), wants to add a package or hook to the dev environment, or asks how to validate the environment.

## Procedure

1. Environment files: `devenv.nix` (config), `devenv.yaml` (inputs: nixpkgs `github:cachix/devenv-nixpkgs/rolling` + git-hooks `github:cachix/git-hooks.nix`), `devenv.lock` (generated). Deno + nix LSP (nil) + git enabled.
2. Hooks live in `git-hooks.hooks` inside `devenv.nix`: alejandra, deadnix, denofmt, denolint, and a custom `deno-check` (runs `deno check src/ test/`, `files = "\\.(ts|json)$"`). All five exclude `".agents"`.
3. Validate with `devenv test` — runs `git-hooks:run` then `enterTest` (`deno task check`). A cold build can fail the first run; re-run.
4. Add a package: `packages = [ pkgs.X ];` in `devenv.nix`. For an enterShell greeting, use the absolute path form `${pkgs.lolcat}/bin/lolcat` piped from `echo` — no `packages` entry needed (matches pharoslock).
5. Add a hook: `git-hooks.hooks.<name> = { enable = true; ... };` — custom entries need `name`, `entry`, `files`, and usually `pass_filenames = false` plus `excludes`.
6. `devenv.nix` MUST be alejandra-formatted — the pre-commit hook enforces it (alejandra auto-formats on failure). Check with `alejandra --check devenv.nix` (binary under `/nix/store/*alejandra*/bin/alejandra`).
7. `.pre-commit-config.yaml` is GENERATED — never hand-edit it; change hooks in `devenv.nix` and let devenv regenerate.

## Pitfalls

- `devenv shell -c 'cmd'` does NOT work (no `-c` flag); a positional CMD also silently fails in non-TTY contexts (`bash: cannot set terminal process group`). Use `devenv test`, `prek run --all-files`, or the installed `.git/hooks/pre-commit` instead.
- The generated `.pre-commit-config.yaml` is YAML, not JSON — python `json.load` fails on it. `prek` (at `/nix/store/*prek*/bin/prek`) is the actual runner.
- On hook failure, prek stashes unstaged changes and restores them from a patch in `~/.cache/prek/patches/` — check there if the working tree looks odd.
- "no files to check" / "Skipped" in hook output = no staged/tracked files matched; not an error.
- Do not hand-edit the generated `.pre-commit-config.yaml` — edits get overwritten and lie about the real hook set.
- The repo's own `.agents/` directory is excluded from all hooks — keep it that way when adding new ones.

## Verification

1. `devenv test` exits 0 (hooks pass + `deno task check` runs).
2. A `git commit` runs all five hooks (alejandra, deadnix, deno-check, denofmt, denolint) and passes.
3. `alejandra --check devenv.nix` reports compliance.
4. `git status` clean after commit (no stray prek patch artifacts).
