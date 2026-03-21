// components/FilmStrip.tsx

const frames = [
  { label: 'KL · 001' },
  { label: 'KL · 002' },
  { label: 'SG · 001' },
  { label: 'SG · 002' },
  { label: 'HCM · 001' },
]

function Sprockets({ count = 10 }: { count?: number }) {
  return (
    <div className="flex items-center" style={{ gap: '6px', padding: '4px 8px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0"
          style={{
            width: '8px',
            height: '6px',
            backgroundColor: '#0d0d0d',
            border: '1px solid #222222',
            borderRadius: '1px',
          }}
        />
      ))}
    </div>
  )
}

export function FilmStrip() {
  return (
    <div style={{ backgroundColor: '#060606', padding: '10px 0' }}>
      <Sprockets count={10} />

      <div className="flex" style={{ gap: '2px', padding: '4px 8px' }}>
        {frames.map((frame, i) => (
          <div
            key={frame.label}
            className="flex-shrink-0 flex flex-col justify-end"
            style={{
              width: '120px',
              height: '90px',
              backgroundColor: '#161616',
              border: '1px solid #222222',
              padding: '6px',
              opacity: i === frames.length - 1 ? 0.3 : 1,
            }}
          >
            <span
              className="font-mono"
              style={{ fontSize: '7px', letterSpacing: '0.1em', color: '#FF3120' }}
            >
              {frame.label}
            </span>
          </div>
        ))}
      </div>

      <Sprockets count={10} />
    </div>
  )
}
