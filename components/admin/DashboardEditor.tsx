'use client'

import { useEffect, useMemo, useState } from 'react'
import { deriveCaseStudyMediaBlocks } from '@/lib/case-study-media'
import type {
  AudioSettings,
  CardStyleSettings,
  CaseStudyContent,
  CaseStudyMediaAlign,
  CaseStudyMediaBlock,
  CaseStudyMediaBlockSection,
  CaseStudyImagePairSettings,
  CaseStudyMediaSettings,
  CaseStudyMediaSlotSettings,
  CaseStudySection,
  EntryItem,
  GalleryStyleSettings,
  HeroStageCopy,
  ListeningCardStyleSettings,
  LinkItem,
  MotionSettings,
  NowCard,
  NowCardStyleSettings,
  PhotographyCardStyleSettings,
  PhotographyCity,
  PhotographyGallery,
  ProjectLink,
  SiteContent,
  WorkProject,
} from '@/lib/site-content-schema'

type EditorProps = {
  initialContent: SiteContent
  localWriteEnabled: boolean
}

type PageKey =
  | 'homepage'
  | 'about-page'
  | 'work-page'
  | 'creative-page'
  | 'photography-page'
  | 'case-study-ui'
  | 'design-system'
  | 'motion'
  | `case-study:${string}`

type PresetOption = {
  value: string
  label: string
}

const mediaBlockWidthOptions: PresetOption[] = [
  { value: '', label: 'Auto / Full Width' },
  { value: '56%', label: 'Portrait Narrow · 56%' },
  { value: '60%', label: 'Portrait Narrow · 60%' },
  { value: '64%', label: 'Portrait Medium · 64%' },
  { value: '68%', label: 'Portrait Medium · 68%' },
  { value: '72%', label: 'Portrait Wide · 72%' },
  { value: '78%', label: 'Centered Showcase · 78%' },
  { value: '84%', label: 'Wide Showcase · 84%' },
  { value: '100%', label: 'Full Width · 100%' },
  { value: '720px', label: 'Fixed Width · 720px' },
  { value: '820px', label: 'Fixed Width · 820px' },
  { value: '920px', label: 'Fixed Width · 920px' },
  { value: 'min(100%, 720px)', label: 'Responsive Clamp · 720px' },
  { value: 'min(100%, 820px)', label: 'Responsive Clamp · 820px' },
  { value: 'min(100%, 920px)', label: 'Responsive Clamp · 920px' },
]

const mediaGapOptions: PresetOption[] = [
  { value: '', label: 'Default Gap' },
  { value: '2px', label: 'Tight · 2px' },
  { value: '8px', label: 'Small · 8px' },
  { value: '12px', label: 'Medium · 12px' },
  { value: '16px', label: 'Comfortable · 16px' },
  { value: '24px', label: 'Loose · 24px' },
]

const mediaPositionOptions: PresetOption[] = [
  { value: '', label: 'Default Position' },
  { value: 'center center', label: 'Center' },
  { value: 'center top', label: 'Top Center' },
  { value: 'center bottom', label: 'Bottom Center' },
  { value: 'left center', label: 'Left Center' },
  { value: 'right center', label: 'Right Center' },
  { value: '50% 20%', label: 'Upper Focus · 50% 20%' },
  { value: '50% 30%', label: 'Upper Focus · 50% 30%' },
  { value: '50% 70%', label: 'Lower Focus · 50% 70%' },
]

const mediaAspectRatioOptions: PresetOption[] = [
  { value: '', label: 'Auto Ratio' },
  { value: '3 / 4', label: 'Portrait UI · 3 / 4' },
  { value: '4 / 5', label: 'Portrait Tall · 4 / 5' },
  { value: '1 / 1', label: 'Square · 1 / 1' },
  { value: '4 / 3', label: 'Square-ish Landscape · 4 / 3' },
  { value: '3 / 2', label: 'Landscape Medium · 3 / 2' },
  { value: '16 / 10', label: 'Wide UI · 16 / 10' },
  { value: '16 / 9', label: 'Wide Flow · 16 / 9' },
]

const mediaBackgroundOptions: PresetOption[] = [
  { value: '', label: 'Default Background · Page Black' },
  { value: '#161616', label: 'Surface Dark · #161616' },
  { value: '#111111', label: 'Panel Dark · #111111' },
  { value: '#0d0d0d', label: 'Page Black · #0d0d0d' },
  { value: '#f5f2ed', label: 'Paper Light · #f5f2ed' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '8px' }}>
      <span className="font-mono" style={{ fontSize: '13px', color: '#d2cec8', letterSpacing: '0.12em', lineHeight: 1.4 }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function SectionFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #1f1f1f', background: '#111111', padding: '20px' }}>
      <h2 className="font-serif" style={{ fontSize: 'var(--text-h3)', color: '#f5f2ed', fontWeight: 400, marginBottom: '18px' }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        {children}
      </div>
    </section>
  )
}

function inputStyle(multiline = false) {
  return {
    width: '100%',
    minHeight: multiline ? '112px' : undefined,
    background: '#0d0d0d',
    border: '1px solid #2a2a2a',
    color: '#f5f2ed',
    padding: '12px 14px',
    outline: 'none',
    resize: multiline ? 'vertical' as const : undefined,
  }
}

function PresetSelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string
  value: string | undefined
  options: PresetOption[]
  placeholder: string
  onChange: (value: string | undefined) => void
}) {
  const hasPresetMatch = !!value && options.some((option) => option.value === value)
  const [customMode, setCustomMode] = useState(Boolean(value) && !hasPresetMatch)

  useEffect(() => {
    if (!value) {
      setCustomMode(false)
      return
    }

    if (!options.some((option) => option.value === value)) {
      setCustomMode(true)
    }
  }, [options, value])

  const selectValue = customMode ? '__custom__' : (value ?? '')

  return (
    <Field label={label}>
      <div style={{ display: 'grid', gap: '8px' }}>
        <select
          value={selectValue}
          onChange={(event) => {
            const nextValue = event.target.value
            if (nextValue === '__custom__') {
              setCustomMode(true)
              return
            }
            setCustomMode(false)
            onChange(nextValue || undefined)
          }}
          style={inputStyle()}
        >
          {options.map((option) => (
            <option key={`${label}-${option.value || 'default'}`} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value="__custom__">Custom</option>
        </select>
        {customMode ? (
          <input
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value || undefined)}
            placeholder={placeholder}
            style={inputStyle()}
          />
        ) : null}
      </div>
    </Field>
  )
}

function textToTags(value: string) {
  return value.split(',').map((tag) => tag.trim()).filter(Boolean)
}

function tagsToText(tags: string[]) {
  return tags.join(', ')
}

function textToTools(value: string) {
  return value.split('\n').map((tool) => tool.trim()).filter(Boolean)
}

function toolsToText(tools: string[]) {
  return tools.join('\n')
}

function updateAt<T>(items: T[], index: number, value: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item))
}

function removeAt<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index)
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= items.length) return items
  const nextItems = [...items]
  const [item] = nextItems.splice(index, 1)
  nextItems.splice(targetIndex, 0, item)
  return nextItems
}

