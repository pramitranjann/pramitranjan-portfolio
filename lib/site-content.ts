import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { notFound } from 'next/navigation'
import { type CaseStudyContent, isSiteContent, type SiteContent } from '@/lib/site-content-schema'

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
  if (canSeeHiddenCaseStudies()) return content

  const hiddenSlugs = new Set(content.caseStudies.filter((item) => item.hidden).map((item) => item.slug))
  const filterItems = (items: SiteContent['home']['selectedWork']['items']) =>
    items.filter((item) => {
      const slug = getCaseStudySlugFromHref(item.href)
      return !slug || !hiddenSlugs.has(slug)
    })

  return {
    ...content,
    home: {
      ...content.home,
      selectedWork: {
        ...content.home.selectedWork,
        items: filterItems(content.home.selectedWork.items),
      },
      moreWork: {
        ...content.home.moreWork,
        items: filterItems(content.home.moreWork.items),
      },
    },
    workPage: {
      ...content.workPage,
      projects: filterItems(content.workPage.projects),
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

  return caseStudy
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
