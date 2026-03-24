import { CaseStudyLayout } from '@/components/CaseStudyLayout'

export default function LoomLearnPage() {
  return (
    <CaseStudyLayout
      title="LoomLearn"
      oneliner="One learning space for students who think differently."
      type="UX DESIGN · 2024"
      tags={['UI/UX', 'Figma', 'Accessibility', 'Interaction Design', 'Prototyping']}
      prev={{ slug: 'franklins', title: "Franklin's" }}
      next={{ slug: 'helpoh', title: 'HelpOH' }}
      heroImage="/work/loomlearn/cover-processed.png"
      researchImage="/work/loomlearn/research-processed.png"
      challengeImages={['/work/loomlearn/ideation-1-processed.png', '/work/loomlearn/ideation-2-processed.png']}
      solutionHeroImage="/work/loomlearn/solution-hero-processed.png"
      solutionImages={['/work/loomlearn/solution-1-processed.png', '/work/loomlearn/solution-2-processed.png']}

      problemHeadline="The problem wasn't the tools — it was the switching between them."
      problem="LoomLearn integrates Cornell notes, Pomodoro timers, mind maps, spider charts, and flashcards into a single drag-and-drop platform. Designed specifically with dyslexic learners in mind, built for anyone who switches between too many tools to study effectively."

      roleHeadline="Sole designer across research, UX, UI design, and prototyping."
      role="Sole designer across research, UX, UI design, and prototyping."

      researchHeadline="Dyslexic learners don't struggle with the tools. They struggle with context-switching."
      research="Digital learners — especially those with dyslexia — struggle with context-switching between tools, not the tools themselves. I mapped two personas: Emma, a first-year university student recently diagnosed with dyslexia, and Aadi, a high school student preparing for IGCSEs."

      pullQuote="Building for accessibility first made the product stronger for everyone."

      challengeHeadline="A drag-and-drop interface inspired by Scratch — familiar, low-threshold, customisable."
      challenge="Explored modular, widget-based interfaces. The drag-and-drop system was directly inspired by Scratch — familiar, low-threshold, and highly customisable without added complexity."

      processHeadline="A minimal palette to reduce cognitive load. Every technique a draggable icon, not a menu item."
      process="Minimal colour palette to reduce cognitive load and keep focus on content. Multiple workspaces let users separate subjects without losing their setup. Every technique was made available as a draggable icon, not a menu item."

      solutionHeadline="One canvas. Six tools. No switching."
      solution="A desktop learning platform where Cornell notes, mind maps, to-do lists, spider charts, flashcards, and Pomodoro timers coexist on one canvas — rearrangeable and resizable per session."

      outcomesHeadline="Building for accessibility first made the product stronger for everyone."
      outcomes="Building for accessibility first made the product stronger for everyone — that was the clearest takeaway. I'd revisit the onboarding to better communicate how the widgets work together, rather than letting users figure it out alone."
    />
  )
}
