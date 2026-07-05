// app/lab/page.tsx
import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { GsapReveal } from '@/components/GsapReveal'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'
import { buildBreadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: 'Lab',
    description:
      'PR Life — a private life-OS Pramit Ranjan designed and built for himself. Next.js, Supabase, and a thermal receipt printer that prints his day.',
    path: '/lab',
    keywords: ['PR Life', 'life-OS', 'personal software', 'thermal receipt printer'],
  })
}

// Diagram box — mono label inside a hairline rect
function DiagramBox({
  x,
  y,
  w,
  h,
  lines,
  accent = false,
}: {
  x: number
  y: number
  w: number
  h: number
  lines: string[]
  accent?: boolean
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0d0d0d" stroke={accent ? '#FF3120' : '#1f1f1f'} />
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + w / 2}
          y={y + h / 2 + (i - (lines.length - 1) / 2) * 14 + 3.5}
          textAnchor="middle"
          className="font-mono"
          style={{ fontSize: '10px', letterSpacing: '0.12em' }}
          fill={i === 0 ? (accent ? '#FF3120' : '#f5f2ed') : '#999999'}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 720 320"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PR Life architecture: voice capture and quick add feed a Next.js app at /life, backed by Supabase in sin1, surfacing a week view, reports, a studio gallery, and a BLE thermal receipt printer driven by an ESP32 worker."
      style={{ width: '100%', maxWidth: '720px', height: 'auto', display: 'block' }}
    >
      <defs>
        <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0,0 L8,4 L0,8" fill="none" stroke="#666666" strokeWidth="1" />
        </marker>
        <marker id="arr-red" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0,0 L8,4 L0,8" fill="none" stroke="#FF3120" strokeWidth="1" />
        </marker>
      </defs>

      {/* Capture inputs */}
      <DiagramBox x={0} y={40} w={150} h={44} lines={['VOICE CAPTURE', 'PHONE']} />
      <DiagramBox x={0} y={116} w={150} h={44} lines={['QUICK ADD']} />

      {/* App */}
      <DiagramBox x={250} y={78} w={180} h={44} lines={['NEXT.JS', '/LIFE']} accent />

      {/* Database */}
      <DiagramBox x={250} y={196} w={180} h={44} lines={['SUPABASE', 'SIN1']} />

      {/* Surfaces */}
      <DiagramBox x={530} y={8} w={190} h={40} lines={['WEEK / MONTH VIEW']} />
      <DiagramBox x={530} y={68} w={190} h={40} lines={['REPORTS']} />
      <DiagramBox x={530} y={128} w={190} h={40} lines={['STUDIO']} />
      <DiagramBox x={530} y={216} w={190} h={56} lines={['RECEIPT PRINTER', 'ESP32 → BLE']} accent />

      {/* Capture → app */}
      <path d="M150,62 H200 V92 H244" fill="none" stroke="#666666" markerEnd="url(#arr)" />
      <path d="M150,138 H200 V108 H244" fill="none" stroke="#666666" markerEnd="url(#arr)" />

      {/* App ↔ database */}
      <path d="M334,122 V190" fill="none" stroke="#666666" markerEnd="url(#arr)" />
      <path d="M346,196 V128" fill="none" stroke="#666666" markerEnd="url(#arr)" />

      {/* App → surfaces */}
      <path d="M430,92 H480 V28 H524" fill="none" stroke="#666666" markerEnd="url(#arr)" />
      <path d="M430,96 H480 V88 H524" fill="none" stroke="#666666" markerEnd="url(#arr)" />
      <path d="M430,104 H480 V148 H524" fill="none" stroke="#666666" markerEnd="url(#arr)" />

      {/* App → printer (worker polls the API for jobs) */}
      <path d="M430,112 H480 V244 H524" fill="none" stroke="#FF3120" markerEnd="url(#arr-red)" />
      <text x={492} y={296} className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.12em' }} fill="#666666" textAnchor="middle">
        WORKER POLLS /API FOR PRINT JOBS
      </text>
    </svg>
  )
}

