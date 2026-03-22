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
      overview="Oracle was a self-directed clothing brand project — the first without a brief. Inspired by the Matrix trilogy, it explored what a brand looks like when aesthetics and mythology are inseparable."
      role="Sole creative director across concept, product design, and marketing."
      research="Studied the visual language of the Matrix and mapped it to digital culture — memes, nostalgia, glitch aesthetics. Identified an audience that rejects mainstream trend cycles but participates in underground visual culture."
      ideation="Explored dark, futuristic typography and layered graphic treatments. Designed multiple t-shirt concepts using distorted text, symbolic imagery, and bold negative space. Developed 'Buy Oracle' as a campaign device — deliberately blunt, almost ironic."
      keyDecisions="Marketing leaned into retro-digital formats: vintage TVs, old monitors, lo-fi social graphics. This kept Oracle feeling anti-trend even while actively selling. The slogan 'For trendsetters by trend haters' was central to every touchpoint."
      solution="A coherent brand identity including six t-shirt designs and a full campaign using meme culture and nostalgic visuals, presented across social formats and vintage screen mockups."
      reflection="Oracle taught me the difference between art and branding — branding needs purpose, not just aesthetics. That distinction now sits at the start of every design process. I'd push the world-building further if revisiting — Oracle deserved lore, not just a logo."
    />
  )
}
