# Interactive Sounds — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Add subtle micro-sounds to four interaction points across the portfolio. The aesthetic is **Soft Digital / Variant A (Precise)**: short, clean sine tones (~80–220ms), synthesised in-browser via Web Audio API. No audio files. No dependencies.

Sounds should be felt more than heard — they confirm actions without demanding attention. If the user has `prefers-reduced-motion` set, all sounds are silently skipped (see note below).

> **Note on `prefers-reduced-motion`:** There is no `prefers-less-audio` media query in the browser. `prefers-reduced-motion` is used as a conservative proxy for "minimal sensory feedback" preference. This is a deliberate simplification: a user who prefers reduced motion but relies on audio feedback would lose sounds. Acceptable tradeoff for a portfolio at this scope. OS/browser volume remains the primary user control.

---

## Sound Design

All envelope values are fully specified. All sounds use `OscillatorNode` (type: `'sine'`) via Web Audio API.

| Interaction | Tone 1 | Tone 2 | Notes |
|---|---|---|---|
| NAV CLICK | 1100 Hz, gain 0.09, attack 8ms, decay 90ms | — | Single tone, tight and clean |
| LIGHTBOX NAV | 1050 Hz, gain 0.07, attack 8ms, decay 120ms | 880 Hz, gain 0.05, attack 8ms, decay 100ms — starts 60ms after tone 1 | Two-tone slide feel |
| CARD ENTER | 880 Hz, gain 0.08, attack 8ms, decay 90ms | 1320 Hz, gain 0.07, attack 8ms, decay 100ms — starts 55ms after tone 1 | Ascending pair, affirmative |
| PAGE ARRIVE | 660 Hz, gain 0.05, attack 40ms, decay 220ms | 990 Hz, gain 0.03, attack 40ms, decay 180ms — starts 30ms after tone 1 | Very soft, layered, barely perceptible |

---

## Architecture

### `lib/sounds.ts`

Single new module. Exports four play functions. All synthesis lives here.

**Singleton AudioContext** — created lazily on first call (always user-gesture-triggered at that point). Calls `.resume()` if context exists but is in `'suspended'` state (handles Safari background-tab case). Returns `null` server-side (`typeof window === 'undefined'` guard).

**Reduced motion guard** — checked on each call via `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. Returns immediately without creating audio if matched.

**First-mount silent-fail for `playPageArrive`** — `playPageArrive()` checks whether the singleton context exists AND is in `'running'` state before playing. If context is `null` or `state !== 'running'`, it returns silently. This handles the case where `SoundRouteListener` fires on first page load before the user has interacted.

```
lib/
  sounds.ts        ← new
```

**Exports:**
- `playNav()` — nav link click
- `playLightboxNav()` — lightbox prev or next
- `playCardEnter()` — entering a project card
- `playPageArrive()` — new page loaded (silent-fail if context not yet running)

---

### `components/SoundRouteListener.tsx`

New `'use client'` component. Uses `usePathname()` from `next/navigation` and `useEffect` to call `playPageArrive()` on pathname changes. Keeping this as a separate component preserves `app/layout.tsx` as a Server Component.

**Placement:** rendered inside `<body>` in `app/layout.tsx`, before `{children}`.

---

## Integration Points

### `components/Nav.tsx`
Already `'use client'`. Add `onClick={() => playNav()}` to:
- The `PR` logo `<Link href="/">` — clicking the logo is a navigation action
- Each of the three nav `<Link>` components in the `links` array

### `components/PhotoLightbox.tsx`
Add `playLightboxNav()` inside both button `onClick` handlers, called before `onPrev()` / `onNext()`:
```tsx
onClick={(e) => { e.stopPropagation(); playLightboxNav(); onPrev() }}
onClick={(e) => { e.stopPropagation(); playLightboxNav(); onNext() }}
```

### `components/ProjectCard.tsx`
This is currently a Server Component (no `'use client'` directive). **Add `'use client'` at the top of this file** as part of this task. Then add `onClick={() => playCardEnter()}` to the `<Link>` wrapper in the non-`comingSoon` branch.

### `app/layout.tsx`
Import and render `<SoundRouteListener />` inside `<body>`, before `{children}`.

---

## What Is Not Included

- Card hover sounds (intentionally excluded — too much)
- Film strip carousel sounds (replaced by lightbox nav)
- Volume control or sound toggle UI
- Audio files of any kind

---

## Constraints

- **SSR safe**: all `window` access guarded in `lib/sounds.ts`
- **No new dependencies**
- **No audio files** — runtime Web Audio API synthesis only
- **Graceful degradation**: browsers without Web Audio API fail silently (try/catch around `new AudioContext()`)
