import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function HelpOHPage() {
  const caseStudy = await getCaseStudyContent('helpoh')
  return <CaseStudyLayout {...caseStudy} />
}
