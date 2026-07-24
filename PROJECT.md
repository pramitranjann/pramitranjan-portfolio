# PROJECT.md — portfolio

<!-- Live memory for this repo. Every agent reads this first, updates it last.
     Keep under 150 lines. Replace superseded lines; don't append forever. -->

## Goal
Pramit's portfolio site (Next.js App Router), content-driven via `content/site-content.json` — the public record of his design work.

## Non-goals
- No CMS or database; all content lives in the JSON file.
- No per-case-study route files; `app/work/[slug]/page.tsx` renders every slug found in `caseStudies[]`.

## Current state
2026-07-24 — Site live. In-flight: three Swipey internship case studies (`swipey-fields`, `swipey-admin`, `side-by-side`) with live sanitised prototype embeds, per `docs/superpowers/specs/2026-07-24-swipey-case-studies-design.md`. Built on local branch `swipey-case-studies`.

## Decisions (with why)
- 2026-07-24 — Prototypes vendored as static files into `public/proto/<name>/`, embedded via the existing `solutionEmbedUrl` iframe path. Why: no new routes or schema needed.
- 2026-07-24 — All Swipey case studies ship `"hidden": true`. Why: interactive embeds need Swipey sign-off before anything is public.

## Open threads
- Swipey sign-off pending on **interactive embeds** (a bigger ask than screenshots). Until then: case studies stay hidden and the `swipey-case-studies` branch is never pushed — `public/` assets are served statically in production regardless of the `hidden` flag.
- `side-by-side` title is provisional; a rename moves the slug, image folder, and paths together.

## Gotchas
- `lib/site-content.ts` throws on malformed content — a broken JSON entry 500s the whole site. Loading the page is the test.
- `CaseStudyLayout` drops `solution`-section media blocks when `solutionEmbedUrl` is set; `useEmbedPreview` is only read by the game layout.
- `workPage.projects[]` is a separate array from `caseStudies[]` — a case study missing from it is unreachable from `/work`.

## Next action
Finish the Swipey case study set, then run the Task 11 sanitisation audit before Pramit takes the embeds to Swipey.
