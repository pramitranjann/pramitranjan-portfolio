import { PhotoGalleryLayout } from '@/components/PhotoGalleryLayout'
import { getPhotographyGallery, getSiteContent } from '@/lib/site-content'

export default async function SingaporePage() {
  const [gallery, content] = await Promise.all([getPhotographyGallery('singapore'), getSiteContent()])
  return <PhotoGalleryLayout city={gallery.city} descriptor={gallery.descriptor} images={gallery.images} contextTitle={gallery.contextTitle} contextBody={gallery.contextBody} imageDetails={gallery.imageDetails} styleSettings={content.design.gallery} spotify={gallery.spotify} />
}
