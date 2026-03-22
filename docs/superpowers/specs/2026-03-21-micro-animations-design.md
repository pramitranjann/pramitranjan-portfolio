# Micro Animations Design Spec

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Add a consistent, restrained set of micro animations across the portfolio — red border on card hover, arrow nudges on links, nav dot reveal, social underline draw, and scroll-in eyebrow animation.

**Approach:** Pure CSS wherever possible (transitions, keyframes, pseudo-elements). No new JS dependencies. Scroll-in for eyebrows uses the existing IntersectionObserver pattern already in the codebase.

---

## 1. Cards — VIEW → with arrow nudge

**Where:** All card types across all pages.

### 1a. `ProjectCard` supporting variant (`components/ProjectCard.tsx`)
Currently shows title + category only. Add VIEW → below the category:
```tsx
<div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#FF3120', letterSpacing: '0.1em', marginTop: '8px' }}>
  VIEW <span className="arrow-nudge">→</span>
</div>
```

### 1b. `CreativeCard` in `app/creative/page.tsx`
The arrow is already rendered as `→` inside the VIEW span. Wrap it:
```tsx
VIEW <span className="arrow-nudge">→</span>
```

### 1c. Photography sub-page (`app/creative/photography/page.tsx`)
Same — VIEW → already rendered. Wrap the `→`:
```tsx
VIEW <span className="arrow-nudge">→</span>
```

### 1d. Mixed-media and branding sub-pages
These pages currently render no VIEW → and cards are non-linked divs. Add VIEW → text (no linking needed — cards can show it as a label since they link to the gallery page, not individual items). Add as the last element in each card:
```tsx
<span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#FF3120' }}>
  VIEW <span className="arrow-nudge">→</span>
</span>
```

**CSS (add to `globals.css`):**
```css
.arrow-nudge {
  display: inline-block;
  transition: transform 0.2s ease;
}
.portfolio-card:hover .arrow-nudge {
  transform: translateX(4px);
}

.arrow-nudge-back {
  display: inline-block;
  transition: transform 0.2s ease;
}
a:hover .arrow-nudge-back {
  transform: translateX(-4px);
}
```

**Files to change:**
- `components/ProjectCard.tsx`
- `app/creative/page.tsx`
- `app/creative/photography/page.tsx`
- `app/creative/mixed-media/page.tsx`
- `app/creative/branding/page.tsx`
- `app/globals.css`

---

## 2. Nav links — red dot expands

**Where:** `components/Nav.tsx`

**Behaviour:**
- At rest: no dot, link color `#999`
- On hover: a red pill (`::before`, `width: 6px`, `height: 6px`, `border-radius: 3px`) expands in before the text with `margin-right: 6px`. Link color transitions to `#f5f2ed`.
- Active/current page link: dot is always visible, link color stays `#FF3120` (current behaviour)

**Important:** `Nav.tsx` currently uses `onMouseEnter`/`onMouseLeave` inline style handlers and `style={{ color: active ? '#FF3120' : '#666666' }}` inline colour. These **must be removed** — inline styles override class-based rules and the transitions will silently fail otherwise.

Replace the current `<Link>` element (lines 35–49 of Nav.tsx) with:
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
Remove the `onMouseEnter` and `onMouseLeave` props entirely. The `color` is now controlled by `.nav-link` and `.nav-link:hover` CSS rules. Active state (red) is handled by `.nav-link.active`.

**CSS:**
```css
.nav-link {
  display: inline-flex;
  align-items: center;
  color: #999;
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

**Files to change:**
- `components/Nav.tsx` — remove inline `style={{ color }}`, remove `onMouseEnter`/`onMouseLeave` handlers, add `nav-link` class, add `active` class when path matches
- `app/globals.css`

---

## 3. Text links — directional arrow nudge

**Where:** READ MORE → in About, and ← back links on sub-pages (← CREATIVE)

**Behaviour:**
- READ MORE → : wrap `→` in `<span className="arrow-nudge">→</span>` — nudges right 4px on hover (CSS already covers this via `a:hover .arrow-nudge`)
- ← CREATIVE back links: wrap `←` in `<span className="arrow-nudge-back">←</span>` — nudges left 4px on hover

**Note:** CSS rules for `.arrow-nudge` and `.arrow-nudge-back` are defined in Section 1 and cover these link cases. No additional CSS needed.

**Files to change:**
- `components/About.tsx` — wrap `→` in arrow-nudge span
- `app/creative/mixed-media/page.tsx` — wrap `←` in arrow-nudge-back span (VIEW → arrow-nudge already handled in Section 1d)
- `app/creative/branding/page.tsx` — wrap `←` in arrow-nudge-back span (VIEW → arrow-nudge already handled in Section 1d)

**Note:** `app/creative/photography/page.tsx` already appears in Section 1. When editing that file for VIEW →, also wrap the `←` in the back link with `.arrow-nudge-back` in the same editing pass — do not open it twice.

---

## 4. Social links — underline draws in from left

**Where:** `components/Contact.tsx`

**Behaviour:**
- At rest: no underline
- On hover: 1px red underline draws in left-to-right via `scaleX(0 → 1)`, `transform-origin: left`. Color transitions to `#FF3120`.

**Important:** Remove the existing inline `borderBottom: '1px solid #FF3120'` from the `<a>` elements in Contact.tsx. Leave `paddingBottom: '2px'` in place — it creates the gap between text and the pseudo-element underline.

**CSS:**
```css
.social-link {
  position: relative;
  color: #888;
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

**Files to change:**
- `components/Contact.tsx` — add `social-link` class to `<a>` elements, remove inline `borderBottom`
- `app/globals.css`

---

## 5. Section eyebrows — scroll-in animation

**Where:** The red line + label pattern in hero sections of `/work` and `/creative` pages.

**Behaviour (plays once on scroll-in):**
1. Red line scales from `scaleX(0) → scaleX(1)` over `0.4s ease` (GPU-composited, no layout reflow)
2. Label fades in + slides from `translateX(-8px) → translateX(0)` over `0.4s ease`, delayed `0.2s`

**CSS:**
```css
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

**JS (IntersectionObserver — same pattern as `About.tsx`):**
```tsx
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
```

**Files to change:**
- `app/work/page.tsx` — add `'use client'` directive (currently a server component), add `useRef`/`useEffect` import, add observer, add `eyebrow-line`/`eyebrow-label` classes to the line div and span, wrap eyebrow div in a ref'd container
- `app/creative/page.tsx` — already `'use client'`, just add observer and `eyebrow-line`/`eyebrow-label` classes. No directive change needed.
- `app/globals.css`

---

## What's not changing

- Carousel transitions (already polished)
- Scroll-reveal animations (`.reveal`, `.reveal-text` — already in place)
- Card sizes, layouts, colors
- Any animation on mobile — arrow nudge is touch-safe (no hover state on touch devices)
