---
name: "release-notes"
description: "Write and maintain GitHub release notes for this repo (rustify) with a consistent, hand-written format: `# Release Notes - vX.Y.Z` header, emoji ## section headers in a fixed order, and a narrative tone that is NOT a raw CHANGELOG mirror. Use whenever the user asks to write, rewrite, edit, reorder, or audit release notes, add/remove sections (breaking changes, upgrade guide, code examples), or fix release-note wording/consistency. Also trigger when editing an existing draft release body via gh release edit."
version: 1
created: "2026-08-12"
updated: "2026-08-12"
---
## When to Use
The user asks to write the release notes for a new version, rewrite/edit the notes of an existing draft release, add a section (e.g. ⚠️ Breaking Changes, 🔄 Upgrade Guide, a code example), reorder sections, trim wording (e.g. removing 'previously' references), or audit release notes for consistency across versions. Also whenever editing a draft body through gh release edit rather than regenerating from the CHANGELOG.

## Procedure
1. Format: start every notes file with `# Release Notes - vX.Y.Z` (header) then emoji `##` section headers. Never mirror the raw CHANGELOG — the CHANGELOG stays plain (no emojis, `###` headers, Breaking Changes at top of the entry); emojis and ordering exist only in the release notes.
2. Use the FIXED section order: ✨ New Features → 🚀 Improvements → 📚 Documentation → ✅ Tests → ⚠️ Breaking Changes → 🔄 Upgrade Guide (the Upgrade Guide is ALWAYS the last section; Breaking Changes sits immediately before it).
3. Section content conventions: ✨ New Features = features plus a short code example for the flagship feature (match() example with real imports from @ghaerdi/rustify/match and @ghaerdi/rustify). 🚀 Improvements = API/parity/perf improvements (e.g. Rust std parity methods, type guards). 📚 Documentation = docs work. ✅ Tests = test count + what's covered. ⚠️ Breaking Changes = honest but practical: state the change, what keeps working, who is actually affected (e.g. interface→union type changes break implementers/extenders but not value users — say that). 🔄 Upgrade Guide = starts with an `npm install @ghaerdi/rustify@<version>` code block, then a minimal body: 'no migration needed for regular usage' + a pointer to the only affected surface. Do NOT list methods the user doesn't need to call.
4. Wording rules: never reference a 'previously' behavior (users on the latest release have no before); match examples to the real API surface exactly (method names, `__tag`-style discriminants, exact NeverCase error strings like `{ __tag: none }`).
5. For a brand-new version's notes: generate a base from the CHANGELOG with the sed transform in the release-workflow skill step 7, then rewrite it as a narrative per these conventions (intro prose, trimmed Upgrade Guide, npm install snippet).
6. For editing an existing draft: fetch the body with `gh release view <ver> --json body -q .body > .release-notes.md`, edit the file, apply with `gh release edit <ver> --notes-file .release-notes.md`, then rm .release-notes.md.
7. Notes are hand-written: after a repo commit, do NOT regenerate the notes from the CHANGELOG (that clobbers the narrative). Only edit when the user asks.
8. If a repo commit lands while the draft exists, move the tag with `gh api -X PATCH repos/ghaerdi/rustify/git/refs/tags/<ver> -F sha=<FULL 40-char SHA from git rev-parse HEAD> -F force=true`, and sync the local ref with `git tag -f <ver> $(git rev-parse HEAD)` (gh api PATCH only moves the remote ref).

## Pitfalls
- Section reordering with python regex fails on emoji-encoded text — use sed/awk line-range extraction instead (fetch body, cut each section's line range, reassemble in the target order).
- gh api PATCH moves the REMOTE tag only — the local tag ref goes stale; sync with `git tag -f` after every tag move.
- Backticks inside sed replacement strings break bash — for template-literal renames use a python heredoc.
- Do not backport older release styles (v1.x `### ✨` + `*` bullets, v2.0.0 `## 🎉` headers) — historical releases stay as-is.
- Never mark the release as latest or publish unless explicitly asked — drafts stay drafts.
- Keep the Upgrade Guide minimal — the user explicitly corrected a version that listed methods nobody needs to call.
- When the user asks for a change to the draft notes, do NOT regenerate from the CHANGELOG unless asked — apply the edit to the hand-written body only.

## Verification
1. The notes file starts with `# Release Notes - vX.Y.Z` and uses emoji ## section headers.
2. Sections appear in the fixed order with 🔄 Upgrade Guide LAST.
3. No 'previously' references remain in the body.
4. The ⚠️ Breaking Changes section names the affected surface and what keeps working.
5. The 🔄 Upgrade Guide starts with the npm install snippet and stays minimal.
6. gh release view <ver> --json body shows the updated body; the version is still a Draft and the previous release is still Latest.