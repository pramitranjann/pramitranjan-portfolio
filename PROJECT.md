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

### PR Life (`/life`) — private personal OS in the same repo
2026-08-08 — Mid-rebuild of the UI, uncommitted on `main`. The "Life UI kit" (`components/life/ui/`, reui patterns in Life's tokens) is now wired into real screens rather than sitting in a lab. `LifeCalendarClient` bridges `LifeEventCalendar` to the API; `/life/review`, `WeekClient` and `MonthClient` are deleted (the month calendar's three views replaced the week page).

Two screens are being designed in **lab routes before they replace the live ones**: `/life/today-v2` and `/life/rolodex-v2`, each with its own stylesheet next to its `page.tsx` so parallel work can't collide in `globals.css`. **Both are now wired to real data** — the mock arrays are gone. Each is an auth-gated Server Component that loads and maps, with the client component taking props.

Rolodex v2 is fully wired: list/ledger/horizon off `people` + `interactions`, add-person POST, inline-edit PATCH, "Contact now" writing an interaction, and history + open follow-ups from one `GET /api/life/people/[id]`. It needs migration 010 run before it can load. Today v2 is read-only — capture Save and the task checkboxes are deliberately still inert. Neither has been looked at in a browser.

## Decisions (with why)
- 2026-08-09 — **Rolodex gets six new `people` columns** (`supabase/migrations/010_rolodex_contact_details.sql`): `email`, `phone`, `how`, `links` jsonb, `likes`/`dislikes` text[]. Why: the person page collected all of them and migration 008 allocated none, so the data had nowhere to land. `how` joins the existing `why` because the page asks two different questions — how you know someone (fixed history) versus what you want from them (a live intention) — and one column made both labels show the same sentence. Arrays/jsonb default to empty, never null, so readers never branch on "missing vs empty". `PersonRecord`, `createPerson`/`updatePerson` and both API routes carry them. **DDL cannot go through the service-role REST API — Pramit runs the migration in the Supabase SQL editor.**
- 2026-08-09 — "Last contacted" is derived from `interactions`, not a column on `people`. Consequence when seeding: a person with no interaction row reads as never-contacted and sits permanently overdue, so the decay model is dead for them. Every seeded person needs at least one dated entry. Seeder: `scripts/seed-rolodex.mjs` (plain-text blocks in, dry-run by default, upserts by name so re-runs edit rather than duplicate).
- 2026-08-09 — **Killed the "decision maker" feature outright, at his call.** Two builds, both rejected — a weekly triage board ("this does nothing"), then a live decision box ("this shits ass"). Why it's worth recording: the idea kept passing the design conversation and failing on contact, and the second build was rebuilt on a wrong premise even after probing the data. Do not resurrect this without him raising it first.
- 2026-08-08 — **The scale is locked, in `.life-shell` at the top of `globals.css`.** Six type sizes (`--t-micro` 10 / `--t-meta` 11 / `--t-small` 12 / `--t-body` 14 / `--t-lead` 15 / `--t-title` 18), six spaces (`--s-1`..`--s-6`, 4→32), two trackings. **If a size isn't in the scale it does not go in a rule.** Why: every screen was picking its own 9/10/11/12px and 8/14/22/28px, so each edit drifted further from the others and Pramit paid for a round-trip per drift. 9px is deliberately absent — `--life-label` (#6f6f6f) is 3.9:1 on `--life-bg`, so a 9px label failed AA on both size and contrast. **Labels at 10–11px take `--life-muted` (7.9:1), never `--life-label`.**
- 2026-08-08 — `LifePopover` stays mounted past close (`EXIT_MS = 170`) and exposes `data-open`, so enter/exit can be animated in CSS (`@starting-style` in, 0.15s out). Why: it previously mounted and unmounted outright, so there was no motion either way — which reads as "linear". **`EXIT_MS` must stay ahead of the CSS exit duration**; unmount early and the animation is cut mid-flight, which looks identical to having none. Every popover in Life inherits this — menus, task-form calendar, hover cards.
- 2026-08-08 — **Exits get their own curve, not `--life-ease-out`.** That token is `cubic-bezier(0.23, 1, 0.32, 1)`, an expo-out that spends ~90% of its distance in the first third — right for an arrival, and on a departure it blinks the element out. Exits use `cubic-bezier(0.4, 0, 0.7, 0.2)` (gentle start, accelerates away). Corollary learned twice this session: "exits should be subtler than enters" is real guidance, but 2px/`scale(0.99)`/0.12s and a 6% hover overlay both fell below the threshold of reading as anything. Subtler, not invisible.
- 2026-08-08 — One hover card for the whole app: `.life-hc` in `globals.css` (title / sub / rows), used by schedule events, tasks and rolodex dots. Why: `.t2-evcard` and `.lab-horizon-hc` were two implementations of the same object with different padding, row sizes and label colours, so fixing one moved it further from the other. **The card root is itself the control** — `<Link>` for a route, `<button>` for in-page state — so it carries the element resets. There is no "Open X →" footer: that was a second control for the thing the pointer was already on.
- 2026-08-08 — Rejected installing shadcn/ui for the Rolodex. Why: `LifeHoverCard`/`LifePopover`/`LifeConfirm` already exist, and shadcn puts its tokens on `:root` while every `--life-*` var lives on `.life-shell` — the exact mismatch that made the popover render unstyled.
- 2026-08-08 — Lab routes get their own CSS file rather than more `globals.css`. Why: `globals.css` is one 6.5k-line file, so two agents editing it serialise; a per-route sheet loads after it and wins on source order.
- 2026-07-24 — Prototypes vendored as static files into `public/proto/<name>/`, embedded via the existing `solutionEmbedUrl` iframe path. Why: no new routes or schema needed.
- 2026-07-24 — All Swipey case studies ship `"hidden": true`. Why: interactive embeds need Swipey sign-off before anything is public.
- 2026-07-24 — Umbrella hub with modal stories rather than three sibling pages. Why: one Swipey entry on `/work` instead of three, and the stories read as one internship.
- 2026-07-24 — Mobile shows a still for `/proto/` embeds, keeps the iframe for absolute `http(s)` ones. Why: the vendored prototypes are desktop-scale and unusable in a phone iframe; Albers and Wander are genuinely responsive.

