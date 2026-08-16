# PROJECT.md — portfolio

<!-- Live memory for this repo. Keep under 150 lines. -->

## Goal
Pramit's portfolio site (Next.js App Router), content-driven via `content/site-content.json` — the public record of his design work.

## Non-goals
- No CMS or database; public content lives in the JSON file.
- No per-case-study route files; `app/work/[slug]/page.tsx` renders every slug in `caseStudies[]`.
- The three Swipey stories are modal content on one hub page, not separate public routes.
- PR Life application code, data services, cron, hardware, and private configuration belong to `/Users/pramitranjan/life-web`.

## Current state
2026-08-17 — The embedded PR Life application has been removed. Its standalone deployment is live at `life.pramitranjan.com`; this repo keeps only temporary old-link and API compatibility rules in `next.config.ts`. The portfolio cron is removed. The public Lab story about the product remains portfolio content.

Three Swipey internship case studies — `swipey-fields`, `swipey-admin`, `swipey-get-started` — exist as hidden `caseStudies[]` entries. They render as framed modals from `/work/swipey` (`app/work/swipey/page.tsx` → `components/SwipeyHubClient.tsx`), which is the single Swipey entry in `workPage.projects[]`.

Four prototypes are vendored under `public/proto/` (`custom-fields`, `swipey-admin`, `card-rename`, `swipey-demo`), sanitised through `scripts/sanitise-proto.mjs`, and make no external network requests.

## Decisions
- 2026-08-17 — **PR Life is a separate product boundary.** Its application source, APIs, cron, migrations, docs, firmware, and secrets live in `life-web`. The portfolio retains a public Lab story and temporary compatibility redirects/proxy only.
- 2026-08-17 — **The root favicon owns its generator.** It renders black `PR` text on an edge-to-edge signal-red background and no longer imports from another route.
- 2026-08-12 — **The root metadata template owns the `| Pramit Ranjan` title suffix.** `buildMetadata` returns the child title only; Open Graph and Twitter keep the composed full title.
- 2026-08-13 — **The homepage hero is dashboard-selectable and editable, with Portfolio Carousel active by default.** `home.heroMode` is `staged` or `portfolio-carousel`; `home.portfolioCarousel.items` owns card copy, destinations, and image presentation. `/`, `/lab/hero`, and the hero lab share the same public content. On touch screens only the centre card tracks the drag. A successful release changes card roles and springs the finger offset home in one frame; the mobile card ratio must keep its complete label, title, description, and action visible. The PR logo links to `/#selected-work`. The Lab remains a full homepage simulation below the experimental hero.
- 2026-07-24 — **Swipey prototypes are vendored static files.** Existing iframe support is reused; no new content schema or routes are needed.
- 2026-07-24 — **Swipey stories stay hidden until sign-off.** Static prototype assets are publicly addressable even when content entries are hidden.
- 2026-07-24 — **Swipey uses one umbrella hub with modal stories.** It remains one `/work` entry rather than three sibling pages.
- 2026-07-24 — **Mobile uses stills for vendored prototypes.** The desktop-scale builds are unusable in a phone iframe; absolute responsive embeds keep their iframe.

## Open threads
- Swipey sign-off is pending on interactive embeds. Until then, case studies stay hidden.
- Cover and mobile images remain placeholder PNGs; Pramit owns final captures.
- The Swipey hub hero still uses `/work/swipey-fields/cover.png` and wants its own image.
- Remove the temporary PR Life compatibility bridge after old native installations and saved browser links have aged out.

## How Pramit works
- Treat bug reports as evidence: follow the observed symptom before proposing a theory.
- Pramit owns visual acceptance. Static or browser measurements are evidence, not visual sign-off.
- Treat comma-joined feedback as separate requirements; deliver each or name what remains.
- Fix shared root causes at the component or system boundary, not at one caller.
- Prototype major homepage changes under `/lab/hero` before replacing production.
- Make implementation and architecture calls directly; ask only when proceeding would be unsafe.
- Never commit or push unless explicitly requested.
- Preserve unrelated and uncommitted work.

## Gotchas
- `lib/site-content.ts` throws on malformed content; loading the page is the practical check.
- `CaseStudyLayout` drops solution-section media blocks when `solutionEmbedUrl` is set; `useEmbedPreview` is only read by the game layout.
- `workPage.projects[]` is separate from `caseStudies[]`; a case study missing from it is unreachable from `/work`.
- Scale embedded iframes with `transform`, never `zoom`; Safari applies `zoom` to the iframe's internal viewport.
- `GsapReveal` observes window scroll, not the modal scroll container; framed stories force reveal nodes visible in `globals.css`.
- Graphify excludes `public/proto/**`; indexing vendored bundles floods the graph.

## Next action
Verify the portfolio build and old-link compatibility locally, then deploy the portfolio cutover when Pramit explicitly asks to push.

## Last session
2026-08-17 — Removed the embedded PR Life implementation and portfolio cron, migrated the remaining printer firmware to `life-web`, retained temporary compatibility routing, and made the portfolio favicon self-contained. No commit or push was performed.
