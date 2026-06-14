# PR/LIFE Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild PR/LIFE around a voice-first capture model on phone/iPad (hold-to-record with autosave undo) and a forward-looking planning surface on desktop, with four Tasks views, a forward-looking Week page, a section-card Reports reader, and a Notion-grade UI/spacing pass.

**Architecture:** Next.js 16 App Router app with server components doing data loads and `'use client'` boundaries for interaction. Supabase admin client owns persistence. CSS lives in a single `app/globals.css` scoped under `.life-shell`. No new dependencies are added; no new database tables. The plan introduces small focused client components and shared primitives (TaskRow, DayCell, SectionCard) reused across views.

**Tech Stack:** Next.js 16.2.1, React 19.2, TypeScript 5, Supabase (`@supabase/supabase-js`), `react-markdown` + `remark-gfm`, native `SpeechRecognition` / `webkitSpeechRecognition`, native pointer events for hold-to-record. Verification via `npx tsc --noEmit` and `npm run build` — the project has no test runner; pure-utility functions get an inline `node` smoke check where useful.

**Spec:** [docs/superpowers/specs/2026-06-14-life-redesign-design.md](../specs/2026-06-14-life-redesign-design.md)

---

## Phase 0 — Foundation utilities

### Task 1: Viewport mode hook

**Files:**
- Create: `hooks/useViewportMode.ts`

- [ ] **Step 1: Create the hook**

```ts
'use client'

import { useEffect, useState } from 'react'

export type ViewportMode = 'phone' | 'tablet' | 'desktop'

const PHONE_QUERY = '(max-width: 699px)'
const TABLET_QUERY = '(min-width: 700px) and (max-width: 1099px)'

function readMode(): ViewportMode {
  if (typeof window === 'undefined') {
    return 'desktop'
  }

  if (window.matchMedia(PHONE_QUERY).matches) {
    return 'phone'
  }

  if (window.matchMedia(TABLET_QUERY).matches) {
    return 'tablet'
  }

  return 'desktop'
}

export function useViewportMode(): ViewportMode {
  const [mode, setMode] = useState<ViewportMode>('desktop')

  useEffect(() => {
    setMode(readMode())

    const phone = window.matchMedia(PHONE_QUERY)
    const tablet = window.matchMedia(TABLET_QUERY)

    const onChange = () => setMode(readMode())
    phone.addEventListener('change', onChange)
    tablet.addEventListener('change', onChange)

    return () => {
      phone.removeEventListener('change', onChange)
      tablet.removeEventListener('change', onChange)
    }
  }, [])

  return mode
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors related to `hooks/useViewportMode.ts`.

- [ ] **Step 3: Commit**

```bash
git add hooks/useViewportMode.ts
git commit -m "Add useViewportMode hook for life capture branching"
```

---

### Task 2: Markdown sections parser

**Files:**
- Create: `lib/life/markdown-sections.ts`

- [ ] **Step 1: Create the parser**

```ts
export interface ReportSection {
  label: string
  body: string
}

const HEADING_RE = /^##\s+(.+?)\s*$/

export function parseReportSections(markdown: string): ReportSection[] {
  if (!markdown.trim()) {
    return []
  }

  const lines = markdown.split('\n')
  const sections: ReportSection[] = []
  let current: ReportSection | null = null

  for (const line of lines) {
    const match = line.match(HEADING_RE)
    if (match) {
      if (current) {
        sections.push({ label: current.label, body: current.body.trim() })
      }
      current = { label: match[1].trim(), body: '' }
      continue
    }

    if (current) {
      current.body += `${line}\n`
    }
  }

  if (current) {
    sections.push({ label: current.label, body: current.body.trim() })
  }

  return sections
}

export function sectionKey(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 2: Smoke-test with a one-shot node script**

Run:
```bash
node --input-type=module -e "
import('./lib/life/markdown-sections.ts').catch(async () => {
  const { parseReportSections } = await import('./node_modules/.bin/tsx-noop.js').catch(() => null) || {}
})
"
```

If the above doesn't work due to ts imports, instead run a one-shot transpile-and-test via the project's existing `tsc`:

```bash
npx tsc --noEmit lib/life/markdown-sections.ts
```

Expected: no type errors. (Functional verification happens in Task 23 when SectionCard renders the output.)

- [ ] **Step 3: Commit**

```bash
git add lib/life/markdown-sections.ts
git commit -m "Add markdown section parser for life reports"
```

---

### Task 3: Calendar range sync refactor

**Files:**
- Modify: `lib/life/calendar.ts`

- [ ] **Step 1: Update `syncCalendarEvents` to accept a range**

Replace the signature and the `windowStart`/`windowEnd` computation in `lib/life/calendar.ts:59-68`:

```ts
export async function syncCalendarEvents(
  startLocalDate?: string,
  endLocalDate?: string,
) {
  const settings = await getOwnerSettings();
  const timeZone = settings.timezone;
  const supabase = getSupabaseAdmin();
  const calendar = getCalendarClient();
  const baseStart = startLocalDate || getCurrentLocalDate(timeZone);
  const baseEnd = endLocalDate || baseStart;
  const windowStart = addDays(baseStart, -1);
  const windowEnd = addDays(baseEnd, 7);
```

Replace the return value's `localDate` to expose the full range:

```ts
  return {
    synced: events.length,
    startLocalDate: baseStart,
    endLocalDate: baseEnd,
    timeZone,
    calendarIds,
    events,
  };
}
```

- [ ] **Step 2: Update existing single-date callers**

`grep -rn "syncCalendarEvents(" app lib` to find call sites. Each existing caller passes a single string — they keep working because the second argument defaults to the first.

Confirm zero call sites destructure `.localDate` from the result. If any do, rename to `.startLocalDate`. Current callers (page loads + cron) only use the function for its side effect.

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/life/calendar.ts
git commit -m "Allow life calendar sync to span a date range"
```

---

### Task 4: System prompt + content constants

**Files:**
- Modify: `lib/life/constants.ts`

- [ ] **Step 1: Tighten EOD prompt section headings**

Replace `EOD_SYSTEM_PROMPT` in `lib/life/constants.ts`:

```ts
export const EOD_SYSTEM_PROMPT = `
You are Pramit's chief of staff. You receive his raw, messy, voice-dictated logs from
today plus context from recent days. Synthesize an end-of-day brief that is honest,
specific, and useful — not a generic summary.

Output strictly in this markdown structure. Use these exact H2 headings, in order.
Omit "Tension" entirely if there is nothing real to say.

## What moved
A few short paragraphs in your words. Not a list of his fragments.

## Decisions
Bullet list. Each bullet: the decision, then a short sub-line with the reasoning he gave.

## Open loops
Bullet list. Things mentioned but unresolved. Tag recurring ones plainly.

## Tension
Short paragraph. Where intention and reality diverged. Direct but not preachy. Skip if empty.

## One thing
One sentence — a single question or observation worth sitting with before tomorrow.

Write in clean prose. No corporate filler. Match a sharp, grounded tone. Do not flatter.
If the day was thin on content, keep it short rather than padding.
`.trim();
```

- [ ] **Step 2: Replace weekly review with forward-looking week-ahead prompt**

Replace `WEEKLY_REVIEW_SYSTEM_PROMPT` with `WEEK_AHEAD_SYSTEM_PROMPT`:

```ts
export const WEEK_AHEAD_SYSTEM_PROMPT = `
You are Pramit's chief of staff writing a forward-looking week-ahead brief.
You receive the compressed past-week summary, the upcoming week's calendar events,
his open tasks, and his recent open loops.

Goal: help him organize the coming week. Use these exact H2 headings, in order.

## This week's shape
Short paragraph. The week's character — calendar density, recurring obligations,
travel, anything that frames the days.

## What to protect
Bullet list. The 2–4 things that, if neglected, would make this week feel wasted.

## Commitments
Bullet list. Concrete things he's already on the hook for, with the day they land.

## One intention
One sentence — a single intention for the week, in his voice.

Write in markdown. Stay concrete. No filler. Do not invent commitments.
`.trim();
```

- [ ] **Step 3: Find any imports of `WEEKLY_REVIEW_SYSTEM_PROMPT`**

Run: `grep -rn "WEEKLY_REVIEW_SYSTEM_PROMPT" app lib`
Expected: only `lib/life/synthesis.ts` — will be updated in Task 25.

- [ ] **Step 4: Type check**

Run: `npx tsc --noEmit`
Expected: one error in `lib/life/synthesis.ts` about the missing export. That's fine — Task 25 fixes it. Note the error; do not fix yet.

- [ ] **Step 5: Commit**

```bash
git add lib/life/constants.ts
git commit -m "Recast life weekly prompt as forward-looking week-ahead brief"
```

---

## Phase 1 — Voice capture

### Task 5: VoiceCaptureControl refactor (push-to-talk + toggle + autosave undo)

**Files:**
- Modify: `components/life/VoiceCaptureControl.tsx`

- [ ] **Step 1: Replace the component**

Overwrite `components/life/VoiceCaptureControl.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

import { useViewportMode } from '@/hooks/useViewportMode'

const HOLD_THRESHOLD_MS = 300
const UNDO_WINDOW_MS = 2000

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionErrorEventLike extends Event {
  error?: string
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  abort?(): void
  start(): void
  stop(): void
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

function getSpeechErrorMessage(error?: string) {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Safari blocked speech recognition. Allow mic access and try again.'
    case 'audio-capture':
      return 'Safari could not access the microphone.'
    case 'network':
      return 'Speech recognition hit a network error.'
    case 'no-speech':
      return 'No speech detected.'
    case 'aborted':
      return null
    default:
      return 'Voice capture failed.'
  }
}

export function VoiceCaptureControl({
  textareaId,
  sourceInputId,
  liveTranscriptId,
}: {
  textareaId: string
  sourceInputId: string
  liveTranscriptId?: string
}) {
  const viewport = useViewportMode()
  const isHoldMode = viewport === 'phone' || viewport === 'tablet'

  const [mounted, setMounted] = useState(false)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interim, setInterim] = useState('')
  const [countdownActive, setCountdownActive] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef('')
  const interimRef = useRef('')
  const holdTimerRef = useRef<number | null>(null)
  const autosaveTimerRef = useRef<number | null>(null)
  const startedRef = useRef(false)
  const stoppingRef = useRef(false)

  useEffect(() => {
    setMounted(true)
    setSupported(Boolean(getRecognitionCtor()))
    return () => {
      cancelAllTimers()
      forceStopRecognition()
    }
  }, [])

  function cancelAllTimers() {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }
  }

  function writeToDraft(content: string) {
    const el = document.getElementById(textareaId) as HTMLTextAreaElement | null
    if (el) el.value = content
    const src = document.getElementById(sourceInputId) as HTMLInputElement | null
    if (src) src.value = 'voice'
    const live = liveTranscriptId
      ? (document.getElementById(liveTranscriptId) as HTMLElement | null)
      : null
    if (live) live.textContent = content
  }

  function combined() {
    return [finalRef.current, interimRef.current].filter(Boolean).join(' ').trim()
  }

  function forceStopRecognition() {
    const r = recognitionRef.current
    if (!r) return
    stoppingRef.current = true
    if (typeof r.abort === 'function') r.abort()
    else r.stop()
  }

  function startRecognition() {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setError('Voice capture is unavailable in this browser.')
      return
    }

    const existing = document.getElementById(textareaId) as HTMLTextAreaElement | null
    finalRef.current = existing?.value.trim() || ''
    interimRef.current = ''
    setInterim('')
    stoppingRef.current = false

    const recognition = new Ctor()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const transcript = result[0].transcript
        if (result.isFinal) finalText += transcript
        else interimText += transcript
      }
      if (finalText) finalRef.current = `${finalRef.current} ${finalText}`.trim()
      interimRef.current = interimText.trim()
      const combinedText = combined()
      writeToDraft(combinedText)
      setInterim(interimRef.current)
    }
    recognition.onerror = (event) => {
      const wasStopping = stoppingRef.current
      setListening(false)
      if (!(wasStopping && event.error === 'aborted')) {
        const msg = getSpeechErrorMessage(event.error)
        if (msg) setError(msg)
      }
    }
    recognition.onend = () => {
      setListening(false)
      setInterim('')
      interimRef.current = ''
      stoppingRef.current = false
      recognitionRef.current = null
      const draft = combined()
      writeToDraft(draft)
      if (draft) scheduleAutosave()
    }
    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
      startedRef.current = true
    } catch (startError) {
      setListening(false)
      recognitionRef.current = null
      setError(startError instanceof Error ? startError.message : 'Voice capture failed to start.')
    }
  }

  function scheduleAutosave() {
    setCountdownActive(true)
    autosaveTimerRef.current = window.setTimeout(() => {
      autosaveTimerRef.current = null
      setCountdownActive(false)
      const el = document.getElementById(textareaId) as HTMLTextAreaElement | null
      const form = el?.form
      if (form && (el?.value || '').trim()) {
        form.requestSubmit()
      }
    }, UNDO_WINDOW_MS)
  }

  function cancelAutosave() {
    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }
    setCountdownActive(false)
  }

  function undoCapture() {
    cancelAutosave()
    finalRef.current = ''
    interimRef.current = ''
    writeToDraft('')
    setInterim('')
  }

  // --- Hold-to-record handlers ---
  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!isHoldMode) return
    if (!supported) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setError(null)
    startedRef.current = false
    cancelAutosave()
    if (navigator.vibrate) {
      try {
        navigator.vibrate(20)
      } catch {
        /* ignore */
      }
    }
    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null
      startRecognition()
    }, HOLD_THRESHOLD_MS)
  }

  function onPointerEndLike() {
    if (!isHoldMode) return
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
      return
    }
    if (startedRef.current) {
      forceStopRecognition()
      startedRef.current = false
    }
  }

  // --- Desktop toggle handler ---
  function onToggleClick() {
    if (isHoldMode) return
    if (!supported) {
      setError('Voice capture is unavailable in this browser.')
      return
    }
    setError(null)
    if (listening) {
      forceStopRecognition()
      return
    }
    cancelAutosave()
    startRecognition()
  }

  // --- External hook: listen for draft edits to cancel autosave ---
  useEffect(() => {
    if (!countdownActive) return
    const el = document.getElementById(textareaId) as HTMLTextAreaElement | null
    if (!el) return
    const onInput = () => cancelAutosave()
    el.addEventListener('input', onInput)
    return () => el.removeEventListener('input', onInput)
  }, [countdownActive, textareaId])

  const label = !mounted
    ? 'Loading voice capture'
    : !supported
      ? 'Voice unavailable'
      : isHoldMode
        ? listening
          ? 'Recording — release to save'
          : 'Hold to record'
        : listening
          ? 'Stop'
          : 'Start voice capture'

  return (
    <>
      <button
        className={`mic-button ${listening ? 'is-live' : ''} ${isHoldMode ? 'is-hold' : 'is-toggle'}`}
        disabled={!mounted || !supported}
        type="button"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerEndLike}
        onPointerCancel={onPointerEndLike}
        onPointerLeave={onPointerEndLike}
        onClick={onToggleClick}
      >
        <span className="mic-button-label">{label}</span>
        {listening ? <span className="mic-button-dot" aria-hidden="true" /> : null}
      </button>
      {countdownActive ? (
        <div className="autosave-chip">
          <span className="autosave-chip-label">Saving in 2s</span>
          <button type="button" onClick={undoCapture} className="autosave-undo">
            Undo
          </button>
          <span className="autosave-chip-bar" aria-hidden="true" />
        </div>
      ) : null}
      {interim && listening ? null /* live transcript writes into draft directly */ : null}
      {error ? <p className="error-text">{error}</p> : null}
    </>
  )
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: no errors from `VoiceCaptureControl.tsx`. (The `synthesis.ts` error from Task 4 still expected.)

