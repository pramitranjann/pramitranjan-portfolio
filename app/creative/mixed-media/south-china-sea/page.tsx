import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function SouthChinaSeaPage() {
  return (
    <CaseStudyLayout
      title="South China Sea"
      oneliner="What ordinary people don't know is already shaping their lives."
      type="MIXED MEDIA · 2024"
      tags={['Mixed Media', 'Photography', 'Cyanotype', 'Installation', 'Research']}
      prev={{ slug: 'faces-of-power', title: 'Faces of Power' }}
      next={null}
      backHref="/creative/mixed-media"
      backLabel="MIXED MEDIA"
      heroImage="/creative/mixed-media/south-china-sea/hero-processed.png"
      researchImage="/creative/mixed-media/south-china-sea/research-processed.png"
      challengeImages={['/creative/mixed-media/south-china-sea/ideation-1-processed.png', '/creative/mixed-media/south-china-sea/ideation-2-processed.png']}
      solutionHeroImage="/creative/mixed-media/south-china-sea/solution-hero-processed.png"
      solutionImages={['/creative/mixed-media/south-china-sea/solution-1-processed.png', '/creative/mixed-media/south-china-sea/solution-2-processed.png']}

      problemHeadline="What ordinary people don't know is already shaping their lives."
      problem="A large-scale mixed media installation exploring the South China Sea conflict through the lens of public naivety. Presented as a detective board, it connects geopolitics to lived experience through cyanotypes, photograms, coffee-aged maps, and original photography."

      roleHeadline="Sole artist — concept, research, photography, darkroom work, and installation."
      role="Sole artist — concept, research, photography, darkroom work, and installation."

      researchHeadline="Close to home, under-discussed, and deeply layered in tension."
      research="Starting from observations about the wars in Gaza and Ukraine, I narrowed focus to the South China Sea conflict — close to home, under-discussed, and deeply layered in economic, territorial, and military tension."

      pullQuote="What ordinary people don't know is already shaping their lives."

      challengeHeadline="A detective board as structural metaphor — connecting the dots the public fails to."
      challenge="Used a detective board as the structural metaphor — red threads connecting images to mirror how the public tries (and often fails) to connect the dots. Developed four photoshoot series exploring China's history, espionage, surveillance, and the conflict's root causes."

      processHeadline="Physical and tactile — pushing against the conflict's abstract presence in news media."
      process="Cyanotypes introduced blue, connecting to the sea. Photograms stripped colour and context, making figures unidentifiable and open to interpretation. Coffee aging added material authenticity to archival maps."

      solutionHeadline="A 7ft × 3ft board that makes viewers discover connections rather than be told them."
      solution="A 7ft × 3ft detective board combining original photography, cyanotypes, photograms, coffee-aged map prints, and handwritten notes — all connected by red string."

      outcomesHeadline="The detective board was the right call. The piece lived very much in the visual."
      outcomes="The detective board format let viewers discover connections rather than be told them. I'd invest more in the sound or ambient dimension if revisiting — the piece lived very much in the visual; there's a version that also hits the body."
    />
  )
}
