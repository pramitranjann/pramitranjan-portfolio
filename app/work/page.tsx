// app/work/page.tsx
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { ProjectCard } from '@/components/ProjectCard'

const projects = [
  { title: 'LoomLearn',       oneliner: 'One learning space for students who think differently.',       tags: ['UX', 'RESEARCH'],        href: '/work/loomlearn',      variant: 'main' as const },
  { title: 'HelpOH',          oneliner: 'Connecting homes to trusted help, and workers to fair pay.',   tags: ['UX', 'SERVICE DESIGN'],  href: '/work/helpoh',         variant: 'main' as const },
  { title: 'Atom OS',         oneliner: 'A phone stripped down to what actually matters.',               tags: ['UI', 'SYSTEMS'],         href: '/work/atom',           variant: 'main' as const },
  { title: 'Albers',          oneliner: 'Colour theory you can actually play with.',                     tags: ['UI', 'INTERACTION'],     href: '/work/albers',         variant: 'main' as const },
  { title: 'Accord',          oneliner: 'A contract tool built for freelancers.',                        tags: ['UX', 'PRODUCT'],         href: '/work/accord',         variant: 'supporting' as const },
  { title: 'Design-athon 01', oneliner: 'A 48-hour weather app designed with Claude AI.',               tags: ['UI', 'SPRINT'],          href: '/work/designathon-01', variant: 'supporting' as const },
  { title: 'Design-athon 02', oneliner: 'Redesigning Passio Go with Figma Make.',                       tags: ['UI', 'SPRINT'],          href: '/work/designathon-02', variant: 'supporting' as const },
]

export default function WorkPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>
        <section style={{ padding: '48px 24px' }}>
          {/* Page header */}
          <div
            className="flex items-center justify-between border-b border-divider"
            style={{ marginBottom: '24px', paddingBottom: '16px' }}
          >
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#666666' }}>
              ALL WORK
            </span>
            <span className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.16em', color: '#FF3120' }}>
              07
            </span>
          </div>

          {/* Top 4 — 2×2 grid */}
          <div className="grid grid-cols-2" style={{ gap: '2px', marginBottom: '2px' }}>
            {projects.slice(0, 4).map((p) => (
              <ProjectCard key={p.title} {...p} />
            ))}
          </div>

          {/* Bottom 3 — 3-col grid */}
          <div className="grid grid-cols-3" style={{ gap: '2px' }}>
            {projects.slice(4).map((p) => (
              <ProjectCard key={p.title} {...p} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
