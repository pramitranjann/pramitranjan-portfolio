# Case Study Image Layout — Design Spec

**Date:** 2026-03-26
**Status:** Approved (v4 — extended to cover mixed-media and branding case studies)

---

## Problem

Existing case studies have inconsistent image placement, sizing, and aspect ratios. Most `mediaBlocks` in `site-content.json` are `hidden: true` — images are not rendering in most sections. The dashboard has add/remove/reorder for media blocks but no templates and no drag-and-drop reordering.

---

## Sizing rules

**Standard layout (Research / Challenge / Process — side-right):**
- `placement: "side-right"`, `layout: "single"`
- `inlineTextWidth: "480px"`, `inlineMediaMinWidth: "240px"` — at ~800px content column produces approx. 60% text / 40% image
- Image: `aspectRatio: "4 / 3"`, `fit: "contain"`
- Do **not** set `width` on side-right blocks — the inline grid handles sizing via `inlineTextWidth`/`inlineMediaMinWidth`

**Standard layout (Solution hero — below):**
- `layout: "single"`, no `placement` (defaults to below)
- `width: "100%"`, `aspectRatio: "16 / 10"`, `fit: "contain"`

**Standard layout (Solution pair — below):**
- `layout: "pair"`, no `placement`, `width: "100%"`, `gap: "2px"`
- Each image: `aspectRatio: "4 / 3"`, `fit: "contain"`

**Mobile / App exception (Atom OS only):**
- Research: `side-right`, `aspectRatio: "3 / 4"` (portrait)
- Challenge: `below`, `pair`, `aspectRatio: "3 / 4"` each
- Solution hero: `below`, `single`, `16 / 10` (same as standard)
- Solution pair: `below`, `pair`, `aspectRatio: "3 / 4"` each

**`fit: "contain"` must be explicitly set** on all image objects — do not leave it undefined.

---

## Part 1 — Configure existing case studies

**Convention:** always use `-processed.png` paths. Legacy fields (`researchImage`, `challengeImages`, `solutionHeroImage`, `solutionImages`) are not removed — once a matching section has non-hidden explicit `mediaBlocks`, `deriveCaseStudyMediaBlocks` ignores the legacy fields for that section automatically.

---

### Franklin's

Currently `mediaBlocks: []`, no in-section images in `/public/work/franklins/`. Replace with 4 hidden Standard UX blocks (empty `src: ""`). These are placeholders — ready for image paths to be added from the dashboard.

Placeholder image shape (all 4 blocks): `{ "src": "", "fit": "contain", "aspectRatio": <per-block>, "background": "#0d0d0d", "alt": "" }`

```json
"mediaBlocks": [
  {
    "id": "franklins-research-1",
    "section": "research",
    "layout": "single",
    "placement": "side-right",
    "inlineTextWidth": "480px",
    "inlineMediaMinWidth": "240px",
    "align": "center",
    "hidden": true,
    "images": [{ "src": "", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "franklins-challenge-1",
    "section": "challenge",
    "layout": "single",
    "placement": "side-right",
    "inlineTextWidth": "480px",
    "inlineMediaMinWidth": "240px",
    "align": "center",
    "hidden": true,
    "images": [{ "src": "", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "franklins-solution-1",
    "section": "solution",
    "layout": "single",
    "width": "100%",
    "align": "center",
    "hidden": true,
    "images": [{ "src": "", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "franklins-solution-2",
    "section": "solution",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "hidden": true,
    "images": [
      { "src": "", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  }
]
```

---

### LoomLearn

Existing blocks: `research-1774467128401-vjt30f` (side-right, `ideation-1.png`, hidden), `loomlearn-challenge-1` (pair, below, 3/2, hidden), `loomlearn-solution-1` (single, 78%, 3/2, hidden).

**1. Update `research-1774467128401-vjt30f` in place:**
- Set `inlineTextWidth: "480px"`, `inlineMediaMinWidth: "240px"`
- Change `images[0].src` → `/work/loomlearn/ideation-1-processed.png`
- Set `images[0].aspectRatio: "4 / 3"`, `images[0].fit: "contain"`
- Remove `hidden: true`

**2. Replace `loomlearn-challenge-1` entirely** (was pair/below/3/2 — incompatible structure):
```json
{
  "id": "loomlearn-challenge-1",
  "section": "challenge",
  "layout": "single",
  "placement": "side-right",
  "inlineTextWidth": "480px",
  "inlineMediaMinWidth": "240px",
  "align": "center",
  "images": [{ "src": "/work/loomlearn/ideation-2-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }]
}
```

