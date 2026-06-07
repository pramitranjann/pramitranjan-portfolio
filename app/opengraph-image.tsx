import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0d0d0d',
          display: 'flex',
          padding: 36,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            border: '1px solid #1f1f1f',
            background: 'linear-gradient(180deg, #111111 0%, #0d0d0d 100%)',
            padding: '54px 56px',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
              }}
            >
              <div style={{ width: 52, height: 2, background: '#FF3120', display: 'flex' }} />
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'monospace',
                  fontSize: 20,
                  letterSpacing: '0.24em',
                  color: '#FF3120',
                }}
              >
                PR_
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                fontFamily: 'monospace',
                fontSize: 18,
                letterSpacing: '0.16em',
                color: '#666666',
              }}
            >
              PORTFOLIO
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              maxWidth: 860,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 92,
                lineHeight: 0.94,
                letterSpacing: '-0.04em',
                color: '#f5f2ed',
              }}
            >
              <div style={{ display: 'flex' }}>Pramit Ranjan.</div>
              <div style={{ display: 'flex', color: '#FF3120' }}>Artist. Designer. Human.</div>
            </div>

            <div
              style={{
                display: 'flex',
                fontFamily: 'monospace',
                fontSize: 24,
                letterSpacing: '0.05em',
                lineHeight: 1.6,
                color: '#999999',
                maxWidth: 900,
              }}
            >
              UX design student at SCAD. Research-led product design, creative work, and photography.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontFamily: 'monospace',
                fontSize: 20,
                letterSpacing: '0.18em',
                color: '#f5f2ed',
              }}
            >
              PRAMITRANJAN.COM
            </div>

            <div
              style={{
                display: 'flex',
                fontFamily: 'monospace',
                fontSize: 18,
                letterSpacing: '0.16em',
                color: '#666666',
              }}
            >
              KUALA LUMPUR / SAVANNAH
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
