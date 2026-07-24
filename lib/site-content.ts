import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { notFound } from 'next/navigation'
import { type CaseStudyContent, isSiteContent, type SiteContent } from '@/lib/site-content-schema'
import { getCaseStudyPreviewImages, getCaseStudyWorkHoverImage, mergePreviewImages } from '@/lib/preview-images'

const contentPath = path.join(process.cwd(), 'content', 'site-content.json')

async function readSiteContentFile(): Promise<SiteContent> {
  const raw = await readFile(contentPath, 'utf8')
  const parsed: unknown = JSON.parse(raw)

  if (!isSiteContent(parsed)) {
    throw new Error('site-content.json has an invalid shape')
  }

  return parsed
}

function canSeeHiddenCaseStudies() {
  return process.env.NODE_ENV !== 'production'
}

function filterVisibleCaseStudies(caseStudies: CaseStudyContent[]) {
  if (canSeeHiddenCaseStudies()) return caseStudies
  return caseStudies.filter((item) => !item.hidden)
}

function getCaseStudySlugFromHref(href: string) {
  const match = href.match(/^\/(?:work|creative\/(?:mixed-media|branding))\/([^/]+)$/)
  return match?.[1] ?? null
}

function filterWorkProjectsByVisibleCaseStudies(content: SiteContent) {
  const hiddenSlugs = new Set(content.caseStudies.filter((item) => item.hidden).map((item) => item.slug))
  const caseStudyBySlug = new Map(content.caseStudies.map((item) => [item.slug, item]))
  const filterItems = (items: SiteContent['home']['selectedWork']['items']) =>
    items.filter((item) => {
      const slug = getCaseStudySlugFromHref(item.href)
      return canSeeHiddenCaseStudies() || !slug || !hiddenSlugs.has(slug)
    })
  const enrichItems = (items: SiteContent['home']['selectedWork']['items']) =>
    items.map((item) => {
      const slug = getCaseStudySlugFromHref(item.href)
      const caseStudy = slug ? caseStudyBySlug.get(slug) : null
      const workHoverImage = caseStudy ? getCaseStudyWorkHoverImage(caseStudy) : undefined
      const previewImages = item.hoverImage
        ? [item.hoverImage]
        : workHoverImage
          ? [workHoverImage]
        : caseStudy
          ? mergePreviewImages(item.cover, getCaseStudyPreviewImages(caseStudy))
          : mergePreviewImages(item.cover)

      return {
        ...item,
        hoverImage: item.hoverImage ?? workHoverImage,
        ...(previewImages.length ? { previewImages } : {}),
      }
    })

  return {
    ...content,
    home: {
      ...content.home,
      selectedWork: {
        ...content.home.selectedWork,
        items: enrichItems(filterItems(content.home.selectedWork.items)),
      },
      moreWork: {
        ...content.home.moreWork,
        items: enrichItems(filterItems(content.home.moreWork.items)),
      },
    },
    workPage: {
      ...content.workPage,
      projects: enrichItems(filterItems(content.workPage.projects)),
    },
  }
}

export async function getSiteContent() {
  return readSiteContentFile()
}

export async function getPublicSiteContent() {
  const content = await getSiteContent()
  return {
    ...filterWorkProjectsByVisibleCaseStudies(content),
    caseStudies: filterVisibleCaseStudies(content.caseStudies),
  }
}

export async function getCaseStudyContent(slug: string) {
  const content = await getPublicSiteContent()
  const caseStudy = content.caseStudies.find((item) => item.slug === slug)

  if (!caseStudy) {
    notFound()
  }

  const visibleSlugs = new Set(content.caseStudies.map((item) => item.slug))
  return {
    ...caseStudy,
    navStyle: content.design.caseStudyNav,
    listeningStyle: content.design.listeningCard,
    prev: caseStudy.prev && visibleSlugs.has(caseStudy.prev.slug) ? caseStudy.prev : null,
    next: caseStudy.next && visibleSlugs.has(caseStudy.next.slug) ? caseStudy.next : null,
  }
}

// The three Swipey sub-studies are `hidden` on purpose: they are modal content on
// /work/swipey, not standalone pages. The hub still has to read them, so this bypasses
// the visibility filter for exactly these slugs — nothing else. Missing slugs are
// dropped, so the hub keeps working while entries are still being written.
const SWIPEY_CASE_STUDY_SLUGS = ['swipey-fields', 'swipey-admin', 'side-by-side'] as const

export async function getSwipeyCaseStudies() {
  const content = await getSiteContent()
  return SWIPEY_CASE_STUDY_SLUGS
    .map((slug) => content.caseStudies.find((item) => item.slug === slug))
    .filter((item): item is CaseStudyContent => Boolean(item))
}

// The Swipey stories render inside the /work/swipey hub as modals, never as
// standalone pages — so they stay `hidden`, which correctly 404s them as routes.
// The hub still has to read them, hence this narrow bypass: it reads the raw
// file for these slugs only, leaving filterVisibleCaseStudies untouched for
// everything else.
export const SWIPEY_STORY_SLUGS = ['swipey-fields', 'swipey-admin', 'swipey-get-started'] as const

export async function getSwipeyStories() {
  const content = await readSiteContentFile()
  return SWIPEY_STORY_SLUGS.map((slug) => content.caseStudies.find((item) => item.slug === slug)).filter(
    (item): item is CaseStudyContent => Boolean(item),
  )
}

export async function getCaseStudiesBySection(section: CaseStudyContent['section']) {
  const content = await getPublicSiteContent()
  return content.caseStudies.filter((item) => item.section === section)
}

export async function getPhotographyGallery(slug: string) {
  const content = await getSiteContent()
  const gallery = content.photography.galleries.find((item) => item.slug === slug)

  if (!gallery) {
    throw new Error(`Photography gallery not found: ${slug}`)
  }

  return gallery
}

export async function saveSiteContent(content: SiteContent) {
  if (!isSiteContent(content)) {
    throw new Error('Refusing to save invalid site content')
  }

  await mkdir(path.dirname(contentPath), { recursive: true })
  await writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
}
