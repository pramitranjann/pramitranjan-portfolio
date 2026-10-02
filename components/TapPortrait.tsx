import Image from 'next/image'

export function TapPortrait({ positionY, size }: { positionY: number; size: number }) {
  return (
    <div className="tap-portrait" style={{ paddingTop: '24px' }}>
      <div
        className="tap-portrait-frame"
        style={{
          position: 'relative',
          width: `min(${size}px, calc(100% - 36px))`,
          marginInline: 'auto',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          outline: '1px solid oklch(1 0 0 / 0.1)',
          outlineOffset: '-1px',
        }}
      >
        <Image
          src="/about/portrait-04.jpg"
          alt="Pramit outdoors in winter"
          fill
          sizes={`(max-width: 767px) calc(100vw - 34px), ${size}px`}
          preload
          style={{ objectFit: 'cover', objectPosition: `50% ${positionY}%` }}
        />
      </div>
    </div>
  )
}
