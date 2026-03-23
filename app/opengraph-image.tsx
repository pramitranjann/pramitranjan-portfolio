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
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '72px 80px',
          fontFamily: 'monospace',
        }}
      >
        {/* Red accent line */}
        <div style={{ width: 40, height: 2, background: '#FF3120', marginBottom: 32, display: 'flex' }} />

        {/* Name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 400,
            color: '#f5f2ed',
            lineHeight: 1,
            letterSpacing: '-1px',
            marginBottom: 24,
            display: 'flex',
          }}
        >
          Pramit Ranjan
        </div>

        {/* Descriptor */}
        <div
          style={{
            fontSize: 18,
            color: '#666666',
            letterSpacing: '0.14em',
            display: 'flex',
          }}
        >
          UX DESIGNER · SCAD · pramitranjan.com
        </div>
      </div>
    ),
    { ...size }
  )
}
