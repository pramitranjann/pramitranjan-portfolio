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
      problem="LoomLearn integrates Cornell note-taking, Pomodoro timers, mind maps, spider charts, and flashcards into a single drag-and-drop platform. It emerged from a personal need — designed specifically with dyslexic learners in mind, but built for anyone who switches between too many tools to study effectively."
      role="Sole designer across research, UX, UI design, and prototyping."
      research="Identified that digital learners — especially those with dyslexia — struggle not with the tools themselves, but with context-switching between them. Mapped two personas: a first-year university student recently diagnosed with dyslexia (Emma), and a high school student preparing for IGCSEs (Aadi)."
      challenge="Explored modular, widget-based interfaces. The drag-and-drop system was directly inspired by Scratch coding — familiar, low-threshold, and highly customisable without added complexity."
      process="Chose a minimal colour palette to reduce cognitive load and keep focus on content. Multiple workspaces were included so users could separate subjects without losing their setup. Every technique was made available as a draggable icon, not a menu item."
      solution="A desktop learning platform where Cornell notes, mind maps, to-do lists, spider charts, flashcards, and Pomodoro timers coexist on a single canvas — rearrangeable and resizable per session."
      outcomes="Building for accessibility first made the product stronger for everyone — that was the clearest takeaway. I'd revisit the onboarding to better communicate how the widgets work together, rather than letting users figure it out alone."
      heroImage="/work/loomlearn/cover-processed.png"
      researchImage="/work/loomlearn/research-processed.png"
      challengeImages={['/work/loomlearn/ideation-1-processed.png', '/work/loomlearn/ideation-2-processed.png']}
      solutionHeroImage="/work/loomlearn/solution-hero-processed.png"
      solutionImages={['/work/loomlearn/solution-1-processed.png', '/work/loomlearn/solution-2-processed.png']}
    />
  )
}
