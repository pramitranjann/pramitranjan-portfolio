import type { Metadata } from 'next'
import { FranklinsV2Client } from '@/components/FranklinsV2Client'
import { getCaseStudyContent } from '@/lib/site-content'

// Unlinked preview of the proposed case study system. Not indexed, not in nav.
export const metadata: Metadata = {
  title: "Franklin's — case study v2 preview",
  robots: { index: false, follow: false },
}

export default async function FranklinsV2Page() {
  const caseStudy = await getCaseStudyContent('franklins')
  return <FranklinsV2Client caseStudy={caseStudy} />
}
