'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTopOnRouteChange() {
  const pathname = usePathname()
  const previousPathname = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // On direct loads, especially on mobile Safari, the browser may try to
    // restore a stale scroll position before client-side effects finish.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }, [])

  useLayoutEffect(() => {
    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      })
    }

    previousPathname.current = pathname
  }, [pathname])

  return null
}
