import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function AccordPage() {
  const caseStudy = await getCaseStudyContent('accord')
  return <CaseStudyLayout {...caseStudy} />
}
