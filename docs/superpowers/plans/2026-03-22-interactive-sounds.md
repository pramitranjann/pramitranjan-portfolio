# Interactive Sounds Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four Web Audio API micro-sounds (nav click, lightbox nav, card enter, page arrive) to the portfolio with no audio files and no new dependencies.

**Architecture:** A singleton `lib/sounds.ts` module owns all synthesis and AudioContext lifecycle. Four components each get a one-line `onClick` addition. A new `SoundRouteListener` client component handles page-arrive sounds via `usePathname`.

**Tech Stack:** Next.js 16 App Router, Web Audio API (native browser), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-22-interactive-sounds-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/sounds.ts` | Create | AudioContext singleton + 4 play functions |
| `components/SoundRouteListener.tsx` | Create | Page-arrive sound via usePathname |
| `app/layout.tsx` | Modify | Render SoundRouteListener inside body |
| `components/Nav.tsx` | Modify | playNav() on PR logo + 3 nav links |
| `components/PhotoLightbox.tsx` | Modify | playLightboxNav() on prev/next buttons |
| `components/ProjectCard.tsx` | Modify | Add 'use client' + playCardEnter() on card link |

---

## Task 1: Create `lib/sounds.ts`

**Files:**
- Create: `lib/sounds.ts`

- [ ] **Step 1: Create the lib directory**

```bash
mkdir -p /Users/pramitranjan/portfolio/lib
```

- [ ] **Step 2: Create lib/sounds.ts**

```typescript
// lib/sounds.ts

let _ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  try {
    if (!_ctx) _ctx = new AudioContext()
    if (_ctx.state === 'suspended') _ctx.resume()
    return _ctx
  } catch {
    return null
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  gain: number,
  startTime: number,
  attackSec: number,
  decaySec: number,
) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, startTime)
  g.gain.linearRampToValueAtTime(gain, startTime + attackSec)
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + decaySec)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + decaySec + 0.01)
}

export function playNav() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  tone(ctx, 1100, 0.09, t, 0.008, 0.09)
}

export function playLightboxNav() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  tone(ctx, 1050, 0.07, t,        0.008, 0.12)
  tone(ctx, 880,  0.05, t + 0.06, 0.008, 0.10)
}

export function playCardEnter() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  tone(ctx, 880,  0.08, t,        0.008, 0.09)
  tone(ctx, 1320, 0.07, t + 0.055, 0.008, 0.10)
}

export function playPageArrive() {
  const ctx = getCtx()
  // Silent-fail if AudioContext hasn't been unlocked by a user gesture yet
  if (!ctx || ctx.state !== 'running') return
  const t = ctx.currentTime
  tone(ctx, 660, 0.05, t,        0.04, 0.22)
  tone(ctx, 990, 0.03, t + 0.03, 0.04, 0.18)
}
```

- [ ] **Step 3: Verify the file compiles**

Run: `cd /Users/pramitranjan/portfolio && npx tsc --noEmit`
Expected: No errors from `lib/sounds.ts`

- [ ] **Step 4: Commit**

```bash
git add lib/sounds.ts
git commit -m "feat: add Web Audio API sounds module"
```

---

## Task 2: Create `components/SoundRouteListener.tsx`

**Files:**
- Create: `components/SoundRouteListener.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/SoundRouteListener.tsx
'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { playPageArrive } from '@/lib/sounds'

export function SoundRouteListener() {
  const pathname = usePathname()
  const prevPathname = useRef<string | null>(null)

  useEffect(() => {
    // Skip on first mount — no user gesture yet
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      playPageArrive()
    }
    prevPathname.current = pathname
  }, [pathname])

  return null
}
```

Note: `playPageArrive()` already has its own `ctx.state !== 'running'` guard, but the `prevPathname` ref guard here is an additional safety layer — it ensures we never even attempt to play on initial mount, regardless of context state.

- [ ] **Step 2: Verify compiles**

Run: `cd /Users/pramitranjan/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/SoundRouteListener.tsx
git commit -m "feat: add SoundRouteListener for page-arrive sound"
```

---

## Task 3: Wire `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

Current `<body>` line (line 30):
```tsx
<body style={{ backgroundColor: '#0d0d0d', color: '#f5f2ed' }}>{children}</body>
```

- [ ] **Step 1: Add SoundRouteListener import and render it**

Add import at top of file (after existing imports):
```tsx
import { SoundRouteListener } from '@/components/SoundRouteListener'
```

Replace the `<body>` line with:
```tsx
<body style={{ backgroundColor: '#0d0d0d', color: '#f5f2ed' }}>
  <SoundRouteListener />
  {children}
</body>
```

- [ ] **Step 2: Verify compiles**

