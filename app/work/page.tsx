import { WorkPageClient } from '@/components/WorkPageClient'
import { getPublicSiteContent } from '@/lib/site-content'

export default async function WorkPage() {
  const content = await getPublicSiteContent()

  return (
    <WorkPageClient
      heroTitle={content.workPage.heroTitle}
      heroBody={content.workPage.heroBody}
      projects={content.workPage.projects}
      cardStyle={content.design.supportingCards}
    />
  )
}
