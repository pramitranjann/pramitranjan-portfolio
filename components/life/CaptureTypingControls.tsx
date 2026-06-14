'use client'

import { useState } from 'react'

import { useViewportMode } from '@/hooks/useViewportMode'
import { LIFE_PROJECTS } from '@/lib/life/projects'

export function CaptureTypingControls({ textareaId }: { textareaId: string }) {
  const viewport = useViewportMode()
  const isPhone = viewport === 'phone'
  const [revealed, setRevealed] = useState(false)
  const expanded = !isPhone || revealed

  return (
    <div className={`life-typing-controls ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
      <textarea
        className="draft-area life-entry-area"
        id={textareaId}
        name="content"
        rows={6}
        placeholder="Capture."
        aria-hidden={!expanded}
      />
      {expanded ? (
        <div className="life-entry-controls">
          <label className="field compact-field">
            <span>Project</span>
            <select className="text-input" defaultValue="" name="projectSlug">
              <option value="">Auto</option>
              {LIFE_PROJECTS.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="submit">
            Save
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="life-type-fallback-trigger"
          onClick={() => setRevealed(true)}
        >
          Type instead
        </button>
      )}
    </div>
  )
}
