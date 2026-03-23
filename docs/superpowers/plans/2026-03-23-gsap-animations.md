# GSAP Animations Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GSAP-powered page transitions, card entrance/hover animations, and scroll reveals to all interior pages of the portfolio.

**Architecture:** A fixed `<PageTransition>` overlay panel handles route-change wipes. Card entrance uses GSAP ScrollTrigger; hover is pure CSS. A `<GsapReveal>` client wrapper handles scroll reveals on interior pages without requiring consuming pages to be client components.

**Tech Stack:** GSAP (already installed), Next.js App Router, TypeScript, Tailwind CSS v4

---

## File Map

| File | Change | Purpose |
|------|--------|---------|
| `app/globals.css` | Modify | Card hover: lift, title underline, CTA expand |
| `components/ProjectCard.tsx` | Modify | Add `card-title-inner` and `card-cta-inner` wrapper spans (both variants) |
| `app/creative/page.tsx` | Modify | Add spans to `CreativeCard`; add ScrollTrigger card entrance per grid section |
| `app/work/page.tsx` | Modify | Add ScrollTrigger card entrance (second `useEffect`, preserve existing eyebrow observer) |
| `components/GsapReveal.tsx` | Create | Reusable ScrollTrigger fade-up wrapper component |
| `app/about/page.tsx` | Modify | Wrap each section's content in `<GsapReveal>` |
| `components/CaseStudyLayout.tsx` | Modify | Wrap content sections in `<GsapReveal>` |
| `components/PageTransition.tsx` | Create | Fixed wipe panel, fires on interior route changes |
| `app/layout.tsx` | Modify | Add `<PageTransition />` sibling in body |

---

## Task 1: Card Hover CSS + Spans

**Files:**
- Modify: `app/globals.css` (lines 79–87)
- Modify: `components/ProjectCard.tsx`
- Modify: `app/creative/page.tsx`

- [ ] **Step 1: Update card hover rules in globals.css**

Replace the existing `.portfolio-card` and `.portfolio-card:hover` block (currently lines 79–87) with the following. This preserves the existing `border-color` and `box-shadow` transitions and adds `transform`. It also adds the title underline and CTA expand rules:

```css
/* Card hover — lift + red border + glow */
.portfolio-card {
  border: 1px solid #2a2a2a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.portfolio-card:hover {
  border-color: #FF3120;
  transform: translateY(-4px);
  box-shadow: 0 0 0 1px #FF3120,
              0 0 32px rgba(255, 49, 32, 0.1),
              0 8px 24px rgba(0, 0, 0, 0.4);
}

/* Card title underline — draws in from left on hover (same pattern as .social-link::after) */
.card-title-inner {
  position: relative;
  display: inline;
}
.card-title-inner::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 1px;
  background: #FF3120;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}
.portfolio-card:hover .card-title-inner::after {
  transform: scaleX(1);
}

/* Card CTA letter-spacing expand */
.card-cta-inner {
  display: inline;
  transition: letter-spacing 0.25s ease;
}
.portfolio-card:hover .card-cta-inner {
  letter-spacing: 0.2em;
}
```

- [ ] **Step 2: Add spans to ProjectCard.tsx — supporting variant**

In `components/ProjectCard.tsx`, the supporting variant renders around line 58. Wrap the title and CTA:

```tsx
{/* Before */}
<div className="font-serif" style={{ fontSize: 'var(--text-body)', color: '#f5f2ed' }}>{title}</div>
...
<div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em', marginTop: '8px' }}>
  VIEW <span className="arrow-nudge">→</span>
</div>

{/* After */}
<div className="font-serif" style={{ fontSize: 'var(--text-body)', color: '#f5f2ed' }}>
  <span className="card-title-inner">{title}</span>
</div>
...
<div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em', marginTop: '8px' }}>
  <span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span>
</div>
```

- [ ] **Step 3: Add spans to ProjectCard.tsx — main variant**

The main variant renders around lines 78–83. Wrap title and CTA (do NOT wrap the `COMING SOON` state):

