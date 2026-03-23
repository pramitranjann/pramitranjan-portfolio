'use client'
import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      setPct((window.scrollY / scrollable) * 100)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', zIndex: 49, background: '#1f1f1f' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: '#FF3120', transition: 'width 0.05s linear' }} />
    </div>
  )
}
