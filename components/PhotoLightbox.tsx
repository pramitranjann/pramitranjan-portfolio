'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, usePresenceData } from 'motion/react'
import { playLightboxNav } from '@/lib/sounds'
import type { PhotographyImageDetails } from '@/lib/site-content-schema'

interface PhotoLightboxProps {
  src: string
  alt: string
  index: number
  total: number
  direction: number
  details?: PhotographyImageDetails
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const SWIPE_OFFSET_THRESHOLD = 90
const SWIPE_VELOCITY_THRESHOLD = 450

function PhotoSlide({
  src,
  alt,
  index,
  total,
  details,
  onClose,
  onPrev,
  onNext,
}: {
  src: string
  alt: string
  index: number
  total: number
  details?: PhotographyImageDetails
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const direction = (usePresenceData() as number) ?? 1
  const draggedRef = useRef(false)

  function handleDragEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) {
    const shouldGoPrev = info.offset.x > SWIPE_OFFSET_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD
    const shouldGoNext = info.offset.x < -SWIPE_OFFSET_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD

    if (shouldGoPrev && index > 0) {
      onPrev()
      return
    }

    if (shouldGoNext && index < total - 1) {
      onNext()
    }
  }

  return (
    <motion.div
      initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 32, mass: 0.8 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.16}
      dragMomentum={false}
      dragDirectionLock
      onDragStart={() => { draggedRef.current = true }}
      onDragEnd={(event, info) => {
        handleDragEnd(event, info)
        setTimeout(() => { draggedRef.current = false }, 0)
      }}
      onClick={(event) => {
        event.stopPropagation()
        if (draggedRef.current) return
        onClose()
      }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        cursor: 'grab',
        touchAction: 'pan-y',
        userSelect: 'none',
      }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <div style={{ position: 'relative', width: 'min(60vw, 480px)', height: 'min(80vh, 720px)' }}>
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 90vw, 60vw"
          priority
        />
      </div>
      <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.14em', color: '#444444' }}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
      {details && (details.title || details.meta || details.caption) ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(90vw, 560px)',
            padding: '12px 14px',
            background: 'rgba(12, 12, 12, 0.82)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 14px 40px rgba(0,0,0,0.28)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {details.title ? (
            <div
              className="font-serif"
              style={{ fontSize: '18px', fontStyle: 'italic', fontWeight: 'var(--font-weight-serif)', color: '#f5f2ed', lineHeight: 1.2, textWrap: 'balance' }}
            >
              {details.title}
            </div>
          ) : null}
          {details.meta ? (
            <div
              className="font-mono"
              style={{ marginTop: details.title ? '6px' : 0, fontSize: '10px', letterSpacing: '0.12em', color: '#8a8a8a', lineHeight: 1.6, textTransform: 'uppercase' }}
            >
              {details.meta}
            </div>
          ) : null}
          {details.caption ? (
            <p
              className="font-mono"
              style={{ margin: details.title || details.meta ? '8px 0 0' : 0, fontSize: '11px', letterSpacing: '0.03em', color: '#b4b4b4', lineHeight: 1.7, textWrap: 'pretty' }}
            >
              {details.caption}
            </p>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  )
}

export function PhotoLightbox({ src, alt, index, total, direction, details, onClose, onPrev, onNext }: PhotoLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } }}
      exit={{ opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(6, 6, 6, 0.96)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.22, ease: 'easeOut' } }}
        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18, ease: 'easeIn' } }}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {/* initial={false}: the slide animation is for prev/next only, not for opening */}
        <AnimatePresence custom={direction} mode="popLayout" initial={false}>
          <PhotoSlide key={index} src={src} alt={alt} index={index} total={total} details={details} onClose={onClose} onPrev={onPrev} onNext={onNext} />
        </AnimatePresence>

        {/* Prev */}
        {index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            className="font-mono lightbox-prev"
            style={{
              position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '11px', letterSpacing: '0.14em', color: '#FF3120',
              padding: '12px',
            }}
          >
            <span className="arrow-nudge-back">←</span> PREV
          </button>
        )}

        {/* Next */}
        {index < total - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            className="font-mono lightbox-next"
            style={{
              position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '11px', letterSpacing: '0.14em', color: '#FF3120',
              padding: '12px',
            }}
          >
            NEXT <span className="arrow-nudge">→</span>
          </button>
        )}

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); playLightboxNav(); onClose() }}
          className="font-mono lightbox-close"
          style={{
            position: 'absolute', top: '24px', right: '40px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '11px', letterSpacing: '0.14em', color: '#666666',
            padding: '8px',
          }}
        >
          CLOSE ×
        </button>
      </motion.div>
    </motion.div>
  )
}