**3. Update `loomlearn-solution-1` in place:**
- Change `width` → `"100%"` (was `"78%"`)
- Change `images[0].aspectRatio` → `"16 / 10"` (was `"3 / 2"`)
- Set `images[0].fit: "contain"`
- Remove `hidden: true`

**4. Add new block `loomlearn-solution-2`** after `loomlearn-solution-1`:
```json
{
  "id": "loomlearn-solution-2",
  "section": "solution",
  "layout": "pair",
  "width": "100%",
  "gap": "2px",
  "align": "center",
  "images": [
    { "src": "/work/loomlearn/solution-1-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
    { "src": "/work/loomlearn/solution-2-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
  ]
}
```

Final order: `research-1774467128401-vjt30f`, `loomlearn-challenge-1`, `loomlearn-solution-1`, `loomlearn-solution-2`.

---

### HelpOH

Existing blocks: `helpoh-solution-1` (single, 100%, 16/10) and `helpoh-solution-2` (pair, 4/3) — both already match the spec. **Only change: remove `hidden: true` from both blocks.**

---

### Atom OS (Mobile / App exception)

**1. Update `atom-research-1` in place:**
- Remove `width: "72%"` — do not set `width` on side-right blocks; the renderer uses `block.width || '100%'` on the image container, which inside the inline grid column means 100% of the image column (correct behaviour)
- Add `inlineTextWidth: "480px"`, `inlineMediaMinWidth: "240px"`
- Change `images[0].aspectRatio` → `"3 / 4"`
- Set `images[0].fit: "contain"`, `images[0].src: "/work/atom/research-processed.png"`
- Remove `hidden: true`

**2. Update `atom-challenge-1` in place:**
- Change each `images[i].aspectRatio` → `"3 / 4"` (currently `"4 / 3"`)
- Set `images[i].fit: "contain"` on both
- No `placement` change needed — block has no `placement` field, which already defaults to `below` in the renderer
- Set `images[0].src: "/work/atom/ideation-1-processed.png"`, `images[1].src: "/work/atom/ideation-2-processed.png"`
- Remove `hidden: true`

**3. Update `atom-solution-1` in place:**
- Set `images[0].src: "/work/atom/solution-hero-processed.png"`, `images[0].fit: "contain"`
- Remove `hidden: true` only — `width: "100%"` and `aspectRatio: "16 / 10"` are already correct

**4. Update `atom-solution-2` in place:**
- Change each `images[i].aspectRatio` → `"3 / 4"` (currently `"4 / 3"`)
- Set `images[i].fit: "contain"` on both
- Set `images[0].src: "/work/atom/hero-2-processed.png"`, `images[1].src: "/work/atom/solution-2-processed.png"`
- Remove `hidden: true`

---

### Albers

No `mediaBlocks` key today. Albers has 7 images (`img-1-processed.png` through `img-7-processed.png`). All blocks go in the `solution` section.

**Note on legacy field collision:** Adding solution `mediaBlocks` means `deriveCaseStudyMediaBlocks` will mark `solution` as having explicit blocks, so `solutionHeroImage` and `solutionImages` legacy fields will no longer render. This is intentional — the explicit blocks replace them. Do not remove the legacy fields (not worth the JSON churn and they are harmless).

```json
"mediaBlocks": [
  {
    "id": "albers-solution-1",
    "section": "solution",
    "layout": "single",
    "width": "100%",
    "align": "center",
    "images": [{ "src": "/work/albers/img-1-processed.png", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "albers-solution-2",
    "section": "solution",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "images": [
      { "src": "/work/albers/img-2-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "/work/albers/img-3-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  },
  {
    "id": "albers-solution-3",
    "section": "solution",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "images": [
      { "src": "/work/albers/img-4-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "/work/albers/img-5-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  },
  {
    "id": "albers-solution-4",
    "section": "solution",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "images": [
      { "src": "/work/albers/img-6-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "/work/albers/img-7-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  }
]
```

---

## Part 2 — Template system

### New file: `lib/case-study-templates.ts`

```ts
import type { CaseStudyMediaBlock } from './site-content-schema'

export interface CaseStudyTemplate {
  id: string
  label: string
  description: string
  blocks: Omit<CaseStudyMediaBlock, 'id'>[]  // id generated fresh on apply; images include src: ""
}
```

