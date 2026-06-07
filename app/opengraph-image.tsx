import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const clashDisplayRegular = fetch(
  'https://cdn.fontshare.com/wf/VFMK2COV3DN37JR7JQ4CAOJPZ7KWKNY7/ODD5YJNDLHZZB2MIT3DPVH4EIHAMZ34D/BSY64LPTT3OPLVKAZKL3AHKRWZ3D74AC.ttf'
).then((response) => response.arrayBuffer())

export default async function OGImage() {
  const clashDisplayRegularData = await clashDisplayRegular

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0d0d0d',
          display: 'flex',
          padding: 28,
          fontFamily: '"Clash Display"',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            border: '1px solid #1f1f1f',
            background:
              'radial-gradient(circle at top right, rgba(255, 49, 32, 0.12), transparent 24%), linear-gradient(180deg, #111111 0%, #0d0d0d 100%)',
            padding: '46px 48px',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                fontFamily: 'monospace',
                fontSize: 20,
                letterSpacing: '0.24em',
                color: '#FF3120',
              }}
            >
              <div style={{ width: 54, height: 2, background: '#FF3120', display: 'flex' }} />
              <div style={{ display: 'flex' }}>PR_</div>
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
              gap: 22,
              maxWidth: 880,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                fontSize: 104,
                lineHeight: 0.9,
                letterSpacing: '-0.055em',
                color: '#f5f2ed',
              }}
            >
              Pramit Ranjan.
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                gap: 12,
                fontSize: 70,
                lineHeight: 0.95,
                letterSpacing: '-0.05em',
                color: '#f5f2ed',
              }}
            >
              <span style={{ display: 'flex' }}>Artist.</span>
              <span style={{ display: 'flex' }}>Designer.</span>
              <span style={{ display: 'flex', color: '#FF3120' }}>Human.</span>
            </div>

            <div
              style={{
                display: 'flex',
                fontFamily: 'monospace',
                fontSize: 22,
                letterSpacing: '0.05em',
                lineHeight: 1.6,
                color: '#999999',
                maxWidth: 760,
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
                gap: 12,
                fontFamily: 'monospace',
                fontSize: 18,
                letterSpacing: '0.16em',
                color: '#666666',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  border: '1px solid #1f1f1f',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '12px 16px',
                }}
              >
                WORK
              </div>
              <div
                style={{
                  display: 'flex',
                  border: '1px solid #1f1f1f',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '12px 16px',
                }}
              >
                PLAY
              </div>
              <div
                style={{
                  display: 'flex',
                  border: '1px solid #1f1f1f',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '12px 16px',
                }}
              >
                CREATIVE
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 8,
                fontFamily: 'monospace',
                fontSize: 18,
                letterSpacing: '0.16em',
              }}
            >
              <div style={{ display: 'flex', color: '#f5f2ed' }}>PRAMITRANJAN.COM</div>
              <div style={{ display: 'flex', color: '#666666' }}>KUALA LUMPUR / SAVANNAH</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Clash Display',
          data: clashDisplayRegularData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
