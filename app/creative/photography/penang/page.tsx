import { PhotoGalleryLayout } from '@/components/PhotoGalleryLayout'

const images = Array.from({ length: 36 }, (_, i) =>
  `/creative/photography/penang/${String(i + 1).padStart(2, '0')}.jpg`
)

export default function PenangPage() {
  return <PhotoGalleryLayout city="Penang" descriptor="Heritage streets and the texture of an older world." images={images} />
}
