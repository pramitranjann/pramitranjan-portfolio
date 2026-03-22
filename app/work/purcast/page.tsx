import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function PurcastPage() {
  return (
    <CaseStudyLayout
      title="Purcast"
      oneliner="A podcast app designed for the Fluxathon."
      type="UI DESIGN · 2025"
      tags={['UI Design', 'Figma', 'Competition', 'Sprint']}
      prev={{ slug: 'helpoh', title: 'HelpOH' }}
      next={null}
    />
  )
}
