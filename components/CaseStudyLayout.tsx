import Link from 'next/link'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { RuleLabel } from './RuleLabel'

interface ProjectLink {
  slug: string
  title: string
}

interface CaseStudyLayoutProps {
  title: string
  oneliner: string
  type: string
  tags: string[]
  prev: ProjectLink | null
  next: ProjectLink | null
  backHref?: string
  backLabel?: string
  overview?: string
  role?: string
  research?: string
  ideation?: string
  keyDecisions?: string
  solution?: string
  reflection?: string
}

export function CaseStudyLayout({
  title, oneliner, type, tags, prev, next,
  backHref = '/work', backLabel = 'WORK',
  overview, role, research, ideation, keyDecisions, solution, reflection,
}: CaseStudyLayoutProps) {
  const basePath = backHref
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '57px' }}>

        {/* Back link */}
        <div style={{ padding: '24px 40px 0' }}>
          <Link
            href={backHref}
            className="font-mono"
            style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666', textDecoration: 'none' }}
          >
            <span className="arrow-nudge-back">←</span> {backLabel}
          </Link>
        </div>

        {/* Hero — 50/50 grid */}
        <section
          className="grid grid-cols-2 border-b border-divider"
          style={{ minHeight: '280px' }}
        >
          <div
            className="flex flex-col justify-end border-r border-divider"
            style={{ padding: '48px 40px' }}
          >
            <RuleLabel number={type} />
            <h1
              className="font-serif"
              style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1 }}
            >
              {title}
            </h1>
            <p
              className="font-mono mt-3"
              style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#666666', lineHeight: 1.6 }}
            >
              {oneliner}
            </p>
          </div>
          <div style={{ backgroundColor: '#161616' }} />
        </section>

        {/* Overview */}
        <section className="border-b border-divider" style={{ padding: '48px 40px' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.16em', color: '#666666' }}>
              OVERVIEW
            </span>
            <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
              {overview ?? 'This project focused on understanding user needs and translating them into a cohesive design solution. Through research, ideation, and iteration, the final product addresses real problems with intentional design decisions.'}
            </p>
          </div>
        </section>

        {/* My Role */}
        <section className="border-b border-divider" style={{ padding: '48px 40px' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.16em', color: '#666666' }}>
              MY ROLE
            </span>
            <div>
              <p className="font-mono mb-6" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
                {role ?? 'Led end-to-end UX design including research planning, synthesis, interaction design, and high-fidelity prototyping.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono"
                    style={{
                      fontSize: 'var(--text-eyebrow)',
                      letterSpacing: '0.12em',
                      color: '#666666',
                      border: '1px solid #1f1f1f',
                      padding: '4px 10px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="border-b border-divider" style={{ padding: '48px 40px' }}>
          <RuleLabel number="PROCESS_" />

          {/* Research */}
          <div className="mb-10">
            <p className="font-mono mb-3" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>
              RESEARCH_
            </p>
            <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
              {research ?? 'Conducted user interviews and competitive analysis to understand the landscape. Synthesised findings into key themes that informed the design direction.'}
            </p>
            <div className="mt-6 w-full" style={{ height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
          </div>

          {/* Ideation */}
          <div className="mb-10">
            <p className="font-mono mb-3" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>
              IDEATION_
            </p>
            <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
              {ideation ?? 'Explored multiple directions through sketching and low-fidelity wireframes. Narrowed down to the strongest concept based on user feedback and feasibility.'}
            </p>
            <div className="mt-6 grid grid-cols-2" style={{ gap: '2px' }}>
              <div style={{ height: '267px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
              <div style={{ height: '267px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
            </div>
          </div>

          {/* Key Decisions */}
          <div>
            <p className="font-mono mb-3" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>
              KEY DECISIONS_
            </p>
            <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
              {keyDecisions ?? 'Prioritised clarity over feature richness. Key interaction patterns were validated through usability testing and refined in subsequent iterations.'}
            </p>
          </div>
        </section>

        {/* Solution */}
        <section className="border-b border-divider" style={{ padding: '48px 40px' }}>
          <RuleLabel number="SOLUTION_" />
          <p className="font-mono mb-8" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
            {solution ?? ''}
          </p>
          <div className="w-full mb-1" style={{ height: '480px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
          <div className="grid grid-cols-2" style={{ gap: '2px' }}>
            <div style={{ height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
            <div style={{ height: '320px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
          </div>
        </section>

        {/* Reflection */}
        <section className="border-b border-divider" style={{ padding: '48px 40px' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.16em', color: '#666666' }}>
              REFLECTION
            </span>
            <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.8, maxWidth: '66%' }}>
              {reflection ?? 'This project pushed me to think more carefully about edge cases and accessibility. If I were to revisit it, I would invest more time in testing with a wider range of users.'}
            </p>
          </div>
        </section>

        {/* Prev / Next */}
        <div className="grid grid-cols-2 border-b border-divider">
          <div className="border-r border-divider" style={{ padding: '28px 40px' }}>
            {prev ? (
              <Link href={`${basePath}/${prev.slug}`} className="block">
                <p className="font-mono mb-2" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.12em', color: '#FF3120' }}>
                  <span className="arrow-nudge-back">←</span> PREV
                </p>
                <p className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#666666' }}>
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', color: '#2a2a2a' }}>—</span>
            )}
          </div>
          <div className="text-right" style={{ padding: '28px 40px' }}>
            {next ? (
              <Link href={`${basePath}/${next.slug}`} className="block">
                <p className="font-mono mb-2" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.12em', color: '#FF3120' }}>
                  NEXT <span className="arrow-nudge">→</span>
                </p>
                <p className="font-serif" style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: '#666666' }}>
                  {next.title}
                </p>
              </Link>
            ) : (
              <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', color: '#2a2a2a' }}>—</span>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
