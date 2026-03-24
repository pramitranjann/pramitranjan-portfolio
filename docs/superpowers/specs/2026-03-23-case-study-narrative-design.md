# Case Study Narrative Redesign — Design Spec

## Goal

Make case study pages less text-heavy and more story-driven. Each section should lead with a punchy headline that gives the reader the point, followed by a condensed 2–3 sentence body. A pull quote breaks the research → challenge transition for rhythm and emphasis. A floating section nav lets readers orient themselves and jump directly to any section.

## Architecture

Three coordinated changes:

1. **`CaseStudyLayout` component** — add `*Headline` props per section, a `pullQuote` prop, and a floating `SectionNav` sub-component
2. **Case study page files** — supply the new headline/pullQuote props and condense body copy
3. **No new files** — all changes live in `CaseStudyLayout.tsx` and the existing per-page files

---

## 1. Prop Additions to `CaseStudyLayout`

New optional props alongside existing text props:

```ts
problemHeadline?: string
roleHeadline?: string
researchHeadline?: string
challengeHeadline?: string
processHeadline?: string
solutionHeadline?: string
outcomesHeadline?: string
pullQuote?: string
```

Each `*Headline` renders immediately above its corresponding body text, **inside the `data-reveal` element** in the right column of the `1fr 2fr` grid. This means the headline and body animate together as one reveal unit. If a headline prop is undefined, only the body text renders (no headline element, no empty space).

**Structural change required:** Sections whose right column is currently a bare `<p>` element (PROBLEM_, RESEARCH_, CHALLENGE_, OUTCOMES_) must be changed to a `<div data-reveal>` containing a headline `<p>` and a body `<p>`. MY ROLE_ and PROCESS_ already have a `<div>` right column — no structural change needed there.

**Headline HTML element:** Use `<p>` (not `<h2>`, `<h3>`, etc.) to avoid breaking the heading hierarchy. The page already has an `<h1>` in the hero; section headlines are not document headings.

**`processHeadline`** renders once above the entire PROCESS_ block in all cases where the PROCESS_ section renders — that includes: only `process` defined, only `usabilityTesting` defined, or both defined. The PROCESS_ section already gates on `process || usabilityTesting`; `processHeadline` follows the same gate.

**Existing fallback strings** in `problem`, `role`, and `solution` (and the empty string in `solution`) are not changed by this work. Headline props are purely additive; if a headline is not provided the section renders exactly as today.

---

## 2. Section Headline Style

- Font: `font-mono` (DM Mono), NOT serif — stays consistent with the design system
- Size: `var(--text-body-lg)` or `16px` fallback
- Color: `#f5f2ed` (off-white, same as body headings — not pure `#ffffff`)
- Letter spacing: `0.01em`
- Line height: `1.55`
- Margin bottom: `10px` (between headline and body paragraph)

Example output for PROBLEM_ section:

```
PROBLEM_     [headline in white mono]
             [body in #999 mono, 2–3 sentences]
```

---

## 3. Pull Quote

A full-width block inserted between the Research section and the Challenge section in the DOM. Renders only when `pullQuote` prop is provided, regardless of whether `research` is defined — if Research section is absent the pull quote still appears before Challenge (after My Role).

The pull quote is a direct sibling of the Research/Challenge `<section>` elements in the JSX — it is **not** wrapped in any `GsapReveal`. It will not inherit any reveal animation from adjacent sections.

**Layout:**
- Full bleed across the content column (not inside the `1fr 2fr` grid)
- Padding: `44px 40px`
- Left border: `2px solid #FF3120`
- Bottom border: `1px solid var(--divider)` (matches section rhythm)

**Text:**
- The pull quote container is full-width (not inside the `1fr 2fr` grid)
- The `<p>` text inside it has `max-width: 680px` — the container itself spans full width
- Font: `DM Serif Display`, italic
- Size: `28px`
- Color: `#f5f2ed`
- Line height: `1.45`

