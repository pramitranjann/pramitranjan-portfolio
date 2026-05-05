import { UnderConstructionPage } from '@/components/UnderConstructionPage'
import PlayPageLive from '@/components/PlayPageLive'
import { getPublicSiteContent } from '@/lib/site-content'
import { getSitePage } from '@/lib/site-pages'

export default async function PlayPage() {
  const content = await getPublicSiteContent()
  const pageSettings = getSitePage(content, 'play')

  if (pageSettings?.status === 'construction') {
    return (
      <UnderConstructionPage
        label="PLAY_"
        title={pageSettings.constructionTitle}
        body={pageSettings.constructionBody}
        ctaLabel={pageSettings.constructionCtaLabel}
        ctaHref={pageSettings.constructionCtaHref ?? '/work'}
      />
    )
  }

  if (pageSettings?.status === 'hidden') {
    return (
      <UnderConstructionPage
        label="HIDDEN_"
        title="This page is not currently public."
        body="This section is temporarily hidden while the work is being updated."
        ctaLabel="BACK TO WORK"
        ctaHref="/work"
      />
    )
  }

  return <PlayPageLive content={content} />
}
