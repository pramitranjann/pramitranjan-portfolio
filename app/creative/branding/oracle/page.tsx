import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function OraclePage() {
  const caseStudy = await getCaseStudyContent('oracle')
  return <CaseStudyLayout {...caseStudy} />
}