function toPair(first: string, second: string) {
  return [first, second].filter(Boolean)
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function createCaseStudyDraft(section: CaseStudySection, existing: CaseStudyContent[]) {
  const baseSlug = slugify(`${section}-project`) || 'case-study'
  let slug = baseSlug
  let counter = 2

  while (existing.some((item) => item.slug === slug)) {
    slug = `${baseSlug}-${counter}`
    counter += 1
  }

  return {
    slug,
    section,
    title: 'Untitled project',
    oneliner: '',
    type: '',
    tags: [],
    prev: null,
    next: null,
  } satisfies CaseStudyContent
}

function createMediaImageDraft() {
  return {
    src: '',
    fit: 'contain',
    position: 'center center',
    aspectRatio: '4 / 3',
    background: '#0d0d0d',
    alt: '',
  } satisfies CaseStudyMediaBlock['images'][number]
}

function createMediaBlockDraft(section: CaseStudyMediaBlockSection): CaseStudyMediaBlock {
  return {
    id: `${section}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    section,
    layout: 'single',
    placement: 'below',
    align: 'center',
    width: '100%',
    gap: '2px',
    images: [createMediaImageDraft()],
  }
}

function normalizeMediaBlock(block: CaseStudyMediaBlock): CaseStudyMediaBlock {
  const imageCount = block.layout === 'pair' ? 2 : 1
  const images = Array.from({ length: imageCount }, (_, index) => block.images[index] ?? createMediaImageDraft())
  return {
    ...block,
    images,
  }
}

function serializeContent(content: SiteContent) {
  return JSON.stringify(content)
}

function SidebarGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      <div className="font-mono" style={{ fontSize: '11px', color: '#666666', letterSpacing: '0.14em' }}>
        {title}
      </div>
      <div style={{ display: 'grid', gap: '8px' }}>
        {children}
      </div>
    </div>
  )
}

function SidebarButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono"
      style={{
        textAlign: 'left',
        background: active ? '#181818' : 'transparent',
        border: `1px solid ${active ? '#FF3120' : '#1f1f1f'}`,
        color: active ? '#f5f2ed' : '#999999',
        padding: '10px 12px',
        letterSpacing: '0.08em',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function ReorderButtons({
  index,
  length,
  onMove,
}: {
  index: number
  length: number
  onMove: (direction: -1 | 1) => void
}) {
  return (
    <div className="flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        className="font-mono"
        style={{ background: 'transparent', border: '1px solid #2a2a2a', color: index === 0 ? '#444444' : '#999999', padding: '8px 12px', cursor: index === 0 ? 'default' : 'pointer', letterSpacing: '0.1em' }}
      >
        MOVE UP
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={index === length - 1}
        className="font-mono"
        style={{ background: 'transparent', border: '1px solid #2a2a2a', color: index === length - 1 ? '#444444' : '#999999', padding: '8px 12px', cursor: index === length - 1 ? 'default' : 'pointer', letterSpacing: '0.1em' }}
      >
        MOVE DOWN
      </button>
    </div>
  )
}

export function DashboardEditor({ initialContent, localWriteEnabled }: EditorProps) {
  const gitCommands = `git status
git diff
git add -A
git commit -m "your message here"
git push`
  const [history, setHistory] = useState({
    past: [] as SiteContent[],
    present: initialContent,
    future: [] as SiteContent[],
  })
  const [savedContent, setSavedContent] = useState(initialContent)
  const [status, setStatus] = useState('Ready')
  const [saving, setSaving] = useState(false)
  const [activePage, setActivePage] = useState<PageKey>('homepage')
  const [editingEnabled, setEditingEnabled] = useState(false)
  const [saveHovered, setSaveHovered] = useState(false)
  const [showGitPrompt, setShowGitPrompt] = useState(false)
  const [copiedGitCommands, setCopiedGitCommands] = useState(false)

  const content = history.present
  const isDirty = useMemo(() => serializeContent(content) !== serializeContent(savedContent), [content, savedContent])

  const groupedCaseStudies = useMemo(
    () => ({
      work: content.caseStudies.filter((item) => item.section === 'work'),
      mixedMedia: content.caseStudies.filter((item) => item.section === 'mixed-media'),
      branding: content.caseStudies.filter((item) => item.section === 'branding'),
    }),
    [content.caseStudies]
  )

  function requestEditingAccess() {
    if (editingEnabled) return true

    const confirmed = window.confirm('Enable editing mode? Changes will stay local until you save them.')
    if (!confirmed) {
      setStatus('Edit cancelled')
      return false
    }

    setEditingEnabled(true)
    setStatus('Editing enabled')
    return true
  }

  function handleEditingToggle() {
    if (!localWriteEnabled) return

    if (!editingEnabled) {
      requestEditingAccess()
      return
    }

    if (isDirty) {
      const confirmed = window.confirm('Turn editing off? Your unsaved changes will stay here, but the dashboard will lock until you enable editing again.')
      if (!confirmed) {
        setStatus('Editing stays on')
        return
      }
    }

    setEditingEnabled(false)
    setStatus(isDirty ? 'Editing locked with unsaved changes' : 'Editing disabled')
  }

  function applyContentChange(updater: (current: SiteContent) => SiteContent) {
    if (!requestEditingAccess()) return

    setHistory((current) => {
      const next = updater(current.present)
      if (serializeContent(next) === serializeContent(current.present)) {
        return current
      }

      return {
        past: [...current.past, current.present].slice(-100),
        present: next,
        future: [],
      }
    })
    setStatus('Unsaved changes')
  }

  function updateSection<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    applyContentChange((current) => ({ ...current, [key]: value }))
  }

  function updateCaseStudy(slug: string, updater: (item: CaseStudyContent) => CaseStudyContent) {
    applyContentChange((current) => {
      let nextSlug = slug
      const caseStudies = current.caseStudies.map((item) => {
        if (item.slug !== slug) return item
        const updated = updater(item)
        nextSlug = updated.slug
        return updated
      })
      setActivePage(`case-study:${nextSlug}`)
      return {
        ...current,
        caseStudies,
      }
    })
  }

  function addCaseStudy(section: CaseStudySection) {
    applyContentChange((current) => {
      const draft = createCaseStudyDraft(section, current.caseStudies)
      setActivePage(`case-study:${draft.slug}`)
      return {
        ...current,
        caseStudies: [...current.caseStudies, draft],
      }
    })
  }

  function removeCaseStudy(slug: string) {
    if (!requestEditingAccess()) return
    const confirmed = window.confirm('Remove this case study? This can be undone before saving.')
    if (!confirmed) {
      setStatus('Removal cancelled')
      return
    }

    applyContentChange((current) => ({
      ...current,
      caseStudies: current.caseStudies.filter((item) => item.slug !== slug),
    }))
    setActivePage('homepage')
  }

  function handleUndo() {
    setHistory((current) => {
      if (current.past.length === 0) return current
      const previous = current.past[current.past.length - 1]
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future].slice(0, 100),
      }
    })
    setStatus('Undid last change')
    setEditingEnabled(true)
  }

  function handleRedo() {
    setHistory((current) => {
      if (current.future.length === 0) return current
      const next = current.future[0]
      return {
        past: [...current.past, current.present].slice(-100),
        present: next,
        future: current.future.slice(1),
      }
    })
    setStatus('Redid change')
    setEditingEnabled(true)
  }

  async function handleSave() {
    if (!localWriteEnabled) {
      setStatus('Vercel mode is view-only. Save locally, then commit and push.')
      return
    }

    if (!editingEnabled) {
      setStatus('Enable editing before saving')
      return
    }

    setSaving(true)
    setStatus('Saving...')

    const response = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setStatus(data?.error ?? 'Save failed')
      setSaving(false)
      return
    }

    setSavedContent(content)
    setStatus('Saved')
    setSaving(false)
    setShowGitPrompt(true)
    setCopiedGitCommands(false)
  }

  async function handleCopyGitCommands() {
    try {
      await navigator.clipboard.writeText(gitCommands)
      setCopiedGitCommands(true)
      setStatus('Git commands copied')
    } catch {
      setStatus('Could not copy commands')
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/dashboard/login'
  }

  const activeCaseStudy = activePage.startsWith('case-study:')
    ? content.caseStudies.find((item) => item.slug === activePage.replace('case-study:', '')) ?? null
    : null

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div style={{ border: `1px solid ${localWriteEnabled ? '#1f1f1f' : '#5f2a23'}`, background: '#111111', padding: '16px 18px' }}>
        <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: localWriteEnabled ? '#999999' : '#f5f2ed', lineHeight: 1.8 }}>
          {localWriteEnabled
            ? 'Local save mode: SAVE CHANGES writes to content/site-content.json on this machine. After that, review the git diff, commit it, and push it.'
            : 'Vercel mode: this dashboard is read-only for persistence. Use it locally if you want SAVE CHANGES to write to content/site-content.json.'}
        </p>
      </div>

      {showGitPrompt && localWriteEnabled ? (
        <div style={{ border: '1px solid #FF3120', background: '#111111', padding: '16px 18px', display: 'grid', gap: '14px' }}>
          <div className="flex items-center justify-between" style={{ gap: '12px', flexWrap: 'wrap' }}>
            <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#f5f2ed', lineHeight: 1.7 }}>
              Saved to <span style={{ color: '#FF3120' }}>content/site-content.json</span>. Next step: review the diff, commit it, and push it.
            </p>
            <button
              type="button"
              onClick={() => setShowGitPrompt(false)}
              className="font-mono"
              style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
            >
              DISMISS
            </button>
          </div>
          <pre
            className="font-mono"
            style={{
              margin: 0,
              padding: '14px 16px',
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              color: '#f5f2ed',
              fontSize: '13px',
              lineHeight: 1.7,
              overflowX: 'auto',
            }}
          >
            {gitCommands}
          </pre>
          <div className="flex items-center" style={{ gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCopyGitCommands}
              className="font-mono"
              style={{ background: '#FF3120', border: 'none', color: '#0d0d0d', padding: '10px 14px', cursor: 'pointer', letterSpacing: '0.1em' }}
            >
              {copiedGitCommands ? 'COPIED' : 'COPY COMMANDS'}
            </button>
            <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.08em' }}>
              Run these from `/Users/pramitranjan/portfolio`
            </span>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between" style={{ gap: '16px', flexWrap: 'wrap' }}>
        <p className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.08em' }}>
          {isDirty ? `${status} · UNSAVED` : status}
        </p>
        <div className="flex" style={{ gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleEditingToggle}
            className="font-mono"
            disabled={!localWriteEnabled}
            style={{ background: editingEnabled ? '#181818' : 'transparent', border: '1px solid #2a2a2a', color: !localWriteEnabled ? '#444444' : editingEnabled ? '#f5f2ed' : '#999999', padding: '12px 16px', letterSpacing: '0.1em', cursor: localWriteEnabled ? 'pointer' : 'default' }}
          >
            {editingEnabled ? 'TURN EDITING OFF' : 'ENABLE EDITING'}
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.past.length === 0}
            className="font-mono"
            style={{ background: 'transparent', border: '1px solid #2a2a2a', color: history.past.length === 0 ? '#444444' : '#999999', padding: '12px 16px', letterSpacing: '0.1em', cursor: history.past.length === 0 ? 'default' : 'pointer' }}
          >
            UNDO
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={history.future.length === 0}
            className="font-mono"
            style={{ background: 'transparent', border: '1px solid #2a2a2a', color: history.future.length === 0 ? '#444444' : '#999999', padding: '12px 16px', letterSpacing: '0.1em', cursor: history.future.length === 0 ? 'default' : 'pointer' }}
          >
            REDO
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="font-mono"
            style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '12px 16px', letterSpacing: '0.1em', cursor: 'pointer' }}
          >
            LOG OUT
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !editingEnabled || !isDirty || !localWriteEnabled}
            className="font-mono"
            onMouseEnter={() => setSaveHovered(true)}
            onMouseLeave={() => setSaveHovered(false)}
            style={{
              background: saving || !editingEnabled || !isDirty || !localWriteEnabled ? '#3a1d18' : saveHovered ? '#ff5a4d' : '#FF3120',
              border: 'none',
              color: saving || !editingEnabled || !isDirty || !localWriteEnabled ? '#7a5a55' : '#0d0d0d',
              padding: '12px 16px',
              letterSpacing: '0.1em',
              cursor: saving || !editingEnabled || !isDirty || !localWriteEnabled ? 'default' : 'pointer',
              boxShadow: saveHovered && editingEnabled && isDirty && localWriteEnabled ? '0 0 0 1px rgba(255, 49, 32, 0.45), 0 8px 28px rgba(255, 49, 32, 0.22)' : 'none',
              transform: saveHovered && editingEnabled && isDirty && localWriteEnabled ? 'translateY(-1px)' : 'none',
              transition: 'background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
            }}
          >
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>

      {!editingEnabled && localWriteEnabled ? (
        <div style={{ border: '1px solid #1f1f1f', background: '#111111', padding: '16px 18px' }}>
          <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.7 }}>
            Dashboard is currently read-only. Use <span style={{ color: '#f5f2ed' }}>ENABLE EDITING</span> to confirm you want to make changes before any field becomes editable.
          </p>
        </div>
      ) : null}

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        <aside style={{ border: '1px solid #1f1f1f', background: '#111111', padding: '16px', position: 'sticky', top: '96px', maxHeight: 'calc(100vh - 112px)', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gap: '18px' }}>
            <SidebarGroup title="SITE PAGES">
              <SidebarButton active={activePage === 'homepage'} label="Homepage" onClick={() => setActivePage('homepage')} />
              <SidebarButton active={activePage === 'about-page'} label="About Page" onClick={() => setActivePage('about-page')} />
              <SidebarButton active={activePage === 'work-page'} label="Work Page" onClick={() => setActivePage('work-page')} />
              <SidebarButton active={activePage === 'creative-page'} label="Creative Page" onClick={() => setActivePage('creative-page')} />
              <SidebarButton active={activePage === 'photography-page'} label="Photography Page" onClick={() => setActivePage('photography-page')} />
              <SidebarButton active={activePage === 'case-study-ui'} label="Case Study Defaults" onClick={() => setActivePage('case-study-ui')} />
              <SidebarButton active={activePage === 'design-system'} label="Design System" onClick={() => setActivePage('design-system')} />
              <SidebarButton active={activePage === 'motion'} label="Motion" onClick={() => setActivePage('motion')} />
            </SidebarGroup>

            <SidebarGroup title="WORK CASE STUDIES">
              {groupedCaseStudies.work.map((item) => (
                <SidebarButton
                  key={item.slug}
                  active={activePage === `case-study:${item.slug}`}
                  label={item.title}
                  onClick={() => setActivePage(`case-study:${item.slug}` as PageKey)}
                />
              ))}
              <SidebarButton active={false} label="+ Add Work Case Study" onClick={() => addCaseStudy('work')} />
            </SidebarGroup>

            <SidebarGroup title="MIXED MEDIA">
              {groupedCaseStudies.mixedMedia.map((item) => (
                <SidebarButton
                  key={item.slug}
                  active={activePage === `case-study:${item.slug}`}
                  label={item.title}
                  onClick={() => setActivePage(`case-study:${item.slug}` as PageKey)}
                />
              ))}
              <SidebarButton active={false} label="+ Add Mixed Media" onClick={() => addCaseStudy('mixed-media')} />
            </SidebarGroup>

            <SidebarGroup title="BRANDING">
              {groupedCaseStudies.branding.map((item) => (
                <SidebarButton
                  key={item.slug}
                  active={activePage === `case-study:${item.slug}`}
                  label={item.title}
                  onClick={() => setActivePage(`case-study:${item.slug}` as PageKey)}
                />
              ))}
              <SidebarButton active={false} label="+ Add Branding" onClick={() => addCaseStudy('branding')} />
            </SidebarGroup>
          </div>
        </aside>

        <fieldset disabled={!editingEnabled || saving || !localWriteEnabled} style={{ display: 'grid', gap: '24px', opacity: !editingEnabled || !localWriteEnabled ? 0.58 : 1, transition: 'opacity 0.18s ease', minWidth: 0 }}>
          {activePage === 'homepage' ? (
            <HomepageEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'about-page' ? (
            <AboutPageEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'work-page' ? (
            <WorkPageEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'creative-page' ? (
            <CreativePageEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'photography-page' ? (
            <PhotographyPageEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'case-study-ui' ? (
            <CaseStudyUiEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'design-system' ? (
            <DesignSystemEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'motion' ? (
            <MotionEditor content={content} updateSection={updateSection} />
          ) : null}
          {activeCaseStudy ? (
            <CaseStudyEditor
              caseStudy={activeCaseStudy}
              defaultUiCopy={content.copy.caseStudy}
              localWriteEnabled={localWriteEnabled}
              onChange={(updater) => updateCaseStudy(activeCaseStudy.slug, updater)}
              onDelete={() => removeCaseStudy(activeCaseStudy.slug)}
            />
          ) : null}
        </fieldset>
      </div>
    </div>
  )
}

function HomepageEditor({
  content,
  updateSection,
}: {
  content: SiteContent
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
}) {
  return (
    <>
      <SectionFrame title="Homepage Hero">
        <HeroStageListEditor
          items={content.copy.home.heroStages}
          onChange={(heroStages) => updateSection('copy', {
            ...content.copy,
            home: { ...content.copy.home, heroStages },
          })}
        />
      </SectionFrame>

      <SectionFrame title="Homepage">
        <Field label="Selected Work Heading">
          <input
            value={content.home.selectedWork.heading}
            onChange={(event) => updateSection('home', {
              ...content.home,
              selectedWork: { ...content.home.selectedWork, heading: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Selected Work Body">
          <textarea
            value={content.home.selectedWork.body}
            onChange={(event) => updateSection('home', {
              ...content.home,
              selectedWork: { ...content.home.selectedWork, body: event.target.value },
            })}
            style={inputStyle(true)}
          />
        </Field>
        <WorkProjectListEditor
          title="Selected Work Items"
          items={content.home.selectedWork.items}
          onChange={(items) => updateSection('home', {
            ...content.home,
            selectedWork: { ...content.home.selectedWork, items },
          })}
        />
      </SectionFrame>

      <SectionFrame title="Homepage More Work">
        <Field label="More Work Heading">
          <input
            value={content.home.moreWork.heading}
            onChange={(event) => updateSection('home', {
              ...content.home,
              moreWork: { ...content.home.moreWork, heading: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="More Work Body">
          <textarea
            value={content.home.moreWork.body}
            onChange={(event) => updateSection('home', {
              ...content.home,
              moreWork: { ...content.home.moreWork, body: event.target.value },
            })}
            style={inputStyle(true)}
          />
        </Field>
        <WorkProjectListEditor
          title="More Work Items"
          items={content.home.moreWork.items}
          onChange={(items) => updateSection('home', {
            ...content.home,
            moreWork: { ...content.home.moreWork, items },
          })}
        />
      </SectionFrame>

      <SectionFrame title="Homepage About Block">
        <Field label="About Eyebrow">
          <input
            value={content.copy.home.aboutEyebrow}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              home: { ...content.copy.home, aboutEyebrow: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="About Title HTML">
          <textarea
            value={content.copy.home.aboutTitleHtml}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              home: { ...content.copy.home, aboutTitleHtml: event.target.value },
            })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="Body Copy">
          <textarea
            value={content.home.about.body}
            onChange={(event) => updateSection('home', {
              ...content.home,
              about: { ...content.home.about, body: event.target.value },
            })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="Spotify Resting Label">
          <input
            value={content.home.about.spotifyLabel}
            onChange={(event) => updateSection('home', {
              ...content.home,
              about: { ...content.home.about, spotifyLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Read More Label">
          <input
            value={content.copy.home.aboutReadMoreLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              home: { ...content.copy.home, aboutReadMoreLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <ListeningCardStyleEditor
          title="Listening Card Style"
          styleSettings={content.design.listeningCard}
          onChange={(styleSettings) => updateSection('design', { ...content.design, listeningCard: styleSettings })}
        />
        <CardStyleEditor
          title="Supporting Card Style"
          styleSettings={content.design.supportingCards}
          onChange={(styleSettings) => updateSection('design', { ...content.design, supportingCards: styleSettings })}
        />
      </SectionFrame>

      <SectionFrame title="Homepage Photography Block">
        <Field label="Photography Eyebrow">
          <input
            value={content.copy.home.photographyEyebrow}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              home: { ...content.copy.home, photographyEyebrow: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Photography Title HTML">
          <textarea
            value={content.copy.home.photographyTitleHtml}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              home: { ...content.copy.home, photographyTitleHtml: event.target.value },
            })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="Photography Body">
          <textarea
            value={content.copy.home.photographyBody}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              home: { ...content.copy.home, photographyBody: event.target.value },
            })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="Photography CTA Label">
          <input
            value={content.copy.home.photographyCtaLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              home: { ...content.copy.home, photographyCtaLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
      </SectionFrame>

      <SectionFrame title="Homepage Contact Block">
        <Field label="Contact Title">
          <input
            value={content.copy.home.contactTitle}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              home: { ...content.copy.home, contactTitle: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Contact Accent">
          <input
            value={content.copy.home.contactAccent}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              home: { ...content.copy.home, contactAccent: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <LinkItemListEditor
          title="Contact Links"
          items={content.copy.home.contactLinks}
          onChange={(contactLinks) => updateSection('copy', {
            ...content.copy,
            home: { ...content.copy.home, contactLinks },
          })}
        />
      </SectionFrame>
    </>
  )
}

function AboutPageEditor({
  content,
  updateSection,
}: {
  content: SiteContent
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
}) {
  return (
    <>
      <SectionFrame title="About Page Hero">
        <Field label="Hero Eyebrow">
          <input
            value={content.copy.aboutPage.heroEyebrow}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, heroEyebrow: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Hero Title HTML">
          <textarea
            value={content.copy.aboutPage.heroTitleHtml}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, heroTitleHtml: event.target.value },
            })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="Hero Body">
          <textarea
            value={content.aboutPage.heroBody}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, heroBody: event.target.value })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="CV Button Label">
          <input
            value={content.copy.aboutPage.cvLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, cvLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Scroll Label">
          <input
            value={content.copy.aboutPage.scrollLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, scrollLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Who I Am Label">
          <input
            value={content.copy.aboutPage.whoIAmLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, whoIAmLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Who I Am Body">
          <textarea
            value={content.aboutPage.whoIAm}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, whoIAm: event.target.value })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="On Rotation Label">
          <input
            value={content.copy.aboutPage.onRotationLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, onRotationLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
      </SectionFrame>

      <SectionFrame title="About Page Lists">
        <Field label="Experience Label">
          <input
            value={content.copy.aboutPage.experienceLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, experienceLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <EntryListEditor
          title="Experience"
          items={content.aboutPage.experience}
          onChange={(items) => updateSection('aboutPage', { ...content.aboutPage, experience: items })}
        />
        <Field label="Professional Activities Label HTML">
          <textarea
            value={content.copy.aboutPage.professionalActivitiesLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, professionalActivitiesLabel: event.target.value },
            })}
            style={inputStyle(true)}
          />
        </Field>
        <EntryListEditor
          title="Professional Activities"
          items={content.aboutPage.professionalActivities}
          onChange={(items) => updateSection('aboutPage', { ...content.aboutPage, professionalActivities: items })}
        />
        <Field label="Education Label">
          <input
            value={content.copy.aboutPage.educationLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, educationLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <EntryListEditor
          title="Education"
          items={content.aboutPage.education}
          onChange={(items) => updateSection('aboutPage', { ...content.aboutPage, education: items })}
        />
      </SectionFrame>

      <SectionFrame title="About Page Extras">
        <Field label="Tools Label">
          <input
            value={content.copy.aboutPage.toolsLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              aboutPage: { ...content.copy.aboutPage, toolsLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Tools (one per line)">
          <textarea
            value={toolsToText(content.aboutPage.tools)}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, tools: textToTools(event.target.value) })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="Right Now Heading">
          <input
            value={content.aboutPage.nowHeading}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, nowHeading: event.target.value })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Right Now Description">
          <textarea
            value={content.aboutPage.nowDescription}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, nowDescription: event.target.value })}
            style={inputStyle(true)}
          />
        </Field>
        <ListeningCardStyleEditor
          title="Listening Card Style"
          styleSettings={content.design.listeningCard}
          onChange={(styleSettings) => updateSection('design', { ...content.design, listeningCard: styleSettings })}
        />
        <NowCardStyleEditor
          styleSettings={content.design.nowCards}
          onChange={(styleSettings) => updateSection('design', { ...content.design, nowCards: styleSettings })}
        />
        <NowCardListEditor
          items={content.aboutPage.nowCards}
          onChange={(items) => updateSection('aboutPage', { ...content.aboutPage, nowCards: items })}
        />
      </SectionFrame>

      <SectionFrame title="About Page Contact">
        <Field label="Contact Title HTML">
          <textarea
            value={content.aboutPage.contactTitleHtml}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, contactTitleHtml: event.target.value })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="Contact Body">
          <textarea
            value={content.aboutPage.contactBody}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, contactBody: event.target.value })}
            style={inputStyle(true)}
          />
        </Field>
        <LinkItemListEditor
          title="Contact Links"
          items={content.aboutPage.contactLinks}
          onChange={(contactLinks) => updateSection('aboutPage', { ...content.aboutPage, contactLinks })}
        />
      </SectionFrame>
    </>
  )
}

function WorkPageEditor({
  content,
  updateSection,
}: {
  content: SiteContent
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
}) {
  return (
    <>
      <SectionFrame title="Work Page">
        <Field label="Eyebrow">
          <input
            value={content.copy.workPage.eyebrow}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              workPage: { ...content.copy.workPage, eyebrow: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Hero Title">
          <input
            value={content.workPage.heroTitle}
            onChange={(event) => updateSection('workPage', { ...content.workPage, heroTitle: event.target.value })}
            style={inputStyle()}
          />
        </Field>
        <Field label="Hero Body">
          <textarea
            value={content.workPage.heroBody}
            onChange={(event) => updateSection('workPage', { ...content.workPage, heroBody: event.target.value })}
            style={inputStyle(true)}
          />
        </Field>
        <WorkProjectListEditor
          title="Work Projects"
          items={content.workPage.projects}
          onChange={(items) => updateSection('workPage', { ...content.workPage, projects: items })}
        />
        <Field label="Empty State Label">
          <input
            value={content.copy.workPage.emptyStateLabel}
            onChange={(event) => updateSection('copy', {
              ...content.copy,
              workPage: { ...content.copy.workPage, emptyStateLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
        <CardStyleEditor
          title="Work Card Style"
          styleSettings={content.design.supportingCards}
          onChange={(styleSettings) => updateSection('design', { ...content.design, supportingCards: styleSettings })}
        />
      </SectionFrame>
    </>
  )
}

function CreativePageEditor({
  content,
  updateSection,
}: {
  content: SiteContent
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
}) {
  return (
    <SectionFrame title="Creative Page">
      <Field label="Eyebrow">
        <input
          value={content.copy.creativePage.eyebrow}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, eyebrow: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Hero Title">
        <input
          value={content.copy.creativePage.heroTitle}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, heroTitle: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Hero Body">
        <textarea
          value={content.copy.creativePage.heroBody}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, heroBody: event.target.value },
          })}
          style={inputStyle(true)}
        />
      </Field>
      <Field label="Photography Label">
        <input
          value={content.copy.creativePage.photographyLabel}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, photographyLabel: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Photography Count">
        <input
          value={content.copy.creativePage.photographyCount}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, photographyCount: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Mixed Media Label">
        <input
          value={content.copy.creativePage.mixedMediaLabel}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, mixedMediaLabel: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Mixed Media Count">
        <input
          value={content.copy.creativePage.mixedMediaCount}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, mixedMediaCount: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Branding Label">
        <input
          value={content.copy.creativePage.brandingLabel}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, brandingLabel: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Branding Count">
        <input
          value={content.copy.creativePage.brandingCount}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, brandingCount: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Mixed Media Index Title">
        <input
          value={content.copy.creativePage.mixedMediaIndexTitle}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, mixedMediaIndexTitle: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Branding Index Title">
        <input
          value={content.copy.creativePage.brandingIndexTitle}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, brandingIndexTitle: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Creative Back Label">
        <input
          value={content.copy.creativePage.backLabel}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, backLabel: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
      <Field label="Photography Back Label">
        <input
          value={content.copy.creativePage.photoBackLabel}
          onChange={(event) => updateSection('copy', {
            ...content.copy,
            creativePage: { ...content.copy.creativePage, photoBackLabel: event.target.value },
          })}
          style={inputStyle()}
        />
      </Field>
    </SectionFrame>
  )
}

function PhotographyPageEditor({
  content,
  updateSection,
}: {
  content: SiteContent
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
}) {
  return (
    <SectionFrame title="Photography Page">
      <Field label="Hero Title">
        <input
          value={content.photography.heroTitle}
          onChange={(event) => updateSection('photography', { ...content.photography, heroTitle: event.target.value })}
          style={inputStyle()}
        />
      </Field>
      <PhotographyCityListEditor
        items={content.photography.cities}
        onChange={(items) => updateSection('photography', { ...content.photography, cities: items })}
      />
      <PhotographyGalleryListEditor
        items={content.photography.galleries}
        onChange={(items) => updateSection('photography', { ...content.photography, galleries: items })}
      />
      <PhotographyCardStyleEditor
        title="Photography Card Style"
        styleSettings={content.design.photographyCards}
        onChange={(styleSettings) => updateSection('design', { ...content.design, photographyCards: styleSettings })}
      />
      <GalleryStyleEditor
        styleSettings={content.design.gallery}
        onChange={(styleSettings) => updateSection('design', { ...content.design, gallery: styleSettings })}
      />
    </SectionFrame>
  )
}

function CaseStudyUiEditor({
  content,
  updateSection,
}: {
  content: SiteContent
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
}) {
  const ui = content.copy.caseStudy

  function updateCaseStudyCopy(next: typeof ui) {
    updateSection('copy', { ...content.copy, caseStudy: next })
  }

  return (
    <>
      <SectionFrame title="Case Study Default Labels">
        <Field label="Problem Label">
          <input value={ui.problemLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, problemLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Role Label">
          <input value={ui.roleLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, roleLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Research Label">
          <input value={ui.researchLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, researchLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Challenge Label">
          <input value={ui.challengeLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, challengeLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Process Label">
          <input value={ui.processLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, processLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Solution Label">
          <input value={ui.solutionLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, solutionLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Outcomes Label">
          <input value={ui.outcomesLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, outcomesLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Key Insight Label">
          <input value={ui.keyInsightLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, keyInsightLabel: event.target.value })} style={inputStyle()} />
        </Field>
      </SectionFrame>

      <SectionFrame title="Case Study Default Nav Labels">
        <Field label="Nav Problem Label">
          <input value={ui.navProblemLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, navProblemLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Nav Role Label">
          <input value={ui.navRoleLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, navRoleLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Nav Research Label">
          <input value={ui.navResearchLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, navResearchLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Nav Challenge Label">
          <input value={ui.navChallengeLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, navChallengeLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Nav Process Label">
          <input value={ui.navProcessLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, navProcessLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Nav Solution Label">
          <input value={ui.navSolutionLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, navSolutionLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Nav Outcomes Label">
          <input value={ui.navOutcomesLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, navOutcomesLabel: event.target.value })} style={inputStyle()} />
        </Field>
      </SectionFrame>

      <SectionFrame title="Case Study Default Fallback Copy">
        <Field label="Previous Label">
          <input value={ui.prevLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, prevLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Next Label">
          <input value={ui.nextLabel} onChange={(event) => updateCaseStudyCopy({ ...ui, nextLabel: event.target.value })} style={inputStyle()} />
        </Field>
        <Field label="Default Problem Copy">
          <textarea value={ui.defaultProblem} onChange={(event) => updateCaseStudyCopy({ ...ui, defaultProblem: event.target.value })} style={inputStyle(true)} />
        </Field>
        <Field label="Default Role Copy">
          <textarea value={ui.defaultRole} onChange={(event) => updateCaseStudyCopy({ ...ui, defaultRole: event.target.value })} style={inputStyle(true)} />
        </Field>
      </SectionFrame>
    </>
  )
}

function DesignSystemEditor({
  content,
  updateSection,
}: {
  content: SiteContent
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
}) {
  const tokens = [
    ['--color-bg', '#0d0d0d'],
    ['--color-card', '#111111'],
    ['--color-white', '#f5f2ed'],
    ['--color-body', '#999999'],
    ['--color-label', '#666666'],
    ['--color-red', '#FF3120'],
    ['--color-divider', '#1f1f1f'],
    ['--text-h1', '52px'],
    ['--text-h2', '38px'],
    ['--text-h3', '24px'],
    ['--text-eyebrow', '14px'],
    ['--text-body-lg', '18px'],
    ['--text-body', '16px'],
    ['--text-meta', '14px'],
  ]

  return (
    <>
      <SectionFrame title="Design System Reference">
        <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.7 }}>
          These are the current design-system tokens from the site. Use them directly in the style fields below if you want cards and galleries to stay aligned with the existing visual system.
        </p>
        <div style={{ display: 'grid', gap: '10px' }}>
          {tokens.map(([name, value]) => (
            <div key={name} className="flex items-center justify-between" style={{ gap: '16px', border: '1px solid #1f1f1f', padding: '12px 14px' }}>
              <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#f5f2ed' }}>{name}</span>
              <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999' }}>{value}</span>
            </div>
          ))}
        </div>
      </SectionFrame>

      <SectionFrame title="Global Card Controls">
        <CardStyleEditor
          title="Supporting Cards"
          styleSettings={content.design.supportingCards}
          onChange={(styleSettings) => updateSection('design', { ...content.design, supportingCards: styleSettings })}
        />
        <PhotographyCardStyleEditor
          title="Photography Cards"
          styleSettings={content.design.photographyCards}
          onChange={(styleSettings) => updateSection('design', { ...content.design, photographyCards: styleSettings })}
        />
        <GalleryStyleEditor
          styleSettings={content.design.gallery}
          onChange={(styleSettings) => updateSection('design', { ...content.design, gallery: styleSettings })}
        />
        <NowCardStyleEditor
          styleSettings={content.design.nowCards}
          onChange={(styleSettings) => updateSection('design', { ...content.design, nowCards: styleSettings })}
        />
        <ListeningCardStyleEditor
          title="Listening Cards"
          styleSettings={content.design.listeningCard}
          onChange={(styleSettings) => updateSection('design', { ...content.design, listeningCard: styleSettings })}
        />
        <AudioSettingsEditor
          settings={content.design.audio}
          onChange={(audio) => updateSection('design', { ...content.design, audio })}
        />
      </SectionFrame>
    </>
  )
}

function MotionEditor({
  content,
  updateSection,
}: {
  content: SiteContent
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
}) {
  return (
    <>
      <SectionFrame title="Motion Controls">
        <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.8 }}>
          These sliders control the live timing and movement values used across reveals, card entrances, eyebrows, and the homepage intro overlay.
        </p>
        <MotionSettingsEditor
          settings={content.design.motion}
          onChange={(motion) => updateSection('design', { ...content.design, motion })}
        />
      </SectionFrame>
    </>
  )
}

function CaseStudyEditor({
  caseStudy,
  defaultUiCopy,
  localWriteEnabled,
  onChange,
  onDelete,
}: {
  caseStudy: CaseStudyContent
  defaultUiCopy: SiteContent['copy']['caseStudy']
  localWriteEnabled: boolean
  onChange: (updater: (item: CaseStudyContent) => CaseStudyContent) => void
  onDelete: () => void
}) {
  const caseStudyUi = caseStudy.uiCopy ?? defaultUiCopy
  const mediaBlocks = deriveCaseStudyMediaBlocks(caseStudy)

  function updateMediaBlocks(nextBlocks: CaseStudyMediaBlock[]) {
    onChange((current) => ({ ...current, mediaBlocks: nextBlocks }))
  }

  function updateMediaBlock(blockId: string, updater: (block: CaseStudyMediaBlock) => CaseStudyMediaBlock) {
    updateMediaBlocks(mediaBlocks.map((block) => (block.id === blockId ? normalizeMediaBlock(updater(block)) : block)))
  }

  function addMediaBlock(section: CaseStudyMediaBlockSection) {
    updateMediaBlocks([...mediaBlocks, createMediaBlockDraft(section)])
  }

  function removeMediaBlock(blockId: string) {
    const block = mediaBlocks.find((item) => item.id === blockId)
    if (!block) return

    onChange((current) => {
      const nextMediaBlocks = mediaBlocks.filter((item) => item.id !== blockId)
      const hasRemainingSectionBlocks = nextMediaBlocks.some((item) => item.section === block.section)

      if (hasRemainingSectionBlocks) {
        return {
          ...current,
          mediaBlocks: nextMediaBlocks,
        }
      }

      if (block.section === 'research') {
        return {
          ...current,
          researchImage: undefined,
          mediaBlocks: nextMediaBlocks,
        }
      }

      if (block.section === 'challenge') {
        return {
          ...current,
          challengeImages: undefined,
          mediaBlocks: nextMediaBlocks,
        }
      }

      if (block.section === 'solution') {
        return {
          ...current,
          solutionHeroImage: undefined,
          solutionImages: undefined,
          mediaBlocks: nextMediaBlocks,
        }
      }

      return {
        ...current,
        mediaBlocks: nextMediaBlocks,
      }
    })
  }

  function moveMediaBlock(blockId: string, direction: -1 | 1) {
    const index = mediaBlocks.findIndex((block) => block.id === blockId)
    if (index === -1) return
    updateMediaBlocks(moveItem(mediaBlocks, index, direction))
  }

  return (
    <>
      <SectionFrame title={`${caseStudy.title} · Basics`}>
        <button
          type="button"
          onClick={onDelete}
          className="font-mono"
          style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          REMOVE CASE STUDY
        </button>
        <Field label="Section">
          <select
            value={caseStudy.section}
            onChange={(event) => onChange((current) => ({ ...current, section: event.target.value as CaseStudySection }))}
            style={inputStyle()}
          >
            <option value="work">Work</option>
            <option value="mixed-media">Mixed Media</option>
            <option value="branding">Branding</option>
          </select>
        </Field>
        <Field label="Slug">
          <input value={caseStudy.slug} onChange={(event) => onChange((current) => ({ ...current, slug: event.target.value }))} style={inputStyle()} />
        </Field>
        <Field label="Title">
          <input value={caseStudy.title} onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} style={inputStyle()} />
        </Field>
        <Field label="One-liner">
          <textarea value={caseStudy.oneliner} onChange={(event) => onChange((current) => ({ ...current, oneliner: event.target.value }))} style={inputStyle(true)} />
        </Field>
        <Field label="Type">
          <input value={caseStudy.type} onChange={(event) => onChange((current) => ({ ...current, type: event.target.value }))} style={inputStyle()} />
        </Field>
        <Field label="Tags (comma separated)">
          <input value={tagsToText(caseStudy.tags)} onChange={(event) => onChange((current) => ({ ...current, tags: textToTags(event.target.value) }))} style={inputStyle()} />
        </Field>
      </SectionFrame>

      <SectionFrame title={`${caseStudy.title} · Navigation`}>
        <ProjectLinkEditor
          label="Previous Project"
          value={caseStudy.prev}
          onChange={(value) => onChange((current) => ({ ...current, prev: value }))}
        />
        <ProjectLinkEditor
          label="Next Project"
          value={caseStudy.next}
          onChange={(value) => onChange((current) => ({ ...current, next: value }))}
        />
        <Field label="Back Href">
          <input value={caseStudy.backHref ?? ''} onChange={(event) => onChange((current) => ({ ...current, backHref: event.target.value || undefined }))} style={inputStyle()} />
        </Field>
        <Field label="Back Label">
          <input value={caseStudy.backLabel ?? ''} onChange={(event) => onChange((current) => ({ ...current, backLabel: event.target.value || undefined }))} style={inputStyle()} />
        </Field>
      </SectionFrame>

      <SectionFrame title={`${caseStudy.title} · Media`}>
        <SourcePathField
          label="Hero Image"
          value={caseStudy.heroImage ?? ''}
          localWriteEnabled={localWriteEnabled}
          onChange={(value) => onChange((current) => ({ ...current, heroImage: value || undefined }))}
        />
        <MediaSlotEditor
          title="Hero Layout"
          value={caseStudy.mediaSettings?.hero}
          defaultHeight="280px"
          onChange={(value) => onChange((current) => ({
            ...current,
            mediaSettings: { ...current.mediaSettings, hero: value } satisfies CaseStudyMediaSettings,
          }))}
        />
        <Field label="Card Image Position (for listing cards)">
          <input
            value={caseStudy.cardImagePosition ?? ''}
            onChange={(event) => onChange((current) => ({ ...current, cardImagePosition: event.target.value || undefined }))}
            style={inputStyle()}
          />
        </Field>
        <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.7 }}>
          Use media blocks for UX screenshots. Set a narrower width plus portrait-style aspect ratios for app screens, or use full-width blocks for wider flows and comparison layouts.
        </p>
        <MediaBlockListEditor
          blocks={mediaBlocks}
          localWriteEnabled={localWriteEnabled}
          onAdd={addMediaBlock}
          onMove={moveMediaBlock}
          onChange={updateMediaBlock}
          onRemove={removeMediaBlock}
        />
      </SectionFrame>

      <SectionFrame title={`${caseStudy.title} · Narrative`}>
        <HeadlineBodyEditor
          title="Problem"
          headline={caseStudy.problemHeadline ?? ''}
          body={caseStudy.problem ?? ''}
          onHeadlineChange={(value) => onChange((current) => ({ ...current, problemHeadline: value || undefined }))}
          onBodyChange={(value) => onChange((current) => ({ ...current, problem: value || undefined }))}
        />
        <HeadlineBodyEditor
          title="Role"
          headline={caseStudy.roleHeadline ?? ''}
          body={caseStudy.role ?? ''}
          onHeadlineChange={(value) => onChange((current) => ({ ...current, roleHeadline: value || undefined }))}
          onBodyChange={(value) => onChange((current) => ({ ...current, role: value || undefined }))}
        />
        <HeadlineBodyEditor
          title="Research"
          headline={caseStudy.researchHeadline ?? ''}
          body={caseStudy.research ?? ''}
          onHeadlineChange={(value) => onChange((current) => ({ ...current, researchHeadline: value || undefined }))}
          onBodyChange={(value) => onChange((current) => ({ ...current, research: value || undefined }))}
        />
        <Field label="Pull Quote">
          <textarea value={caseStudy.pullQuote ?? ''} onChange={(event) => onChange((current) => ({ ...current, pullQuote: event.target.value || undefined }))} style={inputStyle(true)} />
        </Field>
        <HeadlineBodyEditor
          title="Challenge"
          headline={caseStudy.challengeHeadline ?? ''}
          body={caseStudy.challenge ?? ''}
          onHeadlineChange={(value) => onChange((current) => ({ ...current, challengeHeadline: value || undefined }))}
          onBodyChange={(value) => onChange((current) => ({ ...current, challenge: value || undefined }))}
        />
        <HeadlineBodyEditor
          title="Process"
          headline={caseStudy.processHeadline ?? ''}
          body={caseStudy.process ?? ''}
          onHeadlineChange={(value) => onChange((current) => ({ ...current, processHeadline: value || undefined }))}
          onBodyChange={(value) => onChange((current) => ({ ...current, process: value || undefined }))}
        />
        <Field label="Usability Testing">
          <textarea value={caseStudy.usabilityTesting ?? ''} onChange={(event) => onChange((current) => ({ ...current, usabilityTesting: event.target.value || undefined }))} style={inputStyle(true)} />
        </Field>
        <HeadlineBodyEditor
          title="Solution"
          headline={caseStudy.solutionHeadline ?? ''}
          body={caseStudy.solution ?? ''}
          onHeadlineChange={(value) => onChange((current) => ({ ...current, solutionHeadline: value || undefined }))}
          onBodyChange={(value) => onChange((current) => ({ ...current, solution: value || undefined }))}
        />
        <HeadlineBodyEditor
          title="Outcomes"
          headline={caseStudy.outcomesHeadline ?? ''}
          body={caseStudy.outcomes ?? ''}
          onHeadlineChange={(value) => onChange((current) => ({ ...current, outcomesHeadline: value || undefined }))}
          onBodyChange={(value) => onChange((current) => ({ ...current, outcomes: value || undefined }))}
        />
      </SectionFrame>

      <SectionFrame title={`${caseStudy.title} · UI Copy`}>
        <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#999999', lineHeight: 1.7 }}>
          These labels are specific to this case study. They start from the shared defaults, then save into this project once you edit them.
        </p>
        <Field label="Problem Label">
          <input value={caseStudyUi.problemLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, problemLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Role Label">
          <input value={caseStudyUi.roleLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, roleLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Research Label">
          <input value={caseStudyUi.researchLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, researchLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Challenge Label">
          <input value={caseStudyUi.challengeLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, challengeLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Process Label">
          <input value={caseStudyUi.processLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, processLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Solution Label">
          <input value={caseStudyUi.solutionLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, solutionLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Outcomes Label">
          <input value={caseStudyUi.outcomesLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, outcomesLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Key Insight Label">
          <input value={caseStudyUi.keyInsightLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, keyInsightLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Previous Label">
          <input value={caseStudyUi.prevLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, prevLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Next Label">
          <input value={caseStudyUi.nextLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, nextLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Nav Problem Label">
          <input value={caseStudyUi.navProblemLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, navProblemLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Nav Role Label">
          <input value={caseStudyUi.navRoleLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, navRoleLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Nav Research Label">
          <input value={caseStudyUi.navResearchLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, navResearchLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Nav Challenge Label">
          <input value={caseStudyUi.navChallengeLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, navChallengeLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Nav Process Label">
          <input value={caseStudyUi.navProcessLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, navProcessLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Nav Solution Label">
          <input value={caseStudyUi.navSolutionLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, navSolutionLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Nav Outcomes Label">
          <input value={caseStudyUi.navOutcomesLabel} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, navOutcomesLabel: event.target.value } }))} style={inputStyle()} />
        </Field>
        <Field label="Default Problem Copy">
          <textarea value={caseStudyUi.defaultProblem} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, defaultProblem: event.target.value } }))} style={inputStyle(true)} />
        </Field>
        <Field label="Default Role Copy">
          <textarea value={caseStudyUi.defaultRole} onChange={(event) => onChange((current) => ({ ...current, uiCopy: { ...caseStudyUi, defaultRole: event.target.value } }))} style={inputStyle(true)} />
        </Field>
      </SectionFrame>
    </>
  )
}

function HeadlineBodyEditor({
  title,
  headline,
  body,
  onHeadlineChange,
  onBodyChange,
}: {
  title: string
  headline: string
  body: string
  onHeadlineChange: (value: string) => void
  onBodyChange: (value: string) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
        {title.toUpperCase()}
      </div>
      <Field label={`${title} Headline`}>
        <textarea value={headline} onChange={(event) => onHeadlineChange(event.target.value)} style={inputStyle(true)} />
      </Field>
      <Field label={`${title} Body`}>
        <textarea value={body} onChange={(event) => onBodyChange(event.target.value)} style={inputStyle(true)} />
      </Field>
    </div>
  )
}

function ProjectLinkEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: ProjectLink | null
  onChange: (value: ProjectLink | null) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <label className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input type="checkbox" checked={value !== null} onChange={(event) => onChange(event.target.checked ? { slug: '', title: '' } : null)} />
        {label}
      </label>
      {value ? (
        <>
          <Field label={`${label} Slug`}>
            <input value={value.slug} onChange={(event) => onChange({ ...value, slug: event.target.value })} style={inputStyle()} />
          </Field>
          <Field label={`${label} Title`}>
            <input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} style={inputStyle()} />
          </Field>
        </>
      ) : null}
    </div>
  )
}

function ImagePairEditor({
  label,
  images,
  onChange,
}: {
  label: string
  images: string[]
  onChange: (images: string[]) => void
}) {
  const first = images[0] ?? ''
  const second = images[1] ?? ''

  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
        {label.toUpperCase()}
      </div>
      <Field label={`${label} 1`}>
        <input value={first} onChange={(event) => onChange(toPair(event.target.value, second))} style={inputStyle()} />
      </Field>
      <Field label={`${label} 2`}>
        <input value={second} onChange={(event) => onChange(toPair(first, event.target.value))} style={inputStyle()} />
      </Field>
    </div>
  )
}

function MediaSlotEditor({
  title,
  value,
  defaultHeight,
  onChange,
}: {
  title: string
  value: CaseStudyMediaSlotSettings | undefined
  defaultHeight: string
  onChange: (value: CaseStudyMediaSlotSettings | undefined) => void
}) {
  const next = value ?? {}

  function update(patch: Partial<CaseStudyMediaSlotSettings>) {
    const merged = { ...next, ...patch }
    const hasValues = Object.values(merged).some(Boolean)
    onChange(hasValues ? merged : undefined)
  }

  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
        {title.toUpperCase()}
      </div>
      <Field label={`Fit (${title})`}>
        <select value={next.fit ?? 'contain'} onChange={(event) => update({ fit: event.target.value as CaseStudyMediaSlotSettings['fit'] })} style={inputStyle()}>
          <option value="contain">contain</option>
          <option value="cover">cover</option>
        </select>
      </Field>
      <Field label={`Position (${title})`}>
        <input value={next.position ?? ''} onChange={(event) => update({ position: event.target.value || undefined })} placeholder="center center / 50% 20%" style={inputStyle()} />
      </Field>
      <Field label={`Height (${title})`}>
        <input value={next.height ?? ''} onChange={(event) => update({ height: event.target.value || undefined })} placeholder={defaultHeight} style={inputStyle()} />
      </Field>
      <Field label={`Background (${title})`}>
        <input value={next.background ?? ''} onChange={(event) => update({ background: event.target.value || undefined })} placeholder="#161616" style={inputStyle()} />
      </Field>
    </div>
  )
}

function MediaPairEditor({
  title,
  value,
  defaultHeight,
  onChange,
}: {
  title: string
  value: CaseStudyImagePairSettings | undefined
  defaultHeight: string
  onChange: (value: CaseStudyImagePairSettings | undefined) => void
}) {
  const next = value ?? {}

  function update(patch: Partial<CaseStudyImagePairSettings>) {
    const merged = { ...next, ...patch }
    const hasValues = Object.values(merged).some(Boolean)
    onChange(hasValues ? merged : undefined)
  }

  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
        {title.toUpperCase()}
      </div>
      <Field label={`Fit (${title})`}>
        <select value={next.fit ?? 'contain'} onChange={(event) => update({ fit: event.target.value as CaseStudyImagePairSettings['fit'] })} style={inputStyle()}>
          <option value="contain">contain</option>
          <option value="cover">cover</option>
        </select>
      </Field>
      <Field label={`${title} Image 1 Position`}>
        <input value={next.firstPosition ?? ''} onChange={(event) => update({ firstPosition: event.target.value || undefined })} placeholder="center center / 50% 20%" style={inputStyle()} />
      </Field>
      <Field label={`${title} Image 2 Position`}>
        <input value={next.secondPosition ?? ''} onChange={(event) => update({ secondPosition: event.target.value || undefined })} placeholder="center center / 50% 20%" style={inputStyle()} />
      </Field>
      <Field label={`Height (${title})`}>
        <input value={next.height ?? ''} onChange={(event) => update({ height: event.target.value || undefined })} placeholder={defaultHeight} style={inputStyle()} />
      </Field>
      <Field label={`Gap (${title})`}>
        <input value={next.gap ?? ''} onChange={(event) => update({ gap: event.target.value || undefined })} placeholder="2px" style={inputStyle()} />
      </Field>
      <Field label={`Background (${title})`}>
        <input value={next.background ?? ''} onChange={(event) => update({ background: event.target.value || undefined })} placeholder="#161616" style={inputStyle()} />
      </Field>
    </div>
  )
}

function SourcePathField({
  label,
  value,
  localWriteEnabled,
  onChange,
}: {
  label: string
  value: string
  localWriteEnabled: boolean
  onChange: (value: string) => void
}) {
  const [pickerError, setPickerError] = useState<string | null>(null)

  async function handleBrowse() {
    setPickerError(null)

    const response = await fetch('/api/admin/file-picker', { method: 'POST' })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setPickerError(data?.error ?? 'Could not open Finder.')
      return
    }

    if (data?.cancelled || !data?.src) {
      return
    }

    onChange(data.src)
  }

  return (
    <Field label={label}>
      <div style={{ display: 'grid', gap: '8px' }}>
        <div className="flex" style={{ gap: '8px', alignItems: 'stretch' }}>
          <input value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle()} />
          <button
            type="button"
            onClick={handleBrowse}
            disabled={!localWriteEnabled}
            className="font-mono"
            style={{
              background: 'transparent',
              border: '1px solid #2a2a2a',
              color: localWriteEnabled ? '#f5f2ed' : '#444444',
              padding: '12px 14px',
              cursor: localWriteEnabled ? 'pointer' : 'default',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
            }}
          >
            BROWSE
          </button>
        </div>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', lineHeight: 1.6 }}>
          Opens Finder locally and fills a `/...` path from this project’s `public` folder.
        </span>
        {pickerError ? (
          <p className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#FF3120', lineHeight: 1.6, margin: 0 }}>
            {pickerError}
          </p>
        ) : null}
      </div>
    </Field>
  )
}

function MediaBlockListEditor({
  blocks,
  localWriteEnabled,
  onAdd,
  onMove,
  onChange,
  onRemove,
}: {
  blocks: CaseStudyMediaBlock[]
  localWriteEnabled: boolean
  onAdd: (section: CaseStudyMediaBlockSection) => void
  onMove: (blockId: string, direction: -1 | 1) => void
  onChange: (blockId: string, updater: (block: CaseStudyMediaBlock) => CaseStudyMediaBlock) => void
  onRemove: (blockId: string) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div className="flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => onAdd('research')} className="font-mono" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
          + ADD RESEARCH BLOCK
        </button>
        <button type="button" onClick={() => onAdd('challenge')} className="font-mono" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
          + ADD CHALLENGE BLOCK
        </button>
        <button type="button" onClick={() => onAdd('process')} className="font-mono" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
          + ADD PROCESS BLOCK
        </button>
        <button type="button" onClick={() => onAdd('solution')} className="font-mono" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}>
          + ADD SOLUTION BLOCK
        </button>
      </div>
      {blocks.length === 0 ? (
        <p className="font-mono" style={{ fontSize: 'var(--text-body)', color: '#666666', lineHeight: 1.7 }}>
          No media blocks yet. Add a block to place screenshots exactly where you want them.
        </p>
      ) : null}
      {blocks.map((block, index) => (
        <MediaBlockEditor
          key={block.id}
          block={block}
          localWriteEnabled={localWriteEnabled}
          index={index}
          length={blocks.length}
          onMove={(direction) => onMove(block.id, direction)}
          onChange={(updater) => onChange(block.id, updater)}
          onRemove={() => onRemove(block.id)}
        />
      ))}
    </div>
  )
}

function MediaBlockEditor({
  block,
  localWriteEnabled,
  index,
  length,
  onMove,
  onChange,
  onRemove,
}: {
  block: CaseStudyMediaBlock
  localWriteEnabled: boolean
  index: number
  length: number
  onMove: (direction: -1 | 1) => void
  onChange: (updater: (block: CaseStudyMediaBlock) => CaseStudyMediaBlock) => void
  onRemove: () => void
}) {
  const images = normalizeMediaBlock(block).images

  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="flex items-center justify-between" style={{ gap: '12px', flexWrap: 'wrap' }}>
      <div className="font-mono" style={{ fontSize: '13px', color: '#f5f2ed', letterSpacing: '0.14em', lineHeight: 1.4 }}>
        {block.section.toUpperCase()} BLOCK
      </div>
        <ReorderButtons index={index} length={length} onMove={onMove} />
      </div>
      <Field label="Section">
        <select value={block.section} onChange={(event) => onChange((current) => ({ ...current, section: event.target.value as CaseStudyMediaBlockSection }))} style={inputStyle()}>
          <option value="research">Research</option>
          <option value="challenge">Challenge</option>
          <option value="process">Process</option>
          <option value="solution">Solution</option>
        </select>
      </Field>
      <Field label="Layout">
        <select
          value={block.layout}
          onChange={(event) => onChange((current) => normalizeMediaBlock({ ...current, layout: event.target.value as CaseStudyMediaBlock['layout'] }))}
          style={inputStyle()}
        >
          <option value="single">Single</option>
          <option value="pair">Two-up Pair</option>
        </select>
      </Field>
      <Field label="Placement">
        <select
          value={block.placement ?? 'below'}
          onChange={(event) => onChange((current) => ({ ...current, placement: event.target.value as CaseStudyMediaBlock['placement'] }))}
          style={inputStyle()}
        >
          <option value="below">Below Text</option>
          <option value="side-right">Side by Side (Right)</option>
        </select>
      </Field>
      <Field label="Align">
        <select value={block.align ?? 'center'} onChange={(event) => onChange((current) => ({ ...current, align: event.target.value as CaseStudyMediaAlign }))} style={inputStyle()}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </Field>
      <PresetSelectField
        label="Block Width"
        value={block.width}
        options={mediaBlockWidthOptions}
        placeholder="100%, 78%, 920px, min(100%, 920px)"
        onChange={(value) => onChange((current) => ({ ...current, width: value }))}
      />
      <PresetSelectField
        label="Gap"
        value={block.gap}
        options={mediaGapOptions}
        placeholder="2px, 12px"
        onChange={(value) => onChange((current) => ({ ...current, gap: value }))}
      />
      {images.map((image, imageIndex) => (
        <div key={`${block.id}-${imageIndex}`} style={{ display: 'grid', gap: '12px', border: '1px solid #171717', padding: '14px' }}>
          <div className="font-mono" style={{ fontSize: '12px', color: '#c4beb6', letterSpacing: '0.12em', lineHeight: 1.4 }}>
            IMAGE {imageIndex + 1}
          </div>
          <SourcePathField
            label="Source"
            value={image.src}
            localWriteEnabled={localWriteEnabled}
            onChange={(value) =>
              onChange((current) => ({
                ...current,
                images: updateAt(images, imageIndex, { ...image, src: value }),
              }))
            }
          />
          <Field label="Alt">
            <input
              value={image.alt ?? ''}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  images: updateAt(images, imageIndex, { ...image, alt: event.target.value || undefined }),
                }))
              }
              style={inputStyle()}
            />
          </Field>
          <Field label="Fit">
            <select
              value={image.fit ?? 'contain'}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  images: updateAt(images, imageIndex, { ...image, fit: event.target.value as CaseStudyMediaBlock['images'][number]['fit'] }),
                }))
              }
              style={inputStyle()}
            >
              <option value="contain">contain</option>
              <option value="cover">cover</option>
            </select>
          </Field>
          <PresetSelectField
            label="Position"
            value={image.position}
            options={mediaPositionOptions}
            placeholder="center center / 50% 20%"
            onChange={(value) =>
              onChange((current) => ({
                ...current,
                images: updateAt(images, imageIndex, { ...image, position: value }),
              }))
            }
          />
          <PresetSelectField
            label="Aspect Ratio"
            value={image.aspectRatio}
            options={mediaAspectRatioOptions}
            placeholder="3 / 4, 4 / 3, 1 / 1, 16 / 10"
            onChange={(value) =>
              onChange((current) => ({
                ...current,
                images: updateAt(images, imageIndex, { ...image, aspectRatio: value }),
              }))
            }
          />
          <PresetSelectField
            label="Background"
            value={image.background}
            options={mediaBackgroundOptions}
            placeholder="#161616"
            onChange={(value) =>
              onChange((current) => ({
                ...current,
                images: updateAt(images, imageIndex, { ...image, background: value }),
              }))
            }
          />
        </div>
      ))}
      <button
        type="button"
        onClick={onRemove}
        className="font-mono"
        style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
      >
        REMOVE BLOCK
      </button>
    </div>
  )
}

function HeroStageListEditor({
  items,
  onChange,
}: {
  items: HeroStageCopy[]
  onChange: (items: HeroStageCopy[]) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div className="flex items-center justify-between" style={{ gap: '12px' }}>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
          Hero Stages
        </span>
        <button
          type="button"
          onClick={() => onChange([...items, { number: String(items.length + 1).padStart(2, '0'), titleHtml: '', body: '', footerLabel: '' }])}
          className="font-mono"
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ADD STAGE
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${item.number}-${index}`} style={{ border: '1px solid #1f1f1f', padding: '16px', display: 'grid', gap: '12px' }}>
          <ReorderButtons index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} />
          <Field label="Stage Number">
            <input value={item.number} onChange={(event) => onChange(updateAt(items, index, { ...item, number: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Title HTML">
            <textarea value={item.titleHtml} onChange={(event) => onChange(updateAt(items, index, { ...item, titleHtml: event.target.value }))} style={inputStyle(true)} />
          </Field>
          <Field label="Body">
            <textarea value={item.body} onChange={(event) => onChange(updateAt(items, index, { ...item, body: event.target.value }))} style={inputStyle(true)} />
          </Field>
          <Field label="Footer Label">
            <input value={item.footerLabel ?? ''} onChange={(event) => onChange(updateAt(items, index, { ...item, footerLabel: event.target.value || undefined }))} style={inputStyle()} />
          </Field>
          <button
            type="button"
            onClick={() => onChange(removeAt(items, index))}
            className="font-mono"
            style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            REMOVE STAGE
          </button>
        </div>
      ))}
    </div>
  )
}

