import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#FF3120',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0a0a0a',
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        PR
      </div>
    ),
    { ...size }
  )
}
