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
2026-08-19 — `/lab/about` and `/lab/play` extend the `/lab/hero` prototyping pattern. Each is now down to one concept, both faithful translations rather than invented ideas: About is `centered-statement` (ref: joeparkerrees.co.uk/info — big serif statement, "Right now" caption, Experience clamped to 2 lines, Activities collapsed to one line) and Play is `unified wall` (one uniform 4-column grid, no chaptered sections, medium carried by a small tag). `/lab/work` is the real `/work` with hero variants (compact / full / none); compact and the Play wall's minimal head are now verified identical — same 165px band, 56/24 padding, eyebrow position, `--text-h1` title, and both titles enter through `GsapReveal`. Pramit's signed-off numbers are the lab defaults, and each CSS fallback matches its slider's initial so the pre-hydration paint is not a different design. All three labs share `components/LabTweak.tsx` — a floating panel whose toggles write `data-*` on `<html>` and whose sliders write CSS vars on `:root`, so every knob is a CSS switch. Pramit tweaks live in the browser and hits COPY to hand back the settings; adding a knob needs no React change. About's type sits on the `--text-*` tokens rather than hand-rolled pixels; its "Right now" block auto-rotates through every `nowCards` entry (same data as production) and the portrait is a centred carousel of same-size slots — fill `PORTRAIT_IMAGES` in `AboutDesignLab.tsx` when real photos exist. Both carousels stack slides in one grid cell so rotation never resizes the frame, both stop under `prefers-reduced-motion`, and their dots are real buttons. The current track is a fourth card in that rotation, built from `/api/spotify` in the lab rather than by mounting `SpotifyWidget` — the widget's bordered cell reads as foreign beside plain text slides, and appending only once the fetch resolves avoids a blank beat. The Play wall's medium label moved off the tile and into the card's own meta line (the `tag` slot `CreativeListingCard` already had), so photography reads `PHOTOGRAPHY` beside case studies' existing `MIXED MEDIA · 2024`; `PhotographyCity.type` is new and seeded without years. About still uses a `PORTRAIT` placeholder box — no personal photo asset exists in the repo.

2026-08-19 — The lab designs are ported into production. `/about` is the centered-statement page (`components/AboutPageClient.tsx`): 800px column, 45px statement, a Right-now block that rotates every `nowCards` entry plus the live Spotify track, a centered portrait carousel, then Experience, Education, Activities, Tools and a contact block. `/play` is one wall (`.play-wall`) instead of three chaptered sections, with medium carried by each card's own meta line. `/work` uses `PageHero variant="compact"`. The homepage's Selected Work head is eyebrow + white serif title + body, and `ProjectCard`'s supporting variant now shows a clamped description with the CTA pinned to the card's bottom edge and tags hard right. The film strip derives from `photography.cities`.

The labs stay as local-only prototypes: `/app/lab/` is gitignored and the four files previously tracked under it are untracked, so the routes stop deploying. `app/lab/LabTweak.tsx` is the shared control panel — toggles write `data-*` on `<html>`, sliders write CSS vars, so knobs are CSS switches Pramit tunes in-browser and copies back.

2026-08-17 — The embedded PR Life application has been removed. Its standalone deployment is live at `life.pramitranjan.com`; this repo keeps only temporary old-link and API compatibility rules in `next.config.ts`. The portfolio cron is removed. The public Lab story about the product remains portfolio content.

Three Swipey internship case studies — `swipey-fields`, `swipey-admin`, `swipey-get-started` — exist as hidden `caseStudies[]` entries. They render as framed modals from `/work/swipey` (`app/work/swipey/page.tsx` → `components/SwipeyHubClient.tsx`), which is the single Swipey entry in `workPage.projects[]`.

Four prototypes are vendored under `public/proto/` (`custom-fields`, `swipey-admin`, `card-rename`, `swipey-demo`), sanitised through `scripts/sanitise-proto.mjs`, and make no external network requests.