```tsx
{/* Before */}
<div className="font-serif" style={{ fontSize: 'var(--text-h3)', color: '#f5f2ed', marginBottom: '8px' }}>{title}</div>
...
{!comingSoon && (
  <div className="font-mono" style={{ marginTop: '14px', fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em' }}>VIEW →</div>
)}

{/* After */}
<div className="font-serif" style={{ fontSize: 'var(--text-h3)', color: '#f5f2ed', marginBottom: '8px' }}>
  <span className="card-title-inner">{title}</span>
</div>
...
{!comingSoon && (
  <div className="font-mono" style={{ marginTop: '14px', fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em' }}>
    <span className="card-cta-inner">VIEW</span> →
  </div>
)}
```

- [ ] **Step 4: Add spans to CreativeCard in creative/page.tsx**

In `app/creative/page.tsx`, `CreativeCard` renders at lines 27 and 33. Wrap title and CTA (do NOT wrap the `COMING SOON` state):

```tsx
{/* Before */}
<h3 className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#f5f2ed', marginBottom: '4px' }}>{title}</h3>
...
: <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120' }}>VIEW <span className="arrow-nudge">→</span></span>

{/* After */}
<h3 className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#f5f2ed', marginBottom: '4px' }}>
  <span className="card-title-inner">{title}</span>
</h3>
...
: <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120' }}>
    <span className="card-cta-inner">VIEW</span> <span className="arrow-nudge">→</span>
  </span>
```

- [ ] **Step 5: Verify hover animations**

Run: `npm run dev`
Navigate to `/work` — hover any card. Confirm:
- Card lifts up slightly
- Red border + glow appears
- Title shows a red underline drawing in from left
- "VIEW" text letter-spacing expands
Navigate to `/creative` — hover a card. Same checks.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css components/ProjectCard.tsx app/creative/page.tsx
git commit -m "feat: card hover — lift, title underline, CTA expand"
```

---

## Task 2: Card Entrance Animation

**Files:**
- Modify: `app/work/page.tsx` (add second `useEffect`, do not touch existing eyebrow observer)
- Modify: `app/creative/page.tsx` (add entrance to each of the three grid sections)

- [ ] **Step 1: Add card entrance to work/page.tsx**

Add GSAP imports after the existing imports at the top of `app/work/page.tsx`. Add a `gridRef` for the card grid. Add a **second** `useEffect` for card entrance — the existing `eyebrowRef` / `observer` `useEffect` must remain untouched.

Add to imports:
```tsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
```

Add `gridRef` alongside existing `eyebrowRef`:
```tsx
const gridRef = useRef<HTMLDivElement>(null)
```

Add a second `useEffect` after the existing one:
```tsx
// Card entrance animation — SECOND useEffect (do not merge with eyebrow observer above)
useEffect(() => {
  const grid = gridRef.current
  if (!grid) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(grid.querySelectorAll('.portfolio-card'), { opacity: 1, scale: 1 })
    return
  }
  const ctx = gsap.context(() => {
    const cards = grid.querySelectorAll('.portfolio-card')
    gsap.set(cards, { opacity: 0, scale: 0.93 })
    ScrollTrigger.create({
      trigger: grid,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.11,
        })
      },
      once: true,
    })
  }, grid)
  return () => ctx.revert()
}, [])
```

Attach `ref={gridRef}` to the grid div (the one with `className="grid grid-cols-2 md:grid-cols-4"`):
```tsx
<div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
```

- [ ] **Step 2: Add card entrance to creative/page.tsx**

`creative/page.tsx` has three separate grids. Create one ref per grid section.

Add to imports:
```tsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
```

Add three refs in `CreativePage`:
```tsx
const photoGridRef = useRef<HTMLDivElement>(null)
const mixedGridRef  = useRef<HTMLDivElement>(null)
const brandingGridRef = useRef<HTMLDivElement>(null)
```

Add a second `useEffect` (after the existing eyebrow observer):
```tsx
// Card entrance animation — SECOND useEffect
useEffect(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const grids = [photoGridRef.current, mixedGridRef.current, brandingGridRef.current]
    .filter((g): g is HTMLDivElement => g !== null)

  if (reduced) {
    grids.forEach(grid =>
      gsap.set(grid.querySelectorAll('.portfolio-card'), { opacity: 1, scale: 1 })
    )
    return
  }

  const ctxs = grids.map(grid => {
    return gsap.context(() => {
      const cards = grid.querySelectorAll('.portfolio-card')
      gsap.set(cards, { opacity: 0, scale: 0.93 })
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.11,
          })
        },
        once: true,
      })
    }, grid)
  })
  return () => ctxs.forEach(ctx => ctx.revert())
}, [])
```

Attach refs to each grid div in the JSX:
```tsx
{/* Photography grid */}
<div ref={photoGridRef} className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>

