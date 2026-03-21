import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function AlbersPage() {
  return (
    <CaseStudyLayout
      title="Albers"
      oneliner="Colour theory you can actually play with."
      type="UI DESIGN · 2025"
      tags={['Interaction Design', 'UI', 'Figma']}
      prev={{ slug: 'atom', title: 'Atom OS' }}
      next={{ slug: 'accord', title: 'Accord' }}
    />
  )
}
