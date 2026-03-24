import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function SohoPage() {
  const caseStudy = await getCaseStudyContent('soho')
  return <CaseStudyLayout {...caseStudy} />
}
