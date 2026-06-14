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
    if (by === 'project') {
      key = task.project_slug ? getProjectLabel(task.project_slug) || task.project_slug : 'Unassigned'
    }
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
  if (by === 'updated') {
    sorted.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
  }
  if (by === 'created') {
    sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  }
  if (by === 'due') {
    sorted.sort((a, b) => (a.due_local_date || '9999').localeCompare(b.due_local_date || '9999'))
  }
  if (by === 'priority') {
    sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  }
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
          <select
            className="text-input"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          >
            <option value="project">By project</option>
            <option value="status">By status</option>
            <option value="priority">By priority</option>
            <option value="due">By due</option>
          </select>
        </label>
        <label className="field compact-field">
          <span>Sort</span>
          <select
            className="text-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
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
