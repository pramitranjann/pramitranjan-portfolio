export interface WorkProject {
  title: string
  oneliner: string
  tags: string[]
  href: string
  cover?: string
}

export interface HomeSection {
  heading: string
  body: string
  items: WorkProject[]
}

export interface HomeAboutContent {
  body: string
  spotifyLabel: string
}

export interface EntryItem {
  org: string
  role: string
  date: string
  desc: string
}

export interface NowCard {
  label: string
  value: string
  sub: string
}

export interface PhotographyCity {
  slug: string
  title: string
  desc: string
  cover: string
  imagePosition?: string
  comingSoon: boolean
}

export interface SiteContent {
  home: {
    selectedWork: HomeSection
    moreWork: HomeSection
    about: HomeAboutContent
  }
  aboutPage: {
    heroBody: string
    whoIAm: string
    experience: EntryItem[]
    professionalActivities: EntryItem[]
    tools: string[]
    nowCards: NowCard[]
  }
  workPage: {
    heroTitle: string
    heroBody: string
    projects: WorkProject[]
  }
  photography: {
    heroTitle: string
    cities: PhotographyCity[]
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isWorkProject(value: unknown): value is WorkProject {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.title) &&
    isString(item.oneliner) &&
    isStringArray(item.tags) &&
    isString(item.href) &&
    (item.cover === undefined || isString(item.cover))
  )
}

function isEntryItem(value: unknown): value is EntryItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.org) && isString(item.role) && isString(item.date) && isString(item.desc)
}

function isNowCard(value: unknown): value is NowCard {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.label) && isString(item.value) && isString(item.sub)
}

function isPhotographyCity(value: unknown): value is PhotographyCity {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.slug) &&
    isString(item.title) &&
    isString(item.desc) &&
    isString(item.cover) &&
    typeof item.comingSoon === 'boolean' &&
    (item.imagePosition === undefined || isString(item.imagePosition))
  )
}

function isHomeSection(value: unknown): value is HomeSection {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.heading) && isString(item.body) && Array.isArray(item.items) && item.items.every(isWorkProject)
}

export function isSiteContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== 'object') return false
  const content = value as Record<string, unknown>

  if (!content.home || typeof content.home !== 'object') return false
  if (!content.aboutPage || typeof content.aboutPage !== 'object') return false
  if (!content.workPage || typeof content.workPage !== 'object') return false
  if (!content.photography || typeof content.photography !== 'object') return false

  const home = content.home as Record<string, unknown>
  const aboutPage = content.aboutPage as Record<string, unknown>
  const workPage = content.workPage as Record<string, unknown>
  const photography = content.photography as Record<string, unknown>

  return (
    isHomeSection(home.selectedWork) &&
    isHomeSection(home.moreWork) &&
    !!home.about &&
    typeof home.about === 'object' &&
    isString((home.about as Record<string, unknown>).body) &&
    isString((home.about as Record<string, unknown>).spotifyLabel) &&
    isString(aboutPage.heroBody) &&
    isString(aboutPage.whoIAm) &&
    Array.isArray(aboutPage.experience) &&
    aboutPage.experience.every(isEntryItem) &&
    Array.isArray(aboutPage.professionalActivities) &&
    aboutPage.professionalActivities.every(isEntryItem) &&
    isStringArray(aboutPage.tools) &&
    Array.isArray(aboutPage.nowCards) &&
    aboutPage.nowCards.every(isNowCard) &&
    isString(workPage.heroTitle) &&
    isString(workPage.heroBody) &&
    Array.isArray(workPage.projects) &&
    workPage.projects.every(isWorkProject) &&
    isString(photography.heroTitle) &&
    Array.isArray(photography.cities) &&
    photography.cities.every(isPhotographyCity)
  )
}
