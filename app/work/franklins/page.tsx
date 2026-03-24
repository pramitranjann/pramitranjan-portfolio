import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function FranklinsPage() {
  return (
    <CaseStudyLayout
      title="Franklin's"
      oneliner="The experience starts before you walk in."
      type="UX DESIGN · 2025"
      tags={['UX Research', 'Contextual Inquiry', 'Information Architecture', 'Figma', 'Usability Testing', 'FigJam', 'Team Leadership']}
      prev={{ slug: 'loomlearn', title: 'LoomLearn' }}
      next={{ slug: 'helpoh', title: 'HelpOH' }}
      heroImage="/work/franklins/cover-processed.png"

      problemHeadline="The warmth was real — it just wasn't reaching people before they arrived."
      problem="Franklin's has a strong in-store experience. The brief: close the gap between what first-time visitors expected digitally and what they actually found when they walked in."

      roleHeadline="Team lead on a five-person UXDG 101 project — from fieldwork to final prototype."
      role="Led and contributed across every stage: structuring the research approach, directing fieldwork, synthesising findings, defining the IA, and driving the high-fidelity Figma prototype."

      researchHeadline="Most friction started before anyone walked through the door."
      research="Contextual inquiry at the café — barista and customer interviews, plus a SCAD student survey. The website was outdated, the service model unclear, and the in-store warmth had no digital equivalent."

      pullQuote="Their warmth was real. It just wasn't reaching people before they arrived."

      challengeHeadline="Users don't think in business categories — they think in tasks."
      challenge="Card sorting on FigJam revealed four natural buckets: Menu, Order, About, Contact. That structure became the backbone of the redesigned IA."

      processHeadline="Every design decision traces directly back to a research finding."
      process="The homepage was restructured to surface practical expectations earlier — seating, service style, hours. Navigation reduced to four items; the order flow redesigned as a clear sequence with explicit progress cues."
      usabilityTesting="We tested a full order — small cappuccino, skim milk, vanilla syrup — from discovery to checkout. Users completed it with no major breakdowns. The flow held; we made the call not to iterate."

      solutionHeadline="The redesign didn't change Franklin's identity — it made it clearer upfront."
      solution="Task-based navigation, a restructured homepage, a cleaner menu, and a step-by-step order flow from discovery to checkout."

      outcomesHeadline="The most important job of a team lead is keeping the work honest."
      outcomes="The experience gap wasn't a design problem — it was an information problem. If I were to continue, I'd explore in-context digital touchpoints at the storefront itself."
    />
  )
}
