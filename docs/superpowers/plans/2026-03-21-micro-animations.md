# Micro Animations Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consistent micro animations across the portfolio — arrow nudge on cards/links, nav red dot, social underline draw, and scroll-in eyebrow animation.

**Architecture:** All animations are pure CSS (transitions, keyframes, pseudo-elements) added to `globals.css` as named classes. Components receive class names; no new JS libraries. The single exception is the eyebrow scroll-in which reuses the existing IntersectionObserver pattern from `About.tsx`.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v4, plain CSS in `app/globals.css`

---

### Task 1: Add all CSS to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add arrow nudge rules**

In `app/globals.css`, after the `.portfolio-card` block, add:

```css
/* Arrow nudge — forward links */
.arrow-nudge {
  display: inline-block;
  transition: transform 0.2s ease;
}
.portfolio-card:hover .arrow-nudge,
a:hover .arrow-nudge {
  transform: translateX(4px);
}

/* Arrow nudge — back links */
.arrow-nudge-back {
  display: inline-block;
  transition: transform 0.2s ease;
}
a:hover .arrow-nudge-back {
  transform: translateX(-4px);
}
```

- [ ] **Step 2: Add nav link rules**

```css
/* Nav link — red dot expands on hover */
.nav-link {
  display: inline-flex;
  align-items: center;
  color: #999999;
  transition: color 0.2s ease;
  text-decoration: none;
}
.nav-link::before {
  content: '';
  display: inline-block;
  width: 0;
  height: 6px;
  border-radius: 3px;
  background: #FF3120;
  transition: width 0.2s ease, margin-right 0.2s ease;
  margin-right: 0;
}
.nav-link:hover {
  color: #f5f2ed;
}
.nav-link:hover::before {
  width: 6px;
  margin-right: 6px;
}
.nav-link.active {
  color: #FF3120;
}
.nav-link.active::before {
  width: 6px;
  margin-right: 6px;
}
```

- [ ] **Step 3: Add social link rules**

```css
/* Social link — underline draws in from left */
.social-link {
  position: relative;
  color: #888888;
  text-decoration: none;
  transition: color 0.2s ease;
}
.social-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: #FF3120;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
}
.social-link:hover {
  color: #FF3120;
}
.social-link:hover::after {
  transform: scaleX(1);
}
```

- [ ] **Step 4: Add eyebrow scroll-in rules**

```css
/* Section eyebrow — scroll-in animation */
@keyframes eyebrow-label {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

.eyebrow-line {
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}
.eyebrow-label {
  opacity: 0;
}
.eyebrow-animate .eyebrow-line {
  transform: scaleX(1);
}
.eyebrow-animate .eyebrow-label {
  animation: eyebrow-label 0.4s ease 0.2s both;
}
```

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: add micro animation CSS classes"
```

---

### Task 2: Update ProjectCard — add VIEW → to supporting variant

**Files:**
- Modify: `components/ProjectCard.tsx`

The supporting variant currently renders title + category only. Add VIEW → after the category div.

- [ ] **Step 1: Add VIEW → to supporting variant**

In `components/ProjectCard.tsx`, in the `variant === 'supporting'` branch, add after the category div:

```tsx
<div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em', marginTop: '8px' }}>
  VIEW <span className="arrow-nudge">→</span>
</div>
```

The full supporting variant inner div becomes:
```tsx
<div className="portfolio-card" style={cardBase}>
  <div className="work-card-image" style={{ aspectRatio: imageRatio ?? '3 / 4', width: '100%', backgroundColor: '#252525', border: '1px solid #333333', marginBottom: '12px' }} />
  <div className="font-serif" style={{ fontSize: 'var(--text-body)', color: '#f5f2ed' }}>{title}</div>
  <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', marginTop: '4px', letterSpacing: '0.1em' }}>{category}</div>
  <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em', marginTop: '8px' }}>
    VIEW <span className="arrow-nudge">→</span>
  </div>