## Open threads
- Swipey sign-off pending on **interactive embeds** (a bigger ask than screenshots). Until then: case studies stay hidden and the `swipey-case-studies` branch is never pushed — `public/` assets are served statically in production regardless of the `hidden` flag. On sign-off: flip the three flags in one commit, then push.
- Cover and mobile images are flat placeholder PNGs. Real captures pending — Pramit does them.
- The hub hero still uses `/work/swipey-fields/cover.png`; it wants its own image.

## How Pramit works
<!-- Written from observed sessions, not from asking him. Add only what you
     have evidence for; delete anything that stops being true. -->

- **His bug reports are diagnoses, not just symptoms.** "When the time doesn't load, the page doesn't have a scroll" was the whole answer — no hydration meant no JS, so the JS was *causing* the scroll it was meant to fix. He is non-technical and will describe what he saw, not what's wrong; read the observation as evidence and follow it before writing your own theory. Three fix attempts died ignoring one of these.
- **He does all visual verification himself. Never claim you did it.** Ask before loading his dev server; reference sites are fine unasked. Measuring a fact in the browser (a rect, a computed value) is allowed — judging how something looks is not. Say plainly when work is unverified.
- **One message is a batch of separate items.** He writes long, comma-joined critiques where every clause is its own bug. Deliver all of them, or say explicitly which you didn't and why. Do not cherry-pick the easy ones.
- **He notices when two things state the same fact, and when two things look alike but aren't.** "Why are there two types of data like 6w ago and +12d", "Contact font size is the same as email". Say a thing once, and make different kinds of things differ on more than one axis — colour *and* size *and* label, not one of the three.
- **Symptom → root cause, every time.** "The hover should be on the dot" was a shared component measuring its own wrapper, not a Rolodex bug. Fix it where all callers route through.
- **New screens get prototyped in a lab route** (`/life/today-v2`) with its own stylesheet, iterated on until he signs off, and only then replace the live screen.
- **Decide for him.** He is non-technical: make implementation and trade-off calls yourself and state them. Blocking questions only when proceeding would be unsafe or wasted.
- **Never commit or push unless he explicitly asks.** He pushes on his own.
- **He asks for cheap subagents on implementation work.** Do it — but verify their claims against the code before repeating them. In this repo they have reported browser verification that was false, called a component non-existent from a stale graphify index, and one killed his dev server with `preview_stop`. Tell every agent never to call it.
- **Craft is the point, not the deliverable count.** He'd rather one screen be right than three be present, and he will name the exact thing that's off. Comments explaining *why* a non-obvious rule exists are welcome; prose defending a decision is not.

