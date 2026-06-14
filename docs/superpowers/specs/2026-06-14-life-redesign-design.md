# PR/LIFE Redesign — Hold-to-Record Capture + UI Pass

**Date:** 2026-06-14
**Scope:** `/life/*` (capture, tasks, week, reports, history, layout, voice control)
**Goal:** Make PR/LIFE a tool for organising the coming days and weeks. Phone is voice-first capture; desktop is a planning surface. Tasks and Week get Notion-grade information design. Reports gain a list-and-reader layout and section-card rendering.

## Guiding principles

1. **Capture is voice-first on phone, hands-on on desktop.** Phone screen is one big hold-to-record button and a live transcript — nothing else. Desktop keeps the toggle button + textarea + side context.
2. **Week looks forward, not back.** The page is the planning grid, not a retrospective. Past days dim/collapse; future days are the focus.
3. **Notion feel through restraint.** Drop hard borders, soften typography, reserve the accent colour. The information design is what makes it look good, not chrome.
4. **No new data model.** All work fits within existing tables (`entries`, `reports`, `tasks`, `calendar_events`, `summaries`).

---

## 1. Information architecture

**Nav order:** Today · Tasks · Week · Reports · History

- "Weekly" UI label → **Week** (route stays `/life/review` to avoid URL break).
- "Report" UI label → **Reports**.
- **History is hidden on phone** (`@media (max-width: 699px) { nav-link[href="/life/history"] { display: none; } }`). Available on iPad and desktop.

| Page | Purpose |
| --- | --- |
| Today | Capture-first. Phone: button + live transcript only. Desktop: capture pane + context sidebar (today's tasks, today's cal, AM brief). |
| Tasks | Four interchangeable views (Kanban / Inbox / List / Checklist) over the same data. |
| Week | Forward-looking planning grid for the current calendar week with 1w/2w toggle and free week navigation. |
| Reports | List + reader. Sidebar of last ~14 reports, main pane renders the selected report with section cards. |
| History | Unchanged scope, just hidden on phone. |

---

## 2. Capture (Today)

### 2.1 Voice button behaviour

Two interaction models, gated by viewport width:

- **Hold-to-record** for phone and iPad (`max-width: 1099px`).
- **Click-to-start / click-to-stop toggle** for desktop (`min-width: 1100px`) — matches current behaviour.

Both share the same underlying SpeechRecognition setup. The component selects the interaction model from a `useViewportMode()` hook (matchMedia-driven).

#### Hold-to-record details

