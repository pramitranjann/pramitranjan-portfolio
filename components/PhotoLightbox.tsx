'use client'
import Image from 'next/image'
import { motion, AnimatePresence, usePresenceData } from 'motion/react'
import { playLightboxNav } from '@/lib/sounds'

interface PhotoLightboxProps {
  src: string
  alt: string
  index: number
  total: number
  direction: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

function PhotoSlide({ src, alt, index, total }: { src: string; alt: string; index: number; total: number }) {
  const direction = (usePresenceData() as number) ?? 1

  return (
    <motion.div
      initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 32, mass: 0.8 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
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
    </motion.div>
  )
}

export function PhotoLightbox({ src, alt, index, total, direction, onClose, onPrev, onNext }: PhotoLightboxProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <AnimatePresence custom={direction} mode="popLayout">
          <PhotoSlide key={index} src={src} alt={alt} index={index} total={total} />
        </AnimatePresence>

        {/* Prev */}
        {index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); playLightboxNav(); onPrev() }}
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
            onClick={(e) => { e.stopPropagation(); playLightboxNav(); onNext() }}
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
          onClick={(e) => { e.stopPropagation(); onClose() }}
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
      </div>
    </motion.div>
  )
}
