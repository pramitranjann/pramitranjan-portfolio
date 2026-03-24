import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function FacesOfPowerPage() {
  return (
    <CaseStudyLayout
      title="Faces of Power"
      oneliner="What does power look like up close?"
      type="MIXED MEDIA · 2024"
      tags={['Mixed Media', 'Photography', 'Conceptual Art', 'Installation']}
      prev={null}
      next={{ slug: 'south-china-sea', title: 'South China Sea' }}
      backHref="/creative/mixed-media"
      backLabel="MIXED MEDIA"
      problem="A mixed media art project exploring how leaders make decisions that impact millions. Using close-up portraiture, interviews, and layered physical materials, the work interrogates themes of privacy, intimacy, and authority."
      role="Sole artist — concept, photography, material fabrication, and installation."
      research="This work extended the South China Sea conflict piece, shifting focus from geopolitics to the human actors behind it. I was interested in what it means to hold power — and what gets hidden behind a public face."
      challenge="I took close-up portraits and conducted interviews asking discomforting, personal questions — the kind powerful people are rarely asked publicly. I explored masks (literal and metaphorical) as a recurring motif, inspired by Brian Cattle."
      process="Chose to layer multiple identities into single images using acetate and a custom-built A4 lightbox, referencing the phrase 'together we are one.' Gelli printing added a propaganda aesthetic through paint transfer. Photograms stripped context entirely, leaving figures open to interpretation."
      solution="A multi-part installation combining Mod Roc masks, acetate lightbox prints, gelli prints, and photograms — each exploring a different facet of how power is constructed, projected, and concealed."
      outcomes="The most powerful moment was realising that removing colour and context (the photograms) made the images feel more universal — anyone could be in power. I'd push the interview component further in a future iteration, potentially making it part of the installation itself."
      heroImage="/creative/mixed-media/faces-of-power/hero-processed.png"
      researchImage="/creative/mixed-media/faces-of-power/research-processed.png"
      challengeImages={['/creative/mixed-media/faces-of-power/ideation-1-processed.png', '/creative/mixed-media/faces-of-power/ideation-2-processed.png']}
      solutionHeroImage="/creative/mixed-media/faces-of-power/solution-hero-processed.png"
      solutionImages={['/creative/mixed-media/faces-of-power/solution-1-processed.png', '/creative/mixed-media/faces-of-power/solution-2-processed.png']}
    />
  )
}
