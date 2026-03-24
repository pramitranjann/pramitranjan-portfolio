'use client'

import { useMemo, useState } from 'react'
import type {
  CaseStudyContent,
  CaseStudySection,
  EntryItem,
  NowCard,
  PhotographyCity,
  ProjectLink,
  SiteContent,
  WorkProject,
} from '@/lib/site-content-schema'

type EditorProps = {
  initialContent: SiteContent
}

type PageKey = 'homepage' | 'about-page' | 'work-page' | 'photography-page' | `case-study:${string}`

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

function toPair(first: string, second: string) {
  return [first, second].filter(Boolean)
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

export function DashboardEditor({ initialContent }: EditorProps) {
  const [content, setContent] = useState(initialContent)
  const [status, setStatus] = useState('Ready')
  const [saving, setSaving] = useState(false)
  const [activePage, setActivePage] = useState<PageKey>('homepage')

  const groupedCaseStudies = useMemo(
    () => ({
      work: content.caseStudies.filter((item) => item.section === 'work'),
      mixedMedia: content.caseStudies.filter((item) => item.section === 'mixed-media'),
      branding: content.caseStudies.filter((item) => item.section === 'branding'),
    }),
    [content.caseStudies]
  )

  function updateSection<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }))
  }

  function updateCaseStudy(slug: string, updater: (item: CaseStudyContent) => CaseStudyContent) {
    setContent((current) => ({
      ...current,
      caseStudies: current.caseStudies.map((item) => (item.slug === slug ? updater(item) : item)),
    }))
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

  const activeCaseStudy = activePage.startsWith('case-study:')
    ? content.caseStudies.find((item) => item.slug === activePage.replace('case-study:', '')) ?? null
    : null

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

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        <aside style={{ border: '1px solid #1f1f1f', background: '#111111', padding: '16px', position: 'sticky', top: '96px' }}>
          <div style={{ display: 'grid', gap: '18px' }}>
            <SidebarGroup title="SITE PAGES">
              <SidebarButton active={activePage === 'homepage'} label="Homepage" onClick={() => setActivePage('homepage')} />
              <SidebarButton active={activePage === 'about-page'} label="About Page" onClick={() => setActivePage('about-page')} />
              <SidebarButton active={activePage === 'work-page'} label="Work Page" onClick={() => setActivePage('work-page')} />
              <SidebarButton active={activePage === 'photography-page'} label="Photography Page" onClick={() => setActivePage('photography-page')} />
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
            </SidebarGroup>
          </div>
        </aside>

        <div style={{ display: 'grid', gap: '24px' }}>
          {activePage === 'homepage' ? (
            <HomepageEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'about-page' ? (
            <AboutPageEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'work-page' ? (
            <WorkPageEditor content={content} updateSection={updateSection} />
          ) : null}
          {activePage === 'photography-page' ? (
            <PhotographyPageEditor content={content} updateSection={updateSection} />
          ) : null}
          {activeCaseStudy ? (
            <CaseStudyEditor caseStudy={activeCaseStudy} onChange={(updater) => updateCaseStudy(activeCaseStudy.slug, updater)} />
          ) : null}
        </div>
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
      </SectionFrame>

      <SectionFrame title="About Page Lists">
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
      </SectionFrame>

      <SectionFrame title="About Page Extras">
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
    </>
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
    </SectionFrame>
  )
}

function CaseStudyEditor({
  caseStudy,
  onChange,
}: {
  caseStudy: CaseStudyContent
  onChange: (updater: (item: CaseStudyContent) => CaseStudyContent) => void
}) {
  return (
    <>
      <SectionFrame title={`${caseStudy.title} · Basics`}>
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
        <Field label="Hero Image">
          <input value={caseStudy.heroImage ?? ''} onChange={(event) => onChange((current) => ({ ...current, heroImage: event.target.value || undefined }))} style={inputStyle()} />
        </Field>
        <Field label="Research Image">
          <input value={caseStudy.researchImage ?? ''} onChange={(event) => onChange((current) => ({ ...current, researchImage: event.target.value || undefined }))} style={inputStyle()} />
        </Field>
        <ImagePairEditor
          label="Challenge Images"
          images={caseStudy.challengeImages ?? []}
          onChange={(images) => onChange((current) => ({ ...current, challengeImages: images.length ? images : undefined }))}
        />
        <Field label="Solution Hero Image">
          <input value={caseStudy.solutionHeroImage ?? ''} onChange={(event) => onChange((current) => ({ ...current, solutionHeroImage: event.target.value || undefined }))} style={inputStyle()} />
        </Field>
        <ImagePairEditor
          label="Solution Images"
          images={caseStudy.solutionImages ?? []}
          onChange={(images) => onChange((current) => ({ ...current, solutionImages: images.length ? images : undefined }))}
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