{/* Mixed Media grid */}
<div ref={mixedGridRef} className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '16px' }}>

{/* Branding grid */}
<div ref={brandingGridRef} className="grid grid-cols-2" style={{ gap: '16px' }}>
```

- [ ] **Step 3: Verify entrance animations**

Run: `npm run dev`
Navigate to `/work` — cards should scale up from 93% with stagger.
Navigate to `/creative` and scroll — each grid section should animate in as it enters the viewport.
Confirm eyebrow animation on both pages still works (the line + label).

- [ ] **Step 4: Commit**

```bash
git add app/work/page.tsx app/creative/page.tsx
git commit -m "feat: card entrance animation with GSAP ScrollTrigger"
```

---

## Task 3: GsapReveal Component + Scroll Reveals

**Files:**
- Create: `components/GsapReveal.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/work/page.tsx` (hero section only)
- Modify: `app/creative/page.tsx` (hero section only)

- [ ] **Step 1: Create components/GsapReveal.tsx**

```tsx
// components/GsapReveal.tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface GsapRevealProps {
  children: React.ReactNode
  stagger?: number
  className?: string
  style?: React.CSSProperties
}

export function GsapReveal({ children, stagger = 0.08, className, style }: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const items = el.querySelectorAll('[data-reveal]')
    if (items.length === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 16 })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger,
          })
        },
        once: true,
      })
    }, el)

    return () => ctx.revert()
  }, [stagger])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Apply GsapReveal to app/about/page.tsx**

Import at the top: `import { GsapReveal } from '@/components/GsapReveal'`

Wrap the content of each section. The `<section>` tag stays as-is; only the inner content is wrapped. Add `data-reveal` to each direct child element that should animate in.

**Hero section** (currently lines 101–128):
```tsx
<section className="border-b border-divider" style={{ padding: '64px 40px' }}>
  <GsapReveal>
    <div data-reveal className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
      <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
      <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>ABOUT_</span>
    </div>
    <h1 data-reveal className="font-serif" style={{ ... }}>
      Artist. Designer.{' '}<span style={{ color: '#FF3120' }}>Human.</span>
    </h1>
    <p data-reveal className="font-mono" style={{ ... }}>
      UX design student at SCAD...
    </p>
    <div data-reveal className="flex items-center justify-between">
      <CVButton />
      <span ...>SCROLL ↓</span>
    </div>
  </GsapReveal>
</section>
```

**WHO I AM section** — wrap only the text div (the Spotify sidebar stays as-is):
```tsx
<div style={{ padding: '28px 40px', borderRight: '1px solid #1f1f1f' }}>
  <GsapReveal>
    <span data-reveal className="font-mono" style={{ ... }}>WHO I AM_</span>
    <p data-reveal className="font-mono" style={{ ... }}>From KL...</p>
  </GsapReveal>
</div>
```

**Experience, Professional Activities, Education, Tools sections** — each follows the same `about-page-grid` structure. Wrap the grid content:
```tsx
<section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
  <GsapReveal>
    <div data-reveal className="about-page-grid grid" style={{ gridTemplateColumns: '160px 1fr', gap: '48px' }}>
      <SectionLabel>EXPERIENCE_</SectionLabel>
      <EntryList items={experience} />
    </div>
  </GsapReveal>
</section>
```

**RIGHT NOW section** — wrap the eyebrow + description + grid:
```tsx
<section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
  <GsapReveal>
    <div data-reveal className="flex items-center" style={{ ... }}>...</div>
    <p data-reveal className="font-mono" style={{ ... }}>A snapshot...</p>
    <div data-reveal className="now-grid-mobile" style={{ ... }}>
      {/* now cells */}
    </div>
  </GsapReveal>
</section>
```

