# Case-study media workflow

## The pattern

Use one repeatable media rhythm for product case studies:

1. **Research:** one source-rendered still.
2. **Decision:** one source-rendered still.
3. **Process:** one source-rendered still, when the story has a state worth reading at rest.
4. **Solution:** one video carousel containing three clips when possible, four maximum.

How many screens each still holds depends on the source viewport:

- **Phone prototypes** (390×844): four screens tiled into one landscape PNG. Four phones across a 1120px canvas render at ~1.4× native, so the UI reads larger than life. Swipey Admin is the reference.
- **Desktop prototypes** (1440px+): one screen per still, never tiled. Four desktop screens across the same canvas render at ~25% linear scale and the body copy lands around 3px tall. Custom Fields is the reference.

The stills make the story scannable. The final carousel proves the interactions without making several videos compete for attention. This is not a mixed-media carousel: images carry evidence through the story; videos collect at the end. Every shared carousel ships inside the live iframe treatment: a one-pixel red edge, 12px dark inset, then the media.

Swipey Admin is the reference for phone prototypes, Custom Fields for desktop ones.

## Rollout order

| Order | Story | Migration |
| --- | --- | --- |
| 1 | Swipey Admin | Reference; media pattern is already wired. |
| 2 | Custom Fields | Done 2026-08-31. Three desktop stills across Research, Decision and Process; the four existing clips regrouped into one Solution carousel. |
| 3 | Role-based access | Done 2026-08-31. Three desktop stills across Research, Decision and Process; the three existing clips regrouped into one Solution carousel. |
| — | Get Started | Excluded. Hide it from the live surface and do no media work. |
| 4 | Albers | Done 2026-09-01. Research uses three isolated sidebar components in one source-rendered plate, Decision uses the matching full-canvas Colour Harmonies output, and three clips form the Live carousel. |
| 5 | Wander | Replace the live Solution embed with the shared media pattern. |
| 6 | Franklins | Replace the bespoke Solution gallery with the shared media pattern. |

Do not start the next story until the current story's screen and clip choices are approved.

## Lean operating loop

### 1. Make the media plan first

Before rendering anything, write one small table:

| Asset | Content |
| --- | --- |
| Research still | The system or starting point |
| Decision still | The important workflow decision |
| Process still | A state worth reading at rest, if the story has one |
| Solution clips | Three complete interactions; use four only when each proves something distinct |

Choose media by narrative meaning, not recording order. Do not render every available screen.

Render from the same fixture the clips were recorded against. RBAC's clips use its `?org=stress` roster; rendering the default roster produced stills whose people did not match the carousel below them, which reads as two different companies in one story. Check the existing clips and cover before choosing the fixture.

Some prototypes will not render from `file://` — Babel Standalone fetches its `.jsx` over XHR and CORS blocks it, so the app never mounts. Serve the directory over HTTP (`python3 -m http.server`) and load `localhost`.

Read the prototype before planning the stills. Confirm each state you intend to shoot actually exists and holds the content the story claims — a demo often asserts data it never authored. Custom Fields' nudge says "projects in the notes of 14 transactions", but `note` initialises to `""` on every row, so no note copy exists to photograph. Cut the still; never type content in for the camera.

A clip earns its place by the claim it makes, not by whether it looks like a shipped interaction. Where four clips all earn their place, the cost is rotation length, so fix the order rather than subtract: put the payoff second, not last.

### 2. Render stills directly from source

- Render the live/source HTML headlessly at a measured viewport and a high device scale.
- Measure the viewport, do not assume it. Take the smallest 16:9 width at which the source stops clipping, and re-measure in the *busiest* state — Custom Fields fits at 1960 until the new column lands, then needs 2200. Assert `scrollWidth - clientWidth === 0` per shot so a clipped frame cannot pass silently.
- Never lift stills from an MP4; that bakes compression into the PNG.
- Remove prototype-grey or browser-generated padding before export.
- Tiled phone screens sit on the portfolio background, `#0d0d0d`. A single desktop screen needs no surround; it fills its frame edge to edge.
- Export lossless PNGs with no captions or labels baked into the image.
- Keep the individual source renders in `public/work/<slug>/source-screens/` only when they will be reused.

Render headlessly, in one script, once the screen list is agreed. The rule is that the agent must not iterate one command per screen in chat — it is not a requirement that a human do the clicking, and most prototype states are a single scripted click. Never drive a headed browser for this: it cannot exceed the physical display, so a requested 2200px window silently renders at ~1800px, overflows, and pushes the prototype's own controls off-frame, which reads as a prototype bug rather than a viewport one. Keep Playwright in a scratchpad, not in `package.json`; it is a capture tool, not a build dependency.

