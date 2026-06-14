'use client'

import { useState } from 'react'

import type { TaskRecord } from '@/lib/life/types'

import { AddTaskInline } from './AddTaskInline'
import { TaskRow } from './TaskRow'

export function ChecklistView({
  tasks,
  redirectTo,
}: {
  tasks: TaskRecord[]
  redirectTo: string
}) {
  const [showMeta, setShowMeta] = useState(false)
  const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'dismissed')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="life-checklist">
      <div className="life-checklist-toolbar">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setShowMeta((s) => !s)}
        >
          {showMeta ? 'Hide metadata' : 'Show metadata'}
        </button>
      </div>
      <AddTaskInline redirectTo={redirectTo} />
      <ul className="life-checklist-list">
        {open.map((task) => (
          <li key={task.id}>
            <TaskRow
              task={task}
              redirectTo={redirectTo}
              variant={showMeta ? 'default' : 'checklist'}
              showProject={showMeta}
              showDue={showMeta}
              showPriority={showMeta}
            />
          </li>
        ))}
      </ul>
      {done.length > 0 ? (
        <details className="life-checklist-done">
          <summary>Done ({done.length})</summary>
          <ul className="life-checklist-list">
            {done.map((task) => (
              <li key={task.id}>
                <TaskRow task={task} redirectTo={redirectTo} variant="checklist" />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
