# Personality Features — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five personality features to the portfolio: Spotify widget (two placements on about page), /now section, custom 404 page, reading progress bar on case studies, and colophon footer.

**Architecture:** New `SpotifyWidget` client component polls a new `/api/spotify` route. About page gets a new sidebar row and /now section. `CaseStudyLayout` gets a `ReadingProgress` client component injected. Footer is replaced entirely.

**Tech Stack:** Next.js App Router, React hooks, Spotify Web API (refresh token flow), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-22-personality-features-design.md`

---

## Task 1: Spotify API route

**Files:**
- Create: `app/api/spotify/route.ts`

- [ ] **Step 1: Write the route shell with types**

```typescript
// app/api/spotify/route.ts
import { NextResponse } from 'next/server'

interface SpotifyTrack {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string | null
  progress?: number
  duration?: number
}
```

- [ ] **Step 2: Implement token refresh helper**

```typescript
async function getAccessToken(): Promise<string> {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
  })
  const data = await res.json()
  return data.access_token
}
```

- [ ] **Step 3: Implement GET handler — currently playing**

```typescript
export async function GET() {
  try {
    const token = await getAccessToken()

    const nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    })

    // 204 = nothing playing
    if (nowRes.status === 204) {
      return getLastPlayed(token)
    }

    const now = await nowRes.json()
    if (!now?.item) return getLastPlayed(token)

    const track: SpotifyTrack = {
      isPlaying: now.is_playing,
      title: now.item.name,
      artist: now.item.artists.map((a: { name: string }) => a.name).join(', '),
      album: now.item.album.name,
      albumArt: now.item.album.images?.[1]?.url ?? now.item.album.images?.[0]?.url ?? null,
      progress: now.progress_ms,
      duration: now.item.duration_ms,
    }
    return NextResponse.json(track)
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Implement last-played fallback**

```typescript
async function getLastPlayed(token: string): Promise<NextResponse> {
  const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  })
  const data = await res.json()
  const item = data?.items?.[0]?.track
  if (!item) return NextResponse.json({ error: 'no data' }, { status: 404 })

  const track: SpotifyTrack = {
    isPlaying: false,
    title: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(', '),
    album: item.album.name,
    albumArt: item.album.images?.[1]?.url ?? item.album.images?.[0]?.url ?? null,
  }
  return NextResponse.json(track)
}
```

- [ ] **Step 5: Add env vars to `.env.local`**

Add these three (values from Spotify Developer Dashboard):
```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
```

- [ ] **Step 6: Test the route manually**

Run dev server. Visit `http://localhost:3000/api/spotify` in browser.
Expected: JSON with `isPlaying`, `title`, `artist`, `album`, `albumArt` fields.
If 500: check env vars are set. If token error: re-generate refresh token.

- [ ] **Step 7: Commit**

```bash
git add app/api/spotify/route.ts
git commit -m "feat: add Spotify API route with currently-playing + last-played fallback"
```

---

## Task 2: SpotifyWidget component

**Files:**
- Create: `components/SpotifyWidget.tsx`

- [ ] **Step 1: Write the component with both variants**

```typescript
'use client'
import { useEffect, useState } from 'react'

interface Track {
  isPlaying: boolean
  title: string
  artist: string
  albumArt: string | null
  progress?: number
  duration?: number
}

interface SpotifyWidgetProps {
  variant: 'sidebar' | 'cell'
}

export function SpotifyWidget({ variant }: SpotifyWidgetProps) {
  const [track, setTrack] = useState<Track | null>(null)

  useEffect(() => {
    const fetch_ = () =>
      fetch('/api/spotify')
        .then(r => r.ok ? r.json() : null)
        .then(data => data && !data.error && setTrack(data))
        .catch(() => null)

    fetch_()
    const id = setInterval(fetch_, 30_000)
    return () => clearInterval(id)
  }, [])

  if (!track) return null  // fallback: parent renders static content

  const pct = track.progress && track.duration
    ? Math.round((track.progress / track.duration) * 100)
    : 0

  if (variant === 'cell') return <CellVariant track={track} pct={pct} />
  return <SidebarVariant track={track} pct={pct} />
}
```

- [ ] **Step 2: Implement SidebarVariant**

