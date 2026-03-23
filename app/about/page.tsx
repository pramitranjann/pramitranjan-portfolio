// app/about/page.tsx
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

function CVButton() {
  return (
    <a
      href="/pramit-ranjan-cv.pdf"
      download
      className="font-mono inline-block"
      style={{
        fontSize: 'var(--text-meta)',
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

// Eyebrow label used for section columns
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono"
      style={{ fontSize: 'var(--text-body)', letterSpacing: '0.14em', color: '#f5f2ed', paddingTop: '6px', lineHeight: 1.6 }}
    >
      {children}
    </span>
  )
}

const tools = ['FIGMA', 'ADOBE CREATIVE SUITE', 'CLAUDE CODE', 'VIBE CODING']

const experience = [
  { org: 'Vircle Malaysia',       role: 'GROWTH INTERN',       date: 'JUL 2024 — AUG 2024', desc: 'Designed sticker packs for Vircle × Minions Despicable Me 4 collaboration — included in the packaging of each card sold. Created hero images and prototyped a school landing page.' },
  { org: 'SOHO Exhibition',       role: 'EXHIBITION DIRECTOR', date: 'SEP 2023 — JAN 2024',  desc: 'Chaired the annual sixth form art exhibition. Responsible for organising all departments, delegating tasks, managing logistics, and producing all branding and marketing materials.' },
  { org: 'Moving Walls Malaysia', role: 'MARKETING INTERN',    date: 'JUL 2023 — AUG 2023',  desc: 'Part of the marketing team creating social media content. Tasked with starting and managing the company TikTok page — ideating, filming, and optimising for engagement.' },
]

const professionalActivities = [
  { org: 'FigBuild 2026',                        role: 'PARTICIPANT', date: '2026',    desc: "Participated in Figma's 2026 3 day design challenge to build an app and built Accord." },
  { org: 'FLUXathon (48-Hour Design Challenge)', role: 'PARTICIPANT', date: '2026',    desc: 'Designed a weather forecasting app for per ownners using Claude AI. Judged by Google.' },
  { org: 'FLUX Club',                            role: 'MEMBER',      date: 'ONGOING', desc: 'Building strong Figma skills through Figma Fridays.' },
  { org: 'Rocket × FLUX (3-Day Design Sprint)',  role: 'PARTICIPANT', date: '2026',    desc: 'Redesigned the Passio Go app using Figma Make — exploring how design ideology is shifting in the age of AI.' },
]

function EntryList({ items }: { items: typeof experience }) {
  return (
    <div className="flex flex-col" style={{ gap: '40px' }}>
      {items.map((item) => (
        <div key={item.org}>
          {/* H3 — org/institution name */}
          <h3
            className="font-serif"
            style={{ fontSize: 'var(--text-h3)', fontStyle: 'italic', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2, marginBottom: '8px' }}
          >
            {item.org}
          </h3>
          {/* Meta row — role + date */}
          <div className="flex items-center justify-between" style={{ gap: '16px', marginBottom: '12px' }}>
            <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#FF3120' }}>
              {item.role}
            </span>
            <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#999999' }}>
              {item.date}
            </span>
          </div>
          {/* Body */}
          <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.03em', color: '#999999', lineHeight: 1.8 }}>
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>

        {/* Hero */}
        <section className="border-b border-divider" style={{ padding: '64px 40px' }}>
          {/* Eyebrow */}
          <div className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>ABOUT_</span>
          </div>
          {/* H1 */}
          <h1
            className="font-serif"
            style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '28px' }}
          >
            Artist. Designer.{' '}
            <span style={{ color: '#FF3120' }}>Human.</span>
          </h1>
          {/* Body LG */}
          <p
            className="font-mono"
            style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '560px', marginBottom: '40px' }}
          >
            UX design student at SCAD, figuring out what good design can actually do. I think like a designer but see like an artist. Still learning. Always curious.
          </p>
          <div className="flex items-center justify-between">
            <CVButton />
            <span className="font-mono select-none" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#666666' }}>
              SCROLL ↓
            </span>
          </div>
        </section>

        {/* Experience */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <div className="about-page-grid grid" style={{ gridTemplateColumns: '160px 1fr', gap: '48px' }}>
            <SectionLabel>EXPERIENCE_</SectionLabel>
            <EntryList items={experience} />
          </div>
        </section>

        {/* Professional Activities */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <div className="about-page-grid grid" style={{ gridTemplateColumns: '160px 1fr', gap: '48px' }}>
            <SectionLabel>PROFESSIONAL<br />ACTIVITIES</SectionLabel>
            <EntryList items={professionalActivities} />
          </div>
        </section>

        {/* Education */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <div className="about-page-grid grid" style={{ gridTemplateColumns: '160px 1fr', gap: '48px' }}>
            <SectionLabel>EDUCATION_</SectionLabel>
            <div className="flex flex-col" style={{ gap: '40px' }}>
              <div>
                <h3 className="font-serif" style={{ fontSize: 'var(--text-h3)', fontStyle: 'italic', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2, marginBottom: '8px' }}>
                  Savannah College of Art and Design (SCAD)
                </h3>
                <div className="flex items-center justify-between" style={{ gap: '16px', marginBottom: '12px' }}>
                  <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#FF3120' }}>BFA, UX DESIGN</span>
                  <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#999999' }}>2025 — PRESENT</span>
                </div>
                <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.03em', color: '#999999', lineHeight: 1.8 }}>
                  Bachelor of Fine Arts in UX Design. Freshman year. Coursework spans interaction design, user research, prototyping, and design systems.
                </p>
              </div>
              <div>
                <h3 className="font-serif" style={{ fontSize: 'var(--text-h3)', fontStyle: 'italic', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2, marginBottom: '8px' }}>
                  Garden International School
                </h3>
                <div className="flex items-center justify-between" style={{ gap: '16px', marginBottom: '12px' }}>
                  <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#FF3120' }}>A LEVELS</span>
                  <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#999999' }}>SEP 2023 — JUN 2025</span>
                </div>
                <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.03em', color: '#999999', lineHeight: 1.8 }}>
                  Photography · Design and Technology · Business Studies
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <div className="about-page-grid grid" style={{ gridTemplateColumns: '160px 1fr', gap: '48px' }}>
            <SectionLabel>TOOLS</SectionLabel>
            <div className="flex flex-wrap" style={{ gap: '8px' }}>
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-meta)',
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

        {/* Contact CTA */}
        <section className="about-page-section" style={{ padding: '72px 40px' }}>
          <div style={{ maxWidth: '560px' }}>
            <h2
              className="font-serif"
              style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '20px' }}
            >
              Let's make something{' '}
              <span style={{ color: '#FF3120' }}>worth making.</span>
            </h2>
            <p
              className="font-mono"
              style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#666666', lineHeight: 1.9, marginBottom: '36px' }}
            >
              Or just say hello. Either works.
            </p>
            <div className="flex items-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
              <a
                href="mailto:pramit@pramitranjann.com"
                className="font-mono"
                style={{
                  fontSize: 'var(--text-meta)',
                  letterSpacing: '0.14em',
                  color: '#FF3120',
                  border: '1px solid #FF3120',
                  padding: '10px 20px',
                  textDecoration: 'none',
                }}
              >
                SAY HELLO →
              </a>
              <CVButton />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
