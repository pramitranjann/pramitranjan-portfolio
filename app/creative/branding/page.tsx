import { CreativeSectionIndexClient } from '@/components/CreativeSectionIndexClient'
import { getCaseStudiesBySection, getSiteContent } from '@/lib/site-content'

export default async function BrandingPage() {
  const [projects, content] = await Promise.all([
    getCaseStudiesBySection('branding'),
    getSiteContent(),
  ])

  return (
    <CreativeSectionIndexClient
      title="Identity work."
      backHref="/creative"
      backLabel="CREATIVE"
      columnsClass="grid grid-cols-2"
      projects={projects}
      cardStyle={content.design.photographyCards}
    />
  )
}
