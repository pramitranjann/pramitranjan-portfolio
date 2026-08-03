'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const screens = [
  { src: '/work/franklins/Home Page.png', alt: "Redesigned Franklin's homepage" },
  { src: '/work/franklins/Menu.png', alt: "Redesigned Franklin's menu page" },
  { src: '/work/franklins/About Us.png', alt: "Redesigned Franklin's about page" },
]

function rangeProgress(value: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)))
}

export function FranklinsRedesignGallery({ headline }: { headline?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const lastProgress = useRef(-1)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = track.getBoundingClientRect()
      const range = track.offsetHeight - window.innerHeight
      const progress = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0
      if (Math.abs(progress - lastProgress.current) > 0.001) {
        lastProgress.current = progress
        setScrollProgress(progress)
      }
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const homeExit = rangeProgress(scrollProgress, 0.34, 0.52)
  const menuEnter = rangeProgress(scrollProgress, 0.22, 0.52)
  const menuExit = rangeProgress(scrollProgress, 0.64, 0.8)
  const aboutEnter = rangeProgress(scrollProgress, 0.56, 0.86)

  return (
    <section id="redesign" className="editorial-redesign-gallery" data-section="Redesign">
      <div className="editorial-shell editorial-redesign-heading">
        <p className="font-mono editorial-kicker">THE REDESIGN</p>
        <h2 className="font-reading editorial-statement">{headline}</h2>
      </div>

      <div ref={trackRef} className="editorial-gallery-track">
        <div className="editorial-gallery-pin">
          <div className="editorial-gallery-canvas">
            <div className="editorial-artifact editorial-gallery-stage" data-gallery-progress={scrollProgress.toFixed(3)}>
              <figure
                className="editorial-gallery-screen"
                style={{ transform: `translateY(${-5 * homeExit}%)`, opacity: 1 - (0.26 * homeExit) }}
              >
                <Image src={screens[0].src} alt={screens[0].alt} fill priority sizes="(max-width: 900px) 100vw, 1120px" />
              </figure>
              <figure
                className="editorial-gallery-screen"
                style={{ transform: `translateY(${106 * (1 - menuEnter)}%)`, opacity: 1 - (0.26 * menuExit) }}
              >
                <Image src={screens[1].src} alt={screens[1].alt} fill sizes="(max-width: 900px) 100vw, 1120px" />
              </figure>
              <figure
                className="editorial-gallery-screen"
                style={{ transform: `translateY(${106 * (1 - aboutEnter)}%)` }}
              >
                <Image src={screens[2].src} alt={screens[2].alt} fill sizes="(max-width: 900px) 100vw, 1120px" />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
