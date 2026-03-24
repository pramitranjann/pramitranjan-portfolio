'use client'

import { useState } from 'react'
import type { EntryItem, NowCard, PhotographyCity, SiteContent, WorkProject } from '@/lib/site-content-schema'

type EditorProps = {
  initialContent: SiteContent
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '8px' }}>
      <span className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#999999', letterSpacing: '0.1em' }}>
        {label}
      </span>
      {children}
    </label>
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

function tagsToText(tags: string[]) {
  return tags.join(', ')
}

function textToTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function toolsToText(tools: string[]) {
  return tools.join('\n')
}

function textToTools(value: string) {
  return value
    .split('\n')
    .map((tool) => tool.trim())
    .filter(Boolean)
}

export function DashboardEditor({ initialContent }: EditorProps) {
  const [content, setContent] = useState(initialContent)
  const [status, setStatus] = useState('Ready')
  const [saving, setSaving] = useState(false)

  function updateSection<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }))
  }

  async function handleSave() {
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

    setStatus('Saved')
    setSaving(false)
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/dashboard/login'
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div className="flex items-center justify-between" style={{ gap: '16px', flexWrap: 'wrap' }}>
        <p className="font-mono" style={{ fontSize: 'var(--text-meta)', color: '#666666', letterSpacing: '0.08em' }}>
          {status}
        </p>
        <div className="flex" style={{ gap: '12px', flexWrap: 'wrap' }}>
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
            disabled={saving}
            className="font-mono"
            style={{ background: '#FF3120', border: 'none', color: '#0d0d0d', padding: '12px 16px', letterSpacing: '0.1em', cursor: 'pointer' }}
          >
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>

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
        <Field label="Homepage About Body">
          <textarea
            value={content.home.about.body}
            onChange={(event) => updateSection('home', {
              ...content.home,
              about: { ...content.home.about, body: event.target.value },
            })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="Homepage Spotify Label">
          <input
            value={content.home.about.spotifyLabel}
            onChange={(event) => updateSection('home', {
              ...content.home,
              about: { ...content.home.about, spotifyLabel: event.target.value },
            })}
            style={inputStyle()}
          />
        </Field>
      </SectionFrame>

      <SectionFrame title="About Page">
        <Field label="Hero Body">
          <textarea
            value={content.aboutPage.heroBody}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, heroBody: event.target.value })}
            style={inputStyle(true)}
          />
        </Field>
        <Field label="Who I Am Body">
          <textarea
            value={content.aboutPage.whoIAm}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, whoIAm: event.target.value })}
            style={inputStyle(true)}
          />
        </Field>
        <EntryListEditor
          title="Experience"
          items={content.aboutPage.experience}
          onChange={(items) => updateSection('aboutPage', { ...content.aboutPage, experience: items })}
        />
        <EntryListEditor
          title="Professional Activities"
          items={content.aboutPage.professionalActivities}
          onChange={(items) => updateSection('aboutPage', { ...content.aboutPage, professionalActivities: items })}
        />
        <Field label="Tools (one per line)">
          <textarea
            value={toolsToText(content.aboutPage.tools)}
            onChange={(event) => updateSection('aboutPage', { ...content.aboutPage, tools: textToTools(event.target.value) })}
            style={inputStyle(true)}
          />
        </Field>
        <NowCardListEditor
          items={content.aboutPage.nowCards}
          onChange={(items) => updateSection('aboutPage', { ...content.aboutPage, nowCards: items })}
        />
      </SectionFrame>

      <SectionFrame title="Work Page">
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
      </SectionFrame>

      <SectionFrame title="Photography">
        <Field label="Photography Hero Title">
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
      </SectionFrame>
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
          <Field label="Object Position">
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

function updateAt<T>(items: T[], index: number, value: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item))
}

function removeAt<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index)
}