**Attribution:**
- Font: `font-mono`
- Size: `var(--text-eyebrow)` (10px)
- Color: `#FF3120`
- Letter spacing: `0.16em`
- Text: `KEY INSIGHT_`
- Margin top: `16px`

The pull quote is not wrapped in a `GsapReveal` — it is always visible when scrolled into view without animation, so it reads as a pacing break rather than a content block.

---

## 4. Floating Section Nav

A `SectionNav` component rendered as a `<nav>` fixed at the bottom centre of the viewport.

**Show/hide behaviour:**
- The hero `<section>` is assigned `id="sec-hero"`
- Uses an `IntersectionObserver` on `#sec-hero` with `threshold: 0`
- While the hero is intersecting (visible in viewport): nav is hidden (`opacity: 0`, `pointer-events: none`)
- Once the hero is no longer intersecting (fully scrolled past): nav becomes visible (`opacity: 1`, `pointer-events: auto`)
- `transition: opacity 0.3s ease`

**Active section tracking:**
- A second `IntersectionObserver` watches each `<section id="sec-*">` element
- Options: `rootMargin: "-40% 0px -55% 0px", threshold: 0` — fires when a section crosses the middle band of the viewport, so the active item reflects whichever section is currently centred on screen
- When a section enters this band it becomes active; when it leaves the last entered section remains active until the next fires

**Only renders nav items for sections that are present.** If a section's content prop is undefined, that item does not appear in the nav.

**Clicking an item** uses a native `<a href="#sec-*">` anchor; smooth scrolling is handled by the existing `html { scroll-behavior: smooth }` rule already in the site.

**Lifecycle (`useEffect`):**

Both `IntersectionObserver` instances are created inside a single `useEffect` with an empty dependency array (`[]`). The effect runs once after mount. Cleanup: call `heroObserver.disconnect()` and `sectionObserver.disconnect()` in the effect's return function.

```ts
useEffect(() => {
  const heroEl = document.getElementById('sec-hero')
  const heroObserver = new IntersectionObserver(([entry]) => {
    setNavVisible(!entry.isIntersecting)
  }, { threshold: 0 })
  if (heroEl) heroObserver.observe(heroEl)

  const sectionEls = document.querySelectorAll('section[id^="sec-"]')
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveId(entry.target.id)
    })
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 })
  sectionEls.forEach(el => sectionObserver.observe(el))

  return () => {
    heroObserver.disconnect()
    sectionObserver.disconnect()
  }
}, [])
```

State: two `useState` values — `navVisible: boolean` (initially `false`) and `activeId: string` (initially `''`).

