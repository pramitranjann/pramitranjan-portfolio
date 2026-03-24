import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function AlbersPage() {
  return (
    <CaseStudyLayout
      title="Albers"
      oneliner="What if 'interaction of color' was taken literally?"
      type="UI DESIGN · 2025"
      tags={['SwiftUI', 'AppKit', 'Figma', 'Claude Code', 'Vibe Coding', 'macOS']}
      prev={{ slug: 'atom', title: 'Atom OS' }}
      next={{ slug: 'accord', title: 'Accord' }}
      heroImage="/work/albers/cover-processed.png"
      researchImage="/work/albers/img-7-processed.png"
      challengeImages={['/work/albers/img-1-processed.png', '/work/albers/img-2-processed.png']}
      solutionHeroImage="/work/albers/img-6-processed.png"
      solutionImages={['/work/albers/img-4-processed.png', '/work/albers/img-5-processed.png']}

      problemHeadline="I took 'interaction of color' literally — and built an app around it."
      problem="ALBERS is a macOS color theory tool named after Josef Albers. It isolates perceptual phenomena like simultaneous contrast and optical mixing, giving users real-time controls to manipulate each one directly."

      roleHeadline="Sole designer and developer — concept to shipped macOS app."
      role="Sole designer and developer — concept, UI in Figma, and implementation via vibe coding with Claude Code."

      researchHeadline="The brief said 'interaction of colors.' As a UX major, that's a UI problem."
      research="The assignment asked us to explore color harmonies. Most went editorial; I kept returning to the word 'interaction.' Albers's argument — that color has no fixed identity — felt like a UI problem as much as an art one."

      pullQuote="When the brief said 'interaction of colors,' I took the word interaction literally."

      challengeHeadline="A proof of concept became a product with a real identity."
      challenge="The initial submission was lean: a working prototype. Spring break became the space to push it further — adding modes, tightening the interaction model, and developing a visual identity. The amber terminal HUD aesthetic emerged from an obsession with instrument interfaces — things that measure, not create."

      processHeadline="Vibe coding collapsed the gap between design intent and working code."
      process="Figma handled visual direction; iteration happened directly in the app using vibe coding. AI handled implementation while I focused on what the interaction should feel like — making the gap between design and build much smaller."

      solutionHeadline="Nine modes. One premise: color has no fixed identity."
      solution="A nine-mode macOS application where each mode isolates one perceptual color phenomenon with real-time controls. The amber HUD frames the app as an instrument of observation, not a creative canvas. Built in SwiftUI with AppKit, targeting macOS 13+."

      outcomesHeadline="Constraint as identity — when an interface commits fully, every decision becomes easier."
      outcomes="Vibe coding pushed me to be more precise about design intent upfront — the AI needs clarity to move in the right direction. The HUD aesthetic taught me that constraint as identity makes every decision easier. I'd like to eventually publish ALBERS as a genuine teaching tool on the Mac App Store."
    />
  )
}
