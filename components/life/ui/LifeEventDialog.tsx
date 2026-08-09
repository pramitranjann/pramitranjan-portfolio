'use client'

// Edit form for LifeEventCalendar, matching what reui's c-event-calendar-3
// does: title, colour, all-day switch, start time, duration, save, delete.
// Its five colour buttons become Life's three calendars; its 7:00–19:00 start
// select covers a working day, which is too narrow for a life calendar.
// ponytail: native <dialog> again, and LifeMenu for the selects — the kit
// composes instead of growing a second dropdown.

import { useEffect, useRef, useState } from 'react'

import { LifeMenu } from './LifeMenu'
import type { CalEvent } from './LifeEventCalendar'

const CALENDARS: { value: NonNullable<CalEvent['calendar']>; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'work', label: 'Work' },
  { value: 'health', label: 'Health' },
]

const DURATIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
]

// Every half hour, not reui's 7:00–19:00 — a life calendar has a 22:00 in it.
const START_TIMES = Array.from({ length: 48 }, (_, i) => {
  const minutes = i * 30
  const label = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  return { value: String(minutes), label }
})

export function LifeEventDialog({
  event,
  open,
  onSave,
  onDelete,
  onCancel,
}: {
  /** null means "create new" */
  event: CalEvent | null
  open: boolean
  onSave: (event: CalEvent) => void
  onDelete: (id: string) => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState<CalEvent | null>(event)

  useEffect(() => setDraft(event), [event])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onClose = () => onCancel()
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [onCancel])

  if (!draft) return <dialog className="life-confirm life-event-dialog" ref={ref} />

  const allDay = draft.start === null
  const duration = allDay ? 60 : (draft.end ?? draft.start! + 60) - draft.start!
  const isNew = !draft.id

  const patch = (next: Partial<CalEvent>) => setDraft({ ...draft, ...next })

  return (
    <dialog
      className="life-confirm life-event-dialog"
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) onCancel()
      }}
    >
      <form
        className="life-confirm-inner"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.title.trim()) return
          onSave({ ...draft, id: draft.id || `e${Date.now()}` })
        }}
      >
        <h2 className="life-confirm-title">{isNew ? 'New event' : 'Edit event'}</h2>

        <div className="life-event-field">
          <label className="life-event-label" htmlFor="ev-title">
            Title
          </label>
          <input
            id="ev-title"
            className="text-input"
            value={draft.title}
            autoFocus
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="What is it?"
          />
        </div>

        <div className="life-event-field">
          <span className="life-event-label">Calendar</span>
          <div className="life-event-swatches">
            {CALENDARS.map((cal) => (
              <button
                key={cal.value}
                type="button"
                className={`life-event-swatch cal-${cal.value}${
                  (draft.calendar || 'personal') === cal.value ? ' is-active' : ''
                }`}
                onClick={() => patch({ calendar: cal.value })}
                aria-pressed={(draft.calendar || 'personal') === cal.value}
              >
                <span className="life-event-swatch-dot" aria-hidden="true" />
                {cal.label}
              </button>
            ))}
          </div>
        </div>

        <div className="life-event-field is-row">
          <span className="life-event-label">All day</span>
          <button
            type="button"
            className={`life-week-toggle${allDay ? ' is-active' : ''}`}
            role="switch"
            aria-checked={allDay}
            aria-label="All day"
            onClick={() =>
              patch(allDay ? { start: 540, end: 600 } : { start: null, end: null })
            }
          >
            <span className="life-week-toggle-thumb" />
          </button>
        </div>

        {!allDay ? (
          <div className="life-event-field is-row">
            <span className="life-event-label">Time</span>
            <div className="life-event-time-row">
              <LifeMenu
                ariaLabel="Start time"
                value={String(draft.start)}
                options={START_TIMES}
                onChange={(value) =>
                  patch({ start: Number(value), end: Number(value) + duration })
                }
              />
              <LifeMenu
                ariaLabel="Duration"
                value={String(duration)}
                options={DURATIONS}
                onChange={(value) => patch({ end: draft.start! + Number(value) })}
              />
            </div>
          </div>
        ) : null}

        <div className="life-confirm-actions">
          {!isNew ? (
            <button
              type="button"
              className="life-btn is-danger life-event-delete"
              onClick={() => onDelete(draft.id)}
            >
              Delete
            </button>
          ) : null}
          <button type="button" className="life-btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="life-btn primary" disabled={!draft.title.trim()}>
            {isNew ? 'Add event' : 'Save changes'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
