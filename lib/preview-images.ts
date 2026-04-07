import type { CaseStudyContent } from '@/lib/site-content-schema'

function uniqueImages(images: Array<string | undefined | null>) {
  return Array.from(new Set(images.filter((image): image is string => Boolean(image))))
}

export function getCaseStudyPreviewImages(caseStudy: Pick<CaseStudyContent, 'heroImage' | 'researchImage' | 'challengeImages' | 'solutionHeroImage' | 'solutionImages' | 'mediaBlocks'>) {
  const blockImages = caseStudy.mediaBlocks?.flatMap((block) => block.images.map((image) => image.src)) ?? []

  return uniqueImages([
    ...blockImages,
    caseStudy.researchImage,
    ...(caseStudy.challengeImages ?? []),
    caseStudy.solutionHeroImage,
    ...(caseStudy.solutionImages ?? []),
  ]).slice(0, 4)
}

export function getCaseStudyWorkHoverImage(
  caseStudy: Pick<CaseStudyContent, 'solutionHeroImage' | 'solutionImages' | 'mediaBlocks' | 'heroImage'>
) {
  const solutionBlockImage = caseStudy.mediaBlocks
    ?.find((block) => block.section === 'solution' && block.images.length > 0)
    ?.images[0]?.src

  return uniqueImages([
    solutionBlockImage,
    caseStudy.solutionHeroImage,
    caseStudy.solutionImages?.[0],
    caseStudy.heroImage,
  ])[0]
}

export function mergePreviewImages(primary?: string, previewImages?: string[]) {
  return uniqueImages([primary, ...(previewImages ?? [])]).slice(0, 4)
}

export function getPhotographyPreviewImages(cover?: string, galleryImages?: string[]) {
  return uniqueImages([cover, ...(galleryImages ?? [])]).slice(0, 4)
}
