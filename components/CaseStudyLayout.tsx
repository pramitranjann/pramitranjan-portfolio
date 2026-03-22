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
}

export function CaseStudyLayout({ title, oneliner, type, tags, prev, next }: CaseStudyLayoutProps) {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>

        {/* Back link */}
        <div style={{ padding: '24px 24px 0' }}>
          <Link
            href="/work"
            className="font-mono"
            style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#444444' }}
          >
            <span className="arrow-nudge-back">←</span> WORK
          </Link>
        </div>

        {/* Hero — 50/50 grid */}
        <section
          className="grid grid-cols-2 border-b border-divider"
          style={{ minHeight: '280px' }}
        >
          {/* Left: text */}
          <div
            className="flex flex-col justify-end border-r border-divider"
            style={{ padding: '48px 24px' }}
          >
            <RuleLabel number={type} />
            <h1
              className="font-serif"
              style={{ fontSize: '42px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1 }}
            >
              {title}
            </h1>
            <p
              className="font-serif italic mt-3"
              style={{ fontSize: '16px', fontWeight: 400, color: '#666666' }}
            >
              {oneliner}
            </p>
          </div>
          {/* Right: image placeholder — full bleed */}
          <div style={{ backgroundColor: '#161616' }} />
        </section>

        {/* Overview */}
        <section
          className="border-b border-divider"
          style={{ padding: '48px 24px' }}
        >
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
              OVERVIEW
            </span>
            <p className="font-mono" style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#999999', lineHeight: 1.7 }}>
              This project focused on understanding user needs and translating them into a cohesive design solution. Through research, ideation, and iteration, the final product addresses real problems with intentional design decisions.
            </p>
          </div>
        </section>

        {/* My Role */}
        <section
          className="border-b border-divider"
          style={{ padding: '48px 24px' }}
        >
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
              MY ROLE
            </span>
            <div>
              <p className="font-mono mb-6" style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#999999', lineHeight: 1.7 }}>
                Led end-to-end UX design including research planning, synthesis, interaction design, and high-fidelity prototyping.
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono"
                    style={{
                      fontSize: '9px',
                      letterSpacing: '0.12em',
                      color: '#444444',
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
        <section
          className="border-b border-divider"
          style={{ padding: '48px 24px' }}
        >
          <RuleLabel number="PROCESS_" />

          {/* Research */}
          <div className="mb-10">
            <p className="font-mono mb-3" style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#FF3120' }}>
              RESEARCH_
            </p>
            <p className="font-mono" style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#999999', lineHeight: 1.7, maxWidth: '640px' }}>
              Conducted user interviews and competitive analysis to understand the landscape. Synthesised findings into key themes that informed the design direction.
            </p>
            {/* Process image placeholder */}
            <div
              className="mt-6 w-full"
              style={{ height: '240px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }}
            />
          </div>

          {/* Ideation */}
          <div className="mb-10">
            <p className="font-mono mb-3" style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#FF3120' }}>
              IDEATION_
            </p>
            <p className="font-mono" style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#999999', lineHeight: 1.7, maxWidth: '640px' }}>
              Explored multiple directions through sketching and low-fidelity wireframes. Narrowed down to the strongest concept based on user feedback and feasibility.
            </p>
            {/* 2-col image grid */}
            <div className="mt-6 grid grid-cols-2" style={{ gap: '2px' }}>
              <div style={{ height: '200px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
              <div style={{ height: '200px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
            </div>
          </div>

          {/* Key Decisions */}
          <div>
            <p className="font-mono mb-3" style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#FF3120' }}>
              KEY DECISIONS_
            </p>
            <p className="font-mono" style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#999999', lineHeight: 1.7, maxWidth: '640px' }}>
              Prioritised clarity over feature richness. Key interaction patterns were validated through usability testing and refined in subsequent iterations.
            </p>
          </div>
        </section>

        {/* Solution */}
        <section
          className="border-b border-divider"
          style={{ padding: '48px 24px' }}
        >
          <RuleLabel number="SOLUTION_" />
          {/* Full width hero image */}
          <div
            className="w-full mb-1"
            style={{ height: '360px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }}
          />
          {/* 2-col image grid */}
          <div className="grid grid-cols-2" style={{ gap: '2px' }}>
            <div style={{ height: '240px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
            <div style={{ height: '240px', backgroundColor: '#161616', border: '1px solid #1a1a1a' }} />
          </div>
        </section>

        {/* Reflection */}
        <section
          className="border-b border-divider"
          style={{ padding: '48px 24px' }}
        >
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
              REFLECTION
            </span>
            <p className="font-mono" style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#999999', lineHeight: 1.7 }}>
              This project pushed me to think more carefully about edge cases and accessibility. If I were to revisit it, I would invest more time in testing with a wider range of users. It reinforced how important iteration is — the best ideas rarely survive first contact with real users unchanged.
            </p>
          </div>
        </section>

        {/* Prev / Next */}
        <div className="grid grid-cols-2 border-b border-divider">
          {/* Prev */}
          <div className="border-r border-divider" style={{ padding: '28px 24px' }}>
            {prev ? (
              <Link href={`/work/${prev.slug}`} className="block">
                <p className="font-mono mb-2" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#FF3120' }}>
                  <span className="arrow-nudge-back">←</span> PREV
                </p>
                <p className="font-serif" style={{ fontSize: '16px', fontWeight: 400, color: '#666666' }}>
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span className="font-mono" style={{ fontSize: '9px', color: '#2a2a2a' }}>—</span>
            )}
          </div>
          {/* Next */}
          <div className="text-right" style={{ padding: '28px 24px' }}>
            {next ? (
              <Link href={`/work/${next.slug}`} className="block">
                <p className="font-mono mb-2" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#FF3120' }}>
                  NEXT <span className="arrow-nudge">→</span>
                </p>
                <p className="font-serif" style={{ fontSize: '16px', fontWeight: 400, color: '#666666' }}>
                  {next.title}
                </p>
              </Link>
            ) : (
              <span className="font-mono" style={{ fontSize: '9px', color: '#2a2a2a' }}>—</span>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
