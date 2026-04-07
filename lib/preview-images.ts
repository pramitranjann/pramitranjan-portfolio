import type { CaseStudyContent } from '@/lib/site-content-schema'

function uniqueImages(images: Array<string | undefined | null>) {
  return Array.from(new Set(images.filter((image): image is string => Boolean(image))))
}

export function getCaseStudyPreviewImages(caseStudy: Pick<CaseStudyContent, 'heroImage' | 'researchImage' | 'challengeImages' | 'solutionHeroImage' | 'solutionImages' | 'mediaBlocks'>) {
  const blockImages = caseStudy.mediaBlocks?.flatMap((block) => block.images.map((image) => image.src)) ?? []

  return uniqueImages([
    caseStudy.heroImage,
    caseStudy.researchImage,
    ...(caseStudy.challengeImages ?? []),
    caseStudy.solutionHeroImage,
    ...(caseStudy.solutionImages ?? []),
    ...blockImages,
  ]).slice(0, 3)
}

export function mergePreviewImages(primary?: string, previewImages?: string[]) {
  return uniqueImages([primary, ...(previewImages ?? [])]).slice(0, 3)
}
