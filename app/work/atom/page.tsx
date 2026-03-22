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
      overview="Atom OS redesigns the smartphone experience by removing distractions and replacing them with four intentional widgets: Books, Meditation, Focus, and a To-Do List. The goal was to make the phone feel deliberately limited — not broken, just focused."
      role="Sole designer across concept, UI design, and prototyping."
      research="The concept came from a personal need during exam season — existing solutions either deleted apps entirely or were too rigid to customise. I identified two core user types: students managing academic pressure and young professionals battling social media anxiety."
      ideation="I explored what a 'dumb phone' mode could look like without sacrificing utility. Early explorations focused on widget hierarchy and colour — settling on black and white to psychologically reduce the pull of the screen."
      keyDecisions="Kept micro-interactions minimal by design. The colour gradient in the screen time dashboard was used to signal which apps help vs. harm, without being prescriptive. Focus mode was made user-configured, not automatic, to preserve autonomy."
      solution="A four-widget home screen with a settings panel featuring screen time visualisation, app usage breakdowns, and a toggleable Focus mode that blocks selected apps for user-defined time periods."
      reflection="Atom OS taught me that subtraction is a design decision. The hardest part wasn't adding features — it was deciding what to withhold. I'd revisit the onboarding flow to help users understand the philosophy before they start using it."
      heroImage="/work/atom/hero-1.png"
      researchImage="/work/atom/research.png"
      ideationImages={['/work/atom/ideation-1.png', '/work/atom/ideation-2.png']}
      solutionHeroImage="/work/atom/solution-hero.png"
      solutionImages={['/work/atom/hero-2.png', '/work/atom/solution-2.png']}
    />
  )
}
