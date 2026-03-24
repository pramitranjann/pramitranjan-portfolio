import { PhotoGalleryLayout } from '@/components/PhotoGalleryLayout'
import { getPhotographyGallery, getSiteContent } from '@/lib/site-content'

export default async function KLPage() {
  const [gallery, content] = await Promise.all([getPhotographyGallery('kl'), getSiteContent()])
  return <PhotoGalleryLayout city={gallery.city} descriptor={gallery.descriptor} images={gallery.images} styleSettings={content.design.gallery} />
}
