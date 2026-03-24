# Portfolio Project — Claude App Context

## What this is

Dark editorial portfolio for Pramit Ranjan (UX design student at SCAD). Built with **Next.js 16 App Router**, **TypeScript**, **Tailwind CSS v4**, **GSAP**. Deployed on Vercel at pramitranjan.com. Repo: `github.com/pramitranjann/pramitranjan-portfolio`.

## Design language

- Near-black backgrounds: `#0d0d0d` (bg), `#111111` (card), `#060606` (film)
- Text: `#f5f2ed` (white), `#999999` (body), `#666666` (label)
- Single accent: `#FF3120` (red) — used for borders, underlines, eyebrows, CTAs
- Fonts: **DM Serif Display** (serif headings) + **DM Mono** (all body/mono copy)
- Type scale defined as CSS vars: `--text-display`, `--text-hero`, `--text-h1`, `--text-h2`, `--text-h3`, `--text-eyebrow`, `--text-body-lg`, `--text-body`, `--text-meta`

## Site structure

```
app/
  page.tsx              — Homepage (HeroCarousel + hero stages, about, photography, selected work)
  layout.tsx            — Root layout (fonts, SoundRouteListener)
  about/page.tsx        — About page (server component)
  work/page.tsx         — Work grid ('use client')
  work/[slug]/page.tsx  — Case study pages
  creative/page.tsx     — Creative grid ('use client')
  creative/photography/[slug]/page.tsx — Photo gallery pages
  globals.css           — All CSS custom properties + utility classes

components/
  Nav.tsx               — Fixed top nav, red dot expands on hover (.nav-link)
  HeroCarousel.tsx      — Homepage intro carousel (scroll to release)
  HeroStage01/02/03.tsx — Three hero scroll stages
  About.tsx             — Homepage about section
  SelectedWork.tsx      — Homepage work cards section
  ProjectCard.tsx       — Card component (supporting + main variants)
  CaseStudyLayout.tsx   — Shared layout for all case studies ('use client')
  GsapReveal.tsx        — GSAP scroll-reveal wrapper ('use client')
  SpotifyWidget.tsx     — Live Spotify now-playing widget
  SoundRouteListener.tsx — Plays audio on route changes
  PageTransition.tsx    — Page wipe component (currently NOT wired up in layout)
  FilmStrip.tsx         — Photography film strip on homepage
  PhotoGalleryLayout.tsx / PhotoLightbox.tsx — Photography gallery
```

## Animations already in place

- **Homepage hero:** Custom scroll-driven carousel with CSS transitions (do not touch)
- **Card hover (CSS):** Lift + red border glow + title underline draws from left + CTA letter-spacing expand (`.portfolio-card`, `.card-title-inner`, `.card-cta-inner` in globals.css)
- **Card entrance (GSAP):** ScrollTrigger scale 0.93→1 + fade, stagger 110ms — on `/work` and `/creative`
- **Scroll reveals (GSAP):** `<GsapReveal>` wrapper with `data-reveal` on direct children — used on `/about`, `/work` hero, `/creative` hero, all case study sections
- **Eyebrow animations:** IntersectionObserver draws red line + fades in label — on `/work` and `/creative`
- **Spotify widget:** Real-time progress bar ticking every second

## Key CSS classes (globals.css)

```css
.portfolio-card          — card base + hover transitions
.card-title-inner        — title underline on hover (::after draws from left)
.card-cta-inner          — letter-spacing expand on hover
.nav-link                — nav item with red dot expand
.nav-link.active         — red colour for current page
.social-link             — underline draws from left on hover
.arrow-nudge             — translateX(4px) forward arrow on hover
.arrow-nudge-back        — translateX(-4px) back arrow
.eyebrow-animate         — triggers eyebrow line + label animation
.reveal / .revealed      — legacy fade-up (used on homepage, JS-ready gated)
```

## GSAP setup

- Installed: `gsap@^3.14.2`
- `ScrollTrigger` used in: `GsapReveal.tsx`, `app/work/page.tsx`, `app/creative/page.tsx`
- Pattern: `gsap.registerPlugin(ScrollTrigger)` inside `useEffect`, `gsap.context()` for cleanup, `ctx.revert()` on unmount
- Reduced motion: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before any tween

## GsapReveal component

```tsx
// Usage — wrap a section, add data-reveal to DIRECT children only
<GsapReveal>
  <h2 data-reveal>Title</h2>
  <p data-reveal>Body</p>
</GsapReveal>
```

- Uses `:scope > [data-reveal]` selector (direct children only — nesting causes double-animation)
- `stagger` prop (default `0.08`) is mount-time only (captured in `useRef`)
- Animation: `opacity 0→1`, `y 16→0`, `duration 0.6s`, `ease power2.out`, `start: 'top 85%'`, `once: true`

## Rules

- **Never touch** `app/page.tsx`, `HeroCarousel.tsx`, `HeroStage01/02/03.tsx`, or any homepage component
- All GSAP code lives inside `useEffect` — never at module level (SSR risk)
- `app/about/page.tsx` is a **server component** — no `'use client'`; use client wrappers like `<GsapReveal>` instead
- Mobile breakpoint: `< 768px` — overrides in globals.css under `@media (max-width: 767px)`

## What was recently built (this session)

1. Card hover animations (CSS) — lift, title underline, CTA expand
2. Card entrance animations (GSAP ScrollTrigger) on `/work` and `/creative`
3. `GsapReveal` component + scroll reveals on `/about`, work/creative heroes, all case studies
4. Page transition wipe — tried and removed (too glitchy with App Router constraints)
