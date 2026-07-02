'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { MarkdownCard } from '@/components/life/MarkdownCard'
import { fetchJson } from '@/lib/life/client'
import { mergeLifePageMetadata, splitLifePageBody, stripLifePageMetadata } from '@/lib/life/page-body'
import type { ProjectPageRecord } from '@/lib/life/types'

export function ProjectPages({ projectSlug, pages }: { projectSlug: string; pages: ProjectPageRecord[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedPageId = searchParams.get('page')
  const [items, setItems] = useState<ProjectPageRecord[]>(pages)
  const initialPage = (requestedPageId && pages.find((page) => page.id === requestedPageId)) || pages[0] || null
  const [selectedId, setSelectedId] = useState<string | null>(initialPage?.id || null)
  const [title, setTitle] = useState(initialPage?.title || '')
  const [body, setBody] = useState(stripLifePageMetadata(initialPage?.body || ''))
  const [mode, setMode] = useState<'read' | 'edit'>(initialPage ? 'read' : 'edit')
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setItems(pages)
    setSelectedId((current) => {
      if (current && pages.some((page) => page.id === current)) return current
      if (requestedPageId && pages.some((page) => page.id === requestedPageId)) return requestedPageId
      return pages[0]?.id || null
    })
  }, [pages, requestedPageId])

  const selectedPage = useMemo(
    () => items.find((page) => page.id === selectedId) || null,
    [items, selectedId],
  )

  useEffect(() => {
    setTitle(selectedPage?.title || '')
    setBody(stripLifePageMetadata(selectedPage?.body || ''))
    setSaveState('saved')
  }, [selectedPage?.id])

  const selectedDraftBody = selectedPage ? stripLifePageMetadata(selectedPage.body) : ''
  const selectedBody = selectedDraftBody.trim()
  const hasDraftChanges = Boolean(selectedPage && (title !== selectedPage.title || body !== selectedDraftBody))

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page.')
    } finally {
      setCreating(false)
    }
  }

  const savePageDraft = useCallback(async (page: ProjectPageRecord, nextTitle: string, nextBody: string) => {
    setSaveState('saving')
    setError(null)
    try {
      const payload = await fetchJson<{ page: ProjectPageRecord }>(`/api/life/projects/${projectSlug}/pages/${page.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: nextTitle, body: mergeLifePageMetadata(page.body, nextBody) }),
      })
      setItems((current) => current.map((page) => (page.id === payload.page.id ? payload.page : page)))
      setSaveState('saved')
    } catch (err) {
      setSaveState('error')
      setError(err instanceof Error ? err.message : 'Failed to save page.')
    }
  }, [projectSlug])

  const saveSelectedPageNow = useCallback(() => {
    if (!selectedPage || !hasDraftChanges) return Promise.resolve()
    return savePageDraft(selectedPage, title, body)
  }, [body, hasDraftChanges, savePageDraft, selectedPage, title])

  useEffect(() => {
    if (!requestedPageId || requestedPageId === selectedId || !items.some((page) => page.id === requestedPageId)) return
    let cancelled = false
    void (async () => {
      await saveSelectedPageNow()
      if (cancelled) return
      setSelectedId(requestedPageId)
      setMode('read')
    })()
    return () => {
      cancelled = true
    }
  }, [items, requestedPageId, saveSelectedPageNow, selectedId])

  async function selectPage(pageId: string) {
    await saveSelectedPageNow()
    setSelectedId(pageId)
    setMode('read')
    // Keep the URL (and the project tree highlight) in sync with the selection.
    router.replace(`/life/projects/${projectSlug}?page=${pageId}`, { scroll: false })
  }

  useEffect(() => {
    if (!selectedPage || mode !== 'edit' || !hasDraftChanges) return
    setSaveState('saving')
    const handle = window.setTimeout(() => {
      void savePageDraft(selectedPage, title, body)
    }, 900)
    return () => window.clearTimeout(handle)
  }, [body, hasDraftChanges, mode, savePageDraft, selectedPage, title])

  async function deletePage() {
    if (!selectedPage) return
    if (!window.confirm(`Delete "${selectedPage.title}"?`)) return
    setError(null)
    try {
      await fetchJson(`/api/life/projects/${projectSlug}/pages/${selectedPage.id}`, { method: 'DELETE' })
      const nextItems = items.filter((page) => page.id !== selectedPage.id)
      setItems(nextItems)
      setSelectedId(nextItems[0]?.id || null)
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
              onClick={() => void selectPage(page.id)}
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
              <span className={`life-project-page-save-state is-${saveState}`}>
                {saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Not saved' : 'Saved'}
              </span>
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
                  onBlur={() => void saveSelectedPageNow()}
                />
                <textarea
                  className="life-project-page-body"
                  value={body}
                  placeholder="Write notes, links, references, checklists… Markdown works here."
                  rows={16}
                  onChange={(event) => setBody(event.target.value)}
                  onBlur={() => void saveSelectedPageNow()}
                />
              </>
            ) : (
              <article
                className="life-project-page-reader"
                onClick={(event) => {
                  // Don't hijack clicks on links inside the rendered markdown.
                  if ((event.target as HTMLElement).closest('a')) return
                  setMode('edit')
                }}
              >
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
