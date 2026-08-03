import { EditorialCaseStudy } from '@/components/EditorialCaseStudy'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function LoomLearnPage() {
  const caseStudy = await getCaseStudyContent('loomlearn')
  return <EditorialCaseStudy {...caseStudy} />
}
