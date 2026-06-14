import type { Metadata } from 'next'
import { UnderConstructionPage } from '@/components/UnderConstructionPage'
import PlayPageLive from '@/components/PlayPageLive'
import { buildMetadata, shouldIndexPage } from '@/lib/seo'
import { getPublicSiteContent } from '@/lib/site-content'
import { getSitePage } from '@/lib/site-pages'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent()
  const pageSettings = getSitePage(content, 'play')

  return buildMetadata({
    title: 'Interactive Experiments',
    description: `${content.copy.playPage.heroTitle}. ${content.copy.playPage.heroBody}`,
    path: '/play',
    keywords: ['Pramit Ranjan experiments', 'interactive design projects', 'creative coding portfolio'],
    noIndex: !shouldIndexPage(pageSettings?.status),
  })
}

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