**Contact CTA section** — put `data-reveal` only on direct children of `<GsapReveal>`, never nested inside another `data-reveal` (querySelectorAll selects all descendants, so nesting would double-animate):
```tsx
<section className="about-page-section" style={{ padding: '72px 40px' }}>
  <GsapReveal>
    <h2 data-reveal className="font-serif" style={{ ... }}>
      Let's make something <span style={{ color: '#FF3120' }}>worth making.</span>
    </h2>
    <p data-reveal className="font-mono" style={{ ... }}>Or just say hello. Either works.</p>
    <div data-reveal className="flex items-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
      <a href="https://www.instagram.com/pramitranjann/" ...>SAY HELLO →</a>
      <CVButton />
    </div>
  </GsapReveal>
</section>
```

- [ ] **Step 3: Add GsapReveal to hero sections on work and creative pages**

In `app/work/page.tsx`, import `GsapReveal` and wrap the hero section content (h1, body text — not the eyebrow div which has its own IntersectionObserver animation):

```tsx
import { GsapReveal } from '@/components/GsapReveal'

{/* In the hero section, after the eyebrowRef div: */}
<GsapReveal>
  <h1 data-reveal className="font-serif" style={{ ... }}>All projects.</h1>
  <p data-reveal className="font-mono" style={{ ... }}>Five projects across...</p>
</GsapReveal>
```

Same pattern for `app/creative/page.tsx` hero section.

- [ ] **Step 4: Verify scroll reveals**

Run: `npm run dev`
Navigate to `/about` — scroll down and confirm each section's content fades up as it enters the viewport.
Navigate to `/work` — confirm the hero h1 and body text reveal on scroll (the eyebrow line animation still fires independently).
Navigate to `/creative` — same check.
Navigate to any case study — sections below the hero should reveal on scroll.

- [ ] **Step 5: Commit**

```bash
git add components/GsapReveal.tsx app/about/page.tsx app/work/page.tsx app/creative/page.tsx
git commit -m "feat: GsapReveal component and scroll reveals on interior pages"
```

---

## Task 4: Scroll Reveals on CaseStudyLayout

**Files:**
- Modify: `components/CaseStudyLayout.tsx`

Note: `CaseStudyLayout.tsx` is already `'use client'`. `<GsapReveal>` is used here for consistency, not server-component isolation.

- [ ] **Step 1: Import GsapReveal**

Add to the imports at the top of `components/CaseStudyLayout.tsx`:
```tsx
import { GsapReveal } from './GsapReveal'
```

- [ ] **Step 2: Wrap content sections**

The hero section (title, oneliner, hero image) does NOT get a reveal — it appears immediately.

Starting from the Overview section, wrap each section's inner content. The `<section>` tag stays as-is; wrap the inner div or content:

**Overview** (lines ~93–102):
```tsx
<section className="case-study-section border-b border-divider" style={{ padding: '48px 40px' }}>
  <GsapReveal>
    <div data-reveal className="case-study-meta-grid grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
      <span className="font-mono" style={{ ... }}>OVERVIEW</span>
      <p className="case-study-body font-mono" style={{ ... }}>{overview ?? '...'}</p>
    </div>
  </GsapReveal>
</section>
```

**My Role** (lines ~104–133):
```tsx
<section className="case-study-section border-b border-divider" style={{ padding: '48px 40px' }}>
  <GsapReveal>
    <div data-reveal className="case-study-meta-grid grid" style={{ ... }}>
      {/* label + role text + tags */}
    </div>
  </GsapReveal>
</section>
```

**Process section** — wrap the `RuleLabel` and each sub-section (Research, Ideation, Key Decisions, Usability Testing) individually with `data-reveal` on each block:
```tsx
<section className="case-study-section border-b border-divider" style={{ padding: '48px 40px' }}>
  <GsapReveal>
    <div data-reveal><RuleLabel number="PROCESS_" /></div>
    <div data-reveal className="mb-10">
      <p className="font-mono mb-3" style={{ color: '#FF3120' }}>RESEARCH_</p>
      <p className="case-study-body font-mono" style={{ ... }}>{research ?? '...'}</p>
      <div className="case-study-research-image mt-6 w-full" style={{ ... }}>
        {researchImage && <Image ... />}
      </div>
    </div>
    <div data-reveal className="mb-10">
      {/* Ideation block */}
    </div>
    <div data-reveal>
      {/* Key Decisions block */}
    </div>
    {usabilityTesting && <div data-reveal>{/* Usability Testing block */}</div>}
  </GsapReveal>
</section>
```

