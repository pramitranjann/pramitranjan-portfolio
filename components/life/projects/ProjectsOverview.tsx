'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { fetchJson } from '@/lib/life/client'
import type { ProjectKind, ProjectStatus } from '@/lib/life/types'
import { healthTone, progressPct, relativeDueLabel, STATUS_LABEL } from './shared'

export interface ProjectOverviewItem {
  slug: string
  name: string
  summary: string | null
  color: string | null
  parentSlug: string | null
  parentName: string | null
  projectKind: ProjectKind
  status: ProjectStatus
  targetDate: string | null
  open: number
  done: number
  overdue: number
  total: number
}

const SWATCHES = ['#e9b765', '#7fd899', '#9aa6ff', '#e58fb8', '#6fcfd6', '#c79bff', '#ff6c61']

export function ProjectsOverview({
  items,
  today,
}: {
  items: ProjectOverviewItem[]
  today: string
}) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [color, setColor] = useState(SWATCHES[0])
  const [projectKind, setProjectKind] = useState<ProjectKind>('general')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalOpen = items.reduce((sum, item) => sum + item.open, 0)

  async function createProject() {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    try {
      await fetchJson('/api/life/projects', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed, summary: summary.trim() || null, color, parentSlug: null, projectKind }),
      })
      setName('')
      setSummary('')
      setColor(SWATCHES[0])
      setProjectKind('general')
      setAdding(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteProject(slug: string, projectName: string) {
    if (!window.confirm(`Delete "${projectName}"? Its tasks keep their history but lose the project label.`)) return
    try {
      await fetchJson(`/api/life/projects/${slug}`, { method: 'DELETE' })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project.')
    }
  }

  return (
    <div className="life-projects-shell">
      <div className="life-page-head life-projects-head">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>By project</h1>
          <p className="life-tasks-stat life-projects-stat">
            <b>{items.length} projects</b> · {totalOpen} open
          </p>
        </div>
        <button type="button" className="life-btn primary" onClick={() => setAdding((value) => !value)} aria-expanded={adding}>
          + New project
        </button>
      </div>

      {adding ? (
        <div className="life-project-create">
          <input
            className="life-compose-title"
            autoFocus
            value={name}
            placeholder="Project name…"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void createProject()
              }
              if (event.key === 'Escape') setAdding(false)
            }}
          />
          <textarea
            className="life-compose-desc"
            value={summary}
            placeholder="A short summary (optional)…"
            rows={2}
            onChange={(event) => setSummary(event.target.value)}
          />
          <select className="text-input" value={projectKind} onChange={(event) => setProjectKind(event.target.value as ProjectKind)}>
            <option value="general">General project</option>
            <option value="ux">UX class / design sprint</option>
          </select>
          <div className="life-project-create-foot">
            <div className="life-swatches">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  className={`life-swatch${color === swatch ? ' is-active' : ''}`}
                  style={{ background: swatch }}
                  aria-label={`Use ${swatch}`}
                  onClick={() => setColor(swatch)}
                />
              ))}
            </div>
            <button type="button" className="life-btn primary" disabled={saving || !name.trim()} onClick={() => void createProject()}>
              {saving ? 'Adding…' : 'Add project'}
            </button>
            <button type="button" className="life-btn ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      <div className="life-projects-grid">
        {items.map((item) => {
          const tone = healthTone(item)
          const pct = progressPct(item.done, item.total)
          const due = relativeDueLabel(item.targetDate, today)
          return (
            <div key={item.slug} className="life-card life-project-card">
              <Link href={`/life/projects/${item.slug}`} className="life-project-card-link">
                <div className="life-project-card-top">
                  <div className="life-card-head">
                    <span className="life-project-dot" style={{ background: item.color || 'var(--life-label)' }} />
                    <h2>{item.name}</h2>
                    <span className={`life-health-dot health-${tone}`} aria-label={`Health: ${tone}`} />
                  </div>
                  <div className="life-project-card-meta">
                    {item.parentName ? <span className="life-project-parent-chip">Sub-project of {item.parentName}</span> : null}
                    {item.projectKind === 'ux' ? <span className="life-project-kind-chip">UX</span> : null}
                    {item.status !== 'active' ? <span className="life-project-badge">{STATUS_LABEL[item.status]}</span> : null}
                    {due ? <span className={`life-due-chip due-${due.tone}`}>{due.text}</span> : null}
                  </div>
                </div>
                {item.summary ? <p className="life-project-summary">{item.summary}</p> : null}
                {item.parentName ? <p className="life-project-parent">Sub-project of {item.parentName}</p> : null}
                <div className="life-project-progress">
                  <div className="life-progress-track">
                    <div className="life-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="life-progress-label">{pct}%</span>
                </div>
                <div className="life-project-card-foot">
                  <span className="life-project-stat">{item.open} open</span>
                  <span className="life-project-stat">{item.done} done</span>
                  {item.overdue > 0 ? <span className="life-project-stat is-overdue">{item.overdue} overdue</span> : null}
                </div>
              </Link>
              <button
                type="button"
                className="life-project-delete"
                aria-label={`Delete ${item.name}`}
                onClick={() => void deleteProject(item.slug, item.name)}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      {items.length === 0 ? <div className="life-empty">No projects yet — add one above.</div> : null}
    </div>
  )
}
