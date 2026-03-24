import { CreativePageClient } from '@/components/CreativePageClient'
import { getSiteContent } from '@/lib/site-content'

export default async function CreativePage() {
  const content = await getSiteContent()
  return (
    <CreativePageClient
      cities={content.photography.cities}
      mixedMediaProjects={content.caseStudies.filter((item) => item.section === 'mixed-media')}
      brandingProjects={content.caseStudies.filter((item) => item.section === 'branding')}
      cardStyle={content.design.photographyCards}
    />
  )
}
