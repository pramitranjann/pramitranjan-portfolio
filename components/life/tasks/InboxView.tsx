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
  return Array.from(groups.entries()).sort(([l], [r]) =>
    l === 'unassigned' ? 1 : r === 'unassigned' ? -1 : l.localeCompare(r),
  )
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
  const focusIds = new Set(focus.map((t) => t.id))
  const groups = groupByProject(tasks.filter((t) => !focusIds.has(t.id)))

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
              <button
                type="button"
                className="life-inbox-group-head"
                onClick={() => toggle(key)}
              >
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
