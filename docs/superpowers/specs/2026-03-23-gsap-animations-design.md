# GSAP Animations Design

## Goal

Add GSAP-powered animations to the portfolio in three areas: page transitions, card interactions, and scroll reveals on interior pages. The homepage is untouched. All animations respect `prefers-reduced-motion`.

---

## 1. Page Transitions

### Architecture note (App Router constraint)

In Next.js App Router, `{children}` is a React Server Component subtree. There is no lifecycle hook to hold the outgoing page visible while an animation plays — React replaces the subtree immediately on navigation. The wipe panel therefore works as a **cover layer**: it animates in on pathname change (covering the new page, which has already swapped underneath), holds briefly, then animates off to reveal the new content. The user never sees a flash because the panel covers the viewport the entire time. This is the correct and only viable approach without a third-party library.

### Behaviour

- On any navigation between interior pages (`/work`, `/creative`, `/about`, case studies), a dark panel (`#080808`) wipes left→right across the full viewport.
- A 3px `#FF3120` line rides the right (leading) edge of the panel.
- The destination page name sits bottom-left of the panel in small red mono (`WORK_`, `ABOUT_`, `CREATIVE_`). For case study URLs (`/work/[slug]`), show `WORK_`.
- **Homepage (`/`) is excluded in both directions.** No wipe fires when navigating to or from `/`. The `<PageTransition>` component checks both `prevPathname` and `pathname` — if either is `/`, skip the animation.
- For any unrecognised pathname, show no label (empty string).

### Label map

```ts
const LABELS: Record<string, string> = {
  '/work':     'WORK_',
  '/creative': 'CREATIVE_',
  '/about':    'ABOUT_',
}
// /work/[slug] → 'WORK_'
function getLabel(path: string): string {
  if (path.startsWith('/work')) return 'WORK_'
  return LABELS[path] ?? ''
}
```

### Timing

- Wipe in: `0.45s`, `cubic-bezier(0.77, 0, 0.175, 1)`
- Hold: `0.1s`
- Wipe off: `0.45s`, same easing

### Reduced motion

Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before running the GSAP timeline. If true, skip the animation entirely (instant reveal).

### Relationship to `SoundRouteListener`

`app/layout.tsx` already has a `<SoundRouteListener />` sibling that uses the same `usePathname` + `prevPathname` pattern to play audio on navigation. `<PageTransition>` is independent of it — both listen to the same pathname change and fire concurrently. No coordination is needed. Homepage exclusion is handled inside `<PageTransition>` itself (checking `prevPathname` and `pathname` before running the GSAP timeline), not at the layout level.

### Files

- **New:** `components/PageTransition.tsx` — `'use client'`, uses `usePathname` + `useRef` for a `gsap.timeline()`
- **Modify:** `app/layout.tsx` — render `<PageTransition />` as a sibling to `{children}` and `<SoundRouteListener />`, not wrapping anything (the panel is position-fixed, not in the content flow)

---

## 2. Card Animations

### 2a. Entrance (scroll into view)

**Trigger:** GSAP ScrollTrigger fires when the card grid enters the viewport (`start: "top 85%"`).

**Animation:** Each card scales `0.93 → 1.0` and fades `opacity: 0 → 1`, staggered 110ms per card. Duration `0.5s`, easing `power2.out`.

**Reduced motion:** Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before registering ScrollTrigger. If true, set all cards to `{ opacity: 1, scale: 1 }` immediately and skip.

**Cleanup:** The component that mounts ScrollTrigger must clean up on unmount:
```ts
useEffect(() => {
  const ctx = gsap.context(() => { /* ScrollTrigger setup */ }, containerRef)
  return () => ctx.revert()
}, [])
```

**Files:**
- **Modify:** `app/work/page.tsx` — already `'use client'` and already has a `useEffect` with an `IntersectionObserver` for the eyebrow animation (do not remove it). Add a **second** `useEffect` for ScrollTrigger, scoped to the card grid ref.
- **Modify:** `app/creative/page.tsx` — same pattern (already `'use client'`)

### 2b. Hover (pure CSS — no GSAP)

Three layered effects, added as CSS classes to `globals.css` and applied in `ProjectCard.tsx`:

