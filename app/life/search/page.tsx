import Link from 'next/link'
import { redirect } from 'next/navigation'

import { isAdminSession } from '@/lib/admin-auth'
import { searchLife } from '@/lib/life/search'

export default async function LifeSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/search')
  }

  const params = await searchParams
  const results = await searchLife(params.q || '')

  return (
    <div className="life-search-shell">
      <div className="life-page-head">
        <div>
          <p className="eyebrow">Search</p>
          <h1>{results.hasQuery ? `“${results.query}”` : 'Search everything'}</h1>
        </div>
        {results.hasQuery ? <span className="life-page-stat">{results.totalResults} results</span> : null}
      </div>

      <form action="/life/search" method="get" className="life-search-page-form">
        <input
          type="search"
          name="q"
          defaultValue={results.query}
          autoFocus
          placeholder="Search tasks, notes, and events…"
          className="text-input"
        />
        <button type="submit" className="primary-button">
          Search
        </button>
      </form>

      {!results.hasQuery ? (
        <p className="muted-text">Find anything across tasks, captured notes, and calendar events.</p>
      ) : results.totalResults === 0 ? (
        <div className="life-empty">No matches for “{results.query}”.</div>
      ) : (
        <div className="life-search-results">
          {results.tasks.length ? (
            <section className="life-card">
              <div className="life-card-head">
                <h2>Tasks</h2>
                <span className="count-pill">{results.tasks.length}</span>
              </div>
              <ul className="life-rows">
                {results.tasks.map((task) => (
                  <li className="life-row" key={task.id} style={{ gridTemplateColumns: '1fr auto' }}>
                    <Link href={task.href} className="life-row-body">
                      <span className={`life-row-title${task.status === 'done' ? ' is-done' : ''}`}>
                        {task.title}
                      </span>
                      <span className="life-row-meta">
                        <span className={`pri-dot pri-${task.priority}`} />
                        {task.projectLabel}
                      </span>
                    </Link>
                    {task.dueLabel ? <span className="life-row-aside">{task.dueLabel}</span> : <span />}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.entries.length ? (
            <section className="life-card">
              <div className="life-card-head">
                <h2>Entries</h2>
                <span className="count-pill">{results.entries.length}</span>
              </div>
              <ul className="life-rows">
                {results.entries.map((entry) => (
                  <li className="life-row life-entry-row" key={entry.id} style={{ gridTemplateColumns: '1fr auto' }}>
                    <Link href={entry.href} className="life-row-body">
                      <span className="life-entry-text">{entry.content}</span>
                      <span className="life-row-meta">
                        <span className="life-entry-kind" style={{ color: entry.kindColor }}>
                          {entry.kind}
                        </span>
                        <span>{entry.dayLabel}</span>
                        {entry.projectLabel ? <span className="life-tag">{entry.projectLabel}</span> : null}
                      </span>
                    </Link>
                    <span className="life-row-aside">{entry.timeLabel}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.events.length ? (
            <section className="life-card">
              <div className="life-card-head">
                <h2>Events</h2>
                <span className="count-pill">{results.events.length}</span>
              </div>
              <ul className="life-rows">
                {results.events.map((event) => (
                  <li className="life-row" key={event.id} style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                    <span className="time-chip">{event.timeLabel}</span>
                    <Link href={event.href} className="life-row-title">
                      {event.title}
                    </Link>
                    <span className="life-row-aside">{event.dayLabel}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
