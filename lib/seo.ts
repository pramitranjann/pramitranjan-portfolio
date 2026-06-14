import type { Metadata } from 'next'
import type { CaseStudyContent, LinkItem, SitePageStatus } from '@/lib/site-content-schema'
import { getCaseStudyPreviewImages } from '@/lib/preview-images'

export const SITE_URL = 'https://www.pramitranjan.com'
export const SITE_NAME = 'Pramit Ranjan'
export const DEFAULT_OG_IMAGE = '/opengraph-image'
export const HOME_TITLE = 'Pramit Ranjan | UX Designer'
export const DEFAULT_DESCRIPTION =
  'Pramit Ranjan is a UX design student at SCAD building research-led digital products, interaction design case studies, and photography-driven creative work.'
export const PERSON_KEYWORDS = [
  'Pramit Ranjan',
  'Pramit Ranjan portfolio',
  'Pramit Ranjan SCAD',
  'Pramit Ranjan UX design',
  'UX student portfolio',
  'product design student',
  'SCAD UX design',
  'interaction design portfolio',
  'photography portfolio',
]

function unique<T>(values: T[]) {
  return Array.from(new Set(values))
}

function trimText(value: string, maxLength = 160) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}

export function composeTitle(title?: string) {
  if (!title) return HOME_TITLE
  return `${title} | ${SITE_NAME}`
}

export function toAbsoluteImageUrl(path?: string | null) {
  if (!path) return absoluteUrl(DEFAULT_OG_IMAGE)
  if (/^https?:\/\//i.test(path)) return path
  return absoluteUrl(path)
}

export function shouldIndexPage(status?: SitePageStatus) {
  return !status || status === 'live'
}

export function getCaseStudyRoute(caseStudy: Pick<CaseStudyContent, 'section' | 'slug'>) {
  switch (caseStudy.section) {
    case 'play':
      return `/play/${caseStudy.slug}`
    case 'branding':
      return `/creative/branding/${caseStudy.slug}`
    case 'mixed-media':
      return `/creative/mixed-media/${caseStudy.slug}`
    case 'work':
    default:
      return `/work/${caseStudy.slug}`
  }
}

export function getCaseStudyImage(caseStudy: Pick<CaseStudyContent, 'heroImage' | 'researchImage' | 'challengeImages' | 'solutionHeroImage' | 'solutionImages' | 'mediaBlocks'>) {
  return getCaseStudyPreviewImages(caseStudy)[0] ?? caseStudy.heroImage ?? DEFAULT_OG_IMAGE
}

export function getSameAsLinks(links: LinkItem[]) {
  return unique(
    links
      .map((link) => link.href.trim())
      .filter((href) => /^https?:\/\//i.test(href))
  )
}

export function getEmailFromLinks(links: LinkItem[]) {
  const emailHref = links.find((link) => link.href.startsWith('mailto:'))?.href
  return emailHref?.replace(/^mailto:/i, '') ?? undefined
}

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  imagePath = DEFAULT_OG_IMAGE,
  keywords = [],
  noIndex = false,
  openGraphType = 'website',
}: {
  title?: string
  description?: string
  path?: string
  imagePath?: string | null
  keywords?: string[]
  noIndex?: boolean
  openGraphType?: 'website' | 'article' | 'profile'
} = {}): Metadata {
  const fullTitle = composeTitle(title)
  const resolvedDescription = trimText(description)
  const imageUrl = toAbsoluteImageUrl(imagePath)

  return {
    title: fullTitle,
    description: resolvedDescription,
    keywords: unique([...PERSON_KEYWORDS, ...keywords]),
    alternates: {
      canonical: path,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: fullTitle,
      description: resolvedDescription,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      type: openGraphType,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: resolvedDescription,
      images: [imageUrl],
    },
  }
}

export function buildPersonJsonLd({
  description = DEFAULT_DESCRIPTION,
  sameAs = [],
  email,
}: {
  description?: string
  sameAs?: string[]
  email?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absoluteUrl('/#person'),
    name: SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: trimText(description),
    jobTitle: 'UX Designer',
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'Savannah College of Art and Design',
      sameAs: 'https://www.scad.edu/',
    },
    knowsAbout: [
      'UX design',
      'Product design',
      'Interaction design',
      'Design systems',
      'User research',
      'Photography',
    ],
    sameAs,
    ...(email ? { email } : {}),
  }
}

export function buildWebSiteJsonLd(description = DEFAULT_DESCRIPTION) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    url: SITE_URL,
    name: SITE_NAME,
    description: trimText(description),
    publisher: {
      '@id': absoluteUrl('/#person'),
    },
  }
}

export function buildProfilePageJsonLd({
  description,
  sameAs,
  email,
}: {
  description: string
  sameAs: string[]
  email?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': absoluteUrl('/about#profile'),
    url: absoluteUrl('/about'),
    name: `About ${SITE_NAME}`,
    description: trimText(description),
    mainEntity: {
      ...buildPersonJsonLd({ description, sameAs, email }),
    },
  }
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function buildCaseStudyMetadata(caseStudy: CaseStudyContent): Metadata {
  const route = getCaseStudyRoute(caseStudy)
  const sectionLabel =
    caseStudy.section === 'play'
      ? 'Interactive Project'
      : caseStudy.section === 'branding'
        ? 'Branding Project'
        : caseStudy.section === 'mixed-media'
          ? 'Mixed Media Project'
          : 'UX Case Study'

  return buildMetadata({
    title: `${caseStudy.title} ${sectionLabel}`,
    description: trimText(
      `${caseStudy.oneliner} ${caseStudy.type} case study by ${SITE_NAME}.`
    ),
    path: route,
    imagePath: getCaseStudyImage(caseStudy),
    keywords: [caseStudy.title, caseStudy.type, ...caseStudy.tags],
    openGraphType: 'article',
  })
}

export function buildCaseStudyJsonLd(caseStudy: CaseStudyContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': absoluteUrl(`${getCaseStudyRoute(caseStudy)}#creative-work`),
    name: caseStudy.title,
    headline: caseStudy.title,
    description: trimText(caseStudy.oneliner),
    url: absoluteUrl(getCaseStudyRoute(caseStudy)),
    image: toAbsoluteImageUrl(getCaseStudyImage(caseStudy)),
    author: {
      '@id': absoluteUrl('/#person'),
    },
    creator: {
      '@id': absoluteUrl('/#person'),
    },
    keywords: caseStudy.tags.join(', '),
    genre: caseStudy.section,
  }
}
