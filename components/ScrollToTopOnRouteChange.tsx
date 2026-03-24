'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTopOnRouteChange() {
  const pathname = usePathname()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      })
    }

    previousPathname.current = pathname
  }, [pathname])

  return null
}
