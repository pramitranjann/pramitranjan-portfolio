import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function FacesOfPowerPage() {
  const caseStudy = await getCaseStudyContent('faces-of-power')
  return <CaseStudyLayout {...caseStudy} />
}
