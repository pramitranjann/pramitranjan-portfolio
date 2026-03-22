import { PhotoGalleryLayout } from '@/components/PhotoGalleryLayout'

const images = Array.from({ length: 79 }, (_, i) =>
  `/creative/photography/kl/${String(i + 1).padStart(2, '0')}.jpg`
)

export default function KLPage() {
  return <PhotoGalleryLayout city="KL" descriptor="Street life and quiet corners of a city in motion." images={images} />
}
