import { PlayPageClient } from '@/components/PlayPageClient'
import { getPublicSiteContent } from '@/lib/site-content'
import type { SiteContent } from '@/lib/site-content-schema'

export default async function PlayPageLive({
  content: providedContent,
}: {
  content?: SiteContent
} = {}) {
  const content = providedContent ?? await getPublicSiteContent()

  return <PlayPageClient content={content} />
}
