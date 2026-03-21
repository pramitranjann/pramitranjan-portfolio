# Portfolio Homepage Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the homepage (/) of Pramit Ranjan's portfolio as a pixel-faithful implementation of the PORTFOLIO-DESIGN-SYSTEM.md.

**Architecture:** Single Next.js App Router page at `app/page.tsx`, broken into section components under `components/`. Global styles + Tailwind config hold all design tokens. IntersectionObserver animations via a shared `useReveal` hook.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS v3, Google Fonts (DM Serif Display, DM Mono), CSS transitions, IntersectionObserver.

---

## File Map

| File | Responsibility |
|---|---|
| `app/layout.tsx` | Root layout — Google Fonts, global CSS, page-transition wrapper |
| `app/globals.css` | Base styles, font-face declarations, CSS custom properties |
| `app/page.tsx` | Homepage — assembles all section components in order |
| `tailwind.config.ts` | Design system colour tokens, font families |
| `components/Nav.tsx` | Fixed navigation |
| `components/HeroStage.tsx` | Reusable hero stage (01, 02, 03) |
| `components/SelectedWork.tsx` | 2×2 selected work grid |
| `components/PhotographyStage.tsx` | Photography text + film strip unified section |
| `components/FilmStrip.tsx` | Film strip with sprocket holes + frames |
| `components/MoreWork.tsx` | 3-column more work grid |
| `components/About.tsx` | About section |
| `components/Contact.tsx` | Contact section |
| `components/Footer.tsx` | Footer |
| `components/RuleLabel.tsx` | Reusable rule + number/label component |
| `components/ProjectCard.tsx` | Reusable project card (main + supporting variants) |
| `hooks/useReveal.ts` | IntersectionObserver scroll-reveal hook |

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `next.config.ts`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Scaffold Next.js with Tailwind**

```bash
cd /Users/pramitranjan/portfolio
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-eslint --yes
```

- [ ] **Step 2: Verify dev server starts**

```bash
cd /Users/pramitranjan/portfolio && npm run dev &
sleep 5 && curl -s http://localhost:3000 | head -20
```

Expected: HTML response with Next.js default page.

- [ ] **Step 3: Commit scaffold**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "chore: scaffold Next.js + Tailwind"
```

---

### Task 2: Design tokens — Tailwind config + global CSS

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Extend tailwind.config.ts with design system tokens**

Replace theme.extend with:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.ts'],
  theme: {
    extend: {
      colors: {
        bg:        '#0d0d0d',
        card:      '#111111',
        film:      '#060606',
        placeholder: '#161616',
        white:     '#f5f2ed',
        red:       '#FF3120',
        body:      '#999999',
        label:     '#666666',
        meta:      '#444444',
        stagenum:  '#2a2a2a',
        divider:   '#1f1f1f',
        cardborder:'#1a1a1a',
        frameborder:'#222222',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        mono:  ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Update globals.css — base styles only**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    background-color: #0d0d0d;
    color: #f5f2ed;
  }
  body {
    background-color: #0d0d0d;
  }
}
```

- [ ] **Step 3: Update app/layout.tsx — load Google Fonts, set bg**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Mono } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const dmMono = DM_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pramit Ranjan',
  description: 'UX design student at SCAD.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable}`}>
      <body className="bg-bg text-white font-mono antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Commit tokens**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: add design system tokens to Tailwind + layout fonts"
```

---

### Task 3: useReveal hook

**Files:**
- Create: `hooks/useReveal.ts`

- [ ] **Step 1: Write the hook**

```ts
// hooks/useReveal.ts
'use client'
import { useEffect, useRef } from 'react'