</div>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/pramitranjan/portfolio && npx next build 2>&1 | tail -20
```

Expected: no TypeScript errors relating to ProjectCard.

- [ ] **Step 3: Commit**

```bash
git add components/ProjectCard.tsx
git commit -m "feat: add VIEW → to supporting card variant"
```

---

### Task 3: Update CreativeCard and photography sub-page — wrap arrow, add back link nudge

**Files:**
- Modify: `app/creative/page.tsx`
- Modify: `app/creative/photography/page.tsx`

Handle both in this task (photography file appears in both spec sections 1 and 3 — do both changes in one pass).

- [ ] **Step 1: Wrap arrow in CreativeCard (creative/page.tsx)**

In `app/creative/page.tsx`, find the VIEW → span in `CreativeCard`:
```tsx
: <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120' }}>VIEW →</span>
```

Change to:
```tsx
: <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120' }}>VIEW <span className="arrow-nudge">→</span></span>
```

- [ ] **Step 2: Update photography sub-page — wrap arrow in VIEW → and add back link nudge**

In `app/creative/photography/page.tsx`:

1. Find the VIEW → rendering:
```tsx
{city.comingSoon ? 'COMING SOON' : 'VIEW →'}
```
Change to:
```tsx
{city.comingSoon ? 'COMING SOON' : <>VIEW <span className="arrow-nudge">→</span></>}
```

2. Find the back link `← CREATIVE` and wrap the arrow:
```tsx
← CREATIVE
```
Change to:
```tsx
<span className="arrow-nudge-back">←</span> CREATIVE
```

- [ ] **Step 3: Commit**

```bash
git add app/creative/page.tsx app/creative/photography/page.tsx
git commit -m "feat: arrow nudge on creative cards and photography back link"
```

---

### Task 4: Update mixed-media and branding sub-pages — add VIEW →, wrap back link arrow

**Files:**
- Modify: `app/creative/mixed-media/page.tsx`
- Modify: `app/creative/branding/page.tsx`

These pages have no VIEW → currently. Add it and wrap the back link arrow.

- [ ] **Step 1: Update mixed-media page**

In `app/creative/mixed-media/page.tsx`:

1. Add VIEW → as the last element inside each card div (after the tag span):
```tsx
<span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120', marginTop: '6px', display: 'block' }}>
  VIEW <span className="arrow-nudge">→</span>
</span>
```

2. Wrap the back link arrow:
```tsx
<span className="arrow-nudge-back">←</span> CREATIVE
```

- [ ] **Step 2: Update branding page**

Same changes in `app/creative/branding/page.tsx`:

1. Add VIEW → as last element in each card div.
2. Wrap back link arrow.

- [ ] **Step 3: Commit**

```bash
git add app/creative/mixed-media/page.tsx app/creative/branding/page.tsx
git commit -m "feat: add VIEW → and arrow nudge to mixed-media and branding pages"
```

---

### Task 5: Update Nav — red dot animation

**Files:**
- Modify: `components/Nav.tsx`

Remove inline color styles and mouse handlers; apply CSS class approach.

- [ ] **Step 1: Replace the Link element in the nav links map**

In `components/Nav.tsx`, replace the entire `<Link>` element inside `links.map(...)` (currently lines 35–49):

Current code:
```tsx
<Link
  key={href}
  href={href}
  className="font-mono transition-colors duration-150"
  style={{
    fontSize: '13px',
    letterSpacing: '0.14em',
    color: active ? '#FF3120' : '#666666',
  }}
  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = '#f5f2ed' }}
  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = '#666666' }}
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
>
  {label}
