import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function PurcastPage() {
  const caseStudy = await getCaseStudyContent('purcast')
  return <CaseStudyLayout {...caseStudy} />
}
