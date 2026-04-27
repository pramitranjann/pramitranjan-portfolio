import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function AlbersPage() {
  const caseStudy = await getCaseStudyContent('albers')
  return <CaseStudyLayout {...caseStudy} />
}
