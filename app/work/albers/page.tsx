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
      overview="ALBERS is a macOS color theory tool that started as a class assignment — an exploration of color harmonies and the interaction of colors — and grew into something larger over spring break. Named after Josef Albers, the app isolates perceptual color phenomena like simultaneous contrast, the Bezold effect, and optical mixing, and makes each one directly manipulable in real time. The premise came from a simple reinterpretation: as a UX design major, when the brief said 'interaction of colors,' I took the word interaction literally."
      role="Sole designer and developer — concept, UX and UI design in Figma, and implementation via vibe coding using Claude Code in terminal and Codex."
      research="The assignment asked us to explore color harmonies and how colors interact. Most responses went in a visual or editorial direction — mood boards, painted studies, illustrated systems. Being a UX major, I kept returning to the word 'interaction.' Albers's own argument is that color has no fixed identity; it shifts entirely based on context. That felt like a UI problem as much as an art one. The initial version was deliberately basic — proof of concept more than product."
      ideation="The assignment submission was lean: a working prototype that let users manipulate a color phenomenon directly rather than observe a static diagram. Spring break became the space to push it further — adding more modes, tightening the interaction model, and developing a real visual identity for the interface. The amber terminal HUD aesthetic emerged from a current design obsession: instrument interfaces that feel like they measure something, rather than creative tools that feel like they make something."
      keyDecisions="The biggest decision was the development process. Rather than writing SwiftUI from scratch traditionally, I used vibe coding — working with Claude Code in terminal and Codex to move fast between design intent and working code. This changed the design process significantly: Figma was used for visual direction and layout, but iteration happened directly in the app, with AI handling implementation while I focused on what the interaction should feel like. It made the gap between design and build much smaller than it would have been otherwise."
      solution="A nine-mode macOS application where each mode isolates one perceptual color phenomenon and gives the user real-time controls to manipulate it. The amber HUD aesthetic frames the app as an instrument of observation rather than a creative canvas. Built in SwiftUI with AppKit, targeting macOS 13+."
      reflection="ALBERS was the first project where the design process itself was the discovery. Vibe coding is genuinely a different way of working — faster in some places, disorienting in others. It pushed me to be more precise about design intent upfront, because the AI needs clarity to move in the right direction. The HUD aesthetic also taught me something: constraint as identity. When an interface commits fully to one visual language, every decision becomes easier. I'd like to eventually publish it — there's a version of ALBERS that lives on the Mac App Store as a genuine teaching tool."
    />
  )
}