## Decisions
- 2026-08-19 — **Page heroes (eyebrow + h1 + body) share one component.** `WorkPageClient` and `PlayPageClient` had hand-rolled, byte-identical hero markup and duplicated IntersectionObserver eyebrow-reveal logic. Extracted to `components/PageHero.tsx` (wraps the existing `AnimatedEyebrow`); both now render through it. `About`'s hero keeps its own markup since it carries extra elements (CV button, scroll hint) the shared component doesn't model.
- 2026-08-19 — **There are two eyebrow components, and only one lost its rule.** `AnimatedEyebrow` (animated, label only) and `RuleLabel` (static, 32px rule + label) both exist. Removing the rule touched only the former, so the 32px dash still ships wherever `RuleLabel` is used — the three hero stages, `HeroCarousel`, and every case-study layout. `RuleLabel`'s prop is `number`, so it may be a deliberately different pattern (section numbering, not a page eyebrow); Pramit has not ruled on it. `UnderConstructionPage` and `ScadPageClient` hand-roll the same markup a third time.
- 2026-08-19 — **The homepage film strip derives from content.** `PhotographyStage` hard-coded a five-frame array whose covers and routes duplicated `photography.cities`, so adding a city updated `/play` but never the homepage. It now takes `cities` as a prop and builds one frame per city, numbered in order — which drops the old second KL frame and fixes numbering that previously ran 001, 002, 003, 004, 001. Needed a new `PhotographyCity.shortCode` field (KL/PG/SG/HCM) because the labels are abbreviations and content only had full titles.
- 2026-08-19 — **The homepage's About eyebrow is the shared component.** `components/About.tsx` hand-rolled a grey `--color-label` mono div where every other page renders `AnimatedEyebrow` in red with the reveal, so it silently sat out the eyebrow change. Now it uses the component. This is the only homepage edit Pramit accepted into production from the `/lab/home` audit.
- 2026-08-19 — **The homepage hero stays bespoke.** `PortfolioHero` is a signed-off carousel, not the eyebrow/title/body pattern, so the `PageHero` work does not apply to it. Its type is the site's biggest token gap regardless — but moving those sizes onto the scale enlarges the type, which risks the standing rule that the mobile card ratio keep label, title, description, and action all visible. Not touched without Pramit's call.
- 2026-08-19 — **The eyebrow is the label alone.** `AnimatedEyebrow` no longer draws the 32px rule before `PLAY_` / `WORK_` / `ABOUT_`; Pramit read it as decoration. Global change — every page using the component. `UnderConstructionPage` hand-rolls its own `.eyebrow-line` and still has one, and the `--motion-eyebrow-label-delay` that used to wait for the rule to draw is now bare dead air (dashboard-tunable, not yet changed).
- 2026-08-19 — **Labs are local-only and were never actually ignored.** `/lab` and `/lab/hero` had been committed (`da3ebf1`) and were publicly reachable on production behind nothing but `robots: noindex`; no `.gitignore` rule matched `app/lab`. Now `/app/lab/` is ignored and those files are untracked. Lab-only code lives inside that tree — `LabTweak` moved out of `components/`, where it would have shipped as dead weight. Nothing outside `app/lab` may import from it, or a production build breaks when the lab is absent.
- 2026-08-19 — **One card component for work projects.** The `/lab/home` study used `CreativeListingCard` because it already had the bottom-pinned CTA; Pramit rejected that — `/work` and the homepage both show work projects and must use `ProjectCard`. The behaviour went into `ProjectCard` instead. Its supporting variant previously had no description at all (`oneliner` only appeared in the hover panel).
- 2026-08-19 — **Lab variants are CSS switches, not React branches.** Every treatment renders into the DOM and `html[data-*]` / `:root` CSS vars pick the visible one, driven by the shared `LabTweak` panel. Why: Pramit's design iteration is a long tail of small numeric tweaks, and routing each through a code edit burns a round trip per pixel. Default (attribute-absent) styles must match each control's `initial` or the page flashes the wrong treatment before hydration.
- 2026-08-19 — **When translating a referenced design into this DS, match its real structure — don't invent new concepts.** Three from-scratch redesign concepts for About were rejected outright; two faithful structural translations of the two sites Pramit actually linked landed immediately. When a reference is given, reproduce its layout, proportions, and information order in this system's type/color, rather than treating it as generic inspiration for something new.
- 2026-08-17 — **PR Life is a separate product boundary.** Its application source, APIs, cron, migrations, docs, firmware, and secrets live in `life-web`. The portfolio retains a public Lab story and temporary compatibility redirects/proxy only.
- 2026-08-17 — **The root favicon owns its generator.** It renders black `PR` text on an edge-to-edge signal-red background and no longer imports from another route.
- 2026-08-12 — **The root metadata template owns the `| Pramit Ranjan` title suffix.** `buildMetadata` returns the child title only; Open Graph and Twitter keep the composed full title.
- 2026-08-13 — **The homepage hero is dashboard-selectable and editable, with Portfolio Carousel active by default.** `home.heroMode` is `staged` or `portfolio-carousel`; `home.portfolioCarousel.heading` owns its lead and italic headline text, and `items` owns card copy, destinations, and image presentation. `/`, `/lab/hero`, and the hero lab share the same public content. On touch screens only the centre card tracks the drag. A successful release changes card roles and springs the finger offset home in one frame; the mobile card ratio must keep its complete label, title, description, and action visible. The PR logo links to `/#selected-work`. The Lab remains a full homepage simulation below the experimental hero.
- 2026-08-18 — **Carousel fidelity takes precedence over transform-led enlargement.** The active card renders at its final dimensions; background cards use their own smaller 63% layout width for depth, and carousel images use their original source so screen captures and typography remain crisp.
- 2026-08-18 — **The homepage browser title is dashboard-editable.** `home.browserTitle` supplies the root page metadata; the layout remains the sole owner of the `| Pramit Ranjan` suffix.
- 2026-08-18 — **Dashboard value fields carry an inline visual preview.** Reuse the shared `Field` primitive: color values show swatches, typography values show type, and measure values show proportional markers beside their editable value.
- 2026-08-18 — **Swipey keeps one visual canvas from hub to story.** Its large-screen card grid uses the same full-width shell as its hero, and editorial outcomes inherit the active page background rather than introducing a hard-coded second dark tone.
- 2026-08-18 — **Live case-study apps and framed stories keep their own viewport contracts.** Deployed apps use the shared enlarged internal iframe viewport scaled with `transform`, never `zoom`; Swipey prototypes retain their measured scaler and frame-relative editorial geometry. These rules are portfolio CSS, not Life CSS.
- 2026-07-24 — **Swipey prototypes are vendored static files.** Existing iframe support is reused; no new content schema or routes are needed.
- 2026-07-24 — **Swipey stories stay hidden until sign-off.** Static prototype assets are publicly addressable even when content entries are hidden.
- 2026-07-24 — **Swipey uses one umbrella hub with modal stories.** It remains one `/work` entry rather than three sibling pages.
- 2026-07-24 — **Mobile uses stills for vendored prototypes.** The desktop-scale builds are unusable in a phone iframe; absolute responsive embeds keep their iframe.

