import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { getCaseStudyContent } from '@/lib/site-content'

export default async function AlbersPage() {
  const caseStudy = await getCaseStudyContent('albers')
  return (
    <CaseStudyLayout
      {...caseStudy}
      mediaBlocks={caseStudy.mediaBlocks?.filter((block) => block.section !== 'solution')}
      solutionHeroImage={undefined}
      solutionImages={undefined}
      solutionEmbedUrl="https://albers-web.vercel.app"
      solutionEmbedTitle="ALBERS live app"
      solutionEmbedAspectRatio="4 / 3"
      solutionEmbedWidth="min(100%, 1325px)"
      solutionEmbedCalloutLabel="LIVE APP_"
      solutionEmbedCalloutTitle="The shipped Albers build is embedded below."
      solutionEmbedCalloutBody="This is the actual live app, not a mockup. You can interact with it here, then open it in a separate tab if you want the full browser context."
      solutionEmbedCtaLabel="OPEN LIVE APP"
    />
  )
}
