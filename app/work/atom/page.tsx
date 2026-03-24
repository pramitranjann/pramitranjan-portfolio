import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function AtomPage() {
  return (
    <CaseStudyLayout
      title="Atom OS"
      oneliner="A phone OS that strips your screen down to what actually matters."
      type="UI/UX · 2024"
      tags={['UI/UX', 'Figma', 'Interaction Design', 'Systems Thinking']}
      prev={{ slug: 'helpoh', title: 'HelpOH' }}
      next={{ slug: 'albers', title: 'Albers' }}
      heroImage="/work/atom/cover-processed.png"
      researchImage="/work/atom/research-processed.png"
      challengeImages={['/work/atom/ideation-1-processed.png', '/work/atom/ideation-2-processed.png']}
      solutionHeroImage="/work/atom/solution-hero-processed.png"
      solutionImages={['/work/atom/hero-2-processed.png', '/work/atom/solution-2-processed.png']}

      problemHeadline="Subtraction is a design decision."
      problem="Atom OS redesigns the smartphone experience by removing distractions and replacing them with four intentional widgets. The goal: make the phone feel deliberately limited — not broken, just focused."

      roleHeadline="Sole designer across concept, UI design, and prototyping."
      role="Sole designer across concept, UI design, and prototyping."

      researchHeadline="The need came from exam season — existing solutions were too rigid or too blunt."
      research="The concept came from a personal need during exam season — existing solutions either deleted apps entirely or were too rigid to customise. I mapped two core user types: students managing academic pressure and professionals battling social media anxiety."

      pullQuote="The hardest part wasn't adding features — it was deciding what to withhold."

      challengeHeadline="What does a 'dumb phone' mode look like without sacrificing utility?"
      challenge="Early explorations focused on widget hierarchy and colour — settling on black and white to psychologically reduce the pull of the screen. The question was how to make deliberate limitation feel designed, not broken."

      processHeadline="Micro-interactions were kept minimal by design, not by oversight."
      process="The colour gradient in the screen time dashboard signals which apps help vs. harm, without being prescriptive. Focus mode was made user-configured, not automatic, to preserve autonomy."

      solutionHeadline="Four widgets. One focus. No noise."
      solution="A four-widget home screen with screen time visualisation, app usage breakdowns, and a toggleable Focus mode that blocks selected apps for user-defined periods."

      outcomesHeadline="The hardest part wasn't adding features — it was deciding what to withhold."
      outcomes="Atom OS taught me that subtraction is a design decision. I'd revisit the onboarding flow to help users understand the philosophy before they start using it."
    />
  )
}