### Template definitions

Helper image shape used throughout: `{ src: '', fit: 'contain' as const, background: '#0d0d0d', alt: '' }`

**`standard-ux`** — "Standard UX" / "Research-led work, desktop or responsive UI"
```ts
blocks: [
  { section: 'research',  layout: 'single', placement: 'side-right', inlineTextWidth: '480px', inlineMediaMinWidth: '240px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }] },
  { section: 'challenge', layout: 'single', placement: 'side-right', inlineTextWidth: '480px', inlineMediaMinWidth: '240px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }] },
  { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '16 / 10', background: '#0d0d0d', alt: '' }] },
  { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }, { src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }] },
]
```

**`mobile-app`** — "Mobile / App" / "Phone-first UI with portrait screens"
```ts
blocks: [
  { section: 'research',  layout: 'single', placement: 'side-right', inlineTextWidth: '480px', inlineMediaMinWidth: '240px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '3 / 4', background: '#0d0d0d', alt: '' }] },
  { section: 'challenge', layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '3 / 4', background: '#0d0d0d', alt: '' }, { src: '', fit: 'contain', aspectRatio: '3 / 4', background: '#0d0d0d', alt: '' }] },
  { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '16 / 10', background: '#0d0d0d', alt: '' }] },
  { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '3 / 4', background: '#0d0d0d', alt: '' }, { src: '', fit: 'contain', aspectRatio: '3 / 4', background: '#0d0d0d', alt: '' }] },
]
```

**`process-heavy`** — "Process-Heavy" / "Adds a dedicated process block for iteration rounds"
```ts
blocks: [
  { section: 'research',  layout: 'single', placement: 'side-right', inlineTextWidth: '480px', inlineMediaMinWidth: '240px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }] },
  { section: 'challenge', layout: 'single', placement: 'side-right', inlineTextWidth: '480px', inlineMediaMinWidth: '240px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }] },
  { section: 'process',   layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }, { src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }] },
  { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '16 / 10', background: '#0d0d0d', alt: '' }] },
  { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }, { src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }] },
]
```

**`visual-brand`** — "Visual / Brand" / "Branding and creative — full-width imagery throughout"
```ts
blocks: [
  { section: 'challenge', layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }, { src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }] },
  { section: 'process',   layout: 'single', width: '100%', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '16 / 10', background: '#0d0d0d', alt: '' }] },
  { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '16 / 10', background: '#0d0d0d', alt: '' }] },
  { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [{ src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }, { src: '', fit: 'contain', aspectRatio: '4 / 3', background: '#0d0d0d', alt: '' }] },
]
```

**`blank`** — "Blank" / "No pre-configured blocks — build from scratch"
```ts
blocks: []
```

### `applyTemplate` helper

ID strategy: same pattern as the existing `createMediaBlockDraft` in `DashboardEditor.tsx` — `${section}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`. This keeps IDs consistent with how manually-added blocks are named.

