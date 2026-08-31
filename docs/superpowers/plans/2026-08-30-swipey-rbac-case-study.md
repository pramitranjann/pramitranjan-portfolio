# Swipey RBAC case-study plan

## Decision

Add RBAC as the fourth story inside `/work/swipey`, using the same framed `EditorialCaseStudy` structure, field vocabulary, and direct writing style as Custom Fields, Swipey Admin, and Get Started. Do not create a separate top-level `/work` project or a one-off RBAC layout.

The first pass is the complete text story plus non-blocking media slots. Do not connect or embed the RBAC prototype. The portfolio is moving toward video, so the story must render completely before any image or video source is supplied.

Working card copy:

- Title: **Role-based access**
- Oneliner: **Twelve people held admin access. The product treated them like twelve equal kings.**
- Type: **PRODUCT DESIGN · 2026**
- Card tags: **PRODUCT · ACCESS**

## Story flow and draft copy

Use the exact narrative fields the other Swipey stories use. Keep each chapter to one strong statement rather than turning the case study into a permissions catalogue.

### Hero

`roleHeadline`

**Product design and prototyping for Swipey's access model. I defined the permissions, reporting-chain reach, safeguards, and connected admin flow, then built the prototype with AI agents.**

Do not imply production implementation, customer launch, or measured business impact.

### The gap

`problemHeadline`

**Swipey had one people-access permission. Give it to a department head and they could manage everyone, not just the people below them. The permission said what they could do. Nothing said whose access they could touch.**

`pullQuote`

**Twelve people holding access are twelve equal kings. That was the bug.**

### Research

`researchHeadline`

**The permissions already existed: twenty-five actions across seven product areas. The missing part was the boundary around them — who can invite, who can change access, and whose access they can change.**

No separate research brief or research artifact in the first pass.

### Decision

`challengeHeadline`

**A separate Roles page and location scope both looked tidy. Both modelled the company wrong. A role answers what someone can do. The reporting chain answers whose work they can reach.**

The discarded location-scope and permission-matrix directions may be mentioned in copy, but do not turn them into bespoke comparison artifacts.

### Process

`processHeadline`

**I started with one person's effective access, reused the same grant model for custom roles, invitations and overrides, then derived reach from who reports to whom. Every safeguard came from that same model.**

This chapter should name the ceiling rule plainly: nobody can grant or remove a permission they do not hold.

### The build

`solutionHeadline`

**One Users workspace for people, the org chart and custom roles — with effective access that reads before it edits, reachable branches that stay visible, and impact checks before anything consequential changes.**

Use the standard no-embed Solution chapter with `solutionKicker: "THE BUILD"`. Alfie suggestions remain reviewable diffs and never save automatically.

### Outcomes

`outcomesHeadline`

**A sixty-six-person test company could move through users, roles, delegation and AI-assisted changes without switching access models. Next I would test the boundaries with owners, finance leads and department heads.**

This is a prototype outcome, not a shipped-product result. Do not add invented metrics.

## Media direction

- The other three Swipey stories do not use research, decision, or process artifacts, so RBAC does not invent them.
- Leave the legacy artifact fields empty and do not use `swipey-rbac-system-map.html` as final media.
- Use the shared optional `editorialMedia` slots for future section images and videos.
- A media slot without `src` renders nothing; missing video can never block or break the story.
- Do not connect or embed the RBAC prototype.
- Treat a future video poster as part of the video asset, not as a separate editorial artifact.

## Implementation plan

### Phase 1 — Content and hub integration

- Add a hidden `swipey-rbac` entry to `content/site-content.json` using only the standard Swipey fields above.
- Add `swipey-rbac` to `SWIPEY_STORY_SLUGS` in `lib/site-content.ts`.
- Add `swipey-rbac: ['PRODUCT', 'ACCESS']` to `CARD_TAGS` in `components/SwipeyHubClient.tsx`.
- Change the hub lede from three case studies to four and include access in its summary.
- Keep the single top-level Swipey card on `/work`.

### Phase 2 — Non-blocking media

- Use shared `editorialMedia` entries for Research, Decision, Process, and Solution.
- Each entry accepts `image` or `video`; source, poster, caption, aspect ratio, fit, and background are optional.
- Keep every source empty until Pramit supplies the approved media.
- Do not add a prototype URL or create an RBAC-only renderer.

### Phase 3 — Verification and sign-off

- Validate the site-content schema and dashboard round-trip.
- Run typecheck and production build.
- Verify the fourth Swipey card and framed story behavior without performing visual sign-off on Pramit's behalf.
- Verify focus return, Escape, and frame scrolling.
- Verify an RBAC story with empty media sources renders without broken media or empty frames.
- Keep RBAC hidden until Pramit signs off visually.

## Acceptance criteria

- RBAC reads like the other Swipey stories: Gap, Research, Decision, Process, Build, Outcomes.
- The writing is direct, specific, and honest about prototype status.
- The distinction between permission, reporting-chain reach, and the actor's ceiling is understandable without implementation jargon.
- No bespoke RBAC artifact or prototype embed is created.
- RBAC image/video slots are optional and non-blocking.
- RBAC appears as the fourth card inside Swipey and nowhere as a duplicate top-level project.
- The story is complete and usable before any media source is supplied.