### 3. Produce the clips once

- Prefer direct recordings at native resolution.
- If a master recording exists, keep it outside `public/` and cut from the master each time.
- Trim to the complete interaction with no idle lead-in or tail.
- Remove audio, preserve aspect ratio, use H.264 and `yuv420p`, and enable fast start.
- Do not upscale and do not bake landscape side panels around portrait recordings.
- Use short action labels such as `ISSUE CARD`; the site renders those labels in the design system.

Target three clips. A fourth clip must demonstrate a different decision, not another state of the same interaction.

### 4. Use predictable files

```text
public/work/<slug>/
  research-<subject>.png
  decision-<subject>.png
  process-<subject>.png     # desktop stories, when earned
  <action-one>.mp4
  <action-two>.mp4
  <action-three>.mp4
  source-screens/        # optional
```

Names describe the narrative or action, not export numbers.

### 5. Wire content, not bespoke pages

Add the image items and the labelled Solution videos to `caseStudies[].editorialMedia` in `content/site-content.json`. Only `research`, `decision`, `process` and `solution` are valid sections; multiple images in one section stack vertically.

```json
[
  {
    "id": "<slug>-research-media",
    "section": "research",
    "kind": "image",
    "src": "/work/<slug>/research-<subject>.png",
    "alt": "<what the screen shows>",
    "aspectRatio": "<rendered viewport, e.g. 2200 / 1238>",
    "fit": "cover",
    "background": "<the source's own canvas colour>"
  },
  {
    "id": "<slug>-decision-media",
    "section": "decision",
    "kind": "image",
    "src": "/work/<slug>/decision-<subject>.png",
    "alt": "<what the screen shows>",
    "aspectRatio": "<rendered viewport, e.g. 2200 / 1238>",
    "fit": "cover",
    "background": "<the source's own canvas colour>"
  },
  {
    "id": "<slug>-solution-<action>",
    "section": "solution",
    "kind": "video",
    "src": "/work/<slug>/<action>.mp4",
    "carouselLabel": "<ACTION>",
    "alt": "<complete interaction shown>",
    "aspectRatio": "<the clip's own ratio: 9 / 16 phone, 16 / 9 desktop>",
    "fit": "cover",
    "background": "#0d0d0d"
  }
]
```

Repeat the final object for each clip. Multiple labelled videos in the same section become one carousel automatically.

The shared carousel fills the editorial media shell on every case study; it must not derive its width from viewport height or introduce a story-specific max-width. It reads each clip's aspect ratio through `--slide-aspect` (default `9 / 16`), so landscape and portrait media both work; done 2026-08-31. Do not create Albers-, Wander-, or Franklins-specific carousel components.

The carousel has no arrow buttons and its labelled tabs always sit on one row, whatever the clip count — `grid-auto-flow: column` with `minmax(0, 1fr)` columns, labels ellipsised rather than wrapped. This applies to every case study unless Pramit says otherwise.

## Existing exceptions to remove during migration

- **Albers:** migrated. Its Solution media takes precedence over `solutionEmbedUrl`; the URL remains only as an external `OPEN LIVE APP` link, and the chapter remains labelled Live.
- **Wander:** `solutionEmbedUrl` currently replaces the whole Solution chapter. Remove it when its carousel assets are ready; do not show an embed and carousel together.
- **Franklins:** its route passes `gallery`, which replaces normal Solution media with `FranklinsRedesignGallery`. Remove that opt-in when the shared assets are ready.
- **Get Started:** leave its embed untouched while hidden; it is outside this rollout.

## Verification boundary

Run checks once after a story is fully wired, not after every asset:

1. `ffprobe` every new MP4 for dimensions, duration, codec, pixel format, and file size.
2. Parse `content/site-content.json`.
3. Run `git diff --check` and `npx tsc --noEmit`.
4. Run one production build before the story is promoted.
5. Pramit performs visual acceptance. Do not add headless screenshots or unrelated test loops.

## Definition of done

- Approved source-rendered stills: two for a phone story, two or three for a desktop one.
- Three distinct clips, or a justified fourth.
- One shared carousel; no story-specific implementation.
- No compressed frame grabs, baked side panels, or duplicate live embed.
- Labelled tabs on one row, automatic rotation, pause/play, reduced-motion handling, and touch swipe still work.
- Static checks and the production build pass; visual approval remains explicit.
