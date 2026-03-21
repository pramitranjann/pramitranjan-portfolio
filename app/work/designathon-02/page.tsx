import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function Designathon02Page() {
  return (
    <CaseStudyLayout
      title="Design-athon 02"
      oneliner="Redesigning Passio Go with Figma Make."
      type="UI DESIGN · 2025"
      tags={['UI Design', 'Sprint', 'Figma Make']}
      prev={{ slug: 'designathon-01', title: 'Design-athon 01' }}
      next={null}
    />
  )
}