```ts
export function applyTemplate(templateId: string): CaseStudyMediaBlock[] {
  const template = CASE_STUDY_TEMPLATES.find(t => t.id === templateId)
  if (!template) return []
  return template.blocks.map(block => ({
    ...block,
    id: `${block.section}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }))
}
```

### Applying a template — new case study

The current `addCaseStudy(section)` immediately creates a draft and navigates. Change the sidebar "+ Add" button behavior:

**New state in `DashboardEditor`:**
```ts
const [pendingNewSection, setPendingNewSection] = useState<CaseStudySection | null>(null)
const [pendingTemplateId, setPendingTemplateId] = useState('standard-ux')
```

**When "+" is clicked:** set `pendingNewSection` instead of calling `addCaseStudy` immediately. This shows an inline panel in the sidebar (below the "+" button, above the list) with:
- Heading: "Choose a template"
- Radio cards for 5 templates (label + description, one line each)
- "Create →" button and "Cancel" link
- Default selection: `'standard-ux'`

**On "Create":** call `addCaseStudyWithTemplate(pendingNewSection, pendingTemplateId)`:
```ts
function addCaseStudyWithTemplate(section: CaseStudySection, templateId: string) {
  applyContentChange((current) => {
    const draft = createCaseStudyDraft(section, current.caseStudies)
    draft.mediaBlocks = applyTemplate(templateId)
    setActivePage(`case-study:${draft.slug}`)
    setPendingNewSection(null)
    const nextCaseStudies = [...current.caseStudies, draft]
    return { ...current, caseStudies: syncCaseStudySectionNavigation(nextCaseStudies, section) }
  })
}
```

**On "Cancel":** set `pendingNewSection(null)`, reset `pendingTemplateId` to `'standard-ux'`.

### Applying a template — existing case study

**New prop on `MediaBlockListEditor`:**
```ts
onReplaceAll: (blocks: CaseStudyMediaBlock[]) => void
```

In `DashboardEditor`, wire to the existing `updateMediaBlocks` helper (defined at line ~1915: `function updateMediaBlocks(nextBlocks) { onChange(current => ({ ...current, mediaBlocks: nextBlocks })) }`):
```ts
function replaceAllMediaBlocks(blocks: CaseStudyMediaBlock[]) {
  updateMediaBlocks(blocks)
}
```

Pass as `onReplaceAll={replaceAllMediaBlocks}` at the `MediaBlockListEditor` call site.

**Inside `MediaBlockListEditor`:** add local state:
```ts
const [showTemplatePicker, setShowTemplatePicker] = useState(false)
const [pickerTemplateId, setPickerTemplateId] = useState('standard-ux')
```

Add "Apply template…" button in the header row (alongside existing "+ Add block" button). Clicking sets `showTemplatePicker(true)`.

When `showTemplatePicker` is true, render an inline panel (not a modal — rendered as a `<div>` inside `MediaBlockListEditor`, above the block list) containing:
- Radio cards for all 5 templates
- Warning: "This will replace all current media blocks. Image paths will be cleared."
- "Cancel" button → `setShowTemplatePicker(false)`
- "Apply [label] →" button → call `onReplaceAll(applyTemplate(pickerTemplateId))`, then `setShowTemplatePicker(false)`

---

## Part 3 — Drag-and-drop reordering

### New utility: `moveItemTo`

Add alongside the existing `moveItem`. Do **not** modify `moveItem` — it is used in other places.

`toIndex` convention: **the drop zone index**, where N blocks have N+1 drop zones numbered 0..N. Drop zone `i` means "place the dragged item at position `i` in the final array." The implementation clamps `toIndex` to `arr.length - 1` so drop zone N (after last item) works without going out of bounds.

```ts
function moveItemTo<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const clampedTo = Math.min(toIndex, arr.length - 1)
  if (fromIndex === clampedTo) return arr
  const result = [...arr]
  const [item] = result.splice(fromIndex, 1)
  result.splice(clampedTo, 0, item)
  return result
}
```

The drop handler passes the drop zone index directly as `toIndex`:
```ts
onDrop={() => {
  if (dragFromIndex !== null) onMove(blocks[dragFromIndex].id, dropZoneIndex)
  // clear state
}}
```

### `onMove` signature change

Change in three places:

**`MediaBlockListEditor` prop:** `onMove: (blockId: string, toIndex: number) => void`

**`MediaBlockEditor` prop:** `onMove: (toIndex: number) => void`

**Bridge call inside `MediaBlockListEditor`** (where it maps blocks to `<MediaBlockEditor>`):
```tsx
// Before:
onMove={(direction) => onMove(block.id, direction)}
// After:
onMove={(toIndex) => onMove(block.id, toIndex)}
```

**Up/down arrow buttons inside `MediaBlockEditor`** (the `ReorderButtons` or equivalent):
- Must receive `currentIndex: number` as a prop (passed from `MediaBlockListEditor` via `blocks.findIndex`)
- Up arrow calls `onMove(currentIndex - 1)`
- Down arrow calls `onMove(currentIndex + 1)`

**`moveMediaBlock` in `DashboardEditor`:**
```ts
function moveMediaBlock(blockId: string, toIndex: number) {
  const fromIndex = mediaBlocks.findIndex(b => b.id === blockId)
  if (fromIndex === -1 || toIndex < 0 || toIndex >= mediaBlocks.length) return
  updateMediaBlocks(moveItemTo(mediaBlocks, fromIndex, toIndex))
}
```

### Drag-and-drop in `MediaBlockListEditor`

Scope: desktop only. No touch/pointer event fallback required.

**State:**
```ts
const [dragFromIndex, setDragFromIndex] = useState<number | null>(null)
const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
```

**DOM structure per block row:**
```tsx
<div key={block.id}>
  {/* Drop zone ABOVE this block */}
  <div
    className="drop-zone"
    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
    onDrop={() => {
      if (dragFromIndex !== null && dragFromIndex !== index) {
        onMove(blocks[dragFromIndex].id, index)
      }
      setDragFromIndex(null); setDragOverIndex(null)
    }}
    style={{ height: '6px', position: 'relative' }}
  >
    {/* Red insertion line when this is the active drop target */}
    {dragOverIndex === index && (
      <div style={{ position: 'absolute', left: 0, right: 0, top: '2px', height: '2px', background: '#FF3120' }} />
    )}
  </div>

  {/* The block row itself */}
  <div
    draggable
    onDragStart={() => setDragFromIndex(index)}
    onDragEnd={() => { setDragFromIndex(null); setDragOverIndex(null) }}
    style={{ opacity: dragFromIndex === index ? 0.4 : 1, borderStyle: dragFromIndex === index ? 'dashed' : 'solid' }}
  >
    {/* Drag handle at left */}
    <div style={{ cursor: 'grab', padding: '4px 6px' }} onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}>
      ⠿ {/* or SVG dot grid */}
    </div>
    {/* existing block content */}
    <MediaBlockEditor ... />
  </div>
