import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function AlbersPage() {
  const caseStudy = await getCaseStudyContent('albers')
  return (
    <CaseStudyLayout
      {...caseStudy}
      mediaBlocks={caseStudy.mediaBlocks?.filter((block) => block.section !== 'solution')}
      solutionEmbedUrl="https://albers-web.vercel.app"
      solutionEmbedTitle="ALBERS live app"
      solutionEmbedAspectRatio="4 / 3"
      solutionEmbedCtaLabel="OPEN LIVE APP"
    />
  )
}
