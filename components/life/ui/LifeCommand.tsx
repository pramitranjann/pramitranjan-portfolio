'use client'

// ⌘K palette. Net-new surface — Life's search is a mobile-only overlay plus a
// page today. This makes search ambient everywhere and carries actions, not
// just results. Wires to /api/life/search; static items for now.
// ponytail: native <dialog> again — Escape, focus trap and top-layer for free.

import { useEffect, useMemo, useRef, useState } from 'react'

export interface CommandItem {
  id: string
  label: string
  group: string
  /** Right-aligned hint, e.g. a project name or a date */
  meta?: string
  onRun: () => void
}

export function LifeCommand({ items }: { items: CommandItem[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matched = q
      ? items.filter((item) => item.label.toLowerCase().includes(q))
      : items
    // Preserve group order as authored rather than sorting alphabetically —
    // actions should stay above results.
    const groups: { group: string; items: CommandItem[] }[] = []
    for (const item of matched) {
      const bucket = groups.find((g) => g.group === item.group)
      if (bucket) bucket.items.push(item)
      else groups.push({ group: item.group, items: [item] })
    }
    return groups
  }, [items, query])

  const flat = useMemo(() => results.flatMap((g) => g.items), [results])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setQuery('')
      setActive(0)
      inputRef.current?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onClose = () => setOpen(false)
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [])

  useEffect(() => setActive(0), [query])

  const run = (item?: CommandItem) => {
    if (!item) return
    item.onRun()
    setOpen(false)
  }

  return (
    <>
      <button type="button" className="life-btn ghost" onClick={() => setOpen(true)}>
        Search
        <kbd className="life-kbd">⌘K</kbd>
      </button>

      <dialog
        className="life-command"
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false)
        }}
      >
        <div className="life-command-inner">
          <input
            ref={inputRef}
            className="life-command-input"
            type="text"
            value={query}
            placeholder="Search tasks, entries, people…"
            aria-label="Search"
            aria-activedescendant={flat[active] ? `cmd-${flat[active].id}` : undefined}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((i) => Math.min(i + 1, flat.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                run(flat[active])
              }
            }}
          />

          <div className="life-command-results" role="listbox" aria-label="Results">
            {flat.length === 0 ? (
              <p className="life-command-empty">No matches for “{query}”.</p>
            ) : (
              results.map((group) => (
                <div key={group.group} className="life-command-group">
                  <p className="eyebrow">{group.group}</p>
                  {group.items.map((item) => {
                    const index = flat.indexOf(item)
                    return (
                      <button
                        key={item.id}
                        id={`cmd-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={index === active}
                        className={`life-command-item${index === active ? ' is-active' : ''}`}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => run(item)}
                        tabIndex={-1}
                      >
                        <span className="life-command-item-label">{item.label}</span>
                        {item.meta ? (
                          <span className="life-command-item-meta">{item.meta}</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          <div className="life-command-foot">
            <span>
              <kbd className="life-kbd">↑</kbd>
              <kbd className="life-kbd">↓</kbd> navigate
            </span>
            <span>
              <kbd className="life-kbd">⏎</kbd> open
            </span>
            <span>
              <kbd className="life-kbd">esc</kbd> close
            </span>
          </div>
        </div>
      </dialog>
    </>
  )
}
