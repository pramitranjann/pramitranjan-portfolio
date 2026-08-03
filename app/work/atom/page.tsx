import { EditorialCaseStudy } from '@/components/EditorialCaseStudy'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function AtomPage() {
  const caseStudy = await getCaseStudyContent('atom')
  return <EditorialCaseStudy {...caseStudy} />
}
