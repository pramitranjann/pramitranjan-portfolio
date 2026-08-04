import type { Metadata } from 'next'
import { UnderConstructionPage } from '@/components/UnderConstructionPage'
import { PlayPageClient } from '@/components/PlayPageClient'
import { buildMetadata, shouldIndexPage } from '@/lib/seo'
import { getPublicSiteContent } from '@/lib/site-content'
import { getSitePage } from '@/lib/site-pages'
import { getPhotographyPreviewImages } from '@/lib/preview-images'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent()
  const pageSettings = getSitePage(content, 'play')

  return buildMetadata({
    title: 'Play — Games, Photography & Mixed Media',
    description: `${content.copy.creativePage.heroTitle}. ${content.copy.creativePage.heroBody}`,
    path: '/play',
    keywords: ['Pramit Ranjan experiments', 'interactive design projects', 'Pramit Ranjan photography', 'creative portfolio'],
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

  const galleriesBySlug = new Map(content.photography.galleries.map((gallery) => [gallery.slug, gallery.images]))
  const cities = content.photography.cities.map((city) => ({
    ...city,
    previewImages: getPhotographyPreviewImages(city.cover, galleriesBySlug.get(city.slug)),
  }))

  return (
    <PlayPageClient
      games={content.caseStudies.filter((item) => item.section === 'play')}
      cities={cities}
      mixedMediaProjects={content.caseStudies.filter((item) => item.section === 'mixed-media')}
      cardStyle={content.design.photographyCards}
      hoverPreviewSettings={content.design.hoverPreviews}
    />
  )
}
