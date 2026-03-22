# Micro Animations Design Spec

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Add a consistent, restrained set of micro animations across the portfolio — red border on card hover, arrow nudges on links, nav dot reveal, social underline draw, and scroll-in eyebrow animation.

**Approach:** Pure CSS wherever possible (transitions, keyframes, pseudo-elements). No new JS dependencies. Scroll-in for eyebrows uses the existing IntersectionObserver pattern already in the codebase.

---

## 1. Cards — VIEW → with arrow nudge

**Where:** All card types across all pages.
- `ProjectCard` (supporting variant) — currently shows title + tag only, no VIEW →
- `CreativeCard` in `app/creative/page.tsx`
- Photography sub-page cards (`app/creative/photography/page.tsx`)
- Mixed-media and branding sub-page cards

**Behaviour:**
- VIEW → text is always visible (not hidden at rest)
- On hover: the `→` arrow translates `4px` to the right, `transition: transform 0.2s ease`
- Red border on hover already handled by `.portfolio-card` CSS class

**Implementation:**
- Wrap arrow in `<span class="arrow-nudge">→</span>`
- Add to `globals.css`:
  ```css
  .arrow-nudge { display: inline-block; transition: transform 0.2s ease; }
  a:hover .arrow-nudge, button:hover .arrow-nudge, .portfolio-card:hover .arrow-nudge { transform: translateX(4px); }
  ```
- For back links (← CREATIVE), arrow nudges left: `.arrow-nudge-back { display: inline-block; transition: transform 0.2s ease; }` with `translateX(-4px)` on parent hover

**Files to change:**
- `components/ProjectCard.tsx` — add VIEW → to supporting variant with `.arrow-nudge` span
- `app/creative/page.tsx` (CreativeCard) — wrap → in `.arrow-nudge` span
- `app/creative/photography/page.tsx` — wrap → in `.arrow-nudge` span
- `app/creative/mixed-media/page.tsx` — VIEW → already there, wrap arrow
- `app/creative/branding/page.tsx` — VIEW → already there, wrap arrow
- `components/About.tsx` — READ MORE → wrap arrow
- `app/globals.css` — add `.arrow-nudge` and `.arrow-nudge-back` rules

---

## 2. Nav links — red dot expands

**Where:** `components/Nav.tsx`

**Behaviour:**
- At rest: no dot, link color `#999`
- On hover: a red dot (`●` via `::before`, `width: 6px`, `height: 6px`, `border-radius: 50%`) fades/expands in before the text, `margin-right` opens to `6px`. Link color transitions to `#f5f2ed`.
- Active/current page: dot is always visible

**Implementation (CSS only):**
```css
.nav-link {
  display: inline-flex; align-items: center; gap: 0;
  color: #999; transition: color 0.2s ease;
}
.nav-link::before {
  content: ''; display: inline-block;
  width: 0; height: 6px; border-radius: 3px; background: #FF3120;
  transition: width 0.2s ease, margin-right 0.2s ease;
  margin-right: 0;
}
.nav-link:hover, .nav-link.active {
  color: #f5f2ed;
}
.nav-link:hover::before, .nav-link.active::before {
  width: 6px; margin-right: 6px;
}
```

**Files to change:**
- `components/Nav.tsx` — add `nav-link` class to link elements, mark active
- `app/globals.css` — add `.nav-link` rules

---

## 3. Text links — directional arrow nudge

**Where:** READ MORE →, ← CREATIVE, ← back links on sub-pages

**Behaviour:**
- Forward links (→): arrow nudges `4px` right on hover
- Back links (←): arrow nudges `4px` left on hover

**Files to change:**
- `components/About.tsx` — READ MORE → wrap `→` in `.arrow-nudge`
- `app/creative/photography/page.tsx` — ← CREATIVE wrap `←` in `.arrow-nudge-back`
- `app/creative/mixed-media/page.tsx` — same
- `app/creative/branding/page.tsx` — same
- `app/globals.css` — rules already covered by section 1

---

## 4. Social links — underline draws in from left

**Where:** `components/Contact.tsx`

**Behaviour:**
- At rest: existing `border-bottom: 1px solid #FF3120` removed, replaced with `::after` pseudo-element at `scaleX(0)`
- On hover: `scaleX(1)`, `transform-origin: left`, `transition: transform 0.25s ease`. Color transitions to `#FF3120`.

**Implementation:**
```css
.social-link {
  position: relative; color: #888; text-decoration: none;
  transition: color 0.2s ease; padding-bottom: 2px;
}
.social-link::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 1px; background: #FF3120;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.25s ease;
}
.social-link:hover { color: #FF3120; }
.social-link:hover::after { transform: scaleX(1); }
```

**Files to change:**
- `components/Contact.tsx` — add `social-link` class, remove inline `borderBottom`
- `app/globals.css` — add `.social-link` rules

---

## 5. Section eyebrows — scroll-in animation

**Where:** Page-level eyebrows with the red line + label pattern (CREATIVE_, WORK_, and the red line on the hero sections of `/work` and `/creative`)

**Behaviour (plays once on scroll-in, not on hover):**
1. Red line animates `width: 0 → 32px` over `0.4s ease`
2. Label fades in + slides from `translateX(-8px) → 0` over `0.4s ease`, delayed `0.2s`

**Implementation:**
- Add CSS keyframes:
  ```css
  @keyframes eyebrow-line { from { width: 0; } to { width: 32px; } }
  @keyframes eyebrow-label { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
  .eyebrow-animate .eyebrow-line { animation: eyebrow-line 0.4s ease forwards; }
  .eyebrow-animate .eyebrow-label { animation: eyebrow-label 0.4s ease 0.2s both; }
  ```
- Add `eyebrow-line` and `eyebrow-label` classes to the line div and span in each hero section
- Use IntersectionObserver (same pattern as `About.tsx`) to add `eyebrow-animate` class on scroll-in
- Since hero sections are above the fold on page load, trigger immediately if already intersecting

**Files to change:**
- `app/creative/page.tsx` — convert hero section to `'use client'`, add observer, add classes
- `app/work/page.tsx` — same
- `app/globals.css` — add keyframes and `.eyebrow-animate` rules

---

## What's not changing

- Carousel transitions (already polished)
- Scroll-reveal animations (`.reveal`, `.reveal-text` — already in place)
- Card sizes, layouts, colors — untouched
- Any animation on mobile that would feel wrong (arrow nudge is touch-safe — no hover state on touch)
