# PROJECT.md — portfolio

<!-- Live memory for this repo. Every agent reads this first, updates it last.
     Keep under 150 lines. Replace superseded lines; don't append forever. -->

## Goal
Pramit's portfolio site (Next.js App Router), content-driven via `content/site-content.json` — the public record of his design work.

## Non-goals
- No CMS or database; all content lives in the JSON file.
- No per-case-study route files; `app/work/[slug]/page.tsx` renders every slug found in `caseStudies[]`.
- The three Swipey stories are deliberately **not** routes — they are modal content on one hub page.

## Current state
2026-07-24 — Site live. Built on local branch `swipey-case-studies`, never pushed.

Three Swipey internship case studies — `swipey-fields`, `swipey-admin`, `swipey-get-started` — exist as `caseStudies[]` entries, all `hidden: true`. They render as framed modals from the hub at `/work/swipey` (`app/work/swipey/page.tsx` → `components/SwipeyHubClient.tsx`), which is the single entry in `workPage.projects[]`. Spec: `docs/superpowers/specs/2026-07-24-swipey-case-studies-design.md` — read its two amendment blocks at the top, they supersede the body.

Four prototypes vendored under `public/proto/` (`custom-fields`, `swipey-admin`, `card-rename`, `swipey-demo`), ~15MB, all sanitised via `scripts/sanitise-proto.mjs`, all making zero external network requests.

## Decisions (with why)
- 2026-07-24 — Prototypes vendored as static files into `public/proto/<name>/`, embedded via the existing `solutionEmbedUrl` iframe path. Why: no new routes or schema needed.
- 2026-07-24 — All Swipey case studies ship `"hidden": true`. Why: interactive embeds need Swipey sign-off before anything is public.
- 2026-07-24 — Umbrella hub with modal stories rather than three sibling pages. Why: one Swipey entry on `/work` instead of three, and the stories read as one internship.
- 2026-07-24 — Mobile shows a still for `/proto/` embeds, keeps the iframe for absolute `http(s)` ones. Why: the vendored prototypes are desktop-scale and unusable in a phone iframe; Albers and Wander are genuinely responsive.

## Open threads
- Swipey sign-off pending on **interactive embeds** (a bigger ask than screenshots). Until then: case studies stay hidden and the `swipey-case-studies` branch is never pushed — `public/` assets are served statically in production regardless of the `hidden` flag. On sign-off: flip the three flags in one commit, then push.
- Cover and mobile images are flat placeholder PNGs. Real captures pending — Pramit does them.
- The hub hero still uses `/work/swipey-fields/cover.png`; it wants its own image.

## Gotchas
- `lib/site-content.ts` throws on malformed content — a broken JSON entry 500s the whole site. Loading the page is the test.
- `CaseStudyLayout` drops `solution`-section media blocks when `solutionEmbedUrl` is set; `useEmbedPreview` is only read by the game layout.
- `workPage.projects[]` is a separate array from `caseStudies[]` — a case study missing from it is unreachable from `/work`.
- **Scale embedded iframes with `transform`, never `zoom`.** Safari applies `zoom` to an iframe's internal viewport as well as its box, so a zoomed 1440px iframe lays out at ~1000px and the prototype wraps and clips itself. Cost several rounds to find because Chromium doesn't do this.
- `GsapReveal` drives off window `ScrollTrigger`, which never fires inside the modal's own scroll container — `.swipey-frame [data-reveal]` is forced visible in `globals.css` or every section below the fold sits at `opacity: 0`.
- `graphify` excludes `public/proto/**`; without it the vendored minified bundles flood the index (40k nodes) and queries return `pdf.worker.min.mjs` internals.

## Next action
Pramit reviews the three case studies, then captures real images. Sanitisation audit is clean and the copy has had its house-voice pass; the remaining gate is Swipey's sign-off.
