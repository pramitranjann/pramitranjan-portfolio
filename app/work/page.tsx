import { WorkPageClient } from '@/components/WorkPageClient'
import { getSiteContent } from '@/lib/site-content'

export default async function WorkPage() {
  const content = await getSiteContent()

  return (
    <WorkPageClient
      heroTitle={content.workPage.heroTitle}
      heroBody={content.workPage.heroBody}
      projects={content.workPage.projects}
    />
  )
}
