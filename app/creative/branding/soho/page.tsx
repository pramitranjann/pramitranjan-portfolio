import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function SohoPage() {
  return (
    <CaseStudyLayout
      title="SOHO"
      oneliner="A sixth form art exhibition as diverse as the districts it's named after."
      type="BRANDING · 2024"
      tags={['Event Design', 'Brand Identity', 'Graphic Design', 'Leadership']}
      prev={{ slug: 'oracle', title: 'Oracle' }}
      next={null}
      backHref="/creative/branding"
      backLabel="BRANDING"
      problem="SOHO was the 2024 Sixth Form Art Exhibition, planned and organised by students for students. Named after the culturally dense SOHO districts of London and New York, the exhibition brought together art, fashion, music, and more — one discipline per student, one identity for all of it."
      role="Chair of the exhibition — responsible for organising, delegating, managing tasks, and leading all branding."
      research="Looked at what SOHO means as a cultural zone — an amalgamation of different creative voices under one name. That became the conceptual anchor: each artist is different, but the exhibition holds them together."
      challenge="Explored how to represent sensory diversity visually — art is seen, felt, heard, tasted, smelled. The brand identity used fragmented sensory imagery (eyes, mouths, ears) combined with gradient blobs to represent that plurality. Postcards were designed featuring each artist's work, sold for charity."
      process="Used a bold typographic lockup with the sensory collage to make the branding feel layered and alive, not institutional. The A3 poster, email banner, and postcard set were designed as a cohesive system, not separate assets."
      solution="Full exhibition identity including A3 poster, email banner, and a postcard series featuring each participating artist's work — all cohesive under the SOHO visual system."
      outcomes="Chairing the exhibition taught me that design leadership is as much about coordination as craft. Getting peers to hit deadlines and contribute materials was harder than the visual work. I'd build a clearer production timeline from day one in any future project like this."
      heroImage="/creative/branding/soho/cover-processed.png"
      researchImage="/creative/branding/soho/research-processed.png"
      solutionHeroImage="/creative/branding/soho/solution-hero-processed.png"
      solutionImages={['/creative/branding/soho/solution-1-processed.png', '/creative/branding/soho/solution-1-processed.png']}
    />
  )
}
