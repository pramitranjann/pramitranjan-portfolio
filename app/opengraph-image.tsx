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
              'radial-gradient(circle at top right, rgba(255, 49, 32, 0.14), transparent 26%), linear-gradient(180deg, #111111 0%, #0d0d0d 100%)',
            padding: '46px 48px',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: 760,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 26,
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
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    fontSize: 92,
                    lineHeight: 0.9,
                    letterSpacing: '-0.05em',
                    color: '#f5f2ed',
                    maxWidth: 700,
                  }}
                >
                  Pramit Ranjan.
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    fontSize: 72,
                    lineHeight: 0.95,
                    letterSpacing: '-0.05em',
                    color: '#f5f2ed',
                    maxWidth: 720,
                  }}
                >
                  I think like a
                  <span style={{ color: '#FF3120', marginLeft: 14 }}>designer</span>
                  .
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    fontSize: 72,
                    lineHeight: 0.95,
                    letterSpacing: '-0.05em',
                    color: '#f5f2ed',
                    maxWidth: 720,
                  }}
                >
                  I see like an
                  <span style={{ color: '#FF3120', marginLeft: 14 }}>artist</span>
                  .
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  fontFamily: 'monospace',
                  fontSize: 22,
                  letterSpacing: '0.05em',
                  lineHeight: 1.65,
                  color: '#999999',
                  maxWidth: 700,
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
                fontFamily: 'monospace',
                fontSize: 18,
                letterSpacing: '0.16em',
                color: '#666666',
              }}
            >
              <div style={{ display: 'flex', color: '#f5f2ed' }}>PRAMITRANJAN.COM</div>
              <div style={{ display: 'flex' }}>KUALA LUMPUR / SAVANNAH</div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: 300,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                fontFamily: 'monospace',
                fontSize: 18,
                letterSpacing: '0.16em',
                color: '#666666',
              }}
            >
              PORTFOLIO
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                alignItems: 'stretch',
              }}
            >
              {[
                ['WORK', 'Research-led UX and product design'],
                ['PLAY', 'Games, experiments, and interaction work'],
                ['CREATIVE', 'Photography, mixed media, and visual work'],
              ].map(([label, body]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    border: '1px solid #1f1f1f',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '16px 18px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontFamily: 'monospace',
                      fontSize: 16,
                      letterSpacing: '0.18em',
                      color: '#FF3120',
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontFamily: 'monospace',
                      fontSize: 17,
                      lineHeight: 1.55,
                      color: '#999999',
                    }}
                  >
                    {body}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                fontFamily: 'monospace',
                fontSize: 18,
                letterSpacing: '0.16em',
                color: '#FF3120',
              }}
            >
              SAY HELLO →
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
