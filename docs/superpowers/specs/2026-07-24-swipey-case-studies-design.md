# Swipey case studies — design

---

## ⚠️ RESTRUCTURE — 2026-07-24, supersedes the shape below

Pramit changed the structure after reviewing the first built case study. **The three stories are
no longer three separate pages.** Everything about the *narratives, confidentiality, Alfie
context and voice* below still stands — only the presentation changes.

**New shape:**

- **One umbrella case study, `swipey`,** at `/work/swipey`. It is a **hub, not a narrative** —
  short intro framing (what Swipey is, what Alfie is, the internship) then three project entries.
  Only `/work/swipey` appears on `/work`.
- **The three stories open as modals, not pages.** Clicking a project on the hub opens the whole
  case study — narrative *and* prototype together — in an overlay: a **framed panel over a
  blurred backdrop**. There are no separate routes for them.
- **No "OPEN FULLSCREEN" CTA.** It does not make sense once the prototype is already in a frame.
  Remove it from these.
- **On mobile, no iframe.** The prototypes are desktop-scale and unusable in a phone iframe.
  Mobile shows **static images** instead. (This reverses the earlier "one cover image each"
  decision — mobile needs several frames per prototype.)

**Data contract (both implementing agents build against this):**

- The three sub-studies stay as normal entries in `caseStudies[]` with `hidden: true`. Their
  narrative content is unchanged and is the source the modal renders from. `hidden` keeps them
  from resolving as standalone pages in production, which is now correct — they are modal
  content, not pages.
- Because the hub must read them even though they are hidden, `lib/site-content.ts` needs an
  accessor that bypasses `filterVisibleCaseStudies` for exactly these three slugs.
- `workPage.projects[]` carries **one** entry, `/work/swipey`. The per-story entries come out.
- The hub lives at `app/work/swipey/page.tsx` (a static route, matching the existing
  `app/work/albers/page.tsx` pattern) rendering a new client component that owns modal state.

**Still true and unchanged:** the `swipey-fields` and `swipey-admin` narratives and headlines
approved below; the Alfie receipt-reader context; all confidentiality rules; local-branch-only,
never push; nothing publishes until Swipey signs off.

### ⚠️ Third case study reframed — `side-by-side` is dead, it is now `swipey-get-started`