function LinkItemListEditor({
  title,
  items,
  onChange,
}: {
  title: string
  items: LinkItem[]
  onChange: (items: LinkItem[]) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div className="flex items-center justify-between" style={{ gap: '12px' }}>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
          {title}
        </span>
        <button
          type="button"
          onClick={() => onChange([...items, { label: '', href: '' }])}
          className="font-mono"
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ADD LINK
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} style={{ border: '1px solid #1f1f1f', padding: '16px', display: 'grid', gap: '12px' }}>
          <ReorderButtons index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} />
          <Field label="Label">
            <input value={item.label} onChange={(event) => onChange(updateAt(items, index, { ...item, label: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Href">
            <input value={item.href} onChange={(event) => onChange(updateAt(items, index, { ...item, href: event.target.value }))} style={inputStyle()} />
          </Field>
          <button
            type="button"
            onClick={() => onChange(removeAt(items, index))}
            className="font-mono"
            style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            REMOVE LINK
          </button>
        </div>
      ))}
    </div>
  )
}

function WorkProjectListEditor({
  title,
  items,
  onChange,
}: {
  title: string
  items: WorkProject[]
  onChange: (items: WorkProject[]) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div className="flex items-center justify-between" style={{ gap: '12px' }}>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
          {title}
        </span>
        <button
          type="button"
          onClick={() => onChange([...items, { title: '', oneliner: '', tags: [], href: '', cover: '' }])}
          className="font-mono"
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ADD ITEM
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} style={{ border: '1px solid #1f1f1f', padding: '16px', display: 'grid', gap: '12px' }}>
          <ReorderButtons index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} />
          <Field label="Title">
            <input value={item.title} onChange={(event) => onChange(updateAt(items, index, { ...item, title: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="One-liner">
            <textarea value={item.oneliner} onChange={(event) => onChange(updateAt(items, index, { ...item, oneliner: event.target.value }))} style={inputStyle(true)} />
          </Field>
          <Field label="Tags (comma separated)">
            <input value={tagsToText(item.tags)} onChange={(event) => onChange(updateAt(items, index, { ...item, tags: textToTags(event.target.value) }))} style={inputStyle()} />
          </Field>
          <Field label="Href">
            <input value={item.href} onChange={(event) => onChange(updateAt(items, index, { ...item, href: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Cover Image Path">
            <input value={item.cover ?? ''} onChange={(event) => onChange(updateAt(items, index, { ...item, cover: event.target.value || undefined }))} style={inputStyle()} />
          </Field>
          <Field label="Cover Object Position (e.g. center, center top, 50% 20%)">
            <input value={item.coverPosition ?? ''} onChange={(event) => onChange(updateAt(items, index, { ...item, coverPosition: event.target.value || undefined }))} style={inputStyle()} />
          </Field>
          <button
            type="button"
            onClick={() => onChange(removeAt(items, index))}
            className="font-mono"
            style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            REMOVE ITEM
          </button>
        </div>
      ))}
    </div>
  )
}

function EntryListEditor({
  title,
  items,
  onChange,
}: {
  title: string
  items: EntryItem[]
  onChange: (items: EntryItem[]) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div className="flex items-center justify-between" style={{ gap: '12px' }}>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
          {title}
        </span>
        <button
          type="button"
          onClick={() => onChange([...items, { org: '', role: '', date: '', desc: '' }])}
          className="font-mono"
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ADD ITEM
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${item.org}-${index}`} style={{ border: '1px solid #1f1f1f', padding: '16px', display: 'grid', gap: '12px' }}>
          <ReorderButtons index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} />
          <Field label="Organisation">
            <input value={item.org} onChange={(event) => onChange(updateAt(items, index, { ...item, org: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Role">
            <input value={item.role} onChange={(event) => onChange(updateAt(items, index, { ...item, role: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Date">
            <input value={item.date} onChange={(event) => onChange(updateAt(items, index, { ...item, date: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Description">
            <textarea value={item.desc} onChange={(event) => onChange(updateAt(items, index, { ...item, desc: event.target.value }))} style={inputStyle(true)} />
          </Field>
          <button
            type="button"
            onClick={() => onChange(removeAt(items, index))}
            className="font-mono"
            style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            REMOVE ITEM
          </button>
        </div>
      ))}
    </div>
  )
}

function NowCardListEditor({ items, onChange }: { items: NowCard[]; onChange: (items: NowCard[]) => void }) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div className="flex items-center justify-between" style={{ gap: '12px' }}>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
          Right Now Cards
        </span>
        <button
          type="button"
          onClick={() => onChange([...items, { label: '', value: '', sub: '' }])}
          className="font-mono"
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ADD CARD
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} style={{ border: '1px solid #1f1f1f', padding: '16px', display: 'grid', gap: '12px' }}>
          <ReorderButtons index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} />
          <Field label="Label">
            <input value={item.label} onChange={(event) => onChange(updateAt(items, index, { ...item, label: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Title">
            <input value={item.value} onChange={(event) => onChange(updateAt(items, index, { ...item, value: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Body">
            <textarea value={item.sub} onChange={(event) => onChange(updateAt(items, index, { ...item, sub: event.target.value }))} style={inputStyle(true)} />
          </Field>
          <button
            type="button"
            onClick={() => onChange(removeAt(items, index))}
            className="font-mono"
            style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            REMOVE CARD
          </button>
        </div>
      ))}
    </div>
  )
}

function PhotographyCityListEditor({
  items,
  onChange,
}: {
  items: PhotographyCity[]
  onChange: (items: PhotographyCity[]) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div className="flex items-center justify-between" style={{ gap: '12px' }}>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
          Photography City Cards
        </span>
        <button
          type="button"
          onClick={() => onChange([...items, { slug: '', title: '', desc: '', cover: '', imagePosition: '', comingSoon: false }])}
          className="font-mono"
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ADD CITY
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${item.slug}-${index}`} style={{ border: '1px solid #1f1f1f', padding: '16px', display: 'grid', gap: '12px' }}>
          <ReorderButtons index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} />
          <Field label="Slug">
            <input value={item.slug} onChange={(event) => onChange(updateAt(items, index, { ...item, slug: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Title">
            <input value={item.title} onChange={(event) => onChange(updateAt(items, index, { ...item, title: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Description">
            <textarea value={item.desc} onChange={(event) => onChange(updateAt(items, index, { ...item, desc: event.target.value }))} style={inputStyle(true)} />
          </Field>
          <Field label="Cover Image Path">
            <input value={item.cover} onChange={(event) => onChange(updateAt(items, index, { ...item, cover: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Object Position (e.g. center, center top, 50% 20%)">
            <input value={item.imagePosition ?? ''} onChange={(event) => onChange(updateAt(items, index, { ...item, imagePosition: event.target.value || undefined }))} style={inputStyle()} />
          </Field>
          <label className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={item.comingSoon} onChange={(event) => onChange(updateAt(items, index, { ...item, comingSoon: event.target.checked }))} />
            Coming Soon
          </label>
          <button
            type="button"
            onClick={() => onChange(removeAt(items, index))}
            className="font-mono"
            style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            REMOVE CITY
          </button>
        </div>
      ))}
    </div>
  )
}

function PhotographyGalleryListEditor({
  items,
  onChange,
}: {
  items: PhotographyGallery[]
  onChange: (items: PhotographyGallery[]) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div className="flex items-center justify-between" style={{ gap: '12px' }}>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
          Photography Galleries
        </span>
        <button
          type="button"
          onClick={() => onChange([...items, { slug: '', city: '', descriptor: '', images: [] }])}
          className="font-mono"
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ADD GALLERY
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${item.slug}-${index}`} style={{ border: '1px solid #1f1f1f', padding: '16px', display: 'grid', gap: '12px' }}>
          <ReorderButtons index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} />
          <Field label="Slug">
            <input value={item.slug} onChange={(event) => onChange(updateAt(items, index, { ...item, slug: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="City">
            <input value={item.city} onChange={(event) => onChange(updateAt(items, index, { ...item, city: event.target.value }))} style={inputStyle()} />
          </Field>
          <Field label="Descriptor">
            <textarea value={item.descriptor} onChange={(event) => onChange(updateAt(items, index, { ...item, descriptor: event.target.value }))} style={inputStyle(true)} />
          </Field>
          <ImageListEditor images={item.images} onChange={(images) => onChange(updateAt(items, index, { ...item, images }))} />
          <button
            type="button"
            onClick={() => onChange(removeAt(items, index))}
            className="font-mono"
            style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            REMOVE GALLERY
          </button>
        </div>
      ))}
    </div>
  )
}

function ImageListEditor({
  images,
  onChange,
}: {
  images: string[]
  onChange: (images: string[]) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div className="flex items-center justify-between" style={{ gap: '12px' }}>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
          Gallery Images
        </span>
        <button
          type="button"
          onClick={() => onChange([...images, ''])}
          className="font-mono"
          style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#FF3120', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
        >
          ADD IMAGE
        </button>
      </div>
      {images.map((image, index) => (
        <div key={`${image}-${index}`} style={{ border: '1px solid #1f1f1f', padding: '16px', display: 'grid', gap: '12px' }}>
          <ReorderButtons index={index} length={images.length} onMove={(direction) => onChange(moveItem(images, index, direction))} />
          <Field label={`Image ${index + 1}`}>
            <input value={image} onChange={(event) => onChange(updateAt(images, index, event.target.value))} style={inputStyle()} />
          </Field>
          <button
            type="button"
            onClick={() => onChange(removeAt(images, index))}
            className="font-mono"
            style={{ justifySelf: 'start', background: 'transparent', border: '1px solid #2a2a2a', color: '#999999', padding: '8px 12px', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            REMOVE IMAGE
          </button>
        </div>
      ))}
    </div>
  )
}

function CardStyleEditor({
  title,
  styleSettings,
  onChange,
}: {
  title: string
  styleSettings: CardStyleSettings
  onChange: (value: CardStyleSettings) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: '13px', color: '#f5f2ed', letterSpacing: '0.14em', lineHeight: 1.4 }}>
        {title.toUpperCase()}
      </div>
      <Field label="Title Size">
        <input value={styleSettings.titleSize} onChange={(event) => onChange({ ...styleSettings, titleSize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Meta Size">
        <input value={styleSettings.metaSize} onChange={(event) => onChange({ ...styleSettings, metaSize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Body Size">
        <input value={styleSettings.bodySize ?? ''} onChange={(event) => onChange({ ...styleSettings, bodySize: event.target.value || undefined })} style={inputStyle()} />
      </Field>
      <Field label="Image Ratio">
        <input value={styleSettings.imageRatio} onChange={(event) => onChange({ ...styleSettings, imageRatio: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Card Padding">
        <input value={styleSettings.cardPadding} onChange={(event) => onChange({ ...styleSettings, cardPadding: event.target.value })} style={inputStyle()} />
      </Field>
    </div>
  )
}

function PhotographyCardStyleEditor({
  title,
  styleSettings,
  onChange,
}: {
  title: string
  styleSettings: PhotographyCardStyleSettings
  onChange: (value: PhotographyCardStyleSettings) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
        {title.toUpperCase()}
      </div>
      <Field label="Title Size">
        <input value={styleSettings.titleSize} onChange={(event) => onChange({ ...styleSettings, titleSize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Body Size">
        <input value={styleSettings.bodySize} onChange={(event) => onChange({ ...styleSettings, bodySize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Image Aspect Ratio">
        <input value={styleSettings.imageAspectRatio} onChange={(event) => onChange({ ...styleSettings, imageAspectRatio: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Card Padding">
        <input value={styleSettings.cardPadding} onChange={(event) => onChange({ ...styleSettings, cardPadding: event.target.value })} style={inputStyle()} />
      </Field>
    </div>
  )
}

function GalleryStyleEditor({
  styleSettings,
  onChange,
}: {
  styleSettings: GalleryStyleSettings
  onChange: (value: GalleryStyleSettings) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
        GALLERY STYLE
      </div>
      <Field label="Image Aspect Ratio">
        <input value={styleSettings.imageAspectRatio} onChange={(event) => onChange({ ...styleSettings, imageAspectRatio: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Grid Gap">
        <input value={styleSettings.gridGap} onChange={(event) => onChange({ ...styleSettings, gridGap: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Descriptor Size">
        <input value={styleSettings.descriptorSize} onChange={(event) => onChange({ ...styleSettings, descriptorSize: event.target.value })} style={inputStyle()} />
      </Field>
    </div>
  )
}

function NowCardStyleEditor({
  styleSettings,
  onChange,
}: {
  styleSettings: NowCardStyleSettings
  onChange: (value: NowCardStyleSettings) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
        RIGHT NOW CARDS
      </div>
      <Field label="Label Size">
        <input value={styleSettings.labelSize} onChange={(event) => onChange({ ...styleSettings, labelSize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Title Size">
        <input value={styleSettings.titleSize} onChange={(event) => onChange({ ...styleSettings, titleSize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Body Size">
        <input value={styleSettings.bodySize} onChange={(event) => onChange({ ...styleSettings, bodySize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Card Padding">
        <input value={styleSettings.cardPadding} onChange={(event) => onChange({ ...styleSettings, cardPadding: event.target.value })} style={inputStyle()} />
      </Field>
    </div>
  )
}

function ListeningCardStyleEditor({
  title,
  styleSettings,
  onChange,
}: {
  title: string
  styleSettings: ListeningCardStyleSettings
  onChange: (value: ListeningCardStyleSettings) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
        {title.toUpperCase()}
      </div>
      <Field label="Label Size">
        <input value={styleSettings.labelSize} onChange={(event) => onChange({ ...styleSettings, labelSize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Track Title Size">
        <input value={styleSettings.titleSize} onChange={(event) => onChange({ ...styleSettings, titleSize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Artist Size">
        <input value={styleSettings.artistSize} onChange={(event) => onChange({ ...styleSettings, artistSize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Card Padding">
        <input value={styleSettings.cardPadding} onChange={(event) => onChange({ ...styleSettings, cardPadding: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Artwork Size">
        <input value={styleSettings.artworkSize} onChange={(event) => onChange({ ...styleSettings, artworkSize: event.target.value })} style={inputStyle()} />
      </Field>
      <Field label="Progress Meta Size">
        <input value={styleSettings.progressMetaSize} onChange={(event) => onChange({ ...styleSettings, progressMetaSize: event.target.value })} style={inputStyle()} />
      </Field>
    </div>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label style={{ display: 'grid', gap: '8px' }}>
      <div className="flex items-center justify-between" style={{ gap: '16px' }}>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#f5f2ed' }}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function MotionSettingsEditor({
  settings,
  onChange,
}: {
  settings: MotionSettings
  onChange: (value: MotionSettings) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
          PAGE REVEALS
        </div>
        <SliderField label="Reveal Distance" value={settings.pageRevealDistance} min={0} max={60} step={1} suffix="px" onChange={(value) => onChange({ ...settings, pageRevealDistance: value })} />
        <SliderField label="Reveal Duration" value={settings.pageRevealDuration} min={0.2} max={1.2} step={0.05} suffix="s" onChange={(value) => onChange({ ...settings, pageRevealDuration: value })} />
        <SliderField label="Reveal Stagger" value={settings.pageRevealStagger} min={0} max={0.3} step={0.01} suffix="s" onChange={(value) => onChange({ ...settings, pageRevealStagger: value })} />
      </div>

      <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
          SIMPLE REVEALS
        </div>
        <SliderField label="Reveal Distance" value={settings.simpleRevealDistance} min={0} max={40} step={1} suffix="px" onChange={(value) => onChange({ ...settings, simpleRevealDistance: value })} />
        <SliderField label="Reveal Duration" value={settings.simpleRevealDuration} min={0.2} max={1} step={0.05} suffix="s" onChange={(value) => onChange({ ...settings, simpleRevealDuration: value })} />
        <SliderField label="Reveal Stagger" value={settings.simpleRevealStagger} min={0} max={0.4} step={0.01} suffix="s" onChange={(value) => onChange({ ...settings, simpleRevealStagger: value })} />
      </div>

      <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
          CARD GRID ENTRANCES
        </div>
        <SliderField label="Start Scale" value={settings.gridStartScale} min={0.8} max={1} step={0.01} onChange={(value) => onChange({ ...settings, gridStartScale: value })} />
        <SliderField label="Reveal Duration" value={settings.gridRevealDuration} min={0.2} max={1.2} step={0.05} suffix="s" onChange={(value) => onChange({ ...settings, gridRevealDuration: value })} />
        <SliderField label="Reveal Stagger" value={settings.gridRevealStagger} min={0} max={0.3} step={0.01} suffix="s" onChange={(value) => onChange({ ...settings, gridRevealStagger: value })} />
      </div>

      <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
          EYEBROW ANIMATION
        </div>
        <SliderField label="Offset" value={settings.eyebrowOffset} min={0} max={24} step={1} suffix="px" onChange={(value) => onChange({ ...settings, eyebrowOffset: value })} />
        <SliderField label="Line Duration" value={settings.eyebrowLineDuration} min={0.1} max={1} step={0.05} suffix="s" onChange={(value) => onChange({ ...settings, eyebrowLineDuration: value })} />
        <SliderField label="Label Duration" value={settings.eyebrowLabelDuration} min={0.1} max={1} step={0.05} suffix="s" onChange={(value) => onChange({ ...settings, eyebrowLabelDuration: value })} />
        <SliderField label="Label Delay" value={settings.eyebrowLabelDelay} min={0} max={0.8} step={0.05} suffix="s" onChange={(value) => onChange({ ...settings, eyebrowLabelDelay: value })} />
      </div>

      <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
        <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
          HOMEPAGE INTRO
        </div>
        <SliderField label="Start Delay" value={settings.introStartDelay} min={0} max={2000} step={50} suffix="ms" onChange={(value) => onChange({ ...settings, introStartDelay: value })} />
        <SliderField label="Key Gap" value={settings.introKeyGap} min={50} max={1200} step={50} suffix="ms" onChange={(value) => onChange({ ...settings, introKeyGap: value })} />
        <SliderField label="Pause Before Lift" value={settings.introPauseBeforeLift} min={0} max={1000} step={50} suffix="ms" onChange={(value) => onChange({ ...settings, introPauseBeforeLift: value })} />
        <SliderField label="Lift Duration" value={settings.introLiftDuration} min={200} max={1600} step={50} suffix="ms" onChange={(value) => onChange({ ...settings, introLiftDuration: value })} />
      </div>
    </div>
  )
}

function AudioSettingsEditor({
  settings,
  onChange,
}: {
  settings: AudioSettings
  onChange: (value: AudioSettings) => void
}) {
  return (
    <div style={{ display: 'grid', gap: '12px', border: '1px solid #1f1f1f', padding: '16px' }}>
      <div className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.1em' }}>
        INTERACTION AUDIO
      </div>
      <SliderField
        label="Volume"
        value={settings.interactionVolume}
        min={0}
        max={1}
        step={0.05}
        onChange={(value) => onChange({ ...settings, interactionVolume: value })}
      />
    </div>
  )
}
