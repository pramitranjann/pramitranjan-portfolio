import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function HelpOHPage() {
  return (
    <CaseStudyLayout
      title="HelpOH"
      oneliner="Connecting homes to trusted help, and workers to fair pay."
      type="UX DESIGN · 2025"
      tags={['Service Design', 'Research', 'Figma']}
      prev={{ slug: 'loomlearn', title: 'LoomLearn' }}
      next={{ slug: 'atom', title: 'Atom OS' }}
    />
  )
}
