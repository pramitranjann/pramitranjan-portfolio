'use client'

// One row for the whole project workspace. Today the right-hand pane invents
// six different row treatments — life-overview-row, life-rows, life-next-action,
// life-project-children-grid, life-milestone, plus refs and events — which is
// why it reads as unfinished. This is reui's `Item` idea in Life's tokens.
// ponytail: one component with slots, not six components. Variants are props.

import type { ReactNode } from 'react'

export function LifeItem({
  mark,
  title,
  description,
  meta,
  action,
  active = false,
  onClick,
  href,
}: {
  /** Colour dot, count, index — the left-hand identifier. */
  mark?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Right-aligned secondary text: a date, a count, a status. */
  meta?: ReactNode
  /** Trailing control — kept outside the button so it stays clickable. */
  action?: ReactNode
  active?: boolean
  onClick?: () => void
  href?: string
}) {
  const inner = (
    <>
      {mark ? <span className="life-item-mark">{mark}</span> : null}
      <span className="life-item-text">
        <span className="life-item-title">{title}</span>
        {description ? <span className="life-item-desc">{description}</span> : null}
      </span>
      {meta ? <span className="life-item-meta">{meta}</span> : null}
    </>
  )

  const className = `life-item${active ? ' is-active' : ''}`

  return (
    <div className="life-item-wrap">
      {href ? (
        <a className={className} href={href}>
          {inner}
        </a>
      ) : onClick ? (
        <button type="button" className={className} onClick={onClick}>
          {inner}
        </button>
      ) : (
        <div className={className}>{inner}</div>
      )}
      {/* Outside the button — a delete control nested in a button is invalid
          markup and swallows its own clicks. */}
      {action ? <span className="life-item-action">{action}</span> : null}
    </div>
  )
}

/** Rows separated by hairlines rather than wrapped in cards. */
export function LifeItemList({ children }: { children: ReactNode }) {
  return <div className="life-item-list">{children}</div>
}

/** Thin progress bar — the workspace's one measurement treatment. */
export function LifeProgress({
  value,
  total,
  label,
}: {
  value: number
  total: number
  label?: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="life-progress">
      <div className="life-progress-head">
        {label ? <span className="life-progress-label">{label}</span> : null}
        <span className="life-progress-value">
          {value}/{total}
        </span>
      </div>
      <div
        className="life-progress-track2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <span className="life-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Status, kind, priority — one badge, tones by meaning not decoration. */
export function LifeBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'green' | 'amber' | 'danger'
}) {
  return <span className={`life-badge tone-${tone}`}>{children}</span>
}
