# GSAP Animations Design

## Goal

Add GSAP-powered animations to the portfolio in three areas: page transitions, card interactions, and scroll reveals on interior pages. The homepage is untouched. All animations respect `prefers-reduced-motion`.

---

## 1. Page Transitions

**Mechanic:** A dark panel (`#080808`) wipes left-to-right across the full viewport when navigating between pages. A 3px `#FF3120` line rides the right (leading) edge of the panel. The destination page name sits in the bottom-left of the panel in small red mono (`WORK_`, `ABOUT_`, `CREATIVE_`).

**Timing:** Wipe out ~0.45s `cubic-bezier(0.77,0,0.175,1)`, hold ~0.1s, wipe off ~0.45s same easing.

**Implementation approach:**
- A single `<PageTransition>` client component wraps the layout, rendered in `app/layout.tsx`
- Uses Next.js `usePathname` to detect route changes
- GSAP timeline: panel slides in (covering page), old page content swaps, panel slides out
- Panel contains the destination label, derived from the pathname (`/work` → `WORK_`, etc.)
- Reduced motion: skip animation, instant swap

**Files affected:**
- New: `components/PageTransition.tsx`
- Modify: `app/layout.tsx` (wrap children)

---

## 2. Card Animations

### 2a. Entrance (scroll into view)

**Trigger:** GSAP ScrollTrigger fires when the card grid enters the viewport (threshold: top of grid hits 80% of viewport height).

**Animation:** Each card scales from `0.93` → `1.0` and fades from `opacity: 0` → `1`, staggered 110ms per card.

**Easing:** `power2.out`, duration `0.5s`.

**Files affected:**
- Modify: `components/ProjectCard.tsx` — add `data-card-animate` attribute for ScrollTrigger to target
- New: `components/CardGrid.tsx` (or modify existing grid wrappers in `app/work/page.tsx`, `app/creative/page.tsx`) — mounts ScrollTrigger

### 2b. Hover

Three layered effects on `.portfolio-card` hover:

1. **Lift:** `translateY(-4px)`, `box-shadow: 0 8px 24px rgba(0,0,0,0.4)` — CSS transition, `0.25s ease`
2. **Title underline:** A 1px `#FF3120` line draws in from left under the title text — CSS `scaleX(0→1)`, `transform-origin: left`, `0.3s ease`
3. **CTA expand:** `VIEW →` letter-spacing animates `0.1em` → `0.2em` — CSS transition, `0.25s ease`

**Note:** Hover effects are pure CSS (no GSAP needed). GSAP is only needed for entrance.

**Files affected:**
- Modify: `app/globals.css` — add `.card-title-hover`, `.card-cta-hover` classes
- Modify: `components/ProjectCard.tsx` — add title/cta wrapper elements with new classes

---

## 3. Scroll Reveals — Interior Pages

**Scope:** `/about`, `/work`, `/creative`, all case study pages. The homepage is excluded (already has its own reveal system).

**Mechanic:** Section headings, eyebrows, body paragraphs, and entry lists fade up (`opacity: 0→1`, `translateY: 16px→0`) as they enter the viewport. Consistent with the homepage `.reveal` classes but driven by GSAP ScrollTrigger instead of the existing `IntersectionObserver`.

**Timing:** Duration `0.6s`, easing `power2.out`. Stagger within a section: `0.08s` per element.

**Trigger:** `start: "top 85%"` (element top hits 85% down the viewport).

**Implementation:** A `useGsapReveal` hook (or small client wrapper component `GsapReveal`) accepts children and applies ScrollTrigger on mount. Applied to section wrappers in each interior page.

**Files affected:**
- New: `hooks/useGsapReveal.ts`
- Modify: `app/about/page.tsx`, `app/work/page.tsx`, `app/creative/page.tsx`, `components/CaseStudyLayout.tsx`

---

## Constraints

- GSAP is already installed (`npm install gsap` done)
- ScrollTrigger must be registered: `gsap.registerPlugin(ScrollTrigger)` in each file that uses it
- All components using GSAP must be `'use client'`
- `prefers-reduced-motion: reduce` — all animations skip (instant show, no transition)
- Do not touch homepage (`app/page.tsx`, `HeroCarousel`, `HeroStage*`)
