# Case Study Image Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure image layouts for all 9 case studies, add a 5-template system to the dashboard, and replace up/down arrow reordering with drag-and-drop.

**Architecture:** Three independent layers — (1) JSON data changes in `site-content.json` for immediate visual impact, (2) a new `lib/case-study-templates.ts` providing template definitions and an apply helper, (3) UI changes in `DashboardEditor.tsx` wiring templates into new case study creation, existing case study editing, and drag-and-drop block reordering.

**Tech Stack:** Next.js, TypeScript, React, no test framework — verification via `npx tsc --noEmit` (type checking) and visual inspection at `localhost:3000`.

**Spec:** `docs/superpowers/specs/2026-03-26-case-study-image-layout-design.md`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `content/site-content.json` | Modify | Update/add `mediaBlocks` for 9 case studies |
| `lib/case-study-templates.ts` | Create | 5 template definitions + `applyTemplate` helper |
| `components/admin/DashboardEditor.tsx` | Modify | `moveItemTo`, `moveMediaBlock`, template pickers, drag-and-drop |

---

## Task 1: Configure work case studies

**Files:**
- Modify: `content/site-content.json`

- [ ] **Step 1: Update Franklin's `mediaBlocks`**

Find the Franklin's entry in `caseStudies` (search for `"slug": "franklins"`). Replace its `"mediaBlocks": []` with:

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

- [ ] **Step 2: Update LoomLearn `mediaBlocks`**

Find `"slug": "loomlearn"`. The entry already has 3 blocks. Replace the entire `mediaBlocks` array with:

```json
"mediaBlocks": [
  {
    "id": "research-1774467128401-vjt30f",
    "section": "research",
    "layout": "single",
    "placement": "side-right",
    "inlineTextWidth": "480px",
    "inlineMediaMinWidth": "240px",
    "align": "center",
    "images": [{ "src": "/work/loomlearn/ideation-1-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "loomlearn-challenge-1",
    "section": "challenge",
    "layout": "single",
    "placement": "side-right",
    "inlineTextWidth": "480px",
    "inlineMediaMinWidth": "240px",
    "align": "center",
    "images": [{ "src": "/work/loomlearn/ideation-2-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "loomlearn-solution-1",
    "section": "solution",
    "layout": "single",
    "width": "100%",
    "align": "center",
    "images": [{ "src": "/work/loomlearn/solution-hero-processed.png", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
  },
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
]
```

- [ ] **Step 3: Update HelpOH — unhide existing blocks**

Find `"slug": "helpoh"`. Two blocks exist: `helpoh-solution-1` and `helpoh-solution-2`. Both already have correct width/aspectRatio. Only remove `"hidden": true` from both.

- [ ] **Step 4: Update Atom OS `mediaBlocks`**

Find `"slug": "atom"`. Replace the entire `mediaBlocks` array with:

```json
"mediaBlocks": [
  {
    "id": "atom-research-1",
    "section": "research",
    "layout": "single",
    "placement": "side-right",
    "inlineTextWidth": "480px",
    "inlineMediaMinWidth": "240px",
    "align": "center",
    "images": [{ "src": "/work/atom/research-processed.png", "fit": "contain", "aspectRatio": "3 / 4", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "atom-challenge-1",
    "section": "challenge",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "images": [
      { "src": "/work/atom/ideation-1-processed.png", "fit": "contain", "aspectRatio": "3 / 4", "background": "#0d0d0d", "alt": "" },
      { "src": "/work/atom/ideation-2-processed.png", "fit": "contain", "aspectRatio": "3 / 4", "background": "#0d0d0d", "alt": "" }
    ]
  },
  {
    "id": "atom-solution-1",
    "section": "solution",
    "layout": "single",
    "width": "100%",
    "align": "center",
    "images": [{ "src": "/work/atom/solution-hero-processed.png", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "atom-solution-2",
    "section": "solution",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "images": [
      { "src": "/work/atom/hero-2-processed.png", "fit": "contain", "aspectRatio": "3 / 4", "background": "#0d0d0d", "alt": "" },
      { "src": "/work/atom/solution-2-processed.png", "fit": "contain", "aspectRatio": "3 / 4", "background": "#0d0d0d", "alt": "" }
    ]
  }
]
```

