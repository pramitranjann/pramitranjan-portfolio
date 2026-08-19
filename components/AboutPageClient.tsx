'use client'

import { useEffect, useState } from 'react'
import type { EntryItem, LinkItem } from '@/lib/site-content-schema'

/* 01–03 and the new BBQ shot are 3:4 (or near it); 04 is 9:16 and needs the crop control
   below so it matches the shared frame instead of forcing every slide to its own aspect. */
const PORTRAITS: Array<{ src: string; caption: string; meta: string }> = [
  { src: '/about/portrait-01.jpg', caption: 'My first time being on a film set.', meta: 'MAY 2026' },
  { src: '/about/portrait-02.jpg', caption: 'The banchan spread I always order.', meta: 'MAY 2026' },
  { src: '/about/portrait-03.jpg', caption: 'A photo from my recent travels to Vietnam.', meta: 'JUL 2026' },
  { src: '/about/portrait-04.jpg', caption: 'My first snow in Savannah.', meta: 'JAN 2026' },
]

type NowCard = { label: string; value: string; sub: string; art?: string | null }

interface AboutPageClientProps {
  heroBody: string
  whoIAm: string
  experience: EntryItem[]
  education: EntryItem[]
  professionalActivities: EntryItem[]
  tools: string[]
  nowCards: NowCard[]
  contactTitleHtml: string
  contactBody: string
  contactLinks: LinkItem[]
  labels: {
    experience: string
    education: string
    activities: string
    tools: string
    cv: string
  }
}

/* One timer for both carousels. Reduced motion opts out of the rotation entirely rather
   than shortening it — every slide stays in the DOM and reachable. */
function useCycle(length: number, ms: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % length), ms)
    return () => clearTimeout(id)
  }, [length, ms, index])

  return [index, setIndex] as const
}

/* The track joins the rotation as a card in the same shape as the rest, rather than the
   bordered SpotifyWidget cell, whose chrome reads as foreign beside plain text slides.
   Nothing is appended until the fetch resolves, so there is never a blank beat. */
