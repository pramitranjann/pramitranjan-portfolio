import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import { isSiteContent, type SiteContent } from '@/lib/site-content-schema'

const contentPath = path.join(process.cwd(), 'content', 'site-content.json')

async function readSiteContentFile(): Promise<SiteContent> {
  const raw = await readFile(contentPath, 'utf8')
  const parsed: unknown = JSON.parse(raw)

  if (!isSiteContent(parsed)) {
    throw new Error('site-content.json has an invalid shape')
  }

  return parsed
}

export const getSiteContent = cache(readSiteContentFile)

export async function saveSiteContent(content: SiteContent) {
  if (!isSiteContent(content)) {
    throw new Error('Refusing to save invalid site content')
  }

  await mkdir(path.dirname(contentPath), { recursive: true })
  await writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
}
