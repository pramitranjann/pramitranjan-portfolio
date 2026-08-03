import { EditorialCaseStudy } from '@/components/EditorialCaseStudy'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function FranklinsPage() {
  const caseStudy = await getCaseStudyContent('franklins')
  return <EditorialCaseStudy {...caseStudy} gallery />
}
