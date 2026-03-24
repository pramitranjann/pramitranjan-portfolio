import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function Designathon02Page() {
  const caseStudy = await getCaseStudyContent('designathon-02')
  return <CaseStudyLayout {...caseStudy} />
}
