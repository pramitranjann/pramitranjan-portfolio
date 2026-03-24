import { PhotographyIndexClient } from '@/components/PhotographyIndexClient'
import { getSiteContent } from '@/lib/site-content'

export default async function PhotographyPage() {
  const content = await getSiteContent()
  return <PhotographyIndexClient heroTitle={content.photography.heroTitle} cities={content.photography.cities} />
}
