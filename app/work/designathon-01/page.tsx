import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function Designathon01Page() {
  const caseStudy = await getCaseStudyContent('designathon-01')
  return <CaseStudyLayout {...caseStudy} />
}
