import { PhotoGalleryLayout } from '@/components/PhotoGalleryLayout'

const images = Array.from({ length: 9 }, (_, i) =>
  `/creative/photography/singapore/${String(i + 1).padStart(2, '0')}.jpg`
)

export default function SingaporePage() {
  return <PhotoGalleryLayout city="Singapore" descriptor="The duality of a city-state — dense and lush at once." images={images} />
}