```typescript
function SidebarVariant({ track, pct }: { track: Track; pct: number }) {
  return (
    <div style={{ background: '#111111', border: '1px solid #1f1f1f', padding: '14px' }}>
      <div className="flex items-center" style={{ gap: '8px', marginBottom: '12px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: track.isPlaying ? '#FF3120' : '#444444',
          animation: track.isPlaying ? 'spotify-pulse 1.6s ease infinite' : 'none',
        }} />
        <span className="font-mono" style={{ fontSize: '8px', letterSpacing: '0.14em', color: '#666666' }}>
          {track.isPlaying ? 'NOW PLAYING' : 'LAST PLAYED'}
        </span>
      </div>
      <div className="flex" style={{ gap: '10px', alignItems: 'center' }}>
        {track.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.albumArt} alt={track.title} style={{ width: '36px', height: '36px', objectFit: 'cover', border: '1px solid #2a2a2a' }} />
        ) : (
          <div style={{ width: '36px', height: '36px', background: '#1f1f1f', border: '1px solid #2a2a2a', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#f5f2ed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.title}
          </div>
          <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#999999', marginTop: '2px' }}>
            {track.artist.toUpperCase()}
          </div>
        </div>
      </div>
      {track.isPlaying && (
        <>
          <div style={{ marginTop: '10px', height: '1px', background: '#1f1f1f', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: '#FF3120' }} />
          </div>
          <div className="flex justify-between" style={{ marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: '7px', letterSpacing: '0.1em', color: '#444444' }}>
              {track.progress ? formatMs(track.progress) : '0:00'}
            </span>
            <span className="font-mono" style={{ fontSize: '7px', letterSpacing: '0.1em', color: '#444444' }}>
              {track.duration ? formatMs(track.duration) : '0:00'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Implement CellVariant**

```typescript
function CellVariant({ track, pct }: { track: Track; pct: number }) {
  return (
    <div>
      <div className="flex items-center" style={{ gap: '5px', marginBottom: '8px' }}>
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: track.isPlaying ? '#FF3120' : '#444444',
          animation: track.isPlaying ? 'spotify-pulse 1.6s ease infinite' : 'none',
          flexShrink: 0,
        }} />
        <span className="font-mono" style={{ fontSize: '7px', letterSpacing: '0.14em', color: '#666666' }}>
          {track.isPlaying ? 'LIVE' : 'LAST'}
        </span>
      </div>
      <div className="font-serif" style={{ fontSize: '13px', fontStyle: 'italic', color: '#f5f2ed', lineHeight: 1.2, marginBottom: '3px' }}>
        {track.title}
      </div>
      <div className="font-mono" style={{ fontSize: '8px', letterSpacing: '0.1em', color: '#999999' }}>
        {track.artist.toUpperCase()}
      </div>
      <div style={{ height: '1px', background: '#1f1f1f', position: 'relative', marginTop: '8px' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: '#FF3120' }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add formatMs helper and keyframe**

```typescript
function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
```

Add to `app/globals.css`:
```css
@keyframes spotify-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

- [ ] **Step 5: Commit**

```bash
git add components/SpotifyWidget.tsx app/globals.css
git commit -m "feat: add SpotifyWidget component (sidebar + cell variants)"
```

---

## Task 3: About page — WHO I AM sidebar + /now section

**Files:**
- Modify: `app/about/page.tsx`

- [ ] **Step 1: Read the current about page**

Read `app/about/page.tsx` in full to understand current section order.

- [ ] **Step 2: Add WHO I AM sidebar row after the hero section**

After the closing `</section>` of the Hero section (line ~117), add:

```tsx
{/* WHO I AM + Spotify sidebar */}
<section className="border-b border-divider" style={{ display: 'grid', gridTemplateColumns: '1fr 260px' }}>
  <div style={{ padding: '48px 40px', borderRight: '1px solid #1f1f1f' }}>
    <span className="font-mono" style={{ fontSize: '8px', letterSpacing: '0.18em', color: '#666666', display: 'block', marginBottom: '12px' }}>WHO I AM_</span>
    <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '420px' }}>
      I think like a designer but see like an artist — photography came first, then Figma. I care about the stuff between the pixels: tone, feeling, timing. Design that knows it's talking to a person.
    </p>
  </div>
  <div style={{ padding: '28px 24px' }}>
    <span className="font-mono" style={{ fontSize: '8px', letterSpacing: '0.18em', color: '#666666', display: 'block', marginBottom: '10px' }}>ON ROTATION_</span>
    <SpotifyWidget variant="sidebar" />
  </div>
