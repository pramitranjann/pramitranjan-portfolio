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
      problem="Oracle was my first entirely self-directed creative project — no brief, no client, no constraints except my own taste. Inspired by the Matrix trilogy, it was an exercise in asking: what does a brand look like when the mythology and the aesthetics are inseparable? I wanted to explore branding as world-building rather than identity design."
      role="Sole creative director across concept, product design, and marketing."
      research="I mapped the visual language of the Matrix — glitch aesthetics, green code, retro-digital imagery, the tension between control and freedom — onto the current digital culture moment: nostalgia, memes, lo-fi visual irony. The target audience wasn't a demographic; it was an attitude. People who participate in underground visual culture but reject mainstream trend cycles."
      challenge="Oracle's brand premise: 'For trendsetters by trend haters.' The slogan had to do double work — position the brand as culturally aware while simultaneously rejecting the idea of cultural positioning. Everything had to feel like it existed slightly outside the usual frame of reference. The Matrix gave that frame: a world where the apparent reality is a constructed system."
      process="Marketing leaned into retro-digital formats — 'Buy Oracle' presented on old TVs, vintage monitors, lo-fi social graphics. The campaign used trending meme formats and nostalgic visuals to create presence across platforms without paying for placement. Six t-shirt designs were built on distorted text, layered graphics, and symbolic imagery drawn from Matrix iconography."
      solution="A complete brand system: six t-shirt designs, a logo and brand identity, and a multi-format campaign covering social graphics, vintage screen mockups, and a 'Coming Soon' teaser. All produced as Figma assets and mockups."
      outcomes="Oracle taught me the difference between art and branding. Art allows open interpretation; branding has to close down meaning enough to be actionable. The lesson: meaningful branding requires purpose, not just aesthetics. If I were to extend Oracle, it would need lore — a narrative world that rewards attention and gives people something to be part of, not just wear."
    />
  )
}
