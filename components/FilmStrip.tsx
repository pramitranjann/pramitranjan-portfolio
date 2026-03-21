// components/FilmStrip.tsx

const frames = [
  { label: 'KL · 001', stock: '35mm',  width: 90 },
  { label: 'KL · 002', stock: '35mm',  width: 90 },
  { label: 'PG · 003', stock: 'HP5+',  width: 66 },
  { label: 'SG · 004', stock: 'X-TRA', width: 90 },
  { label: 'KL · 005', stock: '35mm',  width: 90 },
  { label: '',          stock: '',      width: 50, faded: true },
]

function Holes() {
  return (
    <div className="flex" style={{ gap: '18px', padding: '0 12px' }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0"
          style={{
            width: '12px',
            height: '8px',
            backgroundColor: '#0d0d0d',
            border: '1px solid #1f1f1f',
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  )
}

export function FilmStrip() {
  return (
    <div style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '8px 0' }}>
      <Holes />

      <div className="flex" style={{ gap: '4px', padding: '6px 12px', overflow: 'hidden' }}>
        {frames.map((frame, i) => (
          <div
            key={i}
            className="flex-shrink-0"
            style={{ opacity: frame.faded ? 0.3 : 1 }}
          >
            <div
              style={{
                width: `${frame.width}px`,
                height: '130px',
                backgroundColor: '#161616',
                border: '1px solid #222222',
              }}
            />
            {!frame.faded && (
              <>
                <div
                  className="font-mono"
                  style={{ fontSize: '7px', letterSpacing: '0.1em', color: '#2a2a2a', textAlign: 'center', marginTop: '3px' }}
                >
                  {frame.label}
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: '7px', letterSpacing: '0.08em', color: '#FF3120', textAlign: 'center' }}
                >
                  {frame.stock}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <Holes />
    </div>
  )
}