## Gotchas
- **`/life`'s task table is effectively empty — 17 rows, 0 active (checked 2026-08-09).** Projects exist (`swipey, ops, albers, robin, scad, health`) but hold no open tasks, and there are no rows for classes, clubs or the job. Any feature that ranks, triages, or summarises "his tasks" renders blank against real data. Probe the table before designing on top of it — a whole feature was built and binned partly for missing this.
- `lib/site-content.ts` throws on malformed content — a broken JSON entry 500s the whole site. Loading the page is the test.
- `CaseStudyLayout` drops `solution`-section media blocks when `solutionEmbedUrl` is set; `useEmbedPreview` is only read by the game layout.
- `workPage.projects[]` is a separate array from `caseStudies[]` — a case study missing from it is unreachable from `/work`.
- **Scale embedded iframes with `transform`, never `zoom`.** Safari applies `zoom` to an iframe's internal viewport as well as its box, so a zoomed 1440px iframe lays out at ~1000px and the prototype wraps and clips itself. Cost several rounds to find because Chromium doesn't do this.
- `GsapReveal` drives off window `ScrollTrigger`, which never fires inside the modal's own scroll container — `.swipey-frame [data-reveal]` is forced visible in `globals.css` or every section below the fold sits at `opacity: 0`.
- **`/life` gotchas.** Every `--life-*` var is on `.life-shell`, never `:root` — portalling to `document.body` drops all of them. A bare `1fr` in a grid is `minmax(auto, 1fr)` and refuses to shrink below its content; it caused several horizontal-overflow bugs, so always `minmax(0, 1fr)`. A `<textarea>`'s `rows` attribute is an intrinsic height floor `minmax(0, 1fr)` cannot override, and defaults to 2. `LifeHoverCard` measures its own wrapper `div`, so an absolutely-positioned child leaves the anchor box behind at the container's edge — put the positioning on the wrapper via its `className`/`style`.
- **`--life-label` (`#6f6f6f`) is 3.9:1 on `--life-bg` and 3.8:1 on `--life-panel` — under AA on its own, and most of Life uses it at 9–11px.** Do not reach for it for anything that must be read, and never for a control. `--life-muted` (`#a4a4a4`) is 7.9:1. 10px is the size floor (81 uses vs 23 at 9px). Building a hierarchy by making each tier fainter than the last bottoms out in unreadable grey — separate tiers by size, family and rule instead, and keep only one tier muted.
- `/life` pages are strictly no-scroll: size the root to the viewport, end `grid-template-rows` in `minmax(0, 1fr)`, `min-height: 0` down the whole ancestor chain, panes scroll internally. Do **not** measure heights in JS — a hook doing `innerHeight - top - 24` ignored `.life-app-shell`'s own bottom padding and was itself the cause of a scroll that survived three fix attempts.
- `graphify` excludes `public/proto/**`; without it the vendored minified bundles flood the index (40k nodes) and queries return `pdf.worker.min.mjs` internals.

## Next action
Pramit reviews the three case studies, then captures real images. Sanitisation audit is clean and the copy has had its house-voice pass; the remaining gate is Swipey's sign-off.

Separately on `/life`: Pramit visually reviews `/life/today-v2` and `/life/rolodex-v2`, then they replace `/life` and `/life/people`.

The decision-maker feature is dead — deleted, not paused.

## Last session
2026-08-09 — Built a "decision maker" for `/life` and deleted it the same session at his call. Two attempts: a weekly triage board over his tasks (*"this does nothing, what am I supposed to do with this"*), then a live decision box needing no stored data (*"this shits ass"*). Net change to the repo: nothing but this note and the empty-task-table gotcha. Worth knowing for next time — the concept survived a long, agreeable design conversation and died instantly on contact with a screen, twice, so the ideation was not doing its job. Building something small and looking at it would have got the same answer far sooner.

2026-08-08 — Rolodex v2 finished, then legibility/spacing passes over both lab screens. Hover card anchors to the horizon dot (`LifeHoverCard` measures its own wrapper, and the absolute dot collapsed it to a strip at the track's left edge); person page rebuilt — cadence block *is* the Contact-now button, inline edit incl. links, In Life chips navigate. Swept `--life-label` off every small label on both screens; deleted 8 orphaned `.t2-*` rule groups. Ended by **locking the type/space scale** and collapsing two hover-card implementations into `.life-hc` — Pramit called out that repeated per-component size guesses were costing him round-trips, and he was right. Build clean; **nothing visually verified all session.**

Finished on motion: `LifePopover` had no enter/exit animation at all (mount/unmount), now eased both ways; row highlights made asymmetric (90ms in, 220ms out) since equal timing reads as a switch.

Then, before wiring: **populating the Rolodex.** The `people` table held exactly one junk row (`name: "Hi"`) and zero interactions, and five fields the person page collects had no columns — so migration 010 was written, the type and both API routes extended, and `scripts/seed-rolodex.mjs` built and dry-run tested. Blocked on two things from Pramit: running 010 in the Supabase SQL editor, and pasting his actual people.

Next: both lab screens are layout-complete and run on mock constants. Promoting them is a data-wiring job — `SCHEDULE`/`TASKS`/`CAPTURED`/`BRIEF` on Today, `CONTACTS`/`HISTORY`/`LINKED` on Rolodex, plus save handlers for capture, task checkboxes, add-person and inline edit. One unresolved report: Pramit says the schedule hover card was lost; wrapper and popover styles are demonstrably intact in code, so the likely cause was the row hover going near-invisible (6% overlay) — unconfirmed, but the new enter animation should make it self-evident on his next look. Also open: `relationship` is a real column with 7 fixed values that the lab ignores entirely, and it's a better Ledger grouping than the invented Overdue/Due/Warm buckets.
