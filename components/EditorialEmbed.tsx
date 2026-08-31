'use client'

import { useEffect, useRef } from 'react'

const DEFAULT_SIZE = { width: 1440, height: 730 }

const PROTOTYPE_SIZES: Record<string, { width: number; height: number }> = {
  'custom-fields': { width: 1440, height: 730 },
  'swipey-demo': { width: 1440, height: 800 },
  'swipey-admin': { width: 1440, height: 950 },
  'card-rename': { width: 1440, height: 900 },
}

function prototypeSize(src: string) {
  const key = Object.keys(PROTOTYPE_SIZES).find((candidate) => src.includes(`/proto/${candidate}/`))
  return key ? PROTOTYPE_SIZES[key] : DEFAULT_SIZE
}

export function EditorialEmbed({
  src,
  title,
  aspectRatio,
  live,
}: {
  src: string
  title: string
  aspectRatio: string
  live: boolean
}) {
  const outerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (live) return

    const outer = outerRef.current
    const host = outer?.querySelector<HTMLElement>('.editorial-embed-surface')
    const iframe = host?.querySelector<HTMLIFrameElement>('iframe')
    if (!outer || !host || !iframe) return

    const fit = () => {
      const { width, height } = prototypeSize(src)
      const availableWidth = host.clientWidth
      if (availableWidth <= 0) return

      const scale = Math.min(availableWidth / width, 1)
      const renderedWidth = width * scale
      const renderedHeight = height * scale

      iframe.style.setProperty('width', `${width}px`, 'important')
      iframe.style.setProperty('height', `${height}px`, 'important')
      iframe.style.setProperty('transform', `scale(${scale})`)
      iframe.style.setProperty('transform-origin', 'top left')
      iframe.style.setProperty('margin-right', `${-(width - renderedWidth)}px`, 'important')
      iframe.style.setProperty('margin-bottom', `${-(height - renderedHeight)}px`, 'important')

      outer.style.setProperty('aspect-ratio', 'auto', 'important')
      outer.style.setProperty('height', 'auto', 'important')
      host.style.setProperty('height', `${renderedHeight}px`, 'important')
      host.style.setProperty('display', 'grid', 'important')
      host.style.setProperty('place-items', 'center', 'important')
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(outer)
    observer.observe(host)
    iframe.addEventListener('load', fit)
    const retry = window.setTimeout(fit, 250)

    return () => {
      observer.disconnect()
      iframe.removeEventListener('load', fit)
      window.clearTimeout(retry)
    }
  }, [live, src])

  return (
    <div
      ref={outerRef}
      className={`editorial-embed${live ? ' editorial-embed-live' : ''}`}
      style={live ? undefined : { aspectRatio }}
    >
      <div className="editorial-embed-surface">
        <iframe src={src} title={title} loading="lazy" />
      </div>
    </div>
  )
}
