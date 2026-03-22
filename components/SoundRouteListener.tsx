'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { playPageArrive } from '@/lib/sounds'

export function SoundRouteListener() {
  const pathname = usePathname()
  const prevPathname = useRef<string | null>(null)

  useEffect(() => {
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      playPageArrive()
    }
    prevPathname.current = pathname
  }, [pathname])

  return null
}
