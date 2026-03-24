import { PhotoGalleryLayout } from '@/components/PhotoGalleryLayout'
import { getPhotographyGallery, getSiteContent } from '@/lib/site-content'

export default async function HCMCPage() {
  const [gallery, content] = await Promise.all([getPhotographyGallery('hcmc'), getSiteContent()])
  return <PhotoGalleryLayout city={gallery.city} descriptor={gallery.descriptor} images={gallery.images} styleSettings={content.design.gallery} />
}
