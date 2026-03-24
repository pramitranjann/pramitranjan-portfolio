import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function AtomPage() {
  const caseStudy = await getCaseStudyContent('atom')
  return <CaseStudyLayout {...caseStudy} />
}