## Open threads
- Hero convention undecided: `/lab/work`, `/lab/play`, and `/lab/about` can each dial the shared `PageHero`. Pramit hasn't picked whether About gains one or Work/Play lose theirs.
- `photography.cities[].type` is seeded as bare `PHOTOGRAPHY` — the years are unknown and were deliberately not invented. Pramit owns filling them in as `PHOTOGRAPHY · YYYY`.
- `aboutPage.nowCards` "BUILDING_" copy reads "Custom transaction Fields for Swipey" — stray capital F, and its `sub` has no closing period. Content fix, not code.
- About needs real portrait photos — `PORTRAIT_IMAGES` in `AboutDesignLab.tsx` is still empty, so the carousel shows labelled placeholders.
- Neither lab direction is ported to production `/about`, `/play`, or `/work` yet. Signed-off geometry: About 800px column / 390px portrait / 58px album art / 45px statement, statement hero, Right-now block, left aligned. Play minimal head, card meta inline, 4 cols, 360px tile / 205px image / 19px spacing / 24px gap. Work compact hero, 96px padding.
- `/lab/home`'s work section is accepted in the lab but not ported to `/`. It converges on `CreativeListingCard`; if that lands, decide whether `ProjectCard` survives at all.
- Pending Pramit's call: whether `RuleLabel` keeps its 32px rule (see decision above), whether to add `PortfolioHero`'s type to `/lab/home` behind the version toggle, and whether `/lab/work`'s compact hero keeps its `8 PROJECTS` count now that the homepage's is gone.
- Porting Work's compact head means replacing its CSS-string `::after` count with real markup, and `--lab-*` vars with settled values.
- Production `/play` shows `Game Three`/`Game Four` (placeholder copy) even though they're `hidden: true` — `PlayPageClient`'s games filter never checks that flag. Known, not yet fixed on production.
- Swipey sign-off is pending on interactive embeds. Until then, case studies stay hidden.
- Cover and mobile images remain placeholder PNGs; Pramit owns final captures.
- The Swipey hub hero still uses `/work/swipey-fields/cover.png` and wants its own image.
- Remove the temporary PR Life compatibility bridge after old native installations and saved browser links have aged out.

## How Pramit works
- Treat bug reports as evidence: follow the observed symptom before proposing a theory.
- Pramit owns visual acceptance. Static or browser measurements are evidence, not visual sign-off.
- Treat comma-joined feedback as separate requirements; deliver each or name what remains.
- Fix shared root causes at the component or system boundary, not at one caller.
- Prototype major page redesigns under `/lab/<page>` (established for hero, about, play) before replacing production.
- When given a reference site to match, reproduce its actual layout in this DS — don't generate original concepts instead.
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
Get Pramit's call on the hero toggle and About's text width, plus a real portrait photo; then port both lab directions into production `/about` and `/play`.

## Last session
2026-08-19 — Iterated four page designs in `/lab/*` to sign-off using a shared in-browser control panel, then ported all of them into production: `/about` rebuilt as the centered statement (keeping Education, Tools, résumé and contact copy that the lab study had omitted), `/play` collapsed to one wall, `/work` on a compact hero, and the homepage's work head plus `ProjectCard` behaviour. Also removed the eyebrow's 32px rule, put `AnimatedEyebrow` into the homepage About and photography sections, derived the film strip from content, normalised four different section paddings onto one token, and fixed the live bug that rendered `Game Three`/`Game Four` placeholders on `/play`. Sealed the labs behind `.gitignore` after finding them deployed. Production build passes. Committed on a branch; not pushed.
