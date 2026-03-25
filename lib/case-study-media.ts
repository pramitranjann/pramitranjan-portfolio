import type {
  CaseStudyContent,
  CaseStudyMediaBlock,
  CaseStudyMediaBlockSection,
  CaseStudyMediaImage,
} from '@/lib/site-content-schema'

function createImage(src: string, patch?: Partial<CaseStudyMediaImage>): CaseStudyMediaImage {
  return {
    src,
    fit: patch?.fit,
    position: patch?.position,
    aspectRatio: patch?.aspectRatio,
    background: patch?.background,
    alt: patch?.alt,
  }
}

function createBlockId(slug: string, section: CaseStudyMediaBlockSection, index: number) {
  return `${slug}-${section}-${index + 1}`
}

export function deriveCaseStudyMediaBlocks(caseStudy: CaseStudyContent): CaseStudyMediaBlock[] {
  const explicitBlocks = caseStudy.mediaBlocks ?? []
  const visibleExplicitBlocks = process.env.NODE_ENV === 'production'
    ? explicitBlocks.filter((block) => !block.hidden)
    : explicitBlocks
  const sectionsWithExplicitBlocks = new Set(explicitBlocks.map((block) => block.section))
  const blocks: CaseStudyMediaBlock[] = [...visibleExplicitBlocks]
  const media = caseStudy.mediaSettings

  if (caseStudy.researchImage && !sectionsWithExplicitBlocks.has('research')) {
    blocks.push({
      id: createBlockId(caseStudy.slug, 'research', blocks.filter((item) => item.section === 'research').length),
      section: 'research',
      layout: 'single',
      align: 'center',
      width: '100%',
      images: [
        createImage(caseStudy.researchImage, {
          fit: media?.research?.fit,
          position: media?.research?.position,
          background: media?.research?.background,
          aspectRatio: '16 / 10',
        }),
      ],
    })
  }

  if (caseStudy.challengeImages?.length && !sectionsWithExplicitBlocks.has('challenge')) {
    blocks.push({
      id: createBlockId(caseStudy.slug, 'challenge', blocks.filter((item) => item.section === 'challenge').length),
      section: 'challenge',
      layout: 'pair',
      align: 'center',
      width: '100%',
      gap: media?.challengePair?.gap,
      images: [
        createImage(caseStudy.challengeImages[0] ?? '', {
          fit: media?.challengePair?.fit,
          position: media?.challengePair?.firstPosition,
          background: media?.challengePair?.background,
          aspectRatio: '4 / 3',
        }),
        createImage(caseStudy.challengeImages[1] ?? '', {
          fit: media?.challengePair?.fit,
          position: media?.challengePair?.secondPosition,
          background: media?.challengePair?.background,
          aspectRatio: '4 / 3',
        }),
      ].filter((item) => item.src),
    })
  }

  if (caseStudy.solutionHeroImage && !sectionsWithExplicitBlocks.has('solution')) {
    blocks.push({
      id: createBlockId(caseStudy.slug, 'solution', blocks.filter((item) => item.section === 'solution').length),
      section: 'solution',
      layout: 'single',
      align: 'center',
      width: '100%',
      images: [
        createImage(caseStudy.solutionHeroImage, {
          fit: media?.solutionHero?.fit,
          position: media?.solutionHero?.position,
          background: media?.solutionHero?.background,
          aspectRatio: '16 / 10',
        }),
      ],
    })
  }

  if (caseStudy.solutionImages?.length && !sectionsWithExplicitBlocks.has('solution')) {
    blocks.push({
      id: createBlockId(caseStudy.slug, 'solution', blocks.filter((item) => item.section === 'solution').length),
      section: 'solution',
      layout: 'pair',
      align: 'center',
      width: '100%',
      gap: media?.solutionPair?.gap,
      images: [
        createImage(caseStudy.solutionImages[0] ?? '', {
          fit: media?.solutionPair?.fit,
          position: media?.solutionPair?.firstPosition,
          background: media?.solutionPair?.background,
          aspectRatio: '4 / 3',
        }),
        createImage(caseStudy.solutionImages[1] ?? '', {
          fit: media?.solutionPair?.fit,
          position: media?.solutionPair?.secondPosition,
          background: media?.solutionPair?.background,
          aspectRatio: '4 / 3',
        }),
      ].filter((item) => item.src),
    })
  }

  return blocks
}
