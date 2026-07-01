'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import Link from 'next/link'

import { fetchJson } from '@/lib/life/client'
import type { LifeProjectClient, StudioItemKind, StudioItemRecord } from '@/lib/life/types'

const FILTERS: Array<{ key: StudioItemKind | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'link', label: 'Links' },
  { key: 'moodboard', label: 'Boards' },
  { key: 'critique', label: 'Critiques' },
]

function hostFor(url: string | null) {
  if (!url) return null
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

function imageFilesFromList(files: FileList | File[]) {
  return Array.from(files).filter((file) => file.type.startsWith('image/'))
}

async function postStudioImage(form: FormData) {
  const response = await fetch('/api/life/studio/upload', {
    method: 'POST',
    body: form,
  })
  const payload = (await response.json().catch(() => null)) as { item?: StudioItemRecord; error?: string } | null
  if (!response.ok || !payload?.item) {
    throw new Error(payload?.error || 'Failed to upload image.')
  }
  return payload.item
}

export function StudioClient({
  initialItems,
  projects,
}: {
  initialItems: StudioItemRecord[]
  projects: LifeProjectClient[]
}) {
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState<StudioItemKind | 'all'>('all')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [tags, setTags] = useState('')
  const [projectSlug, setProjectSlug] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const projectBySlug = useMemo(() => new Map(projects.map((project) => [project.slug, project])), [projects])
  const visibleItems = filter === 'all' ? items : items.filter((item) => item.kind === filter)
  const counts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.kind] = (acc[item.kind] || 0) + 1
      return acc
    }, {})
  }, [items])

  async function uploadFiles(files: File[]) {
    const images = imageFilesFromList(files)
    if (images.length === 0 || saving) return
    setSaving(true)
    setError(null)
    try {
      const created: StudioItemRecord[] = []
      for (const file of images) {
        const form = new FormData()
        form.append('file', file)
        if (projectSlug) form.append('projectSlug', projectSlug)
        if (tags.trim()) form.append('tags', tags)
        created.push(await postStudioImage(form))
      }
      setItems((current) => [...created, ...current])
      setComposeOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images.')
    } finally {
      setSaving(false)
      setDragActive(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (folderInputRef.current) folderInputRef.current.value = ''
    }
  }

  async function addLink() {
    const url = linkUrl.trim()
    if (!url || saving) return
    setSaving(true)
    setError(null)
    try {
      const payload = await fetchJson<{ item: StudioItemRecord }>('/api/life/studio', {
        method: 'POST',
        body: JSON.stringify({
          kind: 'link',
          title: linkTitle.trim() || url,
          url,
          tags: splitTags(tags),
          projectSlug: projectSlug || null,
        }),
      })
      setItems((current) => [payload.item, ...current])
      setLinkUrl('')
      setLinkTitle('')
      setComposeOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteItem(id: string) {
    setError(null)
    try {
      await fetchJson(`/api/life/studio/${id}`, { method: 'DELETE' })
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item.')
    }
  }

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files || [])
      const images = files.filter((file) => file.type.startsWith('image/'))
      if (images.length === 0) return
      event.preventDefault()
      void uploadFiles(images)
    }

    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [projectSlug, saving, tags])

  return (
    <div className="life-studio-shell">
      <section className="life-studio-toolbar">
        <div>
          <p className="eyebrow">Studio</p>
          <h1>Studio</h1>
        </div>
        <div className="life-studio-actions">
          <button type="button" className="life-btn primary" onClick={() => setComposeOpen(true)}>
            New
          </button>
        </div>
        <input
          ref={fileInputRef}
          className="life-studio-file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => void uploadFiles(imageFilesFromList(event.target.files || []))}
        />
        <input
          ref={folderInputRef}
          className="life-studio-file-input"
          type="file"
          accept="image/*"
          multiple
          {...({ webkitdirectory: '', directory: '' } as InputHTMLAttributes<HTMLInputElement>)}
          onChange={(event) => void uploadFiles(imageFilesFromList(event.target.files || []))}
        />
      </section>

      <div className="life-studio-filters">
        {FILTERS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className={`filter-chip${filter === entry.key ? ' is-active' : ''}`}
            onClick={() => setFilter(entry.key)}
          >
            {entry.label} <span className="chip-count">{entry.key === 'all' ? items.length : counts[entry.key] || 0}</span>
          </button>
        ))}
      </div>

      <section
        className={`life-studio-board-surface${dragActive ? ' is-dragging' : ''}${items.length === 0 ? ' is-empty' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDragActive(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          void uploadFiles(imageFilesFromList(event.dataTransfer.files))
        }}
      >
        {visibleItems.length > 0 ? (
          <div className="life-studio-masonry">
            {visibleItems.map((item) => {
              const project = item.project_slug ? projectBySlug.get(item.project_slug) : null
              const host = hostFor(item.url)
              return (
                <article key={item.id} className={`life-studio-tile studio-${item.kind}`}>
                  <button type="button" className="life-studio-tile-delete" aria-label="Delete item" onClick={() => void deleteItem(item.id)}>
                    x
                  </button>
                  {item.kind === 'image' && item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="life-studio-image-link">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.title || 'Studio image'} className="life-studio-image" />
                    </a>
                  ) : null}
                  {item.kind === 'link' && item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="life-studio-link-tile">
                      <span>{host}</span>
                      <strong>{item.title || item.url}</strong>
                    </a>
                  ) : null}
                  <div className="life-studio-tile-meta">
                    <strong>{item.title}</strong>
                    {project ? <Link href={`/life/projects/${project.slug}`}>{project.name}</Link> : null}
                    {item.tags.length > 0 ? (
                      <div className="life-studio-tags">
                        {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="life-studio-drop-message">
            <span>{dragActive ? 'Drop images' : 'Drop images here'}</span>
            <small>or paste screenshots with Cmd+V</small>
          </div>
        )}
      </section>

      {saving ? <p className="life-studio-status">Saving...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {composeOpen ? (
        <div className="life-studio-compose-backdrop" onClick={() => setComposeOpen(false)}>
          <section className="life-studio-compose" aria-label="New Studio entry" onClick={(event) => event.stopPropagation()}>
            <header className="life-studio-compose-head">
              <h2>New</h2>
              <button type="button" className="life-studio-compose-close" aria-label="Close" onClick={() => setComposeOpen(false)}>
                x
              </button>
            </header>

            <div className="life-studio-compose-picks">
              <button type="button" className="life-studio-pick" onClick={() => fileInputRef.current?.click()}>
                Images
              </button>
              <button type="button" className="life-studio-pick" onClick={() => folderInputRef.current?.click()}>
                Folder
              </button>
            </div>

            <div className="life-studio-compose-form">
              <input className="text-input" value={linkUrl} placeholder="Link" onChange={(event) => setLinkUrl(event.target.value)} />
              <input className="text-input" value={linkTitle} placeholder="Label" onChange={(event) => setLinkTitle(event.target.value)} />
              <input className="text-input" value={tags} placeholder="Tags" onChange={(event) => setTags(event.target.value)} />
              <select className="text-input" value={projectSlug} onChange={(event) => setProjectSlug(event.target.value)}>
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button type="button" className="life-btn primary" disabled={saving || !linkUrl.trim()} onClick={() => void addLink()}>
                Add link
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
