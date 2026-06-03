import { PhotoGalleryLayout } from '@/components/PhotoGalleryLayout'
import { getPhotographyGallery, getSiteContent } from '@/lib/site-content'

export default async function KLPage() {
  const [gallery, content] = await Promise.all([getPhotographyGallery('kl'), getSiteContent()])
  return <PhotoGalleryLayout city={gallery.city} descriptor={gallery.descriptor} images={gallery.images} contextTitle={gallery.contextTitle} contextBody={gallery.contextBody} imageDetails={gallery.imageDetails} styleSettings={content.design.gallery} listeningStyle={content.design.listeningCard} spotify={gallery.spotify} />
}
