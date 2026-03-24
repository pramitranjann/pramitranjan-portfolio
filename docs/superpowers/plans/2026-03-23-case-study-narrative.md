# Case Study Narrative Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add section headlines, pull quotes, and a floating section nav to `CaseStudyLayout`, then update Franklin's as the reference implementation.

**Architecture:** Task 1 adds props + imports to the component (foundation). After Task 1, Tasks 2 and 3 run **in parallel** — Task 2 makes all rendering changes to `CaseStudyLayout.tsx`, Task 3 makes all content changes to `franklins/page.tsx`. Task 4 does the final build check.

**Tech Stack:** Next.js 16.2, React 19, TypeScript, Tailwind CSS v4, inline styles. `'use client'` component. No test framework.

---

## File Map

| File | Task | Changes |
|------|------|---------|
| `components/CaseStudyLayout.tsx` | 1, 2 | New props interface + imports (Task 1); full rendering rewrite (Task 2 — starts from Task 1's committed output) |
| `app/work/franklins/page.tsx` | 3 | Add headline/pullQuote props + condense body copy |

---

## Task 1: Add Props + Imports to CaseStudyLayout (foundation)

**Files:**
- Modify: `components/CaseStudyLayout.tsx`

> After this task, Tasks 2 and 3 can run in parallel.

- [ ] **Step 1: Add useState + useEffect import**

`components/CaseStudyLayout.tsx` starts with `'use client'` on line 1, followed by existing imports on lines 2–9. There is no React import today. Add exactly this one line after `'use client'` (line 1), before the existing `import Image from 'next/image'`:

```tsx
import { useState, useEffect } from 'react'
```

Do NOT add `import Image from 'next/image'` again — it already exists on line 2. Only the one React hooks import line is new.

- [ ] **Step 2: Add new props to `CaseStudyLayoutProps` interface**

Find the `interface CaseStudyLayoutProps` block (line ~16). Add these optional props after `outcomes?: string`:

```ts
interface CaseStudyLayoutProps {
  title: string
  oneliner: string
  type: string
  tags: string[]
  prev: ProjectLink | null
  next: ProjectLink | null
  backHref?: string
  backLabel?: string
  problem?: string
  role?: string
  research?: string
  challenge?: string
  process?: string
  usabilityTesting?: string
  solution?: string
  outcomes?: string
  // Headlines — new
  problemHeadline?: string
  roleHeadline?: string
  researchHeadline?: string
  challengeHeadline?: string
  processHeadline?: string
  solutionHeadline?: string
  outcomesHeadline?: string
  pullQuote?: string
  // Images — unchanged
  heroImage?: string
  researchImage?: string
  challengeImages?: [string, string]
  solutionHeroImage?: string
  solutionImages?: [string] | [string, string]
}
```

- [ ] **Step 3: Add new props to function destructuring**

Find the `export function CaseStudyLayout({` line (~line 52). Add the new props to the destructured params:

```tsx
export function CaseStudyLayout({
  title, oneliner, type, tags, prev, next,
  backHref = '/work', backLabel = 'WORK',
  problem, role, research, challenge, process, usabilityTesting, solution, outcomes,
  problemHeadline, roleHeadline, researchHeadline, challengeHeadline,
  processHeadline, solutionHeadline, outcomesHeadline, pullQuote,
  heroImage, researchImage, challengeImages, solutionHeroImage, solutionImages,
}: CaseStudyLayoutProps) {
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/pramitranjan/portfolio && npx tsc --noEmit
```

Expected: no errors (new props are all optional — existing callers unchanged).

- [ ] **Step 5: Commit**

```bash
cd /Users/pramitranjan/portfolio && git add components/CaseStudyLayout.tsx && git commit -m "feat: add headline and pullQuote props to CaseStudyLayout interface"
```

---

## Task 2: CaseStudyLayout Rendering Changes ⚡ PARALLEL with Task 3

**Files:**
- Modify: `components/CaseStudyLayout.tsx`

> Starts after Task 1. Runs in parallel with Task 3 (different file).

- [ ] **Step 1: Add `headlineStyle` constant and `navItems` array**

Just below the existing `const gridStyle` definition (around line 50), add:

```tsx
const headlineStyle: React.CSSProperties = {
  fontSize: 'var(--text-body-lg, 16px)',
  letterSpacing: '0.01em',
  color: '#f5f2ed',
  lineHeight: 1.55,
  marginBottom: '10px',
}
```

Then inside the `CaseStudyLayout` function body, right after `const basePath = backHref`, add:

```tsx
const navItems = [
  { id: 'sec-problem', label: 'PROBLEM_', show: true },
  { id: 'sec-role',    label: 'MY ROLE_',  show: true },
  { id: 'sec-research', label: 'RESEARCH_', show: !!research },
  { id: 'sec-challenge', label: 'CHALLENGE_', show: !!challenge },
  { id: 'sec-process',  label: 'PROCESS_',  show: !!(process || usabilityTesting) },
  { id: 'sec-solution', label: 'SOLUTION_', show: true },
  { id: 'sec-outcomes', label: 'OUTCOMES_', show: !!outcomes },
].filter(item => item.show)

const [navVisible, setNavVisible] = useState(false)
const [activeId, setActiveId]     = useState('')

useEffect(() => {
  const heroEl = document.getElementById('sec-hero')
  const heroObserver = new IntersectionObserver(([entry]) => {
    setNavVisible(!entry.isIntersecting)
  }, { threshold: 0 })
  if (heroEl) heroObserver.observe(heroEl)

  const sectionEls = document.querySelectorAll('section[id^="sec-"]')
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveId(entry.target.id)
    })
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 })
  sectionEls.forEach(el => sectionObserver.observe(el))

  return () => {
    heroObserver.disconnect()
    sectionObserver.disconnect()
  }
}, [])
```

- [ ] **Step 2: Add `id="sec-hero"` to the hero section**

Find the hero `<section>` element (around line 78):

```tsx
// BEFORE:
<section
  className="case-study-hero grid grid-cols-2 border-b border-divider"
  style={{ minHeight: '280px' }}
>

// AFTER:
<section
  id="sec-hero"
  className="case-study-hero grid grid-cols-2 border-b border-divider"
  style={{ minHeight: '280px' }}
>
```

- [ ] **Step 3: Rewrite the PROBLEM_ section**

Find the `{/* Problem */}` block and replace it entirely:

```tsx
{/* Problem */}
<section id="sec-problem" data-section="PROBLEM_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
  <GsapReveal>
    <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
      <span className="font-mono" style={labelStyle}>PROBLEM_</span>
      <div style={{ maxWidth: '640px' }}>
        {problemHeadline && (
          <p className="font-mono" style={headlineStyle}>{problemHeadline}</p>
        )}
        <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
          {problem ?? 'This project focused on understanding user needs and translating them into a cohesive design solution. Through research, ideation, and iteration, the final product addresses real problems with intentional design decisions.'}
        </p>
      </div>
    </div>
  </GsapReveal>
</section>
```

- [ ] **Step 4: Rewrite the MY ROLE_ section**

Find the `{/* My Role */}` block and replace it entirely:

```tsx
{/* My Role */}
<section id="sec-role" data-section="MY ROLE_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
  <GsapReveal>
    <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
      <span className="font-mono" style={labelStyle}>MY ROLE_</span>
      <div>
        {roleHeadline && (
          <p className="font-mono" style={headlineStyle}>{roleHeadline}</p>
        )}
        <p className="case-study-body font-mono mb-6" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '640px' }}>
          {role ?? 'Led end-to-end UX design including research planning, synthesis, interaction design, and high-fidelity prototyping.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-mono"
              style={{
                fontSize: 'var(--text-eyebrow)',
                letterSpacing: '0.12em',
                color: '#666666',
                border: '1px solid #1f1f1f',
                padding: '4px 10px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  </GsapReveal>
</section>
```

- [ ] **Step 5: Rewrite the RESEARCH_ section**

Find the `{/* Research */}` block and replace it entirely:

```tsx
{/* Research */}
{research && (
  <section id="sec-research" data-section="RESEARCH_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
    <GsapReveal>
      <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
        <span className="font-mono" style={labelStyle}>RESEARCH_</span>
        <div style={{ maxWidth: '640px' }}>
          {researchHeadline && (
            <p className="font-mono" style={headlineStyle}>{researchHeadline}</p>
          )}
          <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
            {research}
          </p>
        </div>
      </div>
      {researchImage && (
        <div data-reveal className="case-study-research-image w-full mt-6" style={{ position: 'relative', height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
          <Image src={researchImage} alt="Research" fill style={{ objectFit: 'contain' }} sizes="100vw" />
        </div>
      )}
    </GsapReveal>
  </section>
)}
```

- [ ] **Step 6: Add the pull quote block (between Research and Challenge)**

Immediately after the closing `)}` of the Research section, add:

```tsx
{/* Pull Quote */}
{pullQuote && (
  <div style={{
    padding: '44px 40px',
    borderLeft: '2px solid #FF3120',
    borderBottom: '1px solid var(--divider)',
  }}>
    <p className="font-serif" style={{ fontStyle: 'italic', fontSize: '28px', color: '#f5f2ed', maxWidth: '680px', lineHeight: 1.45 }}>
      {pullQuote}
    </p>
    <p className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', color: '#FF3120', letterSpacing: '0.16em', marginTop: '16px' }}>
      KEY INSIGHT_
    </p>
  </div>
)}
```

- [ ] **Step 7: Rewrite the CHALLENGE_ section**

Find the `{/* Challenge */}` block and replace it entirely:

```tsx
{/* Challenge */}
{challenge && (
  <section id="sec-challenge" data-section="CHALLENGE_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
    <GsapReveal>
      <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
        <span className="font-mono" style={labelStyle}>CHALLENGE_</span>
        <div style={{ maxWidth: '640px' }}>
          {challengeHeadline && (
            <p className="font-mono" style={headlineStyle}>{challengeHeadline}</p>
          )}
          <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
            {challenge}
          </p>
        </div>
      </div>
      {challengeImages && (
        <div data-reveal className="case-study-image-grid mt-6 grid grid-cols-2" style={{ gap: '2px' }}>
          <div className="case-study-ideation-image" style={{ position: 'relative', height: '267px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
            <Image src={challengeImages[0]} alt="Challenge 1" fill style={{ objectFit: 'contain' }} sizes="50vw" />
          </div>
          <div className="case-study-ideation-image" style={{ position: 'relative', height: '267px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
            <Image src={challengeImages[1]} alt="Challenge 2" fill style={{ objectFit: 'contain' }} sizes="50vw" />
          </div>
        </div>
      )}
    </GsapReveal>
  </section>
)}
```

- [ ] **Step 8: Rewrite the PROCESS_ section**

Find the `{/* Process */}` block and replace it entirely:

```tsx
{/* Process */}
{(process || usabilityTesting) && (
  <section id="sec-process" data-section="PROCESS_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
    <GsapReveal>
      <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
        <span className="font-mono" style={labelStyle}>PROCESS_</span>
        <div>
          {processHeadline && (
            <p className="font-mono" style={{ ...headlineStyle, maxWidth: '640px' }}>{processHeadline}</p>
          )}
          {process && (
            <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '640px' }}>
              {process}
            </p>
          )}
          {usabilityTesting && (
            <p className="case-study-body font-mono mt-6" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '640px' }}>
              {usabilityTesting}
            </p>
          )}
        </div>
      </div>
    </GsapReveal>
  </section>
)}
```

- [ ] **Step 9: Rewrite the SOLUTION_ section**

Find the `{/* Solution */}` block and replace it entirely:

```tsx
{/* Solution */}
<section id="sec-solution" data-section="SOLUTION_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
  <GsapReveal>
    <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
      <span className="font-mono" style={labelStyle}>SOLUTION_</span>
      <div style={{ maxWidth: '640px' }}>
        {solutionHeadline && (
          <p className="font-mono" style={headlineStyle}>{solutionHeadline}</p>
        )}
        <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
          {solution ?? ''}
        </p>
      </div>
    </div>
    {solutionHeroImage && (
      <div data-reveal className="case-study-solution-hero w-full mt-6 mb-1" style={{ position: 'relative', height: '480px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
        <Image src={solutionHeroImage} alt="Solution" fill style={{ objectFit: 'contain' }} sizes="100vw" />
      </div>
    )}
    {solutionImages && (solutionImages[0] || solutionImages[1]) && (
      <div data-reveal className="case-study-image-grid grid grid-cols-2" style={{ gap: '2px' }}>
        <div className="case-study-solution-image" style={{ position: 'relative', height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
          {solutionImages[0] && <Image src={solutionImages[0]} alt="Solution 1" fill style={{ objectFit: 'contain' }} sizes="50vw" />}
        </div>
        <div className="case-study-solution-image" style={{ position: 'relative', height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
          {solutionImages[1] && <Image src={solutionImages[1]} alt="Solution 2" fill style={{ objectFit: 'contain' }} sizes="50vw" />}
        </div>
      </div>
    )}
  </GsapReveal>
</section>
```

- [ ] **Step 10: Rewrite the OUTCOMES_ section**

Find the `{/* Outcomes */}` block and replace it entirely:

```tsx
{/* Outcomes */}
{outcomes && (
  <section id="sec-outcomes" data-section="OUTCOMES_" className="case-study-section border-b border-divider" style={{ padding: '32px 40px' }}>
    <GsapReveal>
      <div data-reveal className="case-study-meta-grid grid" style={gridStyle}>
        <span className="font-mono" style={labelStyle}>OUTCOMES_</span>
        <div style={{ maxWidth: '640px' }}>
          {outcomesHeadline && (
            <p className="font-mono" style={headlineStyle}>{outcomesHeadline}</p>
          )}
          <p className="case-study-body font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8 }}>
            {outcomes}
          </p>
        </div>
      </div>
    </GsapReveal>
  </section>
)}
```

- [ ] **Step 11: Add SectionNav before `</main>` closing tag**

In `CaseStudyLayout.tsx`, find the Prev/Next `<div>` block near the end (after the Outcomes section). Just after the closing `</div>` of the Prev/Next block and before `</main>`, insert the SectionNav. The exact surrounding context:

```tsx
        </div>  {/* ← end of Prev/Next div */}

      </main>   {/* ← this is the </main> to insert before */}
      <Footer />
```

Insert the SectionNav between the Prev/Next closing `</div>` and `</main>`:

```tsx
        {/* Section Nav */}
        <nav style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 998,
          display: 'flex',
          alignItems: 'stretch',
          background: 'rgba(17,17,17,0.96)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #222',
          opacity: navVisible ? 1 : 0,
          pointerEvents: navVisible ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}>
          {navItems.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="font-mono"
              style={{
                fontSize: '10px',
                letterSpacing: '0.14em',
                color: activeId === item.id ? '#f5f2ed' : '#3a3a3a',
                padding: '11px 16px',
                textDecoration: 'none',
                position: 'relative',
                borderRight: i < navItems.length - 1 ? '1px solid #1a1a1a' : 'none',
                transition: 'color 0.15s ease',
              }}
            >
              {item.label}
              {activeId === item.id && (
                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: '#FF3120' }} />
              )}
            </a>
          ))}
        </nav>

      </main>
```

- [ ] **Step 12: TypeScript check**

```bash
cd /Users/pramitranjan/portfolio && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 13: Commit**

```bash
cd /Users/pramitranjan/portfolio && git add components/CaseStudyLayout.tsx && git commit -m "feat: add section headlines, pull quote, and floating section nav to CaseStudyLayout"
```

---

## Task 3: Franklin's Page Content Update ⚡ PARALLEL with Task 2

**Files:**
- Modify: `app/work/franklins/page.tsx`

> Starts after Task 1. Runs in parallel with Task 2 (different file).

- [ ] **Step 1: Replace the entire file content**

The Franklin's page currently has long, unstructured body copy. Replace the whole file with the condensed version plus the new headline and pullQuote props:

```tsx
import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function FranklinsPage() {
  return (
    <CaseStudyLayout
      title="Franklin's"
      oneliner="The experience starts before you walk in."
      type="UX DESIGN · 2025"
      tags={['UX Research', 'Contextual Inquiry', 'Information Architecture', 'Figma', 'Usability Testing', 'FigJam', 'Team Leadership']}
      prev={{ slug: 'loomlearn', title: 'LoomLearn' }}
      next={{ slug: 'helpoh', title: 'HelpOH' }}
      heroImage="/work/franklins/cover-processed.png"

      problemHeadline="The warmth was real — it just wasn't reaching people before they arrived."
      problem="Franklin's has a strong in-store experience. The brief: close the gap between what first-time visitors expected digitally and what they actually found when they walked in."

      roleHeadline="Team lead on a five-person UXDG 101 project — from fieldwork to final prototype."
      role="Led and contributed across every stage: structuring the research approach, directing fieldwork, synthesising findings, defining the IA, and driving the high-fidelity Figma prototype."

      researchHeadline="Most friction started before anyone walked through the door."
      research="Contextual inquiry at the café — barista and customer interviews, plus a SCAD student survey. The website was outdated, the service model unclear, and the in-store warmth had no digital equivalent."

      pullQuote="Their warmth was real. It just wasn't reaching people before they arrived."

      challengeHeadline="Users don't think in business categories — they think in tasks."
      challenge="Card sorting on FigJam revealed four natural buckets: Menu, Order, About, Contact. That structure became the backbone of the redesigned IA."

      processHeadline="Every design decision traces directly back to a research finding."
      process="The homepage was restructured to surface practical expectations earlier — seating, service style, hours. Navigation reduced to four items; the order flow redesigned as a clear sequence with explicit progress cues."
      usabilityTesting="We tested a full order — small cappuccino, skim milk, vanilla syrup — from discovery to checkout. Users completed it with no major breakdowns. The flow held; we made the call not to iterate."

      solutionHeadline="The redesign didn't change Franklin's identity — it made it clearer upfront."
      solution="Task-based navigation, a restructured homepage, a cleaner menu, and a step-by-step order flow from discovery to checkout."

      outcomesHeadline="The most important job of a team lead is keeping the work honest."
      outcomes="The experience gap wasn't a design problem — it was an information problem. If I were to continue, I'd explore in-context digital touchpoints at the storefront itself."
    />
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/pramitranjan/portfolio && npx tsc --noEmit
```

Expected: no errors (all new props are valid string literals matching the interface added in Task 1).

- [ ] **Step 3: Commit**

```bash
cd /Users/pramitranjan/portfolio && git add app/work/franklins/page.tsx && git commit -m "feat: update Franklin's case study with headlines, pull quote, and condensed copy"
```

---

## Task 4: Final Build Verification (sequential — after Tasks 2 + 3)

**Files:** None — verification only.

- [ ] **Step 1: Full production build**

```bash
cd /Users/pramitranjan/portfolio && npm run build
```

Expected: build completes with 0 errors. Warnings about image optimization or similar are acceptable; TypeScript errors are not.

- [ ] **Step 2: Check all case study pages still compile**

The build output lists every route. Confirm these routes appear without error:
- `/work/albers`
- `/work/atom`
- `/work/loomlearn`
- `/work/helpoh`
- `/work/franklins`
- `/creative/branding/soho`
- `/creative/branding/oracle`
- `/creative/mixed-media/south-china-sea`
- `/creative/mixed-media/faces-of-power`

- [ ] **Step 3: Push**

```bash
cd /Users/pramitranjan/portfolio && git push
```

---

## Parallelism Summary

```
Task 1 (foundation — CaseStudyLayout interface)
    │
    ├── Task 2 (CaseStudyLayout rendering) ─┐
    │                                        ├── Task 4 (build + push)
    └── Task 3 (Franklin's content)   ───────┘
```

Tasks 2 and 3 touch different files and can be dispatched simultaneously after Task 1 completes.
