import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function MixedMediaCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const caseStudy = await getCaseStudyContent(slug)
  return <CaseStudyLayout {...caseStudy} />
}
