import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
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

export async function getSiteContent() {
  return readSiteContentFile()
}

export async function getCaseStudyContent(slug: string) {
  const content = await getSiteContent()
  const caseStudy = content.caseStudies.find((item) => item.slug === slug)

  if (!caseStudy) {
    throw new Error(`Case study not found: ${slug}`)
  }

  return caseStudy
}

export async function getCaseStudiesBySection(section: CaseStudyContent['section']) {
  const content = await getSiteContent()
  return content.caseStudies.filter((item) => item.section === section)
}

export async function saveSiteContent(content: SiteContent) {
  if (!isSiteContent(content)) {
    throw new Error('Refusing to save invalid site content')
  }

  await mkdir(path.dirname(contentPath), { recursive: true })
  await writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
}
