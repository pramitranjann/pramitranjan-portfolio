# SCAD Scholarship Page — Spec + Implementation Plan
**Date:** 2026-04-15

## Overview

A hidden, unlisted page at `/scad-scholarship` that combines both the Work and Creative sections into a single long-scroll view for the SCAD scholarship review committee. Submitted as a single link.

---

## Design Spec

### URL
`/scad-scholarship` — no link to this page from the main nav or anywhere public.

### Header
No full Nav. Instead: a minimal fixed header with:
- **PR** logo (left) — links to `/` (homepage)
- Subtle hint (right of logo or below it): a small mono label `→ explore the full site` pointing toward the logo, making it clear clicking PR takes them to the full portfolio

### Hero Intro
Full-width section, same padding as other page heroes. Tone borrowed from about page copy — honest, slightly personal.

**Eyebrow:** `FOR THE SCAD SCHOLARSHIP COMMITTEE`

**Headline (h1, serif):** `Pramit Ranjan` (with red accent on first name, matching site style)

**Body (mono):** A note addressed to the committee. Draft:
> "UX design student at SCAD — I think like a designer but see like an artist. This page brings together both sides: product work grounded in research and empathy, and a creative practice rooted in film photography and art. Everything I make is here."

### Work Section
**Eyebrow/label:** `WORK`
**Layout:** 4-col grid (same as `/work`), all `workPage.projects` — no filtering needed (no soho in work section).

Uses `ProjectCard` component with `supportingCards` style settings.

### Creative Section
Three subsections stacked, each with a `SectionHeader` (label + count):

1. **Photography** — 4-col grid, all cities from `content.photography.cities`
2. **Mixed Media** — 3-col grid, all `mixed-media` case studies
3. **Branding** — 2-col grid, all `branding` case studies **except soho** (filter: `item.slug !== 'soho'`)

Uses `CreativeListingCard` with `photographyCards` style settings.

### Footer
Standard `Footer` component.

---

## Implementation Plan

### Step 1 — Create the server page
**File:** `app/scad-scholarship/page.tsx`

Server component. Calls `getPublicSiteContent()`, assembles props:
- All `workPage.projects`
- Photography cities with preview images (same logic as `creative/page.tsx`)
- Mixed media: `content.caseStudies.filter(s => s.section === 'mixed-media')`
- Branding: `content.caseStudies.filter(s => s.section === 'branding' && s.slug !== 'soho')`
- Pass all design settings through

Renders `<ScadPageClient>`.

### Step 2 — Create the client component
**File:** `components/ScadPageClient.tsx`

Client component. Structure:

```
<>
  <ScadHeader />          {/* minimal fixed header, PR logo → /, explore hint */}
  <main style={{ paddingTop: '57px' }}>
    <HeroSection />        {/* eyebrow + h1 + body */}
    <WorkSection />        {/* 4-col ProjectCard grid */}
    <CreativeSection />    {/* photography + mixed media + branding */}
  </main>
  <Footer />
</>
```

**ScadHeader:** inline in the same file. Fixed, same height/border as Nav. Left side: PR → `/`. Right side: `→ explore the full site` in mono, same small size as nav links, muted color (`#666666`), no link (it's a label pointing at the logo).

**WorkSection:** Reuse GSAP scroll reveal from `WorkPageClient` — copy the `useEffect` with `ScrollTrigger` on the grid ref.

**CreativeSection:** Three subsections, each with its own grid ref and GSAP reveal. Reuse `SectionHeader` (copy inline). `border-b border-divider` between subsections.

**Copy:** Hero copy hardcoded directly in the component (not in site-content.json — this page isn't admin-editable).

### Step 3 — Verify
- Navigate to `/scad-scholarship` locally
- Confirm PR logo links to `/`
- Confirm explore hint is visible and correctly positioned
- Confirm soho is absent from branding grid
- Confirm all other projects and photos appear
- Confirm GSAP scroll reveals work on all three grids
- Confirm page is not linked from Nav or any public page

---

## What we're NOT doing
- Not adding to Nav
- Not adding to site-content.json (hardcoded copy is intentional — this isn't a CMS-editable page)
- Not creating a new design system — reusing all existing components as-is