**Visual:**
- Container: `position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); z-index: 998`
- Background: `rgba(17,17,17,0.96)`, `backdrop-filter: blur(12px)`
- Border: `1px solid #222`
- No border-radius (matches rest of site's sharp geometry)

**Items:**
- Font: `font-mono`, `10px`, `letter-spacing: 0.14em`
- Default colour: `#3a3a3a` (intentionally ghost-dark — items only become readable on hover/active, this is the design intent)
- Hover colour: `#666666`
- Active colour: `#f5f2ed` (off-white)
- Active bottom indicator: rendered as a child `<span>` with `position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: #FF3120` — not a pseudo-element (pseudo-elements cannot be set via inline styles and `globals.css` is out of scope)
- Padding: `11px 16px`
- `position: relative` on each item (to contain the absolute `<span>`)
- Dividers: `borderRight: 1px solid #1a1a1a` on each item except the last

**Section IDs and nav labels** — add `id` attributes to every `<section>` in `CaseStudyLayout.tsx`:

| `<section id=...>` | Nav label text | Conditional? |
|--------------------|----------------|--------------|
| `sec-hero` | (hero, no nav item) | always present |
| `sec-problem` | `PROBLEM_` | always present |
| `sec-role` | `MY ROLE_` | always present |
| `sec-research` | `RESEARCH_` | only when `research` prop defined |
| `sec-challenge` | `CHALLENGE_` | only when `challenge` prop defined |
| `sec-process` | `PROCESS_` | only when `process \|\| usabilityTesting` |
| `sec-solution` | `SOLUTION_` | always present |
| `sec-outcomes` | `OUTCOMES_` | only when `outcomes` prop defined |

**Nav items list construction:** Use a hardcoded array of `{ id, label, show }` objects, where `show` mirrors the same condition used to render each section. Build this array once inside the component body (no `useMemo` needed). Filter to `show === true` before rendering. Always-present items (`problem`, `role`, `solution`) always have `show: true`.

Adding `id` attributes is additive — Phase 2 pages will automatically get working section IDs since they share `CaseStudyLayout`.

---

## 5. Section `data-section` Attributes

Each `<section>` element in `CaseStudyLayout` gets a `data-section` attribute matching its nav label (e.g. `data-section="PROBLEM_"`). The active-section `IntersectionObserver` uses `entry.target.id` (not `data-section`) to match against nav `href` values. The `data-section` attribute is informational only.

---

## 6. Content Updates — Phased

### Phase 1 (this plan): `CaseStudyLayout.tsx` + Franklin's

Update `CaseStudyLayout.tsx` with all new props and the `SectionNav` component. Update `app/work/franklins/page.tsx` as the reference implementation with complete content.

**Franklin's content:**

| Section | Headline | Body (condensed) |
|---------|----------|-----------------|
| PROBLEM_ | The warmth was real — it just wasn't reaching people before they arrived. | Franklin's has a strong in-store experience. The brief: close the gap between what first-time visitors expected digitally and what they actually found when they walked in. |
| MY ROLE_ | Team lead on a five-person UXDG 101 project — from fieldwork to final prototype. | Led and contributed across every stage: structuring the research approach, directing fieldwork, synthesising findings, defining the IA, and driving the high-fidelity Figma prototype. |
| RESEARCH_ | Most friction started before anyone walked through the door. | Contextual inquiry at the café — barista and customer interviews, plus a SCAD student survey. The website was outdated, the service model unclear, and the in-store warmth had no digital equivalent. |
| CHALLENGE_ | Users don't think in business categories — they think in tasks. | Card sorting on FigJam revealed four natural buckets: Menu, Order, About, Contact. That structure became the backbone of the redesigned IA. |
| PROCESS_ | Every design decision traces directly back to a research finding. | The homepage was restructured to surface practical expectations earlier — seating, service style, hours. Navigation reduced to four items; the order flow redesigned as a clear sequence with explicit progress cues. |
| SOLUTION_ | The redesign didn't change Franklin's identity — it made it clearer upfront. | Task-based navigation, a restructured homepage, a cleaner menu, and a step-by-step order flow from discovery to checkout. |
| OUTCOMES_ | The most important job of a team lead is keeping the work honest. | The experience gap wasn't a design problem — it was an information problem. If I were to continue, I'd explore in-context digital touchpoints at the storefront itself. |

**Franklin's `pullQuote`:**
`"Their warmth was real. It just wasn't reaching people before they arrived."`

### Phase 2 (follow-on): Remaining 8 pages

Update albers, atom, loomlearn, helpoh, soho, oracle, south-china-sea, faces-of-power with their own headlines and pull quotes. Content for these pages is not specified in this spec — they are a separate content task once Phase 1 is validated.

---

## 7. Implementation Scope (Phase 1)

**Files to modify:**
- `components/CaseStudyLayout.tsx` — add headline props, pull quote block, SectionNav component
- `app/work/franklins/page.tsx`

**Files NOT touched in Phase 1:**
- All other case study pages
- `globals.css`
- Any other component

---

## 8. Out of Scope

- Animations on the pull quote (static, no GsapReveal)
- Sound effects on nav item clicks
- Mobile-specific SectionNav behaviour (it will naturally scroll horizontally if items overflow on narrow viewports — no custom handling needed)
- Adding new image slots or image treatment changes
- Phase 2 content updates (remaining 8 pages)
