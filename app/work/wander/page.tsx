import { EditorialCaseStudy } from '@/components/EditorialCaseStudy'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function WanderPage() {
  const caseStudy = await getCaseStudyContent('wander')
  return <EditorialCaseStudy {...caseStudy} />
}
