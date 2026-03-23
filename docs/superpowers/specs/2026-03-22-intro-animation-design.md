# Intro Animation Design

## Overview

A full-screen curtain animation plays once when the user first arrives at the homepage. A dark overlay covers the hero, displays "PR" typed in character by character with a blinking cursor, then slides upward to reveal the Pramit Ranjan hero stage (Stage 0 of the HeroCarousel).

The animation plays exactly once per session — not on every navigation back to `/`, only on the initial page load.

---

## Animation Sequence

| Time | Event |
|------|-------|
| 0ms | Page loads. Curtain is visible, covering the hero. Cursor blinks. |
| ~1100ms | "P" types in. |
| ~1650ms | "R" types in (slightly uneven gap — human, not robotic). |
| ~2200ms | Cursor hides. |
| ~2450ms | Curtain slides upward — `translateY(-100%)` over 850ms with `cubic-bezier(0.77, 0, 0.175, 1)`. |
| ~3300ms | Curtain fully gone. Hero carousel visible. |

**PR text** — DM Mono, `clamp(80px, 11vw, 130px)`, `#FF3120`, `letter-spacing: 0.14em`.
**Cursor** — thin vertical bar (`4px × 0.8em`), same red, blinks at 0.7s step-end.
**Curtain background** — `#060606` (slightly darker than page background `#0d0d0d`).

---

## Visual Note: dual "PR"

While the curtain is visible, the nav's "PR" logomark (small, 13px, top-left) is visible above the curtain (`nav z-index: 50 > curtain z-index: 30`). This is intentional — the small nav mark and the large typewriter text create a deliberate echo, connecting the initials to the brand mark. No change needed.

---

## Scope

- Plays **once per page session** — on initial load only. Navigating away and back does not replay.
- Does not interfere with the HeroCarousel. The curtain sits above the carousel and lifts off, handing control to the existing carousel.
- The HeroCarousel's existing `body.carousel-active` class already hides `<main>` and manages scroll during the carousel; `IntroAnimation` does not need to manage scroll or body positioning.
- No skip button. Total animation time is ~3.3s.

---

## `prefers-reduced-motion`

If `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, skip the translate lift and instead fade the curtain out (`opacity 0` over 300ms) at the same point in the sequence. The typewriter sequence (no physical motion) plays as normal. Computed once at component body level, outside `useEffect` — no listener needed.

---

## Implementation

### Component: `IntroAnimation`

New `'use client'` component rendered in `app/page.tsx`.

**"Once per session" guard — lazy initializer:**

```ts
const [done, setDone] = useState(() => {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('pr-intro-v1') === '1'
})
```

Using a lazy initializer (not `useEffect`) prevents a one-frame flash of the curtain on returning visits. The `typeof window === 'undefined'` guard makes it SSR-safe.

On completion, call `sessionStorage.setItem('pr-intro-v1', '1')`. Key is namespaced to avoid collisions.

**Render:** when `done` is `false`, renders the curtain div. When `done` is `true`, returns `null`.

**Curtain div styles:**
- `position: fixed`
- `top: 57px` (below nav)
- `left: 0, right: 0`
- `height: calc(100vh - 57px)` — explicit, matches HeroCarousel
- `z-index: 30` (above HeroCarousel `z-index: 10`, below nav `z-index: 50`)
- `background: #060606`

**`reducedMotion` — compute at component level:**

```ts
// Outside useEffect, at component body level — safe to call on every render, cheap, SSR-guarded
const reducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

This makes `reducedMotion` available in both the `useEffect` closure and the JSX render path without a `useRef`.

**`useEffect` — timers with cleanup:**

```ts
useEffect(() => {
  const ids: ReturnType<typeof setTimeout>[] = []

  ids.push(setTimeout(() => setText('P'), 1100))
  ids.push(setTimeout(() => setText('PR'), 1650))
  ids.push(setTimeout(() => setCursorHidden(true), 2200))
  ids.push(setTimeout(() => setLifting(true), 2450))
  ids.push(setTimeout(() => {
    setDone(true)
    sessionStorage.setItem('pr-intro-v1', '1')
  }, 3350)) // 3350ms gives the 850ms lift transition (starts at 2450ms) a 50ms buffer to finish before unmounting

  return () => ids.forEach(clearTimeout) // required — prevents StrictMode double-fire
}, [])
```

Use separate state vars: `text: string`, `cursorHidden: boolean`, `lifting: boolean`. The `lifting` flag drives inline styles in JSX: if `reducedMotion`, apply `opacity: 0, transition: 'opacity 300ms ease'`; otherwise `transform: 'translateY(-100%)', transition: 'transform 850ms cubic-bezier(0.77, 0, 0.175, 1)'`.

### Placement in `app/page.tsx`

```tsx
<Nav />
<IntroAnimation />
<HeroCarousel />
<main>...</main>
```

---

## Files

| File | Change |
|------|--------|
| `components/IntroAnimation.tsx` | Create — new component |
| `app/page.tsx` | Add `<IntroAnimation />` between `<Nav />` and `<HeroCarousel />` |
