import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function OraclePage() {
  return (
    <CaseStudyLayout
      title="Oracle"
      oneliner="A Matrix-inspired clothing brand built from scratch."
      type="CLOTHING · BRANDING"
      tags={['Branding', 'Identity', 'Clothing']}
      prev={null}
      next={{ slug: 'soho', title: 'SOHO' }}
      backHref="/creative/branding"
      backLabel="BRANDING"
    />
  )
}