Pramit trimmed the card-rename prototype to **only the recommended panel** (Design 1, "Refreshed
panel"). The Familiar layout finalist and all four earlier explorations are deleted from the
vendored prototype (commit `c804a5e`).

That destroyed the "Side by Side" premise, which was entirely built on the discarded options
staying visible. **Every `side-by-side` headline below is now void** — especially
`processHeadline` ("I kept every version side by side instead of deleting the losers") and the
callout body ("Both finalists sit up top and the four earlier explorations are kept
underneath"). Do not use them.

**The replacement, decided by Pramit:**

- **Title:** Get Started · **Slug:** `swipey-get-started`
- **Led entirely by the onboarding work** — the `/get-started` demo. The real material, all
  verified in `~/Swipey/Demo App/src/modules/GetStarted/sandbox/onboarding/copy.ts`:
  - **Diegetic questions** — "What will this card be for?" / "Roughly how much a month?" are
    presented as card setup. They genuinely configure the demo card *and* are the lead-qual
    spend-category and monthly-limit fields. One question, two jobs.
  - **Mad-libs identity** — "We're a __ in __ spending about __ a month." A sentence, not a form.
  - **Reciprocity** — pick an industry and the ambient transaction toasts re-seed to vendors
    you'd recognise (tech → AWS, Datadog; retail → Shopee Ads, Lazada). The demo pays you back
    for answering.
  - **Persona fork** — "How should we run your tour?" (founder / finance / team) rewrites every
    value line.
  - **The finale** — the pain question becomes the closing argument: answer "chasing receipts"
    and it replies "You just watched receipts auto-match as cards were used."
- **The card rename is a small supporting detail only** — naming a card is a step in the tour's
  issue-card flow. One passing mention at most. It is not the subject.
- **The embed must be the Demo App**, not the rename prototype — an onboarding case study cannot
  show a rename panel as its solution. This makes the CRA build (plan Task 5) **required**, not
  optional. `~/Swipey/Demo App/` has no `node_modules`; it needs `npm install` + `npm run build`
  with `homepage` set to the served subpath.
- Media folder is `public/work/swipey-get-started/`, not `side-by-side/`.

---

**Date:** 2026-07-24 · **Source material:** `~/Swipey/` · **Target:** `content/site-content.json`, `section: work`

Three new case studies from Pramit's design internship at Swipey (corporate cards + spend
management for Malaysian SMEs). All three ship with live interactive embeds of the original
prototypes.

## Why these three

Ranked for range and seniority — each proves a different capability, with no overlap:

| Slug | Proves | Depth |
|---|---|---|
| `swipey-fields` | Data-UX, AI interaction, design-system governance | Deep |
| `swipey-admin` | Product adaptation, accessibility, QA rigour | Deep |
| `side-by-side` | Divergent exploration and reasoned convergence | Deep |

The Weekly Digest work stream is excluded entirely — it is data/growth analysis, not UX.

**Context that matters:** every existing case study on the site is school or personal work.
These are the first entries from a real job, with real users and a real design system. That is
what they are for. It also argues for a new `type` label, `PRODUCT DESIGN · 2026`, alongside the
existing `UX DESIGN` / `UI DESIGN` / `SHIPPED APP` vocabulary.

## Source-of-truth warning

`~/Swipey/PORTFOLIO-BRIEF.md` is a secondary document assembled by an agent and it embellishes.
Two of its claims were verified false against the artifacts:

- It describes Card Rename as "10 directions (modal → inline edit → anchored popover → …)".
  The file actually contains **2 finalists + 4 earlier explorations**, all panel variants.
- It frames the Alfie work as designing AI humility. Pramit: *"Alfie was never built to admit
  anything."* The real intent is structure recovery — see `swipey-fields` below.

**Rule for implementation: verify every factual claim against the artifact or against Pramit.
Do not source claims from the brief.**

## Confidentiality

Rules set by Pramit, applied to the vendored copies — never to the originals in `~/Swipey/`:

- **Names** — prototypes contain real names (`GOH YU HAN`, `Suresh Mastercard`, `Big Boss HSP`)
  and the docs name colleagues. All replaced with neutral fictional ones. Colleague names never
  appear.
- **Metrics** — visible RM figures are already mock demo data; re-roll anyway so nothing traces
  back. No real customer counts, revenue, or tier breakdowns from any source.
- **Repo and infra** — no repo names, CI/CD image names, k8s labels, commit hashes, or vendor
  names (Auth0, LaunchDarkly, Mixpanel, Sentry).
- **Kept** — "Swipey", the product context, the design system tokens, Alfie as a feature name.
  These are the story.

Because the embeds are **interactive**, sanitisation must cover the whole prototype, not just
the frames that get screenshotted. A visitor can click every screen and read every label.

**Sign-off gate:** Pramit clears the embeds with Swipey before publish. The ask is
"interactive embeds of the prototypes", which is materially more exposure than "some
screenshots" — it must be cleared as such. Build with `hidden: true` until cleared.

## Who Alfie is (shared context — both deep case studies need this)

**Alfie is Swipey's in-product AI, and it existed before this work.** Its original and only job
was OCR: you upload a receipt, Alfie reads it, finds the matching transaction, and files the
details. In the admin prototype it is the fifth tab, subtitled *"Smart receipt matching"*, and
introduces itself as *"your smart receipt assistant."* The Overview screen surfaces "Unattached
receipts · 12" as its inbox.

**Pramit's decision on custom fields was to extend that existing name rather than invent a second
assistant.** Users already trusted Alfie to read their receipts; attaching column suggestions to
the same character means the trust transfers instead of having to be earned again from zero.

This must be established in `swipey-fields` before any Alfie mechanic is described — otherwise
the case study reads as "I added AI to a table", which is not what happened. It also creates a
genuine thread between the two deep case studies: `swipey-admin` shows Alfie in its original
receipt-reading role, `swipey-fields` shows it extended. Cross-link them with `prev`/`next`.

Evidence the extension was real work, not a rename: the UX pass caught the suggestion tooltip
still hardcoding *"read from receipt"* on values that had actually come from transaction notes.
Generalising that into true per-suggestion provenance was part of the job — the borrowed model
showing through at the seam.

## Voice

Match the existing case studies exactly: first person, plain declarative sentences, specific
real numbers, one statement per section. The `outcomesHeadline` reflects on what was learned,
then states what he would do next. The `pullQuote` is the thesis.

AI-assisted process is disclosed the way `albers` already discloses it ("Claude Code handling
implementation while I focused on how the interaction should feel"). Swipey ran the same way:
subagents implementing, Pramit holding the design bar and doing all browser testing himself.
Do not claim he hand-authored work an agent produced under his direction.

---

## 1 · `swipey-fields`

**Title:** Custom Fields · **Type:** `PRODUCT DESIGN · 2026`
**Oneliner:** People were already tracking projects. Just not anywhere the software could see.
**Tags:** Product Design, Data UX, AI Interaction, Design Systems, Accessibility, React

The insight is structure hiding in the notes field. Finance teams needed Project, Client and
Billable columns the product did not have, so they improvised in free text — where nothing can
be filtered, grouped, or reported on. Alfie's job is to notice that pattern and offer to
formalise it, then fill the column, with a person confirming before any of it becomes data.

The second decision, equally important: **Alfie already existed as the receipt reader** (see the
Alfie section above). Extending a character users already trusted, rather than introducing a
second assistant, is the strategic move in this piece. Establish it before any mechanic.

Verified in the running prototype:

- A nudge citing real evidence: project names in the notes of 14 transactions → one-click
  "Create 'Project' field"
- Alfie prefills the new field's name, type and options
- Filled values land as dashed pills with per-cell accept/edit, and a bar reading *"Alfie filled
  8 values in 'Project' from your transaction notes"* with Accept all / Review later
- AI-ness is carried by the dashed border and a sparkle, **not colour alone**, so it still reads
  for colour-blind admins
- Fields are org-wide; management is admin-gated; delete requires typed confirmation

**Headlines (draft):**

- `problemHeadline` — Finance teams needed columns Swipey didn't have: Project, Client, Billable. So they improvised in the notes field, where nothing can be filtered, grouped, or reported on.
- `roleHeadline` — Design intern at Swipey, a corporate card and spend platform for Malaysian SMEs. I owned this exploration end to end: the interaction model, the AI layer, and the prototype it ran in.
- `researchHeadline` — Two things already existed. Project names sitting in the notes field, and Alfie, the receipt reader people already trusted to file their expenses. The work was connecting them.
- `challengeHeadline` — Custom fields are org-wide. One person deleting a column destroys everyone's reporting, so management is admin-gated and deletion is something you have to type your way through.
- `processHeadline` — I extended the assistant people already knew instead of introducing a second one. Alfie read receipts; now it reads notes too. Suggestions land as dashed pills carrying the note they came from, so accepting eight at once is still an informed decision.
- `solutionHeadline` — A field you create in one click from a nudge that cites its own evidence, filled by Alfie, confirmed by a human, and filterable the moment it exists.
- `outcomesHeadline` — Then I used my own prototype as the admin who'd live in it, and found eleven things wrong — three of them blocking. Creating a column scrolled it off screen. Next I'd take the same lens to the mobile table.
- `pullQuote` — The structure was already there. It was just sitting in a text box where nothing could reach it.
  - *Alternative, if the borrowed-trust angle should lead instead:* "Alfie already had people's trust for reading receipts. I gave it something else to read."

**Secondary thread:** a design-system audit found the Alfie layer running on a violet with no
basis in the palette, plus off-token status colours, Poppins overuse, uppercase labels, and
off-scale radii. Resolved to a documented accent token.

There is nowhere good to put this. `CaseStudyMediaImage` has no caption field (verified —
`src`, `alt`, `fit`, `position`, `aspectRatio`, `background` only), and the seven headline slots
are all spoken for. Options, in order of preference: fold one clause into `processHeadline`;
carry it in the `alt` text of a design-system screenshot; or drop it. **Do not add a caption
field to the schema for this** — it is a secondary thread, not worth a schema change.

---

## 2 · `swipey-admin`

**Title:** Swipey Admin · **Type:** `PRODUCT DESIGN · 2026`
**Oneliner:** Proven on desktop. Unusable in a pocket.
**Tags:** Product Design, Mobile UX, Accessibility, Design QA, Design Systems

Adapting a proven desktop admin experience to mobile for an audience aged 30–60 — the first
admin-facing mobile release. The governing principle, set before any screen: **port the business
rules, don't reinvent them.** Every validation and status already had a proven desktop answer.

Then a design QA pass with stable finding IDs (`G-1`, `LOG-2`) and severity tiers, with `[SPEC]`
tags marking the items that were requirements for engineering rather than visual edits. A later
full audit caught three blockers the earlier review batches had missed.

Verified findings worth telling:

- "Success" rendered grey on grey while "Approved" was green — to an older user grey reads as
  failed. One successful withdrawal even wore a strike-through copy-pasted from the declined row
  above it.
- Touch targets at 30–34px, raised to 44px minimum
- Permanent labels at 10–12px, some as low as 7px, against a 30–60 audience
- A "Deposit Funds" button that opened the AI tab; a second Deposit button bound to a function
  that was never defined
- Two competing status vocabularies (Success and Approved) with filter chips offering only one

This case study is also where **Alfie appears in its original form** — the receipt-matching tab,
with the Overview surfacing unattached receipts as its inbox. Show it plainly here. It sets up
the extension that `swipey-fields` is built on, so the two pieces read in sequence.

**Headlines (draft):**

- `problemHeadline` — Every admin flow already worked on desktop: deposit, top up, clawback, issue card, invite, approve. None of it was reachable from a phone, and the people who needed it most were the ones away from their desks.
- `roleHeadline` — Design and design QA on the first admin-facing mobile release, built as a stakeholder-ready prototype for an audience aged 30 to 60.
- `researchHeadline` — The desktop product was the research. Every rule, status and edge case already had a proven answer, so the job was translation, not invention.
- `challengeHeadline` — Port the business rules, don't reinvent them. Writing new validation for flows that already worked would have been risk with extra steps.
- `processHeadline` — I reviewed it screen by screen with stable finding IDs and severity tiers, so fixes could be referenced across sessions without collisions, and tagged the ones engineering needed as requirements rather than visual edits.
- `solutionHeadline` — Every admin flow on a phone, with a legibility floor, 44px targets, an AA contrast system, and one status vocabulary instead of two.
- `outcomesHeadline` — The audit found three blockers that seventy-four findings of review had walked straight past, which is the argument for auditing separately from reviewing. Next I'd test it with actual sixty-year-olds instead of designing for them.
- `pullQuote` — Grey doesn't read as "done" to someone who's sixty. It reads as something went wrong.

---

## 3 · `side-by-side`

**Title:** Side by Side *(provisional — Pramit is not settled on this)*
**Type:** `UI DESIGN · 2026`
**Oneliner:** Every option kept where you can compare them.
**Tags:** Interaction Design, Onboarding, Conversion, Prototyping, React

A different kind of case study: not "here is the problem and my answer", but "here are the ways
I tried, and why this one won". Both halves were worked the same way — options kept side by side
rather than hiding everything but the winner. The rename file says so explicitly: *"every
earlier exploration is preserved below for reference."*

**Half one — the onboarding demo.** A prospect explores a realistic Swipey, and the qualifying
questions never look like qualifying questions. Verified in `copy.ts`:

- **Diegetic questions.** "What will this card be for?" and "Roughly how much a month?" are
  presented as card setup. They genuinely configure the demo card, and they are the lead-qual
  spend-category and monthly-limit fields. One question, two jobs.
- **Mad-libs identity.** Instead of a form: *"We're a \_\_ in \_\_ spending about \_\_ a month."*
  You fill in a sentence.
- **Reciprocity.** Pick your industry and the ambient transaction toasts re-seed to vendors you'd
  recognise — tech gets AWS and Datadog, retail gets Shopee Ads and Lazada. The demo pays you
  back for answering.
- **Persona fork.** "How should we run your tour?" — founder, finance, or team — and every value
  line rewrites to match.
- **The finale.** The pain question becomes the closing argument: answer "chasing receipts" and
  it replies *"You just watched receipts auto-match as cards were used."*

**Half two — card rename.** Six panel variants circling one question: how much affordance does a
rename need? Too subtle and nobody finds it; too loud and it dominates a panel that is supposed
to be about the card. Two finalists — *Refreshed panel* (name leads as the headline with a small
pencil, preferred) and *Familiar layout* (explicit Rename button) — plus four earlier
explorations kept for reference: ghost pencil revealed on hover, a "Click to rename" guided
hint, name-on-open with the input already active, and name-as-hero-title. The card art updates
live as you type.

**Headlines (draft):**

- `problemHeadline` — Two problems, worked the same way. A demo that had to qualify a prospect without ever feeling like a form, and a rename that nobody could find.
- `roleHeadline` — Design and front-end on the get-started demo, and the interaction exploration for renaming a card.
- `researchHeadline` — People skip the sign-up ask when the demo is explorable anyway. So the questions had to stop being a toll gate and start being part of the thing they came to try.
- `challengeHeadline` — How much affordance does a rename need? Too subtle and nobody finds it. Too loud and it takes over a panel that's meant to be about the card, not its name.
- `processHeadline` — I kept every version side by side instead of deleting the losers. Comparing six panels at once makes the argument for one of them much faster than describing it.
- `solutionHeadline` — Questions disguised as setup, an identity you fill in like a sentence, a demo that re-seeds itself around your industry, and a rename that leads the panel as its headline.
- `outcomesHeadline` — Keeping the discarded options visible turned out to be the useful part; the reasoning is legible in a way a single final screen never is. Next I'd put the variants in front of real prospects instead of picking by argument.
- `pullQuote` — The best question doesn't feel like a question. It feels like the thing you came to do.

---

## Interactive embeds

All four prototypes ship live, using the existing `solutionEmbedUrl` / `useEmbedPreview` schema
fields (precedent: `albers`).

Vendored into `public/proto/<name>/`, sanitised copies only:

| Prototype | Build needed | Size | Notes |
|---|---|---|---|
| Swipey Admin | none | ~944K | Self-contained `.dc.html` + `support.js` |
| Card Rename | none | ~608K | Self-contained `.dc.html` + `support.js` |
| Custom Fields | pre-transpile once | ~1.4M | See below |
| Demo App | `npm install` + CRA build | unknown until built | Only one requiring a toolchain |

**Custom Fields** currently loads React, ReactDOM and Babel standalone from unpkg and transpiles
JSX in the browser (~3MB, slow). Pre-transpile `model-c.jsx` and `tweaks-panel.jsx` to plain JS
once, and vendor React's **production** UMD locally (~130KB). No CDN dependency at runtime, and
it loads fast enough to embed.

**Demo App** is Create React App. `npm run build` produces a static bundle; `homepage` must be
set to the subpath it is served from. One-time cost, permanent result.

Embeds need: an aspect ratio suited to each prototype (Admin is a phone frame, the other three
are desktop), lazy loading so they do not block the page, and a visible fallback link.

## Risks

1. **Confidentiality.** The dominant risk. Interactive embeds expose everything. Gated on
   Swipey sign-off; build hidden.
2. **Repo weight.** ~3MB of vendored prototypes plus the CRA bundle. Acceptable, worth knowing.
3. **`side-by-side` title** is unsettled.
4. **Demo App build** may need dependency fixes on a CRA project of unknown age. If it fights
   back, fall back to screenshots for that half rather than sinking hours.
5. **Mobile.** The Admin prototype is a fixed phone frame; embedding it on a phone needs care.

## Out of scope

- Weekly Digest (excluded permanently)
- Any real business metric from any source
- Merging Model C into the production transactions screen
- Reworking the existing case study schema — these use it as-is