</section>
```

- [ ] **Step 3: Add /now section after the Tools section**

After the closing `</section>` of the Tools section, before Contact CTA:

```tsx
{/* /Now */}
<section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
  <div className="flex items-center" style={{ gap: '10px', marginBottom: '8px' }}>
    <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
    <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>RIGHT NOW_</span>
  </div>
  <p className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.04em', color: '#666666', lineHeight: 1.8, marginBottom: '24px' }}>
    A snapshot of what I'm into this month. Updated manually.
  </p>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1f1f1f', border: '1px solid #1f1f1f' }}>
    {/* LISTENING — live Spotify */}
    <div style={{ background: '#0d0d0d', padding: '20px' }}>
      <span className="font-mono" style={{ fontSize: '8px', letterSpacing: '0.18em', color: '#FF3120', display: 'block', marginBottom: '10px' }}>LISTENING_</span>
      <SpotifyWidget variant="cell" />
    </div>
    {/* MOVING */}
    <NowCell label="MOVING_" value="5 days / week lift + run" sub="Chasing a sub-22min 5K. Not there yet." />
    {/* EATING */}
    <NowCell label="EATING_" value="Attempting biryani" sub="Ramadan meal prep. Elevated chicken rice." />
    {/* BUILDING */}
    <NowCell label="BUILDING_" value="This portfolio (obviously)" sub="Plus Accord — contracts for freelancers." />
  </div>
</section>
```

- [ ] **Step 4: Add NowCell helper component above AboutPage**

```tsx
function NowCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: '#0d0d0d', padding: '20px' }}>
      <span className="font-mono" style={{ fontSize: '8px', letterSpacing: '0.18em', color: '#FF3120', display: 'block', marginBottom: '10px' }}>{label}</span>
      <div className="font-serif" style={{ fontSize: '15px', fontStyle: 'italic', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.3, marginBottom: '6px' }}>{value}</div>
      <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.08em', color: '#999999', lineHeight: 1.6 }}>{sub}</div>
    </div>
  )
}
```

- [ ] **Step 5: Add SpotifyWidget import at top of file**

```tsx
import { SpotifyWidget } from '@/components/SpotifyWidget'
```

- [ ] **Step 6: Add mobile responsive rule for WHO I AM sidebar**

In `app/globals.css`, inside the `@media (max-width: 767px)` block:

```css
/* About page — who I am sidebar collapses */
.about-who-sidebar {
  grid-template-columns: 1fr !important;
}
.about-who-sidebar > div:first-child {
  border-right: none !important;
  border-bottom: 1px solid #1f1f1f !important;
}
```

Add `className="about-who-sidebar"` to the WHO I AM section's outer `<section>` style grid div.

Also add rule for /now grid on mobile (collapse to 2×2):

```css
/* /Now grid — 2 col on mobile */
.now-grid-mobile {
  grid-template-columns: repeat(2, 1fr) !important;
}
```

Add `className="now-grid-mobile"` to the /now inner grid div.

- [ ] **Step 7: Check page renders without Spotify env vars**

`SpotifyWidget` returns `null` if fetch fails — the LISTENING_ cell will be empty but won't crash. Verify this looks acceptable (cell with just the label, no content).

- [ ] **Step 8: Commit**

```bash
git add app/about/page.tsx app/globals.css
git commit -m "feat: add Spotify sidebar + /now section to about page"
```

---

## Task 4: Custom 404 page

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 1: Create the file**

```tsx
// app/not-found.tsx
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>
        <section style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '70vh', justifyContent: 'center' }}>
          {/* Ghost number */}
          <div
            className="font-serif"
            style={{ fontSize: 'clamp(100px, 18vw, 180px)', fontWeight: 400, fontStyle: 'italic', color: '#141414', lineHeight: 1, marginBottom: '-40px', letterSpacing: '-4px', userSelect: 'none', position: 'relative', zIndex: 0 }}
          >
            404
          </div>
          {/* Headline */}
          <h1
            className="font-serif"
            style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1, marginBottom: '16px', position: 'relative', zIndex: 1 }}
          >
            Lost in the{' '}
            <span style={{ color: '#FF3120' }}>darkroom.</span>
          </h1>
          {/* Body */}
          <p
            className="font-mono"
            style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '360px', marginBottom: '36px' }}
          >
            This page doesn't exist. Either you typed something wrong, or I haven't built it yet. Either way — let's get you back.
          </p>
          {/* CTA */}
          <Link
            href="/"
            className="font-mono"
            style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#FF3120', border: '1px solid #FF3120', padding: '10px 20px', textDecoration: 'none' }}
          >
            BACK TO HOME →
          </Link>
          {/* Film strip stripe */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
            background: 'repeating-linear-gradient(90deg, #FF3120 0px, #FF3120 24px, transparent 24px, transparent 36px)',
            opacity: 0.3,
          }} />
        </section>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Test it**