function useNowPlaying(): NowCard | null {
  const [card, setCard] = useState<NowCard | null>(null)

  useEffect(() => {
    let live = true
    fetch('/api/spotify')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!live || !data || data.error || !data.title) return
        setCard({
          label: data.isPlaying ? 'LISTENING' : 'LAST PLAYED',
          value: data.title,
          sub: data.artist,
          art: data.albumArt,
        })
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  return card
}

function Dots({ count, active, onPick, label }: { count: number; active: number; onPick: (index: number) => void; label: string }) {
  return (
    <div className="about-dots" role="tablist" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`${label} ${i + 1}`}
          data-active={i === active}
          onClick={() => onPick(i)}
        >
          <span aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

/* Slides share one grid cell, so the block's height is the tallest card's and never jumps
   mid-rotation — the subs differ a lot in length. */
function RightNow({ cards }: { cards: NowCard[] }) {
  const nowPlaying = useNowPlaying()
  const slides = nowPlaying ? [...cards, nowPlaying] : cards
  const [index, setIndex] = useCycle(slides.length, 4200)

  return (
    <div className="about-now">
      <div className="about-now-stack">
        {slides.map((card, i) => (
          <div key={card.label} className="about-now-slide" data-active={i === index}>
            <span className="font-mono about-now-label">
              <span className="about-now-dot" aria-hidden="true" /> {card.label.replace(/_$/, '')}
            </span>
            <div className="about-now-line">
              {card.art ? <img className="about-now-art" src={card.art} alt="" /> : null}
              <div>
                <p className="font-serif about-now-value">{card.value}</p>
                <p className="font-reading about-now-sub">{card.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dots count={slides.length} active={index} onPick={setIndex} label="Right now" />
    </div>
  )
}

/* One 3:4 frame for every slide, so the block never changes height mid-rotation. Only
   photo 04 (9:16) needs the crop control — the rest are already 3:4 and it does nothing
   to them. */
function PortraitCarousel() {
  const [index, setIndex] = useCycle(PORTRAITS.length, 3600)
  const current = PORTRAITS[index]

  return (
    <figure className="about-portrait-figure">
      <div className="about-portrait">
        {PORTRAITS.map((portrait, i) => (
          <div key={portrait.src} className="about-portrait-slide" data-active={i === index}>
            <img
              src={portrait.src}
              alt={portrait.caption}
              style={i === 3 ? { objectPosition: '50% 50%' } : undefined}
            />
          </div>
        ))}
      </div>
      <div className="about-portrait-foot">
        <figcaption className="about-portrait-caption">
          <span className="font-reading">{current.caption}</span>
          <span className="font-mono">{current.meta}</span>
        </figcaption>
        <Dots count={PORTRAITS.length} active={index} onPick={setIndex} label="Portrait" />
      </div>
    </figure>
  )
}

function cleanLabel(label: string) {
  return label.replace(/<br\s*\/?>/gi, ' ').replace(/_$/, '')
}

function EntryRows({ label, items }: { label: string; items: EntryItem[] }) {
  return (
    <div className="about-rows">
      <span className="font-mono about-section-label">{cleanLabel(label)}</span>
      {items.map((item) => (
        <div key={item.org} className="about-row">
          <div className="flex items-baseline justify-between about-row-head">
            <span className="font-serif about-row-title">{item.org}</span>
            <span className="font-mono about-row-date">{item.date}</span>
          </div>
          <span className="font-mono about-row-role">{item.role}</span>
          <p className="font-reading about-row-desc">{item.desc}</p>
        </div>
      ))}
    </div>
  )
}

/* Activities and tools are supplementary credits, not history — one compact line each
   instead of full rows. */
function InlineList({ label, entries }: { label: string; entries: Array<{ text: string; meta?: string }> }) {
  return (
    <div className="about-rows about-rows-inline">
      <span className="font-mono about-section-label">{cleanLabel(label)}</span>
      <p className="font-mono about-inline-list">
        {entries.map((entry, index) => (
          <span key={entry.text}>
            {entry.text}
            {entry.meta ? <span className="about-inline-meta"> {entry.meta}</span> : null}
            {index < entries.length - 1 ? '  ·  ' : ''}
          </span>
        ))}
      </p>
    </div>
  )
}

export function AboutPageClient({
  heroBody,
  whoIAm,
  experience,
  education,
  professionalActivities,
  tools,
  nowCards,
  contactTitleHtml,
  contactBody,
  contactLinks,
  labels,
}: AboutPageClientProps) {
  const [lead, ...rest] = heroBody.split('. ')
  const tail = rest.join('. ')

  return (
    <div className="about-column">
      <h1 className="font-serif about-statement">
        {lead}
        {tail ? <>. <span className="about-statement-accent">{tail}</span></> : null}
      </h1>

      {nowCards.length ? <RightNow cards={nowCards} /> : null}

      <p className="font-reading about-body">{whoIAm}</p>

      <PortraitCarousel />

      <EntryRows label={labels.experience} items={experience} />
      <EntryRows label={labels.education} items={education} />
      <InlineList label={labels.activities} entries={professionalActivities.map((item) => ({ text: item.org, meta: item.date }))} />
      <InlineList label={labels.tools} entries={tools.map((tool) => ({ text: tool }))} />

      <div className="about-contact">
        <h2 className="font-serif about-contact-title" dangerouslySetInnerHTML={{ __html: contactTitleHtml }} />
        <p className="font-reading about-contact-body">{contactBody}</p>
        <div className="about-contact-links">
          {contactLinks.map((link) => (
            <a key={`${link.label}-${link.href}`} href={link.href} className="font-mono">{link.label}</a>
          ))}
          <a
            href="/pramit-ranjan-resume-2026.pdf"
            download="pramit-ranjan-resume-2026.pdf"
            className="font-mono about-contact-cv"
          >
            {labels.cv} →
          </a>
        </div>
      </div>
    </div>
  )
}