Run: `cd /Users/pramitranjan/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: mount SoundRouteListener in root layout"
```

---

## Task 4: Wire `components/Nav.tsx`

**Files:**
- Modify: `components/Nav.tsx`

- [ ] **Step 1: Add playNav import**

Add to the import block at top of file:
```tsx
import { playNav } from '@/lib/sounds'
```

- [ ] **Step 2: Add onClick to PR logo link**

Current (line 24–30):
```tsx
<Link
  href="/"
  className="font-mono"
  style={{ fontSize: '16px', letterSpacing: '0.14em', color: '#FF3120', textDecoration: 'none' }}
>
  PR
</Link>
```

Replace with:
```tsx
<Link
  href="/"
  className="font-mono"
  style={{ fontSize: '16px', letterSpacing: '0.14em', color: '#FF3120', textDecoration: 'none' }}
  onClick={playNav}
>
  PR
</Link>
```

- [ ] **Step 3: Add onClick to mapped nav links**

Current (line 35–43):
```tsx
<Link
  key={href}
  href={href}
  className={`nav-link font-mono${active ? ' active' : ''}`}
  style={{ fontSize: '13px', letterSpacing: '0.14em', textDecoration: 'none' }}
>
  {label}
</Link>
```

Replace with:
```tsx
<Link
  key={href}
  href={href}
  className={`nav-link font-mono${active ? ' active' : ''}`}
  style={{ fontSize: '13px', letterSpacing: '0.14em', textDecoration: 'none' }}
  onClick={playNav}
>
  {label}
</Link>
```

- [ ] **Step 4: Verify compiles**

Run: `cd /Users/pramitranjan/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: play nav sound on nav link clicks"
```

---

## Task 5: Wire `components/PhotoLightbox.tsx`

**Files:**
- Modify: `components/PhotoLightbox.tsx`

- [ ] **Step 1: Add playLightboxNav import**

Add to imports at top of file:
```tsx
import { playLightboxNav } from '@/lib/sounds'
```

- [ ] **Step 2: Update PREV button onClick (line 81)**

Current:
```tsx
onClick={(e) => { e.stopPropagation(); onPrev() }}
```

Replace with:
```tsx
onClick={(e) => { e.stopPropagation(); playLightboxNav(); onPrev() }}
```

- [ ] **Step 3: Update NEXT button onClick (line 97)**

Current:
```tsx
onClick={(e) => { e.stopPropagation(); onNext() }}
```

Replace with:
```tsx
onClick={(e) => { e.stopPropagation(); playLightboxNav(); onNext() }}
```

- [ ] **Step 4: Verify compiles**

Run: `cd /Users/pramitranjan/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add components/PhotoLightbox.tsx
git commit -m "feat: play lightbox sound on prev/next navigation"
```

---

## Task 6: Wire `components/ProjectCard.tsx`

**Files:**
- Modify: `components/ProjectCard.tsx`

- [ ] **Step 1: Add 'use client' directive**

Add as the very first line of the file (before all imports):
```tsx
'use client'
```

- [ ] **Step 2: Add playCardEnter import**

Add to imports:
```tsx
import { playCardEnter } from '@/lib/sounds'
```

- [ ] **Step 3: Add onClick to the Link wrapper**

The non-`comingSoon` branch returns a `<Link>` (lines 91–97):
```tsx
<Link
  href={href}
  className="card-link"
  style={{ display: 'block', textDecoration: 'none', height: '100%' }}
>
  {inner}
</Link>
```

Replace with:
```tsx
<Link
  href={href}
  className="card-link"
  style={{ display: 'block', textDecoration: 'none', height: '100%' }}
  onClick={playCardEnter}
>
  {inner}
</Link>
```

- [ ] **Step 4: Verify compiles**

Run: `cd /Users/pramitranjan/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Verify build passes**

Run: `cd /Users/pramitranjan/portfolio && npm run build`
Expected: Build completes with no errors. Adding 'use client' to ProjectCard may affect any parent Server Components that import it — the build will surface this if so.

- [ ] **Step 6: Commit**

```bash
git add components/ProjectCard.tsx
git commit -m "feat: play card-enter sound when opening a project"
```

---

## Manual Verification Checklist

After all tasks are committed, verify in the browser (run `npm run dev`):

- [ ] Click a nav link — hear a short, clean tone (~90ms)
- [ ] Click the PR logo — hear the same nav tone
- [ ] Open a photo in the lightbox, click PREV / NEXT — hear the two-tone slide sound
- [ ] Click VIEW → on a project card — hear the ascending pair
- [ ] Navigate between pages — hear the soft layered arrival tone (after first nav, not on initial load)
- [ ] No sound on card hover
- [ ] Console has no errors
- [ ] `npm run build` passes clean
