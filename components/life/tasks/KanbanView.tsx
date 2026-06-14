'use client'

import { useState } from 'react'

import type { TaskRecord } from '@/lib/life/types'

import { AddTaskInline } from './AddTaskInline'
import { TaskRow } from './TaskRow'

type Column = { key: 'open' | 'in_progress' | 'done'; label: string }

const COLUMNS: Column[] = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'Doing' },
  { key: 'done', label: 'Done' },
]

async function moveTask(taskId: string, status: Column['key']) {
  const form = new FormData()
  form.append('status', status)
  await fetch(`/api/life/tasks/${taskId}`, { method: 'POST', body: form })
  if (typeof window !== 'undefined') window.location.reload()
}

export function KanbanView({
  tasks,
  redirectTo,
}: {
  tasks: TaskRecord[]
  redirectTo: string
}) {
  const [dragOver, setDragOver] = useState<Column['key'] | null>(null)

  function onDragStart(event: React.DragEvent<HTMLDivElement>, taskId: string) {
    event.dataTransfer.setData('text/plain', taskId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>, key: Column['key']) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    setDragOver(null)
    if (taskId) void moveTask(taskId, key)
  }

  return (
    <div className="life-kanban">
      {COLUMNS.map((col) => {
        const items = tasks.filter((task) => task.status === col.key)
        return (
          <div
            key={col.key}
            className={`life-kanban-col ${dragOver === col.key ? 'is-drop' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(col.key)
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop(e, col.key)}
          >
            <div className="life-kanban-col-head">
              <h3>{col.label}</h3>
              <span className="count-pill">{items.length}</span>
            </div>
            <AddTaskInline redirectTo={redirectTo} />
            <ul className="life-kanban-list">
              {items.map((task) => (
                <li key={task.id}>
                  <div
                    className="life-kanban-card"
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                  >
                    <TaskRow task={task} redirectTo={redirectTo} variant="compact" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