Navigate to `http://localhost:3000/this-doesnt-exist`. Should render the 404 page.

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat: add custom 404 page — lost in the darkroom"
```

---

## Task 5: Reading progress bar

**Files:**
- Create: `components/ReadingProgress.tsx`
- Modify: `components/CaseStudyLayout.tsx`

- [ ] **Step 1: Create ReadingProgress component**

```tsx
// components/ReadingProgress.tsx
'use client'
import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      setPct((window.scrollY / scrollable) * 100)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', zIndex: 100, background: '#1f1f1f' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: '#FF3120', transition: 'width 0.1s linear' }} />
    </div>
  )
}
```

- [ ] **Step 2: Read CaseStudyLayout.tsx to find where to insert**

Read `components/CaseStudyLayout.tsx` — find the opening of the returned JSX (the `<>` or outer fragment).

- [ ] **Step 3: Add ReadingProgress to CaseStudyLayout**

Add import at top:
```tsx
import { ReadingProgress } from './ReadingProgress'
```

Add as first element inside the returned fragment, before `<Nav />`:
```tsx
<ReadingProgress />
```

- [ ] **Step 4: Verify it works on a case study page**

Navigate to `http://localhost:3000/work/accord`. Scroll the page. The 2px red line should fill from left to right.

- [ ] **Step 5: Commit**

```bash
git add components/ReadingProgress.tsx components/CaseStudyLayout.tsx
git commit -m "feat: add reading progress bar to case study pages"
```

---

## Task 6: Colophon footer

**Files:**
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Read current Footer**

Read `components/Footer.tsx`. Current content: `PRAMIT RANJAN` left, `2026` right.

- [ ] **Step 2: Replace entirely**

```tsx
export function Footer() {
  return (
    <footer
      className="font-mono"
      style={{ borderTop: '1px solid #1a1a1a', padding: '12px 24px' }}
    >
      <span style={{ fontSize: '9px', letterSpacing: '0.08em', color: '#444444', lineHeight: 1.8 }}>
        Set in{' '}
        <span style={{ color: '#555555' }}>DM Serif Display</span>
        {' '}and{' '}
        <span style={{ color: '#555555' }}>DM Mono</span>
        . Built and designed between meals and gym sets. My mum thinks it looks nice. © 2026 PR_
      </span>
    </footer>
  )
}
```

- [ ] **Step 3: Check on all pages**

Visit `/`, `/about`, `/work`, any case study, `/creative`. Footer should appear on all and wrap gracefully on mobile.

- [ ] **Step 4: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: replace footer with colophon"
```

---

## Task 7: Spotify credentials setup guide

This is not a code task — it's a setup task for the human.

- [ ] **Step 1: Create Spotify app**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create app → Redirect URI: `http://localhost:3000/callback`
3. Copy **Client ID** and **Client Secret** into `.env.local`

- [ ] **Step 2: Get refresh token**

The simplest method — run this in a browser to authorise:

```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-read-currently-playing%20user-read-recently-played
```

Copy the `code` from the redirect URL, then exchange it:

```bash
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  -d "grant_type=authorization_code&code=YOUR_CODE&redirect_uri=http://localhost:3000/callback"
```

Copy `refresh_token` from the response into `.env.local`.

- [ ] **Step 3: Verify**

Visit `http://localhost:3000/api/spotify` — should return JSON with track data.

---

## Push

```bash
git push
```
