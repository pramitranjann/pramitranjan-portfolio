// app/about/page.tsx
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { RuleLabel } from '@/components/RuleLabel'

function CVButton() {
  return (
    <a
      href="#"
      className="font-mono inline-block"
      style={{
        fontSize: '9px',
        letterSpacing: '0.14em',
        color: '#FF3120',
        border: '1px solid #FF3120',
        padding: '8px 16px',
        textDecoration: 'none',
      }}
    >
      DOWNLOAD CV →
    </a>
  )
}

const tools = ['FIGMA', 'ADOBE CREATIVE SUITE', 'CLAUDE CODE', 'VIBE CODING']

const professionalActivities = [
  { org: 'FigBuild 2026',                        role: 'PARTICIPANT', date: '2026',    desc: "Participated in Figma's design challenge to build an app." },
  { org: 'FLUXathon (48-Hour Design Challenge)', role: 'PARTICIPANT', date: '2026',    desc: 'Designed a weather forecasting app using Claude AI. Judged by Google.' },
  { org: 'FLUX Club',                            role: 'MEMBER',      date: 'ONGOING', desc: 'Building strong Figma skills through Figma Fridays.' },
  { org: 'Rocket × FLUX (3-Day Design Sprint)',  role: 'PARTICIPANT', date: '2026',    desc: 'Redesigned the Passio Go app using Figma Make — exploring how design ideology is shifting in the age of AI.' },
]

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>

        {/* Hero */}
        <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
          <RuleLabel number="ABOUT_" />
          <h1
            className="font-serif"
            style={{ fontSize: '42px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1, marginBottom: '24px' }}
          >
            Artist. Designer.{' '}
            <span style={{ color: '#FF3120' }}>Human.</span>
          </h1>
          <p
            className="font-mono"
            style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#f5f2ed', lineHeight: 1.7, maxWidth: '560px', marginBottom: '32px' }}
          >
            UX design student at SCAD, figuring out what good design can actually do. I think like a designer but see like an artist. Still learning. Always curious.
          </p>
          <CVButton />
        </section>

        {/* Professional Activities */}
        <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
              PROFESSIONAL ACTIVITIES
            </span>
            <div className="flex flex-col" style={{ gap: '32px' }}>
              {professionalActivities.map((item) => (
                <div key={item.org}>
                  <div className="flex items-start justify-between" style={{ marginBottom: '6px' }}>
                    <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#FF3120' }}>
                      {item.org}
                    </span>
                    <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#666666' }}>
                      {item.date}
                    </span>
                  </div>
                  <p className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#666666', marginBottom: '4px' }}>
                    {item.role}
                  </p>
                  <p className="font-mono" style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#f5f2ed', lineHeight: 1.7 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
              EDUCATION
            </span>
            <div>
              <div className="flex items-start justify-between" style={{ marginBottom: '6px' }}>
                <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#FF3120' }}>
                  Savannah College of Art and Design (SCAD)
                </span>
                <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#666666' }}>
                  2024 — PRESENT
                </span>
              </div>
              <p className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#666666', marginBottom: '4px' }}>
                BFA, UX DESIGN
              </p>
              <p className="font-mono" style={{ fontSize: '12px', letterSpacing: '0.1em', color: '#f5f2ed', lineHeight: 1.7 }}>
                Studying interaction design, user research, and design systems at one of the top art and design universities in the world.
              </p>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="border-b border-divider" style={{ padding: '48px 24px' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
              TOOLS
            </span>
            <div className="flex flex-wrap" style={{ gap: '8px' }}>
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="font-mono"
                  style={{
                    fontSize: '9px',
                    letterSpacing: '0.12em',
                    color: '#666666',
                    border: '1px solid #1f1f1f',
                    padding: '4px 10px',
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CV download — repeated */}
        <section style={{ padding: '48px 24px' }}>
          <CVButton />
        </section>

      </main>
      <Footer />
    </>
  )
}
