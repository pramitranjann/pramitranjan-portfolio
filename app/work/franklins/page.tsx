import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function FranklinsPage() {
  const caseStudy = await getCaseStudyContent('franklins')
  return <CaseStudyLayout {...caseStudy} />
}
