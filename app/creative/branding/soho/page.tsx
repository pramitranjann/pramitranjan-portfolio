import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function SohoPage() {
  return (
    <CaseStudyLayout
      title="SOHO"
      oneliner="Directed and branded a sixth form art exhibition."
      type="EXHIBITION · BRANDING"
      tags={['Branding', 'Exhibition', 'Direction']}
      prev={{ slug: 'oracle', title: 'Oracle' }}
      next={null}
      backHref="/creative/branding"
      backLabel="BRANDING"
    />
  )
}
