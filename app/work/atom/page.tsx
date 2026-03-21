import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function AtomPage() {
  return (
    <CaseStudyLayout
      title="Atom OS"
      oneliner="A phone stripped down to what actually matters."
      type="UI DESIGN · 2025"
      tags={['UI Design', 'Systems', 'Figma']}
      prev={{ slug: 'helpoh', title: 'HelpOH' }}
      next={{ slug: 'albers', title: 'Albers' }}
    />
  )
}
