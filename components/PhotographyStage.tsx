import Link from 'next/link'

const frames = [
  { label: 'KL · 001', width: 100 },
  { label: 'KL · 002', width: 100 },
  { label: 'PG · 003', width: 76 },
]

function Holes() {
  return (
    <div className="flex" style={{ gap: '14px', padding: '0 12px' }}>
      {Array.from({ length: 12 }).map((_, i) => (
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
      minHeight: '267px',
      alignItems: 'center',
      padding: '48px 32px',
      gap: '44px',
    }}>
      {/* Text left */}
      <div>
        <div className="flex items-center" style={{ gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
          <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#FF3120' }}>THE EYE CAME FIRST.</span>
        </div>
        <h2 className="font-serif italic" style={{ fontSize: '36px', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.15, marginBottom: '20px' }}>
          Before <span style={{ color: '#FF3120' }}>Figma,</span><br />there was <span style={{ color: '#FF3120' }}>film.</span>
        </h2>
        <p className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.08em', color: '#999999', lineHeight: 1.9, maxWidth: '300px' }}>
          Street photography across Southeast Asia. Shot on 35mm and medium format. Always looking.
        </p>
        <Link href="/creative/photography" className="font-mono" style={{ display: 'inline-block', marginTop: '20px', fontSize: '9px', color: '#FF3120', letterSpacing: '0.12em', textDecoration: 'none' }}>
          VIEW ALL →
        </Link>
      </div>

      {/* Compact film strip right */}
      <div style={{ backgroundColor: '#060606', padding: '12px 0' }}>
        <Holes />
        <div className="flex" style={{ gap: '3px', padding: '8px 12px', overflow: 'hidden' }}>
          {frames.map((frame) => (
            <div key={frame.label} className="flex-shrink-0">
              <div style={{ width: `${frame.width}px`, height: '146px', backgroundColor: '#161616', border: '1px solid #222222' }} />
              <div className="font-mono" style={{ fontSize: '7px', color: '#FF3120', textAlign: 'center', marginTop: '4px', letterSpacing: '0.1em' }}>{frame.label}</div>
            </div>
          ))}
          <div className="flex-shrink-0" style={{ opacity: 0.3 }}>
            <div style={{ width: '48px', height: '146px', backgroundColor: '#161616', border: '1px solid #222222' }} />
          </div>
        </div>
        <Holes />
      </div>
    </section>
  )
}
