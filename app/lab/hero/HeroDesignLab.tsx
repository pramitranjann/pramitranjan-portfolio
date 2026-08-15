'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IntroAnimation } from '@/components/IntroAnimation'
import { PortfolioCarousel } from '@/components/PortfolioHero'
import { TransitionRail } from '@/components/TransitionRail'
import type { PortfolioCarouselItem } from '@/lib/site-content-schema'

const variations = [
  { id: 'direct', number: '01', label: 'Direct' },
  { id: 'product', number: '02', label: 'Product showcase' },
  { id: 'carousel', number: '03', label: 'Portfolio carousel' },
  { id: 'motion', number: '04', label: 'Motion mark' },
] as const

type VariationId = (typeof variations)[number]['id']

export interface HeroShowcaseProject {
  title: string
  href: string
  cover?: string
  coverPosition?: string
  tags: string[]
}

function ProductShowcase({ projects }: { projects: HeroShowcaseProject[] }) {
  const showcaseProjects = projects.slice(0, 3)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeProject = showcaseProjects[activeIndex]

  if (!activeProject) return null

  return (
    <div className="hero-lab-product-layout">
      <h1 className="hero-lab-title hero-lab-title-product font-serif">
        Hello, I&apos;m Pramit—<em>a UX designer who builds the work.</em>
      </h1>

      <div className="hero-lab-product-showcase">
        <Link className="hero-lab-product-window" href={activeProject.href}>
          <div className="hero-lab-product-image" aria-hidden="true">
            {showcaseProjects.map((project, index) =>
              project.cover ? (
                <Image
                  key={project.title}
                  className="hero-lab-product-slide"
                  data-active={index === activeIndex}
                  src={project.cover}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(max-width: 767px) 82vw, 38vw"
                  style={{ objectFit: 'cover', objectPosition: project.coverPosition ?? 'center' }}
                />
              ) : null,
            )}
          </div>
          <div className="hero-lab-product-meta">
            <span className="font-serif">{activeProject.title}</span>
            <span className="font-mono">{activeProject.tags.join(' · ')}</span>
          </div>
        </Link>

        <div className="hero-lab-product-selectors" role="radiogroup" aria-label="Choose featured product">
          {showcaseProjects.map((project, index) => (
            <button
              key={project.title}
              type="button"
              className="hero-lab-product-selector"
              role="radio"
              aria-checked={index === activeIndex}
              data-active={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <span className="font-mono">{String(index + 1).padStart(2, '0')}</span>
              <span className="font-reading">{project.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MotionMark() {
  return (
    <div className="hero-lab-motion-layout">
      <div className="hero-lab-motion-mark" aria-hidden="true">
        <span className="hero-lab-motion-ring hero-lab-motion-ring-one" />
        <span className="hero-lab-motion-ring hero-lab-motion-ring-two" />
        <span className="hero-lab-motion-orbit">
          <span />
        </span>
        <span className="hero-lab-motion-core font-mono">PR</span>
      </div>
      <h1 className="hero-lab-title hero-lab-title-motion font-serif">
        I&apos;m Pramit Ranjan—a <em>UX designer</em> making uncertain ideas useful.
      </h1>
    </div>
  )
}

function HeroVariation({
  variation,
  projects,
  carouselItems,
}: {
  variation: VariationId
  projects: HeroShowcaseProject[]
  carouselItems: PortfolioCarouselItem[]
}) {
  if (variation === 'product') return <ProductShowcase projects={projects} />
  if (variation === 'carousel') return <PortfolioCarousel items={carouselItems} />
  if (variation === 'motion') return <MotionMark />

  return (
    <h1 className="hero-lab-title hero-lab-title-direct font-serif">
      Hello, I&apos;m Pramit Ranjan—a <em>UX designer</em> turning messy problems into products
      people can use.
    </h1>
  )
}

export function HeroDesignLab({
  projects,
  carouselItems,
}: {
  projects: HeroShowcaseProject[]
  carouselItems: PortfolioCarouselItem[]
}) {
  const [variation, setVariation] = useState<VariationId>('carousel')
  const [labOpen, setLabOpen] = useState(false)
  const [introRun, setIntroRun] = useState(0)
  const [introVisible, setIntroVisible] = useState(true)

  const replayIntro = () => {
    setLabOpen(false)
    setIntroRun((run) => run + 1)
    setIntroVisible(true)
  }

  return (
    <>
      {introVisible ? (
        <IntroAnimation
          key={introRun}
          forcePlay
          onComplete={() => setIntroVisible(false)}
        />
      ) : null}

      <section className={`hero-lab-hero hero-lab-variation-${variation}`} aria-labelledby="hero-lab-title">
        <div className="hero-lab-shell">
          <div id="hero-lab-title" className="hero-lab-copy">
            <HeroVariation variation={variation} projects={projects} carouselItems={carouselItems} />
          </div>

          <Link
            className="hero-lab-section-transition"
            href="#selected-work"
            aria-label="Continue to selected work"
          >
            <TransitionRail className="hero-lab-transition-track" />
          </Link>
        </div>
      </section>

      {!introVisible ? (
        <aside className="hero-design-lab" data-open={labOpen} aria-label="Hero design variations">
          <div className="hero-design-lab-panel" aria-hidden={!labOpen}>
            <div className="hero-design-lab-head">
              <span className="font-mono">HERO VARIATIONS</span>
              <span className="font-mono">{variations.length}</span>
            </div>

            <div className="hero-design-lab-options" role="radiogroup" aria-label="Choose a hero variation">
              {variations.map((item) => {
                const active = variation === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="hero-design-lab-option"
                    role="radio"
                    aria-checked={active}
                    tabIndex={labOpen ? 0 : -1}
                    data-active={active}
                    onClick={() => setVariation(item.id)}
                  >
                    <span className="font-mono">{item.number}</span>
                    <span className="font-reading">{item.label}</span>
                    <span className="hero-design-lab-check font-mono" aria-hidden="true">
                      {active ? '●' : '○'}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="hero-design-lab-replay font-mono"
              tabIndex={labOpen ? 0 : -1}
              onClick={replayIntro}
            >
              REPLAY PR INTRO ↻
            </button>
          </div>

          <button
            type="button"
            className="hero-design-lab-trigger"
            aria-expanded={labOpen}
            onClick={() => setLabOpen((open) => !open)}
          >
            <span aria-hidden="true">🧪</span>
            <span className="font-mono">DESIGN LAB</span>
            <span className="hero-design-lab-caret font-mono" aria-hidden="true">
              {labOpen ? '↓' : '↑'}
            </span>
          </button>
        </aside>
      ) : null}
    </>
  )
}
