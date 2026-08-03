import { EditorialCaseStudy } from '@/components/EditorialCaseStudy'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function AlbersPage() {
  const caseStudy = await getCaseStudyContent('albers')
  return <EditorialCaseStudy {...caseStudy} />
}
