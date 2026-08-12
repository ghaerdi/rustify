---
name: "release-workflow"
description: "Release a new version of this repo (rustify): semver bump, CHANGELOG entry covering ALL commits since the last tag, verification, git tag, and a DRAFT GitHub release. Use whenever the user says \"bump the version\", \"create a tag\", \"draft a release\", \"prepare a release\", or asks about release notes/CHANGELOG for a new version."
version: 10
created: "2026-08-10"
updated: "2026-08-12"
---

## When to Use
Trigger when the user asks to bump the version, create a tag, draft/prepare a release, write release notes, or update the CHANGELOG for a new version of this package. Also when about to publish to npm or JSR and a tag/release is needed first.

## Procedure
1. Write release notes to .release-notes.md from the CHANGELOG entry with the CONSISTENT v2.1.x format + EMOJI section headers: `awk '/^## v<version>$/,/^## v<previous>$/' CHANGELOG.md | sed '$d' | sed '1s/^## v<version>$/# Release Notes - v<version>/; s/^### New Features$/## ✨ New Features/; s/^### Improvements$/## 🚀 Improvements/; s/^### Documentation$/## 📚 Documentation/; s/^### Tests$/## ✅ Tests/; s/^### Refactoring$/## 🔧 Refactoring/; s/^### /## /'`, then: gh release create v<version> --title "v<version>" --notes-file .release-notes.md --draft. Then rm .release-notes.md. NEVER mirror the raw CHANGELOG — the notes must start with `# Release Notes - v<version>` and use emoji `##` section headers (the CHANGELOG itself stays plain).
2. Rewrite the generated base as a hand-written NARRATIVE per the release-notes skill (.agents/skills/release-notes): fixed section order with 🔄 Upgrade Guide LAST, no 'previously' references, minimal Upgrade Guide with npm install snippet, honest-but-practical Breaking Changes. Subsequent edits to the draft go through `gh release view <ver> --json body -q .body > .release-notes.md` + `gh release edit <ver> --notes-file .release-notes.md` — do NOT regenerate from the CHANGELOG after the initial draft.

## Pitfalls
- The CHANGELOG entry MUST cover ALL commits since the last tag — run `git log --oneline <last-tag>..HEAD` and inspect each commit's diff (git show --stat) to describe it accurately. The user explicitly corrected this once: a 2.1.2 entry that only mentioned the most recent commit was wrong.
- Keep package.json and deno.json versions in sync — bump both (jsr.json no longer exists; its `name`/`exports` moved into deno.json).
- Check push state before tagging: `git rev-list --left-right --count origin/main...HEAD` must be '0 0'. Fetch first.
- Never mark the release as latest or publish it unless explicitly asked — always `--draft`.
- Release notes format must match the v2.1.x convention: `# Release Notes - vX.Y.Z` header, `##` section headers (promote `###` from the CHANGELOG) with EMOJI headers (✨ New Features, 🚀 Improvements, 📚 Documentation, ✅ Tests, 🔧 Refactoring) — the CHANGELOG stays plain, emojis are added by the sed transform at release time only. Older releases (v1.x with `### ✨ New Features` + `*` bullets, v2.0.0 with emoji headers) are historical — do not backport their style, and do not change published release notes without being asked.
- The user may commit/push themselves between steps; re-check git status before tagging instead of assuming.
- When folding an unpublished version's CHANGELOG section into the current one, merge duplicate section headers (e.g. two `### Improvements`) into one — both the CHANGELOG and the regenerated release notes must have exactly one of each section.
- Delete the temporary .release-notes.md file after creating the release.
- Verify with `gh release list` after creating: the new version should show as Draft, and the previous version should still be marked Latest.
- For moving an existing tag to a new commit (e.g. when a release draft keeps getting updates): `gh api -X PATCH repos/ghaerdi/rustify/git/refs/tags/v2.2.0 -F sha=<FULL 40-char SHA from git rev-parse HEAD> -F force=true` — short SHAs get HTTP 422.
- When auditing several releases for consistency, fetch release bodies with `gh release view --json name,body -q` — a for-loop piping releases into awk + node reading stdin broke on env injection.

## Verification
1. package.json and deno.json both show the new version.
2. CHANGELOG.md has an entry covering every commit in `git log <last-tag>..HEAD`.
3. deno task check and deno test pass; deno publish --dry-run succeeds.
4. git tag v<version> exists on origin (git ls-remote --tags origin | grep v<version>).
5. gh release list shows v<version> as Draft, and the previous release is still Latest.