1. **Lift + shadow:** Card gains `translateY(-4px)`. The existing `.portfolio-card` rule currently has `transition: border-color 0.2s ease, box-shadow 0.2s ease`. Extend it to the full comma-separated value — do not replace it:
   ```css
   transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
   ```
   The `.portfolio-card:hover` box-shadow is updated to a comma-separated value that preserves the existing red glow and adds lift shadow and transform:
   ```css
   transform: translateY(-4px);
   box-shadow: 0 0 0 1px #FF3120,
               0 0 32px rgba(255, 49, 32, 0.1),
               0 8px 24px rgba(0, 0, 0, 0.4);
   ```

2. **Title underline:** Wrap the card title in a `<span class="card-title-inner">`. Add a `::after` pseudo-element that draws in from the left (same pattern as the existing `.social-link::after` in `globals.css`):
   ```css
   .card-title-inner { position: relative; display: inline; }
   .card-title-inner::after {
     content: '';
     position: absolute;
     bottom: -2px; left: 0; right: 0;
     height: 1px;
     background: #FF3120;
     transform: scaleX(0);
     transform-origin: left;
     transition: transform 0.3s ease;
   }
   .portfolio-card:hover .card-title-inner::after { transform: scaleX(1); }
   ```

3. **CTA expand:**
   ```css
   .card-cta-inner { transition: letter-spacing 0.25s ease; }
   .portfolio-card:hover .card-cta-inner { letter-spacing: 0.2em; }
   ```

**Files:**
- **Modify:** `app/globals.css` — update `.portfolio-card` transition, update `.portfolio-card:hover` box-shadow, add `.card-title-inner` and `.card-cta-inner` rules
- **Modify:** `components/ProjectCard.tsx` — wrap title text in `<span class="card-title-inner">`, wrap CTA text in `<span class="card-cta-inner">`

---

## 3. Scroll Reveals — Interior Pages

**Scope:** `/about`, `/work`, `/creative`, all case study pages. Homepage excluded.

**Pattern:** Use a `<GsapReveal>` wrapper client component (not a hook) so it can be dropped into server component pages without making the whole page `'use client'`. `app/about/page.tsx` is a server component so this matters there. `components/CaseStudyLayout.tsx` is already `'use client'` — `<GsapReveal>` is used there for consistency, not for server-component isolation. The component accepts `children` and a `stagger` prop (default `0.08`).

**Animation:** Children elements tagged with `data-reveal` fade up — `opacity: 0→1`, `translateY: 16px→0`. Duration `0.6s`, easing `power2.out`, stagger `0.08s`. Trigger: `start: "top 85%"`.

**Reduced motion:** Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` on mount. If true, immediately set all `[data-reveal]` children to their final state.

**Cleanup:** Use `gsap.context()` scoped to the wrapper ref, call `ctx.revert()` on unmount.

```tsx
// Usage
<GsapReveal>
  <span data-reveal>EXPERIENCE_</span>
  <h3 data-reveal>Vircle Malaysia</h3>
  <p data-reveal>...</p>
</GsapReveal>
```

**Files:**
- **New:** `components/GsapReveal.tsx` — `'use client'`, ScrollTrigger-based wrapper
- **Modify:** `app/about/page.tsx` — wrap section content blocks in `<GsapReveal>`
- **Modify:** `components/CaseStudyLayout.tsx` — wrap content sections in `<GsapReveal>`
- `/work/page.tsx` and `/creative/page.tsx` already get ScrollTrigger via card entrance; add `<GsapReveal>` to hero/header sections on those pages

---

## Constraints

- GSAP is installed (`npm install gsap` already done)
- `gsap.registerPlugin(ScrollTrigger)` must be called in every `'use client'` file that uses ScrollTrigger
- All GSAP code must be inside `useEffect` (client-only, no SSR execution)
- All effects must clean up via `ctx.revert()` or `trigger.kill()` in the `useEffect` return
- Reduced motion: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` in JS before any tween/ScrollTrigger is created; set final state immediately if true
- Do not touch `app/page.tsx`, `HeroCarousel.tsx`, `HeroStage*.tsx`, or any homepage component
