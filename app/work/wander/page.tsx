import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function WanderPage() {
  const caseStudy = await getCaseStudyContent('wander')
  return <CaseStudyLayout {...caseStudy} />
}
