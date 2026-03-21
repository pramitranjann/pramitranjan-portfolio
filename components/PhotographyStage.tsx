import Link from 'next/link'

// 5 frames at 90px + 4px gaps + 10px side padding = 486px total
// 20 holes at 10px + 14px gaps + 10px side padding = 486px — exact match
const FRAME_W = 90
const FRAME_H = 195
const SIDE_PAD = 10
const FRAME_GAP = 4
const HOLE_COUNT = 20

const frames = [
  { label: 'KL · 001' },
  { label: 'KL · 002' },
  { label: 'PG · 003' },
  { label: 'SG · 004' },
  { label: 'HCM · 001' },
]

function Holes() {
  return (
    <div className="flex" style={{ gap: '14px', padding: `0 ${SIDE_PAD}px` }}>
      {Array.from({ length: HOLE_COUNT }).map((_, i) => (
        <div key={i} className="flex-shrink-0" style={{ width: '10px', height: '7px', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: '2px' }} />
      ))}
    </div>
  )
}

export function PhotographyStage() {
  return (
    <section style={{
      borderTop: '1px solid #1f1f1f',
      borderBottom: '1px solid #1f1f1f',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '360px',
      alignItems: 'stretch',
      padding: '64px 40px',
      gap: '56px',
    }}>
      {/* Text left */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="flex items-center" style={{ gap: '10px', marginBottom: '22px' }}>
            <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#FF3120' }}>THE EYE CAME FIRST.</span>
          </div>
          <h2 className="font-serif italic" style={{ fontSize: '48px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.1, marginBottom: '24px' }}>
            Before <span style={{ color: '#FF3120' }}>Figma,</span><br />there was <span style={{ color: '#FF3120' }}>film.</span>
          </h2>
          <p className="font-mono" style={{ fontSize: '13px', letterSpacing: '0.06em', color: '#999999', lineHeight: 1.9, maxWidth: '340px' }}>
            Street photography across Southeast Asia. Shot on 35mm and medium format. Always looking.
          </p>
        </div>
        <Link href="/creative/photography" className="font-mono" style={{ display: 'inline-block', marginTop: '24px', fontSize: '10px', color: '#FF3120', letterSpacing: '0.12em', textDecoration: 'none' }}>
          VIEW ALL →
        </Link>
      </div>

      {/* Film strip — height matches text column */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <div style={{ backgroundColor: '#060606', padding: '14px 0', width: 'fit-content', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Holes />
          <div className="flex" style={{ gap: `${FRAME_GAP}px`, padding: `8px ${SIDE_PAD}px` }}>
            {frames.map((frame) => (
              <div key={frame.label} className="flex-shrink-0">
                <div style={{ width: `${FRAME_W}px`, height: `${FRAME_H}px`, backgroundColor: '#161616', border: '1px solid #222222' }} />
                <div className="font-mono" style={{ fontSize: '7px', color: '#FF3120', textAlign: 'center', marginTop: '4px', letterSpacing: '0.1em' }}>{frame.label}</div>
              </div>
            ))}
          </div>
          <Holes />
        </div>
      </div>
    </section>
  )
}