- [ ] **Step 3: Commit**

```bash
git add components/life/VoiceCaptureControl.tsx
git commit -m "Rewrite life voice capture for hold-to-record and autosave"
```

---

### Task 6: Today page server component — restructure

**Files:**
- Modify: `app/life/page.tsx`

- [ ] **Step 1: Replace the JSX block**

Keep the existing data-loading block at the top of `app/life/page.tsx`. Replace the JSX from `return (` to the end of the function with:

```tsx
  const isPhoneFirstRenderHint = false // viewport detection happens client-side in the live transcript wrapper

  return (
    <div className="life-home-grid">
      <section className="hero-card life-capture-card">
        <div className="life-page-head">
          <p className="eyebrow">Today · {displayDate}</p>
        </div>

        <form action="/api/life/entries" className="capture-stack life-capture-stack" method="post">
          <input id={sourceInputId} name="source" type="hidden" defaultValue="text" />
          <VoiceCaptureControl
            sourceInputId={sourceInputId}
            textareaId={textareaId}
            liveTranscriptId="life-live-transcript"
          />
          <div id="life-live-transcript" className="life-live-transcript" aria-live="polite" />
          <textarea
            className="draft-area life-entry-area"
            id={textareaId}
            name="content"
            rows={6}
            placeholder="Capture."
          />
          <div className="life-entry-controls">
            <label className="field compact-field">
              <span>Project</span>
              <select className="text-input" defaultValue="" name="projectSlug">
                <option value="">Auto</option>
                {LIFE_PROJECTS.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" type="submit">
              Save
            </button>
          </div>
          {formError ? <p className="error-text">{formError}</p> : null}
          {loadError ? <p className="error-text">{loadError}</p> : null}
        </form>
      </section>

      <aside className="life-home-sidebar">
        {morningReport ? (
          <section className="panel-card life-brief-card">
            <div className="section-head">
              <h2>AM brief</h2>
            </div>
            <MarkdownCard content={morningReport.content} />
          </section>
        ) : null}

        <section className="panel-card life-plan-card">
          <div className="section-head">
            <h2>Tasks</h2>
            <span className="count-pill">{activeTasks.length}</span>
          </div>
          {activeTasks.length === 0 ? <p className="muted-text">Clear.</p> : null}
          <ul className="timeline-list life-task-strip">
            {activeTasks.map((task) => (
              <li className="timeline-item" key={task.id}>
                <strong>{task.title}</strong>
                <p className="muted-text">
                  {task.project_slug ? `${getProjectLabel(task.project_slug) || task.project_slug}` : 'General'}
                  {task.due_local_date ? ` • ${task.due_local_date}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel-card life-calendar-card">
          <div className="section-head">
            <h2>Cal</h2>
            <span className="count-pill">{events.length}</span>
          </div>
          {events.length === 0 ? (
            <p className="muted-text">No events.</p>
          ) : (
            <ul className="timeline-list">
              {events.map((event) => (
                <li className="timeline-item" key={event.id}>
                  <strong>{event.title || '(Untitled event)'}</strong>
                  <p className="muted-text">
                    {event.all_day
                      ? 'All day'
                      : `${event.start_time ? getLocalTimeLabel(event.start_time, timezone) : 'Unknown'} to ${event.end_time ? getLocalTimeLabel(event.end_time, timezone) : 'Unknown'}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {calendarError ? <p className="error-text">{calendarError}</p> : null}
        </section>
      </aside>
    </div>
  )
```

- [ ] **Step 2: Remove the unused entries fetch**

In the same file, remove `entries` from the `Promise.all` data load and delete the `entries` state variable. The capture screen no longer renders today's entries.

After edit, the data block should look like:

```ts
const [eventsResult, reportsResult, taskRows] = await Promise.all([
  supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', OWNER_ID)
    .eq('local_date', localDate)
    .order('start_time', { ascending: true }),
  supabase
    .from('reports')
    .select('*')
    .eq('user_id', OWNER_ID)
    .eq('local_date', localDate)
    .order('created_at', { ascending: false }),
  getTasks({ status: 'active' }),
])

if (eventsResult.error) throw eventsResult.error
if (reportsResult.error) throw reportsResult.error
```

And drop the `let entries: EntryRecord[] = []` declaration plus the `EntryRecord` import.

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: only the known `synthesis.ts` error.

- [ ] **Step 4: Commit**

```bash
git add app/life/page.tsx
git commit -m "Refocus life Today on capture with sidebar context"
```

---

### Task 7: Delete unused TodayClient

**Files:**
- Delete: `components/life/TodayClient.tsx`

- [ ] **Step 1: Confirm no imports**

Run: `grep -rn "TodayClient" app components lib`
Expected: zero references.

- [ ] **Step 2: Delete the file**

Run: `rm components/life/TodayClient.tsx`

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: only the known `synthesis.ts` error.

- [ ] **Step 4: Commit**

```bash
git add -A components/life/TodayClient.tsx
git commit -m "Remove obsolete TodayClient component"
```

---

### Task 8: Hide History on phone

**Files:**
- Modify: `components/life/LifeHeader.tsx`

- [ ] **Step 1: Add a `data-mobile-hidden` attribute to the History nav item**

Replace `LIFE_NAV_ITEMS` and the map in `components/life/LifeHeader.tsx`:

```tsx
const LIFE_NAV_ITEMS: Array<{ href: string; label: string; phoneHidden?: boolean }> = [
  { href: '/life', label: 'Today' },
  { href: '/life/tasks', label: 'Tasks' },
  { href: '/life/review', label: 'Week' },
  { href: '/life/report', label: 'Reports' },
  { href: '/life/history', label: 'History', phoneHidden: true },
]
```

Then in the map:

```tsx
<Link
  key={item.href}
  href={item.href}
  className={`nav-link font-mono${active ? ' active' : ''}${item.phoneHidden ? ' phone-hidden' : ''}`}
>
  {item.label}
</Link>
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: only the known `synthesis.ts` error.

- [ ] **Step 3: Commit**

```bash
git add components/life/LifeHeader.tsx
git commit -m "Rename life nav for Week and Reports; mark History phone-hidden"
```

(CSS rule that actually hides the link is added in Task 27.)

---

## Phase 2 — Tasks (four views)

### Task 9: TaskRow + inline AddTask primitives

**Files:**
- Create: `components/life/tasks/TaskRow.tsx`
- Create: `components/life/tasks/AddTaskInline.tsx`

- [ ] **Step 1: TaskRow component**

```tsx
'use client'

import Link from 'next/link'

import { getProjectLabel } from '@/lib/life/projects'
import type { TaskRecord } from '@/lib/life/types'

export interface TaskRowProps {
  task: TaskRecord
  redirectTo: string
  variant?: 'default' | 'compact' | 'checklist'
  showProject?: boolean
  showDue?: boolean
  showPriority?: boolean
}

export function TaskRow({
  task,
  redirectTo,
  variant = 'default',
  showProject = true,
  showDue = true,
  showPriority = true,
}: TaskRowProps) {
  const projectLabel = task.project_slug
    ? getProjectLabel(task.project_slug) || task.project_slug
    : null

  return (
    <div className={`life-task-row life-task-row-${variant}`}>
      <form action={`/api/life/tasks/${task.id}`} method="post" className="life-task-row-check">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input
          type="hidden"
          name="status"
          value={task.status === 'done' ? 'open' : 'done'}
        />
        <button type="submit" className="life-task-checkbox" aria-label={task.status === 'done' ? 'Reopen' : 'Mark done'}>
          {task.status === 'done' ? '☑' : '☐'}
        </button>
      </form>
      <div className="life-task-row-body">
        <span className={`life-task-title ${task.status === 'done' ? 'is-done' : ''}`}>{task.title}</span>
        {variant !== 'checklist' ? (
          <div className="life-task-row-meta">
            {showPriority ? <span className={`priority-pill priority-${task.priority}`}>{task.priority}</span> : null}
            {showProject && projectLabel ? <span className="badge secondary">{projectLabel}</span> : null}
            {showDue && task.due_local_date ? <span className="badge secondary">Due {task.due_local_date}</span> : null}
          </div>
        ) : null}
      </div>
      {variant !== 'checklist' ? (
        <div className="life-task-row-actions">
          {task.status !== 'in_progress' && task.status !== 'done' ? (
            <form action={`/api/life/tasks/${task.id}`} method="post">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="status" value="in_progress" />
              <button className="secondary-button" type="submit">Start</button>
            </form>
          ) : null}
          {task.status !== 'dismissed' && task.status !== 'done' ? (
            <form action={`/api/life/tasks/${task.id}`} method="post">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="status" value="dismissed" />
              <button className="secondary-button" type="submit">Dismiss</button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: AddTaskInline component**

```tsx
'use client'

import { useState } from 'react'

import { LIFE_PROJECTS } from '@/lib/life/projects'

export function AddTaskInline({
  redirectTo,
  defaultProject = '',
  defaultDue = '',
  placeholder = 'New task',
}: {
  redirectTo: string
  defaultProject?: string
  defaultDue?: string
  placeholder?: string
}) {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
      <button
        type="button"
        className="life-add-inline-trigger"
        onClick={() => setExpanded(true)}
      >
        + Add task
      </button>
    )
  }

  return (
    <form action="/api/life/tasks" method="post" className="life-add-inline">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input
        autoFocus
        required
        type="text"
        name="title"
        placeholder={placeholder}
        className="text-input"
      />
      <div className="life-add-inline-row">
        <select className="text-input" defaultValue={defaultProject} name="projectSlug">
          <option value="">Unassigned</option>
          {LIFE_PROJECTS.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
        <select className="text-input" defaultValue="medium" name="priority">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input className="text-input" type="date" name="dueLocalDate" defaultValue={defaultDue} />
        <button type="submit" className="primary-button">Add</button>
        <button type="button" className="secondary-button" onClick={() => setExpanded(false)}>Cancel</button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: only the known `synthesis.ts` error.

- [ ] **Step 4: Commit**

```bash
git add components/life/tasks/TaskRow.tsx components/life/tasks/AddTaskInline.tsx
git commit -m "Add shared TaskRow and AddTaskInline primitives"
```

---

### Task 10: Tasks unified toolbar

**Files:**
- Create: `components/life/tasks/TasksToolbar.tsx`

- [ ] **Step 1: Create the toolbar**

```tsx
'use client'

import Link from 'next/link'

import { LIFE_PROJECTS } from '@/lib/life/projects'

import type { TaskView } from './TasksClient'

const STATUSES: Array<{ value: string; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'Doing' },
  { value: 'done', label: 'Done' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All' },
]

const VIEWS: Array<{ value: TaskView; label: string }> = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'inbox', label: 'Inbox' },
  { value: 'list', label: 'List' },
  { value: 'checklist', label: 'Checklist' },
]

export function TasksToolbar({
  status,
  project,
  view,
  onViewChange,
}: {
  status: string
  project: string
  view: TaskView
  onViewChange: (v: TaskView) => void
}) {
  return (
    <div className="life-tasks-toolbar">
      <div className="life-tasks-toolbar-row">
        <div className="segmented" role="tablist" aria-label="View">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              role="tab"
              aria-selected={view === v.value}
              className={`segmented-item ${view === v.value ? 'is-active' : ''}`}
              onClick={() => onViewChange(v.value)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="life-tasks-toolbar-filters">
          <div className="toolbar">
            {STATUSES.map((s) => (
              <Link
                key={s.value}
                className={`filter-chip ${status === s.value ? 'is-active' : ''}`}
                href={`/life/tasks?status=${s.value}${project ? `&project=${project}` : ''}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
          <form method="get" action="/life/tasks" className="life-tasks-project-select">
            <input type="hidden" name="status" value={status} />
            <select
              className="text-input"
              defaultValue={project}
              name="project"
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
            >
              <option value="">All projects</option>
              {LIFE_PROJECTS.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type check (expected to fail until TasksClient exists)**

Run: `npx tsc --noEmit`
Expected: errors for `TasksClient` import. That's resolved in Task 11.

- [ ] **Step 3: Commit**

```bash
git add components/life/tasks/TasksToolbar.tsx
git commit -m "Add unified life tasks toolbar"
```

---

### Task 11: TasksClient (view switcher + persistence)

**Files:**
- Create: `components/life/tasks/TasksClient.tsx`

- [ ] **Step 1: Create the client orchestrator**

```tsx
'use client'

import { useEffect, useState } from 'react'

import type { TaskRecord } from '@/lib/life/types'

import { TasksToolbar } from './TasksToolbar'
import { KanbanView } from './KanbanView'
import { InboxView } from './InboxView'
import { ListView } from './ListView'
import { ChecklistView } from './ChecklistView'

export type TaskView = 'kanban' | 'inbox' | 'list' | 'checklist'

const STORAGE_KEY = 'life.tasksView'
const DEFAULT_VIEW: TaskView = 'kanban'

function readStoredView(): TaskView {
  if (typeof window === 'undefined') return DEFAULT_VIEW
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'kanban' || stored === 'inbox' || stored === 'list' || stored === 'checklist') {
    return stored
  }
  return DEFAULT_VIEW
}

export function TasksClient({
  tasks,
  status,
  project,
  error,
}: {
  tasks: TaskRecord[]
  status: string
  project: string
  error: string | null
}) {
  const [view, setView] = useState<TaskView>(DEFAULT_VIEW)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setView(readStoredView())
    setMounted(true)
  }, [])

  function handleViewChange(next: TaskView) {
    setView(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage may be unavailable in private mode */
    }
  }

  const redirectTo = `/life/tasks?status=${status}${project ? `&project=${project}` : ''}`

  return (
    <div className="life-tasks-shell">
      <TasksToolbar status={status} project={project} view={view} onViewChange={handleViewChange} />
      {error ? <p className="error-text">{error}</p> : null}
      {!mounted ? (
        <p className="muted-text">Loading view…</p>
      ) : view === 'kanban' ? (
        <KanbanView tasks={tasks} redirectTo={redirectTo} />
      ) : view === 'inbox' ? (
        <InboxView tasks={tasks} redirectTo={redirectTo} />
      ) : view === 'list' ? (
        <ListView tasks={tasks} redirectTo={redirectTo} />
      ) : (
        <ChecklistView tasks={tasks} redirectTo={redirectTo} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit (view files added in Tasks 12–15 will resolve the imports)**

```bash
git add components/life/tasks/TasksClient.tsx
git commit -m "Add TasksClient with view-switch persistence"
```

---

### Task 12: KanbanView

**Files:**
- Create: `components/life/tasks/KanbanView.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'

import type { TaskRecord } from '@/lib/life/types'

import { AddTaskInline } from './AddTaskInline'
import { TaskRow } from './TaskRow'

type Column = { key: 'open' | 'in_progress' | 'done'; label: string }

const COLUMNS: Column[] = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'Doing' },
  { key: 'done', label: 'Done' },
]

async function moveTask(taskId: string, status: Column['key']) {
  const form = new FormData()
  form.append('status', status)
  await fetch(`/api/life/tasks/${taskId}`, { method: 'POST', body: form })
  if (typeof window !== 'undefined') window.location.reload()
}

export function KanbanView({
  tasks,
  redirectTo,
}: {
  tasks: TaskRecord[]
  redirectTo: string
}) {
  const [dragOver, setDragOver] = useState<Column['key'] | null>(null)

  function onDragStart(event: React.DragEvent<HTMLDivElement>, taskId: string) {
    event.dataTransfer.setData('text/plain', taskId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>, key: Column['key']) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    setDragOver(null)
    if (taskId) void moveTask(taskId, key)
  }

  return (
    <div className="life-kanban">
      {COLUMNS.map((col) => {
        const items = tasks.filter((task) => task.status === col.key)
        return (
          <div
            key={col.key}
            className={`life-kanban-col ${dragOver === col.key ? 'is-drop' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(col.key)
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop(e, col.key)}
          >
            <div className="life-kanban-col-head">
              <h3>{col.label}</h3>
              <span className="count-pill">{items.length}</span>
            </div>
            <AddTaskInline redirectTo={redirectTo} />
            <ul className="life-kanban-list">
              {items.map((task) => (
                <li key={task.id}>
                  <div
                    className="life-kanban-card"
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                  >
                    <TaskRow task={task} redirectTo={redirectTo} variant="compact" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: only the known `synthesis.ts` error.

- [ ] **Step 3: Commit**

```bash
git add components/life/tasks/KanbanView.tsx
git commit -m "Add Kanban view for life tasks"
```

---

### Task 13: InboxView

**Files:**
- Create: `components/life/tasks/InboxView.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'

import { getProjectLabel } from '@/lib/life/projects'
import type { TaskRecord } from '@/lib/life/types'

import { AddTaskInline } from './AddTaskInline'
import { TaskRow } from './TaskRow'

function pickFocus(tasks: TaskRecord[]): TaskRecord[] {
  const today = new Date().toISOString().slice(0, 10)
  const scored = tasks
    .filter((task) => task.status !== 'done' && task.status !== 'dismissed')
    .map((task) => {
      let score = 0
      if (task.priority === 'high') score += 3
      if (task.priority === 'medium') score += 1
      if (task.due_local_date && task.due_local_date <= today) score += 4
      return { task, score }
    })
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, 5).map((entry) => entry.task)
}

function groupByProject(tasks: TaskRecord[]) {
  const groups = new Map<string, TaskRecord[]>()
  for (const task of tasks) {
    const key = task.project_slug || 'unassigned'
    const list = groups.get(key) || []
    list.push(task)
    groups.set(key, list)
  }
  return Array.from(groups.entries()).sort(([l], [r]) => (l === 'unassigned' ? 1 : r === 'unassigned' ? -1 : l.localeCompare(r)))
}

export function InboxView({
  tasks,
  redirectTo,
}: {
  tasks: TaskRecord[]
  redirectTo: string
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const focus = pickFocus(tasks)
  const groups = groupByProject(tasks.filter((t) => !focus.includes(t)))

  function toggle(key: string) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="life-inbox">
      <section className="life-inbox-focus">
        <div className="section-head">
          <h2>Focus</h2>
          <span className="count-pill">{focus.length}</span>
        </div>
        {focus.length === 0 ? (
          <p className="muted-text">Clear. Add a task to focus.</p>
        ) : (
          <ul className="life-inbox-focus-list">
            {focus.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} redirectTo={redirectTo} />
              </li>
            ))}
          </ul>
        )}
        <AddTaskInline redirectTo={redirectTo} />
      </section>

      <section className="life-inbox-rest">
        {groups.map(([key, items]) => {
          const label = key === 'unassigned' ? 'Unassigned' : getProjectLabel(key) || key
          const isCollapsed = collapsed.has(key)
          return (
            <article key={key} className="life-inbox-group">
              <button type="button" className="life-inbox-group-head" onClick={() => toggle(key)}>
                <h3>{label}</h3>
                <span className="count-pill">{items.length}</span>
                <span className="muted-text">{isCollapsed ? '▸' : '▾'}</span>
              </button>
              {!isCollapsed ? (
                <ul className="life-inbox-group-list">
                  {items.map((task) => (
                    <li key={task.id}>
                      <TaskRow task={task} redirectTo={redirectTo} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          )
        })}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Type check + commit**

```bash
npx tsc --noEmit
git add components/life/tasks/InboxView.tsx
git commit -m "Add Inbox view for life tasks"
```

---

### Task 14: ListView (Notion-style flat list)

**Files:**
- Create: `components/life/tasks/ListView.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'

import { getProjectLabel } from '@/lib/life/projects'
import type { TaskRecord } from '@/lib/life/types'

import { AddTaskInline } from './AddTaskInline'
import { TaskRow } from './TaskRow'

type GroupBy = 'project' | 'status' | 'priority' | 'due'
type SortBy = 'updated' | 'created' | 'due' | 'priority'

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function groupTasks(tasks: TaskRecord[], by: GroupBy): Array<[string, TaskRecord[]]> {
  const groups = new Map<string, TaskRecord[]>()
  for (const task of tasks) {
    let key = 'Unassigned'
    if (by === 'project') key = task.project_slug ? getProjectLabel(task.project_slug) || task.project_slug : 'Unassigned'
    if (by === 'status') key = task.status
    if (by === 'priority') key = task.priority
    if (by === 'due') key = task.due_local_date || 'No due date'
    const list = groups.get(key) || []
    list.push(task)
    groups.set(key, list)
  }
  return Array.from(groups.entries())
}

function sortTasks(tasks: TaskRecord[], by: SortBy): TaskRecord[] {
  const sorted = [...tasks]
  if (by === 'updated') sorted.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
  if (by === 'created') sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  if (by === 'due') sorted.sort((a, b) => (a.due_local_date || '9999').localeCompare(b.due_local_date || '9999'))
  if (by === 'priority') sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  return sorted
}

export function ListView({
  tasks,
  redirectTo,
}: {
  tasks: TaskRecord[]
  redirectTo: string
}) {
  const [groupBy, setGroupBy] = useState<GroupBy>('project')
  const [sortBy, setSortBy] = useState<SortBy>('updated')

  const sorted = sortTasks(tasks, sortBy)
  const groups = groupTasks(sorted, groupBy)

  return (
    <div className="life-list">
      <div className="life-list-toolbar">
        <label className="field compact-field">
          <span>Group</span>
          <select className="text-input" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}>
            <option value="project">By project</option>
            <option value="status">By status</option>
            <option value="priority">By priority</option>
            <option value="due">By due</option>
          </select>
        </label>
        <label className="field compact-field">
          <span>Sort</span>
          <select className="text-input" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
            <option value="updated">Updated</option>
            <option value="created">Created</option>
            <option value="due">Due</option>
            <option value="priority">Priority</option>
          </select>
        </label>
      </div>
      <AddTaskInline redirectTo={redirectTo} />
      {groups.map(([label, items]) => (
        <section key={label} className="life-list-group">
          <header className="life-list-group-head">
            <h3>{label}</h3>
            <span className="count-pill">{items.length}</span>
          </header>
          <ul className="life-list-rows">
            {items.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} redirectTo={redirectTo} variant="default" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
```

> **Note:** `TaskRecord` doesn't currently include `updated_at`. If that property doesn't exist on the record, default to `created_at` — adjust the `updated` sort accordingly:
> `sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))`
> Check `lib/life/types.ts` to confirm.

- [ ] **Step 2: Confirm `TaskRecord` fields exist**

Run: `grep -n "updated_at\|created_at" lib/life/types.ts`
If `updated_at` is missing, use `created_at` for both `updated` and `created` sorts (or document the gap).

- [ ] **Step 3: Type check + commit**

```bash
npx tsc --noEmit
git add components/life/tasks/ListView.tsx
git commit -m "Add Notion-style list view for life tasks"
```

---

### Task 15: ChecklistView

**Files:**
- Create: `components/life/tasks/ChecklistView.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'

import type { TaskRecord } from '@/lib/life/types'

import { AddTaskInline } from './AddTaskInline'
import { TaskRow } from './TaskRow'

export function ChecklistView({
  tasks,
  redirectTo,
}: {
  tasks: TaskRecord[]
  redirectTo: string
}) {
  const [showMeta, setShowMeta] = useState(false)
  const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'dismissed')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="life-checklist">
      <div className="life-checklist-toolbar">
        <button type="button" className="secondary-button" onClick={() => setShowMeta((s) => !s)}>
          {showMeta ? 'Hide metadata' : 'Show metadata'}
        </button>
      </div>
      <AddTaskInline redirectTo={redirectTo} />
      <ul className="life-checklist-list">
        {open.map((task) => (
          <li key={task.id}>
            <TaskRow
              task={task}
              redirectTo={redirectTo}
              variant={showMeta ? 'default' : 'checklist'}
              showProject={showMeta}
              showDue={showMeta}
              showPriority={showMeta}
            />
          </li>
        ))}
      </ul>
      {done.length > 0 ? (
        <details className="life-checklist-done">
          <summary>Done ({done.length})</summary>
          <ul className="life-checklist-list">
            {done.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} redirectTo={redirectTo} variant="checklist" />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Type check + commit**

```bash
npx tsc --noEmit
git add components/life/tasks/ChecklistView.tsx
git commit -m "Add Checklist view for life tasks"
```

---

### Task 16: Tasks page server shell

**Files:**
- Modify: `app/life/tasks/page.tsx`

- [ ] **Step 1: Replace the JSX with the client shell**

Overwrite `app/life/tasks/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

import { TasksClient } from '@/components/life/tasks/TasksClient'
import { isAdminSession } from '@/lib/admin-auth'
import { getTasks } from '@/lib/life/tasks'
import type { TaskStatus } from '@/lib/life/types'

export default async function LifeTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; project?: string; error?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/tasks')
  }

  const params = await searchParams
  const status = (params.status as TaskStatus | 'active' | 'all' | undefined) || 'active'
  const project = params.project || ''
  const error = params.error || null
  const tasks = await getTasks({ status, projectSlug: project || null })

  return (
    <div className="life-tasks-page">
      <div className="life-page-head">
        <p className="eyebrow">Tasks</p>
        <span className="count-pill">{tasks.length}</span>
      </div>
      <TasksClient tasks={tasks} status={status} project={project} error={error} />
    </div>
  )
}
```

- [ ] **Step 2: Type check + commit**

```bash
npx tsc --noEmit
git add app/life/tasks/page.tsx
git commit -m "Wire tasks page to view-switching client"
```

---

## Phase 3 — Week (forward-looking)

### Task 17: DayCell component

**Files:**
- Create: `components/life/week/DayCell.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { AddTaskInline } from '@/components/life/tasks/AddTaskInline'
import { TaskRow } from '@/components/life/tasks/TaskRow'
import { getLocalTimeLabel } from '@/lib/life/time'
import type { CalendarEventRecord, TaskRecord } from '@/lib/life/types'

export interface DayCellProps {
  date: string
  weekday: string
  dayLabel: string
  status: 'past' | 'today' | 'future'
  events: CalendarEventRecord[]
  tasks: TaskRecord[]
  timezone: string
  redirectTo: string
  variant: 'grid' | 'stack'
}

export function DayCell({
  date,
  weekday,
  dayLabel,
  status,
  events,
  tasks,
  timezone,
  redirectTo,
  variant,
}: DayCellProps) {
  return (
    <article className={`life-day-cell life-day-${status} life-day-${variant}`}>
      <header className="life-day-cell-head">
        <span className="life-day-weekday">{weekday}</span>
        <span className="life-day-date">{dayLabel}</span>
        <span className={`life-day-dot life-day-dot-${status}`} aria-hidden="true" />
      </header>
      <div className="life-day-cell-body">
        {events.length > 0 ? (
          <ul className="life-day-events">
            {events.map((event) => (
              <li key={event.id}>
                <span className="life-day-event-time">
                  {event.all_day
                    ? 'All day'
                    : event.start_time
                      ? getLocalTimeLabel(event.start_time, timezone)
                      : '—'}
                </span>
                <span className="life-day-event-title">{event.title || '(Untitled)'}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {tasks.length > 0 ? (
          <ul className="life-day-tasks">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} redirectTo={redirectTo} variant="compact" showProject={false} showDue={false} />
              </li>
            ))}
          </ul>
        ) : null}
        {events.length === 0 && tasks.length === 0 ? (
          <p className="muted-text life-day-empty">Open</p>
        ) : null}
      </div>
      <footer className="life-day-cell-foot">
        <AddTaskInline redirectTo={redirectTo} defaultDue={date} placeholder="Plan…" />
      </footer>
    </article>
  )
}
```

- [ ] **Step 2: Type check + commit**

```bash
npx tsc --noEmit
git add components/life/week/DayCell.tsx
git commit -m "Add DayCell for week planning views"
```

---

### Task 18: WeekClient — range navigation + data fetch

**Files:**
- Create: `components/life/WeekClient.tsx`
- Create: `app/api/life/week/route.ts`

- [ ] **Step 1: Add a thin GET endpoint that returns events + tasks for a range**

Create `app/api/life/week/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'

import { isAdminSession } from '@/lib/admin-auth'
import { OWNER_ID } from '@/lib/life/constants'
import { syncCalendarEvents } from '@/lib/life/calendar'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getTasks } from '@/lib/life/tasks'

export async function GET(request: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  if (!start || !end) {
    return NextResponse.json({ error: 'start and end required' }, { status: 400 })
  }

  const settings = await getOwnerSettings()

  try {
    await syncCalendarEvents(start, end)
  } catch (error) {
    console.error('Week calendar sync failed', error)
  }

  const supabase = getSupabaseAdmin()
  const [{ data: events, error: eventsError }, tasks] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', OWNER_ID)
      .gte('local_date', start)
      .lte('local_date', end)
      .order('start_time', { ascending: true }),
    getTasks({ status: 'active' }),
  ])

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 })
  }

  return NextResponse.json({
    start,
    end,
    timezone: settings.timezone,
    events: events || [],
    tasks,
  })
}
```

- [ ] **Step 2: Create the client**

Create `components/life/WeekClient.tsx`:

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

import { DayCell } from '@/components/life/week/DayCell'
import { fetchJson } from '@/lib/life/client'
import { addDays, getDisplayDate, getWeekStart } from '@/lib/life/time'
import type { CalendarEventRecord, TaskRecord } from '@/lib/life/types'

interface WeekResponse {
  start: string
  end: string
  timezone: string
  events: CalendarEventRecord[]
  tasks: TaskRecord[]
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function range(start: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addDays(start, i))
}

export function WeekClient({
  initialStart,
  today,
  timezone,
}: {
  initialStart: string
  today: string
  timezone: string
}) {
  const [weekStart, setWeekStart] = useState(initialStart)
  const [twoWeek, setTwoWeek] = useState(false)
  const [data, setData] = useState<WeekResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const days = twoWeek ? 14 : 7
  const weekEnd = useMemo(() => addDays(weekStart, days - 1), [weekStart, days])
  const dayList = useMemo(() => range(weekStart, days), [weekStart, days])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchJson<WeekResponse>(`/api/life/week?start=${weekStart}&end=${weekEnd}`)
      .then((payload) => {
        if (!cancelled) setData(payload)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load week.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [weekStart, weekEnd])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventRecord[]>()
    for (const ev of data?.events || []) {
      const list = map.get(ev.local_date) || []
      list.push(ev)
      map.set(ev.local_date, list)
    }
    return map
  }, [data])

  const tasksByDueDate = useMemo(() => {
    const map = new Map<string, TaskRecord[]>()
    for (const task of data?.tasks || []) {
      if (!task.due_local_date) continue
      const list = map.get(task.due_local_date) || []
      list.push(task)
      map.set(task.due_local_date, list)
    }
    return map
  }, [data])

  function stepWeek(direction: -1 | 1) {
    setWeekStart((current) => addDays(current, 7 * direction))
  }

  function snapToToday() {
    setWeekStart(getWeekStart(today))
  }

  const headerLabel = `${getDisplayDate(weekStart, timezone)} — ${getDisplayDate(weekEnd, timezone)}`

  return (
    <div className="life-week-shell">
      <div className="life-week-toolbar">
        <button type="button" className="secondary-button" onClick={() => stepWeek(-1)} aria-label="Previous week">←</button>
        <span className="life-week-range">{headerLabel}</span>
        <button type="button" className="secondary-button" onClick={() => stepWeek(1)} aria-label="Next week">→</button>
        <button type="button" className="secondary-button" onClick={snapToToday}>Today</button>
        <div className="segmented">
          <button type="button" className={`segmented-item ${!twoWeek ? 'is-active' : ''}`} onClick={() => setTwoWeek(false)}>1w</button>
          <button type="button" className={`segmented-item ${twoWeek ? 'is-active' : ''}`} onClick={() => setTwoWeek(true)}>2w</button>
        </div>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {loading && !data ? <p className="muted-text">Loading week…</p> : null}
      <div className={`life-week-grid ${twoWeek ? 'is-two' : 'is-one'}`}>
        {dayList.map((date, index) => {
          const status = date < today ? 'past' : date === today ? 'today' : 'future'
          const weekday = WEEKDAY_NAMES[index % 7]
          const dayLabel = date.slice(8) // DD
          return (
            <DayCell
              key={date}
              date={date}
              weekday={weekday}
              dayLabel={dayLabel}
              status={status}
              events={eventsByDate.get(date) || []}
              tasks={tasksByDueDate.get(date) || []}
              timezone={data?.timezone || timezone}
              redirectTo={`/life/review?week=${weekStart}`}
              variant="grid"
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Type check + commit**

```bash
npx tsc --noEmit
git add app/api/life/week/route.ts components/life/WeekClient.tsx
git commit -m "Add forward-looking week client and range API"
```

---

### Task 19: Mobile day stack (CSS only — JSX is unchanged from Task 18)

The DayCell + WeekClient render the same content for grid and stack. CSS in Phase 5 handles the responsive switch. This task is a placeholder; no separate code.

- [ ] **Step 1: Confirm no action**

Mark the task complete. The grid-to-stack transition is implemented in Task 27/28's CSS rules.

---

### Task 20: Week page server shell

**Files:**
- Modify: `app/life/review/page.tsx`

- [ ] **Step 1: Replace the file**

Overwrite `app/life/review/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

import { WeekClient } from '@/components/life/WeekClient'
import { isAdminSession } from '@/lib/admin-auth'
import { getOwnerSettings } from '@/lib/life/settings'
import { getCurrentLocalDate, getWeekStart } from '@/lib/life/time'

export default async function LifeWeekPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/review')
  }

  const params = await searchParams
  const settings = await getOwnerSettings()
  const today = getCurrentLocalDate(settings.timezone)
  const initialStart = params.week || getWeekStart(today)

  return (
    <div className="life-week-page">
      <div className="life-page-head">
        <p className="eyebrow">Week</p>
      </div>
      <WeekClient initialStart={initialStart} today={today} timezone={settings.timezone} />
    </div>
  )
}
```

- [ ] **Step 2: Type check + commit**

```bash
npx tsc --noEmit
git add app/life/review/page.tsx
git commit -m "Replace weekly review page with forward-looking week shell"
```

---

### Task 21: Phone day-stack collapse behaviour

**Files:**
- Modify: `components/life/WeekClient.tsx`

- [ ] **Step 1: Add a phone-mode collapse for past days**

Inside `WeekClient`, just before the return, add:

```tsx
const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

useEffect(() => {
  const past = new Set(dayList.filter((d) => d < today))
  setCollapsed(past)
}, [dayList, today])
```

And in the day map, render a collapsed stub for past days:

```tsx
{dayList.map((date, index) => {
  const status = date < today ? 'past' : date === today ? 'today' : 'future'
  const weekday = WEEKDAY_NAMES[index % 7]
  const dayLabel = date.slice(8)
  const isCollapsed = collapsed.has(date)
  const cellEvents = eventsByDate.get(date) || []
  const cellTasks = tasksByDueDate.get(date) || []
  if (isCollapsed) {
    return (
      <button
        key={date}
        type="button"
        className="life-day-collapsed"
        onClick={() => {
          setCollapsed((c) => {
            const next = new Set(c)
            next.delete(date)
            return next
          })
        }}
      >
        <span className="life-day-collapsed-label">{weekday} {dayLabel}</span>
        <span className="muted-text">
          {cellEvents.length} events · {cellTasks.length} tasks
        </span>
      </button>
    )
  }
  return (
    <DayCell
      key={date}
      date={date}
      weekday={weekday}
      dayLabel={dayLabel}
      status={status}
      events={cellEvents}
      tasks={cellTasks}
      timezone={data?.timezone || timezone}
      redirectTo={`/life/review?week=${weekStart}`}
      variant="grid"
    />
  )
})}
```

> CSS in Phase 5 will hide `.life-day-collapsed` on desktop (always rendered, but display: none on ≥1100px) so desktop sees full cells.

- [ ] **Step 2: Auto-scroll today into view on phone**

Add a ref and an effect:

```tsx
const todayRef = useRef<HTMLElement | null>(null)

useEffect(() => {
  if (typeof window === 'undefined') return
  if (window.innerWidth >= 1100) return
  todayRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}, [data, weekStart])
```

Wire the ref onto today's DayCell:

```tsx
<div ref={status === 'today' ? (todayRef as React.RefObject<HTMLDivElement>) : undefined}>
  <DayCell ... />
</div>
```

(Add `useRef` to the import.)

- [ ] **Step 3: Type check + commit**

```bash
npx tsc --noEmit
git add components/life/WeekClient.tsx
git commit -m "Collapse past days and auto-scroll to today on phone week view"
```

---

## Phase 4 — Reports

### Task 22: Reports list + reader layout

**Files:**
- Create: `components/life/reports/ReportsSidebar.tsx`
- Modify: `components/life/ReportClient.tsx`

- [ ] **Step 1: ReportsSidebar component**

```tsx
'use client'

import type { ReportRecord } from '@/lib/life/types'

export function ReportsSidebar({
  reports,
  selectedId,
  onSelect,
}: {
  reports: ReportRecord[]
  selectedId: string | null
  onSelect: (report: ReportRecord) => void
}) {
  return (
    <ul className="life-reports-sidebar">
      {reports.map((report) => (
        <li key={report.id}>
          <button
            type="button"
            className={`life-reports-row ${selectedId === report.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(report)}
          >
            <span className="life-reports-row-date">{report.local_date}</span>
            <span className={`life-reports-row-type type-${report.type}`}>{report.type}</span>
          </button>
        </li>
      ))}
      {reports.length === 0 ? <li className="muted-text">No reports yet.</li> : null}
    </ul>
  )
}
```

- [ ] **Step 2: Add a list-fetching API**

Modify `app/api/life/reports/route.ts` if it doesn't already accept `limit` and return all types. If it only returns a single type, add an `all=true` query:

Run: `grep -n "type" app/api/life/reports/route.ts | head -20`

Confirm the existing handler. If it filters by type only, add an `all` flag:

```ts
const all = url.searchParams.get('all') === 'true'
const query = supabase
  .from('reports')
  .select('*')
  .eq('user_id', OWNER_ID)
  .order('local_date', { ascending: false })
  .order('created_at', { ascending: false })
  .limit(14)
if (!all && type) query.eq('type', type)
```

> Confirm shape before changing — the existing route may already support this.

- [ ] **Step 3: Type check + commit**

```bash
npx tsc --noEmit
git add components/life/reports/ReportsSidebar.tsx app/api/life/reports/route.ts
git commit -m "Add reports sidebar and list API support"
```

---

### Task 23: SectionCard renderer

**Files:**
- Create: `components/life/reports/SectionCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { sectionKey, type ReportSection } from '@/lib/life/markdown-sections'

const SPECIAL_KEYS = new Set(['one-thing', 'one-intention'])

export function SectionCard({ section }: { section: ReportSection }) {
  const key = sectionKey(section.label)
  const isPullQuote = SPECIAL_KEYS.has(key)
  const isTension = key === 'tension'

  if (isPullQuote) {
    return (
      <section className={`life-section-card life-section-${key} life-section-pullquote`}>
        <p className="eyebrow">{section.label}</p>
        <MarkdownCard content={section.body} />
      </section>
    )
  }

  return (
    <section className={`life-section-card life-section-${key} ${isTension ? 'life-section-tension' : ''}`}>
      <p className="eyebrow">{section.label}</p>
      <MarkdownCard content={section.body} />
    </section>
  )
}
```

- [ ] **Step 2: Type check + commit**

```bash
npx tsc --noEmit
git add components/life/reports/SectionCard.tsx
git commit -m "Add SectionCard for parsed life reports"
```

---

### Task 24: ReportClient refactor

**Files:**
- Modify: `components/life/ReportClient.tsx`

- [ ] **Step 1: Replace the component**

Overwrite `components/life/ReportClient.tsx`:

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { ReportsSidebar } from '@/components/life/reports/ReportsSidebar'
import { SectionCard } from '@/components/life/reports/SectionCard'
import { fetchJson } from '@/lib/life/client'
import { parseReportSections } from '@/lib/life/markdown-sections'
import { getDisplayDate } from '@/lib/life/time'
import type { ReportRecord } from '@/lib/life/types'

interface ReportsListResponse {
  localDate: string
  timezone: string
  reports: ReportRecord[]
}

export function ReportClient() {
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [selected, setSelected] = useState<ReportRecord | null>(null)
  const [timezone, setTimezone] = useState('UTC')
  const [todayDate, setTodayDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchJson<ReportsListResponse>('/api/life/reports?all=true')
      .then((payload) => {
        if (cancelled) return
        setReports(payload.reports)
        setTimezone(payload.timezone)
        setTodayDate(payload.localDate)
        const todayEod = payload.reports.find(
          (r) => r.local_date === payload.localDate && r.type === 'eod',
        )
        setSelected(todayEod || payload.reports.find((r) => r.type === 'eod') || payload.reports[0] || null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load reports.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const sections = useMemo(() => (selected ? parseReportSections(selected.content) : []), [selected])

  return (
    <div className="life-reports-shell">
      <aside className="life-reports-aside">
        <div className="section-head">
          <h2>Reports</h2>
          <span className="count-pill">{reports.length}</span>
        </div>
        <ReportsSidebar
          reports={reports}
          selectedId={selected?.id || null}
          onSelect={(r) => {
            setSelected(r)
            setDrawerOpen(false)
          }}
        />
      </aside>

      <button
        type="button"
        className="life-reports-drawer-trigger"
        onClick={() => setDrawerOpen(true)}
      >
        Browse reports
      </button>

      {drawerOpen ? (
        <div className="life-reports-drawer" role="dialog">
          <div className="life-reports-drawer-head">
            <h2>Reports</h2>
            <button type="button" className="secondary-button" onClick={() => setDrawerOpen(false)}>Close</button>
          </div>
          <ReportsSidebar
            reports={reports}
            selectedId={selected?.id || null}
            onSelect={(r) => {
              setSelected(r)
              setDrawerOpen(false)
            }}
          />
        </div>
      ) : null}

      <section className="life-reports-reader">
        {loading ? <p className="muted-text">Loading…</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && !selected ? <p className="muted-text">No report selected.</p> : null}
        {selected ? (
          <>
            <header className="life-reports-reader-head">
              <p className="eyebrow">{selected.type}</p>
              <h1>{getDisplayDate(selected.local_date, timezone)}</h1>
            </header>
            {sections.length > 0 ? (
              <div className="life-reports-sections">
                {sections.map((section, index) => (
                  <SectionCard key={`${section.label}-${index}`} section={section} />
                ))}
              </div>
            ) : (
              <MarkdownCard content={selected.content} />
            )}
          </>
        ) : null}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Type check + commit**

```bash
npx tsc --noEmit
git add components/life/ReportClient.tsx
git commit -m "Refactor Reports into list+reader with section cards"
```

---

### Task 25: Synthesis update for week-ahead

**Files:**
- Modify: `lib/life/synthesis.ts`

- [ ] **Step 1: Rename and reframe `generateWeeklySummary`**

Replace `generateWeeklySummary` with `generateWeekAheadBrief` that targets the **upcoming** Mon–Sun:

```ts
import {
  EOD_SYSTEM_PROMPT,
  MORNING_SYSTEM_PROMPT,
  OWNER_ID,
  TASK_EXTRACTION_SYSTEM_PROMPT, // unchanged
  WEEKLY_SYSTEM_PROMPT,
  WEEK_AHEAD_SYSTEM_PROMPT,
} from '@/lib/life/constants'
```

Replace the function body:

```ts
export async function generateWeekAheadBrief(options?: {
  localDate?: string
  weekStart?: string
  force?: boolean
}) {
  const settings = await getOwnerSettings()
  const timeZone = settings.timezone
  const today = options?.localDate || getCurrentLocalDate(timeZone)
  const currentWeekStart = getWeekStart(today)
  const targetWeekStart = options?.weekStart || addDays(currentWeekStart, 7) // upcoming week
  const targetWeekEnd = addDays(targetWeekStart, 6)
  const supabase = getSupabaseAdmin()

  // Pull last week's compressed summary for context (if any).
  const lastWeekStart = addDays(targetWeekStart, -7)
  const { data: lastWeekSummary } = await supabase
    .from('summaries')
    .select('*')
    .eq('user_id', OWNER_ID)
    .eq('week_start', lastWeekStart)
    .maybeSingle()

  // Build forward-looking context: upcoming events + open tasks + last-week summary.
  await syncCalendarEvents(targetWeekStart, targetWeekEnd)
  const { data: upcomingEvents } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', OWNER_ID)
    .gte('local_date', targetWeekStart)
    .lte('local_date', targetWeekEnd)
    .order('start_time', { ascending: true })

  const weeklyTasks = await getWeeklyTaskSnapshot(targetWeekStart)

  const userInput = [
    `Today: ${today}`,
    `Target week: ${targetWeekStart} → ${targetWeekEnd}`,
    `Last week summary:\n${lastWeekSummary?.content || 'None.'}`,
    `Upcoming events:\n${(upcomingEvents || []).map((ev) => `- ${ev.local_date} ${ev.all_day ? 'all day' : ev.start_time || ''}: ${ev.title || '(untitled)'}`).join('\n') || 'None.'}`,
    `Open tasks:\n${weeklyTasks.openTasks.map((task) => `- ${task.title}${task.project_slug ? ` [${task.project_slug}]` : ''}${task.due_local_date ? ` (due ${task.due_local_date})` : ''}`).join('\n') || 'None.'}`,
  ].join('\n\n')

  const content = await callClaude({
    system: WEEK_AHEAD_SYSTEM_PROMPT,
    user: userInput,
    maxTokens: 1100,
  })

  const { data: weeklyReport, error } = await supabase
    .from('reports')
    .upsert(
      {
        user_id: OWNER_ID,
        type: 'weekly',
        content,
        local_date: targetWeekStart,
      },
      { onConflict: 'user_id,type,local_date' },
    )
    .select('*')
    .single()

  if (error) {
    throw error
  }

  await sendReportEmail(`Week ahead — ${targetWeekStart}`, content)

  return {
    skipped: false,
    weekStart: targetWeekStart,
    report: weeklyReport,
  }
}

// Keep `generateWeeklySummary` for the compressed past-week context that future
// EODs reference. This is a separate concept from the forward-looking brief.
export async function generateWeeklySummary(options?: { localDate?: string; weekStart?: string; force?: boolean }) {
  // ... unchanged body that produces the `summaries` row (past week compression)
  // Trim the existing function so it ONLY writes the `summaries` row and skips
  // the `reports` upsert and `syncTasksFromReport` for the weekly review (those
  // moved to generateWeekAheadBrief).
}
```

> Concretely: take the existing `generateWeeklySummary`, delete the block from `const weeklyReviewMarkdown = await callClaude(...)` through `await syncTasksFromReport({ localDate: targetWeekStart, ...})`, and return `{ skipped: false, weekStart: targetWeekStart, summary: data }`.

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: any remaining error from Task 4 is now cleared. New errors only if `app/api/life/synthesis/weekly/route.ts` references the removed `weeklyReportError` variable — fix in next step.

- [ ] **Step 3: Update the weekly API route to call both**

Modify `app/api/life/synthesis/weekly/route.ts` so the user-facing "weekly synthesis" endpoint generates both the compressed summary (past week) and the forward-looking brief (upcoming week):

```ts
const summaryResult = await generateWeeklySummary({ localDate, force })
const briefResult = await generateWeekAheadBrief({ localDate, force })
return NextResponse.json({ summary: summaryResult, brief: briefResult })
```

(Confirm the existing route file to wire it in.)

- [ ] **Step 4: Type check + commit**

```bash
npx tsc --noEmit
git add lib/life/synthesis.ts app/api/life/synthesis/weekly/route.ts
git commit -m "Split weekly synthesis into past-week summary and forward-looking brief"
```

---

### Task 26: Cron update

**Files:**
- Modify: `app/api/life/cron/daily/route.ts`

- [ ] **Step 1: Add the week-ahead brief to the Sunday slot**

Replace the cron body:

```ts
import { NextRequest, NextResponse } from 'next/server'

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { syncCalendarEvents } from '@/lib/life/calendar'
import { generateEodReport, generateWeekAheadBrief, generateWeeklySummary } from '@/lib/life/synthesis'
import { getOwnerSettings } from '@/lib/life/settings'
import { getCurrentLocalDate } from '@/lib/life/time'

function getLocalDayOfWeek(localDate: string): number {
  const [y, m, d] = localDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay()
}

export async function GET(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson()
  }

  try {
    const settings = await getOwnerSettings()
    const localDate = getCurrentLocalDate(settings.timezone)
    const calendar = await syncCalendarEvents(localDate)
    const eod = await generateEodReport({ localDate })
    const weekly = await generateWeeklySummary({ localDate })

    // Sunday: also generate and email the forward-looking week-ahead brief.
    const dow = getLocalDayOfWeek(localDate)
    const brief = dow === 0 ? await generateWeekAheadBrief({ localDate }) : { skipped: true }

    return NextResponse.json({
      localDate,
      timezone: settings.timezone,
      calendar,
      eod,
      weekly,
      brief,
    })
  } catch (error) {
    console.error('Daily life cron failed', error)
    return NextResponse.json({ error: 'Daily life cron failed.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Type check + commit**

```bash
npx tsc --noEmit
git add app/api/life/cron/daily/route.ts
git commit -m "Run week-ahead brief from Sunday cron"
```

---

## Phase 5 — UI / CSS pass

### Task 27: Typography, colour, and chrome tokens

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add new CSS variables under `.life-shell`**

In `app/globals.css`, replace the `.life-shell` token block (currently lines ~814–828) with:

```css
.life-shell {
  --life-bg: #0a0a0a;
  --life-panel: #111111;
  --life-panel-muted: #0d0d0d;
  --life-border: #1f1f1f;
  --life-hairline: #1a1a1a;
  --life-text: #f5f2ed;
  --life-muted: #a4a4a4;
  --life-label: #6b6b6b;
  --life-accent: #ff3120;
  --life-accent-soft: rgba(255, 49, 32, 0.12);
  --life-danger: #ff6c61;
  background: var(--life-bg);
  color: var(--life-text);
  font-family: var(--font-sans, system-ui, -apple-system, 'SF Pro Text', sans-serif);
}
```

- [ ] **Step 2: Soften section heads (no more uppercase mono `h2`)**

Replace the `section-head h2` rule:

```css
.life-shell .section-head h2,
.life-shell .detail-stack h3 {
  margin: 0;
  font-size: 18px;
  letter-spacing: -0.005em;
  text-transform: none;
  font-family: inherit;
  font-weight: 600;
  color: var(--life-text);
}

.life-shell .eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: var(--text-eyebrow, 11px);
  color: var(--life-label);
  font-family: var(--font-mono);
}
```

- [ ] **Step 3: Drop card borders on secondary panels; keep on hero**

```css
.life-shell .hero-card {
  border: 1px solid var(--life-border);
  background: var(--life-panel);
  padding: 32px;
  border-radius: 0;
}

.life-shell .panel-card,
.life-shell .subtle-card {
  border: 0;
  background: transparent;
  padding: 24px 0;
  border-bottom: 1px solid var(--life-hairline);
}

.life-shell .subtle-card {
  padding: 16px 0;
}
```

- [ ] **Step 4: Buttons + chips refresh**

```css
.life-shell .primary-button,
.life-shell .secondary-button,
.life-shell .filter-chip,
.life-shell .segmented-item,
.life-shell .history-row {
  text-transform: none;
  letter-spacing: 0;
  font-family: inherit;
  font-weight: 500;
  font-size: 14px;
  border-radius: 6px;
}

.life-shell .primary-button {
  background: var(--life-accent);
  border-color: var(--life-accent);
  color: #0d0d0d;
}

.life-shell .secondary-button {
  background: var(--life-panel-muted);
  border: 1px solid var(--life-border);
  color: var(--life-text);
}

.life-shell .filter-chip {
  padding: 6px 12px;
  min-height: 32px;
  border-radius: 999px;
}

.life-shell .filter-chip.is-active {
  background: var(--life-accent-soft);
  border-color: var(--life-accent);
  color: var(--life-accent);
}

.life-shell .segmented {
  display: inline-flex;
  border: 1px solid var(--life-border);
  border-radius: 8px;
  padding: 2px;
  background: var(--life-panel-muted);
}

.life-shell .segmented-item {
  padding: 6px 12px;
  border: 0;
  background: transparent;
  color: var(--life-muted);
}

.life-shell .segmented-item.is-active {
  background: var(--life-panel);
  color: var(--life-text);
  border-radius: 6px;
}

.life-shell button:focus-visible,
.life-shell input:focus-visible,
.life-shell select:focus-visible,
.life-shell textarea:focus-visible {
  outline: 2px solid var(--life-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 5: Hide History on phone**

```css
@media (max-width: 699px) {
  .life-shell .nav-link.phone-hidden {
    display: none;
  }
}
```

- [ ] **Step 6: Type check (CSS doesn't compile but build does)**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css
git commit -m "Soften life UI: tokens, section heads, buttons, focus rings"
```

---

### Task 28: Capture screen styles (mic button + live transcript + autosave chip)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Mic button styles**

Replace `.life-shell .mic-button` and `.life-shell .mic-button.is-live` with:

```css
.life-shell .mic-button {
  position: relative;
  width: 100%;
  min-height: 88px;
  padding: 18px;
  border: 1px solid var(--life-accent);
  background: var(--life-accent);
  color: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 8px;
  transition: transform 80ms ease, background-color 180ms ease;
}

.life-shell .mic-button:active {
  transform: scale(0.99);
}

.life-shell .mic-button.is-hold {
  min-height: 220px;
  border-radius: 50%;
  width: 220px;
  margin: 24px auto;
  padding: 24px;
}

.life-shell .mic-button.is-live {
  background: var(--life-panel);
  color: var(--life-accent);
  border-color: var(--life-accent);
}

.life-shell .mic-button-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  animation: life-pulse 1.4s ease-in-out infinite;
}

@keyframes life-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.85); }
}
```

- [ ] **Step 2: Autosave chip styles**

```css
.life-shell .autosave-chip {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border: 1px solid var(--life-accent);
  border-radius: 8px;
  background: var(--life-accent-soft);
  color: var(--life-accent);
  font-size: 13px;
}

.life-shell .autosave-undo {
  background: transparent;
  border: 0;
  color: var(--life-accent);
  font-weight: 600;
  cursor: pointer;
}

.life-shell .autosave-chip-bar {
  position: absolute;
  inset: auto 0 0 0;
  height: 2px;
  background: var(--life-accent);
  transform-origin: left;
  animation: life-countdown 2s linear forwards;
}

@keyframes life-countdown {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
```

- [ ] **Step 3: Live transcript style**

```css
.life-shell .life-live-transcript {
  min-height: 64px;
  font-size: 18px;
  line-height: 1.5;
  color: var(--life-text);
  padding: 12px 0;
}

.life-shell .life-live-transcript:empty::before {
  content: '';
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "Style life capture mic button, live transcript, and autosave chip"
```

---

### Task 29: Tasks views styles (segmented, kanban, list, checklist, inbox)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append the styles**

```css
.life-shell .life-tasks-shell {
  display: grid;
  gap: 24px;
}

.life-shell .life-tasks-toolbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.life-shell .life-tasks-toolbar-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.life-shell .life-task-row {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--life-hairline);
  align-items: start;
}

.life-shell .life-task-checkbox {
  background: transparent;
  border: 0;
  color: var(--life-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
}

.life-shell .life-task-title {
  font-size: 15px;
}

.life-shell .life-task-title.is-done {
  color: var(--life-muted);
  text-decoration: line-through;
}

.life-shell .life-task-row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.life-shell .life-task-row-actions {
  display: flex;
  gap: 6px;
}

.life-shell .life-task-row-checklist .life-task-row-meta,
.life-shell .life-task-row-checklist .life-task-row-actions {
  display: none;
}

.life-shell .life-add-inline-trigger {
  background: transparent;
  border: 1px dashed var(--life-border);
  color: var(--life-muted);
  padding: 10px 12px;
  width: 100%;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
}

.life-shell .life-add-inline {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--life-border);
  border-radius: 6px;
  background: var(--life-panel-muted);
}

.life-shell .life-add-inline-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.life-shell .life-kanban {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.life-shell .life-kanban-col {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--life-hairline);
  border-radius: 8px;
  background: var(--life-panel-muted);
}

.life-shell .life-kanban-col.is-drop {
  border-color: var(--life-accent);
  background: var(--life-accent-soft);
}

.life-shell .life-kanban-col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.life-shell .life-kanban-card {
  padding: 8px 12px;
  background: var(--life-panel);
  border: 1px solid var(--life-hairline);
  border-radius: 6px;
  cursor: grab;
}

.life-shell .life-kanban-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.life-shell .life-inbox {
  display: grid;
  gap: 32px;
}

.life-shell .life-inbox-focus-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.life-shell .life-inbox-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: 0;
  padding: 8px 0;
  cursor: pointer;
  color: var(--life-text);
}

.life-shell .life-list-toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.life-shell .life-list-rows {
  list-style: none;
  padding: 0;
  margin: 0;
}

.life-shell .life-checklist-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (max-width: 699px) {
  .life-shell .life-kanban {
    grid-template-columns: 1fr;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    grid-auto-flow: column;
    grid-auto-columns: 85%;
  }

  .life-shell .life-kanban-col {
    scroll-snap-align: start;
  }
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add app/globals.css
git commit -m "Style life tasks toolbar and four view modes"
```

---

### Task 30: Week styles + Reports styles + nav fade

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Week styles**

```css
.life-shell .life-week-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.life-shell .life-week-range {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.life-shell .life-week-grid {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.life-shell .life-week-grid.is-one {
  grid-template-columns: 1fr;
}

.life-shell .life-day-cell {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--life-hairline);
  border-radius: 8px;
  background: var(--life-panel-muted);
}

.life-shell .life-day-today {
  border-color: var(--life-accent);
}

.life-shell .life-day-past {
  opacity: 0.55;
}

.life-shell .life-day-cell-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.life-shell .life-day-weekday {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--life-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.life-shell .life-day-date {
  font-size: 24px;
  font-weight: 600;
}

.life-shell .life-day-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  margin-left: auto;
}

.life-shell .life-day-dot-today { color: var(--life-accent); }
.life-shell .life-day-dot-future { color: var(--life-muted); }
.life-shell .life-day-dot-past { color: var(--life-label); }

.life-shell .life-day-events,
.life-shell .life-day-tasks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 4px;
}

.life-shell .life-day-event-time {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--life-muted);
  margin-right: 8px;
}

.life-shell .life-day-collapsed {
  display: none; /* hidden on desktop; shown on mobile */
  width: 100%;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--life-hairline);
  padding: 10px 0;
  cursor: pointer;
  color: var(--life-muted);
}

@media (min-width: 1100px) {
  .life-shell .life-week-grid.is-one {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
  .life-shell .life-week-grid.is-two {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-auto-rows: minmax(0, 1fr);
  }
}

@media (max-width: 1099px) {
  .life-shell .life-day-collapsed {
    display: flex;
    justify-content: space-between;
  }
  .life-shell .life-week-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Reports styles**

```css
.life-shell .life-reports-shell {
  display: grid;
  gap: 24px;
}

.life-shell .life-reports-aside {
  display: none;
}

.life-shell .life-reports-drawer-trigger {
  display: inline-flex;
  width: max-content;
  padding: 8px 14px;
  border: 1px solid var(--life-border);
  background: var(--life-panel);
  color: var(--life-text);
  border-radius: 6px;
}

.life-shell .life-reports-sidebar {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 4px;
}

.life-shell .life-reports-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--life-hairline);
  background: var(--life-panel-muted);
  color: var(--life-text);
  border-radius: 6px;
  cursor: pointer;
}

.life-shell .life-reports-row.is-selected {
  border-color: var(--life-accent);
  color: var(--life-accent);
  background: var(--life-accent-soft);
}

.life-shell .life-reports-row-date {
  font-family: var(--font-mono);
  font-size: 13px;
}

.life-shell .life-reports-row-type {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--life-label);
}

.life-shell .life-reports-reader {
  display: grid;
  gap: 24px;
  max-width: 64ch;
  margin: 0 auto;
}

.life-shell .life-reports-reader h1 {
  font-size: clamp(28px, 6vw, 40px);
  margin: 0;
}

.life-shell .life-section-card {
  display: grid;
  gap: 8px;
  padding: 20px 0;
  border-bottom: 1px solid var(--life-hairline);
}

.life-shell .life-section-pullquote {
  text-align: center;
  padding: 32px 0;
}

.life-shell .life-section-pullquote p {
  font-size: 22px;
  font-style: italic;
  line-height: 1.4;
  color: var(--life-text);
}

.life-shell .life-section-tension {
  border-left: 2px solid var(--life-accent);
  padding-left: 16px;
}

.life-shell .life-reports-drawer {
  position: fixed;
  inset: 0;
  background: var(--life-bg);
  z-index: 30;
  padding: 16px;
  display: grid;
  gap: 16px;
  grid-template-rows: auto 1fr;
}

@media (min-width: 1100px) {
  .life-shell .life-reports-shell {
    grid-template-columns: 280px minmax(0, 1fr);
    align-items: start;
  }
  .life-shell .life-reports-aside {
    display: block;
  }
  .life-shell .life-reports-drawer-trigger,
  .life-shell .life-reports-drawer {
    display: none;
  }
}
```

- [ ] **Step 3: Mobile nav fade + capture sidebar layout**

```css
@media (max-width: 699px) {
  .life-shell .life-nav {
    position: relative;
  }
  .life-shell .life-nav::after {
    content: '';
    position: absolute;
    inset: 0 0 0 auto;
    width: 32px;
    pointer-events: none;
    background: linear-gradient(to right, transparent, var(--life-bg));
  }
}

.life-shell .life-home-grid {
  display: grid;
  gap: 24px;
}

@media (min-width: 700px) {
  .life-shell .life-home-grid {
    grid-template-columns: minmax(0, 1.18fr) 320px;
    align-items: start;
  }
}

.life-shell .life-home-sidebar {
  display: grid;
  gap: 16px;
}

@media (max-width: 699px) {
  .life-shell .life-home-sidebar {
    display: none;
  }
}
```

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add app/globals.css
git commit -m "Style life week grid, reports reader, mobile nav fade"
```

---

### Task 31: CSS cleanup + final verification

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Remove dead `life-*` rules**

Search for any of the following class names that no longer have a matching JSX selector after the redesign:

```bash
grep -n "life-task-board-card\|life-week-metrics-card\|life-week-review-card\|life-week-summary-card\|life-week-open-card\|life-entry-log-card\|life-planning-grid\|life-planning-hero\|life-filter-card\|life-task-form\|life-brief-card\|life-task-strip\|interim-chip\|summary-toggle" components app
```

For each rule with no remaining selector, delete it from `app/globals.css`.

- [ ] **Step 2: Type check + full build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Manual smoke verification**

Start dev server: `npm run dev`

Open in browser at each breakpoint (use devtools to resize):

- [ ] Phone (375×667): `/life` shows mic button + live transcript only, no entries/cal/tasks visible.
- [ ] Phone: holding the button >300ms starts recording; release shows autosave chip with Undo; tapping Undo discards.
- [ ] Phone: editing the textarea via "type instead" toggle works.
- [ ] Phone: `/life/history` is not in the nav.
- [ ] Phone: `/life/review` shows vertical day stack, today scrolled into view, past days collapsed; tapping a collapsed past day expands it.
- [ ] iPad (768×1024): same hold-to-record behaviour; sidebar visible.
- [ ] Desktop (1440×900): mic button is click-to-toggle; clicking once starts, clicking again stops; autosave chip appears with Undo.
- [ ] Desktop `/life/tasks`: view switcher works; selection persists across page reloads; Kanban drag-and-drop changes task status.
- [ ] Desktop `/life/review`: 7-column grid, range header updates as you navigate; 2w toggle adds a second row of 7.
- [ ] Desktop `/life/report`: sidebar lists last 14 reports; today's EOD default-loads; section cards render with eyebrow + content; the "One thing" section renders as a pull-quote.

- [ ] **Step 4: Commit cleanup**

```bash
git add app/globals.css
git commit -m "Remove dead life CSS rules"
```

---

## Self-review (already done during plan authoring)

- Spec coverage: each spec section (§1–10) maps to one or more tasks (IA → T8, T16, T20; capture → T5–T7; tasks → T9–T16; week → T17–T21; reports → T22–T26; UI pass → T27–T31). Cleanups (§7) folded into T31.
- No placeholders: code blocks contain real code; commands are concrete; manual smoke steps name URLs and breakpoints.
- Type consistency: `TaskView` is defined in T11 and referenced consistently; `parseReportSections` / `ReportSection` shared from `markdown-sections.ts`; `syncCalendarEvents(start, end?)` signature reused across T3, T18, T25, T26.
- Open verification items from spec §9: `HistoryClient.tsx` confirmed only on `/life/history` route — Task 8 only renames its nav label, no behavioural change; cron schedule in `vercel.json` (`30 14 * * *` daily) handles Sunday gating in T26.

---

## Execution

When ready, execute task-by-task via `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans`. Each commit is small and reversible — review between tasks, especially after T5 (voice control), T18 (week client), and T25 (synthesis split).
