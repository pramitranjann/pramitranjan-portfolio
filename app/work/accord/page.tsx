import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function AccordPage() {
  return (
    <CaseStudyLayout
      title="Accord"
      oneliner="A contract tool built for freelancers."
      type="UX DESIGN · 2025"
      tags={['UX Design', 'Product', 'Figma']}
      prev={{ slug: 'albers', title: 'Albers' }}
      next={{ slug: 'designathon-01', title: 'Design-athon 01' }}
    />
  )
}
