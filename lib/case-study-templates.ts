// lib/case-study-templates.ts
import type { CaseStudyMediaBlock } from './site-content-schema'

export interface CaseStudyTemplate {
  id: string
  label: string
  description: string
  // id is generated fresh on apply; images include aspectRatio/fit but src is always ""
  blocks: Omit<CaseStudyMediaBlock, 'id'>[]
}

// Shared image placeholder shape
function img(aspectRatio: string): CaseStudyMediaBlock['images'][number] {
  return { src: '', fit: 'contain', aspectRatio, background: '#0d0d0d', alt: '' }
}

// Shared inline block settings (60/40 text/image split)
const inlineSettings = {
  layout: 'single' as const,
  placement: 'side-right' as const,
  inlineTextWidth: '480px',
  inlineMediaMinWidth: '240px',
  align: 'center' as const,
  hidden: true as const,
}

export const CASE_STUDY_TEMPLATES: CaseStudyTemplate[] = [
  {
    id: 'standard-ux',
    label: 'Standard UX',
    description: 'Research-led work, desktop or responsive UI',
    blocks: [
      { section: 'research',  ...inlineSettings, images: [img('4 / 3')] },
      { section: 'challenge', ...inlineSettings, images: [img('4 / 3')] },
      { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
    ],
  },
  {
    id: 'mobile-app',
    label: 'Mobile / App',
    description: 'Phone-first UI with portrait screens',
    blocks: [
      { section: 'research',  ...inlineSettings, images: [img('3 / 4')] },
      { section: 'challenge', layout: 'pair', width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('3 / 4'), img('3 / 4')] },
      { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('3 / 4'), img('3 / 4')] },
    ],
  },
  {
    id: 'process-heavy',
    label: 'Process-Heavy',
    description: 'Adds a dedicated process block for iteration rounds',
    blocks: [
      { section: 'research',  ...inlineSettings, images: [img('4 / 3')] },
      { section: 'challenge', ...inlineSettings, images: [img('4 / 3')] },
      { section: 'process',   layout: 'pair', width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
      { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
    ],
  },
  {
    id: 'visual-brand',
    label: 'Visual / Brand',
    description: 'Branding and creative — full-width imagery throughout',
    blocks: [
      { section: 'challenge', layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
      { section: 'process',   layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'single', width: '100%', align: 'center', hidden: true, images: [img('16 / 10')] },
      { section: 'solution',  layout: 'pair',   width: '100%', gap: '2px', align: 'center', hidden: true, images: [img('4 / 3'), img('4 / 3')] },
    ],
  },
  {
    id: 'blank',
    label: 'Blank',
    description: 'No pre-configured blocks — build from scratch',
    blocks: [],
  },
]

export function applyTemplate(templateId: string): CaseStudyMediaBlock[] {
  const template = CASE_STUDY_TEMPLATES.find((t) => t.id === templateId)
  if (!template) return []
  return template.blocks.map((block) => ({
    ...block,
    id: `${block.section}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }))
}