Apply the same `<GsapReveal>` + `data-reveal` pattern to the Solution and Reflection sections.

- [ ] **Step 3: Verify on case study page**

Run: `npm run dev`
Navigate to `/work/franklins` (or any case study) — scroll down and confirm sections reveal as they enter the viewport.
Confirm the hero (title + image) does NOT animate — it should appear immediately.

- [ ] **Step 4: Commit**

```bash
git add components/CaseStudyLayout.tsx
git commit -m "feat: scroll reveals on case study pages via GsapReveal"
```

---

## Task 5: Page Transition Component

**Files:**
- Create: `components/PageTransition.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create components/PageTransition.tsx**

```tsx
// components/PageTransition.tsx
'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)
// Matches the spec's cubic-bezier(0.77, 0, 0.175, 1) — the same curve used in the intro animation
CustomEase.create('wipe', '0.77, 0, 0.175, 1')

function getLabel(path: string): string {
  if (path.startsWith('/work')) return 'WORK_'
  if (path.startsWith('/creative')) return 'CREATIVE_'
  if (path.startsWith('/about')) return 'ABOUT_'
  return ''
}

export function PageTransition() {
  const pathname = usePathname()
  const prevPathname = useRef<string>(pathname)
  const panelRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const isAnimating = useRef(false)

  useEffect(() => {
    const prev = prevPathname.current
    prevPathname.current = pathname

    // Skip: same page, or homepage involved in either direction, or already animating
    if (prev === pathname) return
    if (prev === '/' || pathname === '/') return
    if (isAnimating.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const panel = panelRef.current
    const label = labelRef.current
    if (!panel || !label) return

    label.textContent = getLabel(pathname)
    isAnimating.current = true

    gsap.timeline({ onComplete: () => { isAnimating.current = false } })
      .set(panel, { xPercent: -100, autoAlpha: 1 })
      .to(panel, { xPercent: 0, duration: 0.45, ease: 'wipe' })
      .to(panel, { xPercent: 100, duration: 0.45, ease: 'wipe', delay: 0.1 })
      .set(panel, { autoAlpha: 0 })
  }, [pathname])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#080808',
        zIndex: 100,
        visibility: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '24px 32px',
        pointerEvents: 'none',
      }}
    >
      {/* Red trailing edge */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '3px',
        background: '#FF3120',
      }} />
      <span
        ref={labelRef}
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11px',
          letterSpacing: '0.18em',
          color: '#FF3120',
        }}
      />
    </div>
  )
}
```

Note: Uses `visibility: hidden` (via `autoAlpha: 0`) instead of `display: none` so GSAP can animate it without layout recalculation issues. `pointerEvents: 'none'` ensures it never blocks interaction while invisible.

- [ ] **Step 2: Add PageTransition to app/layout.tsx**

Add import:
```tsx
import { PageTransition } from '@/components/PageTransition'
```

Add `<PageTransition />` as a sibling in the body, alongside the existing `<SoundRouteListener />`:
```tsx
<body style={{ backgroundColor: '#0d0d0d', color: '#f5f2ed' }}>
  <SoundRouteListener />
  <PageTransition />
  {children}
</body>
```

- [ ] **Step 3: Verify page transitions**

Run: `npm run dev`
- Navigate `/work` → `/about`: dark panel wipes across, "ABOUT_" label visible bottom-left, red trailing edge
- Navigate `/about` → `/creative`: "CREATIVE_" label
- Navigate `/creative` → `/work/franklins`: "WORK_" label
- Navigate home (`/`) → `/work`: **no wipe** (homepage excluded)
- Navigate `/about` → home (`/`): **no wipe** (homepage excluded)
- Navigate `/work/franklins` → `/work/loomlearn`: "WORK_" label (both are /work/*)

- [ ] **Step 4: Commit**

```bash
git add components/PageTransition.tsx app/layout.tsx
git commit -m "feat: page transition wipe animation with GSAP"
```

---

## Final Check

- [ ] Run `npm run build` — confirm no TypeScript or build errors
- [ ] Navigate through all pages checking no visual regressions
- [ ] Confirm homepage (scroll stages, carousel) is completely untouched
- [ ] Commit if any build-only fixes needed

```bash
git add -A
git commit -m "fix: resolve any build errors from GSAP animation implementation"
git push
```
