'use client'

import { createContext, useContext } from 'react'
import type { SiteContent } from '@/lib/site-content-schema'

type SiteCopy = SiteContent['copy']

const SiteCopyContext = createContext<SiteCopy | null>(null)

export function SiteCopyProvider({
  copy,
  children,
}: {
  copy: SiteCopy
  children: React.ReactNode
}) {
  return <SiteCopyContext.Provider value={copy}>{children}</SiteCopyContext.Provider>
}

export function useSiteCopy() {
  const value = useContext(SiteCopyContext)

  if (!value) {
    throw new Error('useSiteCopy must be used within SiteCopyProvider')
  }

  return value
}
