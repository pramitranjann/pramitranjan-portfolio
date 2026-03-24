import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function LoomLearnPage() {
  const caseStudy = await getCaseStudyContent('loomlearn')
  return <CaseStudyLayout {...caseStudy} />
}
