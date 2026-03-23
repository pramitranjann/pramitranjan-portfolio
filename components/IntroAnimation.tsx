'use client'
import { useEffect, useState } from 'react'

export function IntroAnimation() {
  // Skip animation on returning visits — lazy initializer avoids one-frame flash.
  // Safe here because this component is loaded with { ssr: false } — window always exists.
  const [done, setDone] = useState(
    () => sessionStorage.getItem('pr-intro-v1') === '1'
  )

  const [text, setText] = useState('')
  const [cursorHidden, setCursorHidden] = useState(false)
  const [lifting, setLifting] = useState(false)

  // Computed at component body level so it's available in both useEffect closure and JSX.
  // Always runs on the client (ssr: false), so matchMedia is safe without a typeof guard.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    // done=true means sessionStorage guard fired — no animation needed
    if (done) return

    const ids: ReturnType<typeof setTimeout>[] = []

    ids.push(setTimeout(() => setText('P'), 1100))
    ids.push(setTimeout(() => setText('PR'), 1650))
    ids.push(setTimeout(() => setCursorHidden(true), 2200))
    ids.push(setTimeout(() => setLifting(true), 2450))
    ids.push(
      setTimeout(() => {
        setDone(true)
        sessionStorage.setItem('pr-intro-v1', '1')
      }, 3350) // 50ms buffer after lift ends (2450 + 850 = 3300, +50 = 3350)
    )

    return () => ids.forEach(clearTimeout) // prevents StrictMode double-fire
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (done) return null

  const liftStyle: React.CSSProperties = lifting
    ? reducedMotion
      ? { opacity: 0, transition: 'opacity 300ms ease' }
      : {
          transform: 'translateY(-100%)',
          transition: 'transform 850ms cubic-bezier(0.77, 0, 0.175, 1)',
        }
    : {}

  return (
    <div
      style={{
        position: 'fixed',
        top: '57px',
        left: 0,
        right: 0,
        height: 'calc(100vh - 57px)',
        background: '#060606',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        padding: '0 56px',
        ...liftStyle,
      }}
    >
      <span
        style={{
          fontFamily: '"DM Mono", "Courier New", monospace',
          fontSize: 'clamp(80px, 11vw, 130px)',
          letterSpacing: '0.14em',
          color: '#FF3120',
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        {text}
        <span
          style={{
            display: 'inline-block',
            width: '4px',
            height: '0.8em',
            background: '#FF3120',
            verticalAlign: 'middle',
            marginLeft: '6px',
            opacity: cursorHidden ? 0 : 1,
            animation: cursorHidden ? 'none' : 'pr-cursor-blink 0.7s step-end infinite',
          }}
        />
      </span>

      <style>{`
        @keyframes pr-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
