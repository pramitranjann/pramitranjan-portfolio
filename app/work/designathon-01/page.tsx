import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function Designathon01Page() {
  return (
    <CaseStudyLayout
      title="Design-athon 01"
      oneliner="A 48-hour weather app designed with Claude AI."
      type="UI DESIGN · 2025"
      tags={['UI Design', 'Sprint', 'Claude AI']}
      prev={{ slug: 'accord', title: 'Accord' }}
      next={{ slug: 'designathon-02', title: 'Design-athon 02' }}
    />
  )
}