- `pointerdown` starts SpeechRecognition (works for touch, mouse, pen; satisfies iOS Safari's user-gesture rule).
- `pointerup`, `pointercancel`, and `pointerleave` stop it.
- Recognition only starts after a 300ms hold threshold has passed since `pointerdown`. Releasing before that → no recording was ever started, no error, no entry created.
- On press start: `navigator.vibrate?.(20)` for haptic feedback (mobile only, where supported).
- Visual: subtle radial pulse + recording dot on the button. No background flash.

#### Desktop toggle details

- Click to start, click again to stop. Same `is-live` styling as today but softened (no white background flash; subtle pulse instead).

### 2.2 Release flow — autosave with Undo

On release (hold) or click-to-stop (toggle):

1. Recognition stops; the transcript freezes in the draft area.
2. A countdown chip appears below the draft: `Saving in 2s · Undo`, with a thin progress bar draining over the chip.
3. Within 2s:
   - Tap **Undo** → discard the draft, return to idle.
   - Edit the draft (focus or keystroke) → countdown cancels; the manual Save button takes over.
4. After 2s with no interaction → POST to `/api/life/entries` with `source=voice`.

### 2.3 Live transcript = draft area

- The current `interim-chip` element is removed. Interim transcript appends directly into the draft textarea/readout.
- Interim text renders at ~60% opacity; finalised text snaps to full opacity.
- The user can edit the text at any point after release.
- The "say save entry" voice command is removed entirely (autosave + push-to-talk replaces it).

### 2.4 Phone capture screen (≤699px)

- Eyebrow: small "Today · Sat 14 Jun".
- Centre: large circular hold-to-record button (~220px diameter), the visual anchor.
- Below button: soft, scrollable live-transcript readout (no textarea chrome, no Save button, no project picker).
- After release: countdown chip docks above the button.
- Hidden by default: a small "type instead" toggle at the bottom reveals a textarea + Save + project picker when tapped.
- No tasks panel, no calendar panel, no entries log, no AM brief.

### 2.5 iPad capture screen (700–1099px)

- Same hold-to-record button (rectangular, prominent at the top of the capture pane).
- Live transcript writes into a visible draft textarea below the button.
- Save button + project select inline.
- Right sidebar (collapsible) with today's tasks + today's calendar + AM brief.

### 2.6 Desktop capture screen (≥1100px)

- Left/main pane: voice button (toggle) → draft textarea → project select + Save row.
- Right sidebar: today's tasks (top 6) + today's calendar + AM brief.
- **Entries today panel removed** from the Today screen on desktop.

### 2.7 Code-level changes

- `components/life/VoiceCaptureControl.tsx`: refactor into a single component that branches behaviour on viewport mode; drop save-command parsing; switch to pointer events.
- `components/life/TodayClient.tsx`: delete (unused after server-first migration).
- `app/life/page.tsx`: drop the "Entries today" section on desktop; rebuild the sidebar; drop the `<details>` AM brief wrap; show only morning brief + tasks + cal in the sidebar.
- Add `hooks/useViewportMode.ts` (matchMedia hook returning `'phone' | 'tablet' | 'desktop'`).

---

## 3. Tasks — four views

### 3.1 Shared shell

- View switcher (segmented control) at the top: `Kanban / Inbox / List / Checklist`.
- Selection persists in `localStorage` under `life.tasksView`. Default on first visit: Kanban.
- One unified toolbar (single row, not two): status filter chips + project dropdown + view switcher.
- Add-task affordance becomes inline `+ Add task` per view (top of the active column / section / list). Expand on click → title + project + due + priority. Enter to save, Esc to cancel.

### 3.2 Kanban

- Three columns: `Open` / `Doing` / `Done`, mapped to existing `status` values `open` / `in_progress` / `done`. (`dismissed` accessible via filter chip; hidden by default.)
- Cards: title (single line, truncates) · priority dot · project tag · due date.
- Click card → inline expansion (details + actions).
- Drag-and-drop between columns → PATCH `status` via `/api/life/tasks/[taskId]`.
- DnD implementation: native HTML5 DnD first; pull in `@dnd-kit/core` only if it's already installed or the native variant proves janky during verification.
- Mobile: columns become a horizontally swipeable carousel with pill-row indicator.

### 3.3 Inbox + grouped list

- Hero strip: **Focus** — high-priority + due-today, max 5 large clickable rows.
- Below: tasks grouped by project, project headers collapsible.
- Empty Focus → "Clear. Add a task to focus."

### 3.4 List (Notion database default)

- Flat dense rows: `[checkbox] title · priority · project · due`.
- Inline edit on each field.
- Group toolbar dropdown: `By project / By status / By priority / By due`.
- Sort dropdown: `Updated / Created / Due / Priority`.

### 3.5 Checklist

- One column, rows of `[checkbox] title` only.
- Checking the box sets `status=done` (same API call).
- Subtle "Show metadata" toggle reveals project + due.

### 3.6 Code-level changes

- `app/life/tasks/page.tsx` becomes a thin server shell that loads tasks and delegates to a new `components/life/TasksClient.tsx` (handles view switching + localStorage).
- Four view components: `KanbanView.tsx`, `InboxView.tsx`, `ListView.tsx`, `ChecklistView.tsx` under `components/life/tasks/`.
- Shared `TaskCard` / `TaskRow` primitives.

---

## 4. Week — forward-looking planning

### 4.1 Range and navigation

- Default: current calendar week (Mon → Sun).
- Toolbar: `← [Jun 9 — Jun 15] · Today · 1w / 2w →`
  - Arrows step forward/back one week (or two, in 2w mode).
  - **Range header** (date span) is the visual focal point — updates instantly with navigation or toggle.
  - "Today" snaps back to the current week.
  - `1w / 2w` toggle extends the visible range to include the following Mon → Sun.

### 4.2 Day cell content

- Header: weekday + date + small status dot (`gray=past`, `accent=today`, `outline=future`).
- Calendar events: time + title, sorted chronologically, all-day pinned to top.
- Tasks due: rows matching `due_local_date = cell date`. Shared checkbox/row component with the Tasks list view.
- Footer: `+ Add` inline → opens a quick task form pre-filled with this day's due date.
- Empty: dimmed "Open" label + `+ Add` only.

### 4.3 Layouts

- **Desktop (≥1100px):** 7-column grid. 2w toggle stacks a second 7-column row beneath, with a "Next week" divider.
- **iPad + phone (≤1099px):** vertical day stack.
  - Past days in the current week collapse to a thin row (`Mon 9 · 3 events, 1 task`). Tap to expand.
  - Today auto-scrolls into view on load and is accented.
  - Future days expanded by default.

### 4.4 Calendar sync change

- Refactor: `syncCalendarEvents(localDate: string)` → `syncCalendarEvents(startDate: string, endDate: string)`, with a single-day overload preserved (`syncCalendarEvents(date)` shortcut).
- Week page calls it with the full visible range (7 or 14 days) on load and whenever navigation occurs.
- Underlying Google/iCal call fetches the full range in one request rather than per-day.
- `calendar_events` table already keys by `local_date`, so upserts work across multiple days unchanged.

### 4.5 The AI weekly brief

- Moves entirely off the Week page.
- Sunday cron generates a **forward-looking** brief for the upcoming Mon → Sun.
- Sent via the existing `sendReportEmail`.
- Stored as a `reports` row with `type='weekly'` and `local_date=<upcoming Monday>`, viewable on the Reports page.

### 4.6 Code-level changes

- `app/life/review/page.tsx` becomes a thin server shell; new `components/life/WeekClient.tsx` handles range state + navigation.
- New `components/life/week/DayCell.tsx` (shared across desktop grid and mobile stack).
- `lib/life/calendar.ts`: extend `syncCalendarEvents` signature.

---

## 5. Reports

### 5.1 Layout — list + reader

**Desktop / iPad:**
- Left sidebar (~280px): chronological list of the last ~14 reports, newest first. Each row: date + type chip (`EOD` / `Morning` / `Weekly`). Selected row accented. Scrollable.
- Main pane: rendered report.
- Default selection: today's EOD if it exists, otherwise the most recent EOD.

**Phone:**
- Sidebar collapses into a drawer. Top of the screen: current report's date + "Browse" button → opens drawer.
- Drawer is a vertical list (same content as desktop sidebar). Tap a row to load + close drawer.

### 5.2 Section-card rendering

- The EOD AI prompt is mildly constrained so its section headings are predictable: `## What moved`, `## Decisions`, `## Open loops`, `## Tension` (optional), `## One thing`.
- A new `parseReportSections(markdown)` utility splits on H2 boundaries.
- Each section renders as its own card with a coloured eyebrow label:
  - `WHAT MOVED` — narrative paragraphs.
  - `DECISIONS` — list of decisions, each with a reasoning sub-line.
  - `OPEN LOOPS` — visual-only checkbox rows, tagged by project.
  - `TENSION` — softer accent border; rendered only if the AI emitted it.
  - `ONE THING` — pull-quote treatment: oversized italic, generous margin, centred.
- If parsing finds no sections, falls back to plain `MarkdownCard`.

### 5.3 Morning briefs

- Rendered as plain markdown (short by design).

### 5.4 Weekly briefs (forward-looking)

- New `WEEK_AHEAD_SYSTEM_PROMPT` replaces `WEEKLY_REVIEW_SYSTEM_PROMPT`.
- Section labels: `THIS WEEK'S SHAPE`, `WHAT TO PROTECT`, `COMMITMENTS`, `ONE INTENTION`.
- Rendered with the same section-card treatment.

### 5.5 Code-level changes

- `app/life/report/page.tsx` becomes a thin server shell delegating to refactored `ReportClient.tsx` with sidebar + reader.
- New `lib/life/markdown-sections.ts` (`parseReportSections`).
- New `components/life/reports/SectionCard.tsx` (one component per section type, or a configurable one).
- `lib/life/constants.ts`: tighten `EOD_SYSTEM_PROMPT` section headings; replace `WEEKLY_REVIEW_SYSTEM_PROMPT` with `WEEK_AHEAD_SYSTEM_PROMPT`.
- `lib/life/synthesis.ts`: rename `generateWeeklySummary` flow's `reports` output to use the forward-looking brief; shift date math so the Sunday cron writes for the upcoming week, not the past week. The compressed `summaries` row keeps its existing meaning (compressed past-week context for future EODs).

---

## 6. Visual / UI pass

### Typography

- Mono font reserved for date/time/code and small eyebrow labels.
- Section headings (`h2`) switch from uppercase mono to sentence-case sans, slightly larger.
- Body text size: ~15px → ~16px. Line-height ~1.55 for markdown content.
- Markdown content max-width: `64ch`.

### Chrome

- Drop per-card 1px borders. Cards become flat panels with generous padding and hairline dividers only where structure needs them.
- Hero/capture card keeps a subtle border to anchor it.
- Increase vertical rhythm: 24px → 32px between major sections.

### Colour

- `--life-accent: #ff3120` reserved for primary CTAs, active states, and the live-recording indicator only.
- Eyebrow labels move to neutral grey; the accent gets weight when it appears.
- New `--life-hairline: #1a1a1a` for subtle dividers.
- Active nav link: underline + accent text.

### Buttons & controls

- Secondary buttons: sentence-case medium-weight sans (no uppercase).
- Primary buttons stay distinctive (filled accent) but lose uppercase.
- Filter chips: lowercase pill style; active = accent border + accent fill.
- Focus rings: visible accent outline (accessibility).

### Misc

- Mobile nav: horizontal scroll stays; add right-side fade gradient as scroll hint.
- Hover/active states: subtle background tint, no big jumps.
- Loading states: replace "Loading entries..." text with skeleton rows.
- Animations: ~200ms ease for button pulse and countdown bar. Nothing flashy.

---

## 7. Cleanups (functionality, spacing, redundancies)

- Delete `components/life/TodayClient.tsx` (unused after server-first migration).
- Remove the `extractSaveCommand` / `queueSaveCommand` paths from `VoiceCaptureControl`.
- Remove the `Entries today` panel from desktop Today screen.
- Remove the AM brief `<details>` collapse wrap.
- Collapse Tasks page's two-row filter toolbar into one row (status chips + project dropdown).
- Rebuild the Today page server component to load only what the new sidebar needs (drop unused entries fetch).
- `lib/life/calendar.ts`: ensure range syncs deduplicate properly.
- Audit and remove `.life-shell` CSS rules that no longer have selectors after the redesign.

---

## 8. Non-goals

- No new data model (no new tables, no new columns beyond what fits in `metadata` if needed).
- No auth/permission changes.
- No push notifications beyond existing email.
- No multi-user / collaboration.
- Hold-to-record cancel-by-drag-away gesture is v2.
- New DnD library only if HTML5 native proves insufficient — not pulled in upfront.

---

## 9. Open verification items

These need confirmation during implementation, not design:

- `HistoryClient.tsx` is still imported and rendered — confirm no changes needed beyond hiding on phone.
- Confirm `LIFE_PROJECTS` list is stable — used heavily across Tasks views.
- Confirm the cron schedule defined in `vercel.json` matches the new Sunday week-ahead generation timing.
- Confirm the email subject line / format for the week-ahead brief.

---

## 10. Acceptance criteria

- On phone, the Today screen shows only the hold-to-record button and a live transcript. Holding → releasing produces an entry after a 2s undo window. Editing the transcript cancels the autosave.
- On desktop, the voice button is click-to-toggle. Stopping triggers the same 2s undo countdown.
- The Tasks page offers four view modes, persists selection, and the Kanban supports drag-and-drop status changes.
- The Week page shows the current calendar week, with a 1w/2w toggle, free navigation, and a visible range header. Past days in the current week collapse on mobile.
- The Reports page has a sidebar of recent reports, default-loads today's EOD, and renders EOD content as section cards.
- The week-ahead brief (forward-looking) replaces the retrospective weekly review in the Sunday cron + email; the past-week compressed `summaries` row is unaffected.
- History is hidden on phone.
- No regressions on calendar sync — events still appear in Today and now also in Week.
