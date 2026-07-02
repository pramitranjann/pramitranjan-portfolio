'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { fetchJson } from '@/lib/life/client'
import { mergeLifePageMetadata, splitLifePageBody, stripLifePageMetadata } from '@/lib/life/page-body'
import type { ProjectPageRecord } from '@/lib/life/types'

export function ProjectPages({ projectSlug, pages }: { projectSlug: string; pages: ProjectPageRecord[] }) {
  const router = useRouter()
  const [items, setItems] = useState<ProjectPageRecord[]>(pages)
  const [selectedId, setSelectedId] = useState<string | null>(pages[0]?.id || null)
  const [title, setTitle] = useState(pages[0]?.title || '')
  const [body, setBody] = useState(stripLifePageMetadata(pages[0]?.body || ''))
  const [mode, setMode] = useState<'read' | 'edit'>(pages[0] ? 'read' : 'edit')
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setItems(pages)
    setSelectedId((current) => {
      if (current && pages.some((page) => page.id === current)) return current
      return pages[0]?.id || null
    })
  }, [pages])

  const selectedPage = useMemo(
    () => items.find((page) => page.id === selectedId) || null,
    [items, selectedId],
  )

  useEffect(() => {
    setTitle(selectedPage?.title || '')
    setBody(stripLifePageMetadata(selectedPage?.body || ''))
  }, [selectedPage?.id, selectedPage?.title, selectedPage?.body])

  const selectedBody = selectedPage ? stripLifePageMetadata(selectedPage.body).trim() : ''

  function pageMeta(page: ProjectPageRecord) {
    const { body: visibleBody, templateArchetype } = splitLifePageBody(page.body)
    if (templateArchetype) return templateArchetype.replaceAll('-', ' ')
    return visibleBody.trim() ? 'Page' : 'Empty page'
  }

  async function createPage() {
    setCreating(true)
    setError(null)
    try {
      const payload = await fetchJson<{ page: ProjectPageRecord }>(`/api/life/projects/${projectSlug}/pages`, {
        method: 'POST',
        body: JSON.stringify({ title: 'Untitled', body: '' }),
      })
      setItems((current) => [...current, payload.page])
      setSelectedId(payload.page.id)
      setMode('edit')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page.')
    } finally {
      setCreating(false)
    }
  }

  async function savePage() {
    if (!selectedPage) return
    setSaving(true)
    setError(null)
    try {
      const payload = await fetchJson<{ page: ProjectPageRecord }>(`/api/life/projects/${projectSlug}/pages/${selectedPage.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, body: mergeLifePageMetadata(selectedPage.body, body) }),
      })
      setItems((current) => current.map((page) => (page.id === payload.page.id ? payload.page : page)))
      setMode('read')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page.')
    } finally {
      setSaving(false)
    }
  }

  async function deletePage() {
    if (!selectedPage) return
    if (!window.confirm(`Delete "${selectedPage.title}"?`)) return
    setError(null)
    try {
      await fetchJson(`/api/life/projects/${projectSlug}/pages/${selectedPage.id}`, { method: 'DELETE' })
      const nextItems = items.filter((page) => page.id !== selectedPage.id)
      setItems(nextItems)
      setSelectedId(nextItems[0]?.id || null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page.')
    }
  }

  return (
    <div className="life-project-pages">
      <div className="life-project-pages-sidebar">
        <div className="life-project-pages-head">
          <span className="eyebrow">Pages</span>
          <button type="button" className="life-btn primary life-project-page-action" disabled={creating} onClick={() => void createPage()}>
            {creating ? 'Adding…' : '+ Page'}
          </button>
        </div>
        <div className="life-project-pages-list">
          {items.length === 0 ? <div className="life-empty">No pages yet.</div> : null}
          {items.map((page) => (
            <button
              key={page.id}
              type="button"
              className={`life-project-page-link${page.id === selectedId ? ' is-active' : ''}`}
              onClick={() => {
                setSelectedId(page.id)
                setMode('read')
              }}
            >
              <span className="life-project-page-link-title">{page.title}</span>
              <span className="life-project-page-link-meta">{pageMeta(page)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="life-project-page-editor">
        {selectedPage ? (
          <>
            <div className="life-project-page-toolbar">
              {mode === 'edit' ? (
                <button type="button" className="life-btn primary life-project-page-action" disabled={saving} onClick={() => void savePage()}>
                  {saving ? 'Saving…' : 'Save page'}
                </button>
              ) : (
                <button type="button" className="life-btn primary life-project-page-action" onClick={() => setMode('edit')}>
                  Edit page
                </button>
              )}
              <button type="button" className="life-btn ghost life-project-page-action-secondary" onClick={() => void deletePage()}>
                Delete
              </button>
            </div>
            {mode === 'edit' ? (
              <>
                <input
                  className="life-project-page-title"
                  value={title}
                  placeholder="Untitled"
                  onChange={(event) => setTitle(event.target.value)}
                />
                <textarea
                  className="life-project-page-body"
                  value={body}
                  placeholder="Write notes, links, references, checklists… Markdown works here."
                  rows={16}
                  onChange={(event) => setBody(event.target.value)}
                />
              </>
            ) : (
              <article className="life-project-page-reader">
                <h2 className="life-project-page-read-title">{selectedPage.title}</h2>
                {selectedBody ? <MarkdownCard content={selectedBody} /> : <div className="life-empty">Empty page.</div>}
              </article>
            )}
          </>
        ) : (
          <div className="life-empty">Select a page or create a new one.</div>
        )}

        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </div>
  )
}
