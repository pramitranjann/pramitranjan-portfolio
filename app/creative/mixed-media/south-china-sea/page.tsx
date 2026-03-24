import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function SouthChinaSeaPage() {
  const caseStudy = await getCaseStudyContent('south-china-sea')
  return <CaseStudyLayout {...caseStudy} />
}