</Link>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/pramitranjan/portfolio && npx next build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: nav red dot animation via CSS class"
```

---

### Task 6: Update About — READ MORE → arrow nudge

**Files:**
- Modify: `components/About.tsx`

- [ ] **Step 1: Wrap the arrow in READ MORE →**

In `components/About.tsx`, find:
```tsx
READ MORE →
```

Change to:
```tsx
READ MORE <span className="arrow-nudge">→</span>
```

- [ ] **Step 2: Commit**

```bash
git add components/About.tsx
git commit -m "feat: arrow nudge on READ MORE link"
```

---

### Task 7: Update Contact — social link underline animation

**Files:**
- Modify: `components/Contact.tsx`

- [ ] **Step 1: Add social-link class and remove inline borderBottom**

In `components/Contact.tsx`, find the `<a>` element inside the socialLinks map. It currently has:
```tsx
className="font-mono"
style={{
  fontSize: 'var(--text-meta)',
  letterSpacing: '0.14em',
  color: '#888888',
  textDecoration: 'none',
  borderBottom: '1px solid #FF3120',
  paddingBottom: '2px',
}}
```

Change to:
```tsx
className="social-link font-mono"
style={{
  fontSize: 'var(--text-meta)',
  letterSpacing: '0.14em',
  paddingBottom: '2px',
}}
```

(Remove `color`, `textDecoration`, and `borderBottom` from inline style — all handled by `.social-link` CSS class. Keep `paddingBottom` inline.)

- [ ] **Step 2: Commit**

```bash
git add components/Contact.tsx
git commit -m "feat: social link underline draw animation"
```

---

### Task 8: Eyebrow scroll-in — creative page

**Files:**
- Modify: `app/creative/page.tsx`

`app/creative/page.tsx` already has `'use client'`. Add IntersectionObserver for the eyebrow.

- [ ] **Step 1: Add useRef and useEffect imports**

At the top of `app/creative/page.tsx`, the import line is currently:
```tsx
'use client'

import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
```

Add React imports:
```tsx
'use client'

import { useEffect, useRef } from 'react'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
```

- [ ] **Step 2: Add eyebrow ref and observer to CreativePage**

In `CreativePage`, add a ref and useEffect before the return statement:
```tsx
export default function CreativePage() {
  const eyebrowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = eyebrowRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('eyebrow-animate')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    // ...
  )
}
```

- [ ] **Step 3: Add classes and ref to the eyebrow div**

In the hero section of `CreativePage`, find:
```tsx
<div className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
  <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
  <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>CREATIVE_</span>
</div>
```

Replace with:
```tsx
<div ref={eyebrowRef} className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
  <div className="eyebrow-line" style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
  <span className="eyebrow-label font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>CREATIVE_</span>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add app/creative/page.tsx
git commit -m "feat: eyebrow scroll-in animation on creative page"
```

---

### Task 9: Eyebrow scroll-in — work page

**Files:**
- Modify: `app/work/page.tsx`

`app/work/page.tsx` is currently a Server Component (no `'use client'`). Adding the observer requires converting it.

- [ ] **Step 1: Add 'use client' and imports**

At the top of `app/work/page.tsx`, change:
```tsx
// app/work/page.tsx
import { Nav } from '@/components/Nav'
```

To:
```tsx
'use client'

import { useEffect, useRef } from 'react'
import { Nav } from '@/components/Nav'
```

- [ ] **Step 2: Add ref and observer to WorkPage**

In `WorkPage`, add ref and useEffect before the return:
```tsx
export default function WorkPage() {
  const eyebrowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = eyebrowRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('eyebrow-animate')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    // ...
  )
}
```

- [ ] **Step 3: Add classes and ref to the eyebrow div**

Find in the hero section:
```tsx
<div className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
  <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
  <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>WORK_</span>
</div>
```

Replace with:
```tsx
<div ref={eyebrowRef} className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
  <div className="eyebrow-line" style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
  <span className="eyebrow-label font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>WORK_</span>
</div>
```

- [ ] **Step 4: Verify build passes**

```bash
cd /Users/pramitranjan/portfolio && npx next build 2>&1 | tail -20
```

Expected: clean build, no errors.

- [ ] **Step 5: Commit and push**

```bash
git add app/work/page.tsx
git commit -m "feat: eyebrow scroll-in animation on work page"
git push
```
