import { ScadPageClient } from '@/components/ScadPageClient'
import { getPublicSiteContent } from '@/lib/site-content'
import { getPhotographyPreviewImages } from '@/lib/preview-images'

export default async function ScadScholarshipPage() {
  const content = await getPublicSiteContent()

  const galleriesBySlug = new Map(
    content.photography.galleries.map((gallery) => [gallery.slug, gallery.images])
  )

  const cities = content.photography.cities.map((city) => ({
    ...city,
    previewImages: getPhotographyPreviewImages(city.cover, galleriesBySlug.get(city.slug)),
  }))

  const excludedSlugs = new Set(['accord', 'purcast'])

  return (
    <ScadPageClient
      projects={content.workPage.projects.filter(
        (p) => !excludedSlugs.has(p.href.split('/').pop() ?? '')
      )}
      cities={cities}
      mixedMediaProjects={content.caseStudies.filter((item) => item.section === 'mixed-media')}
      cardStyle={content.design.supportingCards}
      photographyCardStyle={content.design.photographyCards}
      hoverPreviewSettings={content.design.hoverPreviews}
    />
  )
}
