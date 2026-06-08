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
            background: 'linear-gradient(180deg, #111111 0%, #0d0d0d 100%)',
            padding: '72px 80px',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 132,
              lineHeight: 0.9,
              letterSpacing: '-0.06em',
              color: '#f5f2ed',
            }}
          >
            Pramit Ranjan
          </div>

          <div
            style={{
              display: 'flex',
              fontFamily: 'monospace',
              fontSize: 34,
              lineHeight: 1,
              letterSpacing: '0.18em',
              color: '#FF3120',
              textTransform: 'uppercase',
            }}
          >
            Portfolio | 2026
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
