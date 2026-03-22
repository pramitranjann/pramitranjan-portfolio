import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function HelpOHPage() {
  return (
    <CaseStudyLayout
      title="HelpOH"
      oneliner="Connecting homes to trusted help, and workers to fair work."
      type="UX DESIGN · 2024"
      tags={['UI/UX', 'Figma', 'Service Design', 'Prototyping']}
      prev={{ slug: 'loomlearn', title: 'LoomLearn' }}
      next={{ slug: 'atom', title: 'Atom OS' }}
      overview="HelpOH is a service-to-doorstep platform designed for Malaysia's rapidly growing economy. It connects users with vetted professionals for household and personal services, while providing workers with legal protections, training, and consistent income."
      role="Sole designer across research, UX strategy, UI design, and prototyping."
      research="Identified a two-sided problem: users struggling to find reliable, affordable help, and workers facing inconsistent pay and limited legal protections. Mapped both personas — a busy professional (Farah) and a skilled tradesman (Arif) — to ensure the platform served both sides equitably."
      ideation="Explored booking flows that prioritised transparency and speed. Drew visual inspiration from Grab to leverage existing trust signals in the Southeast Asian market."
      keyDecisions="Green and white palette was chosen deliberately to evoke trust and familiarity. The booking flow — service, location, date, time — was kept to a single surface to minimise friction and build confidence in first-time users."
      solution="A desktop platform with a streamlined search-and-book interface, transparent pricing, time selection, and service categorisation. The design prioritises clarity over density."
      reflection="HelpOH pushed me to design for two very different users simultaneously. The worker-side of the platform deserved more screen time than I gave it — in a next iteration, I'd build out a dedicated worker dashboard with job management and training access."
    />
  )
}
