import type { MetadataRoute } from 'next'
import { SITE_URL, getCaseStudyRoute } from '@/lib/seo'
import { getPublicSiteContent } from '@/lib/site-content'
import { getSitePage } from '@/lib/site-pages'

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getPublicSiteContent()
  const now = new Date()

  const workPage = getSitePage(content, 'work')
  const creativePage = getSitePage(content, 'creative')
  const playPage = getSitePage(content, 'play')
  const aboutPage = getSitePage(content, 'about')

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  if (aboutPage?.visible && aboutPage.status === 'live') {
    entries.push({
      url: absoluteUrl('/about'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    })
  }

  if (workPage?.visible && workPage.status === 'live') {
    entries.push({
      url: absoluteUrl('/work'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    })

    entries.push(
      ...content.caseStudies
        .filter((caseStudy) => caseStudy.section === 'work')
        .map((caseStudy) => ({
          url: absoluteUrl(getCaseStudyRoute(caseStudy)),
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }))
    )
  }

  if (creativePage?.visible && creativePage.status === 'live') {
    entries.push(
      {
        url: absoluteUrl('/creative'),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: absoluteUrl('/creative/photography'),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: absoluteUrl('/creative/mixed-media'),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: absoluteUrl('/creative/branding'),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      }
    )

    entries.push(
      ...content.photography.cities.map((city) => ({
        url: absoluteUrl(`/creative/photography/${city.slug}`),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    )

    entries.push(
      ...content.caseStudies
        .filter((caseStudy) => caseStudy.section === 'mixed-media' || caseStudy.section === 'branding')
        .map((caseStudy) => ({
          url: absoluteUrl(getCaseStudyRoute(caseStudy)),
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.75,
        }))
    )
  }

  if (playPage?.visible && playPage.status === 'live') {
    entries.push({
      url: absoluteUrl('/play'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })

    entries.push(
      ...content.caseStudies
        .filter((caseStudy) => caseStudy.section === 'play')
        .map((caseStudy) => ({
          url: absoluteUrl(getCaseStudyRoute(caseStudy)),
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
    )
  }

  entries.push({
    url: absoluteUrl('/scad-scholarship'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  })

  entries.push(
    {
      url: absoluteUrl('/lab'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/colophon'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    }
  )

  return entries
}
