import { EditorialCaseStudy } from '@/components/EditorialCaseStudy'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function HelpOHPage() {
  const caseStudy = await getCaseStudyContent('helpoh')
  return <EditorialCaseStudy {...caseStudy} />
}
