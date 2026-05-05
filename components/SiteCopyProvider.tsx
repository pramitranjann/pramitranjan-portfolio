'use client'

import { createContext, useContext } from 'react'
import type { SiteContent } from '@/lib/site-content-schema'

type SiteCopy = SiteContent['copy']
type SitePages = SiteContent['sitePages']

const SiteCopyContext = createContext<SiteCopy | null>(null)
const SitePagesContext = createContext<SitePages | null>(null)

export function SiteCopyProvider({
  copy,
  sitePages,
  children,
}: {
  copy: SiteCopy
  sitePages: SitePages
  children: React.ReactNode
}) {
  return (
    <SiteCopyContext.Provider value={copy}>
      <SitePagesContext.Provider value={sitePages}>{children}</SitePagesContext.Provider>
    </SiteCopyContext.Provider>
  )
}

export function useSiteCopy() {
  const value = useContext(SiteCopyContext)

  if (!value) {
    throw new Error('useSiteCopy must be used within SiteCopyProvider')
  }

  return value
}

export function useSitePages() {
  const value = useContext(SitePagesContext)

  if (!value) {
    throw new Error('useSitePages must be used within SiteCopyProvider')
  }

  return value
}
