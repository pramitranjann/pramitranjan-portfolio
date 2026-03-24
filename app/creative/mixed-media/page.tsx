import { CreativeSectionIndexClient } from '@/components/CreativeSectionIndexClient'
import { getCaseStudiesBySection, getSiteContent } from '@/lib/site-content'

export default async function MixedMediaPage() {
  const [projects, content] = await Promise.all([
    getCaseStudiesBySection('mixed-media'),
    getSiteContent(),
  ])

  return (
    <CreativeSectionIndexClient
      title={content.copy.creativePage.mixedMediaIndexTitle}
      backHref="/creative"
      backLabel={content.copy.creativePage.backLabel}
      columnsClass="grid grid-cols-2 md:grid-cols-3"
      projects={projects}
      cardStyle={content.design.photographyCards}
    />
  )
}
