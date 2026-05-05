import { UnderConstructionPage } from '@/components/UnderConstructionPage'
import { CreativePageClient } from '@/components/CreativePageClient'
import { getPublicSiteContent } from '@/lib/site-content'
import { getSitePage } from '@/lib/site-pages'
import { getPhotographyPreviewImages } from '@/lib/preview-images'

export default async function CreativePage() {
  const content = await getPublicSiteContent()
  const pageSettings = getSitePage(content, 'creative')

  if (pageSettings?.status === 'construction') {
    return (
      <UnderConstructionPage
        label="CREATIVE_"
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

  const galleriesBySlug = new Map(content.photography.galleries.map((gallery) => [gallery.slug, gallery.images]))
  const cities = content.photography.cities.map((city) => ({
    ...city,
    previewImages: getPhotographyPreviewImages(city.cover, galleriesBySlug.get(city.slug)),
  }))

  return (
    <CreativePageClient
      cities={cities}
      mixedMediaProjects={content.caseStudies.filter((item) => item.section === 'mixed-media')}
      brandingProjects={content.caseStudies.filter((item) => item.section === 'branding')}
      cardStyle={content.design.photographyCards}
      hoverPreviewSettings={content.design.hoverPreviews}
    />
  )
}