export function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
```

- [ ] **Step 2: Add reveal CSS to globals.css**

Append to `app/globals.css`:

```css
@layer utilities {
  .reveal {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .reveal.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-text {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .reveal-text.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-slide {
    opacity: 0;
    transform: translateX(40px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .reveal-slide.revealed {
    opacity: 1;
    transform: translateX(0);
  }
}
```

- [ ] **Step 3: Commit hook**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: add useReveal IntersectionObserver hook + CSS"
```

---

### Task 4: RuleLabel component

**Files:**
- Create: `components/RuleLabel.tsx`

- [ ] **Step 1: Write component**

```tsx
// components/RuleLabel.tsx
export function RuleLabel({ number, className }: { number: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className ?? ''}`}>
      <div className="w-8 h-px bg-red flex-shrink-0" />
      <span
        className="font-mono text-red"
        style={{ fontSize: '9px', letterSpacing: '0.18em', lineHeight: 1 }}
      >
        {number}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: RuleLabel component"
```

---

### Task 5: Nav component

**Files:**
- Create: `components/Nav.tsx`

- [ ] **Step 1: Write Nav**

```tsx
// components/Nav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/work',     label: 'WORK' },
  { href: '/creative', label: 'CREATIVE' },
  { href: '/about',    label: 'ABOUT' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-divider bg-[rgba(13,13,13,0.85)] backdrop-blur-sm"
      style={{ padding: '14px 24px' }}
    >
      <Link href="/" className="font-mono text-red" style={{ fontSize: '9px', letterSpacing: '0.12em' }}>
        PR
      </Link>
      <div className="flex gap-6">
        {links.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="font-mono transition-colors duration-150"
              style={{
                fontSize: '9px',
                letterSpacing: '0.12em',
                color: active ? '#FF3120' : '#666666',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: fixed Nav component"
```

---

### Task 6: Hero Stage 01

**Files:**
- Create: `components/HeroStage01.tsx`

- [ ] **Step 1: Write Stage 01**

Stage 01 has no rule label — just the name at 58px and descriptor below.

```tsx
// components/HeroStage01.tsx
'use client'
import { useEffect, useRef } from 'react'

export function HeroStage01() {
  const nameRef  = useRef<HTMLHeadingElement>(null)
  const descRef  = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // Trigger on mount (hero loads immediately)
    const els = [nameRef.current, descRef.current]
    els.forEach((el, i) => {
      if (!el) return
      setTimeout(() => el.classList.add('revealed'), i * 300)
    })
  }, [])

  return (
    <section
      className="min-h-screen flex flex-col justify-end border-b border-divider"
      style={{ padding: '48px 24px' }}
    >
      {/* Stage number background */}
      <div
        className="font-mono mb-8 select-none"
        style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#2a2a2a' }}
      >
        01
      </div>

      <h1
        ref={nameRef}
        className="font-serif reveal-text"
        style={{ fontSize: '58px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05 }}
      >
        Pramit Ranjan
      </h1>

      <p
        ref={descRef}
        className="font-mono reveal-text mt-4"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '360px' }}
      >
        UX design student at SCAD. Figuring out what good design can actually do.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: HeroStage01 component"
```

---

### Task 7: Hero Stage 02

**Files:**
- Create: `components/HeroStage02.tsx`

- [ ] **Step 1: Write Stage 02**

Stage 02 has rule label, tagline in DM Serif italic 32px with **Film** and **Figma** in red, and descriptor.

```tsx
// components/HeroStage02.tsx
'use client'
import { useEffect, useRef } from 'react'
import { RuleLabel } from './RuleLabel'

export function HeroStage02() {
  const tagRef  = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const secRef  = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => tagRef.current?.classList.add('revealed'),  0)
          setTimeout(() => descRef.current?.classList.add('revealed'), 300)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={secRef as React.RefObject<HTMLElement>}
      className="min-h-screen flex flex-col justify-end border-b border-divider"
      style={{ padding: '48px 24px' }}
    >
      <div
        className="font-mono mb-8 select-none"
        style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#2a2a2a' }}
      >
        02
      </div>

      <RuleLabel number="02" />

      <h2
        ref={tagRef}
        className="font-serif italic reveal-text"
        style={{ fontSize: '32px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2 }}
      >
        From <span style={{ color: '#FF3120' }}>Film</span> to <span style={{ color: '#FF3120' }}>Figma</span>.
      </h2>

      <p
        ref={descRef}
        className="font-mono reveal-text mt-4"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '400px' }}
      >
        A creative background shapes how I see problems. Photography, mixed media, and art — before Figma, before UX.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: HeroStage02 component"
```

---

### Task 8: Hero Stage 03

**Files:**
- Create: `components/HeroStage03.tsx`

- [ ] **Step 1: Write Stage 03**

Stage 03 rule label, tagline with **solves** and **questions** in red, descriptor.

```tsx
// components/HeroStage03.tsx
'use client'
import { useEffect, useRef } from 'react'
import { RuleLabel } from './RuleLabel'

export function HeroStage03() {
  const tagRef  = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const secRef  = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => tagRef.current?.classList.add('revealed'),  0)
          setTimeout(() => descRef.current?.classList.add('revealed'), 300)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={secRef as React.RefObject<HTMLElement>}
      className="min-h-screen flex flex-col justify-end border-b border-divider"
      style={{ padding: '48px 24px' }}
    >
      <div
        className="font-mono mb-8 select-none"
        style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#2a2a2a' }}
      >
        03
      </div>

      <RuleLabel number="03" />

      <h2
        ref={tagRef}
        className="font-serif italic reveal-text"
        style={{ fontSize: '32px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2 }}
      >
        Design that <span style={{ color: '#FF3120' }}>solves</span>. Art that <span style={{ color: '#FF3120' }}>questions</span>.
      </h2>

      <p
        ref={descRef}
        className="font-mono reveal-text mt-4"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '400px' }}
      >
        UX work grounded in research and empathy. Creative work that pushes further.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: HeroStage03 component"
```

---

### Task 9: ProjectCard component

**Files:**
- Create: `components/ProjectCard.tsx`

- [ ] **Step 1: Write ProjectCard**

Two variants: `main` (DM Serif 20px title) and `supporting` (DM Serif 14px title).

```tsx
// components/ProjectCard.tsx
import Link from 'next/link'

interface ProjectCardProps {
  title: string
  oneliner: string
  tags: string[]
  href: string
  variant?: 'main' | 'supporting'
  comingSoon?: boolean
}

export function ProjectCard({ title, oneliner, tags, href, variant = 'main', comingSoon }: ProjectCardProps) {
  const titleSize = variant === 'main' ? '20px' : '14px'

  const inner = (
    <div
      className="bg-card border border-cardborder flex flex-col transition-opacity duration-150 hover:opacity-75"
      style={{ padding: '20px' }}
    >
      {/* Image placeholder */}
      <div
        className="w-full border border-cardborder mb-4"
        style={{ backgroundColor: '#161616', aspectRatio: variant === 'main' ? '16/9' : '4/3' }}
      />

      {/* Title */}
      <h3
        className="font-serif mb-2"
        style={{ fontSize: titleSize, fontWeight: 400, color: '#f5f2ed' }}
      >
        {title}
      </h3>

      {/* One-liner */}
      <p
        className="font-mono mb-4 flex-1"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999' }}
      >
        {oneliner}
      </p>

      {/* Tags + CTA row */}
      <div className="flex items-end justify-between">
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-mono border border-divider"
              style={{ fontSize: '9px', letterSpacing: '0.14em', color: '#444444', padding: '4px 10px' }}
            >
              {tag}
            </span>
          ))}
        </div>
        {comingSoon ? (
          <span
            className="font-mono"
            style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#444444' }}
          >
            COMING SOON
          </span>
        ) : (
          <span
            className="font-mono transition-colors duration-150"
            style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#444444' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF3120')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#444444')}
          >
            VIEW →
          </span>
        )}
      </div>
    </div>
  )

  return comingSoon ? inner : <Link href={href}>{inner}</Link>
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: ProjectCard component (main + supporting variants)"
```

---

### Task 10: SelectedWork section

**Files:**
- Create: `components/SelectedWork.tsx`

- [ ] **Step 1: Write SelectedWork**

2×2 grid, section label left + count right, staggered reveal.

```tsx
// components/SelectedWork.tsx
'use client'
import { useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'

const projects = [
  { title: 'LoomLearn', oneliner: 'One learning space for students who think differently.', tags: ['UX', 'RESEARCH'], href: '/work/loomlearn' },
  { title: 'HelpOH',    oneliner: 'Connecting homes to trusted help, and workers to fair pay.', tags: ['UX', 'SERVICE DESIGN'], href: '/work/helpoh' },
  { title: 'Atom OS',   oneliner: 'A phone stripped down to what actually matters.', tags: ['UI', 'SYSTEMS'], href: '/work/atom' },
  { title: 'Albers',    oneliner: 'Colour theory you can actually play with.', tags: ['UI', 'INTERACTION'], href: '/work/albers' },
]

export function SelectedWork() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = Array.from(grid.children) as HTMLElement[]
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('revealed'), i * 100)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6 border-b border-divider pb-4">
        <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
          SELECTED WORK
        </span>
        <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#FF3120' }}>
          04
        </span>
      </div>

      {/* 2×2 grid */}
      <div ref={gridRef} className="grid grid-cols-2" style={{ gap: '2px' }}>
        {projects.map((p) => (
          <div key={p.title} className="reveal">
            <ProjectCard {...p} variant="main" />
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: SelectedWork 2×2 grid section"
```

---

### Task 11: FilmStrip component

**Files:**
- Create: `components/FilmStrip.tsx`

- [ ] **Step 1: Write FilmStrip**

Sprocket holes top and bottom, frames with city labels in red, last frame fades.

```tsx
// components/FilmStrip.tsx
const frames = [
  { label: 'KL · 001' },
  { label: 'KL · 002' },
  { label: 'SG · 001' },
  { label: 'SG · 002' },
  { label: 'HCM · 001' },
]

function Sprockets({ count = 8 }: { count?: number }) {
  return (
    <div className="flex items-center" style={{ gap: '8px', padding: '4px 8px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm border border-frameborder flex-shrink-0"
          style={{ width: '8px', height: '6px', backgroundColor: '#0d0d0d' }}
        />
      ))}
    </div>
  )
}

export function FilmStrip() {
  return (
    <div
      className="overflow-hidden"
      style={{ backgroundColor: '#060606', padding: '10px 0' }}
    >
      {/* Top sprockets */}
      <Sprockets count={10} />

      {/* Frames row */}
      <div className="flex" style={{ gap: '2px', padding: '4px 8px' }}>
        {frames.map((frame, i) => {
          const isLast = i === frames.length - 1
          return (
            <div
              key={frame.label}
              className="flex-shrink-0 border border-frameborder flex flex-col justify-between"
              style={{
                width: '120px',
                height: '90px',
                backgroundColor: '#161616',
                padding: '6px',
                opacity: isLast ? 0.3 : 1,
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: '7px', letterSpacing: '0.1em', color: '#FF3120' }}
              >
                {frame.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bottom sprockets */}
      <Sprockets count={10} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: FilmStrip component with sprocket holes"
```

---

### Task 12: PhotographyStage section

**Files:**
- Create: `components/PhotographyStage.tsx`

- [ ] **Step 1: Write PhotographyStage**

Text left, film strip right, unified section no divider between them.

```tsx
// components/PhotographyStage.tsx
'use client'
import { useEffect, useRef } from 'react'
import { RuleLabel } from './RuleLabel'
import { FilmStrip } from './FilmStrip'

export function PhotographyStage() {
  const textRef  = useRef<HTMLDivElement>(null)
  const filmRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const text = textRef.current
    const film = filmRef.current
    if (!text || !film) return

    const textObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = Array.from(text.querySelectorAll('.reveal-text')) as HTMLElement[]
          els.forEach((el, i) => setTimeout(() => el.classList.add('revealed'), i * 300))
          textObs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    textObs.observe(text)

    const filmObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          film.classList.add('revealed')
          filmObs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    filmObs.observe(film)

    return () => { textObs.disconnect(); filmObs.disconnect() }
  }, [])

  return (
    <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
      <div className="grid grid-cols-2 gap-12 items-center">
        {/* Text left */}
        <div ref={textRef}>
          <RuleLabel number="THE EYE CAME FIRST." />

          <h2
            className="font-serif reveal-text"
            style={{ fontSize: '32px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2 }}
          >
            Before <span style={{ color: '#FF3120' }}>Figma</span>, there was <span style={{ color: '#FF3120' }}>film</span>.
          </h2>

          <p
            className="font-mono reveal-text mt-4"
            style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '320px' }}
          >
            Street photography across Southeast Asia. Shot on 35mm and medium format. Always looking.
          </p>

          <a
            href="/creative/photography"
            className="font-mono mt-6 inline-block transition-colors duration-150 reveal-text"
            style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#444444' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF3120')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#444444')}
          >
            VIEW ALL →
          </a>
        </div>

        {/* Film strip right */}
        <div ref={filmRef} className="reveal-slide overflow-hidden">
          <FilmStrip />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: PhotographyStage section with film strip"
```

---

### Task 13: MoreWork section

**Files:**
- Create: `components/MoreWork.tsx`

- [ ] **Step 1: Write MoreWork**

3-column grid with supporting card variant.

```tsx
// components/MoreWork.tsx
'use client'
import { useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'

const projects = [
  { title: 'Accord',          oneliner: 'A contract tool built for freelancers.', tags: ['UX', 'PRODUCT'], href: '/work/accord' },
  { title: 'Design-athon 01', oneliner: 'A 48-hour weather app designed with Claude AI.', tags: ['UI', 'SPRINT'], href: '/work/designathon-01' },
  { title: 'Design-athon 02', oneliner: 'Redesigning Passio Go with Figma Make.', tags: ['UI', 'SPRINT'], href: '/work/designathon-02' },
]

export function MoreWork() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = Array.from(grid.children) as HTMLElement[]
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('revealed'), i * 100)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6 border-b border-divider pb-4">
        <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
          MORE WORK
        </span>
        <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#FF3120' }}>
          03
        </span>
      </div>

      <div ref={gridRef} className="grid grid-cols-3" style={{ gap: '2px' }}>
        {projects.map((p) => (
          <div key={p.title} className="reveal">
            <ProjectCard {...p} variant="supporting" />
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: MoreWork 3-column grid section"
```

---

### Task 14: About section

**Files:**
- Create: `components/About.tsx`

- [ ] **Step 1: Write About**

Headline: "Designer. Student. Human." with "Human." in red.

```tsx
// components/About.tsx
'use client'
import { useEffect, useRef } from 'react'
import { RuleLabel } from './RuleLabel'

export function About() {
  const secRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = Array.from(el.querySelectorAll('.reveal-text')) as HTMLElement[]
          els.forEach((child, i) => setTimeout(() => child.classList.add('revealed'), i * 300))
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={secRef as React.RefObject<HTMLElement>}
      className="border-b border-divider"
      style={{ padding: '48px 24px' }}
    >
      <RuleLabel number="ABOUT" />

      <h2
        className="font-serif reveal-text"
        style={{ fontSize: '42px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1 }}
      >
        Designer. Student.{' '}
        <span style={{ color: '#FF3120' }}>Human.</span>
      </h2>

      <p
        className="font-mono reveal-text mt-6"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#999999', maxWidth: '480px' }}
      >
        UX design student at SCAD, figuring out what good design can actually do. I think like a designer but see like an artist. Still learning. Always curious.
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: About section"
```

---

### Task 15: Contact section

**Files:**
- Create: `components/Contact.tsx`

- [ ] **Step 1: Write Contact**

Italic headline with "Say hello." in red, three social links underlined in red.

```tsx
// components/Contact.tsx
'use client'
import { useEffect, useRef } from 'react'

export function Contact() {
  const secRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = Array.from(el.querySelectorAll('.reveal-text')) as HTMLElement[]
          els.forEach((child, i) => setTimeout(() => child.classList.add('revealed'), i * 300))
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const socialLinks = [
    { label: 'LINKEDIN',  href: 'https://linkedin.com/in/pramitranjan' },
    { label: 'GMAIL',     href: 'mailto:pramit@example.com' },
    { label: 'INSTAGRAM', href: 'https://instagram.com/pramitranjan' },
  ]

  return (
    <section
      ref={secRef as React.RefObject<HTMLElement>}
      className="border-b border-divider"
      style={{ padding: '48px 24px' }}
    >
      <h2
        className="font-serif italic reveal-text"
        style={{ fontSize: '38px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1 }}
      >
        You made it this far.{' '}
        <span style={{ color: '#FF3120' }}>Say hello.</span>
      </h2>

      <div className="flex gap-6 mt-8 reveal-text">
        {socialLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="font-mono transition-colors duration-150"
            style={{
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: '#f5f2ed',
              textDecoration: 'underline',
              textDecorationColor: '#FF3120',
              textUnderlineOffset: '3px',
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: Contact section"
```

---

### Task 16: Footer

**Files:**
- Create: `components/Footer.tsx`

- [ ] **Step 1: Write Footer**

PRAMIT RANJAN left, 2026 right — both in `#444`, no red.

```tsx
// components/Footer.tsx
export function Footer() {
  return (
    <footer
      className="flex items-center justify-between font-mono"
      style={{ padding: '14px 24px' }}
    >
      <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#444444' }}>
        PRAMIT RANJAN
      </span>
      <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#444444' }}>
        2026
      </span>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: Footer component"
```

---

### Task 17: Assemble homepage (app/page.tsx)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace default page with homepage assembly**

```tsx
// app/page.tsx
import { Nav }               from '@/components/Nav'
import { HeroStage01 }       from '@/components/HeroStage01'
import { HeroStage02 }       from '@/components/HeroStage02'
import { HeroStage03 }       from '@/components/HeroStage03'
import { SelectedWork }      from '@/components/SelectedWork'
import { PhotographyStage }  from '@/components/PhotographyStage'
import { MoreWork }          from '@/components/MoreWork'
import { About }             from '@/components/About'
import { Contact }           from '@/components/Contact'
import { Footer }            from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="pt-[42px]"> {/* offset for fixed nav height */}
        <HeroStage01 />
        <HeroStage02 />
        <HeroStage03 />
        <SelectedWork />
        <PhotographyStage />
        <MoreWork />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Verify page renders in browser**

```bash
cd /Users/pramitranjan/portfolio && npm run dev
```

Open http://localhost:3000 and check:
- Fixed nav with PR logo in red
- Three full-screen hero stages with stage numbers
- 2×2 selected work grid
- Photography section with film strip
- 3-column more work grid
- About, Contact, Footer
- Scroll reveals trigger on all sections

- [ ] **Step 3: Commit final assembly**

```bash
cd /Users/pramitranjan/portfolio
git add -A && git commit -m "feat: assemble homepage — all sections complete"
```

---

*Plan written 2026-03-20 · Pramit Ranjan Portfolio · Homepage only*
