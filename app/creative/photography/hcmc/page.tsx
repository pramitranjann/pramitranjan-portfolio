import { PhotoGalleryLayout } from '@/components/PhotoGalleryLayout'

const images = Array.from({ length: 17 }, (_, i) =>
  `/creative/photography/hcmc/${String(i + 1).padStart(2, '0')}.jpg`
)

export default function HCMCPage() {
  return <PhotoGalleryLayout city="Ho Chi Minh" descriptor="Noise, heat, and the city that never slows down." images={images} />
}
