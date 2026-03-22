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
      overview="A large-scale mixed media installation exploring the South China Sea conflict through the lens of public naivety. Presented as a detective board, the piece draws on cyanotypes, photograms, coffee-aged maps, and original photography to connect geopolitics to lived experience."
      role="Sole artist — concept, research, photography, darkroom work, and installation."
      research="Starting from observations about the wars in Gaza and Ukraine, I was struck by how decisions made by a handful of leaders cause loss of life and disruption for millions. I narrowed focus to the South China Sea conflict — close to home, under-discussed, and deeply layered in economic, territorial, and military tension."
      ideation="Used a detective board as the structural metaphor — red threads connecting disparate images to mirror how the public tries (and often fails) to connect the dots. Developed four photoshoot series exploring China's history (plastics/red sun), espionage (darkroom/Bond-era analogue), surveillance (stalking narrative), and the conflict's root causes (oil droplets as islands)."
      keyDecisions="Cyanotypes introduced blue — connecting to the sea. Photograms stripped colour and context, making figures unidentifiable and open to interpretation. Coffee aging added material authenticity to archival maps. Everything was tactile and physical, pushing against the conflict's abstract, digital presence in news media."
      solution="A 7ft x 3ft detective board combining original photography, cyanotypes, photograms, coffee-aged map prints, and handwritten notes — all connected by red string."
      reflection="The detective board format was the right call — it let viewers discover connections rather than be told them. I'd invest more in the sound or ambient dimension of the installation if revisiting. The piece lived very much in the visual; there's a version of it that also hits the body."
      heroImage="/creative/mixed-media/south-china-sea/hero.png"
      researchImage="/creative/mixed-media/south-china-sea/research.png"
      ideationImages={['/creative/mixed-media/south-china-sea/ideation-1.png', '/creative/mixed-media/south-china-sea/ideation-2.png']}
      solutionHeroImage="/creative/mixed-media/south-china-sea/solution-hero.png"
      solutionImages={['/creative/mixed-media/south-china-sea/solution-1.png', '/creative/mixed-media/south-china-sea/solution-2.png']}
    />
  )
}
