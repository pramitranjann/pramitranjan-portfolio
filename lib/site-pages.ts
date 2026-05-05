import type { SiteContent, SitePageKey } from '@/lib/site-content-schema'

type SitePagesSource = Pick<SiteContent, 'sitePages'>

export function getSortedVisibleSitePages(content: SitePagesSource) {
  return [...content.sitePages]
    .filter((page) => page.visible && page.status !== 'hidden')
    .sort((a, b) => a.order - b.order)
}

export function getSitePage(content: SitePagesSource, key: SitePageKey) {
  return content.sitePages.find((page) => page.key === key)
}

export function isPageInConstruction(content: SitePagesSource, key: SitePageKey) {
  const page = getSitePage(content, key)
  return page?.status === 'construction'
}

export function isPageHidden(content: SitePagesSource, key: SitePageKey) {
  const page = getSitePage(content, key)
  return page?.status === 'hidden'
}
