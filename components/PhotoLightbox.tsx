'use client'
import { motion, AnimatePresence, usePresenceData } from 'motion/react'

interface PhotoLightboxProps {
  index: number
  total: number
  direction: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

// Reads direction from AnimatePresence custom data — works even during exit
// because usePresenceData holds the value from when the element was removed
function PhotoSlide({ index, total }: { index: number; total: number }) {
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
      {/* Placeholder — replace with <img> when images are ready */}
      <div
        style={{
          width: 'min(60vw, 420px)',
          aspectRatio: '2 / 3',
          backgroundColor: '#161616',
          border: '1px solid #222222',
        }}
      />
      <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.14em', color: '#444444' }}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </motion.div>
  )
}

export function PhotoLightbox({ index, total, direction, onClose, onPrev, onNext }: PhotoLightboxProps) {
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
      {/* Slide area — stop propagation so clicking slide doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <AnimatePresence custom={direction} mode="popLayout">
          <PhotoSlide key={index} index={index} total={total} />
        </AnimatePresence>

        {/* Prev */}
        {index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            className="font-mono"
            style={{
              position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '9px', letterSpacing: '0.14em', color: '#666666',
              padding: '12px',
            }}
          >
            ← PREV
          </button>
        )}

        {/* Next */}
        {index < total - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            className="font-mono"
            style={{
              position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '9px', letterSpacing: '0.14em', color: '#666666',
              padding: '12px',
            }}
          >
            NEXT →
          </button>
        )}

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className="font-mono"
          style={{
            position: 'absolute', top: '24px', right: '40px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '9px', letterSpacing: '0.14em', color: '#666666',
            padding: '8px',
          }}
        >
          CLOSE ×
        </button>
      </div>
    </motion.div>
  )
}