</div>
```

Also render a final drop zone after the last block to allow dropping at the end.

Up/down arrow buttons stay — they remain as the accessible fallback and are not removed.

---

## Files affected

| File | Change |
|---|---|
| `content/site-content.json` | Update/add `mediaBlocks` for Franklin's, LoomLearn, HelpOH, Atom OS, Albers, South China Sea, Faces of Power, Soho, Oracle |
| `lib/case-study-templates.ts` | New file — 5 templates + `applyTemplate` |
| `components/admin/DashboardEditor.tsx` | `moveItemTo` utility; `moveMediaBlock` signature; `replaceAllMediaBlocks`; `pendingNewSection`/`pendingTemplateId` state; `addCaseStudyWithTemplate`; `MediaBlockListEditor`/`MediaBlockEditor` prop type changes; drag-and-drop; "Apply template…" inline panel |

---

## Part 1 (continued) — Mixed-media and branding case studies

**Pattern for both sections:** Research side-right (as per user decision), all other sections full-width below. This matches the Process-Heavy template structure.

**Note on unprocessed ideation images:** Both South China Sea and Faces of Power have `ideation-1.png` / `ideation-2.png` without processed counterparts. These are set `hidden: true` until processed versions are created. All other images use `-processed.png` variants.

---

### South China Sea (mixed-media)

Existing blocks: `south-china-sea-research-1` (single, below, 3/2, hidden), `south-china-sea-challenge-1` (pair, below, 4/3, hidden), `south-china-sea-solution-1` (single, side-right, 4/5, hidden), `process-1774473786169-k7n9r0` (pair, below, 4/3, hidden).

**1. Update `south-china-sea-research-1` in place:**
- Add `placement: "side-right"`, `inlineTextWidth: "480px"`, `inlineMediaMinWidth: "240px"`
- Change `aspectRatio` → `"4 / 3"` (was `"3 / 2"`)
- Set `fit: "contain"`, `src: "/creative/mixed-media/south-china-sea/research-processed.png"`
- Remove `hidden: true`

**2. Update `south-china-sea-challenge-1` in place:**
- Set `fit: "contain"` on both images
- `images[0].src`: `/creative/mixed-media/south-china-sea/ideation-1.png` (unprocessed — no `-processed` version exists)
- `images[1].src`: `/creative/mixed-media/south-china-sea/ideation-2.png` (unprocessed)
- Keep `hidden: true` until processed versions exist

**3. Replace `south-china-sea-solution-1`** (was side-right / 4/5 — wrong placement and ratio):
```json
{
  "id": "south-china-sea-solution-1",
  "section": "solution",
  "layout": "single",
  "width": "100%",
  "align": "center",
  "images": [{ "src": "/creative/mixed-media/south-china-sea/solution-hero-processed.png", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
}
```

**4. Update `process-1774473786169-k7n9r0` in place:**
- Set `fit: "contain"` on both images
- `images[0].src`: `/creative/mixed-media/south-china-sea/solution-2-processed.png`
- `images[1].src`: `/creative/mixed-media/south-china-sea/solution-1-processed.png`
- Remove `hidden: true`

**5. Add `south-china-sea-solution-2`** after `south-china-sea-solution-1`:
```json
{
  "id": "south-china-sea-solution-2",
  "section": "solution",
  "layout": "pair",
  "width": "100%",
  "gap": "2px",
  "align": "center",
  "images": [
    { "src": "/creative/mixed-media/south-china-sea/solution-1-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
    { "src": "/creative/mixed-media/south-china-sea/solution-2-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
  ]
}
```

Final block order: `south-china-sea-research-1`, `south-china-sea-challenge-1`, process block, `south-china-sea-solution-1`, `south-china-sea-solution-2`.

---

### Faces of Power (mixed-media)

No existing blocks. Add from scratch.

Note: `ideation-1.png` and `ideation-2.png` have no processed counterparts — challenge block is `hidden: true` until they are processed.

```json
"mediaBlocks": [
  {
    "id": "faces-of-power-research-1",
    "section": "research",
    "layout": "single",
    "placement": "side-right",
    "inlineTextWidth": "480px",
    "inlineMediaMinWidth": "240px",
    "align": "center",
    "images": [{ "src": "/creative/mixed-media/faces-of-power/research-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "faces-of-power-challenge-1",
    "section": "challenge",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "hidden": true,
    "images": [
      { "src": "/creative/mixed-media/faces-of-power/ideation-1.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "/creative/mixed-media/faces-of-power/ideation-2.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  },
  {
    "id": "faces-of-power-solution-1",
    "section": "solution",
    "layout": "single",
    "width": "100%",
    "align": "center",
    "images": [{ "src": "/creative/mixed-media/faces-of-power/solution-hero-processed.png", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "faces-of-power-solution-2",
    "section": "solution",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "images": [
      { "src": "/creative/mixed-media/faces-of-power/solution-1-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "/creative/mixed-media/faces-of-power/solution-2-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  }
]
```

---

### Soho (branding)

No existing blocks. Has: `research-processed.png`, `hero-processed.png`, `solution-hero-processed.png`, `solution-1-processed.png`. No challenge-specific images exist — skip challenge block.

```json
"mediaBlocks": [
  {
    "id": "soho-research-1",
    "section": "research",
    "layout": "single",
    "placement": "side-right",
    "inlineTextWidth": "480px",
    "inlineMediaMinWidth": "240px",
    "align": "center",
    "images": [{ "src": "/creative/branding/soho/research-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "soho-solution-1",
    "section": "solution",
    "layout": "single",
    "width": "100%",
    "align": "center",
    "images": [{ "src": "/creative/branding/soho/solution-hero-processed.png", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "soho-solution-2",
    "section": "solution",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "images": [
      { "src": "/creative/branding/soho/solution-1-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "/creative/branding/soho/hero-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  }
]
```

---

### Oracle (branding)

No existing blocks, no images in `/public/creative/branding/oracle/`. Pre-fill with hidden Visual/Brand template blocks (empty `src`) so the structure is ready when images are added.

```json
"mediaBlocks": [
  {
    "id": "oracle-challenge-1",
    "section": "challenge",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "hidden": true,
    "images": [
      { "src": "", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  },
  {
    "id": "oracle-process-1",
    "section": "process",
    "layout": "single",
    "width": "100%",
    "align": "center",
    "hidden": true,
    "images": [{ "src": "", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "oracle-solution-1",
    "section": "solution",
    "layout": "single",
    "width": "100%",
    "align": "center",
    "hidden": true,
    "images": [{ "src": "", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "oracle-solution-2",
    "section": "solution",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "hidden": true,
    "images": [
      { "src": "", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  }
]
```

---

### Updated files affected

| File | Change |
|---|---|
| `content/site-content.json` | Update/add `mediaBlocks` for **9 case studies**: Franklin's, LoomLearn, HelpOH, Atom OS, Albers, South China Sea, Faces of Power, Soho, Oracle |
| `lib/case-study-templates.ts` | New file (unchanged from above) |
| `components/admin/DashboardEditor.tsx` | All changes unchanged from above |

---

## Out of scope

- Full-bleed images breaking outside the content column (Approach C — deferred)
- Template editing via the dashboard (templates are hardcoded)
- Undo/redo for template application
- Touch/pointer drag-and-drop (dashboard is desktop-only)
- Drag-and-drop for images within a block
