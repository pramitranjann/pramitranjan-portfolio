import { localDateTimeToUtc } from '@/lib/life/time'
import type { TaskRecord } from '@/lib/life/types'

// 58 mm thermal paper at Font A prints 32 columns. The ESP32 streams these
// lines verbatim; ESC/POS init, line feeds, and the paper cut are added in
// firmware, so this stays plain, human-readable, and unit-testable.
export const RECEIPT_WIDTH = 32

function centerLine(text: string, width = RECEIPT_WIDTH) {
  const trimmed = text.slice(0, width)
  const pad = Math.max(0, Math.floor((width - trimmed.length) / 2))
  return ' '.repeat(pad) + trimmed
}

/** Word-wrap to the paper width, hard-breaking any single word longer than it. */
function wrap(text: string, width = RECEIPT_WIDTH): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    if (word.length > width) {
      if (line) {
        lines.push(line)
        line = ''
      }
      for (let i = 0; i < word.length; i += width) {
        lines.push(word.slice(i, i + width))
      }
      continue
    }
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length > width) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

function formatHeaderTimestamp(now: Date, timeZone: string) {
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: 'short',
  })
    .format(now)
    .toUpperCase()
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(now)
  return `${date} · ${time}`
}

/** "Due Thu, 26 Jun" — compact and unambiguous on a narrow receipt. */
function formatDueLabel(dueLocalDate: string, timeZone: string) {
  const noon = localDateTimeToUtc(dueLocalDate, timeZone, 12, 0)
  const label = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(noon)
  return `Due ${label}`
}

/** A short, human-readable tag for matching a paper receipt to a task. */
export function shortTaskCode(taskId: string) {
  return `#${taskId.replace(/-/g, '').slice(0, 4).toUpperCase()}`
}

/**
 * Render the ready-to-print receipt for a task. The result is stored on the
 * print job so the device never needs task data or any PR Life context — it just
 * prints the supplied bytes.
 */
export function buildReceiptPayload(input: {
  task: Pick<TaskRecord, 'id' | 'title' | 'status' | 'due_local_date' | 'details'>
  projectName?: string | null
  timeZone: string
  now?: Date
}): string {
  const { task, projectName, timeZone } = input
  const now = input.now ?? new Date()
  const checkbox = task.status === 'done' ? '[x]' : '[ ]'
  const divider = '-'.repeat(RECEIPT_WIDTH)

  const lines: string[] = []
  lines.push(centerLine('PR LIFE'))
  lines.push(centerLine(formatHeaderTimestamp(now, timeZone)))
  lines.push(divider)
  lines.push('')

  // The checkbox/indent prefix is 4 cols, so wrap the title to WIDTH-4 and the
  // prefix then fits without truncating any characters.
  const indent = '    '
  const titleLines = wrap(task.title, RECEIPT_WIDTH - indent.length)
  lines.push(`${checkbox} ${titleLines[0]}`)
  for (const cont of titleLines.slice(1)) {
    lines.push(`${indent}${cont}`)
  }

  const meta: string[] = []
  if (projectName) meta.push(projectName.toUpperCase())
  if (task.due_local_date) meta.push(formatDueLabel(task.due_local_date, timeZone))
  if (meta.length) {
    lines.push('')
    for (const item of meta) {
      for (const metaLine of wrap(item)) lines.push(metaLine)
    }
  }

  lines.push('')
  lines.push(shortTaskCode(task.id))

  return lines.join('\n')
}