- [ ] **Step 5: Update Albers — add `mediaBlocks`**

Find `"slug": "albers"`. The entry has no `mediaBlocks` key. Add after the last existing field:

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

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npm run dev
```

Visit `/work/loomlearn`, `/work/helpoh`, `/work/atom`, `/work/albers`. Confirm:
- LoomLearn: research image inline left/right, challenge image inline, solution hero full-width + pair below
- HelpOH: solution hero full-width + pair below
- Atom OS: research portrait inline, challenge portrait pair full-width, solution hero + portrait pair
- Albers: solution section shows 1 hero + 3 pairs
- Franklin's: no images visible (all hidden — correct)

- [ ] **Step 7: Commit**

```bash
git add content/site-content.json
git commit -m "feat: configure image layout for work case studies"
```

---

## Task 2: Configure creative case studies

**Files:**
- Modify: `content/site-content.json`

- [ ] **Step 1: Update South China Sea `mediaBlocks`**

Find `"slug": "south-china-sea"`. Replace the entire `mediaBlocks` array with:

```json
"mediaBlocks": [
  {
    "id": "south-china-sea-research-1",
    "section": "research",
    "layout": "single",
    "placement": "side-right",
    "inlineTextWidth": "480px",
    "inlineMediaMinWidth": "240px",
    "align": "center",
    "images": [{ "src": "/creative/mixed-media/south-china-sea/research-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }]
  },
  {
    "id": "south-china-sea-challenge-1",
    "section": "challenge",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "hidden": true,
    "images": [
      { "src": "/creative/mixed-media/south-china-sea/ideation-1.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "/creative/mixed-media/south-china-sea/ideation-2.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  },
  {
    "id": "process-1774473786169-k7n9r0",
    "section": "process",
    "layout": "pair",
    "width": "100%",
    "gap": "2px",
    "align": "center",
    "images": [
      { "src": "/creative/mixed-media/south-china-sea/solution-2-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" },
      { "src": "/creative/mixed-media/south-china-sea/solution-1-processed.png", "fit": "contain", "aspectRatio": "4 / 3", "background": "#0d0d0d", "alt": "" }
    ]
  },
  {
    "id": "south-china-sea-solution-1",
    "section": "solution",
    "layout": "single",
    "width": "100%",
    "align": "center",
    "images": [{ "src": "/creative/mixed-media/south-china-sea/solution-hero-processed.png", "fit": "contain", "aspectRatio": "16 / 10", "background": "#0d0d0d", "alt": "" }]
  },
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
]
```

- [ ] **Step 2: Add Faces of Power `mediaBlocks`**

Find `"slug": "faces-of-power"`. The entry has no `mediaBlocks` key at all — add the key and value after the last existing field:

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

- [ ] **Step 3: Add Soho `mediaBlocks`**

Find `"slug": "soho"`. The entry has no `mediaBlocks` key. Add:

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

- [ ] **Step 4: Add Oracle `mediaBlocks`**

Find `"slug": "oracle"`. The entry has no `mediaBlocks` key. Add placeholder hidden blocks:

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

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
npm run dev
```

Visit `/creative/mixed-media/south-china-sea`, `/creative/mixed-media/faces-of-power`, `/creative/branding/soho`. Confirm:
- South China Sea: research inline, process pair full-width, solution hero + pair
- Faces of Power: research inline, solution hero + pair (challenge hidden — correct)
- Soho: research inline, solution hero + pair

- [ ] **Step 6: Commit**

```bash
git add content/site-content.json
git commit -m "feat: configure image layout for creative case studies"
```

---

## Task 3: Create template definitions

**Files:**
- Create: `lib/case-study-templates.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/case-study-templates.ts
import type { CaseStudyMediaBlock } from './site-content-schema'

export interface CaseStudyTemplate {
  id: string
  label: string
  description: string
  // id is generated fresh on apply; images include aspectRatio/fit but src is always ""
  blocks: Omit<CaseStudyMediaBlock, 'id'>[]
}

// Shared image placeholder shape
function img(aspectRatio: string): CaseStudyMediaBlock['images'][number] {
  return { src: '', fit: 'contain', aspectRatio, background: '#0d0d0d', alt: '' }
}

// Shared inline block settings (60/40 text/image split)
const inlineSettings = {
  layout: 'single' as const,
  placement: 'side-right' as const,
  inlineTextWidth: '480px',
  inlineMediaMinWidth: '240px',
  align: 'center' as const,
  hidden: true as const,
}

export const CASE_STUDY_TEMPLATES: CaseStudyTemplate[] = [
  {
    id: 'standard-ux',
    label: 'Standard UX',
    description: 'Research-led work, desktop or responsive UI',
    blocks: [
      { section: 'research',  ...inlineSettings, images: [img('4 / 3')] },
      { section: 'challenge', ...inlineSettings, images: [img('4 / 3')] },
      { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
    ],
  },
  {
    id: 'mobile-app',
    label: 'Mobile / App',
    description: 'Phone-first UI with portrait screens',
    blocks: [
      { section: 'research',  ...inlineSettings, images: [img('3 / 4')] },
      { section: 'challenge', layout: 'pair', width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('3 / 4'), img('3 / 4')] },
      { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('3 / 4'), img('3 / 4')] },
    ],
  },
  {
    id: 'process-heavy',
    label: 'Process-Heavy',
    description: 'Adds a dedicated process block for iteration rounds',
    blocks: [
      { section: 'research',  ...inlineSettings, images: [img('4 / 3')] },
      { section: 'challenge', ...inlineSettings, images: [img('4 / 3')] },
      { section: 'process',   layout: 'pair', width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
      { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
    ],
  },
  {
    id: 'visual-brand',
    label: 'Visual / Brand',
    description: 'Branding and creative — full-width imagery throughout',
    blocks: [
      { section: 'challenge', layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
      { section: 'process',   layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
    ],
  },
  {
    id: 'blank',
    label: 'Blank',
    description: 'No pre-configured blocks — build from scratch',
    blocks: [],
  },
]

export function applyTemplate(templateId: string): CaseStudyMediaBlock[] {
  const template = CASE_STUDY_TEMPLATES.find((t) => t.id === templateId)
  if (!template) return []
  return template.blocks.map((block) => ({
    ...block,
    id: `${block.section}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }))
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/case-study-templates.ts
git commit -m "feat: add case study template definitions"
```

---

## Task 4: Add `moveItemTo` and update `moveMediaBlock`

**Files:**
- Modify: `components/admin/DashboardEditor.tsx`

This task changes the `moveMediaBlock` function to accept an absolute target index instead of a direction. `ReorderButtons` and all other usages of `moveItem` are **not** changed — only the media block path is updated. The conversion from direction to absolute index happens at the bridge call in `MediaBlockListEditor`.

- [ ] **Step 1: Add `moveItemTo` utility after `moveItem` (line ~356)**

After the closing brace of `moveItem` (around line 356), add:

```typescript
function moveItemTo<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const clampedTo = Math.min(toIndex, items.length - 1)
  if (fromIndex === clampedTo) return items
  const nextItems = [...items]
  const [item] = nextItems.splice(fromIndex, 1)
  nextItems.splice(clampedTo, 0, item)
  return nextItems
}
```

- [ ] **Step 2: Update `moveMediaBlock` (line ~1974)**

Change:
```typescript
function moveMediaBlock(blockId: string, direction: -1 | 1) {
  const index = mediaBlocks.findIndex((block) => block.id === blockId)
  if (index === -1) return
  updateMediaBlocks(moveItem(mediaBlocks, index, direction))
}
```

To:
```typescript
function moveMediaBlock(blockId: string, toIndex: number) {
  const fromIndex = mediaBlocks.findIndex((block) => block.id === blockId)
  if (fromIndex === -1 || toIndex < 0 || toIndex > mediaBlocks.length) return
  updateMediaBlocks(moveItemTo(mediaBlocks, fromIndex, toIndex))
}
```

- [ ] **Step 3: Update `MediaBlockListEditor` prop type AND bridge call together (lines ~2463, ~2495)**

> **Note:** Apply Steps 3 and 4 before running `tsc`. After Step 3 changes the type to `toIndex: number`, TypeScript will still accept the old `direction` value (since `-1|1` satisfies `number`) — no error until runtime. Apply both edits atomically to avoid a silent type gap.

Change the prop type at line ~2463:
```typescript
onMove: (blockId: string, direction: -1 | 1) => void
```
To:
```typescript
onMove: (blockId: string, toIndex: number) => void
```

- [ ] **Step 4: Update the bridge call in `MediaBlockListEditor` (line ~2495)**

Change:
```typescript
onMove={(direction) => onMove(block.id, direction)}
```
To:
```typescript
onMove={(direction) => onMove(block.id, index + direction)}
```

This converts the `+1` / `-1` direction from `ReorderButtons` into an absolute index. `MediaBlockEditor.onMove` type (`(direction: -1|1) => void`) and `ReorderButtons` are **not** changed.

- [ ] **Step 5: Verify**

> **Note:** This step validates all of Steps 1–4 together. Do NOT run `tsc` between individual steps — the type change in Step 3 and the bridge update in Step 4 must both be applied before TypeScript will see the correct types.

```bash
npx tsc --noEmit
npm run dev
```

Open the dashboard, navigate to any case study, and click MOVE UP / MOVE DOWN on a media block. Confirm blocks reorder correctly.

- [ ] **Step 6: Commit**

```bash
git add components/admin/DashboardEditor.tsx
git commit -m "refactor: moveMediaBlock uses absolute index via moveItemTo"
```

---

## Task 5: Template picker for new case study creation

**Files:**
- Modify: `components/admin/DashboardEditor.tsx`

The current `addCaseStudy(section)` immediately creates a draft and navigates. This task intercepts that with a pending state that shows an inline template picker panel in the sidebar before creation.

- [ ] **Step 1: Import `applyTemplate` and `CASE_STUDY_TEMPLATES` at the top of the file**

Add to the existing imports at the top:
```typescript
import { applyTemplate, CASE_STUDY_TEMPLATES } from '@/lib/case-study-templates'
```

- [ ] **Step 2: Add pending state in `DashboardEditor` component**

In the component body near the other `useState` declarations (around line ~615), add:
```typescript
const [pendingNewSection, setPendingNewSection] = useState<CaseStudySection | null>(null)
const [pendingTemplateId, setPendingTemplateId] = useState('standard-ux')
```

- [ ] **Step 3: Add `addCaseStudyWithTemplate` function**

Add after the existing `addCaseStudy` function (around line ~716):
```typescript
function addCaseStudyWithTemplate(section: CaseStudySection, templateId: string) {
  applyContentChange((current) => {
    const draft = createCaseStudyDraft(section, current.caseStudies)
    const nextCaseStudies = [...current.caseStudies, {
      ...draft,
      mediaBlocks: applyTemplate(templateId),
    }]
    setActivePage(`case-study:${draft.slug}`)
    setPendingNewSection(null)
    setPendingTemplateId('standard-ux')
    return { ...current, caseStudies: syncCaseStudySectionNavigation(nextCaseStudies, section) }
  })
}
```

- [ ] **Step 4: Update sidebar "+" buttons to set pending state instead of calling `addCaseStudy`**

Find the three sidebar buttons (around lines 979, 994, 1009):
```tsx
<SidebarButton active={false} label="+ Add Work Case Study" onClick={() => addCaseStudy('work')} />
<SidebarButton active={false} label="+ Add Mixed Media" onClick={() => addCaseStudy('mixed-media')} />
<SidebarButton active={false} label="+ Add Branding" onClick={() => addCaseStudy('branding')} />
```

Change each `onClick` to set the pending section. Mixed Media and Branding default to `visual-brand` (intentional deviation from spec's global `standard-ux` default — these section types are always visual/brand-oriented):
```tsx
<SidebarButton active={false} label="+ Add Work Case Study" onClick={() => { setPendingNewSection('work'); setPendingTemplateId('standard-ux') }} />
<SidebarButton active={false} label="+ Add Mixed Media" onClick={() => { setPendingNewSection('mixed-media'); setPendingTemplateId('visual-brand') }} />
<SidebarButton active={false} label="+ Add Branding" onClick={() => { setPendingNewSection('branding'); setPendingTemplateId('visual-brand') }} />
```

- [ ] **Step 5: Add the inline template picker panel in the sidebar**

In the sidebar JSX (inside the same region as the "+" buttons, after the last section list), add a conditional panel. Place it directly after the "+ Add Branding" button group:

```tsx
{pendingNewSection && (
  <div style={{ border: '1px solid #333', padding: '14px', marginTop: '8px', background: '#111' }}>
    <p className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.14em', color: '#f5f2ed', textTransform: 'uppercase', marginBottom: '10px' }}>
      Choose a template
    </p>
    <div style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
      {CASE_STUDY_TEMPLATES.map((template) => (
        <label
          key={template.id}
          className="font-mono"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            cursor: 'pointer',
            border: `1px solid ${pendingTemplateId === template.id ? '#FF3120' : '#222'}`,
            padding: '8px 10px',
          }}
        >
          <input
            type="radio"
            name="template"
            value={template.id}
            checked={pendingTemplateId === template.id}
            onChange={() => setPendingTemplateId(template.id)}
            style={{ marginTop: '2px', flexShrink: 0 }}
          />
          <span>
            <span style={{ fontSize: '11px', letterSpacing: '0.08em', color: '#f5f2ed', display: 'block' }}>{template.label}</span>
            <span style={{ fontSize: '10px', color: '#555', letterSpacing: '0.04em' }}>{template.description}</span>
          </span>
        </label>
      ))}
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        type="button"
        className="font-mono"
        onClick={() => addCaseStudyWithTemplate(pendingNewSection, pendingTemplateId)}
        style={{ background: '#FF3120', border: 'none', color: '#fff', padding: '8px 14px', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.12em' }}
      >
        CREATE →
      </button>
      <button
        type="button"
        className="font-mono"
        onClick={() => { setPendingNewSection(null); setPendingTemplateId('standard-ux') }}
        style={{ background: 'transparent', border: '1px solid #333', color: '#666', padding: '8px 14px', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.12em' }}
      >
        CANCEL
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
npm run dev
```

Open dashboard. Click "+ Add Work Case Study". Confirm the template picker panel appears. Select "Mobile / App", click CREATE. Confirm new case study is created and navigated to. Check its media blocks in the editor — 4 blocks should be present, all hidden. Check that "Blank" creates a case study with 0 blocks. Click CANCEL — confirm panel closes and no case study is created.

- [ ] **Step 7: Commit**

```bash
git add components/admin/DashboardEditor.tsx
git commit -m "feat: template picker for new case study creation"
```

---

## Task 6: "Apply template…" on existing case studies

**Files:**
- Modify: `components/admin/DashboardEditor.tsx`

- [ ] **Step 1: Add `replaceAllMediaBlocks` in the case study editor function (near `moveMediaBlock`)**

In the case study editor render function (the large function starting around line ~1800 that contains `updateMediaBlocks`), add after `moveMediaBlock`:

```typescript
function replaceAllMediaBlocks(blocks: CaseStudyMediaBlock[]) {
  updateMediaBlocks(blocks)
}
```

- [ ] **Step 2: Update `MediaBlockListEditor` prop interface and add local state**

> **Note:** Update the interface BEFORE passing the new prop at the call site (Step 3). Doing it in this order means TypeScript will accept the prop immediately in Step 3 — reversing the order produces a guaranteed compile error between steps.

Add `onReplaceAll` to the props destructure and type:

```typescript
function MediaBlockListEditor({
  blocks,
  localWriteEnabled,
  onAdd,
  onMove,
  onChange,
  onRemove,
  onReplaceAll,
}: {
  blocks: CaseStudyMediaBlock[]
  localWriteEnabled: boolean
  onAdd: (section: CaseStudyMediaBlockSection) => void
  onMove: (blockId: string, toIndex: number) => void
  onChange: (blockId: string, updater: (block: CaseStudyMediaBlock) => CaseStudyMediaBlock) => void
  onRemove: (blockId: string) => void
  onReplaceAll: (blocks: CaseStudyMediaBlock[]) => void
}) {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [pickerTemplateId, setPickerTemplateId] = useState('standard-ux')
  // ... rest of component
```

- [ ] **Step 3: Pass `onReplaceAll` to `MediaBlockListEditor`**

Find the `<MediaBlockListEditor` call (around line ~2075). Add the new prop:

```tsx
<MediaBlockListEditor
  blocks={mediaBlocks}
  localWriteEnabled={localWriteEnabled}
  onAdd={addMediaBlock}
  onMove={moveMediaBlock}
  onChange={updateMediaBlock}
  onRemove={removeMediaBlock}
  onReplaceAll={replaceAllMediaBlocks}
/>
```

- [ ] **Step 4a: Add "APPLY TEMPLATE…" button to the existing button row**

The current button row (line ~2469) has 4 "ADD X BLOCK" buttons inside an outer `<div style={{ display: 'grid', gap: '12px' }}>`. Wrap the existing buttons in an inner flex div and add a fifth "APPLY TEMPLATE…" button. Replace the outer div's content (keep the outer div itself):

The existing `<div style={{ display: 'grid', gap: '12px' }}>` already wraps the 4 ADD buttons. Wrap those 4 buttons in a new inner `<div className="flex">` and append the APPLY TEMPLATE… button inside that flex wrapper:

```tsx
<div style={{ display: 'grid', gap: '12px' }}>
  <div className="flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
    <button type="button" onClick={() => onAdd('research')} className="font-mono" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
      + ADD RESEARCH BLOCK
    </button>
    <button type="button" onClick={() => onAdd('challenge')} className="font-mono" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
      + ADD CHALLENGE BLOCK
    </button>
    <button type="button" onClick={() => onAdd('process')} className="font-mono" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
      + ADD PROCESS BLOCK
    </button>
    <button type="button" onClick={() => onAdd('solution')} className="font-mono" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
      + ADD SOLUTION BLOCK
    </button>
    <button
      type="button"
      onClick={() => setShowTemplatePicker((v) => !v)}
      className="font-mono"
      style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#666666', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em', marginLeft: 'auto' }}
    >
      APPLY TEMPLATE…
    </button>
  </div>
  {/* Step 4b: picker panel goes here */}
  {/* ... rest of component (empty state + block list — do not remove) */}
```

- [ ] **Step 4b: Add the conditional template picker panel**

Directly after the `</div>` that closes the flex button row (added in Step 4a), and before the `{/* ... rest of component */}` comment, insert:

```tsx
  {showTemplatePicker && (
    <div style={{ border: '1px solid #333', padding: '14px', background: '#111' }}>
      <p className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.14em', color: '#f5f2ed', textTransform: 'uppercase', marginBottom: '10px' }}>
        Apply a template
      </p>
      <div style={{ display: 'grid', gap: '6px', marginBottom: '10px' }}>
        {CASE_STUDY_TEMPLATES.map((template) => (
          <label
            key={template.id}
            className="font-mono"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              cursor: 'pointer',
              border: `1px solid ${pickerTemplateId === template.id ? '#FF3120' : '#222'}`,
              padding: '8px 10px',
            }}
          >
            <input
              type="radio"
              name="apply-template"
              value={template.id}
              checked={pickerTemplateId === template.id}
              onChange={() => setPickerTemplateId(template.id)}
              style={{ marginTop: '2px', flexShrink: 0 }}
            />
            <span>
              <span style={{ fontSize: '11px', letterSpacing: '0.08em', color: '#f5f2ed', display: 'block' }}>{template.label}</span>
              <span style={{ fontSize: '10px', color: '#555', letterSpacing: '0.04em' }}>{template.description}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="font-mono" style={{ fontSize: '10px', color: '#666', borderLeft: '2px solid #333', paddingLeft: '10px', marginBottom: '10px', lineHeight: 1.6 }}>
        This will replace all current media blocks. Image paths will be cleared.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className="font-mono"
          onClick={() => { onReplaceAll(applyTemplate(pickerTemplateId)); setShowTemplatePicker(false) }}
          style={{ background: '#FF3120', border: 'none', color: '#fff', padding: '8px 14px', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.12em' }}
        >
          APPLY {CASE_STUDY_TEMPLATES.find((t) => t.id === pickerTemplateId)?.label.toUpperCase() ?? ''} →
        </button>
        <button
          type="button"
          className="font-mono"
          onClick={() => setShowTemplatePicker(false)}
          style={{ background: 'transparent', border: '1px solid #333', color: '#666', padding: '8px 14px', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.12em' }}
        >
          CANCEL
        </button>
      </div>
    </div>
  )}
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
npm run dev
```

Open dashboard → any case study with existing blocks → click "APPLY TEMPLATE…". Select "Mobile / App" → click APPLY. Confirm all existing blocks are replaced with 4 new hidden blocks matching the mobile-app template. Confirm image paths are empty. Click CANCEL on a fresh open — confirm no change. Apply "Blank" — confirm all blocks are removed.

- [ ] **Step 6: Commit**

```bash
git add components/admin/DashboardEditor.tsx
git commit -m "feat: apply template to existing case studies from dashboard"
```

---

## Task 7: Drag-and-drop reordering

**Files:**
- Modify: `components/admin/DashboardEditor.tsx`

The drag-and-drop replaces nothing — the existing MOVE UP / MOVE DOWN buttons stay. This adds drag handles and drop zones alongside them.

- [ ] **Step 1: Add drag state to `MediaBlockListEditor`**

After the existing `const [showTemplatePicker...]` state declarations, add:

```typescript
const [dragFromIndex, setDragFromIndex] = useState<number | null>(null)
const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
```

- [ ] **Step 2: Replace the `blocks.map` render in `MediaBlockListEditor`**

Find the current `{blocks.map((block, index) => (` section (around line ~2488). Replace with:

```tsx
{blocks.map((block, index) => (
  <div key={block.id}>
    {/* Drop zone above this block */}
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
      onDragLeave={() => setDragOverIndex(null)}
      onDrop={(e) => {
        e.preventDefault()
        if (dragFromIndex !== null && dragFromIndex !== index) {
          onMove(blocks[dragFromIndex].id, index)
        }
        setDragFromIndex(null)
        setDragOverIndex(null)
      }}
      style={{ height: '6px', position: 'relative', flexShrink: 0 }}
    >
      {dragOverIndex === index && dragFromIndex !== null && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '2px', height: '2px', background: '#FF3120', pointerEvents: 'none' }} />
      )}
    </div>

    {/* Block row */}
    <div
      draggable
      onDragStart={() => setDragFromIndex(index)}
      onDragEnd={() => { setDragFromIndex(null); setDragOverIndex(null) }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        opacity: dragFromIndex === index ? 0.4 : 1,
        borderStyle: dragFromIndex === index ? 'dashed' : 'solid',
      }}
    >
      {/* Drag handle */}
      <div
        style={{ cursor: 'grab', padding: '18px 4px 0', color: '#333', fontSize: '16px', flexShrink: 0, userSelect: 'none' }}
        title="Drag to reorder"
      >
        ⠿
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <MediaBlockEditor
          block={block}
          localWriteEnabled={localWriteEnabled}
          index={index}
          length={blocks.length}
          onMove={(direction) => onMove(block.id, index + direction)}
          onChange={(updater) => onChange(block.id, updater)}
          onRemove={() => onRemove(block.id)}
        />
      </div>
    </div>
  </div>
))}

{/* Final drop zone after last block */}
{blocks.length > 0 && (
  <div
    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(blocks.length) }}
    onDragLeave={() => setDragOverIndex(null)}
    onDrop={(e) => {
      e.preventDefault()
      if (dragFromIndex !== null && dragFromIndex !== blocks.length - 1) {
        onMove(blocks[dragFromIndex].id, blocks.length)
      }
      setDragFromIndex(null)
      setDragOverIndex(null)
    }}
    style={{ height: '6px', position: 'relative' }}
  >
    {dragOverIndex === blocks.length && dragFromIndex !== null && (
      <div style={{ position: 'absolute', left: 0, right: 0, top: '2px', height: '2px', background: '#FF3120', pointerEvents: 'none' }} />
    )}
  </div>
)}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run dev
```

Open dashboard → case study with 3+ media blocks. Confirm:
- Drag handle `⠿` appears at left of each block
- Dragging a block shows it at 40% opacity with dashed border
- Hovering over a drop zone shows the 2px red insertion line
- Dropping reorders the blocks correctly
- MOVE UP / MOVE DOWN buttons still work

- [ ] **Step 4: Commit**

```bash
git add components/admin/DashboardEditor.tsx
git commit -m "feat: drag-and-drop reordering for media blocks in dashboard"
```

---

## Done

All 7 tasks complete. The full feature set is live:
- 9 case studies configured with consistent image layouts
- 5 reusable templates available at new case study creation and on existing case studies
- Media blocks reorderable by drag-and-drop (MOVE UP / MOVE DOWN remain as fallback)
