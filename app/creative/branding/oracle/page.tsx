import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function OraclePage() {
  return (
    <CaseStudyLayout
      title="Oracle"
      oneliner="For trendsetters, by trend haters."
      type="BRANDING · 2023"
      tags={['Brand Identity', 'Graphic Design', 'Marketing', 'Art Direction']}
      prev={null}
      next={{ slug: 'soho', title: 'SOHO' }}
      backHref="/creative/branding"
      backLabel="BRANDING"

      problemHeadline="No brief, no client, no constraints — just a mythology and an aesthetic."
      problem="Oracle was my first self-directed creative project — no brief, no client, no constraints except my own taste. Inspired by the Matrix trilogy, it was an exercise in branding as world-building rather than identity design."

      roleHeadline="Sole creative director across concept, product design, and marketing."
      role="Sole creative director across concept, product design, and marketing."

      researchHeadline="The Matrix's visual language mapped onto current digital culture."
      research="Mapped the visual language of the Matrix — glitch aesthetics, green code, retro-digital imagery — onto current digital culture: nostalgia, memes, lo-fi visual irony. The target audience wasn't a demographic; it was an attitude."

      pullQuote="Art allows open interpretation. Branding has to close down meaning enough to be actionable."

      challengeHeadline="'For trendsetters by trend haters' — the slogan had to do double work."
      challenge="Oracle's premise: 'For trendsetters by trend haters.' The slogan had to position the brand as culturally aware while simultaneously rejecting cultural positioning — existing slightly outside the usual frame of reference."

      processHeadline="Retro-digital formats. Trending meme structures. No paid placement."
      process="Marketing leaned into retro-digital formats — 'Buy Oracle' on old TVs and vintage monitors. The campaign used trending meme formats and nostalgic visuals to create presence across platforms without paid placement."

      solutionHeadline="A complete brand world: six designs, a full identity, and a multi-format campaign."
      solution="A complete brand system: six t-shirt designs, logo and identity, and a multi-format campaign covering social graphics, vintage screen mockups, and a 'Coming Soon' teaser. All produced as Figma assets and mockups."

      outcomesHeadline="Meaningful branding requires purpose, not just aesthetics."
      outcomes="Oracle taught me the difference between art and branding. Meaningful branding requires purpose, not just aesthetics — if extended, it would need lore, a narrative world that rewards attention and gives people something to be part of, not just wear."
    />
  )
}
