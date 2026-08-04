import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { CaseStudyLayout } from '@/components/CaseStudyLayout'
import { buildBreadcrumbJsonLd, buildCaseStudyJsonLd, buildCaseStudyMetadata } from '@/lib/seo'
import { getCaseStudyContent } from '@/lib/site-content'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const caseStudy = await getCaseStudyContent(slug)
  return buildCaseStudyMetadata(caseStudy)
}

export default async function BrandingCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const caseStudy = await getCaseStudyContent(slug)
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Play', path: '/play' },
            { name: 'Branding', path: '/play/branding' },
            { name: caseStudy.title, path: `/play/branding/${caseStudy.slug}` },
          ]),
          buildCaseStudyJsonLd(caseStudy),
        ]}
      />
      <CaseStudyLayout {...caseStudy} />
    </>
  )
}
