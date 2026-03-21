import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function LoomLearnPage() {
  return (
    <CaseStudyLayout
      title="LoomLearn"
      oneliner="One learning space for students who think differently."
      type="UX DESIGN · 2025"
      tags={['User Research', 'Figma', 'Prototyping', 'Accessibility']}
      prev={null}
      next={{ slug: 'helpoh', title: 'HelpOH' }}
    />
  )
}