// Stylized receipt — there is no printer photo; this is rendered in CSS
function Receipt() {
  const line = { borderTop: '1px dashed rgba(26,26,26,0.35)', margin: '14px 0' } as const
  const task = { fontSize: '11px', letterSpacing: '0.06em', lineHeight: 2, color: '#1a1a1a' } as const
  return (
    <div className="font-mono" style={{ width: '264px', maxWidth: '100%' }}>
      <div style={{ background: '#f5f2ed', padding: '26px 22px 20px', color: '#1a1a1a' }}>
        <div style={{ fontSize: '13px', letterSpacing: '0.2em', marginBottom: '4px' }}>PR LIFE_</div>
        <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(26,26,26,0.6)' }}>SAT 05 JUL 2026</div>
        <div style={line} />
        <div style={{ fontSize: '10px', letterSpacing: '0.18em', marginBottom: '8px' }}>TODAY</div>
        <div style={task}>[ ] GYM — PULL DAY</div>
        <div style={task}>[ ] STUDIO — CROP SCANS</div>
        <div style={task}>[ ] REPLY TO ADVISOR EMAIL</div>
        <div style={task}>[ ] PORTFOLIO — SHIP LAB PAGE</div>
        <div style={line} />
        <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(26,26,26,0.6)' }}>4 TASKS. GO.</div>
      </div>
      {/* tear-off edge */}
      <div
        aria-hidden
        style={{
          height: '8px',
          background:
            'linear-gradient(45deg, transparent 33.333%, #f5f2ed 33.333%, #f5f2ed 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #f5f2ed 33.333%, #f5f2ed 66.667%, transparent 66.667%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 -8px',
        }}
      />
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <span
      className="font-mono"
      style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#666666', display: 'block', marginBottom: '28px' }}
    >
      {label}
    </span>
  )
}

export default function LabPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Lab', path: '/lab' },
          ]),
        ]}
      />
      <Nav />
      <main style={{ paddingTop: '42px' }}>

        {/* Hero */}
        <section className="border-b border-divider" style={{ padding: '64px 40px' }}>
          <GsapReveal>
            <div data-reveal>
              <AnimatedEyebrow label="LAB_" />
            </div>
            <h1
              data-reveal
              className="font-serif"
              style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: '#f5f2ed', lineHeight: 1.05, marginBottom: '28px' }}
            >
              PR Life.
            </h1>
            <p
              data-reveal
              className="font-mono"
              style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '560px', marginBottom: '32px' }}
            >
              A private life-OS I designed and built for myself — tasks, projects, week and month
              views, reports, a studio gallery. It lives at /life behind a login and runs my actual
              days. This page is as much of it as you get.
            </p>
            <p data-reveal className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#666666' }}>
              Designed and built solo. Next.js, Supabase, Claude Code.
            </p>
          </GsapReveal>
        </section>

        {/* System diagram */}
        <section className="border-b border-divider" style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal>
              <SectionLabel label="SYSTEM_" />
            </div>
            <div data-reveal>
              <ArchitectureDiagram />
            </div>
          </GsapReveal>
        </section>

        {/* Receipt artifact */}
        <section className="border-b border-divider" style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal>
              <SectionLabel label="ARTIFACT_" />
            </div>
            <div data-reveal>
              <Receipt />
            </div>
            <p data-reveal className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#666666', marginTop: '24px' }}>
              What the printer hands me each morning. Rendered here in CSS — the real one is on
              thermal paper.
            </p>
          </GsapReveal>
        </section>

        {/* Cross-links */}
        <section style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal className="flex items-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
              <a
                href="/colophon"
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
                HOW THIS SITE WORKS →
              </a>
              <a
                href="/"
                className="font-mono"
                style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#666666', textDecoration: 'none' }}
              >
                BACK TO HOME
              </a>
            </div>
          </GsapReveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
