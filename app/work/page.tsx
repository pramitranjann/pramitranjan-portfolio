import type { Metadata } from 'next'
import { UnderConstructionPage } from '@/components/UnderConstructionPage'
import { WorkPageClient } from '@/components/WorkPageClient'
import { buildMetadata, shouldIndexPage } from '@/lib/seo'
import { getPublicSiteContent } from '@/lib/site-content'
import { getSitePage } from '@/lib/site-pages'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent()
  const pageSettings = getSitePage(content, 'work')

  return buildMetadata({
    title: 'UX Design Work',
    description: `${content.workPage.heroTitle} ${content.workPage.heroBody}`,
    path: '/work',
    keywords: ['Pramit Ranjan work', 'UX case studies', 'product design portfolio'],
    noIndex: !shouldIndexPage(pageSettings?.status),
  })
}

export default async function WorkPage() {
  const content = await getPublicSiteContent()
  const pageSettings = getSitePage(content, 'work')

  if (pageSettings?.status === 'construction') {
    return (
      <UnderConstructionPage
        label="WORK_"
        title={pageSettings.constructionTitle}
        body={pageSettings.constructionBody}
        ctaLabel={pageSettings.constructionCtaLabel}
        ctaHref={pageSettings.constructionCtaHref ?? '/'}
      />
    )
  }

  if (pageSettings?.status === 'hidden') {
    return (
      <UnderConstructionPage
        label="HIDDEN_"
        title="This page is not currently public."
        body="This section is temporarily hidden while the work is being updated."
        ctaLabel="BACK TO HOME"
        ctaHref="/"
      />
    )
  }

  return (
    <WorkPageClient
      heroTitle={content.workPage.heroTitle}
      heroBody={content.workPage.heroBody}
      projects={content.workPage.projects}
      cardStyle={content.design.supportingCards}
      hoverPreviewSettings={content.design.hoverPreviews}
    />
  )
}
