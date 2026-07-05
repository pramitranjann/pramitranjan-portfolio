'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import type { PersonRelationship } from '@/lib/life/types'
import { fetchJson } from '@/lib/life/client'
import { agoLabel, daysBetween, RELATIONSHIP_LABEL, RELATIONSHIP_OPTIONS } from './shared'

export interface PersonListItem {
  id: string
  name: string
  role: string | null
  relationship: PersonRelationship
  cadenceDays: number | null
  /** Last interaction date, falling back to the created date. */
  lastDate: string
  /** True when there are no logged interactions yet. */
  noHistory: boolean
}

const EMPTY_COPY =
  "Your people live here — mentors, professors, recruiters, anyone who's seen your work. Add the last person you had a real career conversation with."

function overdueDays(person: PersonListItem, today: string) {
  if (person.cadenceDays == null) return 0
  return daysBetween(today, person.lastDate) - person.cadenceDays
}

function PersonRow({ person, today }: { person: PersonListItem; today: string }) {
  const over = overdueDays(person, today)
  return (
    <Link href={`/life/people/${person.id}`} className="life-row">
      <span className="life-project-parent-chip">{RELATIONSHIP_LABEL[person.relationship]}</span>
      <span className="life-row-body">
        <span className="life-row-title">{person.name}</span>
        {person.role ? <span className="life-row-meta">{person.role}</span> : null}
      </span>
      <span className="life-row-aside">
        {over > 0 ? <span className="life-due-chip due-overdue">{over}d over · </span> : null}
        {person.noHistory ? 'no contact yet' : agoLabel(person.lastDate, today)}
      </span>
    </Link>
  )
}

export function PeopleIndex({
  people,
  today,
  unavailable,
}: {
  people: PersonListItem[]
  today: string
  unavailable: boolean
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    if (!name) {
      setError('Contact name is required.')
      return
    }

    const cadenceValue = String(data.get('cadenceDays') || '').trim()
    setSaving(true)
    setError(null)

    try {
      await fetchJson('/api/life/people', {
        method: 'POST',
        body: JSON.stringify({
          name,
          role: String(data.get('role') || '').trim() || null,
          relationship: String(data.get('relationship') || 'contact'),
          channel: String(data.get('channel') || '').trim() || null,
          cadenceDays: cadenceValue ? Number(cadenceValue) : null,
          why: String(data.get('why') || '').trim() || null,
        }),
      })

      form.reset()
      setAdding(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contact creation failed.')
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return people
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(needle) ||
        (person.role || '').toLowerCase().includes(needle) ||
        RELATIONSHIP_LABEL[person.relationship].toLowerCase().includes(needle),
    )
  }, [people, query])

  const due = filtered
    .filter((person) => overdueDays(person, today) > 0)
    .sort((a, b) => overdueDays(b, today) - overdueDays(a, today))
  const rest = filtered.filter((person) => overdueDays(person, today) <= 0)

  return (
    <div>
      <div className="life-page-head">
        <div>
          <p className="eyebrow">People</p>
          <h1>Rolodex</h1>
          <p className="life-tasks-stat">
            <b>{people.length} people</b>
            {due.length > 0 ? <> · {due.length} due for contact</> : null}
          </p>
        </div>
        {!unavailable ? (
          <button type="button" className="life-btn primary" onClick={() => setAdding((value) => !value)} aria-expanded={adding}>
            + Add contact
          </button>
        ) : null}
      </div>

      {unavailable ? (
        <div className="life-empty">
          People aren&apos;t set up yet — the <code>008_rolodex</code> database migration hasn&apos;t been applied. Run it
          in Supabase and this page will come alive.
        </div>
      ) : (
        <>
          {adding ? (
            <form className="life-project-create life-people-create" onSubmit={(event) => void createContact(event)}>
              <input
                className="life-compose-title"
                autoFocus
                required
                type="text"
                name="name"
                placeholder="Contact name"
              />
              <div className="life-quick-form-row">
                <label className="life-quick-field">
                  <span className="life-quick-field-label">Role</span>
                  <input className="text-input" type="text" name="role" placeholder="e.g. Design lead at ..." />
                </label>
                <label className="life-quick-field">
                  <span className="life-quick-field-label">Relationship</span>
                  <select className="text-input" defaultValue="contact" name="relationship">
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {RELATIONSHIP_LABEL[option]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="life-quick-field">
                  <span className="life-quick-field-label">Channel</span>
                  <input className="text-input" type="text" name="channel" placeholder="email, LinkedIn..." />
                </label>
                <label className="life-quick-field">
                  <span className="life-quick-field-label">Cadence (days)</span>
                  <input className="text-input" type="number" min={1} name="cadenceDays" placeholder="30" />
                </label>
              </div>
              <textarea
                className="life-compose-desc"
                name="why"
                rows={2}
                placeholder="Why this person matters..."
              />
              <div className="life-project-create-foot">
                <button type="submit" className="life-btn primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add contact'}
                </button>
                <button type="button" className="life-btn ghost" onClick={() => setAdding(false)} disabled={saving}>
                  Cancel
                </button>
                {error ? <span className="error-text">{error}</span> : null}
              </div>
            </form>
          ) : null}

          <input
            className="text-input"
            type="search"
            placeholder="Search people…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search people"
          />

          {due.length > 0 ? (
            <div className="life-card" style={{ marginTop: 16 }}>
              <div className="life-card-head">
                <h2>Due for contact</h2>
              </div>
              <div className="life-rows">
                {due.map((person) => (
                  <PersonRow key={person.id} person={person} today={today} />
                ))}
              </div>
            </div>
          ) : null}

          {rest.length > 0 ? (
            <div className="life-card" style={{ marginTop: 16 }}>
              <div className="life-card-head">
                <h2>Everyone</h2>
              </div>
              <div className="life-rows">
                {rest.map((person) => (
                  <PersonRow key={person.id} person={person} today={today} />
                ))}
              </div>
            </div>
          ) : null}

          {people.length === 0 ? <div className="life-empty">{EMPTY_COPY}</div> : null}
          {people.length > 0 && filtered.length === 0 ? (
            <div className="life-empty">No one matches &ldquo;{query}&rdquo;.</div>
          ) : null}
        </>
      )}
    </div>
  )
}
