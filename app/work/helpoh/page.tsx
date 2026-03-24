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
      heroImage="/work/helpoh/cover-processed.png"
      solutionHeroImage="/work/helpoh/solution-hero-processed.png"
      solutionImages={['/work/helpoh/solution-1-processed.png', '/work/helpoh/solution-1-processed.png']}

      problemHeadline="A two-sided problem: unreliable help for users, unfair work for workers."
      problem="HelpOH connects users with vetted professionals for household services, while giving workers legal protections, training, and consistent income. Designed for Malaysia's rapidly growing economy."

      roleHeadline="Sole designer across research, UX strategy, UI design, and prototyping."
      role="Sole designer across research, UX strategy, UI design, and prototyping."

      researchHeadline="Two personas, one platform — designed to serve both sides equitably."
      research="A two-sided problem: users struggling to find reliable, affordable help, and workers facing inconsistent pay and limited legal protections. Mapped two personas — Farah (busy professional) and Arif (skilled tradesman) — to ensure the platform served both equitably."

      pullQuote="Two very different users, one platform — the design had to serve both without compromising either."

      challengeHeadline="Booking flows that prioritised transparency and speed."
      challenge="Explored booking flows that prioritised transparency and speed. Drew visual inspiration from Grab to leverage existing trust signals in the Southeast Asian market."

      processHeadline="Green and white to evoke trust. A single-surface booking flow to build first-time confidence."
      process="Green and white palette chosen to evoke trust and familiarity. The booking flow — service, location, date, time — was kept to a single surface to minimise friction and build confidence in first-time users."

      solutionHeadline="Search, book, done — with transparent pricing and no friction."
      solution="A desktop platform with streamlined search-and-book, transparent pricing, time selection, and service categorisation. Clarity over density."

      outcomesHeadline="The worker side deserved more screen time than I gave it."
      outcomes="HelpOH pushed me to design for two very different users simultaneously. In a next iteration, I'd build out a dedicated worker dashboard with job management and training access."
    />
  )
}
