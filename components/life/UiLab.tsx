'use client'

// Playground for the Life UI kit. Everything here is the real component from
// components/life/ui/ — wiring a screen up means importing it, not rebuilding.
//
// Only components with no home in the live app remain. Menu, Confirm, Command,
// Empty, Skeleton, Table, the event calendar and the project shell all ship in
// real screens now; keeping demo copies would leave two versions to drift apart.

import { useState } from 'react'

import { CalendarPreview } from '@/components/life/CalendarPreview'
import { LifePopover } from '@/components/life/ui/LifePopover'
import { LifeSortable, type SortableColumn } from '@/components/life/ui/LifeSortable'

const INITIAL_BOARD: SortableColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [
      { id: 'c1', title: 'Wire LifeMenu into QuickAdd', meta: 'PR Life', tone: 'high' },
      { id: 'c2', title: 'Re-export Swipey stills', meta: 'Portfolio', tone: 'med' },
      { id: 'c3', title: 'Draft Rolodex MVP spec', meta: 'Rolodex', tone: 'low' },
    ],
  },
  {
    id: 'doing',
    title: 'In progress',
    cards: [{ id: 'c4', title: 'Calendar preview', meta: 'PR Life', tone: 'high' }],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [{ id: 'c5', title: 'Pin Vercel region to sin1', meta: 'PR Life' }],
  },
]

export function UiLab() {
  const [board, setBoard] = useState(INITIAL_BOARD)
  const [popAnchor, setPopAnchor] = useState<HTMLElement | null>(null)
  const [popOpen, setPopOpen] = useState(false)

  return (
    <>
      <CalendarPreview />

      <section className="life-lab-section">
        <p className="eyebrow">Not wired · needs a home</p>
        <h2>Sortable / Kanban</h2>
        <p className="life-lab-note">
          Drag a card between columns. Uses <code>motion</code>, which you already ship for
          layout springs in StudioClient, so no new dependency. The spring gets a little
          bounce because a flick carries momentum; menus and dropdowns never get any.
        </p>
        <div className="life-lab-demo is-plain">
          <LifeSortable columns={board} onChange={setBoard} />
        </div>
      </section>

      <section className="life-lab-section">
        <p className="eyebrow">Not wired · needs a home</p>
        <h2>Popover</h2>
        <p className="life-lab-note">
          One anchored overlay that could replace TaskForm’s calendar portal and
          ProjectWorkspace’s property menus. Flips above the trigger and pulls itself inside
          the viewport when it would overflow — scroll the page with it open.
        </p>
        <div className="life-lab-demo">
          <button
            type="button"
            className="life-btn"
            ref={setPopAnchor}
            onClick={() => setPopOpen((v) => !v)}
          >
            Open popover
          </button>
          <LifePopover open={popOpen} anchor={popAnchor} onClose={() => setPopOpen(false)}>
            <button className="life-pill-menu-item" type="button" onClick={() => setPopOpen(false)}>
              Set target date
            </button>
            <button className="life-pill-menu-item" type="button" onClick={() => setPopOpen(false)}>
              Change status
            </button>
            <button className="life-pill-menu-item" type="button" onClick={() => setPopOpen(false)}>
              Archive project
            </button>
          </LifePopover>
        </div>
      </section>
    </>
  )
}
