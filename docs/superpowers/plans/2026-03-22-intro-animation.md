# Intro Animation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-time-per-session curtain animation to the homepage that types "PR" then slides up to reveal the hero.

**Architecture:** A new `IntroAnimation` client component renders a `position: fixed` dark overlay above the `HeroCarousel`. It sequences five timeouts via `useEffect` (with cleanup to handle StrictMode), then returns `null` when done. Loaded via `next/dynamic` with `{ ssr: false }` — this means the component never renders on the server, eliminating the hydration mismatch that would otherwise occur when `sessionStorage` produces a different `done` value on client vs server. The `sessionStorage` lazy initializer skips the animation on returning visits with no flash.

**Tech Stack:** React 18, Next.js App Router (`next/dynamic`), TypeScript, plain CSS via inline styles — no animation libraries.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `components/IntroAnimation.tsx` | Create | Curtain overlay, typewriter sequence, lift animation |
| `app/page.tsx` | Modify (line 1–13) | Dynamic import + insert `<IntroAnimation />` between `<Nav />` and `<HeroCarousel />` |

---

### Task 1: Create `IntroAnimation` component

**Files:**
- Create: `components/IntroAnimation.tsx`

- [ ] **Step 1: Create the file with the full component**

```tsx
'use client'
import { useEffect, useState } from 'react'

export function IntroAnimation() {
  // Skip animation on returning visits — lazy initializer avoids one-frame flash.
  // Safe here because this component is loaded with { ssr: false } — window always exists.
  const [done, setDone] = useState(
    () => sessionStorage.getItem('pr-intro-v1') === '1'
  )

  const [text, setText] = useState('')
  const [cursorHidden, setCursorHidden] = useState(false)
  const [lifting, setLifting] = useState(false)

  // Computed at component body level so it's available in both useEffect closure and JSX.
  // Always runs on the client (ssr: false), so matchMedia is safe without a typeof guard.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    // done=true means sessionStorage guard fired — no animation needed
    if (done) return

    const ids: ReturnType<typeof setTimeout>[] = []

    ids.push(setTimeout(() => setText('P'), 1100))
    ids.push(setTimeout(() => setText('PR'), 1650))
    ids.push(setTimeout(() => setCursorHidden(true), 2200))
    ids.push(setTimeout(() => setLifting(true), 2450))
    ids.push(
      setTimeout(() => {
        setDone(true)
        sessionStorage.setItem('pr-intro-v1', '1')
      }, 3350) // 50ms buffer after lift ends (2450 + 850 = 3300, +50 = 3350)
    )

    return () => ids.forEach(clearTimeout) // prevents StrictMode double-fire
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (done) return null

  const liftStyle: React.CSSProperties = lifting
    ? reducedMotion
      ? { opacity: 0, transition: 'opacity 300ms ease' }
      : {
          transform: 'translateY(-100%)',
          transition: 'transform 850ms cubic-bezier(0.77, 0, 0.175, 1)',
        }
    : {}

  return (
    <div
      style={{
        position: 'fixed',
        top: '57px',
        left: 0,
        right: 0,
        height: 'calc(100vh - 57px)',
        background: '#060606',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        padding: '0 56px',
        ...liftStyle,
      }}
    >
      <span
        style={{
          fontFamily: '"DM Mono", "Courier New", monospace',
          fontSize: 'clamp(80px, 11vw, 130px)',
          letterSpacing: '0.14em',
          color: '#FF3120',
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        {text}
        <span
          style={{
            display: 'inline-block',
            width: '4px',
            height: '0.8em',
            background: '#FF3120',
            verticalAlign: 'middle',
            marginLeft: '6px',
            opacity: cursorHidden ? 0 : 1,
            animation: cursorHidden ? 'none' : 'pr-cursor-blink 0.7s step-end infinite',
          }}
        />
      </span>

      <style>{`
        @keyframes pr-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Verify the file saved correctly**

```bash
head -3 components/IntroAnimation.tsx
```

Expected:
```
'use client'
import { useEffect, useState } from 'react'
```

- [ ] **Step 3: Commit**

```bash
git add components/IntroAnimation.tsx
git commit -m "feat: add IntroAnimation curtain component"
```

---

### Task 2: Wire `IntroAnimation` into `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

`app/page.tsx` is a server component (no `'use client'`). Use `next/dynamic` with `{ ssr: false }` so `IntroAnimation` is client-only — this eliminates the hydration mismatch that would occur because `sessionStorage` is unavailable on the server.

- [ ] **Step 1: Add the dynamic import**

At the top of `app/page.tsx`, after the existing static imports, add:

```tsx
import dynamic from 'next/dynamic'
const IntroAnimation = dynamic(
  () => import('@/components/IntroAnimation').then(m => m.IntroAnimation),
  { ssr: false }
)
```

- [ ] **Step 2: Insert `<IntroAnimation />` into the JSX**

Find:
```tsx
      <Nav />
      <HeroCarousel />
```

Replace with:
```tsx
      <Nav />
      <IntroAnimation />
      <HeroCarousel />
```

- [ ] **Step 3: Verify the full updated file**

```bash
cat app/page.tsx
```

Expected:
```tsx
import { Nav }              from '@/components/Nav'
import { HeroCarousel }     from '@/components/HeroCarousel'
import { SelectedWork }     from '@/components/SelectedWork'
import { PhotographyStage } from '@/components/PhotographyStage'
import { MoreWork }         from '@/components/MoreWork'
import { About }            from '@/components/About'
import { Contact }          from '@/components/Contact'
import { Footer }           from '@/components/Footer'
import dynamic from 'next/dynamic'
const IntroAnimation = dynamic(
  () => import('@/components/IntroAnimation').then(m => m.IntroAnimation),
  { ssr: false }
)

export default function HomePage() {
  return (
    <>
      <Nav />
      <IntroAnimation />
      <HeroCarousel />
      <main style={{ paddingTop: '57px' }}>
        ...
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Start dev server and visually verify the animation**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected behaviour in order:
1. Dark curtain visible, cursor blinking (no text yet)
2. ~1.1s — "P" appears
3. ~1.65s — "R" appears (slightly later than "P", feels human)
4. ~2.2s — cursor stops blinking, disappears
5. ~2.45s — curtain slides up, revealing "Pramit Ranjan" hero stage
6. ~3.35s — curtain removed from DOM, hero fully interactive

- [ ] **Step 5: Verify "once per session" guard**

Navigate to `/work`, then back to `/` — animation should NOT replay.

In browser devtools console:
```js
sessionStorage.getItem('pr-intro-v1') // → '1' after animation completes
sessionStorage.removeItem('pr-intro-v1') // clear to test replay
```

After clearing: hard-reload `http://localhost:3000` — animation plays again.

- [ ] **Step 6: Verify no hydration mismatch in console**

With the dev server running, open browser devtools Console. There should be zero React hydration warnings on both first visit and returning visit.

- [ ] **Step 7: Verify `prefers-reduced-motion`**

In Chrome DevTools → More tools → Rendering → "Emulate CSS media feature" → set `prefers-reduced-motion: reduce`.

Reload. Expected: typewriter sequence plays as normal, but at ~2.45s the curtain fades out (`opacity: 0`) instead of sliding up.

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire IntroAnimation into homepage via dynamic import"
```
