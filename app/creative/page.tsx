import { CreativePageClient } from '@/components/CreativePageClient'
import { getPublicSiteContent } from '@/lib/site-content'
import { getPhotographyPreviewImages } from '@/lib/preview-images'

export default async function CreativePage() {
  const content = await getPublicSiteContent()
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
