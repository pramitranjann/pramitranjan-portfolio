# Personality Features — Design Spec

**Date:** 2026-03-22

## Overview

Five features that add personality to the portfolio without compromising the minimal aesthetic. Each is tucked into existing pages rather than added as a prominent section. The goal is that someone who looks closely notices them; someone who doesn't still has a complete experience.

---

## 1. Spotify Widget

### What it does
Shows what Pramit is currently playing (or last played if nothing is active). Pulls from the Spotify Web API. No green, no Spotify branding — styled entirely within the design system.

### Two placements on the about page

**Placement C — Sidebar panel** (directly after the hero section):
A new two-column row: left side is a short bio paragraph ("WHO I AM_"), right side is the full Spotify card. The card shows track title, artist, album, a progress bar, and timestamps. Live dot pulses when playing; static when showing last played.

**Placement B — /now listening cell** (inside the /now grid):
The LISTENING_ cell in the /now section becomes a live Spotify widget. Compact format: track title + artist + mini progress bar. No timestamps. The cell still shows "LISTENING_" as the label.

### API design
- Route: `GET /api/spotify`
- Returns when playing: `{ isPlaying: true, title, artist, album, albumArt, progress, duration }`
- Returns when not playing: `{ isPlaying: false, title, artist, album, albumArt }` (last played)
- Auth: OAuth 2.0 refresh token flow. Env vars: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`
- No caching — fresh fetch on every request (Spotify's currently-playing endpoint already has low latency)

### Client polling
SpotifyWidget polls `/api/spotify` every 30 seconds. On mount it fetches immediately. No loading skeleton — if data hasn't arrived yet the cell shows the static /now content as fallback.

---

## 2. /Now Section

A four-cell grid on the about page between the Tools section and the Contact CTA.

### Cells
| Label | Content type |
|-------|-------------|
| LISTENING_ | Live Spotify (compact widget) |
| MOVING_ | Manually written — training focus |
| EATING_ | Manually written — current food obsession |
| BUILDING_ | Manually written — active project |

### Design
- Full-width grid, 4 equal columns, separated by 1px divider lines
- Each cell: 20px padding, red label (8px, 0.18em tracking), DM Serif Display italic value, DM Mono body sub-text
- Preceded by an eyebrow row ("RIGHT NOW_") and a one-line note: "A snapshot of what I'm into this month. Updated manually."
- Content is hardcoded in the about page — updated manually when life changes

---

## 3. Custom 404 Page

### Design
- Giant ghost number "404" in #141414 (near-invisible on dark bg) sits behind the headline
- Headline: *"Lost in the darkroom."* — DM Serif Display, 38px, with "darkroom." in red
- Body: "This page doesn't exist. Either you typed something wrong, or I haven't built it yet. Either way — let's get you back."
- Single CTA button: `BACK TO HOME →` in red border style
- Decorative film strip stripe at bottom (repeating red dashes, 30% opacity)
- Nav included at top

### File
`app/not-found.tsx` — Next.js catches all unmatched routes automatically.

---

## 4. Reading Progress Bar

### What it does
A 2px red line at the very top of the viewport on case study pages. Fills from left to right as the user scrolls. Disappears at 100%.

### Scope
Case study pages only — added inside `CaseStudyLayout`. Not present on any other page type.

### Implementation
- `'use client'` component: `components/ReadingProgress.tsx`
- `fixed` position, `top: 0`, `left: 0`, `z-index: 50`
- Width driven by scroll percentage: `(scrollY / (scrollHeight - innerHeight)) * 100`
- `useEffect` attaches/removes `scroll` event listener
- No progress counter or percentage label — just the bar

---

## 5. Colophon Footer

### Replaces the existing footer entirely
Current footer: `PRAMIT RANJAN` left, `2026` right — one line, forgettable.

New footer: a single colophon line.

### Text
> Set in DM Serif Display and DM Mono. Built and designed between meals and gym sets. My mum thinks it looks nice. © 2026 PR_

### Design
- Same single-line layout as current footer
- `border-top: 1px solid #1a1a1a`, `padding: 12px 24px`
- Font: DM Mono, 9px, #444, 0.12em tracking
- DM Serif Display and DM Mono rendered in #555 (slightly lighter) to read as inline emphasis
- On mobile: wraps naturally, no special treatment needed

---

## What's not being built
- Film grain texture — dropped (accessibility concern, imperceptible difference)
- Expanded footer with nav columns — the colophon alone is sufficient
