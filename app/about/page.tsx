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
        fontSize: '11px',
        letterSpacing: '0.14em',
        color: '#FF3120',
        border: '1px solid #FF3120',
        padding: '10px 20px',
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
        <section className="border-b border-divider" style={{ padding: '64px 40px' }}>
          <RuleLabel number="ABOUT_" />
          <h1
            className="font-serif"
            style={{ fontSize: 'clamp(42px, 7vw, 72px)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '28px' }}
          >
            Artist. Designer.{' '}
            <span style={{ color: '#FF3120' }}>Human.</span>
          </h1>
          <p
            className="font-mono"
            style={{ fontSize: '15px', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '560px', marginBottom: '40px' }}
          >
            UX design student at SCAD, figuring out what good design can actually do. I think like a designer but see like an artist. Still learning. Always curious.
          </p>
          <CVButton />
        </section>

        {/* Professional Activities */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <div className="about-page-grid grid" style={{ gridTemplateColumns: '200px 1fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.16em', color: '#f5f2ed', paddingTop: '4px' }}>
              PROFESSIONAL<br />ACTIVITIES
            </span>
            <div className="flex flex-col" style={{ gap: '40px' }}>
              {professionalActivities.map((item) => (
                <div key={item.org}>
                  <div className="flex items-start justify-between" style={{ gap: '16px', marginBottom: '6px' }}>
                    <span className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.08em', color: '#FF3120', lineHeight: 1.4 }}>
                      {item.org}
                    </span>
                    <span className="font-mono flex-shrink-0" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#444444' }}>
                      {item.date}
                    </span>
                  </div>
                  <p className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#666666', marginBottom: '10px' }}>
                    {item.role}
                  </p>
                  <p className="font-mono" style={{ fontSize: '14px', letterSpacing: '0.03em', color: '#999999', lineHeight: 1.8 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <div className="about-page-grid grid" style={{ gridTemplateColumns: '200px 1fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.16em', color: '#f5f2ed', paddingTop: '4px' }}>
              EDUCATION
            </span>
            <div>
              <div className="flex items-start justify-between" style={{ gap: '16px', marginBottom: '6px' }}>
                <span className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.08em', color: '#FF3120', lineHeight: 1.4 }}>
                  Savannah College of Art and Design (SCAD)
                </span>
                <span className="font-mono flex-shrink-0" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#444444' }}>
                  2024 — PRESENT
                </span>
              </div>
              <p className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#666666', marginBottom: '10px' }}>
                BFA, UX DESIGN
              </p>
              <p className="font-mono" style={{ fontSize: '14px', letterSpacing: '0.03em', color: '#999999', lineHeight: 1.8 }}>
                Studying interaction design, user research, and design systems at one of the top art and design universities in the world.
              </p>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <div className="about-page-grid grid" style={{ gridTemplateColumns: '200px 1fr', gap: '48px' }}>
            <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.16em', color: '#f5f2ed', paddingTop: '4px' }}>
              TOOLS
            </span>
            <div className="flex flex-wrap" style={{ gap: '8px' }}>
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="font-mono"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    color: '#999999',
                    border: '1px solid #1f1f1f',
                    padding: '6px 14px',
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CV download — repeated */}
        <section style={{ padding: '56px 40px' }}>
          <CVButton />
        </section>

      </main>
      <Footer />
    </>
  )
}
